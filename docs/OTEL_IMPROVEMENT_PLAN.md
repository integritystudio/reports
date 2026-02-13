# OTEL-Driven Iterative Improvement Plan

Using OpenTelemetry session data to measure, prioritize, and validate readability/accessibility fixes across the Reports Hub.

---

## 1. Feedback Loop Architecture

Each fix session follows a closed-loop cycle where OTEL data from the previous session informs the next:

```
Session N (audit/fix)
    │
    ▼
OTEL Data (traces, logs, metrics)
    │
    ▼
Analysis (extract metrics, compare to baseline)
    │
    ▼
Session N+1 (updated priorities, validated fixes)
```

### Data Sources

| Source | Location | Access Method |
|--------|----------|---------------|
| Traces | `~/.claude/telemetry/traces-YYYY-MM-DD.jsonl` | Local JSONL + toolkit dashboard |
| Logs | `~/.claude/telemetry/logs-YYYY-MM-DD.jsonl` | Local JSONL + toolkit dashboard |
| Hook Performance | `~/.claude/telemetry/hook-performance.log` | `MetricRegistry` (`hook.duration`, `hook.executions`) |
| Token Usage | Toolkit `recordTokenUsage()` | `gen_ai.client.token.usage` / `gen_ai.client.cost` metrics |
| Context Window | Toolkit `getContextStats()` | `session.context.size` / `session.context.utilization` gauges |
| Quality Dashboard | `~/.claude/mcp-servers/observability-toolkit/dashboard/` | `npm run dev` → `localhost:5173` (UI) + `:3001` (API) |
| Interface Docs | `~/.claude/mcp-servers/observability-toolkit/docs/interface/` | Architecture specs, UX research, backend design |

### Loop Steps

1. **Pre-session**: Review previous session's scorecard delta and unresolved backlog items
2. **During session**: OTEL instrumentation captures every tool call, file edit, and agent operation
3. **Post-session**: Extract metrics from JSONL exports, update scorecard, identify regressions
4. **Planning**: Use metrics to prioritize next session's targets (highest-impact, lowest-effort first)

---

## 2. Quality Metrics Per Session

### Core Metrics Table

| Metric | Source | How to Extract |
|--------|--------|----------------|
| Tool success rate | Traces JSONL | Count spans with `status.code == 0` vs total |
| Files modified | Git diff | `git diff --stat HEAD~1` after commit |
| Issues resolved | Commit messages | Match `C1`, `H2`, `T3`, etc. in commit message body |
| Time per fix | Trace span durations | Sum span durations between issue-start and issue-commit |
| Token efficiency | Session metadata | Total tokens / issues resolved |
| Session duration | Traces JSONL | Last span end_time - first span start_time |

### Per-Fix Tracking Template

For each backlog item resolved in a session, record:

```markdown
### [BACKLOG_ID] — [Title]
- **Session**: [session-id]
- **Files changed**: [list]
- **Spans generated**: [count]
- **Duration**: [minutes]
- **Verified**: [yes/no — re-audit passed]
```

### Example JSONL Parsing

Extract tool success rate from a session's traces:

```bash
# Count successful vs failed tool spans
jq -r 'select(.name | startswith("builtin-post-tool")) | .status.code' \
  ~/.claude/telemetry/traces-2026-02-13.jsonl | sort | uniq -c

# List all tools used and their durations
jq -r 'select(.name | startswith("builtin-post-tool")) |
  "\(.attributes["tool.name"] // .name)\t\(.duration_ms // "n/a")ms"' \
  ~/.claude/telemetry/traces-2026-02-13.jsonl
```

---

## 3. Scorecard Evolution

### Grade History

Track how the scorecard changes across fix sessions:

| Directory | Baseline (2026-02-13) | After Phase 1 | After Phase 2 | After Phase 3 | After Phase 4 | After Phase 5 |
|-----------|----------------------|---------------|---------------|---------------|---------------|---------------|
| `index.html` (hub) | **A** | | | | | |
| `capital_city/` | **A** | | | | | |
| `holliday_lighting/index.html` | **B+** | | | | | |
| `holliday_lighting/` (reports) | **C+** | | | | | |
| `leora_research/index.html` | **A-** | | | | | |
| `leora_research/` (forms) | **D+** | | | | | |
| `balloon-collective/` | **D** | | | | | |
| `edgar_nadyne/` | **D** | | | | | |
| `integrity-studio-ai/` | **D** | | | | | |
| `trp-austin/` (research) | **D** | | | | | |
| `trp-austin/` (competitor) | **B** | | | | | |
| `zoukmx/` | **D** | | | | | |
| `ngo-market/` | **D-** | | | | | |
| `PerformanceTest/` | **D+** | | | | | |

### Re-Audit Process

After each phase:

1. Re-run the relevant checks against modified files (dark mode, responsive, table overflow, etc.)
2. Update the scorecard column for the completed phase
3. Record the delta (e.g., `D → C+` = +2 grade steps)
4. Tag the commit with the phase identifier (e.g., `audit-phase-1`)

### Grade Calculation

Grades are based on 4 dimensions: Dark Mode, Mobile Responsiveness, Table Handling, Accessibility.

| Grade | Criteria |
|-------|----------|
| **A** | Pass on all 4 dimensions |
| **B** | Pass on 3 of 4 dimensions |
| **C** | Pass on 2 of 4 dimensions |
| **D** | Pass on 1 or fewer dimensions |

Modifiers (+/-) reflect partial compliance or caveats within a dimension.

---

## 4. Translation Quality Signals

### Structural Parity Checks

Each translation must pass these automated checks before it's considered complete:

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Line count parity | `wc -l source.html translated.html` | Within 5% of source |
| CSS identity | Diff `<style>` blocks | Identical (no style changes in translation) |
| `lang` attribute | Check `<html lang="...">` | Set to target locale (e.g., `pt-BR`) |
| HTML structure | Compare tag sequence | Identical tag nesting and order |
| No English fragments | Search for common English words | Zero matches in translated content sections |

### Custom OTEL Spans for Translation Sessions

When the `content-translator` skill (T1) is implemented, instrument each phase:

```
translation-session
├── source-extraction     (duration, text-block count)
├── translation           (duration, word count, target language)
├── localization          (duration, locale rules applied)
├── assembly              (duration, output file size)
└── qa-validation         (duration, checks passed/failed)
```

### Coverage Metric

Track translation coverage as a top-level metric:

- **Current**: 3/19 reports translated to PT-BR (15.8%)
- **Target**: Define per-phase translation targets after T1 is validated
- **Files translated**: `edghar_nadyne_perfil_artista.html`, `analise_mercado_zouk.html`, `analise_mercado_austin.html`

---

## 5. Alert Thresholds

Detect regressions and quality issues early with threshold-based alerts:

| Condition | Trigger | Action |
|-----------|---------|--------|
| New report without dark mode | HTML file added without `prefers-color-scheme: dark` | Flag in PR review; add to backlog as C1 variant |
| New report without responsive breakpoints | HTML file added without `@media (max-width: 768px)` | Flag in PR review; add to backlog as C2 variant |
| Translation coverage drops | Translated file deleted or source file added without translation | Update `TRANSLATION_STATUS.md`; flag coverage regression |
| Tool failure rate > 10% | `status.code != 0` spans exceed 10% of session total | Investigate tool errors; check for environment issues |
| Token burn > 200K | Session token count exceeds 200,000 | Review session efficiency; consider splitting into smaller tasks |
| Hook latency > 500ms | Any hook execution exceeds 500ms average | Profile hook; check for blocking I/O or network calls |
| Scorecard grade regression | Any directory grade drops from previous phase | Investigate; likely a conflicting change was introduced |

### Implementation

These thresholds can be checked:
- **Locally**: Post-session script parsing JSONL exports
- **Toolkit dashboard**: Quality metrics API at `GET /api/dashboard?period=24h` surfaces alerts with severity, remediation hints, and affected evaluation counts
- **Toolkit alert config**: Dashboard supports warning + critical two-tier thresholds per metric via `MetricConfigBuilder`
- **CI/CD**: Pre-merge checks for new HTML files (dark mode, responsive presence)

---

## 6. Observability Toolkit Integration

The observability toolkit at `~/.claude/mcp-servers/observability-toolkit/` provides a local dashboard, API, and programmatic APIs for all metrics tracked in this plan.

### Quality Dashboard

Location: `~/.claude/mcp-servers/observability-toolkit/dashboard/`

```bash
cd ~/.claude/mcp-servers/observability-toolkit/dashboard && npm run dev
# UI: localhost:5173 | API: 127.0.0.1:3001
```

#### API Endpoints

| Endpoint | Params | Returns |
|----------|--------|---------|
| `GET /api/dashboard` | `period=24h\|7d\|30d`, `role=executive\|operator\|auditor` | Quality summary or role-specific view |
| `GET /api/metrics/:name` | `topN=1-50`, `bucketCount=2-20` | Metric detail with score histogram |
| `GET /api/health` | — | `{ status, hasData }` |

#### Built-In Quality Metrics

7 metrics with percentile aggregations (p50, p95, p99):

| Metric | Description | Range |
|--------|-------------|-------|
| `relevance` | Response relevance | 0-1 |
| `task_completion` | Task completion rate | 0-1 |
| `tool_correctness` | Tool selection accuracy | 0-1 |
| `hallucination` | Hallucination rate | 0-1 |
| `evaluation_latency` | Evaluation latency | 0-60s |
| `faithfulness` | Response faithfulness | 0-1 |
| `coherence` | Response coherence | 0-1 |

#### Role-Based Views

- **Executive** (`?role=executive`): Overall status, metric counts, trend direction, SLA breaches
- **Operator** (`?role=operator`): All metric details, alerts with remediation, drill-down links
- **Auditor** (`?role=auditor`): Alert history, evidence trail (evaluation IDs, timestamps), threshold configs

#### Evaluation Derivation

Derive rule-based metrics from trace spans:
```bash
tsx ~/.claude/mcp-servers/observability-toolkit/dashboard/scripts/derive-evaluations.ts
```
Produces `tool_correctness` (success = 1.0), `evaluation_latency` (duration in seconds), `task_completion` (updates/creates ratio).

### Interface Documentation

Architecture specs and research at `~/.claude/mcp-servers/observability-toolkit/docs/interface/`:

| Document | Covers |
|----------|--------|
| Quality Metrics Dashboard | `computeDashboardSummary()` pipeline, R-7 percentile interpolation, `MetricConfigBuilder` API |
| Quality Dashboard UX Review | Gap analysis (11 gaps), 6-phase implementation sequence (v2.1-v2.3+) |
| Backend Data Storage | Dual-backend (local JSONL + OTLP), circuit breaker, rate limiter, 5 bounded caches |
| Error Tracking Design | 4-category classification, 14 error codes, production-safe sanitization |
| Caching Design | Two LRU caches (query result + regex), TTL-based expiry, ~20MB worst case |
| LLM-as-Judge Handoff | Rule-based vs LLM-as-Judge gap, OTel evaluation record format |
| LLM Explainability Research | 6-platform comparison, OTel `gen_ai.evaluation.result` event spec |

### Programmatic Metrics via Hook APIs

**Record per-fix metrics using `instrumentHook`:**
```typescript
import { instrumentHook } from './lib/otel-monitor.js';

await instrumentHook('backlog-fix', async (ctx) => {
  ctx.addAttributes({
    'backlog.id': 'C1',
    'backlog.phase': 1,
    'files.modified': 3,
  });
  ctx.recordMetric('backlog.fix.duration', elapsed, { phase: '1' });
  ctx.logger.info('Backlog item resolved', { id: 'C1', files: 3 });
});
```

**Track token consumption with `recordTokenUsage`:**
```typescript
import { recordTokenUsage, calculateCost } from './lib/token-metrics.js';

recordTokenUsage({
  inputTokens: 85000,
  outputTokens: 12000,
  model: 'claude-opus-4-6',
});

const cost = calculateCost(85000, 12000, 'claude-opus-4-6');
```

**Monitor context window with `getContextStats`:**
```typescript
import { trackSessionContext, getContextStats } from './lib/context-tracker.js';

trackSessionContext({ sessionId, transcriptPath });
const stats = getContextStats();
// stats.utilization — % of 200K limit used
// stats.freeSpace — tokens remaining
// stats.byType — breakdown (system, tools, messages)
```

**Record hook performance with `MetricRegistry`:**
```typescript
import { MetricRegistry } from './lib/metric-registry.js';

const registry = MetricRegistry.getInstance();
registry.recordHistogram('hook.duration', durationMs, { hook: 'post-tool' });
registry.incrementCounter('hook.executions', 1, { hook: 'post-tool', status: 'ok' });
```

### Native Metric Names

Metrics emitted by the toolkit and surfaced via the dashboard API:

| Metric | Type | Description |
|--------|------|-------------|
| `gen_ai.client.token.usage` | Histogram | Input/output token counts per operation |
| `gen_ai.client.cost` | Histogram | Estimated cost in USD |
| `gen_ai.client.operation.duration` | Histogram | API call latency |
| `hook.duration` | Histogram | Hook execution time in ms |
| `hook.executions` | Counter | Hook invocation count |
| `session.context.size` | Gauge | Current context window tokens |
| `session.context.utilization` | Gauge | % of 200K context limit |
| `mcp.completions` | Counter | MCP tool call count |
| `mcp.output_size` | Histogram | MCP output bytes |

### Local JSONL Queries

Telemetry files at `~/.claude/telemetry/`:

**Tool success rate from traces:**
```bash
jq -r 'select(.name | startswith("builtin-post-tool")) | .status.code' \
  ~/.claude/telemetry/traces-2026-02-13.jsonl | sort | uniq -c
```

**Issues resolved from git log:**
```bash
git log --oneline --since="2026-02-13" | grep -oE '[CHTMLD][0-9]+' | sort | uniq -c | sort -rn
```

**Average hook latency:**
```bash
awk -F',' '{sum += $3; count++} END {print sum/count "ms avg over " count " executions"}' \
  ~/.claude/telemetry/hook-performance.log
```

**Files modified per session:**
```bash
jq -r 'select(.attributes["file.path"] != null) | .attributes["file.path"]' \
  ~/.claude/telemetry/traces-2026-02-13.jsonl | sort -u | wc -l
```

---

## Appendix: OTEL Span Schema Reference

Based on telemetry captured during the 2026-02-13 readability audit session (`01af120d-c2c7-4a0b-8e65-1c0276987bc0`).

### Trace Span Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Span operation name | `builtin-post-tool`, `session-start` |
| `traceId` | string | Trace identifier | `abc123...` |
| `spanId` | string | Unique span identifier | `def456...` |
| `parentSpanId` | string | Parent span (for nested operations) | `ghi789...` |
| `startTimeUnixNano` | int64 | Span start timestamp (nanoseconds) | `1739462400000000000` |
| `endTimeUnixNano` | int64 | Span end timestamp (nanoseconds) | `1739462401000000000` |
| `status.code` | int | 0 = OK, 1 = Error | `0` |
| `attributes` | object | Key-value metadata | See below |

### Common Span Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `tool.name` | string | Tool that was invoked (Bash, Read, Write, Edit, etc.) |
| `tool.success` | boolean | Whether the tool call succeeded |
| `session.id` | string | Claude Code session identifier |
| `file.path` | string | File path involved in the operation |
| `git.branch` | string | Active git branch |
| `git.repo` | string | Repository name |

### Log Entry Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `timestamp` | string | ISO 8601 timestamp | `2026-02-13T14:30:00Z` |
| `severityText` | string | Log level | `INFO`, `DEBUG`, `WARN` |
| `body` | string | Log message content | `Tool completed: Read` |
| `attributes` | object | Structured metadata | `{"tool.name": "Read", "file.path": "..."}` |
| `traceId` | string | Associated trace | Links log to span context |
| `spanId` | string | Associated span | Links log to specific operation |

### Hook Performance Log Format

CSV-like format in `~/.claude/telemetry/hook-performance.log`:

```
timestamp,hook_name,duration_ms,exit_code,trigger_event
2026-02-13T14:30:00Z,builtin-post-tool,12,0,tool_complete
2026-02-13T14:30:01Z,session-start,45,0,session_init
```

| Column | Description |
|--------|-------------|
| `timestamp` | ISO 8601 execution time |
| `hook_name` | Hook identifier |
| `duration_ms` | Execution duration in milliseconds |
| `exit_code` | 0 = success, non-zero = failure |
| `trigger_event` | Event that triggered the hook |

---

### Session Reference Data (2026-02-13 Audit)

| Metric | Value |
|--------|-------|
| Session ID | `01af120d-c2c7-4a0b-8e65-1c0276987bc0` |
| Total trace spans | 54 |
| Total log entries | 73 |
| Tool operations | 39 |
| Tool success rate | 100% |
| Agents launched | 1 (Explore) |
| Files audited | 22 |
| Issues identified | 17 (C1-C3, H1-H4, M1-M6, L1-L4) |
