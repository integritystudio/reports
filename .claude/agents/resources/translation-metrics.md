# Translation Metrics Reference

Resource file for `translation-improvement` agent.

## Composite Quality Score

Weighted formula (modeled after `computeStructureSignals` in code-structure hook):

```
translation.quality.score =
  (1 - hallucination) * 0.30     // hallucination compliance, target >= 0.95
  + faithfulness      * 0.25     // target >= 0.98
  + readability_par   * 0.20     // 1.0 if FK diff <= 2, 0.7 if <= 4, 0.4 if <= 6, 0.0 if > 6
  + coherence         * 0.15     // target >= 0.98
  + relevance         * 0.10     // target >= 0.98
```

**Composite threshold: >= 0.90.** Hallucination weighted highest (0.30) because it causes factual harm.

## Metrics & Thresholds

| Category | Metric | Threshold | Action if Exceeded |
|----------|--------|-----------|-------------------|
| Quality | `translation.quality.score` (composite) | >= 0.90 | Re-run Phase 2-5 loop |
| Quality | Hallucination rate | <= 0.05 | Trigger Phase 2-5 loop |
| Quality | Faithfulness | >= 0.98 | Check for data point drift |
| Quality | Relevance | >= 0.98 | Check for missing sections |
| Quality | Coherence | >= 0.98 | Check for flow breaks |
| Quality | Readability parity (FK grade diff) | <= 2 grades | Check for complexity regression |
| Quality | Length ratio (EN->PT-BR) | 1.05-1.20 | Flag over/under-translation |
| Efficiency | Error rate | < 5% | errors / total invocations |
| Efficiency | Retry amplification | 0% | rate_limit events / total |
| Efficiency | Duration | below agent median | median duration in ms |
| Operational | Tool failure rate | < 10% | Investigate tool errors |
| Operational | Hook latency | < 500ms median | Check code-structure handler |
| Trend | Usage trend | stable +/-20% | Declining = translations not maintained |
| Trend | Session diversity | >= 3 unique | Low diversity = single-use |
| Trend | Score regression | > 0.05 drop | Compare to rolling evaluation average |

## OTEL Telemetry Integration

### Reading Telemetry

```bash
# Recent traces with translation spans
grep -l "translat\|pt-BR\|perfil_artista\|analise_mercado" "$CLAUDE_TELEMETRY_DIR"/traces-*.jsonl | head -3

# Agent metrics (error rate, duration, retries, output density)
jq -r 'select(.name == "hook:agent-post-tool") |
  select(.attributes["agent.type"] == "translation-improvement") |
  "\(.attributes["agent.has_error"])\t\(.duration)\t\(.attributes["agent.has_rate_limit"])\t\(.attributes["agent.output_size"])"' \
  "$CLAUDE_TELEMETRY_DIR"/traces-*.jsonl 2>/dev/null
```

### Continuous Monitoring

On each invocation, check for:
1. New translation files added since last run
2. Source files updated (translations may need sync)
3. OTEL score regressions from recent sessions
4. New provenance reports: `find "$TRANSLATION_ROOT" -name "*provenance*" -type f`
5. Error rate and retry amplification trends
6. Duration regression (loop taking longer than prior runs)

## Known Issues

- **H1**: Carnaval Brasileiro info box extra sentences -- `analise_mercado_austin.html`
- **H2**: Skip-links in English on PT-BR pages -- all 3 PT-BR files
- **H3**: "Dancing with the Stars Brasil" vs "Danca dos Famosos" inconsistency -- `analise_mercado_zouk.html`

Update as issues are resolved or new ones found.

## State File Schema

Path: `$TRANSLATION_STATE` (default `~/.claude/translation-improvement-state.json`)

```json
{
  "version": 1,
  "runs": [{ "date": "2026-02-17", "iteration": 2, "scores": {} }],
  "rolling_averages": {
    "analise_mercado_austin.html": { "composite": 0.92, "hallucination": 0.03 }
  }
}
```

Fields:
- `runs[]`: append-only log of each invocation with date, iteration count, and per-file scores
- `rolling_averages`: exponential moving average per file (`new = old * 0.7 + current * 0.3`); used to skip files already passing all thresholds
