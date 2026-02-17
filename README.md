# Reports Hub

Centralized access to research, documentation, and project deliverables.

**Live site:** [integritystudio.io](https://integritystudio.io)

## Reports

| Client | Reports |
|--------|---------|
| AI Observability | [Report Suite](ai-observability/html/index.html) |
| The Balloon Collective | [Portal](balloon-collective/index.html) · [Market Research](balloon-collective/the_balloon_collective_research.html) · [Austin Resources](balloon-collective/the_balloon_collective_austin_resources.html) · [Competitors](balloon-collective/competitor-analysis.html) |
| Capital City Village | [Portal](capital_city/index.html) · [Analysis](capital_city/capital-city-village-analysis.html) · [Competitors](capital_city/competitor-analysis.html) |
| Edghar & Nadyne | [Portal](edgar_nadyne/index.html) · [Artist Profile](edgar_nadyne/edghar_nadyne_artist_profile.html) · [Austin Market](edgar_nadyne/austin_dance_market_analysis.html) · [Zouk Market](edgar_nadyne/brazilian_zouk_market_analysis.html) · [Competitors](edgar_nadyne/competitor-analysis.html) · [Perfil (PT-BR)](edgar_nadyne/edghar_nadyne_perfil_artista.html) · [Zouk (PT-BR)](edgar_nadyne/analise_mercado_zouk.html) · [Austin (PT-BR)](edgar_nadyne/analise_mercado_austin.html) |
| Illumination Holiday Lighting | [Portal](holliday_lighting/index.html) · [Market Research](holliday_lighting/illumination_holiday_lighting_research.html) · [Opportunities](holliday_lighting/illumination_opportunities_report.html) · [Competitors](holliday_lighting/competitor-analysis.html) |
| Integrity Studio | [Marketing Plan](ngo-market/index.html) · [Marketing Plan Detail](ngo-market/integrity-studio-marketing-plan.html) · [Competitors](ngo-market/competitor-analysis.html) |
| Integrity Studio AI | [Portal](integrity-studio-ai/index.html) · [Research](integrity-studio-ai/integrity_studio_ai_research.html) · [Opportunities](integrity-studio-ai/integrity_studio_ai_opportunities_report.html) · [Competitors](integrity-studio-ai/competitor-analysis.html) |
| Leora Home Health | [Portal](leora_research/index.html) · [Referral Dashboard](leora_research/leora_referral_dashboard.html) · [Referral Form](leora_research/leora_referral_form.html) · [Competitors](leora_research/competitor-analysis.html) |
| Skelton & Woody | [Portal](skelton-woody/index.html) · [Research](skelton-woody/skelton_woody_research.html) · [Competitors](skelton-woody/competitor-analysis.html) · [Austin Resources](skelton-woody/skelton_woody_austin_resources.html) |
| Sound Sight Tarot | [Market Analysis](sound-sight-tarot/sound_sight_tarot_research.html) |
| Texas Realty Partners | [Portal](trp-austin/index.html) · [Market Research](trp-austin/texas_realty_partners_research.html) · [Competitors](trp-austin/competitor-analysis.html) |
| ZoukMX | [Portal](zoukmx/index.html) · [Market Analysis](zoukmx/zoukmx_research.html) |

## CSS Architecture

Three base stylesheets plus a unified theme layer. Brand activation via `data-brand` attribute on `<html>`.

- `css/report-base.css` — Research and opportunity reports
- `css/portal-base.css` — Index/portal pages
- `css/competitor-base.css` — Competitor analysis pages
- `css/theme.css` — 14 brand palettes, dark mode, component overrides

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
