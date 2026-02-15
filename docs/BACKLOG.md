# Reports Hub - Backlog

Open and deferred items. Completed items are in [CHANGELOG.md](CHANGELOG.md).

---

## Open: High Priority

### F8. Standardize skip link target ID across all pages
**Priority:** High
**Source:** Final review finding H1 (Feb 15)

Research/report pages use `id="main-content"` with `href="#main-content"`, while portal/competitor pages use `id="main"` with `href="#main"`. Standardize on `id="main"` site-wide.

**Effort:** Low

---

### F9. Add skip links to remaining 12 HTML files
**Priority:** High
**Source:** Final review finding H2 (Feb 15)

F1 covered 20 portal/competitor pages. Still missing:
- 3 PT-BR translations (edgar_nadyne/)
- 2 competitor analyses (integrity-studio-ai/, capital_city/)
- 2 opportunities reports
- 1 marketing plan (ngo-market/)
- 4 dashboard/form pages (leora_research/, PerformanceTest/)

**Effort:** Low (mechanical)

---

## Open: Medium Priority

### F10. Standardize skip link text to "Skip to main content"
**Priority:** Medium
**Source:** Final review finding H3 (Feb 15)

Pre-existing research pages use "Skip to content" while newer pages use "Skip to main content". Standardize all to "Skip to main content".

**Effort:** Low

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
| **Total** | **46 items** |

### Scorecard (Feb 13 baseline)

| Directory | Dark Mode | Mobile | Tables | Accessibility | Translation | Overall |
|-----------|-----------|--------|--------|---------------|-------------|---------|
| `index.html` (hub) | Pass | Pass | N/A | Good | -- | **A** |
| `capital_city/` | Pass | Pass | Pass | Good | -- | **A** |
| `holliday_lighting/index.html` | Pass | Pass | N/A | Good | -- | **A-** |
| `holliday_lighting/` (reports) | Pass | Pass | Pass | Good | -- | **B+** |
| `leora_research/index.html` | Pass | Pass | N/A | Good | -- | **A-** |
| `leora_research/` (forms) | Pass | Pass | N/A | Good | -- | **B+** |
| `balloon-collective/` | Pass | Pass | Pass | Good | -- | **B+** |
| `edgar_nadyne/` | Pass | Pass | Pass | Good | 3/3 PT-BR | **B+** |
| `integrity-studio-ai/` | Pass | Pass | Pass | Good | -- | **B+** |
| `trp-austin/` | Pass | Pass | Pass | Good | -- | **B+** |
| `zoukmx/` | Pass | Pass | Pass | Good | -- | **B+** |
| `ngo-market/` | Pass | Pass | N/A | Good | -- | **B** |
| `PerformanceTest/` | Pass | Pass | N/A | Good | -- | **B+** |
| `skelton-woody/` | Pass | Pass | N/A | Good | -- | **B+** |

### DRY Testing Checklist

- [x] All portal index pages render correctly
- [x] All report pages maintain brand theming
- [x] Competitor analysis tables display correctly
- [x] Dark mode switches properly on all pages
- [x] Responsive breakpoints work at 768px and 480px
- [x] Print styles maintain formatting
- [x] Leora referral form and dashboard still function
- [x] No visual regressions in badge styling
