# Reports Hub - Backlog

Open and deferred items. Completed items are in [CHANGELOG.md](CHANGELOG.md).

---

## Open: Medium Priority

---

### GA5. Add Consent Mode v2 defaults — Done
**Priority:** Medium (GDPR/LGPD compliance)
**Source:** GA tracking health audit (May 16)
**File:** `js/gtag.js`

No `gtag('consent', 'default', …)` call before `config`. Relevant given Portuguese/Brazilian (LGPD) and broader EU traffic on `edgar_nadyne` translations and other reports. Add denied-by-default consent state with banner-driven update.

**Effort:** Medium (defaults trivial; banner UI is the work)

**[DONE]** — added `gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500})` before config call in `js/gtag.js`

---

### GA7. Audit submodule GA setups vs. hub property — Done
**Priority:** Low (data consolidation)
**Source:** GA tracking health audit (May 16)
**Files:** `john_skelton/_includes/_google_tag_manager.html`, `micah_lindsey/_includes/_google_tag_manager.html`

Submodules ship their own GTM partials and analytics tests, outside the hub's `G-YXLT76BTM4` property. Confirm whether separate properties are intentional (per-client reporting) or whether they should be merged into the hub property for unified dashboards.

**Audit findings (May 16):**
- `john_skelton`: GA4 property `G-J7TL7PQH7S` + GTM container `GTM-NR4GGH5K` configured in `_config.yml`. Separate per-client property — intentional. No consolidation needed.
- `micah_lindsey`: Has `_includes/_google_tag_manager.html` partial but no `container_id` set in `_config.yml`. GTM tag renders empty/disabled — no tracking currently active from this submodule.

**Decision:** Separate properties are the correct approach for per-client reporting. `micah_lindsey` has no active GA setup; if tracking is desired for that site, a container_id should be added to its `_config.yml` (out of scope for hub work).

**[DONE]** — audit complete, no hub-side changes required.

---




### W1. Repomix granular compression config — track upstream
**Priority:** Medium
**Source:** Fact-check audit (Feb 24), code-condense-whitepaper session
**Upstream:** [yamadashy/repomix #561](https://github.com/yamadashy/repomix/issues/561), [#516](https://github.com/yamadashy/repomix/issues/516)

Repomix `--compress` is currently all-or-nothing (`output.compress: boolean`). Granular controls (e.g., `keep_signatures`, `keep_interfaces`, `keep_docstrings`, per-directory compress patterns) are discussed upstream but not yet implemented. When upstream support lands, update `code-condense-whitepaper/repomix-command-line-cheat-sheet.md` with the actual config schema and remove the "Future Granularity" placeholder section.

**Effort:** Low (documentation update when upstream ships)

---

### CM1. Cross-source dedup weakness from 2-token model capture
**Priority:** Low
**Source:** `/code-review src/browser-collect.mjs` (this session) — residual of finding #2 fix
**File:** `car-market/scripts/src/browser-collect.mjs`, `src/rank-lib.mjs`

The headless collector's extractor captures the first two tokens after the make as `model`, so single-word nameplates absorb the trim (e.g. `Sentra SR`, `Sorento LX`). Multi-word nameplates ("Santa Cruz") are captured correctly, which was the point of the fix — but the tradeoff is that `rank-lib.mjs` `dedupeListings`/`sameVehicle`, which compare on normalized `model`, can miss a cross-source duplicate when one source emits `Sentra SR` and another emits `Sentra`. Kept consistent with `collect-lib.mjs parseTitle` (same 2-token behavior) rather than diverging. Consider a make+model normalization pass (strip trailing trim tokens against a known-trim list, or dedup on VIN when present) before ranking.

**Effort:** Low–Medium

**[DONE]** commit d8218e3 — `sameVehicle` now does VIN-first match then prefix-based model comparison (`ma.startsWith(mb + ' ')`) so "Sentra SR" deduplicates against "Sentra". Price/miles tolerances guard against false positives. Inline copy in `02-rank-listings.js` kept in sync.

---

### CM2. Stage-3 verification cannot reach CarMax/Carvana (WebFetch 403s)
**Priority:** Medium (blocks the "verified as valid" gate for these sources)
**Source:** `/code-review src/browser-collect.mjs` session — surfaced during CarMax/Carvana integration
**Files:** `car-market/scripts/03-verify-dedupe.js`, `src/browser-collect.mjs`

CarMax/Carvana listings are tagged `mustVerify` in stage 1, but stage 3 verifies URLs via WebFetch, which returns 403 on both domains — so their detail URLs currently bucket as `blocked` (unverifiable), not `live-match`. Per the "only include what can be verified as valid" rule they would be dropped. A browser-based verification path (reuse `browser-collect.mjs`'s stealth Chromium to open the detail URL and confirm a 200 + matching year/make/model in the title) is needed so these sources can actually contribute verified listings.

**Effort:** Medium

**[DONE]** — new `src/browser-verify.mjs` + `run-browser-verify.sh` open each listing's detail URL in the shared stealth Chromium (extracted to `src/browser-lib.mjs`, reused by the collector) and emit per-URL verdicts (`live-match`/`live-mismatch`/`dead`/`blocked`). Stage 3 (`03-verify-dedupe.js`) now accepts `args.preVerified`: listings with a browser verdict use it verbatim and skip the WebFetch agent. Verified end-to-end 2026-07: 4 real CarMax URLs (which `curl`/WebFetch 403) all returned `live-match` with matching prices; a retired stock id returned `dead`; stage-3 wiring consumes the verdicts with zero agent calls. Model matching tolerates the "…Fit in Austin, TX" location artifact in CarMax titles.

---

### CM3. Headless collector low yield (shallow scroll / no pagination)
**Priority:** Low
**Source:** `/code-review src/browser-collect.mjs` session
**File:** `car-market/scripts/src/browser-collect.mjs`

Per-run counts are modest (CarMax 6, Carvana 3, Cars.com 1) because the collector does a fixed 6-round scroll on page 1 only. For fuller coverage, add pagination (follow "next"/load-more) and/or price-ascending sort so in-band inventory front-loads, and make scroll depth scale with `--max-items`. Not a correctness bug — a coverage/tuning limitation.

**Effort:** Low–Medium

**[DONE]** commit d2a6bfe — `SCROLL_ROUNDS` now scales with `--max-items` (`max(6, ceil(items/4))`); `--pages 1–3` adds URL-based multi-page collection for CarMax and Cars.com (`&page=N`); Carvana (infinite-scroll) multiplies scroll rounds by PAGES on page 1 instead; Cars.com URL adds `&sort=list_price`; `scrollAndExtract` helper extracted; cross-page URL dedup added.

---

### CM4. Carvana geolocation-pin effect on grid unconfirmed (A/B blocked)
**Priority:** Low
**Source:** browser-collect geo/free-shipping/pin session (Jul 17)
**File:** `car-market/scripts/src/browser-collect.mjs`

The collector now pins `navigator.geolocation` to `--zip` coords (default 78702) and grants the geolocation permission — verified reading back exactly on a secure origin. But whether Carvana's *results grid* recomputes its "Free shipping" labels from that pin could not be confirmed: the Austin-vs-rural-Montana A/B probe tripped Carvana's Cloudflare bot-wall (403) after repeated loads before a clean comparison landed. Current behavior is documented honestly (README caveat: the pin is set correctly and matters for geolocation-reading sites, but on Carvana the free-shipping gate operates on whatever labels the grid renders, which is not proof of Austin-specific free delivery). To resolve: re-run the A/B with rotating IPs / longer backoff, or find a Carvana location cookie/param that localizes the grid. Related: CM2's browser-verify path could share the same stealth session.

**Effort:** Low–Medium

**Resources** (repro probes for re-running the investigation):
- `car-market/scripts/probes/probe-carvana-ab.mjs` — Austin-vs-Montana A/B of the free/fee shipping distribution on the grid under a geolocation override
- `car-market/scripts/probes/probe-carvana-ab2.mjs` — same A/B with HTTP-status + bot-wall capture (the run that hit the 403)
- `car-market/scripts/probes/probe-carvana-pin.mjs` — discovery probe: dumps Carvana location controls, cookies, and localStorage to find a persisted zip/location key

---

### CM5. Populate dealership rankings in `src/dealers.json`
**Priority:** Low
**Source:** local-dealer seed list follow-up (Jul 17)
**File:** `car-market/scripts/src/dealers.json`

Run a single WebSearch for Austin-metro used-car dealership rankings/reputation, then add a `rank` (or `ranking`) field and a `category`/quality value to each entry in `src/dealers.json` from the result, so the collector can prioritize higher-ranked dealers. One search only — synthesize the ordering from that single result set rather than fanning out per dealer. Keep it deterministic and cited (note the source in the file's `note`/a `rankingSource` field).

**Effort:** Low

---

### A14. `.badge-direct` text contrast — Done
**Priority:** Medium (accessibility)
**Source:** UI/UX audit (May 16) — important #3

**[DONE]** commit b87c412 — raised `.badge-direct` text to `#1d4ed8` for WCAG AA contrast

---

### A15. Leora form inputs: invisible focus ring — Done
**Priority:** Medium (accessibility — WCAG 2.4.7 / 1.4.11)
**Source:** UI/UX audit (May 16) — important #4

**[DONE]** commit 36cb209 — added `outline: 2px solid var(--leora-primary); outline-offset: 1px` to focus state

---

### A16. Leora dark mode: missing `:root` variable overrides — Done
**Priority:** Medium (dark mode coverage)
**Source:** UI/UX audit (May 16) — important #5

**[DONE]** commit 94d0bc9 — added `:root` dark mode override block to `leora-referral.css`

---

### A17. Tables inside `<section>` lack mobile padding — Done
**Priority:** Medium (responsive layout)
**Source:** UI/UX audit (May 16) — important #6

**[DONE]** commit 7e300bf — added `padding: var(--spacing-sm) var(--spacing-md)` to `.table-wrapper` in `report-base.css`

---

### A18. Small font sizes at 480px breakpoint — Done
**Priority:** Low (readability)
**Source:** UI/UX audit (May 16) — nice-to-have #7-8

**[DONE]** commit 0894cda — raised `--font-size-table-sm` to `0.85rem`, `--font-size-toggle` to `0.75rem`, `--font-size-milestone-label` to `0.75rem`

---

## Deferred (P3-P4)

---

### F6. Hub layout monotony
**Priority:** P4
**Source:** Bugfix plan item #12 (Feb 15)

`index.html` has 10 sections, most with only 1 card. Consider grouping related brands, visual hierarchy, or different card sizes.

**Effort:** High (design + implementation)

---


## Reference

### Completed Item Summary

See [CHANGELOG.md](CHANGELOG.md) for full details.

| Session | Items Completed |
|---------|----------------|
| Feb 13 — Readability Audit | C1-C3, H1-H4, M1-M6, L1-L4 (16 items) |
| Feb 13 — Translations | T2, T3, T4 (3 items) |
| Feb 14 — DRY Review | D1-D13 (13 items) |
| Feb 15 — Design Review S1 | #1-#10 (10 items) |
| Feb 15 — Design Review S2 | F1-F4 (4 items) |
| Feb 16 — OTEL Improvement Phase 2 | F8-F12 (5 items) |
| Feb 18 — Accessibility Audit | A1-A10 (10 items) |
| Mar 9 — CSS Refactor & Theme System | A12, A13, H10, H12, H13, H14, W4 (7 items) |
| Mar 9 — Backlog Implementer | A11, W2, W3, F5 (4 items) |
| Mar 9 — Backlog Implementer (2) | H11-P3-A, H11-P3-B (2 items) |
| Mar 9 — Backlog Implementer (3) | H11-P4, T1 (2 items) |
| Mar 9 — Backlog Implementer (4) | T5 (1 item) |
| Mar 9 — Backlog Implementer (5) | F7 (1 item) |
| May 16 — GA4 Tracking Audit | GA1, GA2, GA3, GA4, GA6 (5 items) |
| May 16 — Neural Networks & OTEL | NN1, NN2, NN3 (3 items) |
| May 16 — UI/UX Audit | GA5, A14, A15, A16, A17, A18 (6 items) |
| May 16 — Backlog Implementer | GA7 (1 item) |
| **Total** | **99 completed, 1 open (W1 upstream-blocked)** |

### Scorecard (Phase 2 — Feb 16)

All 12 directories at grade **A**. Baseline → Phase 1 → Phase 2 progression:

| Directory | Baseline | Phase 1 | Phase 2 | Dark Mode | Mobile | Tables | A11y |
|-----------|----------|---------|---------|-----------|--------|--------|------|
| `balloon-collective/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `capital_city/` | A | B | **A** | Pass | Pass | Pass | Pass |
| `edgar_nadyne/` | D | C | **A** | Pass | Pass | Pass | Pass |
| `holliday_lighting/` | C | C | **A** | Pass | Pass | Pass | Pass |
| `integrity-studio-ai/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `leora_research/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `ngo-market/` | D | D | **A** | Pass | Pass | Pass | Pass |
| `PerformanceTest/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `skelton-woody/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `sound-sight-tarot/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `trp-austin/` | D | B | **A** | Pass | Pass | Pass | Pass |
| `zoukmx/` | D | B | **A** | Pass | Pass | Pass | Pass |

### DRY Testing Checklist

- [x] All portal index pages render correctly
- [x] All report pages maintain brand theming
- [x] Competitor analysis tables display correctly
- [x] Dark mode switches properly on all pages
- [x] Responsive breakpoints work at 768px and 480px
- [x] Print styles maintain formatting
- [x] Leora referral form and dashboard still function
- [x] No visual regressions in badge styling
