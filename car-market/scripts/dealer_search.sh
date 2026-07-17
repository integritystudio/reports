#!/usr/bin/env bash
# Wrapper around run-browser-collect.sh: collects every seed dealer that has a
# resolved used-inventory URL in dealers.json, one --source dealer run per site.
# Writes one <slug>.json per dealer into --out-dir and prints a per-dealer count.
# Dealers whose `used` URL is null are skipped (resolve the live URL first — the
# collector never guesses). Physical metro dealers → geoScope:"metro".
# Usage:
#   ./dealer_search.sh --min 10000 --max 20000 [--max-items 25] [--out-dir dealers]
#       [--verified-only] [--dealers-json ../dealers.json] [-- <extra collect flags>]
# Any args after `--` are forwarded verbatim to every run-browser-collect.sh call.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"

MIN=""; MAX=""; MAX_ITEMS="25"; OUT_DIR="dealers"
VERIFIED_ONLY="false"; DEALERS_JSON="$HERE/../dealers.json"
EXTRA=()

while [ $# -gt 0 ]; do
  case "$1" in
    --min)           MIN="$2"; shift 2 ;;
    --max)           MAX="$2"; shift 2 ;;
    --max-items)     MAX_ITEMS="$2"; shift 2 ;;
    --out-dir)       OUT_DIR="$2"; shift 2 ;;
    --dealers-json)  DEALERS_JSON="$2"; shift 2 ;;
    --verified-only) VERIFIED_ONLY="true"; shift ;;
    --)              shift; EXTRA=("$@"); break ;;
    *)               echo "Unknown flag: $1" >&2; exit 2 ;;
  esac
done

if [ -z "$MIN" ] || [ -z "$MAX" ]; then
  echo "Required: --min <dollars> --max <dollars>" >&2
  exit 2
fi

mkdir -p "$OUT_DIR"

# Emit TAB-separated: slug \t name \t used-URL for each collectable dealer.
DEALERS="$(node -e '
  const path = process.argv[1], verifiedOnly = process.argv[2] === "true";
  const { dealers } = require(path);
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  for (const d of dealers) {
    if (!d.used) continue;
    if (verifiedOnly && !d.usedVerified) continue;
    process.stdout.write([slug(d.name), d.name, d.used].join("\t") + "\n");
  }
' "$DEALERS_JSON" "$VERIFIED_ONLY")"

if [ -z "$DEALERS" ]; then
  echo "No dealers with a used URL found in $DEALERS_JSON" >&2
  exit 1
fi

while IFS=$'\t' read -r slug name url; do
  [ -z "$slug" ] && continue
  out="$OUT_DIR/$slug.json"
  echo "collecting $name -> $out" >&2
  "$HERE/run-browser-collect.sh" --source dealer --site "$url" --name "$name" \
    --min "$MIN" --max "$MAX" --max-items "$MAX_ITEMS" ${EXTRA[@]+"${EXTRA[@]}"} > "$out" \
    || echo "  ! $name failed (see above); leaving $out" >&2
  count="$(node -e "process.stdout.write(String((require(require('path').resolve('$out')).count) ?? 0))" 2>/dev/null || echo '?')"
  echo "  $name: $count listings" >&2
done <<< "$DEALERS"

echo "done -> $OUT_DIR/*.json" >&2
