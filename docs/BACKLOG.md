# Reports Hub - Readability Audit Backlog

Audit conducted: February 13, 2026
Scope: All HTML reports excluding submodules (`ai-news`, `ai-observability/html`, `calender-updates`, `isabel_budenz/PersonalSite`, `john_skelton`)

---

## Files Audited (22 total)

### Template Families

| Template | Count | Files |
|----------|-------|-------|
| Research Report | 11 | balloon-collective (2), edgar_nadyne (3), holliday_lighting research (1), integrity-studio-ai (2), trp-austin research (1), zoukmx (1) |
| Capital City | 2 | capital_city/capital-city-village-analysis.html, capital_city/index.html |
| Leora Forms/Dashboard | 4 | leora_research/leora_referral_form.html, leora_research/leora_referral_dashboard.html, PerformanceTest/leora_referral_form.html, PerformanceTest/leora_referral_dashboard.html |
| Hub/Portal | 4 | index.html, holliday_lighting/index.html, leora_research/index.html, ngo-market/index.html |
| Unique (dark-first) | 1 | trp-austin/competitor-analysis.html |

### Reference Implementation

`capital_city/capital-city-village-analysis.html` is the gold standard in this repo. It includes:
- `prefers-color-scheme: dark` support
- Responsive breakpoints at 768px and 480px
- Table overflow wrappers (`.table-wrap { overflow-x: auto; }`)
- Print styles with `@media print`
- Explicit `font-size: 16px` on `body`
- Semantic `<nav>`, sticky navigation, proper heading hierarchy
- WCAG-friendly touch targets (44px minimum) on TOC links
- `<main>`-equivalent content wrapper

---

## Critical Issues

### C1. No dark mode on 14 of 22 files
**Status: Done** — Dark mode in report-base.css covers all research template files; Leora/ngo-market already link report-base.css + theme.css

**Impact:** Users navigating from the dark-mode hub (`index.html`) into a report get a jarring flash of bright white. System dark mode preference is ignored.

**Affected files:**
- `balloon-collective/the_balloon_collective_research.html`
- `balloon-collective/the_balloon_collective_austin_resources.html`
- `edgar_nadyne/austin_dance_market_analysis.html`
- `edgar_nadyne/brazilian_zouk_market_analysis.html`
- `edgar_nadyne/edghar_nadyne_artist_profile.html`
- `holliday_lighting/illumination_holiday_lighting_research.html`
- `integrity-studio-ai/integrity_studio_ai_research.html`
- `trp-austin/texas_realty_partners_research.html`
- `zoukmx/zoukmx_research.html`
- `leora_research/leora_referral_form.html`
- `leora_research/leora_referral_dashboard.html`
- `PerformanceTest/leora_referral_form.html`
- `PerformanceTest/leora_referral_dashboard.html`
- `ngo-market/index.html`

**Fix:** Add `@media (prefers-color-scheme: dark)` block to each file's `:root` with dark variants for `--light`, `--dark`, `--border`, `--primary`, and background/surface colors. The research template reports share nearly identical CSS variables, so a single dark-mode block can be adapted across all 9 research files with per-report color tweaks.

**Suggested dark palette for research template:**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --light: #1a1a2e;
    --dark: #e0e0e0;
    --border: #333;
  }
  body { background: #0f0f23; }
  section, .executive-summary { background: #1a1a2e; }
  th { background: #222; }
  tr:hover { background: #222; }
  .highlight-box { background: linear-gradient(135deg, #1a2a1a, #1a2a2a); }
  .warning-box { background: #2a2210; }
  .info-box { background: #1a1a2e; }
  blockquote { background: #1a1a2e; color: #aaa; }
  header { /* keep gradient, usually fine in dark mode */ }
}
```

**Effort:** Medium (template change applied to 9 research files + 4 Leora files + 1 ngo-market)

---

### C2. No mobile responsive breakpoints on 13 files
**Status: Done** — Responsive breakpoints in report-base.css; Leora responsive in theme.css; ngo-market in marketing-plan.css

**Impact:** Tables overflow the viewport on mobile. Text is readable due to the 900px max-width container, but tables, grids, and two-column layouts break on screens < 768px.

**Affected files:** All research template reports (9), all Leora forms/dashboards (4)

**Fix:** Add responsive breakpoints to the research template:
```css
@media (max-width: 768px) {
  header h1 { font-size: 1.6rem; }
  header .subtitle { font-size: 1rem; }
  .container { padding: 1rem; }
  .section-content { padding: 1rem; }
  section h2 { font-size: 1.1rem; padding: 0.75rem 1rem; }
  .contact-grid { grid-template-columns: 1fr; }
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  table { font-size: 0.85rem; }
  th, td { padding: 0.5rem; }
}

@media (max-width: 480px) {
  header h1 { font-size: 1.3rem; }
  header { padding: 2rem 1rem; }
  .stat-grid { grid-template-columns: 1fr; }
  table { font-size: 0.8rem; }
  th, td { padding: 0.4rem; }
}
```

For Leora forms/dashboards, add:
```css
@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .header h1 { font-size: 22px; }
  .form-content { padding: 20px; }
}
```

**Effort:** Medium (same breakpoints applied to 13 files)

---

### C3. Tables lack overflow-x wrappers on 18 files
**Status: Done** — `overflow-x: auto` on `.section-content` in report-base.css

**Impact:** On narrow viewports, wide tables extend past the viewport edge. Users cannot scroll to see right columns.

**Unaffected files:** `capital_city/capital-city-village-analysis.html` (uses `.table-wrap`), `trp-austin/competitor-analysis.html` (wide container mitigates), hub `index.html` (no tables), `leora_research/index.html` (no tables)

**Fix — CSS-only approach (no HTML changes):**
```css
.section-content { overflow-x: auto; }
```
Adding `overflow-x: auto` to the section content wrapper prevents table overflow without needing to wrap every `<table>` in a new div. This is a single-line fix per file.

**Fix — HTML approach (better):**
Wrap each `<table>` in `<div class="table-wrap">` and add:
```css
.table-wrap { overflow-x: auto; margin: 1rem 0; }
```

**Effort:** Low (CSS-only) or Medium (HTML wrapping)

---

## High Priority Issues

### H1. `ngo-market/index.html` - Fixed sidebar unusable on mobile
**Status: Done** — Sidebar collapse in marketing-plan.css responsive breakpoint

**Impact:** The sidebar uses `position: fixed; width: 320px;` with no responsive override. On screens < 768px, the sidebar consumes nearly half the viewport and the main content is clipped behind it.

**Fix:** Add a responsive breakpoint that collapses the sidebar:
```css
@media (max-width: 768px) {
  .sidebar {
    position: static;
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .container { display: block; }
  .main { margin-left: 0; padding: 16px; }
}
```

**Effort:** Low

---

### H2. `holliday_lighting/index.html` - External Google Fonts dependency
**Status: Done** — Google Fonts import already removed

**Impact:** Violates CLAUDE.md guideline: "index.html is self-contained: inline CSS, no external deps." The `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:...')` causes a render-blocking external request and will fail offline.

**Fix:** Either:
1. Remove the import and fall back to system fonts (e.g., `Georgia` for serif, `-apple-system` for sans) — cleanest solution
2. Inline the font-face declarations with base64-encoded woff2 data — heavier but preserves the design

**Recommended:** Option 1 — replace `var(--serif)` and `var(--sans)` fallbacks with system font stacks only.

**Effort:** Low

---

### H3. `trp-austin/competitor-analysis.html` - Dark-first design is inconsistent
**Status: Done** — competitor-base.css already light-first

**Impact:** This is the only report that defaults to dark theme with a `prefers-color-scheme: light` override. Every other file is light-first. Users on light mode see a dark report; users on dark mode see consistent styling, but navigating between this and `trp-austin/texas_realty_partners_research.html` (light-only) is visually jarring.

**Fix:** Invert the color scheme approach to match the rest of the repo:
1. Set light-mode colors as the `:root` defaults
2. Move current dark colors into `@media (prefers-color-scheme: dark)`

**Effort:** Medium (need to restructure the CSS variable declarations)

---

### H4. Leora forms/dashboards use px-based font sizing
**Status: Done** — Font sizes converted to rem in theme.css

**Impact:** Pixel-based sizes (`font-size: 14px`, `12px`, `36px`, `28px`) do not scale when users adjust their browser's default font size — an accessibility concern for vision-impaired users.

**Affected files:**
- `leora_research/leora_referral_form.html`
- `leora_research/leora_referral_dashboard.html`
- `PerformanceTest/leora_referral_form.html`
- `PerformanceTest/leora_referral_dashboard.html`

**Fix:** Convert px values to rem:
| Current | Replacement |
|---------|-------------|
| `12px` | `0.75rem` |
| `14px` | `0.875rem` |
| `16px` | `1rem` |
| `20px` | `1.25rem` |
| `28px` | `1.75rem` |
| `36px` | `2.25rem` |

**Effort:** Low per file

---

## Medium Priority Issues

### M1. No `<main>` element in research template reports (9 files)
**Status: Done** — All research files use `<main class="container">`

**Impact:** Screen readers cannot identify the primary content region. The hub (`index.html`) and Capital City reports use proper `<header>`, `<main>`, `<footer>` landmarks.

**Affected:** All 9 research template files use `<div class="container">` for body content.

**Fix:** Replace `<div class="container">` (the top-level content wrapper after `<header>`) with `<main class="container">`. No CSS changes needed since the selector `.container` still applies.

**Effort:** Very low (1-line change per file)

---

### M2. Small source citation text across research template
**Status: Done** — `.source` updated to 0.9rem/#555 in report-base.css

**Impact:** `.source { font-size: 0.85rem; color: #666; }` renders at ~13.6px. On the Sources & Citations sections (which are often long lists), this creates a wall of small text.

**Affected:** All 9 research template files

**Fix:** Increase to `0.9rem` (~14.4px) and darken color to `#555`:
```css
.source { font-size: 0.9rem; color: #555; font-style: italic; }
```

**Effort:** Very low

---

### M3. Header meta text uses opacity for contrast reduction
**Status: Done** — Opacity replaced with explicit rgba colors

**Impact:** `header .meta { opacity: 0.8; }` on white text over gradient backgrounds can push contrast below WCAG AA minimums (4.5:1 for normal text). Opacity-based contrast is unpredictable across different gradient colors.

**Affected:** All research template files (9) + holliday_lighting/index.html

**Fix:** Replace `opacity` with explicit color values:
```css
header .meta { color: rgba(255, 255, 255, 0.85); }
header .subtitle { color: rgba(255, 255, 255, 0.92); }
```
Or better, test the specific gradient midpoint and choose a color that guarantees 4.5:1.

**Effort:** Very low

---

### M4. Long unbroken executive summary paragraphs
**Status: Done** — Long paragraphs broken in balloon-collective and trp-austin

**Impact:** Several executive summaries are single paragraphs exceeding 80-100 words with dense data. Readers scanning for key takeaways struggle with the wall of text.

**Affected files:**
- `balloon-collective/the_balloon_collective_research.html` — single 130+ word paragraph
- `trp-austin/texas_realty_partners_research.html` — single 150+ word paragraph
- `integrity-studio-ai/integrity_studio_ai_research.html` — check length

**Fix:** Break into 2-3 shorter paragraphs grouped by theme (company overview, market context, key findings). Alternatively, add a bullet-point "key facts" summary box before the paragraph.

**Effort:** Low (content editing)

---

### M5. No explicit `body { font-size }` in research template
**Status: Done** — `font-size: 1rem` on body in report-base.css

**Impact:** Research template files omit `font-size` on `body`, relying on browser default (16px). While this works in practice, it's less reliable than an explicit declaration and creates inconsistency with Capital City (which sets `font-size: 16px`).

**Affected:** All 9 research template files

**Fix:** Add `font-size: 1rem;` (or `16px`) to the `body` rule.

**Effort:** Very low

---

### M6. Two-column grid layouts break on mobile without breakpoints
**Status: Done** — Inline grids replaced with .two-col class in 6 edgar_nadyne files

**Impact:** Several edgar_nadyne reports use inline `style="display: grid; grid-template-columns: 1fr 1fr;"` for SWOT analysis and comparison boxes. These don't collapse to single-column on mobile.

**Affected:**
- `edgar_nadyne/brazilian_zouk_market_analysis.html` (SWOT grid)
- `edgar_nadyne/austin_dance_market_analysis.html` (Why Austin grid)

**Fix:** Move inline grid styles to a CSS class with a responsive override:
```css
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
@media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }
```
Then replace `style="display: grid; grid-template-columns: 1fr 1fr; ..."` with `class="two-col"`.

**Effort:** Low

---

## Low Priority Issues

### L1. No skip-to-content links on any report
**Status: Done** — Skip-to-content links added to 11 research template files

**Impact:** Keyboard-only users must tab through the entire header/nav before reaching content. Low priority because most reports have minimal navigation elements.

**Fix:** Add before `<header>`:
```html
<a href="#main-content" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">Skip to content</a>
```
And `id="main-content"` on the main content container.

**Effort:** Very low per file

---

### L2. No `@media print` in Leora forms/dashboards
**Status: Done** — Print styles added to theme.css for both dashboard (white backgrounds, no shadows, hide interactive buttons, break-inside avoid) and form (white body, visible borders on inputs, hide submit button)

**Impact:** Printing forms or dashboards produces suboptimal output. Low priority since these are interactive prototypes.

**Effort:** Low

---

### L3. Details/summary custom arrow inconsistency
**Status: Done** — Already handled in report-base.css

**Impact:** The custom arrow (`\25B6` triangle) replaces the native disclosure triangle via `list-style: none` and `::before`. Some browsers may still show the native marker alongside the custom one. Minor visual issue.

**Fix:** Add `details summary::-webkit-details-marker { display: none; }` (already present in most files — verify consistency).

**Effort:** Very low

---

### L4. `holliday_lighting/index.html` dark mode has a CSS typo
**Status: Done** — CSS typo already fixed

Line 35 contains `--ink: #e4ebe f;` (space before `f`). This invalid color value will cause the variable to be ignored in dark mode.

**Fix:** Change to `--ink: #e4ebef;`

**Effort:** Trivial

---

## Translation & Localization

### T1. Create `content-translator` skill

**Impact:** Manual translation of HTML reports is error-prone and time-consuming. Three PT-BR translations already exist in `edgar_nadyne/` as manually created parallel files. A reusable skill would standardize the process and ensure structural parity between source and translated reports.

**Affected files:** All report HTML files (potential translation targets); `~/.claude/` (skill definition)

**Fix:** Build a `content-translator` skill with 5 phases:
1. **Source extraction** — Separate CSS/structure from translatable text content
2. **Translation** — Translate extracted text to target language
3. **Localization** — Adapt numbers, dates, and currency formats for target locale (e.g., `1,234.56` → `1.234,56` for PT-BR)
4. **Assembly** — Recombine translated text with original CSS/structure
5. **QA validation** — Verify line count parity, CSS identity (no style changes), `lang` attribute set correctly, no English fragments remaining

**Effort:** High

---

### T2. Translation file naming convention

**Impact:** The existing PT-BR translations use fully translated Portuguese filenames (e.g., `analise_mercado_zouk.html` not `brazilian_zouk_market_analysis_pt-br.html`). This convention is undocumented and could lead to inconsistency as more translations are added.

**Affected files:** `CLAUDE.md`, translated report files

**Fix:** Document the existing naming pattern in CLAUDE.md. Add a source-tracking comment convention to all translated files:
```html
<!-- Source: brazilian_zouk_market_analysis.html | Lang: pt-BR -->
```
This enables automated tooling to map translations back to their source files.

**Effort:** Low

---

### T3. Hub card generation for translations

**Impact:** Translated reports currently have no corresponding cards on `index.html`. Users cannot discover PT-BR versions from the hub.

**Affected files:** `index.html` (hub), translation workflow output

**Fix:** Auto-generate localized hub cards as part of the translation workflow:
- Add `(PT-BR)` category badge to translated cards
- Translate the card description to the target language
- Use localized link text (`Ver Relatório` instead of `View Report`)
- Group translated cards alongside their English originals in the same `<section>`

**Effort:** Medium

---

### T4. Translation completeness tracking

**Impact:** No visibility into which reports have been translated and which haven't. Currently 3 of 19 audited reports (15.8%) have PT-BR translations.

**Affected files:** `docs/TRANSLATION_STATUS.md` (new)

**Fix:** Create a translation status matrix showing coverage per language per report:

| Report | PT-BR | ES | FR |
|--------|-------|----|----|
| `edgar_nadyne/edghar_nadyne_artist_profile.html` | `edghar_nadyne_perfil_artista.html` | -- | -- |
| `edgar_nadyne/brazilian_zouk_market_analysis.html` | `analise_mercado_zouk.html` | -- | -- |
| `edgar_nadyne/austin_dance_market_analysis.html` | `analise_mercado_austin.html` | -- | -- |
| *(16 other reports)* | -- | -- | -- |

Update this document each time a translation is completed.

**Effort:** Low-Medium

---

### T5. Multi-language support beyond PT-BR

**Impact:** The T1 skill design must be extensible to languages beyond Portuguese. Number formats, date conventions, and currency symbols vary significantly across locales.

**Affected files:** `content-translator` skill locale configuration

**Fix:** Ensure the T1 design:
- Accepts a `--lang` parameter (e.g., `pt-BR`, `es-MX`, `fr-FR`)
- Externalizes locale-specific rules (number separators, date formats, currency symbols) into a configuration map
- Defines hub card grouping strategy for 3+ languages (per-section language tabs vs. separate translated sections)

**Effort:** Medium (deferred until T1 is validated with PT-BR)

---

## Suggested Implementation Order

### Phase 1: Quick wins (1 session, high impact)
1. **C3** — Add `overflow-x: auto` to `.section-content` in all research template files (prevents table overflow)
2. **M1** — Replace `<div class="container">` with `<main class="container">` in research files
3. **M2** — Bump `.source` font size to `0.9rem`, darken to `#555`
4. **M5** — Add `font-size: 1rem` to `body` in research template
5. **H2** — Remove Google Fonts import from `holliday_lighting/index.html`
6. **L4** — Fix `--ink` CSS typo in `holliday_lighting/index.html`

### Phase 2: Dark mode (1-2 sessions, highest user impact)
1. **C1** — Add dark mode to all 9 research template files (shared palette with per-report accent adjustments)
2. **C1** — Add dark mode to 4 Leora forms/dashboard files
3. **C1** — Add dark mode to `ngo-market/index.html`
4. **H3** — Invert `trp-austin/competitor-analysis.html` to light-first

### Phase 3: Mobile responsiveness (1-2 sessions)
1. **C2** — Add responsive breakpoints (768px, 480px) to all 9 research template files
2. **H1** — Fix `ngo-market/index.html` sidebar collapse on mobile
3. **H4** — Convert Leora files from px to rem
4. **M6** — Replace inline grid styles with responsive class in edgar_nadyne files
5. **C2** — Add responsive breakpoints to Leora forms/dashboards

### Phase 4: Content and polish
1. **M4** — Break up long executive summary paragraphs
2. **M3** — Replace opacity-based contrast with explicit colors
3. **L1** — Add skip-to-content links
4. **L2** — Add print styles to Leora files

### Phase 5: Translation & Localization tooling
1. **T1** — Create content-translator skill (prerequisite for T2-T5)
2. **T2** — Document file naming convention in CLAUDE.md
3. **T3** — Add hub card auto-generation to translation workflow
4. **T4** — Create translation status tracking document
5. **T5** — Design multi-language locale rules (deferred until T1 validated)

---

## Scorecard

| Directory | Dark Mode | Mobile | Tables | Accessibility | Translation | Overall |
|-----------|-----------|--------|--------|---------------|-------------|---------|
| `index.html` (hub) | Pass | Pass | N/A | Good | -- | **A** |
| `capital_city/` | Pass | Pass | Pass | Good | -- | **A** |
| `holliday_lighting/index.html` | Pass | Pass | N/A | Ext font dep | -- | **B+** |
| `holliday_lighting/` (reports) | Mixed | Mixed | Fail | Fair | -- | **C+** |
| `leora_research/index.html` | Pass | Pass | N/A | Good | -- | **A-** |
| `leora_research/` (forms) | Fail | Fail | N/A | px sizing | -- | **D+** |
| `balloon-collective/` | Fail | Fail | Fail | Fair | -- | **D** |
| `edgar_nadyne/` | Fail | Fail | Fail | Fair | 3/3 PT-BR | **D** |
| `integrity-studio-ai/` | Fail | Fail | Fail | Fair | -- | **D** |
| `trp-austin/` (research) | Fail | Fail | Fail | Fair | -- | **D** |
| `trp-austin/` (competitor) | Pass* | Partial | Pass | Good | -- | **B** |
| `zoukmx/` | Fail | Fail | Fail | Fair | -- | **D** |
| `ngo-market/` | Fail | Fail | N/A | Sidebar breaks | -- | **D-** |
| `PerformanceTest/` | Fail | Fail | N/A | px sizing | -- | **D+** |

*Pass with caveat: dark-first is inconsistent with repo convention

---
---

# CSS/HTML DRY Review Backlog

Audit conducted: February 14, 2026
Scope: All CSS and HTML files excluding submodules (`ai-news`, `ai-observability/html`, `calender-updates`, `isabel_budenz/PersonalSite`, `john_skelton`)
Files analyzed: 10 CSS files (~3,250 lines), 48 HTML files

**Estimated total reduction: 600-800 lines of CSS**

---

## Critical Issues

### D1. Duplicate portal layout systems (~300 LOC)
**Status: Done** — Holliday-lighting body/card/footer moved to theme.css brand overrides; portal-base variable mappings added with dark mode support. capital_city/analysis-layout.css uses unique scoped selectors (.doc-header, .nav-bar, .content) — not true duplication.

**Impact:** Two files redefine complete layout systems (body, typography, cards, nav) already in `portal-base.css` and `report-base.css`. Maintenance changes must be applied in 3+ places.

**Affected files:**
- `holliday_lighting/portal-layout.css` (359 lines)
- `capital_city/analysis-layout.css` (471 lines)

**Evidence:**

`holliday_lighting/portal-layout.css` lines 8-14:
```css
body {
    font-family: var(--sans);
    background: var(--surface);
    color: var(--ink);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
}
```

`portal-base.css` lines 49-55:
```css
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
    background-color: var(--color-bg);
    color: var(--color-text-primary);
    line-height: 1.6;
    transition: background-color 0.3s ease, color 0.3s ease;
}
```

**Fix:**
- Move Holliday Lighting's unique components (`.strand`, `.header-label`, `.context`, `.card-badge`) to `css/theme.css` under `[data-brand="holliday-lighting"]`
- Eliminate `holliday_lighting/portal-layout.css` entirely (~250 lines saved)
- Refactor `capital_city/analysis-layout.css` to only contain document-specific layout (`.doc-header`, `.nav-bar`, `.timeline`) — remove duplicated typography, table, and callout rules

**Effort:** High | **Reduction:** 300-350 lines

---

### D2. Font family duplication (6+ declarations)
**Status: Done** — --font-sans variable standardized across 4 CSS files

**Impact:** Font stacks are hardcoded inconsistently across 6+ files. Changing the brand font stack requires editing every file.

**Affected files:**
- `css/report-base.css` line 39 — `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif`
- `css/portal-base.css` line 50 — `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif`
- `css/competitor-base.css` line 42 — `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- `ngo-market/marketing-plan.css` line 20 — `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
- `capital_city/report-style.css` line 26 — `"Helvetica Neue", Helvetica, Arial, sans-serif`
- `holliday_lighting/portal-layout.css` line 111 — `--sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif`

**Fix:** Define standardized font variables in each base CSS `:root`:
```css
:root {
    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Roboto, sans-serif;
    --font-serif: Georgia, 'Times New Roman', serif;
    --font-mono: 'SF Mono', Monaco, 'Courier New', monospace;
}
```
Then replace all hardcoded stacks with `font-family: var(--font-sans);`.

**Effort:** Low | **Reduction:** 15-20 lines + consistency improvement

---

### D3. Hardcoded colors not using theme variables
**Status: Done** — Duplicate vars removed from analysis-layout.css

**Impact:** Color values duplicated between per-directory CSS and `css/theme.css`. Theme changes don't propagate.

**Affected files:**
- `capital_city/analysis-layout.css` lines 8-14 — re-declares `--color-star-filled`, `--color-star-empty`, `--color-recommended`, `--color-warning` already in `css/theme.css` lines 124-136 under `[data-brand="capital-city"]`
- `ngo-market/marketing-plan.css` lines 6-15 — defines its own `--primary`, `--bg`, `--text`, `--border` outside the theme system entirely

**Fix:**
- Remove duplicate variable declarations from `analysis-layout.css` lines 8-14
- Move `marketing-plan.css` color variables to `css/theme.css` under `[data-brand="ngo-market"]`
- Update `ngo-market/integrity-studio-marketing-plan.html` to link `css/theme.css`

**Effort:** Low | **Reduction:** 25-30 lines

---

## Major Issues

### D4. Duplicate table styling (~100 LOC across 4 files)
**Status: Done** — Reviewed: each base CSS (report, competitor, portal) defines intentionally different table designs (different padding, borders, backgrounds, font sizes). analysis-layout.css uses scoped `.content table` selectors. marketing-plan.css is a self-contained layout. These are template-appropriate designs, not copy-paste duplication.

**Impact:** Nearly identical `table`, `th`, `td`, `tr:hover` rules in 4 CSS files. Bug fixes or style updates must be applied 4 times.

**Affected files:**
- `css/report-base.css` lines 88-91
- `css/competitor-base.css` lines 125-144
- `capital_city/analysis-layout.css` lines 227-253
- `ngo-market/marketing-plan.css` lines 139-153

**Fix:** Consolidate into base CSS with shared defaults. Use brand overrides in `css/theme.css` for differences (e.g., competitor tables need `min-width`, `text-transform: uppercase` on headers).

**Effort:** Medium | **Reduction:** 50-70 lines

---

### D5. Duplicate badge system
**Status: Done** — Badge aliases consolidated in report-base.css

**Impact:** Badge color definitions repeated across 2 files with identical hex values. Multiple class names map to the same colors.

**Affected files:**
- `css/report-base.css` lines 130-144 — `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`, `.badge-verified`, `.badge-inferred`, `.badge-unverified`
- `css/theme.css` lines 320-326 — `.badge-high`, `.badge-medium`, `.badge-low`, `.badge-quick`, `.badge-longterm`

**Duplicates:** `.badge-verified` = `.badge-success` = `.badge-high` (`#d4edda`/`#155724`); `.badge-inferred` = `.badge-warning` = `.badge-medium` (`#fff3cd`/`#856404`); `.badge-unverified` = `.badge-danger` (`#f8d7da`/`#721c24`); `.badge-info` = `.badge-quick` (`#d1ecf1`/`#0c5460`)

**Fix:** Single badge definition in `css/report-base.css` using semantic names (`.badge-success`, `.badge-warning`, `.badge-info`, `.badge-danger`). Alias classes in `css/theme.css` only where needed.

**Effort:** Low | **Reduction:** 20-30 lines

---

### D6. Duplicate responsive breakpoints
**Status: Done** — Breakpoints are consistent (768px/480px) across all 3 base CSS files by design. Each file has its own component-specific responsive rules. Breakpoint strategy documented in docs/BRAND_THEME.md.

**Impact:** `768px` and `480px` media queries repeated across 4 base CSS files with overlapping rules for typography, spacing, and grid collapse.

**Affected files:**
- `css/report-base.css` lines 219-237
- `css/portal-base.css` lines 234-250
- `css/competitor-base.css` (similar breakpoints)
- `capital_city/analysis-layout.css` (own breakpoints)

**Fix:** Standardize responsive patterns per base CSS. Document breakpoint strategy in `docs/BRAND_THEME.md`.

**Effort:** Medium | **Reduction:** 30-40 lines

---

## Minor Issues

### D7. Inline styles in HTML files
**Status: Done** — Inline grid-column replaced with .profile-item-full class

**Impact:** Several HTML files use inline `style` attributes for layout that should be CSS classes.

**Affected files:**
- `balloon-collective/competitor-analysis.html` lines 57, 61 — `style="grid-column: 1 / -1;"`
- `balloon-collective/competitor-analysis.html` line 75 — `style="margin-bottom: 1rem;"`
- `balloon-collective/the_balloon_collective_austin_resources.html`
- `balloon-collective/the_balloon_collective_research.html`
- `capital_city/capital-city-village-analysis.html`

**Fix:** Add utility classes to `css/competitor-base.css`:
```css
.profile-item-full { grid-column: 1 / -1; }
```

**Effort:** Very low | **Reduction:** 10-15 inline attributes removed

---

### D8. Duplicate dark mode overrides (~80-100 LOC)
**Status: Done** — Duplicate dark mode rules removed for edgar-nadyne and sound-sight-tarot

**Impact:** `css/theme.css` lines 1062-1217 repeat identical dark mode rules for multiple brands (`background: #0f0f23`, `th { background: #222 }`, `tr:hover { background: #252535 }`).

**Fix:** Create a shared dark mode base block, then only override for brands with unique dark mode requirements:
```css
@media (prefers-color-scheme: dark) {
    body { background: #0f0f23; }
    section, .executive-summary { background: #1a1a2e; }
    th { background: #222; }
    tr:hover { background: #252535; }
    /* brand-specific exceptions only */
}
```

**Effort:** Medium | **Reduction:** 80-100 lines

---

### D9. Possibly unused `capital_city/report-style.css` (179 lines)
**Status: Done** — Unused report-style.css deleted

**Impact:** Print-specific CSS for a Pandoc/Markdown workflow. May not be referenced by any HTML file in the directory.

**Fix:** Verify if any HTML file links this CSS. If not, delete the file (179 lines). If yes, consolidate print rules into `analysis-layout.css`.

**Effort:** Very low | **Reduction:** 179 lines (if unused)

---

### D10. Inconsistent spacing token usage
**Status: Done** — Spacing tokens (--spacing-xs through --spacing-xl) and radius tokens added to report-base.css and competitor-base.css :root blocks, matching portal-base.css. Existing hardcoded values left in place to avoid visual regressions; new rules should use tokens.

**Impact:** `css/portal-base.css` defines `--spacing-xs` through `--spacing-xl` but other files use hardcoded `rem`/`px` values for the same spacing.

**Affected files:**
- `holliday_lighting/portal-layout.css` — `padding: 3.5rem 2rem 2.5rem`, `gap: 1.5rem`
- `capital_city/analysis-layout.css` — hardcoded spacing throughout
- `css/report-base.css` — no spacing tokens defined
- `css/competitor-base.css` — no spacing tokens defined

**Fix:** Define spacing tokens in all base CSS `:root` blocks. Update per-directory CSS to reference tokens.

**Effort:** Medium | **Reduction:** 0 (maintainability improvement)

---

## Optimization Opportunities

### D11. CSS file loading inconsistency
**Status: Done** — theme.css link added to ngo-market marketing plan

**Impact:** Not all HTML files link the unified theme system.

**Missing theme.css:**
- `ngo-market/integrity-studio-marketing-plan.html` — only links `marketing-plan.css`

**Fix:** Update to follow standard pattern:
```html
<link rel="stylesheet" href="../css/[base].css">
<link rel="stylesheet" href="../css/theme.css">
<link rel="stylesheet" href="[custom].css"> <!-- only if needed -->
```

**Effort:** Very low

---

### D12. Extract Leora form/dashboard components from theme.css

**Impact:** `css/theme.css` lines 408-601 (~200 lines) define form and dashboard components used exclusively by 3 Leora HTML pages.

**Fix:** Extract to `css/leora-referral.css`, link only from affected pages:
- `leora_research/leora_referral_dashboard.html`
- `leora_research/leora_referral_form.html`
- `PerformanceTest/leora_referral_*.html`

**Effort:** Low | **Impact:** Reduces theme.css from ~1,293 to ~1,100 lines

---

### D13. Extract opportunity report components from theme.css

**Impact:** `css/theme.css` lines 328-407 (~80 lines) define `.toc`, `.opp-card`, `.priority-summary` components used by only 2 brands.

**Fix:** Extract to `css/opportunity-components.css`, link only from affected pages.

**Effort:** Low | **Impact:** Reduces theme.css payload for non-opportunity pages

---

## DRY Review Summary Table

| Issue | Severity | Files | Est. LOC Reduction | Priority |
|-------|----------|-------|--------------------|----------|
| D1. Duplicate portal layouts | Critical | 2 | 300-350 | 1 |
| D2. Font family duplication | Critical | 6+ | 15-20 | 2 |
| D3. Hardcoded colors | Critical | 3 | 25-30 | 3 |
| D4. Duplicate table styling | Major | 4 | 50-70 | 4 |
| D5. Duplicate badge system | Major | 2 | 20-30 | 5 |
| D6. Duplicate breakpoints | Major | 4 | 30-40 | 6 |
| D7. Inline HTML styles | Minor | 4 | 10-15 attrs | 7 |
| D8. Duplicate dark mode | Minor | 1 | 80-100 | 8 |
| D9. Unused report-style.css | Minor | 1 | 179 | 9 |
| D10. Inconsistent spacing | Minor | 3 | 0 (quality) | 10 |
| D11. CSS loading inconsistency | Optimization | 1 | 0 | 11 |
| D12. Extract Leora components | Optimization | 1 | 0 (perf) | 12 |
| D13. Extract opportunity components | Optimization | 1 | 0 (perf) | 13 |

---

## DRY Implementation Phases

### Phase D1: Quick wins (low risk)
1. **D2** — Define `--font-sans`, `--font-serif`, `--font-mono` in base CSS `:root`, replace all hardcoded stacks
2. **D3** — Remove duplicate color vars from `analysis-layout.css`, migrate `marketing-plan.css` to theme system
3. **D9** — Verify and delete unused `capital_city/report-style.css`
4. **D7** — Replace inline styles with utility classes
5. **D11** — Fix CSS loading in `ngo-market/integrity-studio-marketing-plan.html`

### Phase D2: Consolidation (moderate risk)
1. **D4** — Consolidate table styling into base CSS with brand overrides
2. **D5** — Unify badge system in `report-base.css`
3. **D8** — Shared dark mode base, brand-specific exceptions only

### Phase D3: Layout refactor (higher risk)
1. **D1** — Eliminate `holliday_lighting/portal-layout.css`, move unique styles to `theme.css`
2. **D1** — Refactor `capital_city/analysis-layout.css` to document-specific layout only
3. **D12** — Extract Leora form/dashboard components to separate CSS file

### Phase D4: Polish
1. **D6** — Standardize responsive breakpoint patterns
2. **D10** — Implement spacing token system across all base CSS
3. **D13** — Extract opportunity report components to optional file

---

## Testing Checklist (DRY changes)

- [ ] All portal index pages render correctly (balloon-collective, capital-city, holliday-lighting)
- [ ] All report pages maintain brand theming (spot-check 2-3 per brand)
- [ ] Competitor analysis tables display correctly
- [ ] Dark mode switches properly on all pages
- [ ] Responsive breakpoints work at 768px and 480px
- [ ] Print styles maintain formatting
- [ ] Leora referral form and dashboard still function
- [ ] No visual regressions in badge styling
