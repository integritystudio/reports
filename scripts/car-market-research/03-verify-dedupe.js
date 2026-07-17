// Stage 3 of 3 — VERIFYING & DEDUPING RESULTS
//
// Two passes over stage-2 output:
//   (A) Semantic dedupe (code) — collapse the same vehicle appearing across
//       sources at near-identical price/mileage, keeping one canonical row.
//   (B) Link verification (agents) — WebFetch each listing URL and check it
//       resolves to a SPECIFIC listing whose year/make/model/price matches the
//       row. Catches the failure modes seen in the Austin run: dead 404s,
//       IDs that now resolve to a different vehicle (mismatch), stale prices,
//       and bot-walled pages (blocked → unverifiable, not dead).
//
// Invoke (Workflow tool):
//   Workflow({ scriptPath: ".../03-verify-dedupe.js", args: <stage-2 output> })
// It reads args.topBargains (falls back to args.items / args.listings).
//
// Returns { verified:[...], buckets:{liveMatch,liveMismatch,dead,blocked,noUrl},
//           dedupe:{kept,merged}, stats }.

export const meta = {
  name: 'car-verify-dedupe',
  description: 'Stage 3: semantic-dedupe listings, then verify each source URL resolves to the stated vehicle (live/dead/mismatch/blocked).',
  phases: [{ title: 'Verify', detail: 'Dedupe in code, then one WebFetch verifier per unique listing URL' }],
}

const A = (typeof args === 'object' && args) ? args : {}
const ITEMS = Array.isArray(A.topBargains) ? A.topBargains
  : Array.isArray(A.items) ? A.items
  : Array.isArray(A.listings) ? A.listings
  : []

if (ITEMS.length === 0) {
  return { error: 'No items provided. Pass stage-2 output (topBargains) or { items: [...] } as args.', verified: [] }
}

// ─── (A) Semantic dedupe ───────────────────────────────────────────────────
// Same vehicle if year+make+model match (case-insensitive) AND price is within
// tolerance AND mileage is close (or missing on one side). Keep the first
// occurrence (ranked order); prefer one that carries a url when tied.
const norm = s => String(s == null ? '' : s).trim().toLowerCase()
const priceTol = p => Math.max(500, Math.round(p * 0.04))
const sameVehicle = (a, b) => {
  if (a.year !== b.year || norm(a.make) !== norm(b.make) || norm(a.model) !== norm(b.model)) return false
  if (Math.abs((a.price || 0) - (b.price || 0)) > priceTol(a.price || b.price || 0)) return false
  if (a.miles && b.miles && Math.abs(a.miles - b.miles) > 2500) return false
  return true
}

const kept = []
const merged = []
for (const it of ITEMS) {
  const dupOf = kept.find(k => sameVehicle(k, it))
  if (dupOf) {
    // Prefer a row that actually has a URL as the canonical one.
    if (!dupOf.url && it.url) dupOf.url = it.url
    merged.push({ label: `${it.year} ${it.make} ${it.model} $${it.price}`, mergedInto: `${dupOf.year} ${dupOf.make} ${dupOf.model} $${dupOf.price}` })
    continue
  }
  kept.push({ ...it })
}
log(`Dedupe: ${ITEMS.length} in → ${kept.length} unique (${merged.length} merged)`)

// ─── (B) Link verification ─────────────────────────────────────────────────
const VERDICT_SCHEMA = {
  type: 'object', required: ['status', 'evidence'],
  properties: {
    status: { enum: ['live-match', 'live-mismatch', 'dead', 'blocked', 'no-url'] },
    pageYear: { type: 'integer' }, pageMake: { type: 'string' }, pageModel: { type: 'string' },
    pagePrice: { type: 'integer' },
    priceMatches: { type: 'boolean' },
    evidence: { type: 'string' },
  },
}

const VERIFY_PROMPT = (v) =>
  `## Listing URL Verifier\n\n` +
  `Expected vehicle (from our ranking): **${v.year} ${v.make} ${v.model}${v.trim ? ' ' + v.trim : ''}**, ` +
  `listed at **$${v.price}**${v.miles ? `, ~${v.miles} mi` : ''}${v.sellerName ? `, seller: ${v.sellerName}` : ''}.\n` +
  `URL to check: ${v.url}\n\n` +
  `## Task\n` +
  `1. WebFetch the URL.\n` +
  `2. Decide the status:\n` +
  `   - **live-match**: page shows a SPECIFIC vehicle listing and its year/make/model matches the expected vehicle.\n` +
  `   - **live-mismatch**: page loads a specific listing but it is a DIFFERENT vehicle (wrong year/make/model), or it ` +
  `redirects to a search/home page with no specific vehicle. (This is the recycled/guessed-ID failure mode.)\n` +
  `   - **dead**: 404 / not found / "listing no longer available".\n` +
  `   - **blocked**: the fetch was refused by anti-bot protection (e.g. 403/406) so the listing could NOT be inspected — ` +
  `this is UNVERIFIABLE, not proof the listing is gone.\n` +
  `3. If a specific listing loaded, extract pageYear/pageMake/pageModel/pagePrice and set priceMatches (is the on-page ` +
  `price within ~$500 of the expected $${v.price}? false flags a stale price).\n` +
  `4. evidence: one specific sentence (what loaded, the on-page price, any mismatch).\n\n` +
  `Structured output only.`

phase('Verify')
const verified = await parallel(
  kept.map((v, i) => () => {
    if (!v.url) {
      return Promise.resolve({ ...v, verify: { status: 'no-url', evidence: 'No source URL was captured for this listing.' } })
    }
    return agent(VERIFY_PROMPT(v), {
      label: `verify:${norm(v.make)}-${norm(v.model)}`.slice(0, 40),
      phase: 'Verify',
      schema: VERDICT_SCHEMA,
    }).then(res => {
      const verdict = res || { status: 'blocked', evidence: 'Verifier agent returned no result.' }
      log(`${v.year} ${v.make} ${v.model}: ${verdict.status}${verdict.priceMatches === false ? ' (stale price)' : ''}`)
      return { ...v, verify: verdict }
    }).catch(e => ({ ...v, verify: { status: 'blocked', evidence: `Verifier error: ${e.message || e}` } }))
  })
)

const by = status => verified.filter(x => x.verify.status === status)
const buckets = {
  liveMatch: by('live-match'),
  liveMismatch: by('live-mismatch'),
  dead: by('dead'),
  blocked: by('blocked'),
  noUrl: by('no-url'),
}
const stalePriced = verified.filter(x => x.verify.priceMatches === false)

log(`Verify done: ${buckets.liveMatch.length} live-match, ${buckets.liveMismatch.length} mismatch, ` +
    `${buckets.dead.length} dead, ${buckets.blocked.length} blocked/unverifiable, ${buckets.noUrl.length} no-url` +
    (stalePriced.length ? `, ${stalePriced.length} stale-priced` : ''))

const label = x => `${x.year} ${x.make} ${x.model} $${x.price}${x.url ? ' — ' + x.url : ''}`
return {
  verified,
  buckets: {
    liveMatch: buckets.liveMatch.map(label),
    liveMismatch: buckets.liveMismatch.map(x => label(x) + ' :: ' + x.verify.evidence),
    dead: buckets.dead.map(x => label(x) + ' :: ' + x.verify.evidence),
    blocked: buckets.blocked.map(label),
    noUrl: buckets.noUrl.map(label),
  },
  stalePriced: stalePriced.map(x => `${x.year} ${x.make} ${x.model}: listed $${x.price}, on-page $${x.verify.pagePrice ?? '?'}`),
  dedupe: { kept: kept.length, merged },
  stats: {
    input: ITEMS.length, unique: kept.length, mergedAway: merged.length,
    liveMatch: buckets.liveMatch.length, liveMismatch: buckets.liveMismatch.length,
    dead: buckets.dead.length, blocked: buckets.blocked.length, noUrl: buckets.noUrl.length,
    stalePriced: stalePriced.length,
  },
}
