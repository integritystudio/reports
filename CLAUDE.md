# ReportsHub

Static reports site at [integritystudio.io](https://integritystudio.io) via GitHub Pages. `index.html` links to HTML reports across project subdirectories.

## Structure

```
index.html                  # Hub landing (portal-base.css + theme.css)
├── ai-observability/html/  # AI observability reports (submodule)
├── balloon-collective/     # The Balloon Collective research + opportunities
├── capital_city/           # Capital City Village operations report
├── css/                    # Shared CSS (base files + theme.css)
├── docs/                   # Backlog, brand theme docs, translation status
├── edgar_nadyne/           # Edghar & Nadyne artist profiles + market analysis
├── holliday_lighting/      # Illumination Holiday Lighting research
├── integrity-studio-ai/    # Integrity Studio AI research reports
├── leora_research/         # Leora Home Health referral program
├── ngo-market/             # Integrity Studio marketing plan
├── PerformanceTest/        # Perf-optimized Leora variants
├── skelton-woody/          # Skelton & Woody PLLC legal market research
├── sound-sight-tarot/      # Sound Sight Tarot market analysis
├── trp-austin/             # Texas Realty Partners research + competitor analysis
└── zoukmx/                 # ZoukMX festival market analysis
```

## Submodules (do not edit in-place)

- `ai-news` — AI news feed
- `ai-observability/html` — AI observability report suite
- `calender-updates` — Calendar data
- `isabel_budenz/PersonalSite` — Personal site (Jekyll)
- `john_skelton` — John Skelton site

## CSS Architecture

Unified brand theme system. See [docs/BRAND_THEME.md](docs/BRAND_THEME.md) for full reference.

- **Base CSS**: `css/report-base.css`, `css/portal-base.css`, `css/competitor-base.css`
- **Theme**: `css/theme.css` — all brand palettes via `[data-brand="X"]` selectors
- **Component CSS**: `css/opportunity-components.css`, `css/leora-referral.css` (linked only by relevant pages)
- **Activation**: `<html lang="en" data-brand="client-name">` on every HTML file
- **Skip links**: `.skip-link` styles defined in all 3 base CSS files — HTML files should include `<a href="#main" class="skip-link">Skip to main content</a>` after `<body>`
- New reports: link base CSS + `css/theme.css`, set `data-brand` on `<html>`
- New clients: add full palette (portal + report vars) to `css/theme.css` including dark mode overrides, then create HTML files

## Guidelines

- `index.html` links `portal-base.css` + `theme.css`, no JS frameworks
- New reports: add HTML to a project subdirectory, then add a card to `index.html`
- Card format: `<a href="path/file.html" class="card">` with category badge, title, description
- Group cards by client/project under `<section>` with `.section-title`
- Responsive: CSS grid `auto-fit minmax(320px, 1fr)`, dark/light via `prefers-color-scheme`
- Do not modify submodule contents from this repo
- Report HTML links external CSS (base + theme.css), not inline styles

## Translations

- Translated reports use localized filenames (e.g., `analise_mercado_zouk.html` not `brazilian_zouk_market_analysis_pt-br.html`)
- Set `<html lang="pt-BR">` (or appropriate BCP-47 tag) on translated files
- Add a source-tracking comment after `<head>` in every translated file:
  ```html
  <!-- Source: original_filename.html | Lang: pt-BR -->
  ```
- Add a hub card for each translated report (see T3 in backlog for card format)

## Backlog

- Active backlog: [docs/BACKLOG.md](docs/BACKLOG.md)
- Brand theme reference: [docs/BRAND_THEME.md](docs/BRAND_THEME.md)
- Translation status: [docs/TRANSLATION_STATUS.md](docs/TRANSLATION_STATUS.md)

## Hosting

- GitHub Pages (Actions workflow) on `main` branch at `integritystudio.io`
- Local dev: `python3 -m http.server 8000`
