#!/bin/bash
# check-thresholds.sh — Parse OTEL JSONL for threshold violations
# Usage: check-thresholds.sh [date]
# Output: JSON array of threshold violations to stdout

set -euo pipefail

DATE="${1:-$(date +%Y-%m-%d)}"
TELEMETRY_DIR="${CLAUDE_TELEMETRY_DIR:-$HOME/.claude/telemetry}"
TRACES_FILE="$TELEMETRY_DIR/traces-$DATE.jsonl"

violations="[]"

add_violation() {
  local condition="$1" trigger="$2" action="$3" value="$4"
  violations=$(echo "$violations" | jq --arg c "$condition" --arg t "$trigger" --arg a "$action" --arg v "$value" \
    '. + [{"condition": $c, "trigger": $t, "action": $a, "value": $v}]')
}

# --- Tool Failure Rate > 10% ---
if [[ -f "$TRACES_FILE" ]]; then
  total_tools=$(jq -r 'select(.name == "hook:builtin-post-tool") | .name' "$TRACES_FILE" 2>/dev/null | wc -l | tr -d ' ')
  failed_tools=$(jq -r 'select(.name == "hook:builtin-post-tool") | select(.attributes["builtin.success"] == false or .attributes["builtin.has_error"] == true) | .name' "$TRACES_FILE" 2>/dev/null | wc -l | tr -d ' ')

  if [[ "$total_tools" -gt 0 ]]; then
    failure_pct=$((failed_tools * 100 / total_tools))
    if [[ "$failure_pct" -gt 10 ]]; then
      add_violation "Tool failure rate > 10%" "${failure_pct}% failures ($failed_tools/$total_tools)" "Investigate tool errors; check for environment issues" "$failure_pct"
    fi
  fi

  # --- Token Burn > 200K ---
  # Check for token usage in span attributes
  token_sum=$(jq -r '
    select(.attributes != null) |
    (.attributes["gen_ai.usage.input_tokens"] // 0) + (.attributes["gen_ai.usage.output_tokens"] // 0)
  ' "$TRACES_FILE" 2>/dev/null | awk '{sum+=$1} END {print int(sum)}')

  if [[ "${token_sum:-0}" -gt 200000 ]]; then
    add_violation "Token burn > 200K" "${token_sum} tokens in session" "Review session efficiency; consider splitting into smaller tasks" "$token_sum"
  fi
else
  add_violation "No traces file" "Missing $TRACES_FILE" "No OTEL data for $DATE; check telemetry directory" "0"
fi

# --- Hook Latency > 500ms Median ---
if [[ -f "$TRACES_FILE" ]]; then
  hook_durations=$(jq -r '
    select(.name | startswith("hook:")) |
    select(.duration != null) |
    if (.duration | type) == "array" then
      (.duration[0] * 1000 + .duration[1] / 1000000)
    elif (.duration | type) == "number" then
      .duration
    else empty end
  ' "$TRACES_FILE" 2>/dev/null | sort -n)

  if [[ -n "$hook_durations" ]]; then
    count=$(echo "$hook_durations" | wc -l | tr -d ' ')
    median_idx=$(( (count + 1) / 2 ))
    median_ms=$(echo "$hook_durations" | sed -n "${median_idx}p" | awk '{printf "%d", $1}')
    if [[ "${median_ms:-0}" -gt 500 ]]; then
      add_violation "Hook latency > 500ms" "${median_ms}ms median ($count hooks)" \
        "Profile hook runner; check for blocking I/O or network calls" "$median_ms"
    fi
  fi
fi

# --- Scorecard Regression ---
STATE_FILE="$HOME/.claude/otel-improvement-state.json"
if [[ -f "$STATE_FILE" ]]; then
  regressions=$(jq -r '
    .current_phase as $curr |
    .phases[$curr].grades as $curr_grades |
    (.phases | to_entries | sort_by(.value.date) | map(select(.key != $curr)) | last // {value:{grades:{}}}) .value.grades as $prev |
    [$curr_grades | to_entries[] | select($prev[.key] != null) |
      {key, curr: .value, prev: $prev[.key]} |
      select(
        (.curr == "D" and (.prev == "A" or .prev == "B" or .prev == "C")) or
        (.curr == "C" and (.prev == "A" or .prev == "B")) or
        (.curr == "B" and .prev == "A")
      )
    ] | length
  ' "$STATE_FILE" 2>/dev/null || echo "0")
  if [[ "${regressions:-0}" -gt 0 ]]; then
    add_violation "Scorecard regression" "$regressions directories regressed" \
      "Review recent changes; check if HTML modifications broke dimensions" "$regressions"
  fi
fi

# --- Output ---
echo "$violations" | jq '.'
