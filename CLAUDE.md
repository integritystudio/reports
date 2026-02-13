# ReportsHub

Static reports site at [integritystudio.io](https://integritystudio.io) via GitHub Pages. `index.html` links to HTML reports across project subdirectories.

## Structure

```
index.html                  # Hub landing (self-contained, inline CSS)
├── ai-observability/html/  # AI observability reports (submodule)
├── balloon-collective/     # The Balloon Collective research + opportunities
├── capital_city/           # Capital City Village operations report
├── holliday_lighting/      # Illumination Holiday Lighting research
├── leora_research/         # Leora Home Health referral program
├── ngo-market/             # Integrity Studio marketing plan
├── PerformanceTest/        # Perf-optimized Leora variants
└── trp-austin/             # Texas Realty Partners research + competitor analysis
```

## Submodules (do not edit in-place)

- `ai-news` — AI news feed
- `ai-observability/html` — AI observability report suite
- `calender-updates` — Calendar data
- `isabel_budenz/PersonalSite` — Personal site (Jekyll)
- `john_skelton` — John Skelton site

## Guidelines

- `index.html` is self-contained: inline CSS, no external deps, no JS frameworks
- New reports: add HTML to a project subdirectory, then add a card to `index.html`
- Card format: `<a href="path/file.html" class="card">` with category badge, title, description
- Group cards by client/project under `<section>` with `.section-title`
- Responsive: CSS grid `auto-fit minmax(320px, 1fr)`, dark/light via `prefers-color-scheme`
- Do not modify submodule contents from this repo
- Keep report HTML files self-contained (inline styles preferred)

## Hosting

- GitHub Pages (Actions workflow) on `main` branch at `integritystudio.io`
- Local dev: `python3 -m http.server 8000`
