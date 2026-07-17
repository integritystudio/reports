#!/usr/bin/env bash
# Wrapper around run-browser-collect.sh: collects every built-in source in one
# call (the collector itself takes a single --source per run). Writes one
# <source>.json per source into --out-dir and prints a per-source count summary.
# CarMax/Cars.com honor --zip/--radius (metro); Carvana is national and ignores them.
# Usage:
#   ./carmax_cars_carvana_search.sh --min 10000 --max 20000 [--zip 78702] [--radius 75]
#       [--max-items 25] [--sources "carmax cars carvana"] [--out-dir .] [-- <extra collect flags>]
# Any args after `--` are forwarded verbatim to every run-browser-collect.sh call.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"

MIN=""; MAX=""; ZIP="78702"; RADIUS="75"; MAX_ITEMS="25"
SOURCES="carmax cars carvana"; OUT_DIR="."
EXTRA=()

while [ $# -gt 0 ]; do
  case "$1" in
    --min)       MIN="$2"; shift 2 ;;
    --max)       MAX="$2"; shift 2 ;;
    --zip)       ZIP="$2"; shift 2 ;;
    --radius)    RADIUS="$2"; shift 2 ;;
    --max-items) MAX_ITEMS="$2"; shift 2 ;;
    --sources)   SOURCES="$2"; shift 2 ;;
    --out-dir)   OUT_DIR="$2"; shift 2 ;;
    --)          shift; EXTRA=("$@"); break ;;
    *)           echo "Unknown flag: $1" >&2; exit 2 ;;
  esac
done

if [ -z "$MIN" ] || [ -z "$MAX" ]; then
  echo "Required: --min <dollars> --max <dollars>" >&2
  exit 2
fi

mkdir -p "$OUT_DIR"

for s in $SOURCES; do
  out="$OUT_DIR/$s.json"
  echo "collecting $s -> $out" >&2
  # Carvana has no location filter; --zip/--radius are skipped for it.
  if [ "$s" = "carvana" ]; then
    "$HERE/run-browser-collect.sh" --source "$s" --min "$MIN" --max "$MAX" \
      --max-items "$MAX_ITEMS" "${EXTRA[@]}" > "$out"
  else
    "$HERE/run-browser-collect.sh" --source "$s" --min "$MIN" --max "$MAX" \
      --zip "$ZIP" --radius "$RADIUS" --max-items "$MAX_ITEMS" "${EXTRA[@]}" > "$out"
  fi
  count="$(node -e "process.stdout.write(String((require('$OUT_DIR/$s.json').count) ?? 0))" 2>/dev/null || echo '?')"
  echo "  $s: $count listings" >&2
done

echo "done -> $OUT_DIR/{$(echo "$SOURCES" | tr ' ' ',')}.json" >&2
