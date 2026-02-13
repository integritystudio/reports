# UI Improvement — Remaining Items

Tracks unfinished backlog items from the 2026-02-13 readability audit. See `docs/BACKLOG.md` for full descriptions.

**Completed:** L4, H2, M5, M2, C3, M1, C1, H3, C2 (research templates only)

---

## Phase 3: Mobile Responsiveness (partial)

### C2. Responsive breakpoints for Leora forms/dashboards
**Status:** Not started
**Files:**
- `leora_research/leora_referral_form.html`
- `leora_research/leora_referral_dashboard.html`
- `PerformanceTest/leora_referral_form.html`
- `PerformanceTest/leora_referral_dashboard.html`

**Fix:** Add `@media (max-width: 768px)` to collapse `.stats-grid` to single column, reduce header font size, and reduce form padding.

### H1. ngo-market sidebar — already resolved
**Status:** Pre-existing fix found during implementation. The file already has `@media (max-width: 768px)` collapsing the sidebar to `position: relative; width: 100%`. No action needed.

### H4. Leora forms/dashboards use px-based font sizing
**Status:** Not started
**Files:** Same 4 Leora files as C2 above.
**Fix:** Convert px values to rem: `12px→0.75rem`, `14px→0.875rem`, `16px→1rem`, `20px→1.25rem`, `28px→1.75rem`, `36px→2.25rem`.

### M6. Inline grid layouts break on mobile (edgar_nadyne)
**Status:** Not started
**Files:**
- `edgar_nadyne/brazilian_zouk_market_analysis.html`
- `edgar_nadyne/austin_dance_market_analysis.html`
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
**Priority:** High
**Files:** All 13 research template files with dark mode
**Issue:** `.source { color: #999; }` against `#1a1a2e` background = 4.2:1 (needs 4.5:1).
**Fix:** Change to `color: #aaa;` (5.5:1 contrast).

### R2. Missing dark mode overrides in Leora forms
**Priority:** Medium
**Files:** `leora_research/leora_referral_form.html`, `PerformanceTest/leora_referral_form.html`
**Issue:** `.bonus-info` (light green background) and `.checkbox-group` (#f8f9fa) lack dark mode overrides.
**Fix:**
```css
.bonus-info { background: #1a2e1a; border-color: #34d399; }
.bonus-info h3 { color: #34d399; }
.checkbox-group { background: #252540; }
```

---

## Phase 5: Translation & Localization (deferred)

Items T1–T5 are tooling/documentation tasks, not HTML fixes. See `docs/BACKLOG.md` for details.

| ID | Item | Status |
|----|------|--------|
| T1 | Create `content-translator` skill | Not started |
| T2 | Document file naming convention | Not started |
| T3 | Hub card generation for translations | Not started |
| T4 | Translation completeness tracking | Not started |
| T5 | Multi-language support beyond PT-BR | Deferred until T1 validated |
