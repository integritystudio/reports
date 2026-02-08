# Opportunity Analysis HTML Template Reference

CSS and structural template for Austin Resources & Opportunities reports. Extends the base market-analysis template with action cards, priority badges, timeline, and success boxes.

## Color Palette Strategy

**Always match the companion research report's palette.** Read the existing `*_research.html` file in the project directory to extract `--primary`, `--secondary`, `--accent` values.

If no research report exists, use the default:
```css
--primary: #1a5f7a;
--secondary: #159895;
--accent: #57c5b6;
--light: #f8f9fa;
--dark: #212529;
--border: #dee2e6;
```

### Palette Examples by Report

| Report | Primary | Secondary | Accent |
|--------|---------|-----------|--------|
| Balloon Collective | #7b2d8e | #c44569 | #f78fb3 |
| Holiday Lighting | #1a5f7a | #159895 | #57c5b6 |
| Default | #1a5f7a | #159895 | #57c5b6 |

## Additional CSS Components (Beyond Base Template)

These components are unique to opportunity reports. Include them in addition to all base template CSS from `market-analysis/resources/html-template.md`.

```css
/* Priority borders for action cards */
.priority-high { border-left: 4px solid #dc3545; }
.priority-medium { border-left: 4px solid #ffc107; }
.priority-low { border-left: 4px solid #28a745; }

/* Action cards - the primary content unit */
.action-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.25rem;
    margin: 0.75rem 0;
    transition: box-shadow 0.2s ease;
}
.action-card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
.action-card .card-title {
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 0.5rem;
    font-size: 1.05rem;
}
.action-card .card-meta {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 0.5rem;
}
.action-card .card-body { font-size: 0.95rem; }
.action-card .card-link {
    display: inline-block;
    margin-top: 0.5rem;
    color: var(--secondary);
    font-weight: 500;
    font-size: 0.9rem;
}

/* Success box for outcome summaries */
.success-box {
    background: #d4edda;
    border-left: 4px solid #28a745;
    padding: 1rem 1.5rem;
    margin: 1rem 0;
    border-radius: 0 8px 8px 0;
}

/* Primary badge (theme-colored) */
.badge-primary {
    background: #f3e5f5;
    color: var(--primary);
}

/* Timeline */
.timeline-item {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 1.25rem;
    border-left: 2px solid var(--accent);
}
.timeline-item::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 0.5rem;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--secondary);
}
.timeline-item .timeline-label {
    font-weight: 600;
    color: var(--primary);
    font-size: 0.9rem;
}
```

## Action Card Pattern

The primary content unit in opportunity reports. Each resource gets its own action card.

```html
<div class="action-card priority-high">
    <div class="card-title">Resource Name</div>
    <div class="card-meta">
        <span class="badge badge-danger">Critical Priority</span>
        &middot; Free &middot; ~30 minutes
    </div>
    <div class="card-body">
        <p>Description of what this resource provides and why it matters for the org.</p>
        <ul>
            <li><strong>Eligibility:</strong> Requirements</li>
            <li><strong>Benefits:</strong> What they get</li>
            <li><strong>Process:</strong> How to apply</li>
        </ul>
    </div>
    <a class="card-link" href="https://example.com/">Apply Now &rarr;</a>
</div>
```

### Priority Badge Mapping

| Priority | Border Class | Badge Class | Badge Text | When to Use |
|----------|-------------|-------------|------------|-------------|
| Critical | `.priority-high` | `.badge-danger` | "Critical Priority" | Free, fixes documented gap, immediate impact |
| High | `.priority-high` | `.badge-warning` | "High Priority" | Low cost, directly generates revenue/visibility |
| Medium | `.priority-medium` | `.badge-info` | "Medium Priority" | Moderate investment, strategic |
| Recommended | -- | `.badge-success` | "Recommended" | Strong fit, good ROI |
| Info | -- | `.badge-info` | Category label | Informational, context |
| Already Active | -- | `.badge-success` | "Already Active" | Org already uses this; optimize |

## Timeline Pattern

```html
<h3>Week 1&ndash;2: Foundation (Free, Immediate Impact)</h3>
<div class="timeline-item">
    <div class="timeline-label">Day 1&ndash;3</div>
    <p>Action description with <strong>bold resource names</strong>.</p>
</div>
<div class="timeline-item">
    <div class="timeline-label">Day 3&ndash;5</div>
    <p>Next action step.</p>
</div>
```

## Success Box Pattern (Expected Outcomes)

Always close the timeline section with an outcomes summary:

```html
<div class="success-box" style="margin-top: 1.5rem;">
    <strong>Expected Outcomes (6 months):</strong>
    <ul style="margin-bottom: 0;">
        <li>Outcome 1</li>
        <li>Outcome 2</li>
    </ul>
</div>
```

## Full HTML Skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Company] - Austin Resources &amp; Opportunities</title>
    <style>
        /* Base CSS (from market-analysis template) */
        /* + Additional CSS components above */
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>[Company Name]</h1>
            <div class="subtitle">Austin Resources &amp; Opportunities Guide</div>
            <div class="meta">
                <strong>Report Date:</strong> [Date] |
                <strong>Prepared for:</strong> <a href="[URL]" style="color: white;">[Company], LLC</a>
                &mdash; [Location]
            </div>
        </div>
    </header>

    <div class="container">
        <!-- Overview -->
        <div class="executive-summary">
            <h2>Overview</h2>
            <p>[Purpose statement]</p>
            <div class="highlight-box" style="margin-top: 1rem; margin-bottom: 0;">
                <strong>Priority Actions:</strong> [Top 3 items]
            </div>
        </div>

        <!-- Table of Contents -->
        <nav><!-- TOC --></nav>

        <!-- Sections 1-11 -->
        <section id="immediate-actions">
            <h2>1. Immediate Actions (Free &amp; High Impact)</h2>
            <div class="section-content">
                <!-- action-cards with priority-high -->
            </div>
        </section>

        <!-- ... sections 2-9 with action-cards in <details> ... -->

        <section id="action-timeline">
            <h2>10. Recommended Action Timeline</h2>
            <div class="section-content">
                <!-- timeline-items grouped by timeframe -->
                <!-- success-box with expected outcomes -->
            </div>
        </section>

        <section id="sources">
            <h2>11. Sources</h2>
            <div class="section-content">
                <!-- collapsible source categories -->
            </div>
        </section>

        <footer>
            <p><strong>Report compiled:</strong> [Date]</p>
            <p><strong>Companion document:</strong>
                <a href="[slug]_research.html">[Company] &mdash; Comprehensive Research Report</a>
            </p>
            <p><strong>Total unique resources cited:</strong> [N]</p>
        </footer>
    </div>
</body>
</html>
```

## Hub Card Template

Add to the organization's section in `index.html`:

```html
<a href="[dir]/[slug]_austin_resources.html" class="card">
  <div class="card-header">
    <span class="card-category">Recommendations</span>
    <h3 class="card-title">Austin Resources &amp; Opportunities</h3>
  </div>
  <p class="card-description">Curated guide of Austin grants, certifications, event partnerships, business associations, and growth opportunities with prioritized action timeline.</p>
  <div class="card-link">View Guide</div>
</a>
```
