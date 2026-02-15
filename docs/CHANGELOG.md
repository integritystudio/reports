# Reports Hub - Changelog

All completed backlog items, organized by session.

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
