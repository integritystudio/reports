# Feature Engineering Analysis: Section 16 Proposals

**Date**: 2026-02-15
**Source**: `docs/frontend/llm-explainability-design.md` Section 16 (lines 1112-1422)
**Method**: Statistical validation + backend source verification against `quality-metrics.ts` and `llm-as-judge.ts`

---

## Backend Verification Summary

11 of 12 referenced functions/interfaces verified at claimed line numbers. One discrepancy found.

| Reference | Claimed Line | Status |
|-----------|-------------|--------|
| `ConfidenceIndicator` | L118 | verified |
| `MetricCorrelationRule` | L219 | verified |
| `computeQualityMetric()` | L751 | verified |
| `computeDashboardSummary()` | L816 | verified |
| `computeTrend()` | L1938 | verified |
| `computePipelineView()` | L2155 | verified |
| `computeCoverageHeatmap()` | L2273 | verified |
| `computeRoleView()` | L1372 | verified |
| `normalizeWithLogprobs()` | L814 | verified |
| `QualityMetricResult` | L149 | verified |
| `MetricTrend` | L97 | verified |
| `ScoreDirection` | N/A | Proposed new type (`'maximize' \| 'minimize'`); distinct from codebase's `ThresholdDirection` (`'above' \| 'below'`, L26) |

---

## Proposal-by-Proposal Analysis

### 1. Composite Quality Index (CQI)

**Statistical Validity**: Sound. Weighted linear combination is the standard approach for composite indices (cf. HDI, SPI). Direction normalization (inverting hallucination) is correctly identified.

**Weight Scheme Assessment**:
- Weights sum to 1.0: verified (0.25+0.20+0.20+0.15+0.10+0.05+0.05 = 1.00)
- Concern: relevance at 0.25 and faithfulness at 0.20 implies a strong retrieval-quality bias. This is appropriate for RAG-heavy workloads but may overweight retrieval for pure generation tasks
- The disclaimer (F5 fix) correctly flags these as "initial recommendations, not tuned against production data"

**Recommendations**:
- Add sensitivity analysis: report CQI range when each weight varies +/- 0.05
- Consider making weights configurable via `RoleViewOptions` (already has optional parameter per F1 fix)
- Add a `weightSource: 'default' | 'custom' | 'data-driven'` field to `CompositeQualityIndex`

**Compute Cost**: O(m) where m=7. Negligible. No concern.

### 2. Metric Velocity & Acceleration

**Statistical Validity**: Sound for regularly-sampled time series. First derivative (velocity) from `percentChange / period_hours` is straightforward. Second derivative (acceleration) as change-in-velocity requires at least 3 consecutive trend points.

**Concerns**:
- **Noise amplification**: Second derivatives amplify noise. With evaluation counts ~100-1000 per period, score means have standard error ~0.01-0.03. Acceleration computed from these noisy means will produce many false inflection points
- **Irregular sampling**: If poll intervals vary (missed polls, backfill), velocity/acceleration calculations assume uniform spacing. Design should specify handling for gaps

**Recommendations**:
- Apply exponential smoothing (alpha=0.3) before differentiation to suppress noise
- Require minimum 3 consecutive periods before reporting acceleration
- Add `confidence: number` field to `MetricDynamics` based on sample count stability
- `projectedBreachTime` should include uncertainty bounds, not point estimate

**Compute Cost**: O(m * t) where t=trend history length. With m=7 and t~10 periods, ~70 operations. Negligible.

### 3. Coverage-Weighted Confidence

**Statistical Validity**: Excellent. The Gini coefficient for evaluating distributional uniformity is well-established in econometrics and information theory. `effectiveSampleSize = sampleCount * coverageUniformity` is a reasonable heuristic analogous to design effect in survey sampling.

**Concerns**:
- Gini coefficient is sensitive to the number of categories (sessions/traces). With few unique inputs (<10), uniformity may appear artificially high
- The `adjustedLevel` thresholds should account for absolute sample size, not just effective. A Gini of 1.0 with 5 evaluations across 5 sessions gives effectiveSampleSize=5, which may still be "low"

**Recommendations**:
- Minimum absolute sample size check: `effectiveSampleSize >= 30` for "high" regardless of uniformity
- Document that Gini=0 means perfect uniformity (all inputs equally evaluated), Gini=1 means all evaluations on one input

**Compute Cost**: O(n * log(n)) for sorting evaluations by input, where n=evaluation count. For n=1000, ~10K comparisons. Well within budget.

### 4. Correlation Strength Matrix

**Statistical Validity**: Pearson R assumes linear relationships between metric pairs. This is reasonable for most quality metrics but may miss nonlinear relationships (e.g., hallucination-faithfulness may have a threshold effect rather than linear correlation).

**Concerns**:
- **Pearson R limitations**: Does not capture nonlinear dependencies. Spearman rank correlation would be more robust for bounded [0,1] scores with potential ceiling effects
- **Lagged correlation**: The `lagHours` computation requires cross-correlation at multiple lag values, increasing complexity from O(m^2 * n) to O(m^2 * n * L) where L=max lag bins. Not mentioned in compute budget
- **Multiple comparisons**: With 7 metrics, there are 21 pairs. At alpha=0.05, ~1 pair will appear significant by chance. Design should specify minimum effect size (|R| > 0.3) not just p-value
- **Temporal autocorrelation**: Consecutive metric values are not independent (violated IID assumption for Pearson). Consider differenced series or Newey-West standard errors

**Recommendations**:
- Use Spearman rank correlation instead of (or alongside) Pearson
- Limit lag search to L=6 (6 hourly bins) to control compute
- Apply Bonferroni correction or require |R| > 0.5 for "discovered correlations" (currently 0.7, which is appropriate)
- Add `pValue` and `effectSize` fields to `CorrelationFeature`

**Compute Cost**: O(m^2 * n) = O(49 * 1000) = 49K operations as stated. With lag search at L=6: 294K operations. Still well within 30s budget but should be documented.

### 5. Adaptive Score Scaling

**Statistical Validity**: Strong. Per-metric scaling strategies are well-motivated by the documented distribution shapes.

| Strategy | Assessment |
|----------|-----------|
| Quantile (relevance) | Correct for left-skewed. Requires sufficient data for stable quantile estimates (n>100) |
| Binary (faithfulness) | Appropriate for bimodal. Threshold at 0.7 should be configurable |
| Uniform (coherence) | Appropriate for normal-ish distribution |
| Log (hallucination) | Correct for right-skewed near-zero. Formula `-log10(max(v, 0.001)) / 3` maps [0.001, 1.0] to [1.0, 0.0] -- verified mathematically sound |
| Step (task_completion) | Appropriate. Evaluator-type switching is a good design |
| Categorical (tool_correctness) | Dual display (fraction + numeric) is informative |
| Percentile rank (eval_latency) | Appropriate for heavy-tail. Requires historical distribution |

**Note**: The `adaptiveScoreColor()` function uses `ScoreDirection = 'maximize' | 'minimize'` -- a proposed new type for the frontend. This is semantically distinct from the codebase's `ThresholdDirection = 'above' | 'below'` (L26 in quality-metrics.ts) which is for alert conditions. The name `ScoreDirection` is intentionally different to avoid confusion.

**Recommendations**:
- Add fallback for insufficient data: quantile strategy needs n>100, otherwise fall back to uniform
- Document that `empiricalCDF()` is a proposed helper, not yet implemented

### 6. Label Encoding (Ordinal Sort)

**Statistical Validity**: Sound. Ordinal encoding of free-text labels is standard practice. The 5-tier ordinal (0-4) with 3-tier filter (Pass/Review/Fail) provides appropriate granularity.

**Concerns**:
- Unmapped labels: Any label not in the lookup table gets no ordinal. Need a default (e.g., ordinal=2 "Review" for unknown labels)
- Label normalization: Should be case-insensitive and handle underscores/hyphens (`highly-relevant` vs `highly_relevant`)

**Recommendations**:
- Add `unmapped` ordinal value (2 or -1) with visual indicator
- Normalize labels before lookup (lowercase, replace hyphens with underscores)

**Compute Cost**: O(n) hash lookups. Negligible.

---

## Cross-Cutting Issues

### Issue: `ScoreDirection` vs `ThresholdDirection` Semantic Distinction
**Priority**: P2
**Location**: Section 2.1 and Section 16.2
The design doc proposes `ScoreDirection = 'maximize' | 'minimize'` for score color mapping (higher-is-better vs lower-is-better). The codebase exports `ThresholdDirection = 'above' | 'below'` for alert conditions. These are intentionally different types. The design doc should include a note clarifying the distinction when implemented.

### Issue: Feature Pipeline Ordering Dependency
**Priority**: P2
**Location**: Section 16.5
Step [3] (Derive) depends on Step [2] (Aggregate) outputs AND on `CoverageHeatmap` from `computeCoverageHeatmap()`. The heatmap is not part of Step [2] -- it requires a separate pass over `evaluationsByMetric`. The pipeline diagram should show this dependency explicitly.

### Issue: No Feature Versioning
**Priority**: P3
All derived features (CQI, velocity, correlation) lack version identifiers. When weights or algorithms change, historical comparisons become invalid. Add `featureVersion: string` to each derived interface.

---

## Compute Budget Verification

| Step | Operation | Complexity | n=1000, m=7 | Budget Impact |
|------|-----------|-----------|-------------|---------------|
| CQI | Weighted sum | O(m) | 7 ops | negligible |
| Velocity/Accel | Trend diff | O(m * t) | 70 ops | negligible |
| Coverage confidence | Gini sort | O(n log n) | 10K ops | <1ms |
| Correlation matrix | Pearson/Spearman | O(m^2 * n) | 49K ops | <10ms |
| Correlation lag search | Cross-correlation | O(m^2 * n * L) | 294K ops | <50ms |
| Adaptive scaling | Per-score transform | O(n * m) | 7K ops | <1ms |
| Label encoding | Hash lookup | O(n) | 1K ops | negligible |

**Total estimated compute**: <100ms for n=1000. Well within 30s poll interval. Confirmed feasible.

---

## Summary

| Proposal | Statistical Validity | Compute Feasibility | Issues Found |
|----------|:-------------------:|:-------------------:|:------------:|
| CQI | Sound | O(m), negligible | Weight sensitivity undocumented |
| Velocity/Acceleration | Sound with caveats | O(m*t), negligible | Noise amplification risk |
| Coverage-Weighted Confidence | Excellent | O(n log n), <1ms | Min absolute sample size needed |
| Correlation Matrix | Sound with caveats | O(m^2*n), <10ms | Pearson linearity assumption |
| Adaptive Scaling | Strong | O(n*m), <1ms | `ScoreDirection` is proposed new type (not mismatch) |
| Label Encoding | Sound | O(n), negligible | Unmapped label handling |

**Overall Assessment**: All 6 proposals are statistically valid and computationally feasible. `ScoreDirection` is a proposed new type distinct from the codebase's `ThresholdDirection`. Noise amplification in acceleration and Pearson linearity assumptions are acceptable given the disclaimers already in place (F5 fix).
