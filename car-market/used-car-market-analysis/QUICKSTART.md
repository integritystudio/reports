# Quick Start — Run the Used-Car Search Manually (Browser Path)

Find Austin-metro used-car bargains from the command line, no LLM agents. The
headless browser drives a real Chrome so it reaches CarMax / Carvana / Cars.com
(which 403 plain `fetch` and WebFetch). Two steps: **collect**, then **verify**.

All commands run from the scripts directory:

```
cd car-market/scripts
```

## One-shot: the whole pipeline

`full_search_pipeline.sh` runs everything end-to-end (zero LLM tokens): it fires
the three category wrappers in parallel (retail / dealers / private-party),
verifies each result file's detail URLs in parallel (batched), then combines,
dedups, and ranks the survivors into one price-sorted list:

```
./full_search_pipeline.sh --min 10000 --max 20000 --zip 78702 --radius 75 --max-items 25
```

Flags: `--top` (list length, 20), `--jobs` (parallel verify processes, 4),
`--out-dir` (artifacts, `pipeline-out/`), `--verified-dealers-only`,
`--keep-blocked` (keep anti-bot-unverifiable listings), `--skip-verify` (skip
stage 2). Writes `pipeline-out/{combined,ranked}.json` plus per-file
`*.verdicts.json` / `*.survivors.json`.

**Ranking mode (`--rank-mode`):**
- `node` (default) — deterministic, zero-token. Dedups the validated survivors
  and lists them price-sorted. No `estMarketValue`/discount (the shell can't call
  an LLM).
- `llm` (or `--llm`) — writes the validated survivors to
  `pipeline-out/rank-args.json` and prints the Workflow command to run
  `02-rank-listings.js`, which makes a **per-vehicle LLM call** to estimate
  `estMarketValue` and then discount-ranks (see [README.md](README.md) and
  [PRICING-DATA-RESEARCH.md](PRICING-DATA-RESEARCH.md)). `--metro` sets the metro
  passed to that stage (default "Austin, TX").

The rest of this doc covers running each stage by hand for finer control.

## Prerequisites

- Node.js v18+.
- `playwright-core` + Google Chrome available globally. The `run-*.sh` wrappers
  set `PW_DIR` and resolve it automatically — nothing to `npm install`. If you
  see `playwright-core not found`, set `PW_DIR` to the `node_modules` dir that
  contains it.

## Step 1 — Collect listings

One source at a time. Output is JSON on stdout (`--pretty` for readable);
redirect to a file.

```
# CarMax — real metro filter (zip + radius), price band in-URL
./run-browser-collect.sh --source carmax  --min 10000 --max 20000 --zip 78702 --radius 75 --max-items 25 > carmax.json

# Cars.com — real metro filter, price-ascending
./run-browser-collect.sh --source cars    --min 10000 --max 20000 --zip 78702 --radius 75 --max-items 25 > cars.json

# Carvana — national inventory, defaults to free-shipping-only
./run-browser-collect.sh --source carvana --min 10000 --max 20000 --max-items 25 > carvana.json

# A specific local dealer (see ../dealers.json for the Austin seed list)
./run-browser-collect.sh --source dealer --site https://www.covertauto.com/used-vehicles/ --name "Covert Auto" --min 10000 --max 20000 > covert.json
```

**All built-in sources at once.** `carmax_cars_carvana_search.sh` wraps the
collector, looping over the built-ins and writing one `<source>.json` each
(CarMax / Cars.com get the metro filter; Carvana is national, so `--zip`/`--radius`
are skipped for it):

```
./carmax_cars_carvana_search.sh --min 10000 --max 20000 --zip 78702 --radius 75 --max-items 25
```

Writes `carmax.json`, `cars.json`, `carvana.json` and prints a per-source count.
Override the list with `--sources "carmax cars"`, choose a directory with
`--out-dir`, and forward extra collector flags after `--` (e.g.
`-- --include-paid-shipping`). Verify each file in Step 2 the same way.

**All local dealers at once.** `dealer_search.sh` reads the Austin seed list in
`../dealers.json` and runs `--source dealer` for every dealer that has a resolved
used-inventory URL (dealers with a null `used` URL are skipped — the collector
never guesses), writing one `<slug>.json` each into `--out-dir` (default
`dealers/`):

```
./dealer_search.sh --min 10000 --max 20000 --max-items 25 --verified-only
```

`--verified-only` limits to `usedVerified` dealers; omit it for all resolvable
URLs. A dealer that fails doesn't abort the run. Override the list source with
`--dealers-json <path>` and forward extra collector flags after `--`. All dealer
listings are `geoScope:"metro"` (physically local). Verify in Step 2 as usual.

**All private-party listings at once.** `private_party_search.sh` wraps the
Craigslist collector — the only private-party (owner) source, and the one path
that needs no browser (it uses Craigslist's JSON API, so zero LLM tokens). It
VIN-enriches and body-class-filters by default (drops no-VIN private listings and
mid/full-size trucks + vans), runs each metro subregion in `--areas`, and merges
into one file deduped by URL:

```
./private_party_search.sh --min 10000 --max 20000 --areas "15" --pretty
```

Austin's areaId is `15`. Disable the deterministic screens with `--no-enrich-vin`
/ `--no-filter`, set the output with `--out`, and forward extra flags after `--`.
Private-party rows have no verifiable detail step like CarMax/Carvana — Step 2 is
optional for them.

Each file is `{ source, url, geoScope, zip, radiusMi, blocked, count, listings:[...] }`.
Every listing carries a verbatim detail `url`, `price`, `year/make/model`, and a
`geoScope` tag (`metro` = physically local; `national` = Carvana, delivers only).

Useful flags:

| Flag | Meaning |
|------|---------|
| `--min` / `--max` | Price band (dollars). |
| `--zip` / `--radius` | Metro center + radius (mi, 10–500). Applies to CarMax/Cars.com. Default zip `78702`. |
| `--max-items` | Cap per run; also scales scroll depth. |
| `--pages 1-3` | Collect multiple result pages (CarMax/Cars.com). |
| `--include-paid-shipping` | Carvana: keep paid-delivery cars too. |
| `--free-shipping-only` | Force the free-shipping gate on any source. |
| `--pretty` | Human-readable JSON. |
| `--headful` | Show the browser window (debugging). |

If a run prints `blocked: true`, the site rate-limited you (HTTP 403). Wait a
minute and retry, or run `--headful` to watch.

## Step 2 — Verify the detail URLs

Confirm each listing URL still resolves to the stated vehicle. This is the only
way to check CarMax/Carvana links (WebFetch 403s them). Feed a collector file (or
a bare `[{url,year,make,model,price}]` array) straight in:

```
./run-browser-verify.sh --file carmax.json --pretty > carmax-verdicts.json
# or via stdin
cat carmax.json | ./run-browser-verify.sh > carmax-verdicts.json
```

Each verdict is `{ url, status, httpStatus, pageYear, pageMake, pageModel,
pagePrice, priceMatches, evidence }`. `status` is one of:

- **live-match** — page shows the expected vehicle (keep it).
- **live-mismatch** — a different vehicle, or the link redirected to a search
  page (recycled/guessed ID — drop it).
- **dead** — 404 / sold / no longer available (drop it).
- **blocked** — anti-bot refusal; unverifiable, *not* proof it's gone (retry later).

Verification runs one tab at a time on purpose — parallel tabs trip the same
rate-limiter that causes the 403.

## Step 3 — Read the results

Filter to the keepers and sort by price. Example with `node`:

```
node -e '
  const c = require("./carmax.json").listings;
  const v = new Map(require("./carmax-verdicts.json").map(x => [x.url, x.status]));
  c.filter(l => v.get(l.url) === "live-match")
   .sort((a,b) => a.price - b.price)
   .forEach(l => console.log(`$${l.price}  ${l.year} ${l.make} ${l.model}  ${l.url}`));
'
```

Repeat Steps 1–2 per source, then compare across the verified `live-match` rows.
CarMax/Cars.com rows are local (`geoScope:"metro"`); Carvana rows are national
delivery — treat them as "available to Austin", not local inventory.

## Notes

- **Craigslist** (private sellers) is collected without a browser — it has a JSON
  API. Use `private_party_search.sh` (Step 1) for the wrapped path, or call the
  collector directly: `node src/craigslist.mjs --area 15 --min 10000 --max 20000 --purveyor owner > cl.json`
  (`--enrich-vin --filter` drops no-VIN private listings and big trucks/vans).
- **Feeding the LLM pipeline instead:** any collector `listings` array can be
  passed to stage 1 as `preCollected`, and verifier output to stage 3 as
  `preVerified`. See [README.md](README.md) for the Workflow chaining.
- Shared browser setup lives in `src/browser-lib.mjs`; parsing/filter helpers in
  `src/collect-lib.mjs`.
