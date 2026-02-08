# ReportsHub

Static reports site served via GitHub Pages. Landing page at `index.html` links to HTML reports across project subdirectories.

## Structure

```
index.html                  # Hub landing page (self-contained, inline CSS)
├── ai-observability/html/  # AI observability reports (submodule)
├── holliday_lighting/      # Illumination Holiday Lighting research
├── leora_research/         # Leora Home Health referral form + dashboard
├── marketing-plan/         # Integrity Studio marketing plan
├── PerformanceTest/        # Perf-optimized Leora variants
└── capital_city/           # Capital city report
```

## Submodules (do not edit in-place)

- `ai-news` - AI news feed
- `ai-observability/html` - AI observability report suite
- `calender-updates` - Calendar data
- `isabel_budenz/PersonalSite` - Personal site (Jekyll)
- `john_skelton` - John Skelton site

## Guidelines

- `index.html` is self-contained: inline CSS, no external deps, no JS frameworks
- New reports: add HTML to a project subdirectory, then add a card to `index.html`
- Card format: `<a href="path/file.html" class="card">` with category badge, title, description
- Group cards by client/project under `<section>` with `.section-title`
- Responsive: CSS grid with `auto-fit minmax(320px, 1fr)`, dark/light via `prefers-color-scheme`
- Do not modify submodule contents from this repo
- Keep report HTML files self-contained (inline styles preferred)

## Hosting

- GitHub Pages on `main` branch
- Local dev: `python3 -m http.server 8000`
