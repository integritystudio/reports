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

if (LISTINGS.length === 0) {
  return { error: 'No listings provided. Pass stage-1 output (or { listings: [...] }) as args.', topBargains: [], rejected: [] }
}

const RANK_SCHEMA = {
  type: 'object', required: ['topBargains', 'rejected', 'summary', 'caveats'],
  properties: {
    summary: { type: 'string' },
    caveats: { type: 'string' },
    topBargains: {
      type: 'array', maxItems: TOP_N, items: {
        type: 'object',
        required: ['rank', 'year', 'make', 'model', 'price', 'sellerType', 'estMarketValue', 'estDiscountPct', 'confidence', 'rationale', 'source'],
        properties: {
          rank: { type: 'integer' },
          year: { type: 'integer' }, make: { type: 'string' }, model: { type: 'string' }, trim: { type: 'string' },
          price: { type: 'integer' }, miles: { type: 'integer' },
          sellerType: { enum: ['dealer', 'private'] }, sellerName: { type: 'string' }, bodyStyle: { type: 'string' },
          estMarketValue: { type: 'integer' }, estDiscountPct: { type: 'number' },
          confidence: { enum: ['high', 'medium', 'low'] },
          rationale: { type: 'string' }, source: { type: 'string' }, url: { type: 'string' },
        },
      },
    },
    rejected: {
      type: 'array', maxItems: 40, items: {
        type: 'object', required: ['label', 'reason'],
        properties: { label: { type: 'string' }, reason: { type: 'string' } },
      },
    },
  },
}

const listBlock = LISTINGS.map((v, i) =>
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
const report = await agent(
  `## Used-Car Bargain Screener & Ranker (${METRO})\n\n` +
  `You are given ${LISTINGS.length} used-car listings from the ${METRO} metro, each priced ` +
  `$${PRICE_MIN.toLocaleString()}–$${PRICE_MAX.toLocaleString()}, from both dealers and private sellers.\n\n` +
  `## Listings\n${listBlock}\n\n` +
  `## Your job\n` +
  `1. **Dedupe** obvious repeats (same year/make/model/price/miles across sources).\n` +
  `2. **Reject and list separately** any listing that is: a salvage/rebuilt/flood/branded title; a likely scam or ` +
  `curbstoner (luxury vehicle priced like an economy car, price far below comparable cars with no explanation, ` +
  `mileage/price mismatch, no VIN, same seller spamming listings); out of the $${PRICE_MIN}–$${PRICE_MAX} band; or ` +
  `an out-of-metro seller. Give a one-line reason for each rejection.\n` +
  `3. For every survivor, **estimate its fair local market value** (typical ${METRO} price for that ` +
  `year/make/model/trim/mileage, from your used-car knowledge) and compute ` +
  `**estDiscountPct = round((estMarketValue - price) / estMarketValue * 100)**. Treat any platform deal badge as ` +
  `corroborating evidence, not as the discount itself.\n` +
  `4. **Assign confidence**: high = price/mileage/market value well-established and discount real; medium = plausible but ` +
  `data thin; low = sparse data or estimate uncertain.\n` +
  `5. **Rank the top ${TOP_N}** by estimated discount, but DEMOTE anything whose discount is so large it's more likely a ` +
  `problem than a deal — a genuine bargain is meaningfully below market yet still explainable. Prefer a spread across body ` +
  `styles and both seller types where the data supports it.\n` +
  `6. Preserve each ranked vehicle's source and url fields verbatim from the input (do not alter or invent URLs).\n` +
  `7. Write a 3-5 sentence summary and a caveats paragraph (data recency, thin sources, that market values are model-level ` +
  `estimates not VIN-level appraisals, and that any purchase needs a VIN history report + inspection).\n\n` +
  `Do NOT invent listings that aren't in the input. If fewer than ${TOP_N} survive, return fewer.\n\n` +
  `Structured output only.`,
  { label: 'screen-and-rank', phase: 'Screen & Rank', schema: RANK_SCHEMA, effort: 'high' }
)

if (!report) {
  return { error: 'Ranking agent failed.', topBargains: [], rejected: [], rawListings: LISTINGS }
}

return {
  metro: METRO, priceMin: PRICE_MIN, priceMax: PRICE_MAX,
  ...report,
  stats: { inputListings: LISTINGS.length, ranked: report.topBargains.length, rejected: report.rejected.length },
}
