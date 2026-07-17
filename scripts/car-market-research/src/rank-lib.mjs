// Deterministic ranking logic — pure code, no network, no LLM. Everything the
// ranker used to do that is NOT genuine judgment lives here: dedup, discount
// arithmetic, the "demote implausible discount" rule, sorting, rule-based
// confidence, and templated rationales. The LLM is then only responsible for
// what needs world knowledge: estimating market value and flagging scams.
//
// Used by src/rank.mjs (CLI) and mirrored inline in 02-rank-listings.js
// (the Workflow sandbox can't import). Keep the two in sync.

const norm = s => String(s == null ? '' : s).trim().toLowerCase()

// ─── Dedup ───
const priceTol = p => Math.max(500, Math.round((p || 0) * 0.04))
export function sameVehicle(a, b) {
  if (a.year !== b.year || norm(a.make) !== norm(b.make) || norm(a.model) !== norm(b.model)) return false
  if (Math.abs((a.price || 0) - (b.price || 0)) > priceTol(a.price || b.price || 0)) return false
  if (a.miles && b.miles && Math.abs(a.miles - b.miles) > 2500) return false
  return true
}
export function dedupeListings(listings) {
  const unique = [], merged = []
  for (const v of listings) {
    const dup = unique.find(u => sameVehicle(u, v))
    if (dup) {
      if (!dup.url && v.url) dup.url = v.url          // prefer a row that has a URL
      if (!dup.vin && v.vin) dup.vin = v.vin
      merged.push({ label: `${v.year} ${v.make} ${v.model} $${v.price}`, into: `${dup.year} ${dup.make} ${dup.model} $${dup.price}` })
      continue
    }
    unique.push({ ...v })
  }
  return { unique, merged }
}

// ─── Discount ───
export function computeDiscountPct(estMarketValue, price) {
  if (!estMarketValue || !price) return null
  return Math.round(((estMarketValue - price) / estMarketValue) * 100)
}

// ─── Rule-based confidence ───
// high  = dealer, mileage present & plausible for age, discount not implausible
// medium = plausible but thin (private, or missing mileage, or higher discount)
// low   = sparse data or an implausibly large discount (likely a problem)
export function ruleConfidence(v, opts = {}) {
  const demoteAt = opts.demoteThreshold ?? 20
  const age = v.year ? (opts.nowYear ?? 2026) - v.year : null
  const milesPlausible = v.miles == null || age == null || (v.miles >= 0 && v.miles <= Math.max(30000, age * 22000 + 20000))
  const disc = v.estDiscountPct
  if (disc != null && disc >= demoteAt) return 'low'                 // too-good-to-be-true
  if (norm(v.sellerType) === 'dealer' && v.miles != null && milesPlausible && disc != null && disc < demoteAt) return 'high'
  if (!milesPlausible || v.miles == null || disc == null) return 'low'
  return 'medium'
}

// ─── Templated rationale (no LLM) ───
export function templateRationale(v) {
  const parts = []
  if (v.estDiscountPct != null) parts.push(`~${v.estDiscountPct}% below estimated Austin market ($${(v.estMarketValue || 0).toLocaleString()})`)
  parts.push(norm(v.sellerType) === 'dealer' ? 'dealer listing' : 'private listing')
  if (v.dealRating) parts.push(`platform badge "${v.dealRating}"`)
  if (v.miles != null) parts.push(`${v.miles.toLocaleString()} mi`)
  if (norm(v.sellerType) === 'private') parts.push(v.vin ? `VIN provided (${v.vin})` : 'no VIN — verify before purchase')
  if (v.estDiscountPct != null && v.estDiscountPct >= (v.demoteThreshold ?? 20)) parts.push('discount large enough to warrant scrutiny')
  return parts.join('; ') + '.'
}

// ─── Rank ───
// Input: valued listings (each with price + estMarketValue, optionally scam
// flag). Output: top-N sorted by discount, with demotion, confidence, rationale.
// Vehicles flagged as scams or missing a market value are dropped to `dropped`.
export function rankBargains(valued, opts = {}) {
  const topN = opts.topN ?? 20
  const demoteThreshold = opts.demoteThreshold ?? 20
  const startRank = opts.startRank ?? 1

  const dropped = []
  const scored = []
  for (const v of valued) {
    if (v.isScam) { dropped.push({ label: `${v.year} ${v.make} ${v.model} $${v.price}`, reason: v.scamReason || 'Flagged as likely scam.' }); continue }
    const disc = computeDiscountPct(v.estMarketValue, v.price)
    if (disc == null) { dropped.push({ label: `${v.year} ${v.make} ${v.model} $${v.price}`, reason: 'No market value estimate.' }); continue }
    const withDisc = { ...v, estDiscountPct: disc, demoteThreshold }
    scored.push({ ...withDisc, confidence: ruleConfidence(withDisc, opts), _demoted: disc >= demoteThreshold })
  }

  // Sort: non-demoted first, then by discount desc, then by confidence.
  const confRank = { high: 0, medium: 1, low: 2 }
  scored.sort((a, b) =>
    (a._demoted - b._demoted) ||
    (b.estDiscountPct - a.estDiscountPct) ||
    (confRank[a.confidence] - confRank[b.confidence])
  )

  const top = scored.slice(0, topN).map((v, i) => {
    const { _demoted, ...rest } = v
    return { rank: startRank + i, ...rest, rationale: templateRationale(v) }
  })
  return { topBargains: top, dropped, scoredCount: scored.length }
}
