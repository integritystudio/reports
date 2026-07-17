// Stage 2 of 3 — RANKING RESULTS
//
// Takes the listings produced by stage 1, screens out salvage/rebuilt titles,
// scam/curbstoner patterns, out-of-metro units and mileage/year mismatches,
// estimates each survivor's discount to local market value, and ranks the
// top-N true bargains. One high-reasoning pass over the pooled inventory.
//
// Invoke (Workflow tool):
//   Workflow({ scriptPath: ".../02-rank-listings.js", args: <stage-1 output> })
// i.e. pass the object stage 1 returned (it carries listings/metro/priceMin/
// priceMax). You may also pass { listings, metro, priceMin, priceMax, topN }.
//
// Returns { topBargains:[...], rejected:[...], summary, caveats, stats }.
// Feed `topBargains` into stage 3 (03-verify-dedupe.js) to check the links.

export const meta = {
  name: 'car-rank-listings',
  description: 'Stage 2: screen salvage/suspicious/out-of-scope listings, estimate discount-to-market, rank top-N bargains.',
  phases: [{ title: 'Screen & Rank', detail: 'Dedupe, reject bad listings, estimate discount, rank top-N' }],
}

const A = (typeof args === 'object' && args) ? args : {}
const METRO = A.metro || 'Austin, TX'
const PRICE_MIN = Number.isFinite(A.priceMin) ? A.priceMin : 10000
const PRICE_MAX = Number.isFinite(A.priceMax) ? A.priceMax : 20000
const TOP_N = Number.isFinite(A.topN) ? A.topN : 20
const LISTINGS = Array.isArray(A.listings) ? A.listings : []

// Body-class exclusions (default: mid-size + full-size pickups and all vans;
// compact unibody trucks like the Ford Maverick / Hyundai Santa Cruz are kept).
// Override with args.excludeClasses (any of: 'fullsize-truck','midsize-truck','van').
const DEFAULT_EXCLUDE = ['fullsize-truck', 'midsize-truck', 'van']
const EXCLUDE = Array.isArray(A.excludeClasses) ? A.excludeClasses : DEFAULT_EXCLUDE
const EXCLUDE_RULES = {
  'fullsize-truck': 'full-size / heavy-duty pickups (Ford F-150 and F-250/F-350+, Chevrolet Silverado 1500 and 2500/3500+, GMC Sierra 1500+, RAM 1500 and 2500/3500+, Toyota Tundra, Nissan Titan)',
  'midsize-truck': 'mid-size pickups (Chevrolet Colorado, GMC Canyon, Ford Ranger, Toyota Tacoma, Nissan Frontier, Honda Ridgeline)',
  'van': 'cargo and passenger vans (Ford Transit, Chevrolet Express, RAM ProMaster, Mercedes Sprinter, minivans, etc.)',
}
const excludeText = EXCLUDE.filter(k => EXCLUDE_RULES[k]).map(k => '- ' + EXCLUDE_RULES[k]).join('\n')

if (LISTINGS.length === 0) {
  return { error: 'No listings provided. Pass stage-1 output (or { listings: [...] }) as args.', topBargains: [], rejected: [] }
}

// ─── Deterministic dedup BEFORE the LLM (mirrors src/rank-lib.mjs) ───
// Collapsing cross-source repeats in code shrinks the LLM's input and output.
const _norm = s => String(s == null ? '' : s).trim().toLowerCase()
const _tol = p => Math.max(500, Math.round((p || 0) * 0.04))
const _same = (a, b) =>
  a.year === b.year && _norm(a.make) === _norm(b.make) && _norm(a.model) === _norm(b.model) &&
  Math.abs((a.price || 0) - (b.price || 0)) <= _tol(a.price || b.price || 0) &&
  !(a.miles && b.miles && Math.abs(a.miles - b.miles) > 2500)
const UNIQUE = []
const MERGED = []
for (const v of LISTINGS) {
  const dup = UNIQUE.find(u => _same(u, v))
  if (dup) { if (!dup.url && v.url) dup.url = v.url; if (!dup.vin && v.vin) dup.vin = v.vin; MERGED.push(`${v.year} ${v.make} ${v.model} $${v.price}`); continue }
  UNIQUE.push({ ...v })
}

// The LLM now returns ONLY judgment fields (market value + scam flag) per unique
// listing — a compact output. Discount math, demotion, sorting, confidence, and
// rationales are all computed deterministically below.
const VALUE_SCHEMA = {
  type: 'object', required: ['valuations'],
  properties: {
    valuations: {
      type: 'array', items: {
        type: 'object', required: ['idx', 'estMarketValue'],
        properties: {
          idx: { type: 'integer' },
          estMarketValue: { type: 'integer' },
          isScam: { type: 'boolean' },
          scamReason: { type: 'string' },
        },
      },
    },
  },
}

const listBlock = UNIQUE.map((v, i) =>
  `[${i}] ${v.year} ${v.make} ${v.model}${v.trim ? ' ' + v.trim : ''}` +
  ` | $${v.price}${v.miles ? ' | ' + v.miles + ' mi' : ''}` +
  ` | ${v.sellerType}${v.sellerName ? ' (' + v.sellerName + ')' : ''}` +
  ` | body:${v.bodyStyle || '?'} | src:${v.src || v.source || '?'}` +
  (v.dealRating ? ' | rating:' + v.dealRating : '') +
  (v.titleStatus ? ' | title:' + v.titleStatus : '') +
  (v.redFlags ? ' | flags:' + v.redFlags : '') +
  (v.url ? ' | ' + v.url : '')
).join('\n')

phase('Screen & Rank')
// LLM does only what needs world knowledge: estimate market value + flag scams.
const valued = await agent(
  `## Used-Car Valuation & Scam Screen (${METRO})\n\n` +
  `You are given ${UNIQUE.length} de-duplicated used-car listings from the ${METRO} metro, each priced ` +
  `$${PRICE_MIN.toLocaleString()}–$${PRICE_MAX.toLocaleString()}. Body-class exclusions and VIN screening have ALREADY been applied upstream.\n\n` +
  `## Listings\n${listBlock}\n\n` +
  `## Your job — for EACH listing, return only:\n` +
  `- **idx**: the listing's [index].\n` +
  `- **estMarketValue**: the fair local ${METRO} retail price for that year/make/model/trim/mileage, from your used-car knowledge (integer USD). Treat any platform deal badge as corroborating only.\n` +
  `- **isScam** (+ **scamReason**): true if the listing is a likely scam/curbstoner or branded-title risk — luxury vehicle priced like an economy car, price far below comparable cars with no explanation, mileage/price mismatch, or an out-of-metro seller. Otherwise false.\n\n` +
  `Do NOT rank, sort, compute discounts, or write prose — that is done downstream in code. Value every listing (omit an idx only if it is a genuine scam you already marked isScam). Structured output only.`,
  { label: 'valuate-screen', phase: 'Screen & Rank', schema: VALUE_SCHEMA, effort: 'high' }
)

if (!valued) {
  return { error: 'Valuation agent failed.', topBargains: [], rejected: [], rawListings: LISTINGS }
}

// ─── Deterministic ranking (mirrors src/rank-lib.mjs) ───
const NOW_YEAR = A.nowYear || 2026
const DEMOTE = A.demoteThreshold || 20
const byIdx = new Map(valued.valuations.map(x => [x.idx, x]))
const rejected = []
const scored = []
UNIQUE.forEach((v, i) => {
  const val = byIdx.get(i)
  const label = `${v.year} ${v.make} ${v.model} $${v.price}`
  if (!val || val.estMarketValue == null) { rejected.push({ label, reason: 'No market value estimate.' }); return }
  if (val.isScam) { rejected.push({ label, reason: val.scamReason || 'Flagged as likely scam.' }); return }
  const disc = Math.round(((val.estMarketValue - v.price) / val.estMarketValue) * 100)
  const age = v.year ? NOW_YEAR - v.year : null
  const milesOk = v.miles == null || age == null || (v.miles >= 0 && v.miles <= Math.max(30000, age * 22000 + 20000))
  let confidence
  if (disc >= DEMOTE) confidence = 'low'
  else if (_norm(v.sellerType) === 'dealer' && v.miles != null && milesOk) confidence = 'high'
  else if (!milesOk || v.miles == null) confidence = 'low'
  else confidence = 'medium'
  scored.push({ ...v, estMarketValue: val.estMarketValue, estDiscountPct: disc, confidence, _demoted: disc >= DEMOTE })
})

const confRank = { high: 0, medium: 1, low: 2 }
scored.sort((a, b) => (a._demoted - b._demoted) || (b.estDiscountPct - a.estDiscountPct) || (confRank[a.confidence] - confRank[b.confidence]))

const START = A.startRank || 1
const topBargains = scored.slice(0, TOP_N).map((v, i) => {
  const parts = [`~${v.estDiscountPct}% below estimated ${METRO} market ($${v.estMarketValue.toLocaleString()})`]
  parts.push(_norm(v.sellerType) === 'dealer' ? 'dealer listing' : 'private listing')
  if (v.dealRating) parts.push(`badge "${v.dealRating}"`)
  if (v.miles != null) parts.push(`${v.miles.toLocaleString()} mi`)
  if (_norm(v.sellerType) === 'private') parts.push(v.vin ? `VIN provided (${v.vin})` : 'no VIN — verify')
  if (v._demoted) parts.push('discount large enough to warrant scrutiny')
  const { _demoted, ...rest } = v
  return {
    rank: START + i,
    year: v.year, make: v.make, model: v.model, trim: v.trim, price: v.price, miles: v.miles,
    sellerType: v.sellerType, sellerName: v.sellerName, bodyStyle: v.bodyStyle,
    estMarketValue: v.estMarketValue, estDiscountPct: v.estDiscountPct, confidence: v.confidence,
    rationale: parts.join('; ') + '.', source: v.src || v.source, url: v.url,
  }
})

log(`Ranked ${topBargains.length}/${scored.length} scored; ${MERGED.length} deduped, ${rejected.length} rejected`)

return {
  metro: METRO, priceMin: PRICE_MIN, priceMax: PRICE_MAX,
  excludedClasses: EXCLUDE,
  topBargains,
  rejected,
  mergedAway: MERGED,
  summary: `${topBargains.length} bargains ranked in ${METRO} ($${PRICE_MIN.toLocaleString()}–$${PRICE_MAX.toLocaleString()}), by estimated discount to local market. ` +
    `${MERGED.length} cross-source duplicates were collapsed and ${rejected.length} listings rejected (scam/no-value). ` +
    `Discounts at or above ${DEMOTE}% are demoted as more likely to signal a problem than a deal.`,
  caveats: `Market values are model/trim/mileage-level estimates for ${METRO}, not VIN-level appraisals. Discount %, ranking, confidence, and rationales are computed deterministically; only market value and scam flags come from the model. Any purchase needs a VIN history report and an independent inspection.`,
  stats: { inputListings: LISTINGS.length, unique: UNIQUE.length, mergedAway: MERGED.length, scored: scored.length, ranked: topBargains.length, rejected: rejected.length, excludedClasses: EXCLUDE.length },
}
