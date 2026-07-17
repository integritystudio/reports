// Headless-browser collector — drives a real Chromium via playwright-core so it
// passes the bot checks that block plain fetch/WebFetch (HTTP 403/406). This is
// the only path that can reach CarMax, Carvana, Cars.com, CarGurus, and KBB
// listing pages deterministically (zero LLM tokens).
//
// playwright-core isn't a repo dependency; it resolves from a global install.
// Run via the wrapper so NODE_PATH is set:
//   scripts/car-market-research/run-browser-collect.sh --source carmax --min 10000 --max 20000 --zip 78701
// or directly:
//   NODE_PATH="$(node -e "process.stdout.write(require('path').dirname(require.resolve('playwright-core/package.json')+'/..'))" 2>/dev/null || echo /opt/homebrew/lib/node_modules/openclaw/node_modules)" \
//     node src/browser-collect.mjs --source carmax ...
//
// Emits { source, url, count, blocked, listings:[...] } JSON to stdout.
// Listings carry a verbatim detail URL so they can be link-verified downstream.

// playwright-core is a global (not a repo dep) and ESM `import` ignores
// NODE_PATH, so resolve it by absolute path via createRequire. PW_DIR (set by
// the wrapper) or a small candidate list points at the global node_modules.
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
const require = createRequire(import.meta.url)
const PW_CANDIDATES = [
  process.env.PW_DIR,
  '/opt/homebrew/lib/node_modules/openclaw/node_modules',
  '/usr/local/lib/node_modules/openclaw/node_modules',
].filter(Boolean)
let chromium
for (const dir of PW_CANDIDATES) {
  if (existsSync(`${dir}/playwright-core`)) { ({ chromium } = require(`${dir}/playwright-core`)); break }
}
if (!chromium) {
  try { ({ chromium } = require('playwright-core')) } catch {}
}
if (!chromium) {
  process.stderr.write('playwright-core not found. Set PW_DIR to the node_modules dir containing it.\n')
  process.exit(3)
}

const arg = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d }
// Numeric args must parse to a finite number; a typo like `--max foo` should
// fail loudly rather than yield a `cars-under-NaN` URL and a silent 0 results.
const numArg = (f, d) => {
  const n = Number(arg(f, d))
  if (!Number.isFinite(n)) { process.stderr.write(`Invalid numeric value for ${f}: "${arg(f, d)}"\n`); process.exit(2) }
  return n
}
// Below this price a "$…" token is treated as a payment/fee, not a vehicle
// price. Floor with MIN so a low --min never silently drops in-band cars.
const PRICE_TOKEN_FLOOR = 3000
const CARD_TEXT_CAP = 400        // innerText longer than this spans >1 card
const SOURCE = (arg('--source', 'carmax')).toLowerCase()
const MIN = numArg('--min', '10000')
const MAX = numArg('--max', '20000')
const ZIP = arg('--zip', '78701')
const MAXITEMS = numArg('--max-items', '25')
const HEADFUL = process.argv.includes('--headful')
const PRICE_FLOOR = Math.min(PRICE_TOKEN_FLOOR, MIN)

// Per-source search URL + a DOM extractor evaluated in the page. Each extractor
// returns raw {year,make,model,price,miles,url,...} objects; price parsing and
// band filtering happen back in Node.
const SOURCES = {
  carmax: {
    url: `https://www.carmax.com/cars/all/price-under-${MAX}?location=austin+tx`,
    waitFor: 'article, [data-test="car-tile"], a[href*="/car/"]',
  },
  carvana: {
    // Category path pre-filters to ~under-$20k (national delivery; Node still
    // band-filters). The ?price[max] query param does not stick on redirect.
    url: `https://www.carvana.com/cars/cars-under-${MAX}`,
    waitFor: 'a[href*="/vehicle/"], [data-qa="result-tile"]',
  },
  cars: {
    url: `https://www.cars.com/shopping/results/?stock_type=used&maximum_price=${MAX}&zip=${ZIP}`,
    waitFor: '.vehicle-card, a[href*="/vehicledetail/"]',
  },
}

// Generic anchor-based extractor: find vehicle detail links, read nearby text
// for year/make/model/price/miles. Kept simple and resilient to markup churn.
// NOTE: this runs INSIDE the browser via page.evaluate, so it must be a
// self-contained function — options are passed as a runtime argument (closure
// variables do NOT cross the serialization boundary).
function extractInPage({ hint, priceFloor, cardTextCap }) {
  const out = []
  const seen = new Set()
  const priceRe = /\$\s?([1-9]\d{1,2}(?:,\d{3})+|\d{4,6})\b/g
  // A price marker that ends the model/trim span (miles, price, or payment).
  const stopRe = /\$|\b[\d,]+\s*k?\s*(?:mi|miles)\b|current price|original price/i
  const milesRe = /([\d,]+)\s*(k)?\s*(?:mi|miles)\b/i
  const anchors = Array.from(document.querySelectorAll(`a[href*="${hint}"]`))
  for (const a of anchors) {
    const href = a.href
    if (!href) continue
    const id = href.split('?')[0]
    if (seen.has(id)) continue
    seen.add(id)
    // Climb ancestors until the text has BOTH a year and a price but is still a
    // single card (fewer than two year tokens); stop before it balloons.
    let el = a, best = null
    for (let k = 0; k < 7 && el; k++) {
      const t = (el.innerText || '').replace(/\s+/g, ' ').trim()
      const years = (t.match(/\b(19[89]\d|20[0-2]\d)\b/g) || [])
      // Two+ years means we've climbed into a multi-card container: stop and
      // keep the last single-card `best` we captured.
      if (years.length >= 2) break
      if (years.length === 1 && /\$\s?\d/.test(t)) { best = t; if (t.length > cardTextCap) break }
      el = el.parentElement
    }
    if (!best) continue

    // Year + make (one token) + model/trim (the span up to the first price or
    // mileage marker) — captures multi-word nameplates like "Santa Cruz".
    let year = null, make = null, model = null, trim = null
    const ym = best.match(/\b(19[89]\d|20[0-2]\d)\s+([A-Za-z][A-Za-z.-]+)\s+/)
    if (ym) {
      year = Number(ym[1]); make = ym[2]
      const rest = best.slice(ym.index + ym[0].length)
      const cut = rest.search(stopRe)
      const tokens = (cut >= 0 ? rest.slice(0, cut) : rest).replace(/[^\w\s-]/g, ' ').split(/\s+/).filter(Boolean)
      model = tokens.slice(0, 2).join(' ') || null
      trim = tokens.slice(2, 5).join(' ') || null
    }

    // Prefer the price that follows "Current price"; otherwise the first
    // plausible price token (skip "$/mo" payments and sub-floor fees).
    let priceRaw = null
    const cur = best.match(/current price[:\s]*\$\s?([1-9]\d{1,2}(?:,\d{3})+|\d{4,6})\b/i)
    if (cur) priceRaw = cur[1]
    if (!priceRaw) {
      let m
      priceRe.lastIndex = 0
      while ((m = priceRe.exec(best))) {
        const n = Number(m[1].replace(/,/g, ''))
        const after = best.slice(m.index, m.index + m[0].length + 4)
        if (n >= priceFloor && !/\/mo|\/month/.test(after)) { priceRaw = m[1]; break }
      }
    }

    const miles = best.match(milesRe)
    out.push({
      year, make, model, trim,
      priceRaw,
      milesRaw: miles ? (miles[2] ? String(Number(miles[1].replace(/,/g, '')) * 1000) : miles[1]) : null,
      url: id,
      text: best.slice(0, 140),
    })
  }
  return out
}

const HINTS = { carmax: '/car/', carvana: '/vehicle/', cars: '/vehicledetail/' }
// Canonical source label — used for both `src` and `sellerName`, so casing is
// identical whether or not any listing was found. (CarMax/Carvana ARE the
// seller; for Cars.com this marks the aggregator — the per-dealer name is not
// exposed on the results grid.)
const SRC_LABEL = { carmax: 'CarMax', carvana: 'Carvana', cars: 'Cars.com' }[SOURCE] || SOURCE

async function main() {
  const cfg = SOURCES[SOURCE]
  if (!cfg) { process.stderr.write(`Unknown --source ${SOURCE}. Known: ${Object.keys(SOURCES).join(', ')}\n`); process.exit(2) }

  // Stealth: disable the AutomationControlled flag and, when available, drive
  // the real installed Google Chrome (channel:'chrome') — far less detectable
  // than bundled Chromium. Falls back to bundled chromium if Chrome is absent.
  const launchOpts = {
    headless: !HEADFUL,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-dev-shm-usage'],
  }
  let browser = null
  let blocked = false
  let listings = []
  try {
    try { browser = await chromium.launch({ ...launchOpts, channel: 'chrome' }) }
    catch { browser = await chromium.launch(launchOpts) }
    const ctx = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1440, height: 2200 },
      locale: 'en-US',
      timezoneId: 'America/Chicago',
    })
    // Hide the headless/automation tells before any page script runs.
    await ctx.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] })
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] })
      window.chrome = window.chrome || { runtime: {} }
    })
    const page = await ctx.newPage()
    const resp = await page.goto(cfg.url, { waitUntil: 'domcontentloaded', timeout: 45000 })
    const status = resp ? resp.status() : 0
    if (status === 403 || status === 406 || status === 429) blocked = true
    if (blocked) {
      // Bot-blocked: the page has no inventory, so skip the ~27s wait/scroll.
      process.stderr.write(`${SRC_LABEL} returned HTTP ${status} — blocked, skipping extraction.\n`)
    } else {
      // Client-rendered SPA: wait, then scroll to trigger lazy-loaded inventory.
      await page.waitForSelector(cfg.waitFor, { timeout: 20000 }).catch(() => {})
      await page.waitForTimeout(3500)
      for (let s = 0; s < 6; s++) { await page.mouse.wheel(0, 3200); await page.waitForTimeout(1100) }
      await page.waitForTimeout(500)
      const raw = await page.evaluate(extractInPage, { hint: HINTS[SOURCE], priceFloor: PRICE_FLOOR, cardTextCap: CARD_TEXT_CAP })
      // Normalize + band-filter in Node.
      const toInt = s => s == null ? null : Number(String(s).replace(/[^\d]/g, '')) || null
      listings = raw.map(r => ({
        year: r.year, make: r.make, model: r.model, trim: r.trim,
        price: toInt(r.priceRaw),
        miles: toInt(r.milesRaw),
        sellerType: 'dealer',
        sellerName: SRC_LABEL,
        bodyStyle: null,
        url: r.url,
        src: SRC_LABEL,
      })).filter(v => v.price && v.price >= MIN && v.price <= MAX && v.url).slice(0, MAXITEMS)
    }
  } catch (e) {
    process.stderr.write(`nav error: ${e.message || e}\n`)
  } finally {
    if (browser) await browser.close()
  }

  process.stdout.write(JSON.stringify({
    source: SRC_LABEL,
    url: cfg.url,
    blocked,
    count: listings.length,
    listings,
  }, null, process.argv.includes('--pretty') ? 1 : 0) + '\n')
}

main().catch(e => { process.stderr.write(String(e?.stack || e) + '\n'); process.exit(1) })
