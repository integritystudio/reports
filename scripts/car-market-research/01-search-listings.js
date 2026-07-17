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

const A = (typeof args === 'object' && args) ? args : {}
const METRO = A.metro || 'Austin, TX'
const PRICE_MIN = Number.isFinite(A.priceMin) ? A.priceMin : 10000
const PRICE_MAX = Number.isFinite(A.priceMax) ? A.priceMax : 20000
const SOURCES = Array.isArray(A.sources) && A.sources.length ? A.sources : ['CarGurus', 'Cars.com', 'Craigslist', 'KBB']
const BODY_STYLES = Array.isArray(A.bodyStyles) && A.bodyStyles.length ? A.bodyStyles : ['all', 'suv', 'truck']

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
  return `## Used-Car Listing Extractor (task ${i + 1})\n\n` +
    `Goal: pull as MANY current used-car listings as you can from **${t.src}** in the **${METRO}** metro, priced ` +
    `**$${PRICE_MIN.toLocaleString()}–$${PRICE_MAX.toLocaleString()}**. Body-style focus: **${t.body}**${BODY_HINT[t.body] || ''}.\n\n` +
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
const listings = [...PRE, ...agentListings]
log(`Collected ${listings.length} in-band listings (${PRE.length} code + ${agentListings.length} agent) across ${sources.length} agent task(s)`)

return {
  metro: METRO,
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  listings,
  sources: [
    ...(PRE.length ? [{ src: [...coveredSources].join('+') || 'code', body: 'all', quality: 'code-collected', count: PRE.length }] : []),
    ...sources.map(s => ({ src: s.src, body: s.body, quality: s.sourceQuality, count: (s.listings || []).length, note: s.note })),
  ],
  stats: {
    agentTasks: TASKS.length,
    skippedTasks: ALL_TASKS.length - TASKS.length,
    codeListings: PRE.length,
    agentListings: agentListings.length,
    inBandListings: listings.length,
  },
}
