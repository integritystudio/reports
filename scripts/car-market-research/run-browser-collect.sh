#!/usr/bin/env bash
# Wrapper: makes the global playwright-core resolvable and runs browser-collect.
# Usage: ./run-browser-collect.sh --source carmax|carvana|cars --min 10000 --max 20000 [--zip 78701] [--radius 75] [--pretty] [--headful]
# --zip + --radius geo-restrict CarMax/Cars.com to the metro; Carvana is national (tagged geoScope:national).
# Carvana defaults to free-shipping-only; --include-paid-shipping disables it, --free-shipping-only forces it for any source.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PW_DIR="/opt/homebrew/lib/node_modules/openclaw/node_modules"
if [ ! -d "$PW_DIR/playwright-core" ]; then
  PW_DIR="$(dirname "$(node -e "console.log(require.resolve('playwright-core/package.json'))" 2>/dev/null || true)")/.." || true
fi
export PW_DIR
# Prefer a cached Playwright chromium if PLAYWRIGHT_BROWSERS_PATH default is used.
exec node "$HERE/src/browser-collect.mjs" "$@"
