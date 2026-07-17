#!/usr/bin/env bash
# Wrapper around src/craigslist.mjs: collects all private-party (owner) listings.
# Craigslist is the only private-party source and needs no browser (JSON `sapi`
# API), so this runs deterministically at zero LLM tokens. Runs each metro
# subregion in --areas, VIN-enriches + filters by default (drops no-VIN private
# listings and mid/full-size trucks + vans), then merges into one JSON file
# deduped by URL. All listings are private sellers → purveyor owner.
# Usage:
#   ./private_party_search.sh --min 10000 --max 20000 [--areas "15"] [--out craigslist.json]
#       [--no-filter] [--no-enrich-vin] [--purveyor owner] [--pretty] [-- <extra craigslist flags>]
# Find a metro's areaId: open https://<metro>.craigslist.org/search/cta and grep "areaId":N.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"

MIN=""; MAX=""; AREAS="15"; OUT="craigslist.json"; PURVEYOR="owner"
ENRICH_VIN="true"; FILTER="true"; PRETTY="false"
EXTRA=()

while [ $# -gt 0 ]; do
  case "$1" in
    --min)          MIN="$2"; shift 2 ;;
    --max)          MAX="$2"; shift 2 ;;
    --areas)        AREAS="$2"; shift 2 ;;
    --out)          OUT="$2"; shift 2 ;;
    --purveyor)     PURVEYOR="$2"; shift 2 ;;
    --no-enrich-vin) ENRICH_VIN="false"; shift ;;
    --no-filter)    FILTER="false"; shift ;;
    --pretty)       PRETTY="true"; shift ;;
    --)             shift; EXTRA=("$@"); break ;;
    *)              echo "Unknown flag: $1" >&2; exit 2 ;;
  esac
done

if [ -z "$MIN" ] || [ -z "$MAX" ]; then
  echo "Required: --min <dollars> --max <dollars>" >&2
  exit 2
fi

FLAGS=()
[ "$ENRICH_VIN" = "true" ] && FLAGS+=(--enrich-vin)
[ "$FILTER" = "true" ] && FLAGS+=(--filter)

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

parts=()
for a in $AREAS; do
  part="$TMP_DIR/area-$a.json"
  echo "collecting private-party area $a -> $part" >&2
  node "$HERE/src/craigslist.mjs" --area "$a" --min "$MIN" --max "$MAX" \
    --purveyor "$PURVEYOR" ${FLAGS[@]+"${FLAGS[@]}"} ${EXTRA[@]+"${EXTRA[@]}"} > "$part"
  parts+=("$part")
done

# Merge every area's listings, dedup by URL, write one file.
node -e '
  const fs = require("fs");
  // argv after `-e`: [node, OUT, PRETTY, PURVEYOR, ...parts]
  const out = process.argv[1], pretty = process.argv[2] === "true", purveyor = process.argv[3];
  const parts = process.argv.slice(4);
  const seen = new Set(), listings = [];
  let searchPath;
  for (const p of parts) {
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    searchPath = j.searchPath ?? searchPath;
    for (const l of (j.listings || [])) {
      const key = l.url || (l.year + "|" + l.make + "|" + l.model + "|" + l.price);
      if (seen.has(key)) continue;
      seen.add(key); listings.push(l);
    }
  }
  const merged = { source: "Craigslist", searchPath, purveyor, count: listings.length, listings };
  fs.writeFileSync(out, JSON.stringify(merged, null, pretty ? 1 : 0));
  process.stderr.write(`merged private-party listings: ${listings.length} -> ${out}\n`);
' "$OUT" "$PRETTY" "$PURVEYOR" "${parts[@]}"
