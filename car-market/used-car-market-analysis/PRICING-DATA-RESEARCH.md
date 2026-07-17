# Used-Car Market-Value Data Sources — Research & Decision

Research (2026-07) into external data for a **deterministic** `estMarketValue`
(fair local retail price) to replace or supplement the LLM valuation. Question
asked: is there a free/open, reliable, commercial-safe API/dataset/library that
returns a used-car market value from year/make/model (+ optional trim/VIN/mileage/ZIP)?

## Bottom line

**No genuinely free + reliable + commercial-safe _live_ pricing API exists.**
Every real valuation engine is a paid B2B product with only trial/low-volume
free tiers; the one free-tier-friendly vendor (Auto.dev) has no valuation
endpoint at all. This is the state of the market, not a search gap.

## Decision

- **Keep LLM-call-based `estMarketValue`** — do not build a Node pricing client.
- Move valuation to **per-vehicle LLM calls, after the validation (verify/dedupe)
  stage**, so only de-duplicated, URL-verified survivors are valued (fewer calls,
  each focused on one vehicle).
- **If** a deterministic local model is ever built, derive base prices +
  mileage/age curves from the **Kaggle US Used Cars dataset** (see Tier 1), not a
  live API.

## Tier 1 — Free + open (no key / free key / open dataset)

| Source | Input → Output | Access | Notes |
|--------|----------------|--------|-------|
| [NHTSA vPIC](https://vpic.nhtsa.dot.gov/api/) | VIN → ~140 spec fields (year/make/model/trim) | Free, no key | **No pricing** — specs only. Use to canonicalize VIN before any valuation. |
| [Kaggle US Used Cars (ananaymital)](https://www.kaggle.com/datasets/ananaymital/us-used-cars-dataset) | ~3M listing records: price, mileage, year, make, model, trim, ZIP-region | Free download | Static snapshot. **Chosen base-price/mileage-curve source** for any future local model. Verify per-dataset license before commercial use. |
| [Kaggle Craigslist Cars & Trucks (austinreese)](https://www.kaggle.com/datasets/austinreese/craigslist-carstrucks-data) | ~450k private-party listings: price, odometer, YMM, region | Free download | Private-party price-floor signal; filter to TX/Austin `region`. Verify license. |
| [BLS Consumer Expenditure Survey depreciation](https://www.bls.gov/opub/mlr/2024/article/a-consumption-measure-for-automobiles.htm) | Age-specific annual depreciation rates | Free, public | Government-audited empirical depreciation curve — authoritative, citable age-decay multiplier. |
| [iSeeCars depreciation study](https://www.iseecars.com/cars-that-hold-their-value-study) | 5-yr depreciation by model/segment (~950k vehicles) | Free (web) | Per-model / EV-hybrid deltas. Cross-check only (proprietary methodology). |

## Tier 2 — Free developer tier with API key

| Source | Input → Output | Access / cost | Notes |
|--------|----------------|---------------|-------|
| [MarketCheck Price API](https://www.marketcheck.com/apis/pricing/) | **VIN only** → predicted retail (+ comps on higher tiers) | Free tier 500 calls/mo **but $0.07–0.13/call data fee**; paid $299/mo+ | Best freshness: ML retrained weekly on 4M+ sold listings. Not truly free. Viable as a periodic spot-check behind an API key. |
| [Auto.dev](https://www.auto.dev/pricing) | VIN decode, specs, recalls, listings, TCO | Free 1,000 calls/mo | **No market-value endpoint** — not usable for valuation. Cheap vPIC alternative only. |
| [VinAudit Market Value](https://www.vinaudit.com/vehicle-market-value-api) | VIN or YMM+trim+mileage → low/avg/high, retail/wholesale/trade-in | Demo/trial, then contact-sales | No self-serve free key. B2B commercial terms by contract. |
| [Vehicle Databases / CarsXE](https://vehicledatabases.com/vehicle-market-value-api) | VIN or YMM+trim+mileage+condition → trade-in/private/retail × 4 condition tiers | Free trial (undisclosed), then paid | Richest KBB-style output; terms require contact. |

## Tier 3 — Paid-only (fallback mention)

- **MarketCheck Standard/Enterprise** ($749/mo+ unlimited) — best data if budget allows.
- **VinAudit / CarsXE** — custom/contract pricing (~$0.10–0.50/call, unconfirmed).
- **KBB / Black Book / Edmunds** — enterprise data licensing, no self-serve API.
- **Edmunds TMV API** — retired; do not build a new dependency.

## npm ecosystem

No offline used-car valuation library exists on npm (registry search
`car valuation depreciation` returned only unrelated "car"-named packages).

## If a deterministic local model is built later

Recommended architecture (no live-API dependency):

1. **vPIC** (free) — VIN → make/model/year/trim.
2. **Base price + mileage curve** from the Kaggle US Used Cars dataset, keyed on
   (make, model, model-year-age, mileage-bucket, region).
3. **Age decay** from the BLS depreciation curve; segment-adjust with iSeeCars.
4. **Region** adjustment from the Craigslist dataset (TX/Austin) or a demand multiplier.
5. **Optional** MarketCheck free-tier VIN spot-check to validate model drift.
6. Never fail closed — always return an estimate, flagged with a confidence score.

## Caveats to verify before commercial shipping

- Kaggle dataset licenses (CC0 vs restricted) — check each dataset's License tab.
- MarketCheck ToS on redistributing derived estimates publicly.
- VinAudit/CarsXE per-call pricing and commercial-use terms — require a vendor quote.

## Sources

- NHTSA vPIC — https://vpic.nhtsa.dot.gov/api/
- MarketCheck — https://www.marketcheck.com/apis/pricing/ · https://docs.marketcheck.com/docs/api/cars/market-insights/marketcheck-price
- Auto.dev — https://www.auto.dev/pricing
- VinAudit — https://www.vinaudit.com/vehicle-market-value-api
- Vehicle Databases — https://vehicledatabases.com/vehicle-market-value-api
- Edmunds TMV (retired) — https://developer.edmunds.com/api-documentation/vehicle/price_tmv/v1/
- Kaggle US Used Cars — https://www.kaggle.com/datasets/ananaymital/us-used-cars-dataset
- Kaggle Craigslist — https://www.kaggle.com/datasets/austinreese/craigslist-carstrucks-data
- BLS depreciation — https://www.bls.gov/opub/mlr/2024/article/a-consumption-measure-for-automobiles.htm
- iSeeCars — https://www.iseecars.com/cars-that-hold-their-value-study
