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
| **Total** | **61 completed, 5 open** |

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
