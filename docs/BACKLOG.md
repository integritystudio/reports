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

- [x] **A12.** Dark mode `--secondary` contrast for remaining brands — `balloon-collective: #f472b6`, `edgar-nadyne: #d4a0b8`, `zoukmx: #52b788` already added to dark mode block in theme.css (lines 1052–1092). All pass WCAG AA 4.5:1.

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

### H10. Refactor AI Observability detail pages into theme system
**Priority:** Medium (architecture consistency)
**Source:** CSS architecture audit (Mar 9)
**Files:**
- `ai-observability/ai-observability-business-analysis.html`
- `ai-observability/ai-observability-growth-plan.html`
- `ai-observability/ai-observability-market-research-2025.html`
- `ai-observability/ai-observability-product-strategy.html`
- `ai-observability/ai-observability-website-content.html`
- `ai-observability/ai-observability-marketing-materials.html`

Six AI Observability detail pages use completely custom styling with embedded `<style>` blocks and do not integrate with the theme system. They lack: `data-brand` attribute, CSS base link (report/portal/competitor-base.css), `theme.css` link, and skip-link. This creates maintenance overhead and prevents them from benefiting from global theme/accessibility fixes.

**Fix:** Add `data-brand="integrity-studio"` to html element, link `css/report-base.css` and `css/theme.css`, add skip-link, move embedded styles to external CSS, audit inline styles for WCAG AA contrast (4.5:1).

**Effort:** Medium (6 files, per-file migration + verification)

---

### H11. Extract inline styles from 50 report files
**Priority:** Medium (code quality, maintainability)
**Source:** CSS architecture audit (Mar 9)
**Files:** All report-level detail pages across 14 brand directories (50/64 HTML files)

Report detail pages (but not index pages) extensively use `style=` attributes for hardcoded colors, layout overrides, box styling, and typography emphasis. This violates the documented guideline "no inline styles" and prevents theme system updates from affecting these pages. Inline styles include `overflow-x:auto` (acceptable), hardcoded hex colors (should use CSS variables), and layout adjustments.

**Fix:** Audit inline styles by category; move layout/grid overrides to component CSS classes in `css/opportunity-components.css` or brand-specific layout files; replace hardcoded colors with CSS variable references (e.g., `style="color: #a8e6cf"` → `style="color: var(--accent)"`); update brand palettes if needed.

**Effort:** High (50 files, manual audit + remediation)

---

### H12. Move embedded <style> blocks to external CSS
**Priority:** Medium (maintainability)
**Source:** CSS architecture audit (Mar 9)
**Files:** 10 files with embedded styles:
- 6× AI Observability detail pages (covered by H10)
- `auto_refinance_rate_analysis.html`
- `capital_city/competitor-analysis.html`
- `integrity-studio-ai/competitor-analysis.html`
- `integrity-studio-ai/integrity_studio_ai_opportunities_report.html`

10 HTML files contain embedded `<style>` blocks (29–38 lines each in AI observability reports; 1–5 lines in others). Embedded styles are harder to maintain, cannot leverage CSS variables, and bypass the theme system.

**Fix:** Extract style blocks to external CSS files (create new files per report section or add to `css/opportunity-components.css`). Link externally. For AI Observability, this is part of H10 (theme system refactor).

**Effort:** Medium (4 files + H10 dependency)

---

### H13. Define missing CSS variables for generated reports
**Priority:** Low (cosmetic, fallback to browser defaults)
**Source:** CSS architecture audit (Mar 9)
**Files:** `ai-observability/` reports

AI Observability reports reference undefined CSS variables: `--light-blue`, `--primary-blue`, `--primary-teal` (not defined in theme.css). These fall back to browser defaults (color: unset), resulting in unstyled text. Primarily affects data visualization and styled callout boxes.

**Fix:** Add these 3 variables to theme.css `:root` block with sensible defaults, or update AI Observability reports to use existing brand variables (e.g., `--primary`, `--secondary`, `--accent`).

**Effort:** Low (3 variable definitions + audit)

---

### H14. Add report-base.css to ngo-market marketing plan
**Priority:** Low (consistency)
**Source:** CSS architecture audit (Mar 9)
**Files:** `ngo-market/integrity-studio-marketing-plan.html`

One file links custom `marketing-plan.css` instead of the standard CSS base architecture. It has `data-brand="ngo-market"` and `theme.css` but skips `report-base.css`. This works but is inconsistent with all other report pages.

**Fix:** Replace custom CSS setup with standard base CSS link. Verify custom layout still works; move any overrides to `css/opportunity-components.css` or merged into theme.css.

**Effort:** Low (single file, verify no regression)

---

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

- [x] **W4.** Stale star/version counts — added "as of Feb 2026" qualifier to all star counts in `repomix_to_condense_with_additional_integrations.md` and `zstd-condense-report.md`.

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
