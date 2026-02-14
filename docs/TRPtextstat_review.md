# TRP Research Report - Readability Review

**File:** `trp-austin/texas_realty_partners_research.html`
**URL:** https://integritystudio.io/trp-austin/texas_realty_partners_research.html
**Date:** 2026-02-13

## Visual Contrast Audit

### Light Mode

All color pairings pass WCAG AA (4.5:1 minimum). No issues found.

### Dark Mode - Issues Found & Fixed

Root cause: `--primary` (#1a365d) and `--secondary` (#2b6cb0) were never overridden in the dark media query but used as text colors on dark backgrounds.

| Element | Before | Ratio | After | Ratio |
|---|---|---|---|---|
| `.executive-summary h2` | `#1a365d` on `#1a1a2e` | ~1.2:1 | `#90cdf4` | ~8.5:1 |
| `th` (table headers) | `#1a365d` on `#222` | ~1.3:1 | `#90cdf4` | ~8.5:1 |
| `section h3` | `#2b6cb0` on `#1a1a2e` | ~3.5:1 | `#63b3ed` | ~6.8:1 |
| `a` (links) | `#2b6cb0` on `#1a1a2e` | ~3.5:1 | `#63b3ed` | ~6.8:1 |
| `details summary` | `#1a365d` on `#1a1a2e` | ~1.2:1 | `#90cdf4` | ~8.5:1 |
| `.contact-item .value` | `#1a365d` on `#1a1a2e` | ~1.2:1 | `#90cdf4` | ~8.5:1 |
| `.contact-item .label` | `#666` on `#1a1a2e` | ~3.0:1 | `#aaa` | ~5.7:1 |
| `footer` | `#666` on `#0f0f23` | ~3.4:1 | `#aaa` | ~5.7:1 |
| `.detail-count` | `#666` on `#1a1a2e` | ~3.0:1 | `#aaa` | ~5.7:1 |

Additional dark mode fixes:
- TOC `nav` inline `background: white` overridden via `#toc { background: #1a1a2e !important; }`
- `details summary:hover` changed from `#edf2f7` to `#252535`
- Badge colors (success, warning, danger, info) given dark-appropriate bg/text pairs

## Textstat Readability Scores

Sample: Executive Summary paragraph (169 words, 11 sentences)

| Metric | Score | Interpretation |
|---|---|---|
| Flesch Reading Ease | 18.5 | Very Difficult (0-30 range) |
| Flesch-Kincaid Grade | 14.5 | College sophomore |
| Gunning Fog Index | 18.2 | Post-graduate |
| SMOG Index | 15.5 | College+ |
| Coleman-Liau Index | 17.8 | Graduate level |
| Dale-Chall | 15.8 | College graduate |
| Consensus | 15-16th grade | Professional/academic |

### Text Statistics

- Syllable count: 345
- Word count: 169
- Sentence count: 11
- Difficult words: 81 (48%)
- Polysyllabic words: 52 (31%)
- Reading time: ~16 seconds

### Observations

- Executive summary is a single dense paragraph with 7+ service types in one comma-separated clause
- High ratio of difficult/polysyllabic words driven by industry jargon (brokerage, entitlements, due diligence, valuation, restructuring, consolidation)
- Parenthetical data embedded inline (addresses, acronyms, dollar figures) increases cognitive load
- For a professional B2B audience, 12th-14th grade is typical and acceptable
- Current 15-16th grade level is slightly above the professional norm

### Recommendations (if broader accessibility desired)

1. Break single-paragraph exec summary into 3-4 shorter paragraphs by topic (company profile, market context, competitive position)
2. Split compound sentences with 3+ clauses into individual sentences
3. Move parenthetical data (addresses, credentials, dollar figures) into a structured fact-box or sidebar table
4. Target 10th-12th grade for maximum professional readability without losing precision
