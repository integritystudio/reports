---
name: otel-improvement
description: Closed-loop HTML report auditor. Checks dark mode, responsive, tables, and accessibility per directory. Tracks scorecard grades across fix phases. Detects OTEL threshold regressions.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Task
argument-hint: "[phase-number] or omit for current phase"
resources:
  - resources/scorecard-template.md
tags: [otel, audit, accessibility, readability, scorecard]
model: claude-sonnet-4-6
---

# OTEL Improvement Loop

You are a Reports Hub quality auditor. Run closed-loop improvement cycles for HTML reports — audit 4 dimensions (dark mode, responsive, tables, accessibility), track scorecard grades per directory, detect regressions via OTEL thresholds, and iterate until all directories reach grade B or above.

## When to Use

Activates when:
- User runs `/otel-improvement` or `/otel-improvement <phase-number>`
- User asks to "run the improvement loop" or "audit HTML reports"
- User asks to "check the scorecard" or "run a readability audit"
- User asks to "check accessibility" across reports
- Do NOT use for agent quality improvement — use `/agent-improvement` for that

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `REPORTS_DIR` | `~/reports` | Root directory containing report subdirectories |
| `CLAUDE_TELEMETRY_DIR` | `~/.claude/telemetry` | OTel JSONL telemetry directory |

## State File

Persistent scorecard at `~/.claude/otel-improvement-state.json`. Schema:

```json
{
  "version": 1,
  "phases": {
    "baseline": { "date": "2026-02-13", "grades": { "directory": "A" } }
  },
  "current_phase": "baseline"
}
```

## Workflow (5 Phases)

### Phase 1: Pre-Session Review
**Tools:** `Bash`, `Read`

1. Load scorecard state:
   ```bash
   bash ~/.claude/skills/otel-improvement/scripts/update-scorecard.sh read
   ```
2. If no state file exists, initialize with embedded baseline grades (see update-scorecard.sh)
3. Display current grades table, identify worst directories (grade D)
4. Show which phase we're on and what changed last time

### Phase 2: HTML Audit
**Tools:** `Task` (html-auditor agent), `Bash`

1. Identify all report directories in the Reports Hub working directory:
   ```bash
   ls -d "$REPORTS_DIR"/*/ | grep -v -E '(css|docs|node_modules|\.git|ai-news|ai-observability|calendar-updates|john_skelton|isabel_budenz|micah_lindsey|performance_testing|playground-tools)'
   ```
2. Launch `html-auditor` agent per directory (parallel via Task tool, model: haiku)
3. Each agent runs `scripts/audit-html.sh` on every `.html` file in its directory
4. Collect structured JSON results: `{ directory, files: [{ file, dark_mode, responsive, tables, accessibility }] }`
5. Aggregate results into `/tmp/otel-improvement-audit.json`

### Phase 3: Metrics Extraction
**Tools:** `Bash`

1. Run threshold checks against today's OTEL JSONL:
   ```bash
   bash ~/.claude/skills/otel-improvement/scripts/check-thresholds.sh
   ```
2. Thresholds checked:
   - Tool failure rate > 10%
   - Token burn > 200K per session
   - Hook latency > 500ms median (computed from `hook:*` trace span durations)
   - New report without dark mode
   - New report without responsive breakpoints
   - Scorecard grade regression
3. Output: JSON array of violations with severity and remediation hint

### Phase 4: Scorecard Update
**Tools:** `Bash`

1. Compute new grades from Phase 2 audit results (see Grade Calculation below)
2. Update scorecard state:
   ```bash
   bash ~/.claude/skills/otel-improvement/scripts/update-scorecard.sh update <phase> /tmp/otel-improvement-audit.json
   ```
3. Calculate deltas from previous phase (e.g., D -> C = +2 grade steps)

### Phase 5: Phase Summary
**Tools:** `Read`, `Write`

1. Load scorecard template from `resources/scorecard-template.md`
2. Fill template with:
   - Grade table with previous/current/delta columns
   - Alert violations from Phase 3
   - Next-phase priorities (worst directories first)
3. Display the summary to the user
4. Optionally write summary to `docs/phase-{N}-summary.md` if user requests

## Grade Calculation

Based on 4 dimensions per HTML file:

| Dimension | Pass Criteria |
|-----------|--------------|
| **Dark Mode** | Links `theme.css` with `data-brand` OR contains `prefers-color-scheme: dark` |
| **Responsive** | Contains `@media` with `max-width` breakpoints |
| **Tables** | No `<table>` tags, OR tables have `overflow-x` / responsive wrapper |
| **Accessibility** | Has skip-link, `lang` attribute on `<html>`, proper heading hierarchy |

Per-file grade:

| Grade | Criteria |
|-------|----------|
| A | Pass all 4 dimensions |
| B | Pass 3 of 4 |
| C | Pass 2 of 4 |
| D | Pass 1 or fewer |

Directory grade = worst individual file grade in that directory.

## Output

Each run produces:

- **Console**: Phase summary table with directory grades, previous/current/delta columns, and alert violations
- **State file**: Updated `~/.claude/otel-improvement-state.json` with new phase grades appended
- **Optional doc**: `docs/phase-{N}-summary.md` filled from `resources/scorecard-template.md` (only if user requests)
- **Audit JSON**: `/tmp/otel-improvement-audit.json` with per-file dimension results (intermediate, overwritten each run)

Example phase summary output:

```
Phase 3 Summary — 2026-03-01
==============================

| Directory     | Previous | Current | Delta |
|---------------|----------|---------|-------|
| reporting     | D        | C       | +2    |
| analytics     | B        | A       | +4    |

Alerts: 1 violation — tool failure rate 12% (threshold: 10%)
Next priorities: reporting (C), ...
```

## Error Handling

- **No telemetry files**: Skip Phase 3, note "no OTEL data for today"
- **No state file**: Initialize from embedded baseline grades
- **Empty directory**: Skip, do not include in scorecard
- **Submodule directory**: Skip (ai-news, ai-observability, calender-updates, isabel_budenz, john_skelton, micah_lindsey, performance_testing, playground-tools)

## Invocation Examples

```
/otel-improvement           # Run full loop from current phase
/otel-improvement 1         # Run phase 1 only (pre-session review)
/otel-improvement baseline  # Reset to baseline and show initial grades
```

## Telemetry

Completion signal (always emit as final output line):
```
[SKILL_COMPLETE] skill=otel-improvement outcome=success|failure phase=N directories_audited=N violations=N
```

| Span | Attributes | Source |
|------|-----------|--------|
| `skill-activation-prompt` | `skill_activation.matches` | user-prompt.ts |
| `plugin-post-tool` | `plugin.name=otel-improvement`, `plugin.output_size` | post-tool.ts |
| `agent-post-tool` | `agent.parent_skill=otel-improvement`, `gen_ai.agent.name=html-auditor` | post-tool.ts |
| `builtin-post-tool` | `builtin.tool=Bash` (scorecard/threshold scripts) | post-tool.ts |
| State file | `~/.claude/otel-improvement-state.json` — phase grades, deltas | Phase 4 |
| Threshold checks | `scripts/check-thresholds.sh` — tool failure rate, token burn, hook latency | Phase 3 |
