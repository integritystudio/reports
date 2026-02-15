# Reports Hub

Centralized access to research, documentation, and project deliverables.

**Live site:** [integritystudio.io](https://integritystudio.io)

## Reports

| Client | Reports |
|--------|---------|
| AI Observability | [Report Suite](ai-observability/html/index.html) |
| The Balloon Collective | [Market Research](balloon-collective/the_balloon_collective_research.html) · [Austin Resources](balloon-collective/the_balloon_collective_austin_resources.html) |
| Capital City Village | [Operations Report](capital_city/index.html) |
| Edghar & Nadyne | [Portal](edgar_nadyne/index.html) · [Artist Profile](edgar_nadyne/edghar_nadyne_artist_profile.html) · [Austin Market](edgar_nadyne/austin_dance_market_analysis.html) · [Zouk Market](edgar_nadyne/brazilian_zouk_market_analysis.html) |
| Illumination Holiday Lighting | [Portal](holliday_lighting/index.html) · [Market Research](holliday_lighting/illumination_holiday_lighting_research.html) |
| Integrity Studio | [Marketing Plan](ngo-market/index.html) · [AI Research](integrity-studio-ai/integrity_studio_ai_research.html) |
| Leora Home Health | [Referral Program Portal](leora_research/index.html) |
| Skelton & Woody | [Portal](skelton-woody/index.html) |
| Sound Sight Tarot | [Market Analysis](sound-sight-tarot/sound_sight_tarot_research.html) |
| Texas Realty Partners | [Portal](trp-austin/index.html) · [Market Research](trp-austin/texas_realty_partners_research.html) · [Competitor Analysis](trp-austin/competitor-analysis.html) |
| ZoukMX | [Market Analysis](zoukmx/zoukmx_research.html) |

## CSS Architecture

Three base stylesheets plus a unified theme layer. Brand activation via `data-brand` attribute on `<html>`.

- `css/report-base.css` — Research and opportunity reports
- `css/portal-base.css` — Index/portal pages
- `css/competitor-base.css` — Competitor analysis pages
- `css/theme.css` — 13 brand palettes, dark mode, component overrides

See [docs/BRAND_THEME.md](docs/BRAND_THEME.md) for full reference.

## Local Development

```bash
python3 -m http.server 8000
```

## Deployment

Pushes to `main` auto-deploy via GitHub Actions to GitHub Pages at `integritystudio.io`.

## Docs

- [Brand Theme Reference](docs/BRAND_THEME.md)
- [Backlog](docs/BACKLOG.md)
- [Translation Status](docs/TRANSLATION_STATUS.md)
