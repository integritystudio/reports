---
name: market-analysis
description: Generate comprehensive market analysis reports for Austin-area organizations. Produces self-contained HTML + Markdown research documents with cited sources, competitive analysis, and Austin metro market data.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebSearch
  - WebFetch
  - mcp__webresearch__search_google
  - mcp__webresearch__visit_page
  - mcp__webresearch__take_screenshot
  - Task
---

# Market Analysis Report Generator

Generates comprehensive, cited market analysis reports for Austin-area organizations. Based on the proven research methodology used to produce the Illumination Holiday Lighting report (holliday_lighting/).

## When to Use

Activates when:
- User requests a market analysis, company research, or competitive report
- User runs `/market-analysis` or `/market-analysis <company-name>`
- User asks to "research [company]" or "analyze [market]" for an Austin-area org
- User needs due diligence, competitive intelligence, or market sizing for a local business

## Required Input

The user must provide at minimum:
- **Organization name** (company, nonprofit, or entity)
- **Primary website URL** (if known)
- **Industry/sector** (e.g., holiday lighting, home health, landscaping)

Optional inputs:
- Specific research focus areas
- Known competitors to include
- Physical address for property verification
- Specific market data requests

## Research Methodology (6 Phases)

Execute phases sequentially. Each phase builds on prior findings.

### Phase 1: Primary Company Research
**Tools:** `mcp__webresearch__search_google`, `WebFetch`, `mcp__webresearch__visit_page`

1. Visit the company's primary website and scrape all key pages:
   - Homepage (mission, value proposition)
   - Services/Products pages (full offering catalog)
   - About page (history, team, years in business)
   - Contact page (phone, email, address)
2. Search Google for the company name + "Austin TX" to find third-party listings
3. Cross-reference on verification platforms:
   - HomeAdvisor / Angi (reviews, years in business, screening status)
   - Better Business Bureau (BBB profile, rating, complaints)
   - Google Business Profile (reviews, hours, photos)
   - Yelp (reviews, photos, response rate)
   - Thumbtack (if service business)
   - Industry-specific directories

### Phase 2: Business Registration & Legal
**Tools:** `WebSearch`, `WebFetch`

1. Search Texas Secretary of State SOSDirect for entity filing
   - Note: requires $1.00/search; document limitation if not accessible
2. Search Texas Comptroller franchise tax records
3. Check for DBA filings, trade name registrations
4. Verify physical address via Zillow/property records
5. Note any licensing requirements specific to the industry

### Phase 3: Market & Industry Research
**Tools:** `WebSearch`, `WebFetch`

Search for industry market data from these source categories:
- **Market research firms**: Market Data Forecast, Technavio, Verified Market Research, Allied Market Research, Business Research Insights, Data Insights Market, IBISWorld, Statista
- **Industry associations**: Relevant trade associations, professional bodies
- **Government data**: Bureau of Labor Statistics, Census Bureau industry data

Collect:
- Global and US market size (current year + projections)
- CAGR / growth rates
- Market segmentation (commercial vs residential, product types)
- Industry trends and emerging technologies
- Pricing benchmarks and revenue per job/unit

### Phase 4: Austin Metro Market Analysis
**Tools:** `WebSearch`, `WebFetch`

Gather Austin-specific demographic and economic data:

| Data Point | Primary Sources |
|-----------|----------------|
| MSA population | Community Impact, Census Reporter, World Population Review |
| Population growth rate | MacroTrends, Opportunity Austin |
| Total households | Data USA / Census ACS |
| Homeownership rate | Data USA / Census ACS |
| Median household income | Data USA / Census ACS |
| HUD median family income | City of Austin / HUD |
| Median home value | CultureMap Austin, Zillow, Redfin |
| Housing forecast | KXAN, Redfin, Realtor.com |
| Homes sold (annual) | ABoR, CultureMap Austin |
| Total housing units | Census Reporter |
| Population projections | Opportunity Austin |

Calculate addressable market estimate:
```
Owner-occupied homes = Total households x Homeownership rate
Addressable market = Owner-occupied homes x Estimated adoption rate (5-10%)
```

### Phase 5: Texas & Regional Context
**Tools:** `WebSearch`, `WebFetch`

Texas-level data for market context:
- Texas Real Estate Research Center (TRERC at TAMU) - annual forecast
- New-home construction permits (share of national)
- Housing starts forecast
- Home sales forecast
- Statewide median home price
- Net domestic migration ranking
- Construction activity data (HBWeekly, Hampson Properties)

### Phase 6: Competitive Analysis
**Tools:** `WebSearch`, `mcp__webresearch__visit_page`

1. Search Google Maps / Yelp / Thumbtack for competitors in the same industry + "Austin TX"
2. Build competitor table with: name, rating, review count, notable features
3. Assess subject company's positioning:
   - **Strengths** (experience, ratings, services, differentiators)
   - **Challenges** (online presence gaps, scale, review count)
4. Gather local pricing data for the industry

## Report Structure (12 Sections)

Every report must include these sections in order:

1. **Executive Summary** - 1 paragraph overview of findings
2. **Company Overview** - Services, mission, geography, key features
3. **Contact Information** - Phone, email, website, physical address with analysis
4. **Business Status & Registration** - TX SOS, Comptroller, years in business
5. **Key Personnel** - Owner/operator, team information
6. **Reviews & Ratings** - Platform-by-platform breakdown with testimonials
7. **Financial Information** - Public financial data or industry context if private
8. **Industry Market Data** - 6 collapsible subsections (each wrapped in `<details>`):
   - Global market sizing (current + projections)
   - US market / installation services data
   - Pricing by tier (national benchmarks)
   - Austin metro market opportunity (demographics + addressable market calc) -- **highlight-box stays outside `<details>`**
   - Texas market context (construction, migration, housing)
   - Industry trends (current year + next year)
   - **Abbreviation glossary** info-box stays visible above collapsible subsections; each abbreviation must be on its own line using `<br>` tags (not semicolon-separated)
9. **Competitive Analysis** - Competitor table, SWOT-style positioning, local pricing
10. **Online Presence** - Website audit always visible; social media + directory tables in `<details>`
11. **Data Verification Summary** - Full matrix in `<details>`, collapsed by default
12. **Conclusions & Recommendations** - Key findings + next steps for further research
13. **Sources & Citations** - Each category in its own `<details>`, collapsed by default

## Output Format

### File Naming
```
<project-dir>/<company_slug>_research.html
<project-dir>/<company_slug>_research.md
```

### HTML Requirements

Generate self-contained HTML with inline CSS. Reference `resources/html-template.md` for the base CSS design system.

Key design elements:
- CSS custom properties for theming (primary, secondary, accent, light, dark, border)
- Gradient header with company name, subtitle "Comprehensive Research Report", date, primary source URL
- Executive summary with left accent border
- Linked table of contents
- Sections with colored `h2` headers (white text on primary background)
- Data tables with hover states and source citation columns
- Badge system: `.badge-success` (green), `.badge-warning` (yellow), `.badge-danger` (red), `.badge-info` (blue)
- Callout boxes: `.highlight-box` (gradient green), `.warning-box` (yellow left border), `.info-box` (blue left border)
- Star ratings using `&#9733;` entities
- Contact grid (CSS grid, auto-fit minmax(200px, 1fr))
- Verification matrix table
- Print styles (`@media print` -- details forced open)
- Responsive max-width 900px container
- **Collapsible sections** using `<details>/<summary>` (see below)

### Collapsible Sections (Readability)

Use `<details>/<summary>` to keep dense reference tables collapsed by default. This improves scanability -- readers see key findings immediately and expand data on demand.

**Sections that use collapsible subsections:**

| Section | What collapses | What stays visible |
|---------|---------------|--------------------|
| 7. Industry Market Data | Each of the 6 data subsection tables | Section header + abbreviation glossary info-box |
| 9. Online Presence | Social media table, directory listings table | Website audit table (short) |
| 10. Data Verification | Full verification matrix | Section header only |
| 12. Sources & Citations | Each source category (`<ol>` blocks) | Category headings as `<summary>` labels |

**Sections that must NOT collapse (always fully visible):**
- Executive Summary, Company Overview, Contact Info, Business Status, Key Personnel, Reviews, Financial Info, Competitive Analysis, Conclusions

**Implementation rules:**
- Use native `<details>/<summary>` -- no JavaScript
- Summary text must be descriptive: include row count or key stat (e.g., "Global Market Data (8 metrics)")
- Highlight boxes and addressable market calculations go OUTSIDE the `<details>` so they're always visible
- `@media print` must force all `<details>` open via `details[open] { display: block; }` and `details { open: true; }` -- use the CSS attribute selector `details { display: block; }` with `details > summary { display: none; }` in print
- Nested `<details>` are allowed for subsections within a section

### Markdown Requirements

Standard GitHub-flavored Markdown with:
- Tables for structured data
- Blockquotes for testimonials
- Inline source citations as markdown links
- Clear section hierarchy with `##` and `###`

## Source Citation Standards

- Every data point must have an inline citation linking to the source URL
- Tables should include a "Source" column where applicable
- Use `<p class="source">` for paragraph-level citations in HTML
- Group citations in the Sources section by category
- Note research limitations transparently (e.g., paywalled databases, unavailable data)

## Quality Checklist

Before delivering the report, verify:
- [ ] All 12 sections are present and populated
- [ ] Austin metro market sizing calculation is included
- [ ] At least 20 unique source URLs are cited
- [ ] Data verification matrix is complete
- [ ] Competitor table has 4+ entries
- [ ] HTML is self-contained (no external CSS/JS dependencies)
- [ ] Both HTML and Markdown versions are saved
- [ ] All source links are functional URLs
- [ ] Market data includes current year + projections
- [ ] Executive summary accurately reflects findings
- [ ] Dense data sections use `<details>/<summary>` (collapsed by default)
- [ ] Key findings (highlight-box, addressable market) are outside `<details>` blocks
- [ ] Each `<summary>` includes a `.detail-count` span with row/item count
- [ ] `@media print` forces all details open and hides summary elements

## Invocation Examples

```
/market-analysis Illumination Holiday Lighting https://illuminationholidaylighting.com
/market-analysis "Leora Home Health" https://leorahomehealth.com home-health
/market-analysis "Capital City Village" -- senior-living
```

## Color Palette Reference

Customize per report. Default scheme:
```css
--primary: #1a5f7a;    /* Deep teal - section headers, links */
--secondary: #159895;  /* Medium teal - subheadings, accents */
--accent: #57c5b6;     /* Light teal - highlights, borders */
--light: #f8f9fa;      /* Off-white - backgrounds */
--dark: #212529;       /* Near-black - body text */
--border: #dee2e6;     /* Light gray - table borders */
```
