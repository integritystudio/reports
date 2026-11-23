// Stage 1 of 3 — INITIAL SEARCH (used-car listing collection)
//
// Fans out one agent per (source × body-style) cell, each fetching a live
// listings page (or running a web search then fetching) and extracting every
// in-band listing it can render. Generalized from the Austin run so it works
// for any metro / price band / source set.
//
// Invoke (Workflow tool):
//   Workflow({ scriptPath: ".../01-search-listings.js", args: {
//     metro: "Austin, TX",
//     priceMin: 10000, priceMax: 20000,
//     sources: ["CarGurus","Cars.com","Craigslist","KBB"],   // optional
//     bodyStyles: ["all","suv","truck"],                      // optional
//     tasks: [{ src:"CarGurus", body:"all", url:"https://..." }]  // optional explicit override
//   }})
//
// Returns { metro, priceMin, priceMax, listings:[...], sources:[...], stats }.
// Feed `listings` straight into stage 2 (02-rank-listings.js).

export const meta = {
  name: 'car-search-listings',
  description: 'Stage 1: fan-out collection of live used-car listings across sources and body styles for a metro/price band.',
  phases: [{ title: 'Collect', detail: 'One agent per source×body-style; extract every in-band listing' }],
}

// args may arrive as an object or as a JSON string, depending on how the
// Workflow is invoked — tolerate both.
const A = typeof args === 'string'
  ? (() => { try { return JSON.parse(args) } catch { return {} } })()
  : (args && typeof args === 'object') ? args : {}
const METRO = A.metro || 'Austin, TX'
const PRICE_MIN = Number.isFinite(A.priceMin) ? A.priceMin : 10000
const PRICE_MAX = Number.isFinite(A.priceMax) ? A.priceMax : 20000
const SOURCES = Array.isArray(A.sources) && A.sources.length ? A.sources : ['CarGurus', 'Cars.com', 'Craigslist', 'KBB', 'CarMax', 'Carvana']
const BODY_STYLES = Array.isArray(A.bodyStyles) && A.bodyStyles.length ? A.bodyStyles : ['all', 'suv', 'truck']

// Per-source access reality (probed 2026-07). CarMax and Carvana are national
// online retailers (inventory ships/delivers to Austin, not local dealers) and
// hard-403 to BOTH plain fetch and WebFetch, so a collector agent typically
// returns sourceQuality:'blocked' with no listings until a headless-browser or
// official-feed collector exists. They are listed as sources so the pipeline
// attempts them, but per the "verified as valid" rule any listing from them
// that lacks a resolvable detail URL MUST be dropped downstream (stage 3
// verification). Never include an unverifiable CarMax/Carvana listing.
const VERIFY_REQUIRED_SOURCES = new Set(['CarMax', 'Carvana'])

const LISTING_SCHEMA = {
  type: 'object', required: ['listings', 'sourceQuality'],
  properties: {
    sourceQuality: { enum: ['live-listings', 'partial', 'blocked', 'empty'] },
    note: { type: 'string' },
    listings: {
      type: 'array', maxItems: 25, items: {
        type: 'object', required: ['year', 'make', 'model', 'price', 'sellerType'],
        properties: {
          year: { type: 'integer' },
          make: { type: 'string' },
          model: { type: 'string' },
          trim: { type: 'string' },
          price: { type: 'integer' },
          miles: { type: 'integer' },
          sellerType: { enum: ['dealer', 'private'] },
          sellerName: { type: 'string' },
          dealRating: { type: 'string' },
          titleStatus: { type: 'string' },
          bodyStyle: { enum: ['sedan', 'hatchback', 'coupe', 'suv', 'truck', 'van', 'wagon', 'other'] },
          url: { type: 'string' },
          redFlags: { type: 'string' },
        },
      },
    },
  },
}

// Body-style label + example models to steer the search/extraction.
const BODY_HINT = {
  truck: ' (pickup trucks — F-150, Silverado, Sierra, RAM, Tacoma, Tundra, Ranger, Colorado, Frontier, etc.)',
  suv: ' (SUVs / crossovers)',
  sedan: ' (sedans)',
  all: '',
}

// Token-saving: listings already gathered by deterministic Node collectors
// (e.g. src/craigslist.mjs, run via Bash) are passed in as preCollected. Their
// sources are dropped from the agent task matrix so we don't pay LLM tokens to
// re-collect what code already fetched for free.
const PRE = (Array.isArray(A.preCollected) ? A.preCollected : [])
  .filter(v => v && typeof v.price === 'number' && v.price >= PRICE_MIN && v.price <= PRICE_MAX)
const coveredSources = new Set(PRE.map(v => String(v.src || v.source || '').toLowerCase()).filter(Boolean))

// Build the task matrix. Explicit `tasks` override the default source×body grid.
const ALL_TASKS = Array.isArray(A.tasks) && A.tasks.length
  ? A.tasks
  : SOURCES.flatMap(src => BODY_STYLES.map(body => ({
      src, body,
      query: `${src} used ${body === 'all' ? 'cars' : body} for sale ${METRO} $${PRICE_MIN.toLocaleString()} to $${PRICE_MAX.toLocaleString()} best deal clean title`,
    })))
// Skip agent tasks for any source already supplied via preCollected.
const TASKS = ALL_TASKS.filter(t => !coveredSources.has(String(t.src).toLowerCase()))
if (PRE.length) {
  log(`preCollected: ${PRE.length} listings from [${[...coveredSources].join(', ')}] — skipping ${ALL_TASKS.length - TASKS.length} agent task(s)`)
}

const FETCH_PROMPT = (t, i) => {
  const target = t.url
    ? `**Listings URL:** ${t.url}\nUse WebFetch on this URL first.`
    : `**Search query:** \`${t.query}\`\nUse WebSearch, then WebFetch the most relevant ${t.src} listings page for ${METRO}.`
  const nationalNote = VERIFY_REQUIRED_SOURCES.has(t.src)
    ? `\n**NOTE — ${t.src} is a national online retailer** (inventory delivers to ${METRO}, not a local dealer) and is often bot-blocked (HTTP 403). ` +
      `If you cannot retrieve real listings, set sourceQuality:"blocked" and return listings: []. ` +
      `Include a listing ONLY if you captured its exact detail URL verbatim (${t.src === 'CarMax' ? '/car/<stocknumber>' : '/vehicle/<id>'}) — ` +
      `these listings will be link-verified downstream and dropped if the URL does not resolve to the stated vehicle. Never guess a URL.\n`
    : ''
  return `## Used-Car Listing Extractor (task ${i + 1})\n\n` +
    `Goal: pull as MANY current used-car listings as you can from **${t.src}** in the **${METRO}** metro, priced ` +
    `**$${PRICE_MIN.toLocaleString()}–$${PRICE_MAX.toLocaleString()}**. Body-style focus: **${t.body}**${BODY_HINT[t.body] || ''}.\n` +
    `${nationalNote}\n` +
    `${target}\n\n` +
    `## Extract, per vehicle\n` +
    `year, make, model, trim, price (int USD), miles (int), sellerType (dealer|private), sellerName/dealer or location, ` +
    `dealRating (the platform's own market-relative badge verbatim if shown, e.g. "Great Deal"), titleStatus if shown, ` +
    `bodyStyle, url (the per-vehicle detail URL — copy it verbatim from the page, do NOT construct or guess it), and ` +
    `redFlags (salvage/rebuilt title, price far below comparables, luxury model priced like economy, mileage/price mismatch, ` +
    `same seller on many listings, no VIN, out-of-metro seller).\n\n` +
    `## Rules\n` +
    `- ONLY include listings priced between $${PRICE_MIN} and $${PRICE_MAX} inclusive.\n` +
    `- Include BOTH dealer and private listings if the page has them.\n` +
    `- Report exactly what the page shows — never invent vehicles, prices, ratings, or URLs. Omit fields not shown.\n` +
    `- Only include a url if it was literally present on the page; a guessed/reconstructed URL is worse than none.\n` +
    `- If the page is blocked/JS-only/empty, set sourceQuality accordingly and return listings: [] with a note.\n\n` +
    `Structured output only.`
}

phase('Collect')
const collected = await parallel(
  TASKS.map((t, i) => () =>
    agent(FETCH_PROMPT(t, i), {
      label: `collect:${String(t.src).toLowerCase().replace(/[^a-z]/g, '')}:${t.body}`,
      phase: 'Collect',
      schema: LISTING_SCHEMA,
    }).then(r => {
      if (!r) return null
      log(`${t.src}/${t.body}: ${r.listings.length} listings (${r.sourceQuality})`)
      return { src: t.src, body: t.body, ...r }
    }).catch(e => {
      log(`collect failed: ${t.src}/${t.body} — ${e.message || e}`)
      return null
    })
  )
)

const sources = collected.filter(Boolean)
const agentListings = sources.flatMap(s =>
  (s.listings || [])
    .filter(v => typeof v.price === 'number' && v.price >= PRICE_MIN && v.price <= PRICE_MAX)
    .map(v => ({ ...v, src: s.src }))
)
// Merge code-collected (preCollected) + agent-collected listings.
const merged = [...PRE, ...agentListings]

// ─── Deterministic pre-filter (token-saving) ───
// The sandbox can't import modules, so this mirrors src/classify.mjs — keep the
// two in sync. Body-class exclusion (mid/full-size trucks, vans) and the
// VIN-required-for-private rule run HERE in code, so the downstream LLM ranker
// receives a pre-screened pool and spends no tokens rejecting these.
// Disable by passing args.preFilter === false.
const EXCLUDE_CLASSES = new Set(Array.isArray(A.excludeClasses) ? A.excludeClasses : ['fullsize-truck', 'midsize-truck', 'van'])
const REQUIRE_VIN_PRIVATE = A.requireVinForPrivate !== false
const clsNorm = s => String(s == null ? '' : s).trim().toLowerCase()
const FULLSIZE = ['f-150', 'f150', 'f-250', 'f250', 'f-350', 'f350', 'super duty', 'silverado', 'sierra', 'ram 1500', 'ram 2500', 'ram 3500', '1500', '2500', '3500', 'tundra', 'titan', 'avalanche']
const MIDSIZE = ['colorado', 'canyon', 'ranger', 'tacoma', 'frontier', 'ridgeline', 'dakota', 'gladiator']
const COMPACT = ['maverick', 'santa cruz', 'santa-cruz']
const VANLIST = ['transit', 'express', 'promaster', 'sprinter', 'nv200', 'nv1500', 'nv2500', 'nv3500', 'savana', 'metris', 'sienna', 'odyssey', 'pacifica', 'carnival', 'sedona', 'quest', 'caravan', 'town & country', 'town and country']
const anyIn = (hay, arr) => arr.some(k => hay.includes(k))
const excludeClassOf = (make, model, hint) => {
  const m = clsNorm(model)
  if (anyIn(m, COMPACT)) return null                    // compact trucks kept
  if (anyIn(m, VANLIST)) return 'van'
  if (anyIn(m, MIDSIZE)) return 'midsize-truck'
  if (anyIn(m, FULLSIZE)) return 'fullsize-truck'
  if (clsNorm(hint) === 'van') return 'van'
  return null
}
const preRejected = []
const listings = A.preFilter === false ? merged : merged.filter(v => {
  const label = `${v.year || '?'} ${v.make || ''} ${v.model || ''} $${v.price}`.trim()
  const ec = excludeClassOf(v.make, v.model, v.bodyStyle)
  if (ec && EXCLUDE_CLASSES.has(ec)) { preRejected.push({ label, reason: `Excluded body class: ${ec}.` }); return false }
  if (REQUIRE_VIN_PRIVATE && clsNorm(v.sellerType) === 'private' && !v.vin) {
    preRejected.push({ label, reason: 'Private listing with no VIN — excluded by VIN requirement.' }); return false
  }
  // "Verified as valid" gate for CarMax/Carvana: without a resolvable detail URL
  // the listing can never pass stage-3 verification, so drop it now and tag the
  // rest so downstream knows verification is mandatory before inclusion.
  if (VERIFY_REQUIRED_SOURCES.has(v.src)) {
    if (!v.url) { preRejected.push({ label, reason: `${v.src} listing without a detail URL — cannot be verified, excluded.` }); return false }
    v.mustVerify = true
  }
  return true
})
log(`Collected ${merged.length} in-band (${PRE.length} code + ${agentListings.length} agent); pre-filtered to ${listings.length} (${preRejected.length} rejected in code)`)

return {
  metro: METRO,
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  listings,
  preRejected,
  excludeClasses: [...EXCLUDE_CLASSES],
  sources: [
    ...(PRE.length ? [{ src: [...coveredSources].join('+') || 'code', body: 'all', quality: 'code-collected', count: PRE.length }] : []),
    ...sources.map(s => ({ src: s.src, body: s.body, quality: s.sourceQuality, count: (s.listings || []).length, note: s.note })),
  ],
  stats: {
    agentTasks: TASKS.length,
    skippedTasks: ALL_TASKS.length - TASKS.length,
    codeListings: PRE.length,
    agentListings: agentListings.length,
    mergedInBand: merged.length,
    preRejected: preRejected.length,
    listingsToRank: listings.length,
  },
}
