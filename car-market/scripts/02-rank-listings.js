// VALUATION & RANKING — runs AFTER validation
//
// Recommended chain: 01-search → 03-verify-dedupe (validation) → 02-rank.
// Takes the VALIDATED survivors, estimates market value with micro-batched LLM
// calls (groups of args.valueBatchSize, default 8, run in parallel; a static
// cache-friendly prompt prefix + the listing block last), screens out
// scam/curbstoner patterns, then computes discount, confidence, and ranks the
// top-N true bargains. Valuing only post-validation survivors keeps the LLM off
// dead/mismatched/duplicate listings.
//
// Invoke (Workflow tool):
//   Workflow({ scriptPath: ".../02-rank-listings.js", args: <stage-3 output> })
// Reads args.verified (stage-3 survivors, filtered to args.acceptStatuses —
// default ['live-match']). Also accepts a bare { listings } / { topBargains }
// (+ metro/priceMin/priceMax/topN) to run standalone without validation.
//
// Returns { topBargains:[...], rejected:[...], summary, caveats, stats }.

export const meta = {
  name: 'car-rank-listings',
  description: 'Stage 2: screen salvage/suspicious/out-of-scope listings, estimate discount-to-market, rank top-N bargains.',
  phases: [{ title: 'Screen & Rank', detail: 'Dedupe, reject bad listings, estimate discount, rank top-N' }],
}

// args may arrive as an object or as a JSON string, depending on how the
// Workflow is invoked — tolerate both.
const A = typeof args === 'string'
  ? (() => { try { return JSON.parse(args) } catch { return {} } })()
  : (args && typeof args === 'object') ? args : {}
const METRO = A.metro || 'Austin, TX'
const PRICE_MIN = Number.isFinite(A.priceMin) ? A.priceMin : 10000
const PRICE_MAX = Number.isFinite(A.priceMax) ? A.priceMax : 20000
const TOP_N = Number.isFinite(A.topN) ? A.topN : 20

// Input priority: stage-3 verified survivors → topBargains → raw listings.
// This stage now runs AFTER validation (03-verify-dedupe.js), so when handed
// that stage's `verified` array it values only listings that passed validation.
// acceptStatuses controls which verify statuses are kept (default: live-match only).
const ACCEPT_STATUSES = Array.isArray(A.acceptStatuses) ? A.acceptStatuses : ['live-match']
const LISTINGS = Array.isArray(A.verified)
  ? A.verified
      .filter(v => v && v.verify && ACCEPT_STATUSES.includes(v.verify.status))
      .map(({ verify, rank, rationale, estMarketValue, estDiscountPct, confidence, ...rest }) => rest)
  : Array.isArray(A.topBargains) ? A.topBargains
  : Array.isArray(A.listings) ? A.listings
  : []

// Body-class exclusions (default: mid-size + full-size pickups and all vans;
// compact unibody trucks like the Ford Maverick / Hyundai Santa Cruz are kept).
// The exclusion is applied upstream (stage-1 pre-filter + collectors); this stage
// only carries the list forward for reporting. Override with args.excludeClasses.
const DEFAULT_EXCLUDE = ['fullsize-truck', 'midsize-truck', 'van']
const EXCLUDE = Array.isArray(A.excludeClasses) ? A.excludeClasses : DEFAULT_EXCLUDE

if (LISTINGS.length === 0) {
  return { error: 'No listings provided. Pass stage-1 output (or { listings: [...] }) as args.', topBargains: [], rejected: [] }
}

// ─── Deterministic dedup BEFORE the LLM (mirrors src/rank-lib.mjs) ───
// Collapsing cross-source repeats in code shrinks the LLM's input and output.
const _norm = s => String(s == null ? '' : s).trim().toLowerCase()
const _tol = p => Math.max(500, Math.round((p || 0) * 0.04))
// VIN match is definitive. Model uses prefix comparison so "Sentra" and "Sentra SR"
// (2-token capture from browser-collect) are caught as duplicates; price/miles
// tolerances guard against false-positive prefix matches across different nameplates.
const _same = (a, b) => {
  if (a.vin && b.vin && _norm(a.vin) === _norm(b.vin)) return true
  if (a.year !== b.year || _norm(a.make) !== _norm(b.make)) return false
  const ma = _norm(a.model), mb = _norm(b.model)
  if (ma !== mb && !ma.startsWith(mb + ' ') && !mb.startsWith(ma + ' ')) return false
  if (Math.abs((a.price || 0) - (b.price || 0)) > _tol(a.price || b.price || 0)) return false
  if (a.miles && b.miles && Math.abs(a.miles - b.miles) > 2500) return false
  return true
}
const UNIQUE = []
const MERGED = []
for (const v of LISTINGS) {
  const dup = UNIQUE.find(u => _same(u, v))
  if (dup) { if (!dup.url && v.url) dup.url = v.url; if (!dup.vin && v.vin) dup.vin = v.vin; MERGED.push(`${v.year} ${v.make} ${v.model} $${v.price}`); continue }
  UNIQUE.push({ ...v })
}

// Micro-batched valuation: one LLM call per group of BATCH vehicles, groups run
// in parallel. Each call returns ONLY judgment fields (market value + scam flag)
// per listing; discount math, demotion, sorting, confidence, and rationales are
// computed deterministically below. Batching amortizes the fixed per-call
// overhead (subagent system prompt + instructions + schema) while keeping
// parallelism and fault-isolation between groups.
const BATCH = Number.isFinite(A.valueBatchSize) ? A.valueBatchSize : 8
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

// STATIC prefix — identical for every call, so it forms a cacheable prompt
// prefix. All variable data (the listing block) is appended AFTER this, last.
const VALUE_INSTRUCTIONS =
  `## Used-Car Valuation & Scam Screen (${METRO})\n\n` +
  `Each item below is one de-duplicated used-car listing from the ${METRO} metro, ` +
  `priced $${PRICE_MIN.toLocaleString()}–$${PRICE_MAX.toLocaleString()}. Body-class exclusions and VIN screening have ALREADY been applied upstream.\n\n` +
  `## For EACH listing return only:\n` +
  `- **idx**: the listing's [index].\n` +
  `- **estMarketValue**: the fair local ${METRO} retail price for that year/make/model/trim/mileage, from your used-car knowledge (integer USD). Treat any platform deal badge as corroborating only.\n` +
  `- **isScam** (+ **scamReason**): true if the listing is a likely scam/curbstoner or branded-title risk — luxury vehicle priced like an economy car, price far below comparable cars with no explanation, mileage/price mismatch, or an out-of-metro seller. Otherwise false.\n\n` +
  `Do NOT rank, compute discounts, or write prose — that is done downstream in code. Structured output only.\n\n` +
  `## Listings\n`

const fmtListing = (v, gi) =>
  `[${gi}] ${v.year} ${v.make} ${v.model}${v.trim ? ' ' + v.trim : ''}` +
  ` | $${v.price}${v.miles ? ' | ' + v.miles + ' mi' : ''}` +
  ` | ${v.sellerType || '?'}${v.sellerName ? ' (' + v.sellerName + ')' : ''}` +
  ` | body:${v.bodyStyle || '?'} | src:${v.src || v.source || '?'}` +
  (v.dealRating ? ' | rating:' + v.dealRating : '') +
  (v.titleStatus ? ' | title:' + v.titleStatus : '') +
  (v.vin ? ' | VIN:' + v.vin : '')

// Split into contiguous groups of BATCH; global idx = groupStart + offset.
const chunks = []
for (let i = 0; i < UNIQUE.length; i += BATCH) chunks.push(i)

phase('Screen & Rank')
// LLM does only what needs world knowledge: estimate market value + flag scams.
const chunkResults = await parallel(
  chunks.map((start, ci) => () => {
    const group = UNIQUE.slice(start, start + BATCH)
    const listBlock = group.map((v, j) => fmtListing(v, start + j)).join('\n')
    return agent(VALUE_INSTRUCTIONS + listBlock, {
      label: `value:batch-${ci + 1}`, phase: 'Screen & Rank', schema: VALUE_SCHEMA, effort: 'high',
    })
      .then(res => (res && Array.isArray(res.valuations)) ? res.valuations : [])
      .catch(() => [])
  })
)
const valuations = chunkResults.flat()

// ─── Deterministic ranking (mirrors src/rank-lib.mjs) ───
const NOW_YEAR = A.nowYear || 2026
const DEMOTE = A.demoteThreshold || 20
const byIdx = new Map(valuations.map(x => [x.idx, x]))
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
