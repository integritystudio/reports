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

**Impact:** Violates CLAUDE.md guideline: "index.html is self-contained: inline CSS, no external deps." The `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:...')` causes a render-blocking external request and will fail offline.

**Fix:** Either:
1. Remove the import and fall back to system fonts (e.g., `Georgia` for serif, `-apple-system` for sans) — cleanest solution
2. Inline the font-face declarations with base64-encoded woff2 data — heavier but preserves the design

**Recommended:** Option 1 — replace `var(--serif)` and `var(--sans)` fallbacks with system font stacks only.

**Effort:** Low

---

### H3. `trp-austin/competitor-analysis.html` - Dark-first design is inconsistent

**Impact:** This is the only report that defaults to dark theme with a `prefers-color-scheme: light` override. Every other file is light-first. Users on light mode see a dark report; users on dark mode see consistent styling, but navigating between this and `trp-austin/texas_realty_partners_research.html` (light-only) is visually jarring.

**Fix:** Invert the color scheme approach to match the rest of the repo:
1. Set light-mode colors as the `:root` defaults
2. Move current dark colors into `@media (prefers-color-scheme: dark)`

**Effort:** Medium (need to restructure the CSS variable declarations)

---

### H4. Leora forms/dashboards use px-based font sizing

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

**Impact:** Screen readers cannot identify the primary content region. The hub (`index.html`) and Capital City reports use proper `<header>`, `<main>`, `<footer>` landmarks.

**Affected:** All 9 research template files use `<div class="container">` for body content.

**Fix:** Replace `<div class="container">` (the top-level content wrapper after `<header>`) with `<main class="container">`. No CSS changes needed since the selector `.container` still applies.

**Effort:** Very low (1-line change per file)

---

### M2. Small source citation text across research template

**Impact:** `.source { font-size: 0.85rem; color: #666; }` renders at ~13.6px. On the Sources & Citations sections (which are often long lists), this creates a wall of small text.

**Affected:** All 9 research template files

**Fix:** Increase to `0.9rem` (~14.4px) and darken color to `#555`:
```css
.source { font-size: 0.9rem; color: #555; font-style: italic; }
```

**Effort:** Very low

---

### M3. Header meta text uses opacity for contrast reduction

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

**Impact:** Several executive summaries are single paragraphs exceeding 80-100 words with dense data. Readers scanning for key takeaways struggle with the wall of text.

**Affected files:**
- `balloon-collective/the_balloon_collective_research.html` — single 130+ word paragraph
- `trp-austin/texas_realty_partners_research.html` — single 150+ word paragraph
- `integrity-studio-ai/integrity_studio_ai_research.html` — check length

**Fix:** Break into 2-3 shorter paragraphs grouped by theme (company overview, market context, key findings). Alternatively, add a bullet-point "key facts" summary box before the paragraph.

**Effort:** Low (content editing)

---

### M5. No explicit `body { font-size }` in research template

**Impact:** Research template files omit `font-size` on `body`, relying on browser default (16px). While this works in practice, it's less reliable than an explicit declaration and creates inconsistency with Capital City (which sets `font-size: 16px`).

**Affected:** All 9 research template files

**Fix:** Add `font-size: 1rem;` (or `16px`) to the `body` rule.

**Effort:** Very low

---

### M6. Two-column grid layouts break on mobile without breakpoints

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

**Impact:** Keyboard-only users must tab through the entire header/nav before reaching content. Low priority because most reports have minimal navigation elements.

**Fix:** Add before `<header>`:
```html
<a href="#main-content" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">Skip to content</a>
```
And `id="main-content"` on the main content container.

**Effort:** Very low per file

---

### L2. No `@media print` in Leora forms/dashboards

**Impact:** Printing forms or dashboards produces suboptimal output. Low priority since these are interactive prototypes.

**Effort:** Low

---

### L3. Details/summary custom arrow inconsistency

**Impact:** The custom arrow (`\25B6` triangle) replaces the native disclosure triangle via `list-style: none` and `::before`. Some browsers may still show the native marker alongside the custom one. Minor visual issue.

**Fix:** Add `details summary::-webkit-details-marker { display: none; }` (already present in most files — verify consistency).

**Effort:** Very low

---

### L4. `holliday_lighting/index.html` dark mode has a CSS typo

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
