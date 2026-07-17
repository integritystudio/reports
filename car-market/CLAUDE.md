# car-market

Used-car market research pipeline + generated HTML reports for the Austin metro.

## Layout
- `scripts/` — the pipeline (see `used-car-market-analysis/README.md`)
- `used-car-market-analysis/` — reports + README, QUICKSTART, PRICING-DATA-RESEARCH
- `dealers.json` — Austin dealer seed list (shared root file)
- `refinance/`, `car-lease-market-analysis/` — sibling report sets

## Pipeline (run order: 01 → 03 → 02)
- `01-search-listings.js` — collect listings
- `03-verify-dedupe.js` — **validation**: dedupe + verify URLs (runs BEFORE ranking)
- `02-rank-listings.js` — **valuation & rank**: micro-batched LLM estMarketValue on validated survivors
- Shell wrappers (bash, run from `scripts/`): `carmax_cars_carvana_search.sh`,
  `dealer_search.sh`, `private_party_search.sh`, `full_search_pipeline.sh` (`--rank-mode node|llm`)

## Gotchas
- `01/02/03-*.js` are **Workflow-tool scripts** (use `agent()`/`parallel()`/top-level `return`) — NOT runnable with `node`; `bash -n` / `node --check` won't parse them.
- `src/*.mjs` and the `run-*.sh` / `*_search.sh` wrappers ARE plain Node/bash.
- Browser collectors need global `playwright-core` + Chrome; `run-*.sh` set `PW_DIR` (nothing to `npm install`).
- CarMax/Carvana 403 both `fetch` AND WebFetch → need `src/browser-verify.mjs`; they're verification-gated.
- `estMarketValue` is an **LLM judgment** — no free/legal live pricing API exists (see `used-car-market-analysis/PRICING-DATA-RESEARCH.md`). The pure-Node path can only price-sort.
- Target bash is 3.2 (macOS) — no `wait -n`; guard empty-array expansion under `set -u`.
