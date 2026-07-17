# Car-Market Research Pipeline

Three chainable [Workflow](../../CLAUDE.md) scripts that reproduce the used-car
bargain research run, generalized to any metro / price band / source set. Each
runs via the Claude Code **Workflow** tool (they use the `agent()` / `parallel()`
harness — they are not plain Node scripts and won't run under `node`).

| Stage | Script | Does |
|-------|--------|------|
| 1 | `01-search-listings.js` | Fan-out collection: one agent per source × body-style, extracts every in-band live listing |
| 2 | `02-rank-listings.js` | Screens salvage/scam/out-of-scope, estimates discount-to-market, ranks top-N |
| 3 | `03-verify-dedupe.js` | Semantic-dedupes, then WebFetch-verifies each URL resolves to the stated vehicle |

## Chaining

Each stage's return value is the next stage's `args`:

```
Workflow({ scriptPath: "scripts/car-market-research/01-search-listings.js", args: {
  metro: "Austin, TX", priceMin: 10000, priceMax: 20000,
  sources: ["CarGurus","Cars.com","Craigslist","KBB"],
  bodyStyles: ["all","suv","truck"]
}})
// → { listings, sources, metro, priceMin, priceMax, stats }

Workflow({ scriptPath: "scripts/car-market-research/02-rank-listings.js", args: <stage-1 output> })
// → { topBargains, rejected, summary, caveats, stats }

Workflow({ scriptPath: "scripts/car-market-research/03-verify-dedupe.js", args: <stage-2 output> })
// → { verified, buckets, stalePriced, dedupe, stats }
```

Pass the previous stage's JSON result object straight through as `args`; the
carried `metro` / `priceMin` / `priceMax` / `listings` / `topBargains` fields are
picked up automatically. Stages 2 and 3 also accept a bare `{ listings: [...] }`
or `{ items: [...] }` if you want to run them standalone.

## Notes / lessons baked in

- **Stage 1 never guesses URLs.** The original run reconstructed CarGurus detail
  URLs from listing IDs with the wrong path format (`/Cars/detail/<id>` → 404;
  only `/details/<id>` resolves). Stage 1's prompt requires verbatim on-page URLs
  and prefers *no* URL over a constructed one.
- **Stage 2 demotes implausible discounts.** A price far below comparables is a
  primary fraud signal, so the biggest raw discounts are demoted, not ranked top.
- **Stage 3 distinguishes `blocked` from `dead`.** Anti-bot 403/406 (KBB, and via
  `curl` also CarGurus/Cars.com) means *unverifiable*, not gone. It also flags
  `live-mismatch` (an ID that now resolves to a different vehicle) and stale prices.
- Sandbox limits: no `Date.now()` / `Math.random()` / `new Date()`.
