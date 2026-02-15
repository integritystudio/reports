# Brand Theme System

Unified CSS theme architecture for all report and portal pages. Single source of truth for client brand palettes, shared components, and dark mode.

## Architecture

```
<html lang="en" data-brand="client-name">
  <link rel="stylesheet" href="../css/[report|portal|competitor]-base.css">
  <link rel="stylesheet" href="../css/theme.css">
  <!-- optional per-page layout -->
  <link rel="stylesheet" href="portal-layout.css">
```

**Three layers:**

| Layer | File | Purpose |
|-------|------|---------|
| Base | `css/report-base.css` | Report page structure, sections, tables, collapsible details |
| Base | `css/portal-base.css` | Portal/index page structure, card grid, back-nav, footer |
| Base | `css/competitor-base.css` | Competitor analysis layout, comparison tables, SWOT |
| Theme | `css/theme.css` | All brand palettes, shared components, dark mode, responsive |
| Layout | `*/portal-layout.css` | Page-specific unique layout (only where needed) |

## Brands

Each brand is activated by a `data-brand` attribute on `<html>`. The attribute value maps to `[data-brand="X"]` selectors in `css/theme.css`.

| Brand Slug | Directory | Palette |
|------------|-----------|---------|
| `hub` | root `index.html` | Blue (#1d4ed8) |
| `skelton-woody` | `skelton-woody/` | Navy (#1a365d, #2b6cb0) |
| `balloon-collective` | `balloon-collective/` | Purple (#4a2c6e, #7b4b94, #c9a96e) |
| `edgar-nadyne` | `edgar_nadyne/` | Maroon (#5c1a1a, #8b3a3a, #c19a6b) |
| `trp-austin` | `trp-austin/` | Navy/Blue (#1a365d, #2b6cb0, #4299e1) |
| `holliday-lighting` | `holliday_lighting/` | Teal (#1a5f7a, #159895, #57c5b6) |
| `ngo-market` | `ngo-market/` | Blue (#2563eb, #1d4ed8, #3b82f6) |
| `capital-city` | `capital_city/` | Navy (#1a365d, #2b6cb0, #90cdf4) |
| `sound-sight-tarot` | `sound-sight-tarot/` | Purple/Gold (#4a2c6e, #7b4b94, #c9a96e) |
| `performancetest` | `PerformanceTest/` | Green (#0d6e3f, #10a760, #5fd4a0) |
| `integrity-studio` | `integrity-studio-ai/` | Dark/Red (#1a1a2e, #e94560, #0f3460) |
| `zoukmx` | `zoukmx/` | Rose/Green (#9d174d, #be185d, #1b4332) |
| `leora` | `leora_research/` | Teal (#0d9488, #14b8a6, #5eead4) |

## Variable Namespaces

Base CSS files use different variable sets. Theme.css sets both for each brand.

**Portal pages** (portal-base.css):
```css
--color-primary-dark    /* h1, headings */
--color-primary-medium  /* links, accents, card borders */
--color-primary-light   /* hover states */
--color-bg, --color-bg-secondary, --color-text-primary, --color-text-secondary
--color-border, --color-card-bg
```

**Report pages** (report-base.css):
```css
--primary    /* section headers, links */
--secondary  /* subheadings, accents */
--accent     /* highlights, borders */
--light      /* backgrounds */
--dark       /* body text */
--border     /* table/section borders */
```

**Competitor pages** (competitor-base.css):
```css
--bg, --surface, --text, --muted, --accent, --accent2
--green, --amber, --cyan, --border
```

## Adding a New Brand

1. Add palette variables to `css/theme.css` under section 1 (Brand Palettes):
   ```css
   [data-brand="new-client"] {
       --color-primary-dark: #...;
       --color-primary-medium: #...;
       --color-primary-light: #...;
       --primary: #...;
       --secondary: #...;
       --accent: #...;
   }
   ```

2. Add dark mode overrides in section 10 if the palette needs adjustment.

3. Set `data-brand` on `<html>` in every HTML file for that client:
   ```html
   <html lang="en" data-brand="new-client">
   ```

4. Link the base CSS + theme.css:
   ```html
   <link rel="stylesheet" href="../css/report-base.css">
   <link rel="stylesheet" href="../css/theme.css">
   ```

5. If the client needs unique page layouts (beyond what base CSS provides), create a per-directory layout file (e.g., `new_client/portal-layout.css`) and link it after theme.css.

## Shared Components in theme.css

These components are defined once and available to any brand:

- **Badge system** (section 4): `.badge-*` variants for competitor analysis, priority, status
- **Opportunity cards** (section 5): `.opp-card`, `.priority-summary`, `.action-box`, `.toc` (opportunity TOC)
- **Dashboard** (section 6): `.dashboard`, `.stats-grid`, `.stat-card`, `.referral-card`, `.milestone-tracker`
- **Form** (section 7): `body.form-page`, `.form-content`, `.submit-btn`, `.bonus-info`, `.checkbox-group`
- **Portal components** (section 8): brand-specific portal extras (leora sticky-header, capital-city hero/stat-row)
- **Report components** (section 9): brand-specific report extras (edgar-nadyne testimonial, balloon-collective timeline)

## Extracted Component Files

Component CSS extracted from theme.css for pages that need them. Load after theme.css.

| File | Used By | Purpose |
|------|---------|---------|
| `css/leora-referral.css` | `leora_research/leora_referral_*.html`, `PerformanceTest/leora_referral_*.html` | Dashboard, form, status badges, milestone tracker (+ dark/responsive/print) |
| `css/opportunity-components.css` | `holliday_lighting/illumination_opportunities_report.html` | TOC, opp-cards, priority summary, action box (+ dark/responsive/print) |

## Extracted Layout Files

Two pages have unique layouts that don't fit in base CSS or theme.css:

| File | Used By | Purpose |
|------|---------|---------|
| `holliday_lighting/portal-layout.css` | `holliday_lighting/index.html` | Light strand border, serif header, glow cards, context brief |
| `capital_city/analysis-layout.css` | `capital_city/capital-city-village-analysis.html` | Doc-header, sticky nav-bar, TOC, callouts, timeline, glossary |

These load after theme.css and use CSS variables from the brand palette.

## Standalone Files (Not in Theme System)

| File | Purpose |
|------|---------|
| `ngo-market/marketing-plan.css` | Sidebar doc layout for marketing plan (self-contained) |

## Responsive Breakpoints

Each base CSS defines responsive rules for its own components at standardized breakpoints:

| Breakpoint | Usage |
|-----------|-------|
| `768px` | Primary mobile breakpoint — single-column cards, smaller headings, reduced padding |
| `480px` | Small mobile — further typography/spacing reductions |
| `640px` | Holliday-lighting portal, integrity-studio opportunity grid (custom layouts) |
| `600px` | Form pages — reduced padding |
| `1024px` | NGO marketing plan sidebar narrowing |

Base CSS breakpoints (768px, 480px) are consistent across `report-base.css`, `portal-base.css`, and `competitor-base.css`. Brand-specific responsive overrides are in `theme.css` section 11.

## Dark Mode

Dark mode activates via `@media (prefers-color-scheme: dark)` in theme.css section 10. Each brand has dark palette overrides where needed. Base CSS files also have their own dark mode defaults.

## Generating Reports with Skills

The `/market-analysis`, `/growth-strategy`, and `/opportunity-analysis` skills generate HTML reports for this system. When generating new reports:

- Use the brand's palette from theme.css (do not inline CSS color definitions)
- Set `data-brand` on the `<html>` tag
- Link `report-base.css` + `theme.css` (not inline styles)
- Use shared components (badges, opp-cards, action-cards) from theme.css
- For a new client, add a brand palette to theme.css first
