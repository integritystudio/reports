---
name: opportunity-analysis
description: Investigate and compile Austin-based resources, grants, certifications, event partnerships, and growth opportunities for local organizations. Produces a self-contained HTML recommendations report with prioritized action timeline and cited sources.
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

# Austin Opportunity Analysis Report Generator

Investigates and compiles actionable Austin-based resources, grants, certifications, partnerships, and growth opportunities for local organizations. Produces a self-contained HTML report with a prioritized action timeline. Designed as the companion deliverable to the `market-analysis` skill's research report.

## When to Use

Activates when:
- User requests an opportunities report, resource guide, or recommendations for an Austin-area organization
- User runs `/opportunity-analysis` or `/opportunity-analysis <company-name>`
- User asks to "find opportunities for [company]" or "what resources are available for [org]"
- A `market-analysis` research report already exists and the user wants actionable next steps
- User needs grants, certifications, event partnerships, or networking resources for a local business

## Required Input

The user must provide at minimum:
- **Organization name**
- **Industry/sector** (e.g., balloon decor, holiday lighting, home health, nonprofit)

Best results when an existing research report exists in the project directory (from `market-analysis` skill). The skill reads the research report to understand the company's profile, gaps, and competitive position.

Optional inputs:
- Path to existing research report (`.md` or `.html`)
- Specific focus areas (e.g., "grants only", "event partnerships", "sustainability")
- Ownership demographics (minority-owned, woman-owned, veteran-owned) for certification targeting
- Known gaps to address (e.g., "no Google Business Profile", "no Yelp listing")

## Research Methodology (4 Phases)

### Phase 1: Ingest Existing Research
**Tools:** `Read`, `Glob`

1. Locate the existing research report in the project directory:
   ```
   <project-dir>/*_research.md
   <project-dir>/*_research.html
   ```
2. Extract key profile data:
   - Company name, LLC status, years in business
   - Owners/founders and demographics (for certification eligibility)
   - Services offered and industry vertical
   - Physical location (city, neighborhood)
   - Current online presence (Google Business, Yelp, website platform)
   - Identified gaps and challenges from competitive analysis
   - Existing event participation and media coverage
3. If no research report exists, gather this information via web research

### Phase 2: Austin Resource Discovery
**Tools:** `mcp__webresearch__search_google`, `WebFetch`, `mcp__webresearch__visit_page`

Research across all 10 opportunity categories (see Report Structure below). For each category, search for:
- Current programs, with application URLs and eligibility requirements
- Deadlines and application cycles (note "rolling" vs. annual)
- Cost (free vs. fee-based) and expected ROI
- Relevance to the specific organization's profile and gaps

**Search strategy per category:**

| Category | Search Queries |
|----------|---------------|
| Immediate Actions | "[company] Google Business Profile", "Yelp business claim" |
| Grants & Funding | "City of Austin small business grants 2026", "Austin Cultural Arts Division funding", "Texas creative business grants" |
| Certifications | "Austin MBE WBE certification", "Texas HUB certification", "WBENC certification Texas" |
| Business Associations | "Austin chamber of commerce membership", "Austin Independent Business Alliance", "Austin Creative Alliance" |
| Event Opportunities | "SXSW vendor", "Austin City Limits vendor", "Austin Trail of Lights sponsor", "[industry] Austin events" |
| Networking | "SCORE Austin mentoring", "Creative Mornings Austin", "Austin [industry] networking" |
| Free Tools | "Austin SBDC", "Austin Public Library business resources", "SAM.gov registration" |
| Sustainability | "Austin Green Business Leaders", "Austin Resource Recovery business", "[industry] sustainability certification" |
| Industry Associations | "[industry] association Austin Texas", "[industry] preferred vendor Austin venues" |

### Phase 3: Validate & Prioritize
**Tools:** `WebFetch`, `mcp__webresearch__visit_page`

1. Verify each resource URL is live and current
2. Confirm eligibility requirements match the organization's profile
3. Assign priority based on:
   - **Critical** (red badge): Free, immediate impact, addresses a documented gap
   - **High** (yellow badge): Low cost, high value, directly generates revenue or visibility
   - **Medium** (blue badge): Moderate investment, strategic positioning
   - **Low** (green badge): Long-term, nice-to-have, exploratory
4. Build a 6-month action timeline with weekly/monthly milestones

### Phase 4: Generate Report
**Tools:** `Write`, `Edit`, `Read`

1. Read the existing research report's HTML to extract the CSS color scheme
2. Generate the HTML report using the matching color palette
3. Add a card to the hub `index.html` if it exists
4. Cross-link to the companion research report in the footer

## Report Structure (11 Sections)

Every opportunities report must include these sections:

1. **Overview** - Summary of report purpose, top 3 priority actions highlighted in a `.highlight-box`
2. **Immediate Actions (Free & High Impact)** - Always first. Items that cost nothing and fix documented gaps (e.g., Google Business, Yelp, vendor registration). Each as an `.action-card` with priority badge, time estimate, and step-by-step instructions.
3. **Grants & Funding Programs** - City of Austin, Texas state, federal (SBA), and private grants/loans. Collapsible subsections by source level (city, state, federal).
4. **Business Certifications** - MBE, WBE, HUB, WBENC, SBA 8(a). Only include certifications the org is likely eligible for based on ownership profile.
5. **Chambers & Business Associations** - Local chambers, industry alliances, neighborhood groups. Include membership cost and key benefits.
6. **Event Opportunities** - Tiered: Tier 1 (major/national events), Tier 2 (regional/community). Include event dates, attendee counts, and specific partnership angles.
7. **Networking & Professional Development** - Free and paid groups, mentoring, industry conventions.
8. **Free Business Support & Tools** - SBDC, library resources, SAM.gov, digital skills training.
9. **Sustainability Programs** - Green certifications, waste reduction, industry-specific environmental practices. Tie to competitive gap if identified.
10. **Industry-Specific Associations & Venues** - Trade associations, preferred vendor lists, directory listings relevant to the specific industry vertical.
11. **Recommended Action Timeline** - Prioritized 6-month roadmap:
    - Week 1-2: Foundation (free, immediate)
    - Month 1-2: Growth (low cost, high value)
    - Month 3-6: Expansion (strategic investment)
    - Expected outcomes summary in a `.success-box`

12. **Sources** - Collapsible by category, numbered sequentially

## Output Format

### File Naming
```
<project-dir>/<company_slug>_austin_resources.html
```

Place in the same directory as the companion research report.

### HTML Requirements

Use the unified brand theme system. See [docs/BRAND_THEME.md](../../../docs/BRAND_THEME.md) for full architecture reference. **Match the brand of the existing research report** in the same directory.

**CSS linking** (no inline color definitions):
```html
<html lang="en" data-brand="client-name">
<head>
    <link rel="stylesheet" href="../css/report-base.css">
    <link rel="stylesheet" href="../css/theme.css">
</head>
```

For a new client, add a brand palette to `css/theme.css` first (see BRAND_THEME.md "Adding a New Brand").

**Shared components available from theme.css** (do not redefine inline):
- Priority borders: `.priority-high`, `.priority-medium`, `.priority-low`
- Action cards: `.action-card`, `.card-title`, `.card-meta`, `.card-link`
- Success box: `.success-box`
- Timeline: `.timeline-item`
- Badges: `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`

### Hub Integration

If `index.html` exists in the repo root, add a card to the organization's section:

```html
<a href="<project-dir>/<company_slug>_austin_resources.html" class="card">
  <div class="card-header">
    <span class="card-category">Recommendations</span>
    <h3 class="card-title">Austin Resources &amp; Opportunities</h3>
  </div>
  <p class="card-description">Curated guide of Austin grants, certifications, event partnerships, business associations, and growth opportunities with prioritized action timeline.</p>
  <div class="card-link">View Guide</div>
</a>
```

## Austin Resource Database

Reference `resources/austin-resources-database.md` for a curated, pre-validated list of Austin programs, grants, certifications, and organizations. Always verify URLs are current before including in reports.

## Quality Checklist

Before delivering the report, verify:
- [ ] All 11+ sections present and populated
- [ ] At least 25 unique resources with URLs
- [ ] Each resource includes: name, URL, what it offers, eligibility, cost
- [ ] Action cards have priority badges and time estimates
- [ ] 6-month action timeline with specific week/month milestones
- [ ] Expected outcomes summary in success-box
- [ ] CSS matches companion research report's color palette
- [ ] Cross-link to research report in footer
- [ ] Hub index.html updated with new card (if hub exists)
- [ ] Collapsible sections use `<details>/<summary>` for dense lists
- [ ] Print styles force details open
- [ ] All action card links point to live URLs

## Invocation Examples

```
/opportunity-analysis "The Balloon Collective" balloon-decor
/opportunity-analysis "Illumination Holiday Lighting" holiday-lighting
/opportunity-analysis "Capital City Village" nonprofit --focus=grants,certifications
/opportunity-analysis "Leora Home Health" home-health --owners=woman-owned
```

## Relationship to market-analysis Skill

```
market-analysis (Phase 1)          opportunity-analysis (Phase 2)
┌─────────────────────┐            ┌─────────────────────────────┐
│ Research Report      │ ────────> │ Opportunities Report        │
│ - Company profile    │           │ - Grants & funding          │
│ - Market data        │           │ - Certifications            │
│ - Competitive gaps   │           │ - Event partnerships        │
│ - Online presence    │           │ - Networking resources      │
│ - Recommendations    │           │ - Action timeline           │
└─────────────────────┘            └─────────────────────────────┘
```

The research report provides the intelligence; the opportunities report provides the action plan.
