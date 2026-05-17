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
