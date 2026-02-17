# ReportsHub

Static reports site at [integritystudio.io](https://integritystudio.io) via GitHub Pages (`main` branch). `index.html` links to HTML reports across client subdirectories. Local dev: `python3 -m http.server 8000`

## Structure

`index.html` (hub landing) + client subdirectories (`balloon-collective/`, `capital_city/`, `edgar_nadyne/`, `holliday_lighting/`, `integrity-studio-ai/`, `leora_research/`, `micah_lindsey/`, `ngo-market/`, `PerformanceTest/`, `performance_testing/`, `skelton-woody/`, `sound-sight-tarot/`, `trp-austin/`, `zoukmx/`) + `ai-observability/`, `playground-tools/`, shared `css/` and `docs/`.

**Submodules (do not edit in-place)**: `ai-news`, `calender-updates`, `isabel_budenz/PersonalSite`, `john_skelton`, `micah_lindsey`

## CSS Architecture

Unified brand theme system. Full reference: [docs/BRAND_THEME.md](docs/BRAND_THEME.md)

- **Base**: `css/report-base.css`, `css/portal-base.css`, `css/competitor-base.css`
- **Theme**: `css/theme.css` — brand palettes via `[data-brand="X"]` selectors
- **Components**: `css/opportunity-components.css`, `css/leora-referral.css` (linked only by relevant pages)
- **Activation**: `<html lang="en" data-brand="client-name">` + `<a href="#main" class="skip-link">Skip to main content</a>` after `<body>`

## Guidelines

- New reports: add HTML to client subdir, link base CSS + `css/theme.css`, set `data-brand`, add card to `index.html`
- New clients: add full palette (portal + report vars) to `css/theme.css` including dark mode overrides
- Card format: `<a href="path/file.html" class="card">` with category badge, title, description; group under `<section>` with `.section-title`
- Responsive: CSS grid `auto-fit minmax(320px, 1fr)`, dark/light via `prefers-color-scheme`
- No JS frameworks, no inline styles, do not modify submodule contents

## Translations

- Localized filenames (e.g., `analise_mercado_zouk.html`), set `<html lang="pt-BR">` (BCP-47 tag)
- Add `<!-- Source: original_filename.html | Lang: pt-BR -->` after `<head>`
- Add hub card for each translated report

## Docs & Tools

- [docs/BACKLOG.md](docs/BACKLOG.md) | [docs/BRAND_THEME.md](docs/BRAND_THEME.md) | [docs/TRANSLATION_STATUS.md](docs/TRANSLATION_STATUS.md)
- Active tools: [~/.claude/.cache/active-tools-list.md](/Users/alyshialedlie/.claude/.cache/active-tools-list.md) | `/ls-tools` | `/ls-tools-all`
