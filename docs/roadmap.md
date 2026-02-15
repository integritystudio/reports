# UI & Brand Theme Roadmap

Findings from frontend design review of brand theme system and hub readability (2026-02-14).

## P0 — Accessibility & Correctness

- [x] **Add skip links** to `portal-base.css` and `competitor-base.css` (CSS added; HTML markup still needed — see backlog F1)
- [x] **Audit low-contrast text** — `.source` bumped to `#4a4a4a` (light) / `#cccccc` (dark) for WCAG AA
- [x] **Fill incomplete palettes** — `ngo-market` and `hub` now have full portal + report variable sets
- [x] **Fix identical values** — `balloon-collective` `--color-primary-medium` changed to `#8b5cf6`

## P1 — Readability

- [x] **Rewrite card descriptions** — Flesch RE improved from ~5.8 to ~45 (grade 10-12). Shortened to ~15-word outcome-focused sentences
- [x] **Improve `integrity-studio` contrast** — `--secondary` changed from `#16213e` to `#2a3f5f`

## P2 — Dark Mode Gaps

- [x] **`skelton-woody`** — added dark palette vars + info-box/warning-box overrides
- [x] **`sound-sight-tarot`** — added dark palette vars + info-box/rating overrides (portal vars still needed — see backlog F3)
- [x] **`ngo-market`** — added full dark palette and component overrides
- [x] **`edgar-nadyne`** — `.stat-item` dark mode fixed to use `#1a1a2e` surface instead of white

## P3 — Typography

- [ ] **Replace generic font stack** — all three base files use identical `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Roboto, sans-serif`. Introduce at least one distinctive typeface:
  - Portals: `DM Sans`, `Plus Jakarta Sans`, or similar geometric sans
  - Reports: `Libre Baskerville`, `Source Serif Pro`, or similar editorial serif
- [ ] **Leverage existing tokens** — `holliday-lighting` already defines `--serif` / `--sans`; extend this pattern to other brands

## P4 — Layout & Visual Variety

- [ ] **Hub index monotony** — 10 sections with 1 card each creates visual repetition. Options:
  - Group related clients into multi-card rows
  - Add visual separators or section-level accent colors
  - Use a denser card layout for single-report clients
- [ ] **Consolidate variable namespaces** — portal vars (`--color-primary-*`), report vars (`--primary`/`--secondary`), competitor vars (`--bg`/`--surface`), and custom vars (`--ink`/`--glow`) create 4 parallel systems. Consider unifying in a future major pass

## Reference

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Flesch Reading Ease (card text) | 5.8 | ~45 | 40-50 |
| Brands with complete palettes | 7/13 | 9/13 | 13/13 |
| Brands with dark mode coverage | 8/13 | 12/13 | 13/13 |
| Base files with skip links (CSS) | 1/3 | 3/3 | 3/3 |
| HTML files with skip link markup | 0 | 0 | all |

See [docs/BACKLOG.md](BACKLOG.md) for remaining items (F1-F7).
