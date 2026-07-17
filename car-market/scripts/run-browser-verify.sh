#!/usr/bin/env bash
# Wrapper: makes the global playwright-core resolvable and runs browser-verify.
# Opens each listing's detail URL in the stealth browser and emits a per-URL
# verdict (live-match/live-mismatch/dead/blocked) — the path that verifies
# CarMax/Carvana URLs, which 403 both fetch and WebFetch.
# Usage:
#   ./run-browser-verify.sh --file listings.json [--pretty] [--headful] > verdicts.json
#   cat listings.json | ./run-browser-verify.sh > verdicts.json
# Input: a JSON array of { url, year, make, model, price } (collector output works).
# Feed verdicts.json into stage 3 as args.preVerified.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PW_DIR="/opt/homebrew/lib/node_modules/openclaw/node_modules"
if [ ! -d "$PW_DIR/playwright-core" ]; then
  PW_DIR="$(dirname "$(node -e "console.log(require.resolve('playwright-core/package.json'))" 2>/dev/null || true)")/.." || true
fi
export PW_DIR
exec node "$HERE/src/browser-verify.mjs" "$@"
