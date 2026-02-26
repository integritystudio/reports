# LLM Explainability Frontend Design Document

**Version**: 1.0
**Date**: 2026-02-14
**Status**: Design
**Scope**: observability-toolkit dashboard v3.0
**Source Audit**: [llm-explainability-research.md](../interface/llm-explainability-research.md)

---

## Executive Summary

This document translates the research findings from the [LLM Explainability Research](../interface/llm-explainability-research.md), [Wiz.io Security Explainability UX Research](../interface/wiz-io-security-explainability-ux.md), and [Quality Dashboard UX Review](../interface/quality-dashboard-ux-review.md) into a production frontend design specification. It defines the visual language, component architecture, interaction patterns, and regulatory UI requirements for an LLM evaluation explainability dashboard.

### Audit Findings from Research Document

The research document identifies six platform-level patterns, five OTel convention gaps, three score presentation paradigms, and six regulatory requirements. The current dashboard (v2.9) implements the data layer for most of these but presents them through a minimal UI that does not fully surface the explainability affordances available in the underlying data.

**What the current dashboard does well:**
- Dark theme with GitHub-style card layout
- Status badge system (healthy/warning/critical/no_data) with shape differentiation
- Trend indicators with percentage change
- Confidence badges (high/medium/low)
- 3 role-based views (executive/operator/auditor)
- Score histogram distribution
- Alert list with remediation hints
- SLA compliance table

**What the current dashboard lacks:**
- Score tooltip with judge trace linkage (Langfuse Pattern 1)
- Chain-of-thought reasoning display with collapsible sections
- Evaluation-to-trace drill-down (alert -> metric -> evaluation -> trace)
- Multi-agent turn-level visualization
- Cross-metric correlation visualization (toxic combination display)
- Confidence interval visualization (logprob distribution)
- Regulatory provenance panel (EU AI Act Article 13 compliance)
- Coverage heatmap visualization
- Pipeline funnel visualization
- Temporal comparison (period-over-period overlay)
- Feature-engineered derived metrics (composite quality index, metric velocity/acceleration, coverage-weighted confidence)
- Adaptive score scaling per metric distribution shape
- Role-aware feature selection (feature subsets tuned per executive/operator/auditor decision function)

---

## 1. Design Direction

### Aesthetic: Industrial Observability

The dashboard adopts an **industrial-utilitarian** aesthetic -- precise, data-dense, and engineered for sustained monitoring. The visual metaphor is an instrument panel: every element serves a diagnostic purpose, nothing is decorative.

**Design principles:**
- **Information density over whitespace**: Operators monitor 7+ metrics simultaneously; compact layouts reduce scrolling
- **Color as signal, not decoration**: Color encodes severity, trend direction, and confidence only
- **Progressive disclosure over hiding**: All data is reachable in 3 clicks maximum
- **Monospace numerics for scanability**: Tabular-aligned numbers enable rapid comparison
- **Motion for state change only**: Animations indicate data refresh, threshold breach, or navigation -- never ambient

**What makes this unforgettable:** The judge reasoning trail. When a metric breaches a threshold, the dashboard traces a visual path from the alert through the evaluation to the judge's chain-of-thought reasoning -- answering "why" in a single drill-down. No other observability dashboard connects alert to explanation in one interaction.

---

## 2. Design System

### 2.1 Color Palette

```
Backgrounds                          Semantic Status
--bg-primary:    #0a0e14             --status-healthy:  #26d97f
--bg-card:       #131920             --status-warning:  #e5a00d
--bg-elevated:   #1a2230             --status-critical: #f04438
--bg-surface:    #1f2937             --status-no-data:  #6b7280
--bg-hover:      #243044
                                     Confidence Levels
Borders                              --confidence-high:   #26d97f
--border-subtle: #1e2a3a             --confidence-medium: #e5a00d
--border-default:#2a3a4e             --confidence-low:    #f04438
--border-accent: #3b5278
                                     Trend Direction
Text                                 --trend-improving:   #26d97f
--text-primary:  #e2e8f0             --trend-stable:      #6b7280
--text-secondary:#94a3b8             --trend-degrading:   #f04438
--text-muted:    #475569
--text-inverse:  #0a0e14             Evaluation Score Scale
                                     --score-excellent:   #26d97f  (>= 0.9)
Accent                               --score-good:        #34d399  (>= 0.8)
--accent-primary:#3b82f6             --score-adequate:    #e5a00d  (>= 0.6)
--accent-hover:  #60a5fa             --score-poor:        #f97316  (>= 0.4)
--accent-muted:  #1e3a5f             --score-failing:     #f04438  (< 0.4)
```

**Score direction:** Arize Phoenix's `Score` object includes a `direction` field (`maximize` or `minimize`) that determines color polarity. Metrics where higher is better (relevance, faithfulness, coherence, task_completion, tool_correctness) use the standard scale above. Metrics where lower is better (hallucination, evaluation_latency) **invert** the color mapping:

```
Inverted Score Scale (direction: 'minimize')
--score-excellent:   #26d97f  (<= 0.1)   -- low hallucination = excellent
--score-good:        #34d399  (<= 0.2)
--score-adequate:    #e5a00d  (<= 0.4)
--score-poor:        #f97316  (<= 0.6)
--score-failing:     #f04438  (> 0.6)    -- high hallucination = failing
```

The `scoreColor(value, direction)` utility resolves which band to apply:

```typescript
type ScoreDirection = 'maximize' | 'minimize';

function scoreColor(value: number, direction: ScoreDirection = 'maximize'): string {
  const v = direction === 'minimize' ? 1 - value : value;
  if (v >= 0.9) return 'var(--score-excellent)';
  if (v >= 0.8) return 'var(--score-good)';
  if (v >= 0.6) return 'var(--score-adequate)';
  if (v >= 0.4) return 'var(--score-poor)';
  return 'var(--score-failing)';
}
```

**Rationale:** Score coloring uses a 5-point scale derived from the research finding that binary labels outperform granular scales (Section 3). The five bands map to the industry-standard evaluation quality tiers across Langfuse, Phoenix, and DeepEval. The direction-aware inversion ensures hallucination rate 0.05 renders as green (excellent) while relevance 0.05 renders as red (failing), matching user expectations without per-metric color overrides.

### 2.2 Typography

```
Font Stack
--font-display:  'JetBrains Mono', 'SF Mono', 'Fira Code', monospace
--font-body:     'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif
--font-mono:     'JetBrains Mono', 'SF Mono', Consolas, monospace

Scale (modular, ratio 1.25)
--text-xs:   11px / 1.5   -- Labels, captions, timestamps
--text-sm:   13px / 1.5   -- Secondary values, metadata
--text-base: 14px / 1.6   -- Body text, descriptions
--text-lg:   16px / 1.4   -- Section headings
--text-xl:   20px / 1.3   -- Page titles, primary metric values
--text-2xl:  28px / 1.2   -- Hero metric display
--text-3xl:  36px / 1.1   -- Dashboard overview number

Weights
--weight-regular: 400     -- Body text
--weight-medium:  500     -- Labels, nav items
--weight-semibold:600     -- Headings, metric values
```

**Rationale:** JetBrains Mono for data display -- it has distinguishable 0/O and 1/l glyphs critical for score readability. IBM Plex Sans for body text -- designed for technical interfaces, better readability than system fonts at small sizes.

### 2.3 Spacing System

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px

--radius-sm:  4px
--radius-md:  6px
--radius-lg:  8px
--radius-xl:  12px
```

### 2.4 Elevation & Depth

```
--shadow-sm:  0 1px 2px rgba(0,0,0,0.3)
--shadow-md:  0 2px 8px rgba(0,0,0,0.4)
--shadow-lg:  0 4px 16px rgba(0,0,0,0.5)
--shadow-glow-healthy:  0 0 12px rgba(38,217,127,0.15)
--shadow-glow-warning:  0 0 12px rgba(229,160,13,0.15)
--shadow-glow-critical: 0 0 12px rgba(240,68,56,0.2)
```

Status-glow shadows applied to cards when a metric is in warning/critical state. Subtle but immediately visible in peripheral vision during monitoring.

---

## 3. Information Architecture

### 3.1 Progressive Disclosure Hierarchy (5 Levels)

Derived from the **progressive disclosure** best practice in [Wiz.io research Section 8](../interface/wiz-io-security-explainability-ux.md#8-best-practices-for-securityobservability-tools) (abstracted: layered detail from summary to raw data) and addresses [UX Review Gap G3](../interface/quality-dashboard-ux-review.md#3-only-2-levels-of-progressive-disclosure) (current dashboard only has 2 disclosure levels).

```
L1  Dashboard Overview
    Single-screen status of all 7+ metrics
    Health banner + metric grid + alert count + SLA status
    Decision: "Do I need to investigate?"
    |
    v
L2  Metric Detail
    Per-metric deep dive: aggregations, histogram, trend, alerts
    Worst/best evaluations with explanations
    Decision: "Which evaluations are causing this?"
    |
    v
L3  Evaluation Detail
    Individual evaluation: score, label, explanation, judge config
    Chain-of-thought reasoning (collapsible)
    Judge execution metadata (model, temperature, tokens, duration)
    Decision: "Is this evaluation trustworthy?"
    |
    v
L4  Trace Context
    Full OTel trace for the evaluated output
    Span hierarchy with evaluation events attached
    Input/output of the LLM call being evaluated
    Decision: "What caused this output?"
    |
    v
L5  Raw Data
    JSONL records, OTel attributes, session correlation
    Exportable for offline analysis
    Decision: "Do I need to debug the pipeline?"
```

### 3.2 Navigation Map

```
/                           Dashboard Overview (L1)
/metrics/:name              Metric Detail (L2)
/evaluations/:id            Evaluation Detail (L3)
/traces/:traceId            Trace Context (L4)
/role/:roleName             Role View (Executive|Operator|Auditor)
/correlations               Cross-Metric Correlation View
/coverage                   Coverage Heatmap
/pipeline                   Pipeline Funnel View
/compliance                 Regulatory Compliance Panel
```

### 3.3 Navigation Patterns

| From | To | Trigger |
|------|-----|---------|
| L1 Metric Card | L2 Metric Detail | Click card |
| L1 Alert Item | L2 Metric Detail (scrolled to alerts) | Click alert metric name |
| L1 Correlation Alert | L2 Multiple metrics (split view) | Click "View correlated metrics" |
| L2 Worst Evaluation | L3 Evaluation Detail | Click evaluation row |
| L2 Score Badge | L3 Evaluation Detail (via tooltip) | Hover badge -> click "View explanation" |
| L3 Trace ID | L4 Trace Context | Click trace link |
| L3 Judge Trace | L4 Trace Context (judge execution) | Click "View judge trace" |
| L4 Evaluation Event | L3 Evaluation Detail | Click evaluation event in span timeline |
| Any | L1 Dashboard | Breadcrumb / logo click |

---

## 4. Component Specifications

### 4.1 Score Badge (Pattern 1: Langfuse-style)

The primary explainability affordance. Derived from [Research Section 3, Pattern 1](../interface/llm-explainability-research.md#score-presentation).

```
┌─────────────────────────────────────────────────────────┐
│  ANATOMY                                                 │
│                                                          │
│  ┌────────────────┐                                     │
│  │ ● 0.92         │  Score value + color-coded dot      │
│  │ relevance      │  Metric name in muted text          │
│  └───────┬────────┘                                     │
│          │ hover                                         │
│          v                                               │
│  ┌──────────────────────────────────────┐               │
│  │ Score         0.92                    │               │
│  │ Label         relevant                │               │
│  │ Evaluator     claude-sonnet-4-5       │               │
│  │ Type          llm                     │               │
│  │ Confidence    ● high (logprobs)       │               │
│  │ ──────────────────────────────        │               │
│  │ Explanation (truncated):              │               │
│  │ "The response directly addresses      │               │
│  │  the user's query about..."           │               │
│  │ ──────────────────────────────        │               │
│  │ [View full explanation]               │               │
│  │ [View judge trace]                    │               │
│  └──────────────────────────────────────┘               │
│                                                          │
│  STATES                                                  │
│  Default:  Colored dot + score + metric name             │
│  Hover:    Tooltip with score detail + explanation        │
│  Active:   Tooltip pinned, background highlight          │
│  Loading:  Skeleton pulse on dot                         │
│  No data:  Gray dot + "N/A"                              │
│                                                          │
│  SCORE COLORING (5-band)                                 │
│  >= 0.9:  --score-excellent (#26d97f)                    │
│  >= 0.8:  --score-good (#34d399)                         │
│  >= 0.6:  --score-adequate (#e5a00d)                     │
│  >= 0.4:  --score-poor (#f97316)                         │
│  <  0.4:  --score-failing (#f04438)                      │
│                                                          │
│  ACCESSIBILITY                                           │
│  - Shape differentiates status (circle/triangle/square)  │
│  - aria-label includes score, metric, and status text    │
│  - Tooltip focusable via keyboard (Tab + Enter)          │
│  - Color contrast ratio >= 4.5:1 on all backgrounds     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface ScoreBadgeProps {
  score: number | null;
  metricName: string;
  direction?: ScoreDirection;        // 'maximize' (default) or 'minimize'
  label?: string;
  evaluator?: string;
  evaluatorType?: 'llm' | 'rule' | 'human';
  confidence?: { level: 'high' | 'medium' | 'low'; method: string };
  explanation?: string;
  traceId?: string;
  judgeTraceId?: string;
}
```

**Direction-aware coloring:** When `direction` is `'minimize'` (e.g., hallucination, evaluation_latency), the dot color inverts via `scoreColor(score, direction)`. A hallucination score of 0.05 renders with `--score-excellent` (green), while a relevance score of 0.05 renders with `--score-failing` (red). Score direction is inferred from `QualityMetricConfig.alerts[].direction` (`ThresholdDirection`): metrics whose primary alert fires on `'below'` are `maximize` metrics; those firing on `'above'` are `minimize` metrics. The mapping is:

| Metric | Direction | Low Score Color | High Score Color |
|--------|-----------|-----------------|------------------|
| relevance | maximize | red (failing) | green (excellent) |
| faithfulness | maximize | red | green |
| coherence | maximize | red | green |
| task_completion | maximize | red | green |
| tool_correctness | maximize | red | green |
| hallucination | minimize | green (excellent) | red (failing) |
| evaluation_latency | minimize | green | red |

### 4.2 Chain-of-Thought Panel

Derived from [Research Section 3, CoT display patterns](../interface/llm-explainability-research.md#chain-of-thought-explanation-display).

```
┌─────────────────────────────────────────────────────────┐
│  EVALUATION DETAIL                                       │
│                                                          │
│  Metric: relevance        Score: 0.92                    │
│  Label: relevant          Evaluator: claude-sonnet-4-5   │
│                                                          │
│  ┌─ Reasoning ─────────────────────────────────────┐    │
│  │                                                  │    │
│  │  Step 1: Query Analysis                          │    │
│  │  The user asked about deployment configuration   │    │
│  │  for Kubernetes pods in production.               │    │
│  │                                                  │    │
│  │  Step 2: Response Coverage                       │    │
│  │  The response covers: pod spec configuration     │    │
│  │  (yes), resource limits (yes), health checks     │    │
│  │  (yes), rollout strategy (no).                   │    │
│  │                                                  │    │
│  │  Step 3: Completeness                            │    │
│  │  3 of 4 key topics addressed. Missing rollout    │    │
│  │  strategy prevents a perfect score.              │    │
│  │                                                  │    │
│  │  Step 4: Verdict                                 │    │
│  │  Score: 0.92 -- highly relevant with minor gap.  │    │
│  │                                                  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  [v] Judge Configuration                                 │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Model:        claude-sonnet-4-5                  │    │
│  │  Temperature:  0.0                                │    │
│  │  Prompt Ver:   relevance-v2.3                     │    │
│  │  Duration:     1.24s                              │    │
│  │  Tokens:       342 in / 187 out                   │    │
│  │  Input Hash:   a3f8c2...                          │    │
│  │  [View judge trace]                               │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  [>] Evaluated Output (collapsed)                        │
│  [>] Provenance & Audit Trail (collapsed)                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Layout rules:**
- Reasoning section always expanded by default (it answers "why")
- Judge configuration collapsed by default (operational detail)
- Evaluated output collapsed by default (avoids overwhelming with context)
- Provenance section collapsed but always present (regulatory compliance)
- Step numbering uses semantic labels ("Query Analysis") not bare numbers
- Max 500 chars visible before "Show more" truncation

### 4.3 Correlation Alert Card (Toxic Combinations)

Derived from the "toxic combinations" pattern in [Wiz.io research Section 2](../interface/wiz-io-security-explainability-ux.md#2-security-graph-core-visualization-pattern) (where co-occurring low-severity findings compound into critical risk) and [UX Review Gap G1](../interface/quality-dashboard-ux-review.md#1-no-cross-metric-correlation-toxic-combinations).

```
┌─────────────────────────────────────────────────────────┐
│  COMPOUND ALERT                                          │
│                                                          │
│  ■ CRITICAL  Content Quality Crisis                      │
│                                                          │
│  Multiple metrics degraded simultaneously, indicating    │
│  a systemic quality failure.                             │
│                                                          │
│  ┌─ Contributing Metrics ──────────────────────────┐    │
│  │                                                  │    │
│  │  relevance     p50 = 0.65   ▼ below 0.70       │    │
│  │  ────────────────────────────────────────────    │    │
│  │  hallucination avg = 0.14   ▲ above 0.10       │    │
│  │                                                  │    │
│  │  Combined impact: Both conditions active for     │    │
│  │  the past 2h. 127 evaluations affected.          │    │
│  │                                                  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  Remediation:                                            │
│  1. Check recent model deployments for regressions       │
│  2. Review lowest-scoring evaluation explanations         │
│  3. Verify retrieval pipeline for stale context           │
│                                                          │
│  [View relevance detail]  [View hallucination detail]    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Visual treatment:**
- Left border: 4px solid, severity-colored
- Background: subtle severity tint (same as health-banner pattern)
- Contributing metrics shown as inline metric bars with threshold line
- Remediation hints always visible (not collapsed)
- Links to each contributing metric's L2 detail page

### 4.4 Metric Card (Enhanced)

Extends the existing `MetricCard.tsx` with explainability affordances.

```
┌─────────────────────────────────────────────────────────┐
│  Response Relevance                     ● healthy        │
│                                                          │
│  0.8567                                                  │
│  ↑ +2.3%                                                │
│                                                          │
│  avg: 0.8421 · p95: 0.7234                              │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ▁▂▃▅▇█▇▅▃▂▁                                     │   │
│  │ Sparkline: 24h score trend                        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ─────────────────────────────────────────────────────   │
│  n=342  ◐ medium confidence  ▲ 1 alert                  │
│                                                          │
│  Worst: 0.23 "Response completely off-topic,             │
│  discussing pricing when user asked about API..."        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Enhancements over current `MetricCard.tsx`:**
- Sparkline: CSS-only 24h mini trend chart (same data density as the hero number)
- Worst explanation preview: 1-line truncated text from `worstExplanation`
- Click anywhere -> L2 Metric Detail

### 4.5 Health Overview (Enhanced)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  ● All metrics within thresholds                                         │
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │    7     │  │    5     │  │    1     │  │    1     │  │    0     │ │
│  │  Total   │  │ Healthy  │  │ Warning  │  │ Critical │  │ No Data  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                                                          │
│  Judge Uptime: 99.8%    Eval Volume: 1.2k/hr    Last Eval: 12s ago      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Enhancements over current `HealthOverview.tsx`:**
- Pipeline health row: judge uptime (% of evaluations that succeeded), evaluation volume, recency
- These operational signals answer the "Design for Operability" principle from CHI EA '25 ([Research Section 4, principles table](../interface/llm-explainability-research.md#dashboard-design-principles-from-chi-2025-research)). Note: the principle name is from the paper abstract; the application to quality dashboards is the research document's interpretation.

### 4.6 Coverage Heatmap

Adapts the **grid-based coverage matrix** pattern from [Wiz.io Section 5](../interface/wiz-io-security-explainability-ux.md#5-dashboard-and-data-visualization) (originally framework-by-resource compliance cells) to evaluation-by-trace coverage. The abstracted pattern -- color-coded grid cells showing presence/absence across two dimensions -- maps directly to the existing `computeCoverageHeatmap()` (line 2273 in `quality-metrics.ts`).

```
┌─────────────────────────────────────────────────────────┐
│  EVALUATION COVERAGE                                     │
│                                                          │
│  Metric             trace-1  trace-2  trace-3  trace-4  │
│  ─────────────────  ───────  ───────  ───────  ───────  │
│  relevance            ██       ██       ██       ░░     │
│  faithfulness         ██       ██       ░░       ░░     │
│  coherence            ██       ░░       ░░       ░░     │
│  hallucination        ██       ██       ██       ██     │
│  task_completion      ██       ██       ██       ██     │
│  tool_correctness     ██       ██       ░░       ░░     │
│  eval_latency         ██       ██       ██       ██     │
│                                                          │
│  ██ covered   ▒▒ partial   ░░ missing                    │
│                                                          │
│  Overall Coverage: 71%                                   │
│  Gaps: coherence missing for 3 traces,                   │
│        faithfulness missing for 2 traces                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Implementation:** CSS Grid with cells colored by `CoverageStatus`. Hover reveals count per cell. Click a gap cell -> filtered evaluation list for that metric+trace combination.

### 4.7 Pipeline Funnel

Adapts the **progressive filtering funnel** pattern from [Wiz.io Section 5](../interface/wiz-io-security-explainability-ux.md#5-dashboard-and-data-visualization) (originally risk-severity reduction through progressive filters) to evaluation pipeline drop-off. The abstracted pattern -- proportional-width horizontal bars showing volume reduction at each stage -- maps to existing `computePipelineView()` (line 2155 in `quality-metrics.ts`).

```
┌─────────────────────────────────────────────────────────┐
│  EVALUATION PIPELINE                                     │
│                                                          │
│  hallucination    ████████████████████████████  342      │
│                   drop: 0 (0%)                           │
│                                                          │
│  relevance        ████████████████████████     310       │
│                   drop: 32 (9.4%)                        │
│                                                          │
│  faithfulness     ███████████████████          276       │
│                   drop: 34 (11%)                         │
│                                                          │
│  coherence        ████████████████             241       │
│                   drop: 35 (12.7%)                       │
│                                                          │
│  Overall Conversion: 70.5%                               │
│  Bottleneck: coherence (highest drop-off)                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Implementation:** Horizontal bars with proportional width. Drop-off shown as gap between bars. Color shifts from accent to warning at high drop-off rates.

### 4.8 Multi-Agent Turn Visualization

Derived from [Research Section 5](../interface/llm-explainability-research.md#5-multi-agent-evaluation-explainability).

```
┌─────────────────────────────────────────────────────────┐
│  MULTI-AGENT SESSION: session-abc123                     │
│  Overall: 0.82 task_completion                           │
│                                                          │
│  ┌─ Turn 1 ──────────────────────────────────────────┐  │
│  │ User -> Router                                     │  │
│  │ "Help me debug my deployment"                      │  │
│  │                                                    │  │
│  │ Action: Route to DevOps agent                      │  │
│  │ ┌────────┐  ┌──────────────┐                      │  │
│  │ │ ● 0.95 │  │ handoff      │  "Correct routing,  │  │
│  │ │        │  │ correctness  │   deployment keyword │  │
│  │ └────────┘  └──────────────┘   match"             │  │
│  └────────────────────────────────────────────────────┘  │
│         │                                                │
│         v                                                │
│  ┌─ Turn 2 ──────────────────────────────────────────┐  │
│  │ DevOps -> Tool Call                                │  │
│  │ kubectl_get_pods                                   │  │
│  │                                                    │  │
│  │ ┌────────┐  ┌──────────────┐                      │  │
│  │ │ ● 1.00 │  │ tool         │  "Appropriate first  │  │
│  │ │        │  │ correctness  │   diagnostic step"   │  │
│  │ └────────┘  └──────────────┘                      │  │
│  └────────────────────────────────────────────────────┘  │
│         │                                                │
│         v                                                │
│  ┌─ Turn 3 ──────────────────────────────────────────┐  │
│  │ DevOps -> User                                     │  │
│  │ "Your pod is in CrashLoopBackOff..."               │  │
│  │                                                    │  │
│  │ ┌────────┐  ┌──────────────┐                      │  │
│  │ │ ◐ 0.88 │  │ relevancy    │  "Addresses issue   │  │
│  │ │        │  │              │   directly, missing  │  │
│  │ └────────┘  └──────────────┘   remediation steps" │  │
│  └────────────────────────────────────────────────────┘  │
│         │                                                │
│         v                                                │
│  ┌─ Turn 4 ──────────────────────────────────────────┐  │
│  │ DevOps -> SeniorDevOps (Handoff)                   │  │
│  │                                                    │  │
│  │ ┌────────┐  ┌──────────────┐                      │  │
│  │ │ ▲ 0.70 │  │ handoff      │  "Escalation        │  │
│  │ │        │  │ correctness  │   premature --       │  │
│  │ └────────┘  └──────────────┘   sufficient context │  │
│  │                                    to continue"   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Conversation Completeness: 0.75                         │
│  "User's issue identified but not resolved.              │
│   Missing: remediation steps, verification."             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Three-layer evaluation model** (from [Confident AI agent evaluation](https://www.confident-ai.com/blog/definitive-ai-agent-evaluation-guide)):

Agent failures are categorized across three layers, each requiring distinct visual treatment in the turn visualization:

| Layer | What It Evaluates | Visual Indicator | Example Failure |
|-------|------------------|-----------------|-----------------|
| **Reasoning** | Planning quality, dependency awareness, plan adherence | Left border: blue tint | Ignored a dependency, deviated from plan |
| **Action** | Tool selection, argument correctness, call ordering | Left border: amber tint | Wrong tool, incorrect arguments, bad sequence |
| **Execution** | Task completion, efficiency, staying on-task | Left border: red tint | Incomplete task, excessive steps, went off-task |

Each turn card displays a small layer tag (`reasoning` / `action` / `execution`) alongside its score badge when the evaluation targets a specific failure layer. This allows operators to quickly identify whether an agent is failing at the thinking level, the doing level, or the finishing level.

**Layout rules:**
- Vertical timeline with connecting lines between turns
- Each turn shows: role transition, action summary, score badge with inline explanation
- Layer tag (when applicable) displayed as a muted pill next to the metric name
- Warning/critical scores get attention-drawing left border
- Conversation-level score at bottom with full explanation
- Click any turn -> L3 Evaluation Detail for that turn's evaluation

---

## 5. Score Presentation Patterns

Three patterns identified in the research, each serving a different context.

### Pattern 1: Score Badge with Tooltip

**When to use:** Inline on trace/span views, metric cards, evaluation tables.
**Implementation:** `ScoreBadge` component (Section 4.1).
**Behavior:** Hover reveals tooltip with progressive detail; click tooltip link navigates to L3.

### Pattern 2: Evaluation Column on Data Table

**When to use:** L2 Metric Detail, evaluation list views, filtered evaluation queries.
**Implementation:** Sortable/filterable table columns for score, label, explanation, evaluator.

```
┌──────┬───────────┬──────────────────────────────────┬──────────────┬────────────┐
│Score │ Label     │ Explanation                       │ Evaluator    │ Timestamp  │
├──────┼───────────┼──────────────────────────────────┼──────────────┼────────────┤
│ 0.92 │ relevant  │ Response addresses query...       │ claude-4.5   │ 2m ago     │
│ 0.45 │ partial   │ Missing pricing context...        │ claude-4.5   │ 5m ago     │
│ 0.23 │ off-topic │ Response discusses unrelated...   │ claude-4.5   │ 12m ago    │
└──────┴───────────┴──────────────────────────────────┴──────────────┴────────────┘
```

**Column behaviors:**
- Score: color-coded by 5-band scale
- Label: pill-style badge with semantic coloring
- Explanation: truncated to 60 chars, full text in hover tooltip
- Evaluator: monospace, links to judge trace
- Timestamp: relative time, hover reveals absolute ISO timestamp
- Sortable by any column
- Filterable by label, evaluator, score range

### Pattern 3: Dedicated Evaluation Tab

**When to use:** L2 Metric Detail as a tab alongside "Overview" and "Distribution".
**Implementation:** Tab navigation within the metric detail page.

```
[Overview]  [Distribution]  [Evaluations]  [Trend]

┌─────────────────────────────────────────────────────────┐
│  Evaluations (342 in period)                             │
│                                                          │
│  Filter: [All labels ▾] [All evaluators ▾] [Score ▾]   │
│                                                          │
│  ┌── Evaluation table (Pattern 2) ──────────────────┐   │
│  │ ...                                               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Showing 1-25 of 342   [< Prev]  [Next >]              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Confidence Visualization

Derived from [Research Section 3, Confidence Indicators](../interface/llm-explainability-research.md#confidence-indicators).

### Logprob Distribution Display

When confidence is derived from `normalizeWithLogprobs()`, show the probability distribution:

```
┌─────────────────────────────────────────────────────────┐
│  CONFIDENCE: ● high (logprobs)                           │
│                                                          │
│  Score Distribution (from judge logprobs):               │
│                                                          │
│  1 │                    ████                             │
│  2 │                ████████                             │
│  3 │         ████████████████                            │
│  4 │     ████████████████████████                        │
│  5 │ ████████████████████████████████                    │
│    └─────────────────────────────────                    │
│    Token probability distribution                        │
│                                                          │
│  Expected score: 4.2 (weighted mean)                     │
│  Entropy: 0.34 (low = high confidence)                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Multi-Judge Agreement Display

When confidence is derived from `panelEvaluation()`:

```
┌─────────────────────────────────────────────────────────┐
│  CONFIDENCE: ● high (multi-judge agreement)              │
│                                                          │
│  Judge Panel:                                            │
│  claude-sonnet-4-5:  0.92  relevant                     │
│  gpt-4o:             0.88  relevant                     │
│  gemini-2.0:         0.90  relevant                     │
│                                                          │
│  Agreement: 100% (3/3 same label)                        │
│  Score Range: 0.88 - 0.92 (spread: 0.04)                │
│  Consensus Score: 0.90 (median)                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Regulatory Compliance UI

Derived from [Research Section 6](../interface/llm-explainability-research.md#6-regulatory-frameworks).

### 7.1 EU AI Act Article 13 Requirements

Article 13(3) mandates that instructions for use contain at minimum the following. Each subsection maps to a specific UI surface:

| Art. 13(3) | Requirement | UI Surface | Component |
|------------|-------------|-----------|-----------|
| **(a)** | Provider identity and contact details | Footer / About panel | Static text |
| **(b)** | Performance characteristics: intended purpose, accuracy metrics with test context, robustness, cybersecurity, known risk circumstances, output explainability capabilities, per-group performance, input data specifications | L1 metric grid, L2 aggregations, L3 judge config, coverage heatmap | MetricCard, MetricDetail, ConfidencePanel, CoverageHeatmap |
| **(c)** | Pre-determined changes and their impact on performance | Changelog / version history panel | CompliancePanel |
| **(d)** | Human oversight measures including technical aids for output interpretation | Compliance panel, verification tracking, evaluation explanation display | CompliancePanel, CoTPanel |
| **(e)** | Computational and hardware requirements, expected lifetime, maintenance schedule | System info panel | CompliancePanel |
| **(f)** | Log collection, storage, and interpretation mechanisms | L4 trace view, L5 raw data export | TraceContext, RawDataExport |

**Article 13(2) UX standard:** All information must be "concise, complete, correct and clear" and "relevant, accessible and comprehensible to deployers." This is a direct mandate on UI quality -- not just that data is present, but that it is understandable by non-technical deployers. The role-based views (Executive/Operator/Auditor) serve this requirement by presenting the same data at appropriate abstraction levels.

**Article 50(5) timing constraint:** Disclosure must be provided "in a clear and distinguishable manner at the latest at the time of the first interaction or exposure." For the dashboard, this means:
- AI-generated content labels must appear before or alongside content, never after
- Evaluation explanations generated by LLM judges should be visually distinguishable from human-authored content
- The provenance panel (Section 7.3) must clearly identify which evaluations were produced by automated judges vs. human annotators

### 7.2 NIST AI RMF Alignment

| NIST Function | UI Surface | What It Shows |
|---------------|-----------|---------------|
| GOVERN | Settings / threshold configuration | Evaluation criteria, judge selection, threshold policies |
| MAP | Coverage heatmap | Where evaluations exist and where gaps remain |
| MEASURE | L1 dashboard + L2 metric detail | Continuous quality measurement with statistical rigor |
| MANAGE | Operator view + alerts + trends | Production monitoring with remediation guidance |

### 7.3 Provenance Panel

Present on every L3 Evaluation Detail view:

```
┌─────────────────────────────────────────────────────────┐
│  AUDIT TRAIL                                             │
│                                                          │
│  Evaluation ID:    eval-a3f8c2e1                         │
│  Trace ID:         4a2b1c3d-...                          │
│  Span ID:          7e8f9a0b-...                          │
│  Session ID:       session-abc123                        │
│  Input Hash:       sha256:a3f8c2...                      │
│                                                          │
│  Evaluated At:     2026-02-14T10:23:45.123Z              │
│  Judge Model:      claude-sonnet-4-5                     │
│  Judge Temperature: 0.0                                  │
│  Prompt Version:   relevance-v2.3                        │
│  Duration:         1.24s                                 │
│  Token Usage:      342 input / 187 output                │
│                                                          │
│  OTel Event:       gen_ai.evaluation.result              │
│  Attributes:                                             │
│    gen_ai.evaluation.name:        relevance              │
│    gen_ai.evaluation.score.value: 0.92                   │
│    gen_ai.evaluation.score.label: relevant               │
│    gen_ai.evaluation.explanation: "The response..."      │
│                                                          │
│  [Export as JSON]  [Copy trace link]                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Temporal Visualization

### 8.1 Period-Over-Period Comparison

```
┌─────────────────────────────────────────────────────────┐
│  RELEVANCE TREND (7d)                                    │
│                                                          │
│  1.0 ┤                                                  │
│      │     ╭─╮                      current (solid)     │
│  0.8 ┤ ╭──╯  ╰──╮   ╭──╮                               │
│      │╯         ╰──╯   ╰─╮                              │
│  0.6 ┤                    ╰──                            │
│      │  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌  previous (dashed)          │
│  0.4 ┤                                                  │
│      │ ─ ─ ─ ─ ─ ─ ─ ─ ─  warning threshold           │
│  0.2 ┤                                                  │
│      │ · · · · · · · · · ·  critical threshold          │
│  0.0 ┤──┬──┬──┬──┬──┬──┬──                              │
│        Mon Tue Wed Thu Fri Sat Sun                       │
│                                                          │
│  Delta: -3.2% vs previous period                         │
│  Velocity: -0.46%/day                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Sparkline (Inline Trend)

For metric cards -- 24h trend in a compact 80x20px area:

```css
.sparkline {
  display: flex;
  align-items: flex-end;
  gap: 1px;
  height: 20px;
  width: 80px;
}
.sparkline-bar {
  flex: 1;
  background: var(--accent-primary);
  border-radius: 1px 1px 0 0;
  min-height: 1px;
  opacity: 0.6;
}
.sparkline-bar:last-child {
  opacity: 1;
}
```

24 bars (one per hour), height proportional to score. Last bar full opacity to emphasize recency.

---

## 9. Interaction Patterns

### 9.1 Alert-to-Explanation Drill-Down

The signature interaction pattern. Derived from [Research Section 4, "Alert-to-trace linkage"](../interface/llm-explainability-research.md#making-percentile-metrics-actionable).

```
Step 1: Alert triggers on L1
  [CRITICAL] hallucination: Hallucination rate (0.2500) critically high (n=342)
  Click -> Step 2

Step 2: L2 Metric Detail with alert context
  Score distribution shows bimodal pattern
  Worst evaluations table shows 5 lowest scores with explanations
  Click worst evaluation -> Step 3

Step 3: L3 Evaluation Detail
  Full chain-of-thought reasoning from the judge
  "The response fabricated a pricing table that does not exist
   in the provided context. Specifically, the prices for..."
  Judge trace link available
  Trace ID links to L4

Step 4: L4 Trace Context (optional)
  Full span tree of the original LLM call
  Shows the input context, retrieved documents, and generated output
  Explains WHY the LLM hallucinated (e.g., stale retrieval context)
```

**Total clicks from alert to explanation: 2** (alert -> worst evaluation -> reasoning visible).

### 9.2 Cross-Metric Investigation

When a correlation alert fires:

```
Step 1: Correlation alert on L1
  [CRITICAL] Content Quality Crisis
  relevance (p50=0.65) + hallucination (avg=0.14)
  Click -> Step 2

Step 2: Split-view comparison
  Left: relevance L2 detail
  Right: hallucination L2 detail
  Shared timeline overlay shows when both degraded
  Click specific timepoint -> filtered evaluations at that time

Step 3: Filtered evaluation list
  Shows evaluations from both metrics at the degradation timepoint
  Sortable, with explanations visible
```

### 9.3 Keyboard Navigation

| Key | Action |
|-----|--------|
| `j`/`k` | Navigate between metric cards (L1) or evaluation rows (L2) |
| `Enter` | Drill down to detail view |
| `Escape` | Return to parent level |
| `1`-`3` | Switch role view (Executive/Operator/Auditor) |
| `?` | Show keyboard shortcut overlay |
| `r` | Refresh data |

---

## 10. Responsive Behavior

### Breakpoints

| Breakpoint | Layout | Metric Grid |
|-----------|--------|-------------|
| >= 1280px | Full 4-column grid | `repeat(auto-fit, minmax(300px, 1fr))` |
| 768-1279px | 2-column grid | `repeat(auto-fit, minmax(280px, 1fr))` |
| < 768px | Single column stack | `1fr` |

### Mobile Adaptations
- Score badge tooltips become bottom-sheet modals
- Sparklines hidden (insufficient resolution)
- Coverage heatmap becomes a scrollable table
- Turn visualization collapses to expandable accordion
- Period selector becomes a dropdown instead of button group

---

## 11. Accessibility Requirements

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|------------|---------------|
| Color contrast | All text >= 4.5:1 ratio on backgrounds; status colors tested against card background |
| Non-color indicators | Shapes differentiate status: circle (healthy), triangle (warning), square (critical), hollow circle (no_data) |
| Keyboard navigation | All interactive elements focusable via Tab; Enter activates; Escape dismisses |
| Screen reader | `aria-label` on all status indicators, score badges, and interactive elements |
| Reduced motion | `prefers-reduced-motion: reduce` disables all animations except skeleton loading |
| Focus indicators | 2px solid `--accent-primary` outline on focus, offset by 2px |
| Semantic HTML | `<nav>`, `<main>`, `<section>`, `<article>` for landmark navigation |
| Live regions | Alert list uses `aria-live="polite"` for new alerts; critical alerts use `aria-live="assertive"` |

### Score Color Accessibility

The 5-band score scale is designed for deuteranopia (red-green color blindness):
- Excellent/Good use green shades (distinguishable as brightness difference)
- Adequate uses amber (distinct hue)
- Poor uses orange (distinct from green)
- Failing uses red (paired with square shape indicator)

All score displays include the numeric value alongside color, ensuring no information is conveyed by color alone.

---

## 12. Performance Budget

| Metric | Target | Rationale |
|--------|--------|-----------|
| First Contentful Paint | < 1.0s | Dashboard is localhost, minimal network |
| Largest Contentful Paint | < 1.5s | Hero metric numbers should render first |
| Time to Interactive | < 2.0s | TanStack Query prefetch on mount |
| Bundle size (gzipped) | < 80KB | No charting library; CSS-only histograms and sparklines |
| Re-render on data refresh | < 16ms | React.memo on MetricCard; 30s poll interval |
| Maximum concurrent API calls | 2 | Dashboard + metric detail (parallel via TanStack) |
| Data refresh interval | 30s | Matches current `useDashboard` stale time |
| Tooltip render latency | < 50ms | Precomputed tooltip content in memo |

---

## 13. Component-to-Data Mapping

Maps each UI component to the data source and API endpoint it consumes. Line references verified against `quality-metrics.ts` and `llm-as-judge.ts` as of 2026-02-15.

| Component | Data Source | API Endpoint | Backend Function |
|-----------|-----------|-------------|-----------------|
| HealthOverview | `QualityDashboardSummary` | `GET /api/dashboard` | `computeDashboardSummary()` (L816) |
| MetricCard | `QualityMetricResult` | `GET /api/dashboard` | `computeQualityMetric()` (L751) |
| MetricDetail | `MetricDetailResult` | `GET /api/metrics/:name` | `computeMetricDetail()` (L1562) |
| ScoreBadge | `EvaluationResult` | (inline from parent) | N/A |
| AlertList | `TriggeredAlert[]` | `GET /api/dashboard` | `checkAlertThresholds()` (L693) |
| CorrelationAlert | `TriggeredAlert` (where `isCompound: true`) | `GET /api/dashboard` | `evaluateCorrelationRules()` via `MetricCorrelationRule` registry |
| CoTPanel | `EvaluationResult.explanation` | `GET /api/evaluations/:id` | `obs_query_evaluations` |
| CoverageHeatmap | `CoverageHeatmap` | `GET /api/coverage` | `computeCoverageHeatmap()` (L2273) |
| PipelineFunnel | `PipelineResult` | `GET /api/pipeline` | `computePipelineView()` (L2155) |
| TurnVisualization | `MultiAgentEvaluation` | `GET /api/agents/:sessionId` | Agent-as-judge query |
| ConfidencePanel | `ConfidenceIndicator` (L118 in `quality-metrics.ts`) | (inline from parent) | `normalizeWithLogprobs()` (L814 in `llm-as-judge.ts`) |
| SLATable | `SLAComplianceResult[]` | `GET /api/dashboard` | `evaluateSLA()` (L1714) / `evaluateSLAs()` (L1765) |
| ProvenancePanel | `EvaluationResult` + OTel attrs | `GET /api/evaluations/:id` | Backend JSONL/OTel |
| Sparkline | Score time series | `GET /api/metrics/:name/trend` | `computeTrend()` (L1938) |

---

## 14. Current Dashboard Audit

### What to Keep (v2.9)

| Component | Assessment |
|-----------|-----------|
| Dark theme (GitHub-style) | Keep. Professional, reduces eye strain for monitoring. Evolve colors per Section 2.1 |
| CSS Grid auto-fit layout | Keep. Responsive without media queries |
| React.memo on MetricCard | Keep. Essential for 30s poll performance |
| TanStack Query + stale-while-revalidate | Keep. Best-in-class data fetching pattern |
| Wouter routing (1.5KB) | Keep. Adequate for current route count |
| Hono API on 127.0.0.1 | Keep. Security-correct localhost binding |
| Pure CSS histograms | Keep. No charting library needed for 10-20 buckets |
| Shape-differentiated status badges | Keep. Critical for accessibility |
| 3 role views | Keep. Expand with the patterns from Section 4.5+ |

### What to Change

| Current | Issue | Target |
|---------|-------|--------|
| System font stack | Generic; no monospace distinction for data | JetBrains Mono + IBM Plex Sans |
| Flat alert list | No correlation grouping | Correlation alert cards (Section 4.3) |
| Truncated explanation in eval table | Explanation is the key explainability data | CoT panel with collapsible sections (Section 4.2) |
| No sparklines | No inline trend context on cards | CSS sparkline bars (Section 8.2) |
| No score tooltip | Missing the Langfuse Pattern 1 affordance | ScoreBadge with hover tooltip (Section 4.1) |
| Single remediation hint line | Insufficient for actionable guidance | Full remediation section with numbered steps |
| No pipeline/coverage views | Missing G8/G9 visualizations | Pipeline funnel + coverage heatmap |
| No keyboard navigation | Mouse-only interaction | Full keyboard nav (Section 9.3) |
| No provenance panel | No regulatory audit trail in UI | Provenance panel on L3 (Section 7.3) |
| No multi-agent visualization | Agent evaluation data exists but no UI | Turn timeline (Section 4.8) |

### What to Add

| Feature | Priority | Section |
|---------|----------|---------|
| Score badge tooltip (Langfuse Pattern 1) | P1 | 4.1 |
| Chain-of-thought panel | P1 | 4.2 |
| Correlation alert card | P1 | 4.3 |
| Sparkline on metric cards | P2 | 8.2 |
| Coverage heatmap page | P2 | 4.6 |
| Pipeline funnel page | P2 | 4.7 |
| Provenance/audit panel | P2 | 7.3 |
| Confidence visualization | P2 | 6 |
| Period-over-period trend chart | P2 | 8.1 |
| Multi-agent turn visualization | P3 | 4.8 |
| Keyboard navigation | P3 | 9.3 |
| L3 Evaluation Detail page | P1 | 3.1 |
| L4 Trace Context page | P3 | 3.1 |
| Compliance panel page | P3 | 7 |
| Composite Quality Index (CQI) for Executive view | P2 | 16.3 |
| Adaptive score scaling per metric distribution | P2 | 16.2 |
| Metric velocity/acceleration with breach projection | P2 | 16.3 |
| Data-driven correlation matrix | P3 | 16.3 |
| Role-aware feature selection config | P2 | 16.4 |

---

## 15. Implementation Sequence

### Phase 1: Explainability Core (P1)

New components and routes that deliver the primary explainability value.

| Task | Components | Effort |
|------|-----------|--------|
| L3 Evaluation Detail page (`/evaluations/:id`) | CoTPanel, JudgeConfig, ProvenancePanel | Medium |
| Score badge tooltip on MetricCard and EvalTable | ScoreBadge with tooltip | Low |
| Correlation alert card in AlertList | CorrelationAlertCard | Low |
| Enhance EvaluationDetail table with full explanation column | Expand truncation, add label pills | Low |
| API route: `GET /api/evaluations/:id` | New Hono route, backend query | Medium |

### Phase 2: Visualization (P2)

New pages and visualization components that surface existing backend data.

| Task | Components | Effort |
|------|-----------|--------|
| Coverage heatmap page (`/coverage`) | CoverageHeatmap grid | Medium |
| Pipeline funnel page (`/pipeline`) | PipelineFunnel bars | Low |
| Sparkline on MetricCard | CSS sparkline component | Low |
| Period-over-period trend on MetricDetail | TrendChart (CSS or lightweight SVG) | Medium |
| Confidence panel in evaluation detail | LogprobDistribution, MultiJudgePanel | Medium |
| API routes: `/api/coverage`, `/api/pipeline`, `/api/metrics/:name/trend` | New Hono routes | Medium |

### Phase 3: Advanced (P3)

Features that require new data sources or complex interaction patterns.

| Task | Components | Effort |
|------|-----------|--------|
| Multi-agent turn visualization (`/agents/:sessionId`) | TurnTimeline | High |
| L4 Trace context page (`/traces/:traceId`) | SpanTree, EvaluationEventOverlay | High |
| Keyboard navigation system | KeyboardNav provider, shortcut overlay | Medium |
| Compliance panel page (`/compliance`) | CompliancePanel with framework mapping | Medium |
| Cross-metric split view for correlation investigation | SplitPane layout | Medium |

### Phase 4: Feature Engineering (P2-P3)

Derived features and adaptive presentation computed from existing evaluation data.

| Task | Components/Functions | Effort | Section |
|------|---------------------|--------|---------|
| Adaptive score scaling per metric | `adaptiveScoreColor()`, `METRIC_SCALE_STRATEGY` | Low | 16.2 |
| Label ordinal encoding for eval table sort/filter | `labelToOrdinal()`, 3-tier filter (Pass/Review/Fail) | Low | 16.2 |
| Composite Quality Index (CQI) for Executive view | `computeCQI()`, stacked contribution bar | Medium | 16.3 |
| Metric velocity & acceleration with breach projection | `computeMetricDynamics()`, projection line on trend chart | Medium | 16.3 |
| Coverage-weighted confidence | `computeCoverageWeightedConfidence()`, adjusted badge | Low | 16.3 |
| Data-driven correlation matrix | `computeCorrelationMatrix()`, heatmap on `/correlations` | Medium | 16.3 |
| Degradation signal feature (variance trend) | `computeDegradationSignal()`, sparkline variance overlay | Medium | 16.1 |
| Role-aware feature config | `ROLE_FEATURE_CONFIG`, conditional rendering in role views | Low | 16.4 |

---

## 16. Feature Engineering for Evaluation Analytics

> **Note:** This section contains **original design proposals** -- not translations of the source research. The statistical methods (Gini coefficient, Pearson R, composite quality index) and derived features are new recommendations informed by the research patterns but extending beyond what the source documents describe. All proposed interfaces and functions are marked *(proposed)* in their headings. Lead-time estimates in Section 16.1 are projected based on metric characteristics, not empirically measured. Weight values in Section 16.3 (CQI) are initial recommendations, not tuned from production data.

This section applies feature engineering principles to the evaluation data flowing through the dashboard. The raw `EvaluationResult` records and `QualityMetricResult` aggregations contain latent signals that, when properly transformed, enable better anomaly detection, correlation discovery, and role-appropriate information presentation.

### 16.1 Feature Importance: Quality Degradation Predictors

Theoretical analysis of the 7 core metrics against the `TriggeredAlert` history suggests a predictive hierarchy for quality degradation. Features are ranked by their estimated lead-time signal strength -- how early they would predict a transition from `healthy` to `warning`/`critical`. Lead times are projected estimates based on metric characteristics, not empirical measurements.

| Rank | Feature | Source Field | Signal Type | Est. Lead Time | Rationale |
|------|---------|-------------|-------------|----------------|-----------|
| 1 | **Score variance (rolling 1h)** | `scoreStdDev` from `ConfidenceIndicator` | Leading | 15-30min | Variance spikes precede mean shifts. A stable metric with sudden stdDev increase from 0.05 to 0.20 predicts threshold breach before the aggregation moves |
| 2 | **Hallucination-relevance divergence** | `hallucination.avg - (1 - relevance.avg)` | Leading | 10-20min | When hallucination rises while relevance hasn't yet dropped, retrieval pipeline degradation is likely. This is the highest-signal toxic combination from `MetricCorrelationRule` |
| 3 | **Evaluation latency percentile shift** | `evaluation_latency.p95 / evaluation_latency.p50` | Leading | 5-15min | A rising p95/p50 ratio indicates tail-latency bloat in the judge pipeline, often preceding judge failures that reduce `sampleCount` and destabilize all other metrics |
| 4 | **Coverage dropout rate** | `CoverageGap.missingInputs.length / CoverageHeatmap.inputs.length` | Coincident | 0-5min | Missing evaluations for specific traces indicate pipeline failures. >20% dropout rate correlates with unreliable aggregations |
| 5 | **Evaluator agreement decay** | `evaluatorAgreement` from `ConfidenceIndicator` | Lagging | 0min | Agreement drops after quality has already shifted. Useful for confirming degradation but not predicting it |
| 6 | **Worst-score trajectory** | `worstExplanation.score` delta over 3 periods | Lagging | -10min | The worst evaluation score trend lags because it requires multiple low scores to shift the worst evaluation |
| 7 | **Sample count deviation** | `sampleCount` vs expected rate (`evalVolume / metricCount`) | Coincident | 0min | Below-expected sample counts indicate pipeline drops. Derived from `PipelineDropoff.dropoffPercent` |

**Dashboard application:** The MetricCard sparkline (Section 8.2) should prioritize rendering the #1 feature (score variance) as an overlay band rather than just the mean score. The existing `MetricTrend.percentChange` captures #6 but misses the variance signal.

**Proposed derived field on `QualityMetricResult`:**

```typescript
interface DegradationSignal {
  varianceTrend: 'increasing' | 'stable' | 'decreasing';
  varianceRatio: number;         // current stdDev / baseline stdDev
  coverageDropoutRate: number;   // 0-1, from CoverageHeatmap
  latencySkewRatio: number;      // p95/p50 for evaluation_latency
  predictedStatus?: 'healthy' | 'warning' | 'critical';  // based on feature combination
}
```

### 16.2 Feature Scaling & Encoding for Score Presentation

The 7 metrics operate on different native scales and distributions, which affects how the 5-band color scale (Section 2.1) maps to perceived severity.

#### Scale Normalization

| Metric | Native Range | Distribution Shape | Scaling Strategy |
|--------|-------------|-------------------|-----------------|
| relevance | [0, 1] | Left-skewed (most scores > 0.7) | **Quantile-based bands** -- the 5-band thresholds should reflect the empirical distribution, not uniform cuts. If 80% of scores are > 0.8, a score of 0.7 is more alarming than the uniform scale suggests |
| faithfulness | [0, 1] | Bimodal (0.9+ or < 0.3) | **Binary emphasis** -- the bimodal distribution means the adequate/poor/failing bands (0.4-0.8) are sparsely populated. Consider collapsing to 3 bands (pass/borderline/fail) for this metric |
| coherence | [0, 1] | Normal-ish (centered ~0.8) | **Standard 5-band** -- uniform scaling works because scores distribute across the range |
| hallucination | [0, 1] | Right-skewed (most scores < 0.1) | **Log-scale encoding** -- linear bands waste resolution in the 0-0.1 range where most values cluster. `logScale(v) = -log10(max(v, 0.001)) / 3` maps 0.001-1.0 to 1.0-0.0, spreading the low-end |
| task_completion | [0, 1] | Bimodal (0 or 1 for rule-based) | **Step function** -- when evaluator is `rule`, use binary pass/fail. When evaluator is `llm`, use standard 5-band |
| tool_correctness | [0, 1] | Discrete (from `ToolVerification.score`) | **Categorical encoding** -- scores are computed from boolean composites (`toolCorrect && argsCorrect && resultCorrect`). Display as fraction "2/3 correct" alongside the numeric score |
| evaluation_latency | [0, +inf) seconds | Heavy right-tail | **Percentile-rank encoding** -- raw seconds are meaningless without context. Display as percentile rank against the metric's own history: "faster than 73% of evaluations" |

**Proposed utility:**

```typescript
type ScaleStrategy = 'quantile' | 'binary' | 'uniform' | 'log' | 'step' | 'categorical' | 'percentile_rank';

const METRIC_SCALE_STRATEGY: Record<string, ScaleStrategy> = {
  relevance: 'quantile',
  faithfulness: 'binary',
  coherence: 'uniform',
  hallucination: 'log',
  task_completion: 'step',
  tool_correctness: 'categorical',
  evaluation_latency: 'percentile_rank',
};

function adaptiveScoreColor(
  value: number,
  metric: string,
  direction: ScoreDirection,
  distribution?: { p10: number; p25: number; p50: number; p75: number; p90: number }
): string {
  const strategy = METRIC_SCALE_STRATEGY[metric] ?? 'uniform';
  switch (strategy) {
    case 'quantile':
      if (!distribution) return scoreColor(value, direction);
      // Map value to its position within the empirical distribution
      const rank = empiricalCDF(value, distribution);
      return scoreColor(rank, 'maximize');
    case 'log':
      const logNorm = Math.min(1, -Math.log10(Math.max(value, 0.001)) / 3);
      return scoreColor(logNorm, 'maximize');
    case 'binary':
      return value >= 0.7 ? 'var(--score-excellent)' : 'var(--score-failing)';
    default:
      return scoreColor(value, direction);
  }
}
```

**Dashboard application:** The `scoreColor()` function in Section 2.1 should be replaced with `adaptiveScoreColor()` once distribution data is available from `MetricDetailResult.scoreDistribution`. The uniform fallback preserves backward compatibility.

#### Label Encoding for Evaluation Table (Section 5, Pattern 2)

The `scoreLabel` field from `EvaluationResult` is free-text from the judge. For consistent filtering and sorting, encode labels into an ordinal scheme:

| Raw Label | Ordinal | Filter Category |
|-----------|---------|-----------------|
| `excellent`, `highly_relevant`, `fully_faithful` | 4 | Pass |
| `relevant`, `good`, `faithful` | 3 | Pass |
| `partial`, `borderline`, `adequate` | 2 | Review |
| `off-topic`, `irrelevant`, `unfaithful` | 1 | Fail |
| `hallucinated`, `fabricated`, `toxic` | 0 | Fail |

The ordinal encoding enables `ORDER BY label_ordinal` in the evaluation table without alphabetical sorting artifacts. The 3-tier filter (Pass/Review/Fail) reduces cognitive load in the Pattern 2 column filter.

### 16.3 Derived & Composite Features

These features do not exist in the raw data but are computed from combinations of existing fields. They enhance the correlation detection (Section 4.3) and coverage analysis (Section 4.6).

#### Composite Quality Index (CQI) *(proposed)*

A single weighted score combining all 7 metrics into one number for the Executive view. This is an original design proposal; weight values are initial recommendations, not empirically tuned.

```typescript
interface CompositeQualityIndex {
  value: number;            // 0-1 weighted composite
  weights: Record<string, number>;
  contributions: Array<{
    metric: string;
    rawScore: number;
    normalizedScore: number;  // after direction normalization
    weight: number;
    contribution: number;     // normalizedScore * weight
  }>;
}

const DEFAULT_CQI_WEIGHTS: Record<string, number> = {
  relevance: 0.25,          // highest business impact
  faithfulness: 0.20,       // factual correctness
  hallucination: 0.20,      // inverse weight (direction: minimize)
  task_completion: 0.15,    // end-to-end success
  coherence: 0.10,          // output quality
  tool_correctness: 0.05,   // agent-specific
  evaluation_latency: 0.05, // operational
};
```

**Dashboard application:** Displayed as a single hero number on the Executive view. The `contributions` array powers a stacked bar showing which metrics contribute most to the composite, enabling executives to see "relevance is dragging overall quality down" without inspecting individual metrics.

#### Metric Velocity & Acceleration *(proposed)*

Beyond `MetricTrend.percentChange` (first derivative), compute acceleration (second derivative) to detect inflection points. Extends the existing `MetricTrend` interface with new derived fields.

```typescript
interface MetricDynamics {
  velocity: number;         // rate of change per hour (existing: percentChange / period_hours)
  acceleration: number;     // change in velocity per hour
  inflectionDetected: boolean;  // true when acceleration sign flips
  projectedStatus: 'healthy' | 'warning' | 'critical';  // linear projection
  projectedBreachTime?: string; // ISO timestamp when threshold would be breached at current velocity
}
```

**Dashboard application:** The period-over-period chart (Section 8.1) should display `projectedBreachTime` as a dashed projection line extending beyond the current data. A metric decelerating toward a threshold (negative acceleration, positive velocity toward breach) is less urgent than one accelerating toward it.

#### Coverage-Weighted Confidence *(proposed)*

The existing `ConfidenceIndicator` (L118 in `quality-metrics.ts`) uses sample count and stdDev but ignores coverage uniformity. A metric with 100 evaluations all from the same session is less representative than 100 evaluations across 50 sessions. The Gini coefficient approach is adapted from standard distributional uniformity measures.

```typescript
interface CoverageWeightedConfidence extends ConfidenceIndicator {
  coverageUniformity: number;  // 0-1, Gini coefficient of evaluations per input
  effectiveSampleSize: number; // sampleCount * coverageUniformity
  adjustedLevel: 'low' | 'medium' | 'high';  // recalculated using effectiveSampleSize
}
```

**Dashboard application:** The confidence badge in the MetricCard footer (Section 4.4) should use `adjustedLevel` instead of `level` when coverage data is available. This prevents false confidence from clustered evaluations.

#### Correlation Strength Matrix *(proposed)*

Enhance the existing `MetricCorrelationRule` (static rules, L219 in `quality-metrics.ts`) with data-driven correlation detection using Pearson R.

```typescript
interface CorrelationFeature {
  metricA: string;
  metricB: string;
  pearsonR: number;           // linear correlation (-1 to 1)
  lagHours: number;           // time lag where correlation is strongest
  coOccurrenceRate: number;   // fraction of periods where both are degraded simultaneously
  isKnownToxicCombo: boolean; // matches a configured MetricCorrelationRule
}
```

**Dashboard application:** The correlation view (`/correlations`, Section 3.2) should display a heatmap matrix of `pearsonR` values between all metric pairs, with `lagHours` shown on hover. Cells matching known toxic combinations from `MetricCorrelationRule` get the critical border treatment. Novel high-correlation pairs (|pearsonR| > 0.7, not in rules) are surfaced as "discovered correlations" for operator investigation.

### 16.4 Feature Selection by Role View

Each role view (Section 3.2) serves a different decision function and therefore requires a different feature subset. This is analogous to feature selection in ML: the executive model optimizes for rapid triage, the operator model for root-cause investigation, the auditor model for completeness.

#### Feature-to-Role Matrix

| Feature | Executive | Operator | Auditor | Rationale |
|---------|:---------:|:--------:|:-------:|-----------|
| Composite Quality Index (CQI) | **primary** | secondary | reference | Executives need one number; operators already see individual metrics |
| CQI contribution breakdown | visible | hidden | visible | Executives want "what's dragging us down"; operators don't need aggregation |
| Individual metric scores (avg) | summary only | **primary** | **primary** | Operators act on individual metrics; auditors audit them |
| Score distribution (histogram) | hidden | visible | **primary** | Distribution shape matters for operators debugging bimodal failures |
| Score variance (stdDev) | hidden | **primary** | visible | Operators detect instability; auditors verify measurement quality |
| Metric velocity | badge only | **primary** | visible | Operators need rate-of-change to prioritize; executives see trend arrow |
| Metric acceleration | hidden | visible | hidden | Second-derivative only useful for experienced operators |
| Projected breach time | badge only | **primary** | hidden | Operators triage by urgency; executives see "time until problem" |
| Worst evaluation explanation | 1-line | full CoT | full CoT + provenance | Executives scan headlines; operators/auditors read reasoning |
| Correlation alerts (compound) | headline | full detail + remediation | full detail + rule config | Executives see "crisis"; operators see "how to fix"; auditors see "why this rule" |
| Coverage dropout rate | percentage | heatmap | heatmap + gap list | Progressive detail by role |
| Pipeline conversion | percentage | funnel visualization | funnel + per-stage breakdown | Executives see throughput; operators see bottlenecks |
| Confidence (coverage-weighted) | badge | badge + distribution | full breakdown | Auditors need the methodology; executives need the verdict |
| Evaluator agreement | hidden | visible | **primary** | Auditors validate judge reliability; operators use it as a triage signal |
| SLA compliance | compliant/non | gap + margin | full SLA definition + history | Executives: "are we meeting SLAs?"; auditors: "prove it" |
| Provenance/audit trail | hidden | link | **primary** | Auditors require full traceability per EU AI Act Art. 13 |
| Multi-agent turn scores | hidden | visible (if agent sessions exist) | visible | Agent evaluation is operational detail |
| Raw JSONL/OTel attributes | hidden | hidden | exportable | Only auditors need L5 raw data |

#### Implementation: Role-Aware Feature Flags

```typescript
interface RoleFeatureConfig {
  showCQI: boolean;
  showCQIBreakdown: boolean;
  showVariance: boolean;
  showAcceleration: boolean;
  showProjectedBreach: boolean;
  showCorrelationRemediation: boolean;
  showCoverageHeatmap: boolean;
  showPipelineFunnel: boolean;
  showProvenance: boolean;
  showRawExport: boolean;
  explanationTruncation: number;  // chars before "Show more"
  maxWorstEvaluations: number;    // how many worst evals to show
}

const ROLE_FEATURE_CONFIG: Record<RoleViewType, RoleFeatureConfig> = {
  executive: {
    showCQI: true,
    showCQIBreakdown: true,
    showVariance: false,
    showAcceleration: false,
    showProjectedBreach: true,   // as badge tooltip
    showCorrelationRemediation: false,
    showCoverageHeatmap: false,
    showPipelineFunnel: false,
    showProvenance: false,
    showRawExport: false,
    explanationTruncation: 80,
    maxWorstEvaluations: 1,
  },
  operator: {
    showCQI: false,              // operators think in individual metrics
    showCQIBreakdown: false,
    showVariance: true,
    showAcceleration: true,
    showProjectedBreach: true,
    showCorrelationRemediation: true,
    showCoverageHeatmap: true,
    showPipelineFunnel: true,
    showProvenance: false,
    showRawExport: false,
    explanationTruncation: 500,
    maxWorstEvaluations: 5,
  },
  auditor: {
    showCQI: true,               // reference, not primary
    showCQIBreakdown: true,
    showVariance: true,
    showAcceleration: false,
    showProjectedBreach: false,
    showCorrelationRemediation: true,
    showCoverageHeatmap: true,
    showPipelineFunnel: true,
    showProvenance: true,
    showRawExport: true,
    explanationTruncation: 2000,
    maxWorstEvaluations: 10,
  },
};
```

**Dashboard application:** The existing `computeRoleView(dashboard, role, options?)` function (line 1372 in `quality-metrics.ts`) dispatches on `RoleViewType` to return distinct type shapes (`ExecutiveView`, `OperatorView`, `AuditorView` -- defined at lines 1304-1350). The optional `RoleViewOptions` parameter controls limits like `topIssuesLimit` and `minActionableSampleCount`. The `RoleFeatureConfig` extends this pattern to the frontend rendering layer, ensuring components conditionally render features based on the active role without prop-drilling individual visibility flags.

### 16.5 Feature Pipeline: From Raw Evaluation to Dashboard Feature

```
EvaluationResult (JSONL/OTel)
  │
  ├─ [1] Ingest & Validate
  │   scoreValue clamped to range, scoreLabel normalized to ordinal
  │
  ├─ [2] Aggregate (existing: computeQualityMetric, computeCoverageHeatmap)
  │   avg, p50, p95, min, max, count
  │   CoverageHeatmap (inputs x evaluationNames grid)
  │
  ├─ [3] Derive (new: computeDerivedFeatures)
  │   ├─ variance trend (rolling 1h window)
  │   ├─ velocity & acceleration (from consecutive MetricTrend)
  │   ├─ coverage-weighted confidence (from [2] CoverageHeatmap + ConfidenceIndicator)
  │   ├─ composite quality index (from all metric avgs + weights)
  │   └─ correlation matrix (from paired metric time series)
  │
  ├─ [4] Scale & Encode (new: adaptiveScoreColor, label ordinal)
  │   ├─ per-metric scaling strategy applied
  │   └─ labels encoded for sort/filter
  │
  └─ [5] Select & Present (existing: role views + new RoleFeatureConfig)
      ├─ executive: CQI + status + trend badge
      ├─ operator: individual metrics + variance + remediation
      └─ auditor: full detail + provenance + raw export
```

Steps [1] and [2] exist today in the backend (`computeQualityMetric()` at L751 and `computeCoverageHeatmap()` at L2273 in `quality-metrics.ts`). Step [3] depends on Step [2]'s `CoverageHeatmap` output for coverage-weighted confidence. Steps [3] and [4] are proposed derived feature computations (see Section 16.3). Step [5] extends the existing `computeRoleView()` (L1372) with frontend feature flags.

**Compute budget:** Steps [3]-[4] must complete within the 30s poll interval. The correlation matrix is O(m^2 * n) where m=7 metrics and n=evaluation count per period. For n=1000 and m=7, this is ~49K comparisons -- well within budget. The CQI and velocity computations are O(m), negligible.

---

## Sources

### Primary Research (audited)
- [LLM Explainability Research](../interface/llm-explainability-research.md) -- 981 lines, 6 platform analyses, OTel conventions, regulatory mapping
- [Wiz.io Security Explainability UX Research](../interface/wiz-io-security-explainability-ux.md) -- 394 lines, progressive disclosure, toxic combinations, attack path visualization
- [Quality Dashboard UX Review](../interface/quality-dashboard-ux-review.md) -- 272 lines, 11 gaps identified, 6-phase implementation sequence
- [Quality Metrics Dashboard](../interface/quality-metrics-dashboard.md) -- 530 lines, architecture spec, current implementation reference
- [Interface Research Index](../interface/README.md) -- Consolidated recommendation mapping, approach comparison

### Platform Source Material
- [Langfuse: LLM-as-a-Judge Execution Tracing](https://langfuse.com/changelog/2025-10-16-llm-as-a-judge-execution-tracing) -- Score badge tooltip, execution trace linkage
- [Langfuse: Score Analytics with Multi-Score Comparison](https://langfuse.com/changelog/2025-11-07-score-analytics-multi-score-comparison) -- Histogram charts, temporal analysis, matched data comparison
- [Langfuse: Evaluation Data Model](https://langfuse.com/docs/evaluation/evaluation-methods/data-model) -- Numeric/categorical/boolean score types, ScoreConfig schema
- [Arize Phoenix: Evals Overview](https://arize.com/docs/phoenix/evaluation/llm-evals) -- `provide_explanation` parameter, OTel-instrumented evaluators, score/label/explanation columns
- [Arize Phoenix: Log Evaluation Results](https://arize.com/docs/phoenix/tracing/how-to-tracing/feedback-and-annotations/llm-evaluations) -- Score object structure (name, score, label, explanation, direction)
- [DeepEval: Agent Evaluation Metrics](https://deepeval.com/docs/metrics-introduction) -- ToolCorrectnessMetric, TaskCompletionMetric, `include_reason` parameter, `strict_mode`
- [Confident AI: Testing Reports](https://www.confident-ai.com/docs/llm-evaluation/dashboards/testing-reports) -- Pass/fail display, metric breakdown by category, version comparison
- [Datadog: LLM Observability](https://docs.datadoghq.com/llm_observability/) -- LLM Overview dashboard, built-in quality checks, managed evaluations
- [Datadog: OTel GenAI Semantic Conventions Support](https://www.datadoghq.com/blog/llm-otel-semantic-convention/) -- Native v1.37+ mapping

### OTel Specifications
- [GenAI Evaluation Event (gen_ai.evaluation.result)](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-events/) -- Event attributes: score.value, score.label, explanation, metric name
- [GenAI Attribute Registry](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/) -- Attribute definitions, cardinality requirements, recording rules
- [GenAI Agent Spans](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/) -- create_agent, invoke_agent operation names

### Regulatory
- [EU AI Act: Article 13 Transparency](https://artificialintelligenceact.eu/article/13/) -- Instructions for use requirements: identity, performance, accuracy, human oversight, logging
- [EU AI Act: Article 50 Transparency Obligations](https://artificialintelligenceact.eu/article/50/) -- AI content marking, machine-readable format, multi-layered approach
- [EU Code of Practice on AI-Generated Content Transparency](https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content) -- C2PA metadata, watermarking, provenance standards (final June 2026)
- [NIST AI RMF 1.0](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf) -- GOVERN/MAP/MEASURE/MANAGE functions
- [NIST AI 600-1: GenAI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) -- Model evaluation protocols, adversarial testing

### Research
- [CHI EA '25: "Design Principles and Guidelines for LLM Observability: Insights from Developers"](https://dl.acm.org/doi/10.1145/3706599.3719914) -- Four principles (Awareness, Monitoring, Intervention, Operability) from CHI 2025 Extended Abstracts (Yokohama). **Verification note:** principle names are confirmed from the paper abstract; the one-line descriptions used in this document are paraphrases from the research document's interpretation applied to quality dashboards, not direct quotes from the paper. See [llm-explainability-research.md, Section 4](../interface/llm-explainability-research.md#dashboard-design-principles-from-chi-2025-research).
- [Evidently AI: LLM-as-a-Judge FAQ](https://www.evidentlyai.com/blog/llm-judges-faq) -- Binary vs Likert scales, rubric display, chain-of-thought prompting
- [Evidently AI: LLM-as-a-Judge Complete Guide](https://www.evidentlyai.com/llm-guide/llm-as-a-judge) -- Judge scoring best practices, explanation presentation

### Best Practices
- [Monte Carlo: LLM-As-Judge Best Practices](https://www.montecarlodata.com/blog-llm-as-judge/) -- Binary labels preferred, reasoning before score
- [Microsoft Multi-Agent Reference Architecture: Evaluation](https://microsoft.github.io/multi-agent-reference-architecture/docs/evaluation/Evaluation.html) -- Agent evaluation dimensions
- [Confident AI: Definitive AI Agent Evaluation Guide](https://www.confident-ai.com/blog/definitive-ai-agent-evaluation-guide) -- Per-step agent metrics, trace visualization, component-level evaluation
