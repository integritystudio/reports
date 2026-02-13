# UI Improvement — Remaining Items

Tracks unfinished backlog items from the 2026-02-13 readability audit. See `docs/BACKLOG.md` for full descriptions.

**Completed:** L4, H2, M5, M2, C3, M1, C1, H3, C2 (research templates only), R1, R2, H1 (pre-existing)

**In progress:** H4 (partially applied — forms done, `PerformanceTest/leora_referral_dashboard.html` remains)

---

## Phase 3: Mobile Responsiveness (partial)

### C2. Responsive breakpoints for Leora forms/dashboards
**Status:** Not started
**Files:**
- `leora_research/leora_referral_form.html`
- `leora_research/leora_referral_dashboard.html`
- `PerformanceTest/leora_referral_form.html`
- `PerformanceTest/leora_referral_dashboard.html`

**Fix:** Add `@media (max-width: 768px)` to collapse `.stats-grid` to single column, reduce header font size, and reduce form padding. Note: dashboard files already have a 768px breakpoint for stats-grid; forms have a 600px breakpoint that should be enhanced.

### H4. Leora forms/dashboards use px-based font sizing
**Status:** In progress
**Done:**
- `leora_research/leora_referral_form.html` — all px converted to rem
- `PerformanceTest/leora_referral_form.html` — all px converted to rem
- `leora_research/leora_referral_dashboard.html` — all px converted to rem

**Remaining:**
- `PerformanceTest/leora_referral_dashboard.html` — still uses px font sizes

**Mapping:** `11px→0.6875rem`, `12px→0.75rem`, `13px→0.8125rem`, `14px→0.875rem`, `16px→1rem`, `18px→1.125rem`, `20px→1.25rem`, `22px→1.375rem`, `28px→1.75rem`, `36px→2.25rem`, `64px→4rem`.

### M6. Inline grid layouts break on mobile (edgar_nadyne)
**Status:** Not started
**Files:**
- `edgar_nadyne/brazilian_zouk_market_analysis.html`
- `edgar_nadyne/austin_dance_market_analysis.html`
- `edgar_nadyne/edghar_nadyne_artist_profile.html`
- `edgar_nadyne/edghar_nadyne_perfil_artista.html`
- PT-BR counterparts: `analise_mercado_zouk.html`, `analise_mercado_austin.html`

**Fix:** Replace inline `style="display: grid; grid-template-columns: 1fr 1fr; ..."` with a CSS class:
```css
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
@media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }
```

---

## Phase 4: Content & Polish

### M4. Long unbroken executive summary paragraphs
**Status:** Not started
**Files:**
- `balloon-collective/the_balloon_collective_research.html` (130+ word paragraph)
- `trp-austin/texas_realty_partners_research.html` (150+ word paragraph)
- `integrity-studio-ai/integrity_studio_ai_research.html` (check length)

**Fix:** Break into 2-3 shorter paragraphs grouped by theme, or add a bullet-point "key facts" summary box.

### M3. Header meta text uses opacity for contrast
**Status:** Not started
**Files:** All 9 research template files + `holliday_lighting/index.html`
**Fix:** Replace `opacity: 0.8/0.9` with explicit `color: rgba(255,255,255,0.85)` / `rgba(255,255,255,0.92)` to guarantee WCAG AA 4.5:1 contrast.

### L1. No skip-to-content links
**Status:** Not started
**Files:** All report files (low priority — most have minimal navigation).
**Fix:** Add before `<header>`:
```html
<a href="#main-content" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">Skip to content</a>
```

### L2. No print styles in Leora forms/dashboards
**Status:** Not started
**Files:** Same 4 Leora files.
**Fix:** Add `@media print` block to hide gradient backgrounds, reset colors, and optimize for paper output.

### L3. Details/summary custom arrow inconsistency
**Status:** Not started
**Fix:** Add `details summary::-webkit-details-marker { display: none; }` where missing. Verify across all research template files.

---

## Code Review Findings (from Phase 2 review)

### R1. Source citation contrast fails WCAG AA in dark mode
**Status:** Completed (commit `ea0325e`)
**Files:** All 13 research template files with dark mode
**Fix applied:** Changed `.source { color: #999; }` to `color: #aaa;` (5.5:1 contrast vs previous 4.2:1).

### R2. Missing dark mode overrides in Leora forms
**Status:** Completed (commit `0ee0ade`)
**Files:** `leora_research/leora_referral_form.html`, `PerformanceTest/leora_referral_form.html`
**Fix applied:** Added `.bonus-info`, `.bonus-info h3`, `.bonus-info ul`, and `.checkbox-group` dark mode overrides.

---

## Phase 5: Translation & Localization (deferred)

Items T1-T5 are tooling/documentation tasks, not HTML fixes. See `docs/BACKLOG.md` for details.

| ID | Item | Status |
|----|------|--------|
| T1 | Create `content-translator` skill | Not started |
| T2 | Document file naming convention | Not started |
| T3 | Hub card generation for translations | Not started |
| T4 | Translation completeness tracking | Not started |
| T5 | Multi-language support beyond PT-BR | Deferred until T1 validated |
