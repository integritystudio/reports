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
./run-browser-collect.sh --source carmax  --min 10000 --max 20000 --zip 78745 --radius 75   # /car/<stock>
./run-browser-collect.sh --source carvana --min 10000 --max 20000                           # /vehicle/<id>
./run-browser-collect.sh --source cars    --min 10000 --max 20000 --zip 78745 --radius 75
```

Emits `{ source, url, geoScope, zip, radiusMi, blocked, count, listings:[...] }`;
each listing carries a verbatim detail URL and a `geoScope` tag. Feed `listings`
into stage 1 as `preCollected` (its source is then skipped in the agent matrix —
more token savings on top of Craigslist).

**Metro restriction (`--zip` + `--radius`).** The two sources with a real
distance filter are geo-restricted to physical inventory within `--radius` miles
(default 75) of `--zip`, and tagged `geoScope:"metro"`:
- **CarMax** — `?zip=<zip>&distance=<radius>` is CarMax's own radius filter
  (accepts 10–500 mi); the price band goes in the same URL (`price=min-max`).
- **Cars.com** — `maximum_distance=<radius>&zip=<zip>`.

**Carvana is national and cannot be metro-restricted.** Its inventory is
centralized nationwide delivery; the `/cars/<city>` path 302-redirects to the
national `/cars` grid and no consumer location filter exists (confirmed 2026-07
via the browser). Carvana listings are therefore tagged `geoScope:"national"`
(they deliver to the metro, they are not local) — never presented as local
inventory. The ranker/report can label or drop them per a metro-only rule.

**Free-shipping filter (Carvana's availability signal).** Because Carvana has no
distance filter, its one delivery signal is per-car shipping cost. Carvana runs
default to **free-shipping-only**: each card is read for "Free shipping" and only
confirmed-free cars are kept (`shipping:"free"` per listing; `freeShippingOnly`
in the output; dropped counts logged to stderr). Paid-delivery and
undetectable-shipping cards are excluded — if free can't be confirmed, the car is
not included. Flags: `--include-paid-shipping` disables it for Carvana;
`--free-shipping-only` forces it for any source.

**Location pin (`--zip`, default 78702).** The browser context pins
`navigator.geolocation` to the coordinates of `--zip` (known Austin-metro zips
are mapped exactly; others fall back to the metro centroid) and grants the
geolocation permission, so a site that reads geolocation sees the Austin
location. Verified 2026-07: on a secure origin the page reads back exactly the
78702 coordinates; the pin also flows into the CarMax/Cars.com `zip=` URLs.
Output carries `pinnedGeo`. **Caveat:** probing found Carvana's *results grid*
does not recompute its "Free shipping" labels from this pin (no zip control on
the grid; delivery fees are finalized per-vehicle at checkout from a saved
address). So the pin is set correctly and matters for geolocation-reading sites,
but on Carvana the free-shipping gate still operates on whatever labels the grid
renders — it is not proof of Austin-specific free delivery.

### Headless-browser verifier (CarMax/Carvana link check)

`src/browser-verify.mjs` opens each listing's **detail URL** in the same stealth
Chromium (shared setup lives in `src/browser-lib.mjs`) and returns a per-URL
verdict — the only way to verify CarMax/Carvana listings, which 403 both plain
`fetch` AND WebFetch (so stage 3's own WebFetch verifier can't reach them).

```
# Verify collected listings (collector output or a bare [{url,year,make,model,price}] array)
./run-browser-collect.sh --source carmax --min 10000 --max 20000 --max-items 8 > carmax.json
./run-browser-verify.sh --file carmax.json --pretty > verdicts.json
# or via stdin: cat carmax.json | ./run-browser-verify.sh > verdicts.json
```

Each verdict is `{ url, status, httpStatus, pageYear, pageMake, pageModel,
pagePrice, priceMatches, evidence }` where `status` is:
- **live-match** — 200 and the page's year/make/model matches the expected row
  (model compared on the nameplate, tolerating trim/location noise — CarMax
  titles read "…Honda Fit in Austin, TX").
- **live-mismatch** — a specific listing loaded but it's a different vehicle, or
  the URL redirected to a search/home page (recycled/guessed ID).
- **dead** — 404/410 or an on-page "no longer available / sold".
- **blocked** — 403/406/429 anti-bot refusal (unverifiable, *not* proof it's gone).

Verification is **sequential** (one tab at a time) — parallel tabs on the same
domain trip the rate-limiter that produces the 403 in the first place.

Feed `verdicts.json` into stage 3 as **`args.preVerified`**: any listing whose
URL has a pre-verdict uses it verbatim and **skips the WebFetch agent**, so
CarMax/Carvana can finally clear the "verified as valid" gate (and it saves the
agent call for every pre-verified URL). Run the browser verifier outside the
Workflow sandbox (the sandbox has no network), then pass its output through:

```
Workflow({ scriptPath: ".../03-verify-dedupe.js", args: {
  ...stage2Output,                         // topBargains, metro, price band …
  preVerified: <verdicts array from verdicts.json>
}})
```

Verified 2026-07: 4 real CarMax detail URLs (which `curl` 403s) all returned
`live-match` with matching prices through the browser; a retired stock id
returned `dead` (404).

Verified working (2026-07): stealth (real-Chrome channel, `navigator.webdriver`
spoof, `--disable-blink-features=AutomationControlled`) turns the 403 into a
loaded page; a lazy-load scroll then reveals inventory. Notes:
- `playwright-core` is a **global** dep (resolved from `openclaw`'s node_modules
  via `createRequire` + `PW_DIR`), not a repo dependency — nothing to `npm install`.
- The DOM extractor runs inside the page via `page.evaluate`, so it takes the
  URL-path hint as a **runtime argument** (closures don't cross that boundary).
- Counts scale with scroll depth (`--max-items`, scroll rounds); tune per need.
- **Verification** of CarMax/Carvana URLs must also use the browser — stage 3's
  WebFetch 403s on them. Use `src/browser-verify.mjs` (above) to produce
  `preVerified` verdicts; a detail page returning 200 with a matching title
  satisfies the "verified as valid" gate.

### Local dealership sites (`--source dealer`)

`src/dealers.json` is an Austin-metro seed list (~34 franchise/independent
dealers from the Austin Auto Dealers Association directory) for collecting local
dealer inventory. Most run on JS platforms (Dealer.com / DealerOn /
DealerInspire) that hide inventory behind JS, so they need the headless browser,
not plain `fetch`. They are physical metro dealers → `geoScope:"metro"`.

```
./run-browser-collect.sh --source dealer \
  --site https://www.rogerbeasleyused.com/inventory/used \
  --name "Roger Beasley Used" --min 10000 --max 20000
```

The generic extractor uses a multi-marker VDP link hint (`/inventory/used`,
`/vehicledetail`, `-vin-`, etc.) and a broad card selector, then band-filters in
Node. Verified working (2026-07) on Roger Beasley Used (12 in-band listings) and
Covert (extraction confirmed). Caveats, per the "never guess URLs" rule:
- **`used` URL is null for most seed dealers** — only the explicitly confirmed
  groups (Covert, Roger Beasley, Leif Johnson) carry a verified path. Resolve the
  live used-inventory URL before collecting rather than guessing; `commonUsedPaths`
  in the seed lists the usual shapes to check.
- **No universal price param.** `--site` can carry a platform-specific price
  facet if you know it; otherwise Node band-filters whatever loads. Dealers that
  default-sort cheapest-first (e.g. Covert) may need a sort/price facet or deeper
  paging before in-band cars appear on page 1.
- **No generic pagination.** Dealer.com-style grids are server-paginated (not
  infinite scroll), so only page 1 is collected unless `--site` targets a
  filtered/sorted view. Tune per site.

Feed the `listings` into stage 1 as `preCollected` like any other code-collected
source.

### CarMax & Carvana (national retailers, verification-gated)

`CarMax` and `Carvana` are in the default source list. **CarMax has physical
stores, so `--zip`+`--radius` restrict it to real Austin-metro inventory**
(`geoScope:"metro"`). **Carvana is national-only** — no location filter exists,
so it stays `geoScope:"national"` (delivers to the metro, not local). Both
hard-**403 to every plain fetch path — `fetch` AND WebFetch** (probed 2026-07),
which is why they need the headless browser. A collector agent therefore usually returns `sourceQuality:"blocked"`
with no listings until a headless-browser or official-feed collector is added.

Because of that, they are wired **verification-gated**: any CarMax/Carvana
listing without a resolvable detail URL is dropped in stage 1, and the rest are
tagged `mustVerify` so stage 3 (`03-verify-dedupe.js`) must confirm the URL
resolves to the stated vehicle before it can be included. Because WebFetch 403s
these domains, run `src/browser-verify.mjs` on their URLs first and pass its
verdicts as `args.preVerified` (see the browser-verifier section) — that is what
lets a CarMax/Carvana listing clear the gate. Per the "only include what can be
verified as valid" rule, an unverifiable CarMax/Carvana listing is never added.
To exclude them entirely, pass `args.sources` without them.

`src/collect-lib.mjs` holds the shared pure helpers (title→year/make/model
parser with model→make inference, in-band filter, task matrix, dedupe key);
`src/browser-lib.mjs` holds the shared stealth-browser session (playwright-core
resolution, launch, anti-bot context) used by both the collector and verifier.

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
