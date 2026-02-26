# Feature Engineering Roadmap

**Version**: 2.0
**Date**: 2026-02-16
**Source**: `frontend/docs/llm-explainability-design.md` Section 16
**Research**: Web research completed 2026-02-16 across 7 parallel research agents

Items requiring further research, empirical tuning, or external dependencies before implementation.

---

## Research Required

### R1: Quantile-Based Adaptive Scaling Calibration
- **Status**: Implementation complete (uniform fallback active)
- **Research needed**: Empirical percentile distributions from production evaluation data to calibrate `adaptiveScoreColorBand()` quantile strategy for `relevance` metric
- **Dependency**: Dashboard must accumulate 7+ days of evaluation data per metric
- **Current state**: Falls back to uniform 5-band coloring when `PercentileDistribution` not provided
- **Action**: After 2 weeks of production data, compute p10/p25/p50/p75/p90 per metric and store as config

#### Research Findings

**MIN_QUANTILE_SAMPLE_SIZE = 100 is well-justified:**
- n >= 60 is sufficient for central percentiles (p25/p50/p75) per [PMC6294150](https://pmc.ncbi.nlm.nih.gov/articles/PMC6294150/)
- n >= 120 needed for extreme percentiles (p10/p90) in skewed distributions per [PMC6784425](https://pmc.ncbi.nlm.nih.gov/articles/PMC6784425/)
- n = 100 is a reasonable middle ground; consider tiered thresholds if p5/p95 are added later

**Rolling window vs. static quantiles:**
- Use **30-day rolling window** for primary quantile computation (matches Splunk ITSI, New Relic)
- Use **7-day comparison window** for drift detection
- Trigger recalibration when PSI > 0.1 between current and previous 30-day distributions
- Add `computedAt` timestamp to `PercentileDistribution` for staleness detection
- [Splunk ITSI](https://help.splunk.com/en/splunk-it-service-intelligence/): recalculates thresholds nightly from 7-60 day windows
- [New Relic](https://newrelic.com/blog/how-to-relic/dynamic-baseline-alerts-algorithms): uses weeks of historical data with weighted factor analysis

**Per-metric strategy selection is best-in-class:**
- No production tool reviewed (Datadog, Splunk, Grafana, New Relic) implements per-metric strategy
- Most use a single algorithm uniformly; our `METRIC_SCALE_STRATEGY` map is more sophisticated

**Incremental computation:**
- Consider [t-digest](https://github.com/tdunning/t-digest) (Dunning 2019) for streaming/incremental quantile estimation
- Used internally by Elasticsearch, Datadog, Redis; `tdigest` npm package has 2.6M weekly downloads

---

### R2: CQI Weight Tuning
- **Status**: Implementation complete with default weights
- **Research needed**: Validate `DEFAULT_CQI_WEIGHTS` against production alert patterns. Current weights are design doc recommendations, not empirically tuned
- **Approach**: Run CQI retrospectively against historical dashboard data; measure correlation between CQI drops and actual incidents
- **Action**: Schedule weight review after 30 days of CQI data

#### Research Findings

**No framework publishes fixed recommended weights.** DeepEval/G-Eval, TruLens, RAGAS all report metrics independently with simple averaging as default aggregation.

**Weight tuning methodology (3 tiers):**
1. **Expert-driven (current)**: AHP-style. Current weights are reasonable starting point
2. **Data-driven**: CRITIC method (CRiteria Importance Through Intercriteria Correlation) derives weights from data variance and inter-metric correlation ([original paper](https://reformship.github.io/pages/1capacity/1model/11evaluation/))
3. **Hybrid (recommended)**: `w_final = 0.6 * w_expert + 0.4 * w_CRITIC` after 30+ data points. [AHP-Entropy hybrid](https://pmc.ncbi.nlm.nih.gov/articles/PMC7516705/) produces "more stable, effective, and reliable results"

**Key concern: faithfulness/hallucination correlation.** These are highly correlated (hallucination ~ 1 - faithfulness for well-calibrated metrics). CRITIC weighting would naturally downweight one. Measure Pearson R; if r > 0.85, consolidate weight.

**Increase tool_correctness weight** for agentic workloads (0.05 is low given agent-eval-metrics treats task_completion at 0.50).

**Use named context profiles, not dynamic weights:**
```
latency-focus: { evaluation_latency: 0.15, coherence: 0.05 }
agent-focus:   { tool_correctness: 0.15, task_completion: 0.20 }
rag-focus:     { faithfulness: 0.25, hallucination: 0.25 }
```

**Retrospective validation:**
- Start with cross-correlation (CCF) lead-lag analysis (20+ snapshots minimum)
- Graduate to [Granger causality](https://phdinds-aim.github.io/time_series_handbook/04_GrangerCausality/) at 50+ snapshots
- Compute precision/recall of CQI drops vs. actual incidents at various thresholds

**Sensitivity analysis:**
- Run One-at-a-Time (OAT) perturbation first: vary each weight +/-10%, check if CQI changes > 0.02
- Full Monte Carlo: COINr methodology with noise factor phi=0.25, 1000 replications ([COINr docs](https://bluefoxr.github.io/COINrDoc/sensitivity-analysis.html))
- If std < 0.03 on 0-1 scale, index is robust

Sources: [OECD Handbook on Composite Indicators](https://www.oecd.org/content/dam/oecd/en/publications/reports/2008/08/handbook-on-constructing-composite-indicators-methodology-and-user-guide_g1gh9301/9789264043466-en.pdf), [Artificial Analysis Intelligence Index v4](https://artificialanalysis.ai/methodology/intelligence-benchmarking), [Google SRE Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/)

---

### R3: Time-Lag Correlation Detection
- **Status**: `computeCorrelationMatrix()` implemented with `lagHours: 0` placeholder
- **Research needed**: Time-shifted cross-correlation (sliding window Pearson R at offsets 0-24h) to detect lagged relationships between metrics
- **Complexity**: O(m^2 * n * maxLag) where m=7, n=evaluations, maxLag=24 hourly offsets
- **Action**: Implement as v1.1 feature when time-series data is available at hourly granularity

#### Research Findings

**Algorithm recommendation:**
- Sliding-window Pearson R (current approach) is adequate at m=7, maxLag=24
- At 21 pairs x 25 lags = 525 Pearson R computations, each O(n), total is effectively O(n) with small constants
- FFT-based cross-correlation ([xcorr npm](https://github.com/adblockradio/xcorr)) becomes worthwhile at maxLag > 100 or n > 100K

**Lag range:**
- Default 0-24h at hourly offsets for quality metrics
- Add 0-60min at 5-min offsets for operational/latency metrics
- Make `maxLagHours` and `lagStepMinutes` configurable

**Significance testing is critical (525 hypotheses):**
- Use **Benjamini-Hochberg FDR** at q=0.05 (not Bonferroni -- too conservative for 525 tests)
- P-values from t-distribution: `t = r * sqrt((n-2) / (1-r^2))`
- Supplement with block bootstrap CIs (1000 resamples, block length ~sqrt(n)) for top correlations
- [BH 1995 paper](https://rss.onlinelibrary.wiley.com/doi/10.1111/j.2517-6161.1995.tb02031.x)

**Causal inference guard:**
- Add `causalConfidence: 'correlation' | 'granger' | 'verified'` field to `CorrelationFeature`
- Label lagHours as "predictive lag" not "causal lag"
- For top-N pairs, add bivariate Granger test (~100 lines TypeScript)
- Never auto-alert on novel lagged correlations; surface as "suggested investigation"

**Implementation path:**
1. Add `maxLagSteps` parameter to `computeCorrelationMatrix()`
2. Loop `computePearsonR(seriesA, shiftedSeriesB)` for each lag offset
3. Select lag with highest |R| that passes BH-FDR significance
4. Update `lagHours` field from hardcoded `0`

Sources: [Datadog Metric Correlations](https://docs.datadoghq.com/dashboards/graph_insights/correlations/), [PagerDuty Event Intelligence](https://www.pagerduty.com/platform/aiops/event-intelligence/), [VLTimeCausality](https://github.com/DarkEyes/VLTimeSeriesCausality), [Nature: Fast Pseudo Transfer Entropy](https://www.nature.com/articles/s41598-021-87818-3)

---

### R4: Evaluation Latency Percentile Rank Display
- **Status**: `percentile_rank` ScaleStrategy defined but requires historical distribution
- **Research needed**: Determine optimal rolling window for latency baseline (1h? 24h? 7d?)
- **Dependency**: MetricDetailResult must expose `scoreDistribution` data to frontend
- **Action**: Implement percentile rank calculation in dashboard API when trend endpoint is built

#### Research Findings

**Rolling window: 7-day recommended.**
- Matches Google SRE multi-window alerting (1h fast-burn + 6h slow-burn for alerts, 7d for baselines)
- [Datadog](https://docs.datadoghq.com/tracing/guide/week_over_week_p50_comparison/) uses week-over-week P50 comparison as standard practice
- [Prometheus](https://prometheus.io/docs/practices/histograms/) client_java defaults to 10-minute sliding window for summaries

**Display pattern:**
- **Default view**: Stat panels showing P50 + P95 with sparklines and week-over-week delta
- **Drill-down**: Line chart with P50/P90/P95/P99 lines + request count overlay
- **Investigation**: Heatmap for distribution shape (bimodal detection)
- Show absolute value primary ("3.2s / 5.0s budget"), percentile rank for per-evaluation context ("P82")

**Streaming percentile algorithm: t-digest recommended.**
- `tdigest` npm package (2.6M weekly downloads), better tail accuracy than DDSketch for single-node
- DDSketch better for distributed aggregation (fully mergeable, relative error)
- For current single-node MCP server with <10K evaluations/day, t-digest is ideal

**LLM evaluation latency is log-normal with potential bimodality:**
- P50: 1-3s (simple rubric), P90: 5-10s (chain-of-thought), P99: 15-30s+ (complex/retry)
- Bimodality from: cached vs. uncached, short vs. long CoT, model routing
- Flag as "heavy-tailed" when P90/P50 > 4x; suggest heatmap view
- Track latency by evaluation type separately (G-Eval, QAG, simple rubric)

Sources: [Google SRE: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/), [Datadog DDSketch](https://www.datadoghq.com/blog/engineering/computing-accurate-percentiles-with-ddsketch/), [t-digest paper](https://arxiv.org/pdf/1902.04023), [EMNLP 2025: LLM Response Lengths](https://aclanthology.org/2025.emnlp-main.1676.pdf)

---

### R5: Degradation Signal Empirical Validation
- **Status**: `computeDegradationSignal()` uses threshold-based prediction (variance > 1.5x, dropout > 20%, skew > 3x)
- **Research needed**: Validate thresholds against historical degradation events. Current thresholds are design doc estimates
- **Approach**: Backtest against 30 days of alert history; measure precision/recall of predictedStatus
- **Action**: After 30 days, adjust thresholds based on false positive/negative rates

#### Research Findings

**Variance 1.5x threshold is too aggressive:**
- Datadog recommends 2-3 standard deviations (sigma) as default anomaly bounds
- 1.5x multiplier ~ 1.5 sigma ~ 87% coverage ~ 13% false positive rate on normal data
- **Recommendation**: Shift to 2-sigma (5% FP) or 2.5-sigma (1.2% FP)

**Dropout 20% threshold is reasonable:**
- Aligns with Google SRE philosophy of simple, predictable rules
- PagerDuty survey: most teams can't act on majority of alerts, so 20% is conservative enough

**Latency skew 3x is standard** for right-skewed/log-normal distributions.

**Add EWMA drift detection:**
- Current period-over-period `computeTrend()` is Shewhart-like (catches large shifts)
- EWMA with lambda=0.1 catches slow quality drift that period deltas miss
- CUSUM outperforms EWMA when expected shift size is known; EWMA better for unknown shifts
- Add as new field on `MetricTrend` (e.g., `ewmaSignal: boolean`)

**Add MAD-based adaptive bounds:**
```typescript
// Threshold: median +/- k * MAD * 1.4826 (scaling factor for normal equivalent)
// k = 3 for conservative, k = 2 for sensitive
```
- Robust to outliers, doesn't assume normality (unlike sigma-based)
- Used by [Moogsoft AIOps](https://docs.moogsoft.com/moogsoft-cloud/en/anomaly-detection-settings-reference.html)

**Add confirmation windows:**
- Don't fire on single threshold breach; require persistence across 2+ consecutive evaluation periods
- Models Google SRE [multi-burn-rate](https://sre.google/workbook/alerting-on-slos/) short window pattern
- Highest-ROI change for reducing false positives

**Backtesting methodology:**
- Use range-based Precision/Recall (not point-based) -- [TaPR](https://dl.acm.org/doi/10.1145/3357384.3358118) for time-series anomaly detection
- Plot PR curves (not ROC) since degradation events are rare
- Sweep `stabilityThreshold` from 0.5% to 5% of range width

**LLM-specific degradation patterns to monitor:**
- Model drift: 75% of businesses observed AI performance declines without monitoring ([Fiddler AI](https://www.fiddler.ai/blog/how-to-monitor-llmops-performance-with-drift))
- Evaluator agreement drop as leading indicator (already tracked in `computeEvaluatorAgreement()`)
- Token utilization ratio (input tokens / context window max) -- gap in current metrics
- Prompt injection spikes via output token variance

Sources: [Datadog Anomaly Detection](https://docs.datadoghq.com/monitors/types/anomaly/), [Google SRE Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/), [NAB Benchmark](https://github.com/numenta/NAB), [TimeEval](https://timeeval.github.io/evaluation-paper/)

---

### R6: Gini Coefficient vs. Shannon Entropy for Coverage Uniformity
- **Status**: Gini coefficient implemented in `computeGiniUniformity()`
- **Research needed**: Compare Gini vs. Shannon entropy for coverage uniformity measurement. Gini is simpler but may not capture multi-modal distributions well
- **Action**: Low priority; Gini is adequate for v1.0. Revisit if auditors report misleading confidence levels

#### Research Findings

**Recommendation: Replace Gini with Normalized Shannon Entropy (Pielou's J).**

Rationale for 7 fixed quality metric categories:
1. **Zero-category sensitivity**: If any metric has zero evaluations, entropy drops sharply; Gini is less sensitive to completely absent categories
2. **Multi-modal discrimination**: Gini conflates different distribution shapes due to Lorenz curve crossing ([BEA Primer](https://apps.bea.gov/scb/issues/2025/08-august/0825-gini-primer.htm))
3. **Standard for fixed-category distributions**: Pielou's J is the standard evenness measure in ecology ([SpringerPlus](https://springerplus.springeropen.com/articles/10.1186/s40064-015-0944-4))
4. **Cheaper**: O(n) vs. O(n log n) for Gini sort
5. **Interpretability**: J=0.7 means "70% as uniform as possible"

| Distribution | Gini (1-G) | Entropy (J) |
|---|---|---|
| `[14,14,14,14,14,15,15]` near-uniform | ~0.99 | ~0.999 |
| `[50,50,0,0,0,0,0]` bimodal | ~0.43 | ~0.356 |
| `[70,5,5,5,5,5,5]` one dominant | ~0.50 | ~0.587 |

**Implementation** (drop-in replacement for `computeGiniUniformity`):
```typescript
export function computeNormalizedEntropy(counts: number[]): number {
  if (counts.length <= 1) return 1;
  const total = counts.reduce((s, c) => s + c, 0);
  if (total === 0) return 0;
  const k = counts.length;
  const hMax = Math.log2(k);
  let h = 0;
  for (const c of counts) {
    if (c > 0) { const p = c / total; h -= p * Math.log2(p); }
  }
  return roundTo(Math.max(0, Math.min(1, h / hMax)), SCORE_PRECISION);
}
```

Bump `COVERAGE_CONFIDENCE_VERSION` to `'2.0'` on algorithm change. Both produce [0,1] with 1=uniform, so downstream semantics are preserved.

Sources: [Wikipedia - Entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory)), [PMC - Entropy Ratio](https://pmc.ncbi.nlm.nih.gov/articles/PMC7712116/), [Wikipedia - Gini](https://en.wikipedia.org/wiki/Gini_coefficient)

---

## Frontend Integration (Blocked on Dashboard Phase 2)

### F1: ScoreBadge Component with Direction-Aware Coloring
- **Backend ready**: `scoreColorBand()`, `adaptiveScoreColorBand()`, `inferScoreDirection()`
- **Blocked on**: Dashboard Phase 1 ScoreBadge component (design doc Section 4.1)
- **Integration**: Import `scoreColorBand` from `quality-metrics.ts`, use as CSS class selector

#### Implementation Guidance

**No new library needed.** Extend existing `Indicators.tsx` pattern.

**Colorblind-safe palette** ([Okabe-Ito](https://davidmathlogic.com/colorblind/)):
- Good: `#0072B2` (blue) / Fair: `#E69F00` (amber) / Poor: `#D55E00` (vermillion)
- Define as CSS custom properties: `--score-good`, `--score-fair`, `--score-poor`
- Passes WCAG 2.1 AA contrast (4.5:1) on white backgrounds

**Accessibility**:
- Always include shape/icon per status (existing pattern uses Unicode shapes)
- `aria-label="Score: 0.87, good (higher is better)"`
- Test with [Viz Palette](https://projects.susielu.com/viz-palette) for colorblind simulation

---

### F2: CQI Hero Number on Executive View
- **Backend ready**: `computeCQI()` with contribution breakdown
- **Blocked on**: Dashboard Phase 2 Executive view enhancement
- **Integration**: Call `computeCQI()` from dashboard API, render stacked contribution bar

#### Implementation Guidance

**Recommended library**: **Recharts** (~45KB gzip) -- serves F2, F3, and potentially F5.

**Pattern**: Large mono-font hero number with `TrendIndicator`, plus horizontal stacked `<BarChart>` with 7 metric segments showing per-metric CQI contributions. Use `layout="vertical"` for horizontal bar.

**Alternative**: Pure CSS flex bar (no library) -- `display: flex` with percentage widths per contribution. Sufficient for a single stacked bar.

**Accessibility**: `role="region"` + `aria-label` on hero container. Visually hidden `<table>` fallback for screen readers (SVG charts are not navigable).

---

### F3: Metric Dynamics on Trend Chart
- **Backend ready**: `computeMetricDynamics()` with breach projection
- **Blocked on**: Dashboard Phase 2 period-over-period trend chart
- **Integration**: Render `projectedBreachTime` as dashed projection line

#### Implementation Guidance

**Recommended library**: **Recharts** (same dependency as F2).

**Pattern**:
- Two `<Line>` components: solid (actual) + dashed via `strokeDasharray="5 5"` (projected)
- `<ReferenceLine>` for SLA threshold with label
- Overlap last actual point with first projected point for visual continuity
- [Recharts Dashed Line example](https://recharts.github.io/en-US/examples/DashedLineChart/)

**Alternatives**: [nivo Line](https://nivo.rocks/line/) (heavier), [visx @visx/xychart](https://airbnb.io/visx/) (~20KB, more boilerplate), [Lightweight Charts](https://www.tradingview.com/lightweight-charts/) (canvas, overkill)

**Performance**: For 30-day trend at daily resolution (~30 points), SVG via Recharts is fine. For minute-level (>1000 points), use canvas rendering or downsample.

---

### F4: Role-Aware Feature Config Integration
- **Backend ready**: `ROLE_FEATURE_CONFIG` with all feature flags
- **Blocked on**: Dashboard role view refactoring (currently only 3 role views, no conditional rendering)
- **Integration**: Use `getRoleFeatureConfig(role)` to conditionally render components

#### Implementation Guidance

**No new library needed.** React Context + feature config map.

**Pattern**: `RoleContext` provider at `<App>` level, derives role from wouter URL. Feature config map in a single file:
```typescript
const { hasFeature } = useRole();
return hasFeature('cqi_hero') && <CQIHero />;
```

Or `<RoleGate feature="cqi_hero"><CQIHero /></RoleGate>` wrapper for cleaner JSX.

Do NOT use LaunchDarkly/Permit.io -- role set is static and small. Config map has zero runtime cost.

---

### F5: Correlation Heatmap on `/correlations` Route
- **Backend ready**: `computeCorrelationMatrix()` with Pearson R
- **Blocked on**: Dashboard Phase 3 correlation view route
- **Integration**: Render `pearsonR` values in CSS Grid heatmap, highlight `isKnownToxicCombo` cells

#### Implementation Guidance

**Recommended approach**: **CSS Grid + `d3-scale-chromatic`** (~4KB) for a 7x7 matrix.

No charting library needed for 49 cells. Use `scaleSequential(interpolateRdYlGn).domain([-1, 1])` for color scale. If visx is already in the bundle, [`@visx/heatmap`](https://airbnb.io/visx/heatmaps) is a good alternative.

**Toxic combo highlighting**: 2px border + pulsing CSS animation on the cell, plus `aria-label` suffix "-- toxic combination detected".

**Accessibility**:
- `role="table"` / `role="row"` / `role="cell"` for screen reader navigation
- Every cell: `aria-label="Accuracy vs Latency: 0.73"`
- Include numeric value in each cell (color must not be sole indicator)
- Use blue-to-orange or viridis scale (not red-green)

---

### F6: Label Filter in Evaluation Table
- **Backend ready**: `labelToOrdinal()` with 3-tier categories
- **Blocked on**: Dashboard Phase 1 evaluation table component (design doc Section 5, Pattern 2)
- **Integration**: Sort by `ordinal`, filter by `category` (Pass/Review/Fail dropdown)

#### Implementation Guidance

**Recommended library**: **TanStack Table v8** (`@tanstack/react-table`, ~15KB) -- pairs with existing `@tanstack/react-query`.

**Custom ordinal sort**: `sortingFn` using `indexOf` on `['Pass', 'Review', 'Fail']` order. Custom `filterFn` for multi-select category filtering.

**Accessibility**: `aria-sort` on `<th>`, `aria-label` on filter dropdown, keyboard navigation (Tab through headers, Enter/Space to toggle sort).

**Performance**: For >1000 rows, enable row virtualization via `@tanstack/react-virtual`.

---

## Recommended New Dependencies

| Package | Size (gzip) | Used By | Notes |
|---------|-------------|---------|-------|
| `recharts` | ~45KB | F2, F3 | Most common React charting; broad ecosystem |
| `@tanstack/react-table` | ~15KB | F6 | Headless; pairs with existing `@tanstack/react-query` |
| `d3-scale-chromatic` | ~4KB | F5 | Just the color scale function, not all of D3 |
| `tdigest` | ~5KB | R4 | Streaming percentile computation; 2.6M weekly downloads |
| (none) | 0 | F1, F4 | Pure React + CSS custom properties |

Total new dependency cost: **~69KB gzipped**.
