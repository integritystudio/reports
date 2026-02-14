---
name: growth-strategy
description: Research and compile company-specific growth, marketing, partnership, certification, and platform opportunities for Austin-area businesses. Uses webscraping-research-analyst agent for deep research. Produces a self-contained HTML report with prioritized 90-day action plan, cited sources, and a client portal index page.
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

# Growth Strategy Report Generator

Researches and compiles company-specific growth, marketing, partnership, certification, and platform opportunities for Austin-area businesses. Designed as the actionable follow-up to the `market-analysis` research report.

**Key difference from `opportunity-analysis`:** This skill produces *company-specific* growth strategy (target communities, named partnership targets, dealer programs, industry certifications, marketing calendars) rather than generic Austin city resources (grants, chambers, events). Use `opportunity-analysis` for Austin resources; use `growth-strategy` for company growth plans.

## When to Use

Activates when:
- User asks to "research opportunities", "find growth areas", or "what should [company] do next"
- User runs `/growth-strategy <company-name>`
- User requests marketing, partnership, certification, or platform opportunities for a specific company
- An existing `market-analysis` research report exists and the user wants actionable growth strategy
- User asks about expansion, year-round revenue, service diversification, or competitive positioning

## Required Input

At minimum:
- **Organization name**
- **Industry/sector** (e.g., holiday lighting, balloon decor, home health)

Best results when:
- An existing research report (`.md` or `.html`) exists in the project directory
- The company website URL is known
- Specific gaps have been identified (e.g., no Google Business Profile, no social media)

Optional inputs:
- Focus areas (e.g., "marketing only", "partnerships and certifications")
- Geographic scope for expansion research
- Budget constraints for prioritization

## Research Methodology (4 Phases)

### Phase 1: Ingest Existing Intelligence
**Tools:** `Read`, `Glob`

1. Locate existing research report in the project directory:
   ```
   <project-dir>/*_research.md
   <project-dir>/*_research.html
   ```
2. Extract company profile:
   - Name, location, years in business, owner/operator
   - Services offered, target markets (residential/commercial)
   - Current online presence and identified gaps
   - Competitive position, strengths, challenges
   - Industry and market context
3. If no research report exists, gather profile via Phase 2 web research

### Phase 2: Deep Research via Agent
**Tools:** `Task` (webscraping-research-analyst subagent)

Launch the `webscraping-research-analyst` agent with a comprehensive prompt covering all 6 research categories (see Report Structure below). The agent runs in background and performs 40-70+ web searches and page visits.

**Agent prompt template:**

```
Research growth, marketing, partnership, certification, and application
opportunities for **[COMPANY NAME]** — [brief description including location,
years in business, services, known gaps].

Website: [URL]

Research these areas thoroughly. For each opportunity, provide SPECIFIC,
ACTIONABLE details with URLs, names, costs, and application info.

## 1. GROWTH OPPORTUNITIES
- Year-round revenue diversification (complementary services for off-season)
- [City] market growth: new developments, neighborhoods, HOA communities
- Service area expansion to surrounding cities
- Upsell opportunities: technology, maintenance contracts, premium tiers

## 2. MARKETING OPPORTUNITIES
- Google Business Profile setup and optimization
- Local SEO strategies specific to [industry] in [city]
- Social media platforms for home/business services (Nextdoor, Instagram, Facebook)
- Review generation strategies
- Local advertising: publications, newsletters, community boards
- Seasonal marketing calendar
- Content marketing: portfolio, video, blog

## 3. PARTNERSHIP OPPORTUNITIES
- Complementary service companies for cross-referral
- Property management firms, HOAs
- Event venues and planners
- Home builders and new construction communities
- Real estate agents
- Industry-specific partnerships
- Chamber of Commerce and business associations

## 4. CERTIFICATION & LICENSING
- Industry-specific certifications (trade associations, training programs)
- OSHA safety certifications
- State licensing requirements and exemptions
- Better Business Bureau accreditation
- Platform badge/status requirements (HomeAdvisor Elite, etc.)
- Insurance and bonding marketing value
- Small business certifications (HUB, SBA) if applicable

## 5. APPLICATION/PLATFORM OPPORTUNITIES
- Home service / industry platforms to list on with signup details
- [City]-specific directories
- Government/municipal contract opportunities
- Commercial bid platforms
- Franchise vs. independent analysis (if relevant)
- Lead generation networks

## 6. INDUSTRY TRENDS & TECHNOLOGY
- Emerging products/services (dealer/distributor programs)
- Smart home / technology integration
- Sustainability and energy efficiency trends
- [City]-specific regulations or incentives
- Competitive landscape update with new entrants

For each opportunity: what it is, URL/contact, estimated cost, priority
(high/medium/low), timeline (quick win vs. long-term).
```

### Phase 3: Compile & Structure Report
**Tools:** `Read`, `Write`

1. Read the agent's research output
2. Organize findings into the 8-section report structure
3. Assign priority badges and timeline estimates
4. Build the 90-day action plan from highest-ROI opportunities
5. Calculate investment summary table

### Phase 4: Generate Deliverables
**Tools:** `Write`, `Edit`, `Read`

1. Generate the HTML report using the template from `resources/html-template.md`
2. Match color palette to companion research report (read existing `*_research.html`)
3. Create a client portal `index.html` if one doesn't exist (see Portal Pattern below)
4. Update hub `index.html` with a card linking to the portal or report
5. Cross-link to companion research report in footer

## Report Structure (8 Sections)

Every growth strategy report includes:

1. **Executive Summary** - Top 3 priority actions in highlight box, priority count summary (high/medium/low), total quick-win cost estimate
2. **Growth Opportunities** - Year-round revenue diversification, target communities table, service area expansion ranking, upsell opportunities list
3. **Marketing Opportunities** - Google Business Profile setup (step-by-step), local SEO keywords, social media platform comparison table, review generation strategy, local advertising targets, seasonal marketing calendar table, content marketing ideas
4. **Partnership Opportunities** - Named company targets per category (landscapers, property managers, realtors, event planners, builders, complementary services), each with approach strategy and cost
5. **Certification & Licensing** - Industry certs with training dates/locations/costs, safety certs, licensing requirements, platform badge requirements, insurance/bonding value
6. **Application & Platform Opportunities** - Platform comparison table (name, signup cost, lead cost, priority), lead networks, government contract portals, franchise vs independent analysis
7. **Industry Trends & Technology** - Product/dealer program comparison table, smart home integration, sustainability, competitive threat assessment
8. **90-Day Action Plan** - Week 1-2 (free quick wins), Week 3-4 (low-cost foundations), Month 2 (partnerships/certs), Month 3 (growth investments), investment summary table

9. **Sources & References** - Organized by category, collapsible

## HTML Template

Use the unified brand theme system. See [docs/BRAND_THEME.md](../../../docs/BRAND_THEME.md) for full architecture reference.

**CSS linking** (no inline color definitions):
```html
<html lang="en" data-brand="client-name">
<head>
    <link rel="stylesheet" href="../css/report-base.css">
    <link rel="stylesheet" href="../css/theme.css">
</head>
```

For a new client, add a brand palette to `css/theme.css` first (see BRAND_THEME.md "Adding a New Brand"). Opportunity cards, badges, priority summaries, and action boxes are already defined in theme.css sections 4-5.

### Opportunity Card Pattern

The primary content unit. Each opportunity gets a card with header, badges, and detail list.

```html
<div class="opp-card">
    <div class="opp-header">
        <span class="opp-title">Opportunity Name</span>
        <div class="opp-badges">
            <span class="badge badge-high">High Priority</span>
            <span class="badge badge-quick">Quick Win</span>
        </div>
    </div>
    <div class="opp-details">
        <p>Description of the opportunity.</p>
        <dt>Why It Matters</dt>
        <dd>Specific relevance to this company.</dd>
        <dt>Cost</dt>
        <dd>$0 - $500</dd>
        <dt>Action</dt>
        <dd>Step-by-step instructions or link.</dd>
    </div>
</div>
```

### Shared Components (from theme.css)

The following components are already defined in `css/theme.css` and do not need inline CSS:

- **Priority badges**: `.badge-high`, `.badge-medium`, `.badge-low`, `.badge-quick`, `.badge-longterm`
- **Opportunity cards**: `.opp-card`, `.opp-header`, `.opp-title`, `.opp-badges`, `.opp-details`
- **Action boxes**: `.action-box`
- **Priority summary grid**: `.priority-summary`, `.priority-card`
- **TOC**: `.toc` (opportunity table of contents)

Do not redefine these in generated HTML. They are available when linking `css/theme.css`.

### File Naming

```
<project-dir>/<company_slug>_opportunities_report.html
<project-dir>/index.html                              # client portal
```

## Client Portal Pattern

When creating a growth strategy report, also create a portal `index.html` in the project directory that links to both the research report and the opportunities report. Use the `frontend-design` skill or the editorial/magazine template pattern:

- Gradient light-strand decorative border (for visual identity)
- Company name as serif heading with tagline
- Company meta (location, website, phone)
- Executive context section summarizing the company
- Two report cards in a responsive grid with category badges, titles, descriptions, dates, source counts
- Dark/light mode via `prefers-color-scheme`
- Footer with company info

## Hub Integration

Update the root `index.html` to link to the portal (not individual reports):

```html
<a href="<project-dir>/index.html" class="card">
    <div class="card-header">
        <span class="card-category">Portal</span>
        <h3 class="card-title">[Company Name]</h3>
    </div>
    <p class="card-description">Market analysis and growth strategy reports with competitive analysis, opportunity assessment, and 90-day action plan.</p>
    <div class="card-link">View Reports</div>
</a>
```

If individual report cards already exist for this company, consolidate them into a single portal card.

## Quality Checklist

Before delivering:
- [ ] All 8 sections present and populated
- [ ] At least 30 unique source URLs cited
- [ ] Opportunity cards have priority badges and cost/timeline estimates
- [ ] 90-day action plan with week-by-week breakdown
- [ ] Investment summary table with ROI estimates
- [ ] Named targets (specific companies, not generic categories)
- [ ] Platform comparison table with signup links
- [ ] CSS matches companion research report's color palette
- [ ] Client portal index.html created/updated
- [ ] Hub index.html updated with portal card
- [ ] Cross-link to research report in footer
- [ ] Dark/light mode support
- [ ] Print styles
- [ ] Responsive layout

## Invocation Examples

```
/growth-strategy "Illumination Holiday Lighting" holiday-lighting
/growth-strategy "The Balloon Collective" event-decor
/growth-strategy "Leora Home Health" home-health --focus=marketing,partnerships
/growth-strategy "Capital City Village" nonprofit --focus=certifications,grants
```

## Relationship to Other Skills

```
market-analysis (Phase 1)     growth-strategy (Phase 2)     opportunity-analysis (Phase 2 alt)
┌───────────────────────┐     ┌─────────────────────────┐   ┌──────────────────────────────┐
│ Research Report        │     │ Growth Strategy Report   │   │ Austin Resources Report      │
│ - Company profile      │────>│ - Revenue diversification│   │ - City grants & funding      │
│ - Market data          │     │ - Marketing strategy     │   │ - Business certifications    │
│ - Competitive gaps     │     │ - Named partnerships     │   │ - Event opportunities        │
│ - Online presence      │     │ - Industry certifications│   │ - Networking & mentoring     │
│ - Recommendations      │     │ - Platform signups       │   │ - Sustainability programs    │
└───────────────────────┘     │ - Industry trends        │   │ - Free business tools        │
                               │ - 90-day action plan     │   │ - 6-month action timeline    │
                               └─────────────────────────┘   └──────────────────────────────┘
                               Company-specific strategy      Generic Austin resources
```

## Session Telemetry Reference

Baseline from Illumination Holiday Lighting session (2026-02-08):
- webscraping-research-analyst agent: 67 tool uses, 157K tokens, ~33 min runtime
- Output: 731-line HTML report, 41 cited sources, 8 sections
- Research categories: 6 (growth, marketing, partnerships, certifications, platforms, trends)
- Named targets identified: 40+ specific companies/organizations
- Platforms compared: 8 with signup links and lead costs
- Action plan: 90-day, 4-phase, investment table with ROI estimates
