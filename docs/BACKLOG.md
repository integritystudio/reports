# Reports Hub - Backlog

Open and deferred items. Completed items are in [CHANGELOG.md](CHANGELOG.md).

---

## Open: Medium Priority

---

### H11. Extract inline styles from 50 report files — Done (Phase 4)
**Priority:** Medium (code quality, maintainability)
**Source:** CSS architecture audit (Mar 9)
**Phase 1 (Mar 9):** Extended `section h2, #toc h2` CSS selector; removed nav#toc and h2 redundant inline styles (29 instances); replaced `color: white` with `color: var(--color-white)` (11 files). ~290 inline styles remain (was ~367, excluding overflow-x:auto).
**Phase 2 (Mar 9):** Added 24 utility classes to `report-base.css`. Replaced 150+ inline styles across 37 files. Extracted hardcoded SWOT hex colors to semantic CSS classes in edgar_nadyne files.
**Phase 3 (Mar 9):** Added spacing tokens and SWOT utilities. Extracted 30 more inline styles from 6 edgar_nadyne files.
**Phase 4 (Mar 9):** Added `--color-swot-opportunity` token to edgar-nadyne brand and `.color-swot-opportunity` utility (with dark mode override). Replaced `#4a1a6b`/`#6B2D5B` heading colors in artist profile files with `.color-swot-opportunity`/`.text-primary`. Replaced `margin-top: 5px` with `.mt-xs` in leora dashboards. Remaining: table column widths and `overflow-x:auto` wrappers intentionally left as-is (layout-critical, not extractable to shared utilities).

**[DONE]**

---

### T1. Create `content-translator` skill — Done
**Priority:** Medium
**Source:** Readability audit (Feb 13)

Built `~/.claude/skills/content-translator/SKILL.md` — 5-phase workflow: source extraction, translation, localization, assembly, QA validation. Handles BCP-47 lang tags, source-tracking comments, skip-link translation, hub card and TRANSLATION_STATUS.md updates. Invoke via `/content-translator <file.html> --lang <BCP-47>`.

**[DONE]**

---

### T5. Multi-language support beyond PT-BR — Done
**Priority:** Medium
**Source:** Readability audit (Feb 13)

Added locale conventions table (19 BCP-47 tags: pt-BR, pt-PT, es, es-MX, es-ES, fr, fr-CA, de, he, it, ja, zh-CN, zh-TW, ko, ar, nl, pl, sv, tr) to `content-translator` SKILL.md. Covers date formats, decimal separators, currency symbols, quote marks, and RTL handling (ar, he). Replaces two ad-hoc inline bullet points with a structured, extensible reference table. Phase 3 localization table also updated with per-locale examples.

**[DONE]**

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

### F6. Hub layout monotony
**Priority:** P4
**Source:** Bugfix plan item #12 (Feb 15)

`index.html` has 10 sections, most with only 1 card. Consider grouping related brands, visual hierarchy, or different card sizes.

**Effort:** High (design + implementation)

---

### F7. CSS variable namespace consolidation — Done
**Priority:** P4
**Source:** Bugfix plan item #13 (Feb 15)

Added ASCII namespace reference table to `theme.css` documenting all four parallel namespaces (portal-base, report-base, competitor-base, holliday portal-layout). Added `--color-*` bridge aliases to `report-base.css` and `competitor-base.css` so cross-namespace utilities can reference a consistent `--color-*` convention without renaming any existing variables. Portal-base needs no bridge (already uses `--color-*` natively). `--color-surface` intentionally scoped to competitor-base only (card surface concept vs. page background in report-base). Zero regression risk — purely additive.

**[DONE]**

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
| **Total** | **80 completed, 0 open** |

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
