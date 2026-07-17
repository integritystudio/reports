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
//
// Body-class exclusion (stage 2): args.excludeClasses controls which body
// classes are rejected in the screen. Default is
//   ["fullsize-truck","midsize-truck","van"]
// (keeps compact unibody trucks like the Ford Maverick / Hyundai Santa Cruz).
// Pass [] to rank all body styles, or a subset to relax the rule, e.g.
//   args: { ...stage1, excludeClasses: ["fullsize-truck"] }   // keep mid-size + vans

Workflow({ scriptPath: "scripts/car-market-research/03-verify-dedupe.js", args: <stage-2 output> })
// → { verified, buckets, stalePriced, dedupe, stats }
```

Pass the previous stage's JSON result object straight through as `args`; the
carried `metro` / `priceMin` / `priceMax` / `listings` / `topBargains` fields are
picked up automatically. Stages 2 and 3 also accept a bare `{ listings: [...] }`
or `{ items: [...] }` if you want to run them standalone.

## Reducing tokens: code-collect what you can, agent-collect the rest

The Workflow sandbox has no network, so real scraping lives in Node code under
`src/`. Craigslist exposes a JSON API (`sapi`), so its listings are collected by
**free deterministic code** instead of 3 LLM agents. CarGurus / Cars.com / KBB
bot-wall plain HTTP, so those still need agents.

```
# 1. Code-collect Craigslist (0 tokens). Austin area id = 15.
node scripts/car-market-research/src/craigslist.mjs \
  --area 15 --min 10000 --max 20000 --purveyor owner > cl.json

# 2. Stage 1 with preCollected → skips Craigslist agents, keeps the rest.
Workflow({ scriptPath: ".../01-search-listings.js", args: {
  metro: "Austin, TX", priceMin: 10000, priceMax: 20000,
  sources: ["CarGurus","Cars.com","KBB"],      // Craigslist handled by code
  bodyStyles: ["all","suv","truck"],
  preCollected: <listings array from cl.json>   // merged in; its sources are skipped
}})
```

`preCollected` listings are merged into the output and their source is dropped
from the agent task matrix (stage 1 logs how many tasks it skipped). Any metro:
open `https://<metro>.craigslist.org/search/cta` and grep `"areaId":N` for `--area`.

### More deterministic collection (further token savings)

The collect stage pushes as much as possible into free Node code so the LLM
ranker receives a smaller, pre-screened pool:

- **`src/craigslist.mjs --enrich-vin`** — fetches each posting's detail page and
  extracts the VIN in code (`"vin":"<17>"`), so the VIN-required-for-private rule
  needs no LLM. **`--filter`** then drops mid/full-size trucks, vans, and no-VIN
  private listings deterministically. In practice this cut a 198-listing
  Craigslist pull to 27 VIN-bearing survivors — ~170 listings the ranker never sees.
- **`src/classify.mjs`** — `classifyBody(make, model)` tags body style + truck
  size (compact/mid/full) + van; `filterListings(listings, {excludeClasses,
  requireVinForPrivate})` splits kept vs rejected. Used by the collectors and
  reusable anywhere.
- **`01-search-listings.js` pre-filter** — the same body-class + VIN rules are
  inlined into stage 1 (the sandbox can't import), so **agent-collected** sources
  (CarGurus/Cars.com/KBB) are pre-screened too before ranking. Output carries
  `preRejected`. Disable with `args.preFilter === false`; tune with
  `args.excludeClasses` / `args.requireVinForPrivate`.

> Note: the inlined classifier in `01-search-listings.js` mirrors
> `src/classify.mjs` — keep the two lists in sync when adding nameplates.

Dealer sources stay agent-collected: Cars.com (403) and CarGurus (406) bot-wall
plain `fetch`, so only Craigslist is fully code-collectable.

### Headless-browser collector (defeats the 403 bot-wall)

`src/browser-collect.mjs` drives a real Chromium (via `playwright-core` + the
installed Google Chrome, with stealth) so it passes the bot checks that 403 both
plain `fetch` and WebFetch. This is the **only** path that reaches CarMax,
Carvana, and Cars.com listing pages — deterministically, zero LLM tokens.

```
# via the wrapper (sets PW_DIR so global playwright-core resolves)
./run-browser-collect.sh --source carmax  --min 10000 --max 20000   # /car/<stock>
./run-browser-collect.sh --source carvana --min 10000 --max 20000   # /vehicle/<id>
./run-browser-collect.sh --source cars    --min 10000 --max 20000 --zip 78701
```

Emits `{ source, url, blocked, count, listings:[...] }`; each listing carries a
verbatim detail URL. Feed `listings` into stage 1 as `preCollected` (its source
is then skipped in the agent matrix — more token savings on top of Craigslist).

Verified working (2026-07): stealth (real-Chrome channel, `navigator.webdriver`
spoof, `--disable-blink-features=AutomationControlled`) turns the 403 into a
loaded page; a lazy-load scroll then reveals inventory. Notes:
- `playwright-core` is a **global** dep (resolved from `openclaw`'s node_modules
  via `createRequire` + `PW_DIR`), not a repo dependency — nothing to `npm install`.
- The DOM extractor runs inside the page via `page.evaluate`, so it takes the
  URL-path hint as a **runtime argument** (closures don't cross that boundary).
- Counts scale with scroll depth (`--max-items`, scroll rounds); tune per need.
- **Verification** of CarMax/Carvana URLs must also use the browser — stage 3's
  WebFetch 403s on them. A detail page returning 200 with a matching title
  satisfies the "verified as valid" gate.

### CarMax & Carvana (national retailers, verification-gated)

`CarMax` and `Carvana` are in the default source list, but they are **national
online retailers** (inventory delivers to the metro; not local dealers) and
hard-**403 to every fetch path tested — plain `fetch` AND WebFetch** (probed
2026-07). A collector agent therefore usually returns `sourceQuality:"blocked"`
with no listings until a headless-browser or official-feed collector is added.

Because of that, they are wired **verification-gated**: any CarMax/Carvana
listing without a resolvable detail URL is dropped in stage 1, and the rest are
tagged `mustVerify` so stage 3 (`03-verify-dedupe.js`) must confirm the URL
resolves to the stated vehicle before it can be included. Per the "only include
what can be verified as valid" rule, an unverifiable CarMax/Carvana listing is
never added. To exclude them entirely, pass `args.sources` without them.

`src/collect-lib.mjs` holds the shared pure helpers (title→year/make/model
parser with model→make inference, in-band filter, task matrix, dedupe key).

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
