#!/usr/bin/env bash
# End-to-end used-car pipeline, zero LLM tokens. Three stages:
#   1. SEARCH  — runs the three category wrappers in parallel:
#                  carmax_cars_carvana_search.sh (retail, national)
#                  dealer_search.sh              (all local dealers)
#                  private_party_search.sh       (Craigslist owner)
#   2. VERIFY  — runs run-browser-verify.sh on each collected result file in
#                parallel (batched), keeping only listings whose detail URL
#                verifies as live-match (dedup happens in stage 3).
#   3. RANK    — combines every survivor, runs src/rank.mjs to dedup + rank,
#                and prints the remaining results sorted by price.
# Usage:
#   ./full_search_pipeline.sh --min 10000 --max 20000 [--zip 78702] [--radius 75]
#       [--max-items 25] [--out-dir pipeline-out] [--top 20] [--jobs 4]
#       [--verified-dealers-only] [--keep-blocked] [--skip-verify]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"

MIN=""; MAX=""; ZIP="78702"; RADIUS="75"; MAX_ITEMS="25"
OUT_DIR="pipeline-out"; TOP="20"; JOBS="4"; METRO="Austin, TX"; RANK_MODE="node"
VERIFIED_DEALERS_ONLY="false"; KEEP_BLOCKED="false"; SKIP_VERIFY="false"

while [ $# -gt 0 ]; do
  case "$1" in
    --min)                   MIN="$2"; shift 2 ;;
    --max)                   MAX="$2"; shift 2 ;;
    --zip)                   ZIP="$2"; shift 2 ;;
    --radius)                RADIUS="$2"; shift 2 ;;
    --max-items)             MAX_ITEMS="$2"; shift 2 ;;
    --out-dir)               OUT_DIR="$2"; shift 2 ;;
    --top)                   TOP="$2"; shift 2 ;;
    --jobs)                  JOBS="$2"; shift 2 ;;
    --metro)                 METRO="$2"; shift 2 ;;
    # --rank-mode node: deterministic price-sorted ranking in Node (no LLM, no
    #   estMarketValue). --rank-mode llm: prepare the validated survivors and emit
    #   the Workflow command to run 02-rank-listings.js, which makes a per-vehicle
    #   LLM call to estimate estMarketValue (the shell cannot call an LLM itself).
    --rank-mode)             RANK_MODE="$2"; shift 2 ;;
    --llm)                   RANK_MODE="llm"; shift ;;
    --verified-dealers-only) VERIFIED_DEALERS_ONLY="true"; shift ;;
    --keep-blocked)          KEEP_BLOCKED="true"; shift ;;
    --skip-verify)           SKIP_VERIFY="true"; shift ;;
    *)                       echo "Unknown flag: $1" >&2; exit 2 ;;
  esac
done

case "$RANK_MODE" in
  node|llm) ;;
  *) echo "--rank-mode must be 'node' or 'llm' (got '$RANK_MODE')" >&2; exit 2 ;;
esac

if [ -z "$MIN" ] || [ -z "$MAX" ]; then
  echo "Required: --min <dollars> --max <dollars>" >&2
  exit 2
fi

mkdir -p "$OUT_DIR/retail" "$OUT_DIR/dealers" "$OUT_DIR/private"
export HERE OUT_DIR TOP METRO MIN MAX

# ---- Stage 1: search, all three categories in parallel ---------------------
echo "== stage 1: search (retail | dealers | private-party) in parallel ==" >&2

"$HERE/carmax_cars_carvana_search.sh" --min "$MIN" --max "$MAX" --zip "$ZIP" \
  --radius "$RADIUS" --max-items "$MAX_ITEMS" --out-dir "$OUT_DIR/retail" \
  >"$OUT_DIR/retail/.search.log" 2>&1 &
PID_RETAIL=$!

DEALER_ARGS=(--min "$MIN" --max "$MAX" --max-items "$MAX_ITEMS" --out-dir "$OUT_DIR/dealers")
[ "$VERIFIED_DEALERS_ONLY" = "true" ] && DEALER_ARGS+=(--verified-only)
"$HERE/dealer_search.sh" "${DEALER_ARGS[@]}" \
  >"$OUT_DIR/dealers/.search.log" 2>&1 &
PID_DEALERS=$!

"$HERE/private_party_search.sh" --min "$MIN" --max "$MAX" \
  --out "$OUT_DIR/private/craigslist.json" \
  >"$OUT_DIR/private/.search.log" 2>&1 &
PID_PRIVATE=$!

SEARCH_FAIL=0
wait "$PID_RETAIL"  || { echo "! retail search failed (see $OUT_DIR/retail/.search.log)" >&2; SEARCH_FAIL=1; }
wait "$PID_DEALERS" || { echo "! dealer search failed (see $OUT_DIR/dealers/.search.log)" >&2; SEARCH_FAIL=1; }
wait "$PID_PRIVATE" || { echo "! private-party search failed (see $OUT_DIR/private/.search.log)" >&2; SEARCH_FAIL=1; }
[ "$SEARCH_FAIL" = "1" ] && echo "  (continuing with whatever collected)" >&2

# Gather every collector result file (exclude derived artifacts).
collect_files() {
  find "$OUT_DIR" -type f -name '*.json' \
    ! -name '*.verdicts.json' ! -name '*.survivors.json' \
    ! -name 'combined.json' ! -name 'ranked.json' | sort
}
FILES="$(collect_files)"
if [ -z "$FILES" ]; then echo "No listings collected — aborting." >&2; exit 1; fi

# ---- Stage 2: verify each result file in parallel (batched) ----------------
if [ "$SKIP_VERIFY" = "true" ]; then
  echo "== stage 2: skipped (--skip-verify); all collected listings kept ==" >&2
  while IFS= read -r f; do cp "$f" "$f.survivors.json"; done <<< "$FILES"
else
  echo "== stage 2: verify detail URLs, up to $JOBS files in parallel ==" >&2
  running=0
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    (
      "$HERE/run-browser-verify.sh" --file "$f" > "$f.verdicts.json" 2>/dev/null || echo '[]' > "$f.verdicts.json"
    ) &
    running=$((running + 1))
    if [ "$running" -ge "$JOBS" ]; then wait; running=0; fi
  done <<< "$FILES"
  wait

  # Filter each file to verified survivors.
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    node -e '
      const fs = require("fs");
      const [, coll, verd, keepBlocked] = process.argv;
      const j = JSON.parse(fs.readFileSync(coll, "utf8"));
      const listings = j.listings || j.topBargains || (Array.isArray(j) ? j : []);
      let verdicts = []; try { verdicts = JSON.parse(fs.readFileSync(verd, "utf8")); } catch {}
      const status = new Map(verdicts.map(v => [v.url, v.status]));
      const kb = keepBlocked === "true";
      const survivors = listings.filter(l => {
        const s = status.get(l.url);
        if (s === "live-match") return true;
        if ((s === "blocked" || s === undefined) && kb) return true;  // unverifiable
        return false;                                                  // dead / mismatch / unverifiable
      });
      fs.writeFileSync(coll + ".survivors.json", JSON.stringify({ listings: survivors }));
      process.stderr.write(`  ${coll}: ${survivors.length}/${listings.length} verified\n`);
    ' "$f" "$f.verdicts.json" "$KEEP_BLOCKED"
  done <<< "$FILES"
fi

# ---- Stage 3: combine + rank + list ----------------------------------------
echo "== stage 3: combine, dedup, rank (mode: $RANK_MODE) ==" >&2
SURVIVORS="$(find "$OUT_DIR" -type f -name '*.survivors.json' | sort)"
node -e '
  const fs = require("fs");
  const files = process.argv.slice(1);
  const all = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(f, "utf8"));
    for (const l of (j.listings || [])) all.push(l);
  }
  fs.writeFileSync(process.env.OUT_DIR + "/combined.json", JSON.stringify({ listings: all }));
  process.stderr.write(`  combined survivors: ${all.length}\n`);
' $SURVIVORS

# LLM mode: the shell cannot call an LLM, so prepare the validated survivors as
# args and emit the Workflow command that runs 02-rank-listings.js (per-vehicle
# LLM valuation → estMarketValue → discount rank). Then stop.
if [ "$RANK_MODE" = "llm" ]; then
  node -e '
    const fs = require("fs");
    const listings = JSON.parse(fs.readFileSync(process.env.OUT_DIR + "/combined.json", "utf8")).listings || [];
    const args = { metro: process.env.METRO, priceMin: Number(process.env.MIN), priceMax: Number(process.env.MAX), topN: Number(process.env.TOP), listings };
    fs.writeFileSync(process.env.OUT_DIR + "/rank-args.json", JSON.stringify(args, null, 1));
    process.stderr.write(`  wrote ${listings.length} validated survivors to ${process.env.OUT_DIR}/rank-args.json\n`);
  '
  echo "" >&2
  echo "LLM ranking prepared. Run the valuation+rank Workflow with the prepared args:" >&2
  echo "  Workflow({ scriptPath: \"car-market/scripts/02-rank-listings.js\"," >&2
  echo "             args: <contents of $OUT_DIR/rank-args.json> })" >&2
  echo "  → per-vehicle LLM estMarketValue, then deterministic discount ranking." >&2
  exit 0
fi

# rank.mjs dedups + ranks; it only scores listings that carry estMarketValue
# (attached by the LLM valuation stage). ranked.json is written for that case.
node "$HERE/src/rank.mjs" --file "$OUT_DIR/combined.json" --top "$TOP" --pretty \
  > "$OUT_DIR/ranked.json" 2>/dev/null || true

# Always print the deduped remaining results sorted by price (works with or
# without estMarketValue), and note how many the ranker could score.
node -e '
  const fs = require("fs");
  const { dedupeListings } = require(process.env.HERE + "/src/rank-lib.mjs");
  const combined = JSON.parse(fs.readFileSync(process.env.OUT_DIR + "/combined.json", "utf8")).listings || [];
  const { unique } = dedupeListings(combined);
  unique.sort((a, b) => (a.price || 0) - (b.price || 0));
  let ranked = 0;
  try { ranked = (JSON.parse(fs.readFileSync(process.env.OUT_DIR + "/ranked.json", "utf8")).topBargains || []).length; } catch {}
  const top = Number(process.env.TOP || "20");
  console.log("");
  console.log(`Remaining results: ${unique.length} unique (${combined.length} before dedup). Ranker scored ${ranked} with a market estimate.`);
  console.log("price       year make model                         geo       url");
  console.log("--------------------------------------------------------------------------------");
  for (const l of unique.slice(0, top)) {
    const price = "$" + String(l.price || 0).padStart(6);
    const ymm = `${l.year || "?"} ${l.make || "?"} ${l.model || ""}`.slice(0, 28).padEnd(28);
    const geo = String(l.geoScope || "?").padEnd(8);
    console.log(`${price}   ${ymm}  ${geo}  ${l.url || "(no url)"}`);
  }
' 2>&1

echo "" >&2
echo "artifacts in $OUT_DIR/: combined.json, ranked.json, per-file *.verdicts.json / *.survivors.json" >&2
