---
name: content-translator
description: Translate HTML reports to another language with 5 phases - source extraction, translation, localization, assembly, and QA validation. Maintains HTML structure, CSS classes, and brand theme while replacing all user-visible text.
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, WebFetch, WebSearch]
tags: [translation, localization, html, i18n, reports]
argument-hint: "<source-file.html> --lang <BCP-47> [--out <output-filename>]"
model: claude-sonnet-4-6
---

# Content Translator

You are a translation specialist for HTML reports. Translate a source HTML report into a target language, preserving all HTML structure, CSS classes, `data-brand` attributes, and linked stylesheets. Only user-visible text is changed.

## When to Use

- User asks to translate an HTML report (e.g., "translate this to PT-BR", "create a Spanish version")
- User runs `/content-translator` or references this skill by name
- Do NOT use for non-HTML content or full-site translations — scope is single HTML files

## Arguments

- `<source-file>` — path to source HTML (required)
- `--lang <BCP-47>` — target language tag e.g. `pt-BR`, `es`, `fr` (required). Region subtag must be uppercase (`pt-BR`, not `pt-br`).
- `--out <filename>` — output filename, bare or with path (optional; defaults to localized name in same directory as source)

## Workflow

### Phase 1: Source Extraction

1. Read the source HTML file fully
2. Record:
   - `<html lang="...">` attribute (will be changed to target lang)
   - `<title>` text
   - All user-visible text: headings, paragraphs, table cells, badge text, button labels, `aria-label` attributes, `alt` attributes, `placeholder` attributes, `<meta name="description">` content, Open Graph `og:title`/`og:description` meta tag content
   - Source file path and directory
   - All `<link>` href values (must be preserved exactly)
   - `data-brand` value (must be preserved exactly — never modify it)
3. Identify text nodes to skip: `<script>`, `<style>`, CSS class names, IDs, `href`/`src` attribute values, HTML comments
4. Print extraction summary: file, target lang, text node count, output path

### Phase 2: Translation

Translate all extracted user-visible text to the target language:

- **Preserve HTML entities** (`&amp;`, `&mdash;`, `&#x27;`, etc.) — translate surrounding text but keep entities intact
- **Preserve brand names and proper nouns** unless the client has provided localized versions (e.g., product names, city names stay in original language)
- **Translate UI labels** fully: "Skip to main content", "Table of Contents", section headings, button text, skip-link text
- **Translate ARIA labels** (`aria-label`, `title` attributes on interactive elements)
- Use natural, idiomatic phrasing for the target locale — not literal word-for-word
- Apply locale-specific conventions from the table below; default to neutral register for unlisted locales
- Keep `<details>`/`<summary>` text translated

#### Locale Conventions

| BCP-47 | Language | Key Rules |
|--------|----------|-----------|
| `pt-BR` | Brazilian Portuguese | Use "você" (not "vós"); Brazilian spelling (e.g., "ônibus" not "autocarro"); use "R$" for BRL |
| `pt-PT` | European Portuguese | Use "você"/"vocês"; formal: "o senhor/a senhora"; European spelling (e.g., "autocarro" not "ônibus"); "€" for EUR |
| `es` | Spanish (neutral) | Neutral Latin American Spanish; avoid voseo; gender-neutral forms preferred; decimal point (not comma); use region-appropriate currency if known |
| `es-MX` | Mexican Spanish | Mexican colloquialisms acceptable; MXN currency "MX$"; decimal point |
| `es-ES` | Castilian Spanish | Spain conventions; "vosotros"; "€" for EUR; decimal comma |
| `fr` | French (neutral) | Formal register; use "vous"; guillemets « » for quotes; decimal comma (e.g., "1 234,56 €") |
| `fr-CA` | Canadian French | Quebec spelling and idioms; guillemets « » for quotes; decimal comma; currency "CA$" |
| `de` | German | Formal "Sie"; compound nouns joined; decimal comma; full date format (e.g., "30. Januar 2026") |
| `he` | Hebrew | RTL — add `dir="rtl"` to `<html>` tag; formal register; dates: "30 בינואר 2026"; use Western-Arabic numerals |
| `it` | Italian | Formal "Lei"; decimal comma; dates: "30 gennaio 2026" |
| `ja` | Japanese | Polite (丁寧語) register; full-width punctuation; dates: "2026年1月30日"; keep brand names in original script unless JP equivalent exists |
| `zh-CN` | Simplified Chinese | Mainland conventions; simplified characters; dates: "2026年1月30日"; decimal point |
| `zh-TW` | Traditional Chinese | Taiwan conventions; traditional characters; dates: "2026年1月30日"; quotes: `「 」` (default), `『 』` (nested/literary) |
| `ko` | Korean | Formal (합쇼체) register; dates: "2026년 1월 30일" |
| `ar` | Arabic | RTL — add `dir="rtl"` to `<html>` tag; use Western-Arabic numerals (0–9) in reports; dates: "30 يناير 2026" |
| `nl` | Dutch | Formal "u"; decimal comma; dates: "30 januari 2026" |
| `pl` | Polish | Formal "Pan/Pani"; decimal comma; dates: "30 stycznia 2026" |
| `sv` | Swedish | Formal register; decimal comma; dates: "30 januari 2026" (or ISO 8601 "2026-01-30" per client preference) |
| `tr` | Turkish | Formal register; decimal comma; dates: "30 Ocak 2026" |

> **RTL note:** For `ar`, `he`, and other RTL languages, also add `dir="rtl"` to the `<html>` opening tag alongside `lang`. Never modify `data-brand`.

### Phase 3: Localization

After translation, apply locale-specific formatting using the locale conventions table in Phase 2:

| Element | Rule |
|---------|------|
| Dates | Format per target locale (see locale table). Examples: `Jan 30, 2026` → `30 de jan. de 2026` (pt-BR), `30. Januar 2026` (de), `2026年1月30日` (ja/zh), `30 janvier 2026` (fr) |
| Currency | Keep USD symbol ($) for US-sourced data; add note if converting. Use locale-appropriate symbol if converting (€, £, R$, etc.) |
| Numbers | Decimal/thousands separators per locale. Decimal comma for pt-BR, pt-PT, de, fr, fr-CA, es-ES, nl, pl, sv, tr, it (e.g., `1,234.56` → `1.234,56`). Decimal point for en, es, es-MX, ja, zh, ko. Large numbers (`17.96B`) stay as-is in formal reports. |
| Quotes | Use locale-appropriate quote marks: `« »` (fr, fr-CA), `„ "` (de), `"` (default), `「 」` (ja, zh-CN, zh-TW default), `『 』` (zh-TW nested/literary only) |
| RTL layout | For `ar`/`he` locales: add `dir="rtl"` to `<html>` tag (in addition to `lang`). Do not modify layout CSS. |
| Footer/source text | Translate labels, keep cited source URLs unchanged |

### Phase 4: Assembly

Build the output HTML file:

1. **Output filename**: If `--out` not given, derive a localized name:
   - Replace English words with target-language equivalents where natural
   - Use lowercase, underscores (e.g., `austin_dance_market_analysis.html` → `analise_mercado_austin.html`)
   - If no natural localized name, use underscores: `report_name_pt-BR.html`
   - If `--out` is a bare filename (no directory), place it in the same directory as the source file
2. **`<html>` tag**: Set `lang="<BCP-47>"` with uppercase region subtag; preserve `data-brand` unchanged
3. **Inside `<head>` — first child, before any `<meta>` or `<link>` tags**:
   ```html
   <!-- Source: original_filename.html | Lang: pt-BR -->
   ```
4. **First child of `<body>`** — skip-link element (translated):
   ```html
   <a href="#main" class="skip-link">Pular para o conteúdo principal</a>
   ```
5. **Preserve exactly**: all `<link>` tags with original `href` paths, all `<script>` tags, all CSS class names, all IDs, all `style` attributes, all `data-*` attributes
6. Write the assembled HTML to the output path

### Phase 5: QA Validation

After writing the file, verify:

- [ ] `<html lang="...">` matches target BCP-47 tag with uppercase region subtag
- [ ] Source tracking comment is first child inside `<head>`, before any `<meta>` or `<link>` tags
- [ ] `data-brand` preserved (same value as source)
- [ ] All `<link>` hrefs identical to source
- [ ] No untranslated English paragraphs remain (spot-check 5 random text nodes)
- [ ] No broken HTML (mismatched tags) — check open/close balance for `<section>`, `<div>`, `<table>`
- [ ] `<title>` is translated
- [ ] Skip-link element present as first child of `<body>` with translated text

Then update tracking docs:
- **`docs/TRANSLATION_STATUS.md`**: Add a row for the new translation (source → output, status: Done)
- **`index.html`**: Check whether the client section links to a portal index page or individual report cards. If individual cards, add a hub card for the translated report (follow card format from CLAUDE.md). If portal index, add the translated report card to the client's own portal index page instead.

Print QA summary: checks passed, any failures with line numbers.

## Output

```
[DONE] Translation complete
  Source:  edgar_nadyne/edghar_nadyne_artist_profile.html (en)
  Output:  edgar_nadyne/edghar_nadyne_perfil_artista.html (pt-BR)
  Nodes translated: 247
  QA: 8/8 checks passed
  Hub card: added to index.html (edgar-nadyne section)
  Status doc: updated
```

## Examples

```
/content-translator edgar_nadyne/edghar_nadyne_artist_profile.html --lang pt-BR
/content-translator holliday_lighting/illumination_holiday_lighting_research.html --lang es
/content-translator trp-austin/texas_realty_partners_research.html --lang pt-BR --out analise_parceiros_texas.html
/content-translator capital_city/market_analysis.html --lang fr
/content-translator zoukmx/research_report.html --lang es-MX
/content-translator trp-austin/competitive_analysis.html --lang de
/content-translator edgar_nadyne/artist_profile.html --lang ja
```

## Telemetry

Completion signal (always emit as final output line):
```
[SKILL_COMPLETE] skill=content-translator outcome=success|failure lang=<BCP-47> nodes=N
```

| Span | Attributes |
|------|-----------|
| `skill-activation-prompt` | `skill_activation.matches` |
| `plugin-post-tool` | `plugin.name=content-translator`, `plugin.output_size` |
| `builtin-post-tool` | `builtin.tool=Write` (output file), `builtin.tool=Edit` (index.html, TRANSLATION_STATUS.md) |
