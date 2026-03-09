# Reports Hub - Backlog

Open and deferred items. Completed items are in [CHANGELOG.md](CHANGELOG.md).

---

## Open: Medium Priority

---

### H11. Extract inline styles from 50 report files (Phase 2 done)
**Priority:** Medium (code quality, maintainability)
**Source:** CSS architecture audit (Mar 9)
**Phase 1 (Mar 9):** Extended `section h2, #toc h2` CSS selector; removed nav#toc and h2 redundant inline styles (29 instances); replaced `color: white` with `color: var(--color-white)` (11 files). ~290 inline styles remain (was ~367, excluding overflow-x:auto).
**Phase 2 (Mar 9):** Added 24 utility classes to `report-base.css` (`.mt-xs`, `.mt-sm`, `.mt-md`, `.mb-sm`, `.p-md`, `.nested-list`, `.nested-list-sm`, `.box-success`, `.box-warning`, `.color-success`, `.color-warning`, `.color-danger`, etc.). Replaced 150+ inline styles across 37 files. Extracted hardcoded SWOT hex colors (#d4edda, #fff3cd, #155724, #856404, #721c24) to semantic CSS classes in edgar_nadyne files.

**Phase 3 (Mar 9):** Added `--spacing-swot-gap`, `--spacing-list-sm` tokens and `.text-accent`, `.mt-detail`, `.mb-swot`, `.mb-swot` utilities. Extracted 30 more inline styles from 6 edgar_nadyne files (SWOT margins, label spacing, accent link colors).

**Remaining (~70 inline styles):** Table column widths (`width: 5%/15%/35%` etc.), JS-toggled `display:none`, per-brand hex colors on SWOT opportunity/recommendation headings (#004085, #4a1a6b, #6B2D5B), and `margin-top: 5px` px-unit values.

**Effort:** Medium (table widths need layout-specific handling; px values need px→rem decision)

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

### W1. Repomix granular compression config — track upstream
**Priority:** Medium
**Source:** Fact-check audit (Feb 24), code-condense-whitepaper session
**Upstream:** [yamadashy/repomix #561](https://github.com/yamadashy/repomix/issues/561), [#516](https://github.com/yamadashy/repomix/issues/516)

Repomix `--compress` is currently all-or-nothing (`output.compress: boolean`). Granular controls (e.g., `keep_signatures`, `keep_interfaces`, `keep_docstrings`, per-directory compress patterns) are discussed upstream but not yet implemented. When upstream support lands, update `code-condense-whitepaper/repomix-command-line-cheat-sheet.md` with the actual config schema and remove the "Future Granularity" placeholder section.

**Effort:** Low (documentation update when upstream ships)

---

## Deferred (P3-P4)

---

### ~~H11-P3-A. Replace `.nested-list-sm` magic number with CSS variable~~ [Done — df295d8]

---

### ~~H11-P3-B. Complete SWOT color extraction in edgar_nadyne~~ [Done — 30423e4]

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
| Mar 9 — CSS Refactor & Theme System | A12, A13, H10, H12, H13, H14, W4 (7 items) |
| Mar 9 — Backlog Implementer | A11, W2, W3, F5 (4 items) |
| Mar 9 — Backlog Implementer (2) | H11-P3-A, H11-P3-B (2 items) |
| **Total** | **74 completed, 3 open** |

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
