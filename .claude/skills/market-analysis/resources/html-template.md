# HTML Report Template Reference

> **DEPRECATED inline CSS.** Reports now use the unified brand theme system.
> Link `report-base.css` + `css/theme.css` instead of inlining styles.
> See [docs/BRAND_THEME.md](../../../../docs/BRAND_THEME.md) for the current architecture.

Base CSS and structural template extracted from the Illumination Holiday Lighting report.

## Base CSS

```css
/* These defaults are now in css/report-base.css — do not inline */
:root {
    --primary: #1a5f7a;
    --secondary: #159895;
    --accent: #57c5b6;
    --light: #f8f9fa;
    --dark: #212529;
    --border: #dee2e6;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    line-height: 1.6;
    color: var(--dark);
    background: var(--light);
}

.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
}

header {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    padding: 3rem 2rem;
    margin-bottom: 2rem;
}

header h1 { font-size: 2.2rem; margin-bottom: 0.5rem; }
header .subtitle { font-size: 1.2rem; opacity: 0.9; }
header .meta { margin-top: 1rem; font-size: 0.9rem; opacity: 0.8; }

.executive-summary {
    background: white;
    border-left: 4px solid var(--accent);
    padding: 1.5rem;
    margin-bottom: 2rem;
    border-radius: 0 8px 8px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.executive-summary h2 { color: var(--primary); margin-bottom: 1rem; }

section {
    background: white;
    margin-bottom: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
}

section h2 {
    background: var(--primary);
    color: white;
    padding: 1rem 1.5rem;
    font-size: 1.3rem;
}

section h3 {
    color: var(--secondary);
    margin: 1.5rem 0 0.75rem 0;
    font-size: 1.1rem;
}

.section-content { padding: 1.5rem; }

table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
th { background: var(--light); font-weight: 600; color: var(--primary); }
tr:hover { background: #f8f9fa; }

ul, ol { margin: 1rem 0; padding-left: 1.5rem; }
li { margin-bottom: 0.5rem; }

.highlight-box {
    background: linear-gradient(135deg, #e8f4f8, #d4edda);
    border-radius: 8px;
    padding: 1rem 1.5rem;
    margin: 1rem 0;
}

.warning-box {
    background: #fff3cd;
    border-left: 4px solid #ffc107;
    padding: 1rem 1.5rem;
    margin: 1rem 0;
    border-radius: 0 8px 8px 0;
}

.info-box {
    background: #e7f1ff;
    border-left: 4px solid var(--primary);
    padding: 1rem 1.5rem;
    margin: 1rem 0;
    border-radius: 0 8px 8px 0;
}

blockquote {
    background: #f8f9fa;
    border-left: 4px solid var(--accent);
    padding: 1rem 1.5rem;
    margin: 1rem 0;
    font-style: italic;
    color: #555;
}

.source { font-size: 0.85rem; color: #666; font-style: italic; }

.badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
}
.badge-success { background: #d4edda; color: #155724; }
.badge-warning { background: #fff3cd; color: #856404; }
.badge-danger  { background: #f8d7da; color: #721c24; }
.badge-info    { background: #d1ecf1; color: #0c5460; }

.rating { color: #ffc107; font-size: 1.2rem; }

.contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
}
.contact-item { background: var(--light); padding: 1rem; border-radius: 8px; text-align: center; }
.contact-item .label { font-size: 0.85rem; color: #666; margin-bottom: 0.25rem; }
.contact-item .value { font-weight: 600; color: var(--primary); }

.verification-table td:nth-child(2),
.verification-table td:nth-child(3),
.verification-table td:nth-child(4) { text-align: center; }

footer {
    text-align: center;
    padding: 2rem;
    color: #666;
    font-size: 0.9rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
}

a { color: var(--secondary); text-decoration: none; }
a:hover { text-decoration: underline; }

/* Collapsible sections */
details {
    margin: 1rem 0;
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
}

details summary {
    padding: 0.75rem 1rem;
    background: var(--light);
    cursor: pointer;
    font-weight: 600;
    color: var(--primary);
    list-style: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    user-select: none;
}

details summary::-webkit-details-marker { display: none; }

details summary::before {
    content: '\25B6';
    font-size: 0.7rem;
    transition: transform 0.2s ease;
    flex-shrink: 0;
}

details[open] summary::before {
    transform: rotate(90deg);
}

details summary:hover {
    background: #e9ecef;
}

details summary .detail-count {
    font-weight: 400;
    font-size: 0.85rem;
    color: #666;
    margin-left: auto;
}

details .details-content {
    padding: 1rem 1.5rem;
}

/* Nested details (subsections within a section) */
details details {
    margin: 0.75rem 0;
    border-color: #e9ecef;
}

details details summary {
    font-size: 0.95rem;
    padding: 0.6rem 1rem;
}

@media print {
    body { background: white; }
    .container { max-width: 100%; }
    section { box-shadow: none; border: 1px solid #ddd; }
    details { border: none; }
    details, details[open] { display: block; }
    details > summary { display: none; }
    details .details-content { padding: 0; }
}
```

## HTML Structure Skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Company Name] - Research Report</title>
    <style>/* Full CSS from above */</style>
</head>
<body>
    <header>
        <div class="container">
            <h1>[Company Name]</h1>
            <div class="subtitle">Comprehensive Research Report</div>
            <div class="meta">
                <strong>Report Date:</strong> [Date] |
                <strong>Primary Source:</strong> <a href="[URL]" style="color: white;">[domain]</a>
            </div>
        </div>
    </header>

    <div class="container">
        <!-- Executive Summary -->
        <div id="executive-summary" class="executive-summary">
            <h2>Executive Summary</h2>
            <p>[Summary paragraph]</p>
        </div>

        <!-- Table of Contents -->
        <nav id="toc" style="background: white; margin-bottom: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
            <h2 style="background: var(--primary); color: white; padding: 1rem 1.5rem; font-size: 1.3rem;">Table of Contents</h2>
            <div style="padding: 1.5rem;">
                <ol style="margin: 0; padding-left: 1.5rem;">
                    <li><a href="#company-overview">Company Overview</a></li>
                    <!-- ... all 12 sections ... -->
                </ol>
            </div>
        </nav>

        <!-- Sections 1-12 follow this pattern -->
        <section id="[section-id]">
            <h2>[N]. [Section Title]</h2>
            <div class="section-content">
                <!-- Content with tables, badges, callout boxes, citations -->
            </div>
        </section>

        <footer>
            <p><strong>Report compiled:</strong> [Date]</p>
            <p><strong>Research methodology:</strong> Web scraping, search engine queries, public records review</p>
        </footer>
    </div>
</body>
</html>
```

## Component Examples

### Data Table with Source Column
```html
<table>
    <tr><th>Metric</th><th>Value</th><th>Source</th></tr>
    <tr>
        <td>Market Size (2025)</td>
        <td>$X billion</td>
        <td><a href="[url]">Source Name</a></td>
    </tr>
</table>
```

### Verification Badge
```html
<span class="badge badge-success">Verified</span>
<span class="badge badge-warning">Partially Verified</span>
<span class="badge badge-danger">Not Found</span>
```

### Star Rating
```html
<span class="rating">&#9733;&#9733;&#9733;&#9733;&#9733;</span> 5.0 / 5.0
```

### Market Sizing Highlight Box
```html
<div class="highlight-box">
    <strong>Market Sizing Estimate:</strong> With ~[X] households and a [Y]% homeownership
    rate, approximately [Z] owner-occupied homes exist in the Austin MSA. At a professional
    service adoption rate of [A-B]%, this suggests a local addressable market of
    [C]-[D] potential customers per [period].
</div>
```

### Research Limitation Warning
```html
<div class="warning-box">
    <strong>Research Limitations:</strong>
    <ul style="margin-top: 0.5rem;">
        <li>[Specific limitation with context]</li>
    </ul>
</div>
```

## Collapsible Section Components

### Collapsible Data Subsection (collapsed by default)
Use for each market data subsection, source category, and verification matrix.
```html
<details>
    <summary>
        Global Christmas Lights &amp; Decorations Market
        <span class="detail-count">8 metrics</span>
    </summary>
    <div class="details-content">
        <table>
            <tr><th>Market Metric</th><th>Value</th><th>Source</th></tr>
            <tr>
                <td>Global Market Size (2025)</td>
                <td>$8.39 billion</td>
                <td><a href="[url]">Market Data Forecast</a></td>
            </tr>
            <!-- ... more rows ... -->
        </table>
    </div>
</details>
```

### Collapsible Source Category (collapsed by default)
Use for each category in the Sources & Citations section.
```html
<details>
    <summary>
        Market Research Sources
        <span class="detail-count">10 sources</span>
    </summary>
    <div class="details-content">
        <ol start="10">
            <li><a href="[url]">Source Name - Report Title</a></li>
            <!-- ... more items ... -->
        </ol>
    </div>
</details>
```

### Industry Market Data Section Pattern
Key findings stay visible; detailed tables collapse. The highlight-box with the addressable
market calculation and the info-box with abbreviations always remain visible above the
collapsed subsections.
```html
<section id="market-data">
    <h2>7. Industry Market Data</h2>
    <div class="section-content">
        <div class="info-box">
            <strong>Abbreviations:</strong><br>
            MSA = Metropolitan Statistical Area<br>
            CAGR = Compound Annual Growth Rate<br>
            HUD = U.S. Department of Housing and Urban Development<br>
            ACS = American Community Survey<br>
            ABoR = Austin Board of Realtors<br>
            TRERC = Texas Real Estate Research Center<br>
            BBB = Better Business Bureau
        </div>

        <details>
            <summary>Global Market Data <span class="detail-count">8 metrics</span></summary>
            <div class="details-content">
                <table><!-- global market table --></table>
            </div>
        </details>

        <details>
            <summary>U.S. Installation Services <span class="detail-count">9 metrics</span></summary>
            <div class="details-content">
                <table><!-- US market table --></table>
            </div>
        </details>

        <details>
            <summary>Pricing by Tier (National) <span class="detail-count">5 tiers</span></summary>
            <div class="details-content">
                <table><!-- pricing table --></table>
            </div>
        </details>

        <!-- Addressable market highlight OUTSIDE details so it's always visible -->
        <div class="highlight-box">
            <strong>Market Sizing Estimate:</strong> ...
        </div>

        <details>
            <summary>Austin Metro Market Opportunity <span class="detail-count">12 metrics</span></summary>
            <div class="details-content">
                <table><!-- Austin demographics table --></table>
            </div>
        </details>

        <details>
            <summary>Texas Market Context <span class="detail-count">8 metrics</span></summary>
            <div class="details-content">
                <table><!-- Texas data table --></table>
                <div class="info-box">
                    <strong>Why Texas Matters:</strong> ...
                </div>
            </div>
        </details>

        <details>
            <summary>Industry Trends <span class="detail-count">6 trends</span></summary>
            <div class="details-content">
                <ul><!-- trend items --></ul>
            </div>
        </details>
    </div>
</section>
```

### Sources Section Pattern
Each source category collapses independently.
```html
<section id="sources">
    <h2>12. Sources and Citations</h2>
    <div class="section-content">
        <details>
            <summary>Primary Sources <span class="detail-count">5 sources</span></summary>
            <div class="details-content">
                <ol><!-- items --></ol>
            </div>
        </details>

        <details>
            <summary>Third-Party Sources <span class="detail-count">4 sources</span></summary>
            <div class="details-content">
                <ol start="6"><!-- items --></ol>
            </div>
        </details>

        <details>
            <summary>Market Research Sources <span class="detail-count">10 sources</span></summary>
            <div class="details-content">
                <ol start="10"><!-- items --></ol>
            </div>
        </details>

        <details>
            <summary>Austin Metro &amp; Texas Economic Sources <span class="detail-count">18 sources</span></summary>
            <div class="details-content">
                <ol start="20"><!-- items --></ol>
            </div>
        </details>
    </div>
</section>
```

### Verification Matrix Pattern
```html
<section id="verification">
    <h2>10. Data Verification Summary</h2>
    <div class="section-content">
        <details>
            <summary>Verification Matrix <span class="detail-count">11 categories</span></summary>
            <div class="details-content">
                <table class="verification-table"><!-- matrix --></table>
            </div>
        </details>
    </div>
</section>
```
