# Reports Hub - Changelog

All completed backlog items, organized by session.

---

## March 9, 2026 — Backlog Implementer Session 2

Source: `docs/BACKLOG.md` item H11 (Phase 2)

| Item | Description | Commit |
|------|-------------|--------|
| H11 Phase 2 | Added 25 utility classes to `report-base.css` (spacing: `.mt-xs/sm/md/lg`, `.mb-sm/md`, `.p-sm/md`, `.pl-md`, `.nested-list`, `.nested-list-sm`, `.nested-list-xs`; color: `.bg-info`, `.bg-warning`, `.box-success`, `.box-warning`, `.color-success/warning/danger`, `.text-white/primary/muted/sm`; layout: `.hidden`, `.w-full`). Replaced 150+ inline styles across 37 HTML files. Extracted SWOT hardcoded hex colors in edgar_nadyne (6 files) to semantic classes. Fixed `nested-list+p-sm` padding conflict → `.nested-list-xs`. | `7f1847d`, `e054ddf` |

---

## March 9, 2026 — Backlog Implementer Session

Source: `docs/BACKLOG.md` items A11, W2, W3, F5

| Item | Description | Commit |
|------|-------------|--------|
| A11 | Report-level external links missing new-window indicator — strong_towns (61 links) — added `<span class="sr-only"> (opens in new tab)</span>` to all `target="_blank"` links in `alternative_governance_models.html` and `infrastructure_privatization_white_paper.html` | `bb6a293` |
| W2 | Whitepaper pipeline estimates replaced with empirical benchmarks — measured zstd compression ratios (3.73x, 5.31x, 5.90x) and combined pipeline reduction (4.1 MB source, 82-85% total) from actual repomix + zstd runs on reports repo | `5ec1cf7` |
| W3 | OTEL and SQL/KV whitepapers fact-checked; corrected 2 inaccuracies — OTLP gzip framing (clients may use any supported algorithm, not required) and PostgreSQL LZ4 compression label correction | `b56d54f` |
| F5 | Distinctive typefaces — DM Sans for portals/competitor, Source Serif 4 for reports — added Google Fonts import to theme.css; updated font-family vars in portal-base.css, report-base.css, competitor-base.css | `29dbb64` |

---

## March 9, 2026 — CSS Refactor & Theme System Migration

Source: `docs/BACKLOG.md` items A12, A13, H10, H12, H13, H14, W4

| Item | Description | Commit |
|------|-------------|--------|
| A12 | Dark mode `--secondary` contrast for remaining brands — `balloon-collective: #f472b6`, `edgar-nadyne: #d4a0b8`, `zoukmx: #52b788` added to dark mode block in theme.css | `cb1c131` |
| A13 | Legacy inline-style pages bypass theme system — all report pages now link `report-base.css`/`theme.css`; inline `<style>` block in `auto_refinance_rate_analysis.html` resolved by H12 | `934574d` |
| H10 | Refactor AI Observability detail pages into theme system — all 6 files: `data-brand="integrity-studio"`, skip-link, `report-base.css` + `theme.css` links, embedded `<style>` blocks extracted to per-file `.css` files | `4b9d3bb` |
| H12 | Move embedded `<style>` blocks to external CSS — all items complete: `capital_city/competitor-analysis.html`, `integrity-studio-ai/competitor-analysis.html`, `integrity-studio-ai/integrity_studio_ai_opportunities_report.html` (badge styles → theme.css); `auto_refinance_rate_analysis.html` (61 lines → `auto-refinance-components.css`); 6× AI Observability pages (→ H10) | `934574d` |
| H13 | Missing CSS variables for ai-observability — added `--primary-blue`, `--primary-teal`, `--light-blue`, `--light-teal` to `[data-brand="integrity-studio"]` in theme.css | `4b9d3bb` |
| H14 | Add report-base.css to ngo-market marketing plan — added `../css/report-base.css` link before `marketing-plan.css`; added `max-width: none; padding: 0; margin: 0` override to `.container` to prevent layout conflict with sidebar | `4b9d3bb` |
| W4 | Stale star/version counts — added "as of Feb 2026" qualifier to all star counts in `repomix_to_condense_with_additional_integrations.md` and `zstd-condense-report.md` | session |

---

## February 18, 2026 — Accessibility Audit Implementation

Source: `docs/BACKLOG.md` items A1-A10

| Item | Description |
|------|-------------|
| A1 | Skip link + `id="main"` added to `ai-observability/index.html` |
| A2 | `<div>` landmarks replaced with `<header>`, `<main>`, `<footer>` in `holliday_lighting/index.html` |
| A3 | `aria-hidden="true"` added to 10 decorative SVGs in `holliday_lighting/index.html` |
| A4 | Removed `a { outline: none; }` from `portal-base.css` (`:focus-visible` rule sufficient) |
| A5 | `lang="pt-BR"` added to Portuguese `<section>` in `edgar_nadyne/index.html` |
| A6 | `scroll-behavior: smooth` wrapped in `prefers-reduced-motion: no-preference` guard |
| A7 | Global `prefers-reduced-motion: reduce` block added to `portal-base.css` and `report-base.css` |
| A8 | `.sr-only` class defined; `(opens in new tab)` added to `target="_blank"` portal link |
| A9 | `aria-label="Site navigation"` added to `.back-nav` on 10 portals |
| A10 | `aria-label` (matching card title) added to 60+ card links across hub + 12 portals |

---

## February 16, 2026 — OTEL Improvement Phase 2

Source: `docs/BACKLOG.md` items F8-F12

| Item | Description |
|------|-------------|
| F8 | Standardize skip link target ID — all pages now use `id="main"` with `href="#main"` |
| F9 | Add skip links to remaining 11 HTML files — all pages now have skip-links |
| F10 | Standardize skip link text — all pages now use "Skip to main content" |
| F11 | Add responsive breakpoints to ngo-market marketing plan — now uses marketing-plan.css |
| F12 | Wrap bare tables with overflow-x container — 307 tables wrapped across 30 files |

---

## February 15, 2026 — Frontend Design Review (Session 2)

Source: `docs/BACKLOG.md` items F1-F4

| Item | Description | Commit |
|------|-------------|--------|
| F1 | Skip link HTML added to 20 portal/competitor pages | `b261a94` |
| F2 | `.source` color consolidated to report-base.css (removed theme.css duplicates) | `db9ee0e` |
| F3 | sound-sight-tarot portal dark vars (`--color-primary-dark/medium/light`) added | `c79260c` |
| F4 | CSS variable fallbacks on body + skip-link in all 3 base CSS files | `2e43357` |

---

## February 15, 2026 — Frontend Design Review (Session 1)

Source: `~/dev/active/bugfix-reports-2026-02-15/plan.md` items #1-#10

| Item | Priority | Description |
|------|----------|-------------|
| #1 | P0 | Skip link CSS added to portal-base.css and competitor-base.css |
| #2 | P0 | Low-contrast `.source` text fixed for WCAG AA — light #4a4a4a, dark #cccccc |
| #3 | P0 | Incomplete palettes filled for `ngo-market` and `hub` brands |
| #4 | P0 | `balloon-collective` duplicate `--color-primary-dark`/`--color-primary-medium` fixed |
| #5 | P1 | Card descriptions rewritten — Flesch RE improved from ~5.8 to ~45 |
| #6 | P1 | `integrity-studio` primary/secondary contrast improved (`--secondary` #16213e to #2a3f5f) |
| #7 | P2 | `ngo-market` dark mode overrides added |
| #8 | P2 | `edgar-nadyne` `.stat-item` dark mode fixed — no longer white background |
| #9 | P2 | `skelton-woody` dark mode palette + component overrides added |
| #10 | P2 | `sound-sight-tarot` dark mode palette + component overrides added |

---

## February 14, 2026 — CSS/HTML DRY Review

Source: `docs/BACKLOG.md` items D1-D13

| Item | Severity | Description | Impact |
|------|----------|-------------|--------|
| D1 | Critical | Holliday-lighting body/card/footer moved to theme.css brand overrides; capital_city analysis-layout.css uses unique scoped selectors — not true duplication | ~300 LOC |
| D2 | Critical | `--font-sans`, `--font-serif`, `--font-mono` standardized across 4 CSS files | 15-20 LOC |
| D3 | Critical | Duplicate color vars removed from analysis-layout.css | 25-30 LOC |
| D4 | Major | Reviewed: each base CSS defines intentionally different table designs — not copy-paste duplication | 0 (validated) |
| D5 | Major | Badge aliases consolidated in report-base.css | 20-30 LOC |
| D6 | Major | Breakpoints consistent (768px/480px) across all base CSS by design; documented in BRAND_THEME.md | 0 (validated) |
| D7 | Minor | Inline `grid-column` replaced with `.profile-item-full` class | 10-15 attrs |
| D8 | Minor | Duplicate dark mode rules removed for edgar-nadyne and sound-sight-tarot | 80-100 LOC |
| D9 | Minor | Unused `capital_city/report-style.css` deleted | 179 LOC |
| D10 | Minor | Spacing tokens (`--spacing-xs` through `--spacing-xl`) added to report-base.css and competitor-base.css | 0 (quality) |
| D11 | Optimization | theme.css link added to ngo-market marketing plan | 0 |
| D12 | Optimization | Leora form/dashboard components extracted to `css/leora-referral.css` (~340 lines) | perf |
| D13 | Optimization | Opportunity report components extracted to `css/opportunity-components.css` (~80 lines) | perf |

---

## February 13, 2026 — Readability Audit

Source: `docs/BACKLOG.md` items C1-C3, H1-H4, M1-M6, L1-L4

### Critical

| Item | Description |
|------|-------------|
| C1 | Dark mode added via report-base.css for all research template files; Leora/ngo-market already linked |
| C2 | Responsive breakpoints in report-base.css; Leora responsive in theme.css; ngo-market in marketing-plan.css |
| C3 | `overflow-x: auto` on `.section-content` in report-base.css |

### High

| Item | Description |
|------|-------------|
| H1 | Sidebar collapse in marketing-plan.css responsive breakpoint for ngo-market |
| H2 | Google Fonts import removed from holliday_lighting/index.html |
| H3 | trp-austin/competitor-analysis.html — competitor-base.css already light-first |
| H4 | Leora font sizes converted from px to rem in theme.css |

### Medium

| Item | Description |
|------|-------------|
| M1 | All research files use `<main class="container">` |
| M2 | `.source` updated to 0.9rem/#555 in report-base.css |
| M3 | Opacity replaced with explicit rgba colors for header meta text |
| M4 | Long paragraphs broken in balloon-collective and trp-austin executive summaries |
| M5 | `font-size: 1rem` on body in report-base.css |
| M6 | Inline grids replaced with `.two-col` class in edgar_nadyne files |

### Low

| Item | Description |
|------|-------------|
| L1 | Skip-to-content links added to 11 research template files |
| L2 | Print styles added to theme.css for Leora dashboard and form |
| L3 | Details/summary arrow already handled in report-base.css |
| L4 | CSS typo `--ink: #e4ebe f` fixed to `--ink: #e4ebef` in holliday_lighting |

---

## February 13, 2026 — Translations

Source: `docs/BACKLOG.md` items T2-T4

| Item | Description |
|------|-------------|
| T2 | Translation naming convention documented in CLAUDE.md; source-tracking comments added to 3 PT-BR files |
| T3 | PT-BR hub card added for Edghar & Nadyne section with Portuguese badge and localized links |
| T4 | `docs/TRANSLATION_STATUS.md` created with full translation matrix (3/19 = 15.8% PT-BR coverage) |
