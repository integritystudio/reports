# Reports Hub - Backlog

Open and deferred items. Completed items are in [CHANGELOG.md](CHANGELOG.md).

---

## Done: Accessibility Audit (Feb 18)

- [x] **A1.** Skip link and main landmark — ai-observability *(Critical, WCAG 2.4.1)*
- [x] **A2.** Semantic landmarks — holliday_lighting *(Critical, WCAG 1.3.1)*
- [x] **A3.** aria-hidden on decorative SVGs — holliday_lighting *(Critical, WCAG 1.1.1)*
- [x] **A4.** Remove global outline:none — portal-base.css *(Serious, WCAG 2.4.7)*
- [x] **A5.** lang="pt-BR" on Portuguese section — edgar_nadyne *(Serious, WCAG 3.1.2)*
- [x] **A6.** Smooth scroll reduced-motion guard *(Serious, WCAG 2.3.3)*
- [x] **A7.** Animation/transition reduced-motion guard *(Serious, WCAG 2.3.3)*
- [x] **A8.** New-window indicator + .sr-only utility *(Moderate, WCAG 3.2.5)*
- [x] **A9.** aria-label on nav elements — 10 portals *(Moderate, WCAG 1.3.1)*
- [x] **A10.** aria-label on card links — hub + 12 portals *(Moderate, WCAG 2.4.4)*

---

## Open: Accessibility (Remaining)

### A11. Report-level external links missing new-window indicator
**Priority:** Moderate (WCAG 3.2.5 best practice)
**Source:** Code review finding H1 (Feb 18)
**Files:** All `competitor-analysis.html` and `*_research.html` files

233 `target="_blank"` links in report-level HTML files lack `(opens in new tab)` sr-only text. The `.sr-only` class is defined in `portal-base.css` but not in `report-base.css` or `competitor-base.css`.

**Fix:** Add `.sr-only` to `report-base.css` and `competitor-base.css`, then add sr-only spans to report-level external links.

**Effort:** High (233 links across ~30 files)

---

### A12. Dark mode `--secondary` contrast for remaining brands
**Priority:** Moderate (WCAG 1.4.3)
**Source:** Contrast readability audit (Feb 20)
**Files:** `css/theme.css` dark mode section

Brands without dark-mode `--secondary` overrides may fail WCAG AA (4.5:1) for links and h3 text on dark section backgrounds (`#1a1a2e`):
- `balloon-collective`: `#c44569` → 3.58:1
- `edgar-nadyne`: `#A0456E` → ~4.0:1
- `zoukmx`: `#2d6a4f` → ~3.3:1
- `performancetest`: no `--secondary` defined (inherits base `#0f766e` which gets dark override `#14b8a6` — OK)
- `trp-austin`: `#2b6cb0` → 3.16:1 (mitigated by explicit dark CSS rules for `a` and `h3` targeting `#63b3ed`)

**Fix:** Add `--secondary` dark-mode overrides in the `@media (prefers-color-scheme: dark)` block of `theme.css` for balloon-collective, edgar-nadyne, and zoukmx. TRP-Austin is partially mitigated.

**Effort:** Low (3 variable additions)

---

### A13. Legacy inline-style pages bypass theme system contrast fixes
**Priority:** Moderate (WCAG 1.4.3)
**Source:** Contrast readability audit (Feb 20)
**Files:** `ai-observability/ai-observability-product-strategy.html`, `capital_city/competitor-analysis.html`, and other pages using inline `<style>` blocks

Several report pages use hardcoded inline CSS instead of the external `report-base.css` + `theme.css` system. These pages do not benefit from the contrast fixes applied in this session and may still have sub-4.5:1 text/background ratios.

**Fix:** Migrate inline-style pages to the external CSS architecture (add `data-brand`, link base + theme CSS, remove inline `<style>` blocks). Audit migrated colors for AA compliance.

**Effort:** Medium (per-page migration + verification)

---

## Open: Medium Priority

### T1. Create `content-translator` skill
**Priority:** Medium
**Source:** Readability audit (Feb 13)

Build a reusable skill for translating HTML reports with 5 phases: source extraction, translation, localization, assembly, QA validation.

**Effort:** High

---

### T5. Multi-language support beyond PT-BR
**Priority:** Medium
**Source:** Readability audit (Feb 13)

Ensure T1 skill accepts `--lang` parameter and externalizes locale-specific rules. Deferred until T1 is validated with PT-BR.

**Effort:** Medium

---

### W2. Whitepaper pipeline estimates lack empirical benchmarks
**Priority:** Medium
**Source:** OTEL session quality report (Feb 24), hallucination score 0.18
**Files:** `code-condense-whitepaper/repomix_to_condense_with_additional_integrations.md` (lines 48–77), `code-condense-whitepaper/README.md` (key-findings table)

The "Combined Pipeline Numbers" table (10 MB source tree → repomix → zstd) and the "Estimated zstd ratios on repomix output" table are modeled projections, not empirical measurements. The README key-findings table propagates these estimates. Should be validated by running actual benchmarks on a representative polyglot repo (e.g., this reports repo or repomix's own codebase).

**Fix:** Run `repomix` on a real repo, measure token counts at each stage, compress with `zstd -1/-9/--ultra -22`, record actual sizes, and replace modeled estimates with measured data. Update README table to match.

**Effort:** Medium (scripting + measurement + writeup)

---

### W3. OTEL and SQL/KV whitepaper documents not quality-evaluated
**Priority:** Medium
**Source:** OTEL session quality report (Feb 24)
**Files:** `code-condense-whitepaper/otel_telemetry_data_compression.md`, `code-condense-whitepaper/sql_kv_data_compression.md`

These two documents were produced by background research agents and were not included in the LLM-as-Judge evaluation (only 5 of 7 files were scored). They should be fact-checked for the same hallucination patterns found in the other documents: unsourced benchmark numbers, invented configuration schemas, and overreaching claims.

**Fix:** Run `/otel-session-summary` targeting these files specifically, or manually verify key claims (ClickHouse codec ratios, RocksDB per-level config, OTel Arrow bandwidth reduction, PostgreSQL TOAST LZ4 benchmarks) against primary sources.

**Effort:** Medium (verification pass)

---

### W4. Stale star/version counts in whitepaper documents
**Priority:** Low
**Source:** OTEL session quality report (Feb 24)
**Files:** `code-condense-whitepaper/repomix_to_condense_with_additional_integrations.md`, `code-condense-whitepaper/zstd-condense-report.md`

GitHub star counts (repomix 22.1k, zstd 26.7k, ast-grep 12.6k) and version numbers (zstd v1.5.7, ast-grep v0.41.0) are point-in-time snapshots from Feb 24, 2026. These will drift over time.

**Fix:** Either remove specific counts or add a "as of Feb 2026" qualifier. Low priority — informational only.

**Effort:** Low

---

### W1. Repomix granular compression config — track upstream
**Priority:** Medium
**Source:** Fact-check audit (Feb 24), code-condense-whitepaper session
**Upstream:** [yamadashy/repomix #561](https://github.com/yamadashy/repomix/issues/561), [#516](https://github.com/yamadashy/repomix/issues/516)

Repomix `--compress` is currently all-or-nothing (`output.compress: boolean`). Granular controls (e.g., `keep_signatures`, `keep_interfaces`, `keep_docstrings`, per-directory compress patterns) are discussed upstream but not yet implemented. When upstream support lands, update `code-condense-whitepaper/repomix-command-line-cheat-sheet.md` with the actual config schema and remove the "Future Granularity" placeholder section.

**Effort:** Low (documentation update when upstream ships)

---

## Deferred (P3-P4)

### F5. Distinctive typefaces per content type
**Priority:** P3
**Source:** Bugfix plan item #11 (Feb 15)

All base CSS files use the same generic system font stack. Consider DM Sans for portals, Source Serif Pro for reports. Related to completed D2 (variable consolidation); this is about introducing new typefaces.

**Effort:** Medium

---

### F6. Hub layout monotony
**Priority:** P4
**Source:** Bugfix plan item #12 (Feb 15)

`index.html` has 10 sections, most with only 1 card. Consider grouping related brands, visual hierarchy, or different card sizes.

**Effort:** High (design + implementation)

---

### F7. CSS variable namespace consolidation
**Priority:** P4
**Source:** Bugfix plan item #13 (Feb 15)

Four parallel CSS variable namespaces:
- Portal: `--color-primary-dark`, `--color-primary-medium`, `--color-primary-light`
- Report: `--primary`, `--secondary`, `--accent`, `--light`, `--dark`, `--border`
- Competitor: `--bg`, `--surface`, `--text`, `--accent`, `--accent2`
- Holliday-lighting: `--surface`, `--ink`, `--glow`, custom tokens

Unifying would reduce cognitive overhead but risks breaking existing pages.

**Effort:** High (cross-cutting refactor with regression risk)

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
| **Total** | **61 completed, 7 open** |

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
