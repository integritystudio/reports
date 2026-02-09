# Growth Strategy HTML Template Reference

CSS and structural template for Growth & Opportunities reports. Extends the base market-analysis template with opportunity cards, priority badges, dealer comparison tables, and 90-day action plan.

## Color Palette Strategy

**Always match the companion research report's palette.** Read the existing `*_research.html` file in the project directory to extract `--primary`, `--secondary`, `--accent` values.

Default:
```css
--primary: #1a5f7a;
--secondary: #159895;
--accent: #57c5b6;
--light: #f8f9fa;
--dark: #212529;
--border: #dee2e6;
--high: #28a745;
--medium: #ffc107;
--low: #6c757d;
```

## Additional CSS (Beyond Base Template)

```css
/* Priority badges */
.badge-high { background: #d4edda; color: #155724; }
.badge-medium { background: #fff3cd; color: #856404; }
.badge-low { background: #e2e3e5; color: #383d41; }
.badge-quick { background: #d1ecf1; color: #0c5460; }
.badge-longterm { background: #e7e0f7; color: #4a306d; }

/* Opportunity cards */
.opp-card {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.25rem;
    margin: 1rem 0;
    transition: box-shadow 0.2s;
}
.opp-card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
.opp-card .opp-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.opp-card .opp-title { font-weight: 600; color: var(--primary); font-size: 1.05rem; }
.opp-card .opp-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.opp-card .opp-details { font-size: 0.92rem; }
.opp-card .opp-details dt { font-weight: 600; color: var(--secondary); margin-top: 0.5rem; }
.opp-card .opp-details dd { margin-left: 0; margin-bottom: 0.25rem; }

/* Action boxes */
.action-box {
    background: #d4edda;
    border-left: 4px solid var(--high);
    padding: 1rem 1.5rem;
    margin: 1rem 0;
    border-radius: 0 8px 8px 0;
}

/* Priority summary grid (executive summary) */
.priority-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
}
.priority-card {
    background: var(--light);
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
}
.priority-card .count { font-size: 2rem; font-weight: 700; color: var(--primary); }
.priority-card .label {
    font-size: 0.85rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
    :root {
        --light: #1a1a2e;
        --dark: #e0e0e0;
        --border: #333;
    }
    body { background: #0f0f23; }
    section, .executive-summary, .toc { background: #1a1a2e; }
    .opp-card { border-color: #333; }
    th { background: #222; }
    tr:hover { background: #222; }
    .priority-card { background: #222; }
}
```

## Opportunity Card Pattern

Primary content unit. Each opportunity gets a card.

```html
<div class="opp-card">
    <div class="opp-header">
        <span class="opp-title">Permanent / Architectural Lighting Systems</span>
        <div class="opp-badges">
            <span class="badge badge-high">High Priority</span>
            <span class="badge badge-longterm">3-6 Month Setup</span>
        </div>
    </div>
    <div class="opp-details">
        <p>Description of the opportunity and why it matters.</p>
        <dt>Why It Matters</dt>
        <dd>Converts seasonal clients into year-round customers. Average job: $3,000-$8,000+.</dd>
        <dt>Cost / Entry</dt>
        <dd>$5K-$10.5K material credit (not a fee).</dd>
        <dt>Action</dt>
        <dd>Apply at <a href="https://example.com/apply">example.com/apply</a></dd>
    </div>
</div>
```

## Priority Badge Mapping

| Priority | Badge Class | When to Use |
|----------|-------------|-------------|
| High Priority | `.badge-high` | High ROI, directly addresses gap, strong fit |
| Medium Priority | `.badge-medium` | Moderate investment, strategic positioning |
| Low Priority | `.badge-low` | Long-term, exploratory, lower ROI |
| Quick Win | `.badge-quick` | Free or near-free, immediate impact |
| Long-Term | `.badge-longterm` | 3+ months to implement or see returns |

## 90-Day Action Plan Pattern

```html
<section id="calendar">
    <h2>7. 90-Day Action Plan</h2>
    <div class="section-content">
        <h3>Week 1-2: Digital Foundation ($0)</h3>
        <div class="action-box">
            <ol>
                <li><strong>Google Business Profile</strong> - Free, 30 min. <a href="https://business.google.com/">Setup</a></li>
                <li><strong>Yelp</strong> - Free, 15 min. <a href="https://business.yelp.com/">Claim</a></li>
                <!-- more items -->
            </ol>
        </div>

        <h3>Week 3-4: Reviews & Content ($0-$59)</h3>
        <ol>
            <li>Contact 20+ past clients for Google reviews</li>
            <li>Complete OSHA 10-Hour ($45-$59 online)</li>
        </ol>

        <h3>Month 2: Partnerships & Certs ($0-$500)</h3>
        <ol>
            <li>Visit 5-10 complementary companies for referral agreements</li>
            <li>Apply for BBB ($300-$500/yr)</li>
        </ol>

        <h3>Month 3: Growth ($0-$5,500)</h3>
        <ol>
            <li>Apply for dealer programs</li>
            <li>Set up seasonal ad campaigns</li>
        </ol>

        <h3>Investment Summary</h3>
        <table>
            <tr><th>Investment</th><th>Cost</th><th>ROI</th><th>Timeline</th></tr>
            <tr><td>Google Business Profile</td><td>$0</td><td>Highest</td><td>Same day</td></tr>
        </table>
    </div>
</section>
```

## Dealer/Program Comparison Table Pattern

For comparing dealer programs, franchise options, or platform choices:

```html
<table>
    <tr><th>Feature</th><th>Option A</th><th>Option B</th><th>Option C</th></tr>
    <tr><td><strong>Dealer Cost</strong></td><td>$5K-$10K</td><td>$20,000</td><td>Minimal</td></tr>
    <tr><td><strong>Ongoing Fees</strong></td><td>None</td><td>Varies</td><td>None</td></tr>
    <tr><td><strong>Territory</strong></td><td>Exclusive by zip</td><td>Exclusive</td><td>Wide</td></tr>
    <tr><td><strong>Apply</strong></td><td><a href="#">Apply</a></td><td><a href="#">Contact</a></td><td><a href="#">Apply</a></td></tr>
</table>
<div class="highlight-box">
    <strong>Recommendation:</strong> [Which option and why for this specific company.]
</div>
```

## Platform Comparison Table Pattern

```html
<table>
    <tr><th>Platform</th><th>Signup</th><th>Lead Cost</th><th>Details</th><th>Priority</th></tr>
    <tr>
        <td><strong>Google Business</strong></td>
        <td>Free</td>
        <td>Free</td>
        <td><a href="https://business.google.com/">Setup</a></td>
        <td><span class="badge badge-high">High</span></td>
    </tr>
</table>
```

## Seasonal Marketing Calendar Pattern

```html
<table>
    <tr><th>Month</th><th>Activity</th><th>Details</th></tr>
    <tr><td>Jan-Feb</td><td>Off-season planning</td><td>Website updates, certifications, signups</td></tr>
    <tr><td>Aug</td><td>Pre-season marketing</td><td>Social media content, begin advertising</td></tr>
    <tr><td>Sep</td><td>Active booking</td><td>Email past clients, Nextdoor, Facebook ads</td></tr>
</table>
```

## Target Communities Table Pattern

```html
<table>
    <tr><th>Community</th><th>Location</th><th>Why Target</th></tr>
    <tr><td>Wolf Ranch</td><td>Georgetown</td><td>Resort-style, active HOA, upscale</td></tr>
</table>
```

## Competitive Threat Warning Pattern

```html
<div class="warning-box">
    <strong>Competitive Threat:</strong> [New entrant] expanded into [city] [date]
    with strong digital marketing. [Company]'s lack of online presence means
    customers find competitors instead. The digital visibility gap is critical to close.
</div>
```

## Full HTML Skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Company] - Growth & Opportunities Report</title>
    <style>
        /* Base CSS from market-analysis template */
        /* + Additional CSS from this template */
    </style>
</head>
<body>
<header>
    <div class="container">
        <h1>[Company Name]</h1>
        <div class="subtitle">Growth, Marketing, Partnership, Certification & Application Opportunities</div>
        <div class="meta">
            Prepared: [Date] | [Location] | Owner: [Name]<br>
            Website: <a href="[URL]" style="color: #a8e6cf;">[domain]</a> | Phone: [Phone]
        </div>
    </div>
</header>
<div class="container">
    <div class="executive-summary">
        <h2>Executive Summary</h2>
        <p>[Key finding and top 3 actions.]</p>
        <div class="priority-summary">
            <div class="priority-card"><div class="count">12</div><div class="label">High Priority</div></div>
            <div class="priority-card"><div class="count">15</div><div class="label">Medium Priority</div></div>
            <div class="priority-card"><div class="count">8</div><div class="label">Low / Long-Term</div></div>
            <div class="priority-card"><div class="count">$0-500</div><div class="label">Quick Win Cost</div></div>
        </div>
    </div>

    <div class="toc"><!-- Table of Contents --></div>

    <section id="growth"><h2>1. Growth Opportunities</h2><div class="section-content"><!-- opp-cards --></div></section>
    <section id="marketing"><h2>2. Marketing Opportunities</h2><div class="section-content"><!-- opp-cards, tables --></div></section>
    <section id="partnerships"><h2>3. Partnership Opportunities</h2><div class="section-content"><!-- opp-cards --></div></section>
    <section id="certifications"><h2>4. Certification & Licensing</h2><div class="section-content"><!-- opp-cards --></div></section>
    <section id="platforms"><h2>5. Application & Platform Opportunities</h2><div class="section-content"><!-- platform table --></div></section>
    <section id="trends"><h2>6. Industry Trends & Technology</h2><div class="section-content"><!-- dealer comparison --></div></section>
    <section id="calendar"><h2>7. 90-Day Action Plan</h2><div class="section-content"><!-- action plan --></div></section>
    <section id="sources"><h2>8. Sources & References</h2><div class="section-content sources-section"><!-- collapsible --></div></section>

    <footer>
        <p>Prepared for [Company] | [Location]</p>
        <p>Research Date: [Date] | [N] cited sources</p>
        <p>Companion: <a href="[slug]_research.html">Comprehensive Research Report</a></p>
    </footer>
</div>
</body>
</html>
```

## Client Portal Index Pattern

Create a portal `index.html` in the project directory linking to both reports. Use editorial/magazine aesthetic with:
- Decorative light-strand border (repeating-linear-gradient)
- Serif heading (DM Serif Display or Georgia)
- Company tagline in italic
- Company meta (location, website, phone)
- Executive context section summarizing the company
- Two report cards with category badges, dates, source counts
- `prefers-color-scheme` dark/light support
- See `holliday_lighting/index.html` as reference implementation
