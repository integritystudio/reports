#!/bin/bash
# update-scorecard.sh — Read/write persistent scorecard state
# Usage:
#   update-scorecard.sh read                          — Print current scorecard
#   update-scorecard.sh update <phase> <audit.json>   — Update with new audit results
#   update-scorecard.sh init                           — Initialize baseline from defaults
# Output: Updated scorecard JSON to stdout

set -euo pipefail

STATE_FILE="$HOME/.claude/otel-improvement-state.json"
ACTION="${1:?Usage: update-scorecard.sh <read|update|init> [phase] [audit.json]}"

# Baseline grades — initial audit 2026-02-13
BASELINE_GRADES='{
  "capital_city": "A",
  "holliday_lighting": "C",
  "leora_research": "D",
  "balloon-collective": "D",
  "edgar_nadyne": "D",
  "integrity-studio-ai": "D",
  "trp-austin": "D",
  "zoukmx": "D",
  "ngo-market": "D",
  "PerformanceTest": "D",
  "skelton-woody": "D",
  "sound-sight-tarot": "D"
}'

init_state() {
  local today
  today=$(date +%Y-%m-%d)
  jq -n --arg date "$today" --argjson grades "$BASELINE_GRADES" '{
    version: 1,
    phases: {
      baseline: {
        date: $date,
        grades: $grades
      }
    },
    current_phase: "baseline"
  }' > "$STATE_FILE"
  cat "$STATE_FILE"
}

read_state() {
  if [[ ! -f "$STATE_FILE" ]]; then
    echo '{"error": "no state file", "hint": "run: update-scorecard.sh init"}' >&2
    init_state
    return
  fi
  cat "$STATE_FILE"
}

grade_from_count() {
  local count="$1"
  case "$count" in
    4) echo "A" ;;
    3) echo "B" ;;
    2) echo "C" ;;
    *) echo "D" ;;
  esac
}

update_state() {
  local phase="${2:?update requires <phase>}"
  local audit_file="${3:?update requires <audit.json>}"
  local today
  today=$(date +%Y-%m-%d)

  if [[ ! -f "$STATE_FILE" ]]; then
    init_state > /dev/null
  fi

  if [[ ! -f "$audit_file" ]]; then
    echo "{\"error\": \"audit file not found: $audit_file\"}"
    exit 1
  fi

  # Compute directory grades from audit results
  # audit.json is an array of per-directory objects with directory_grade
  new_grades=$(jq -r '
    if type == "array" then
      [.[] | {(.directory): .directory_grade}] | add // {}
    elif .directory != null then
      {(.directory): .directory_grade}
    else
      {}
    end
  ' "$audit_file")

  # Get previous phase for delta calculation
  prev_phase=$(jq -r '.current_phase' "$STATE_FILE")

  # Update state file
  jq --arg phase "$phase" --arg date "$today" --argjson grades "$new_grades" '
    .phases[$phase] = { date: $date, grades: $grades } |
    .current_phase = $phase
  ' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"

  # Output with deltas
  jq --arg prev "$prev_phase" --arg curr "$phase" '
    {
      phase: $curr,
      date: .phases[$curr].date,
      current_grades: .phases[$curr].grades,
      previous_phase: $prev,
      previous_grades: (.phases[$prev].grades // {}),
      all_phases: [.phases | keys[] | select(. != "")]
    }
  ' "$STATE_FILE"
}

case "$ACTION" in
  read)  read_state ;;
  init)  init_state ;;
  update) update_state "$@" ;;
  *)
    echo "Usage: update-scorecard.sh <read|update|init> [phase] [audit.json]" >&2
    exit 1
    ;;
esac
