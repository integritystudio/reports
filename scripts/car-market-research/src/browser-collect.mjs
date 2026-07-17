// Headless-browser collector — drives a real Chromium via playwright-core so it
// passes the bot checks that block plain fetch/WebFetch (HTTP 403/406). This is
// the only path that can reach CarMax, Carvana, Cars.com, CarGurus, and KBB
// listing pages deterministically (zero LLM tokens).
//
// Generic dealer source: --source dealer --site <used-inventory URL> [--name X]
// collects any local franchise/independent dealer whose site runs on the usual
// JS platforms (Dealer.com / DealerOn / DealerInspire). It uses a multi-marker
// VDP link hint and a broad card selector, is tagged geoScope:'metro' (physical
// local dealer), and band-filters in Node (no universal price param exists).
// See src/dealers.json for the Austin-metro seed list.
//   ./run-browser-collect.sh --source dealer --site https://www.covertauto.com/used-vehicles/ --min 10000 --max 20000
//
// Metro restriction: --zip + --radius geo-restrict CarMax and Cars.com to
// physical inventory within RADIUS miles of ZIP (their real distance filters).
// Carvana has no location filter (national inventory) and is tagged
// geoScope:'national' instead — its listings deliver to the metro, not local.
// Carvana's one availability signal is per-car shipping cost, so it defaults to
// free-shipping-only (--include-paid-shipping opts out; --free-shipping-only
// forces the gate on for any source). The browser also pins navigator.geolocation
// to --zip's coordinates (default 78702), though Carvana's grid does not localize
// its free-shipping labels to it.
//
// playwright-core isn't a repo dependency; it resolves from a global install.
// Run via the wrapper so NODE_PATH is set:
//   scripts/car-market-research/run-browser-collect.sh --source carmax --min 10000 --max 20000 --zip 78701 --radius 75
// or directly:
//   NODE_PATH="$(node -e "process.stdout.write(require('path').dirname(require.resolve('playwright-core/package.json')+'/..'))" 2>/dev/null || echo /opt/homebrew/lib/node_modules/openclaw/node_modules)" \
//     node src/browser-collect.mjs --source carmax ...
//
// Emits { source, url, count, blocked, listings:[...] } JSON to stdout.
// Listings carry a verbatim detail URL so they can be link-verified downstream.

// Stealth-browser session setup (playwright-core resolution, launch, anti-bot
// context) is shared with the verifier — see browser-lib.mjs.
import { resolveChromium, launchStealth, newStealthContext } from './browser-lib.mjs'
const chromium = resolveChromium()
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
// Generic dealer source: --site is the dealer's used-inventory URL, --name an
// optional label (defaults to the hostname). Local franchise/independent dealer
// sites run on JS platforms (Dealer.com / DealerOn / DealerInspire) that 403 or
// hide inventory behind JS, so the browser reaches them the same way it reaches
// CarMax. They are physical metro dealers, so geoScope is 'metro'.
const SITE = arg('--site', '')
const NAME = arg('--name', '')
const MIN = numArg('--min', '10000')
const MAX = numArg('--max', '20000')
const ZIP = arg('--zip', '78702')
// Metro radius in miles around ZIP. CarMax accepts 10–500; used by the sources
// that expose a real distance filter (CarMax, Cars.com) to restrict to local
// inventory. Carvana has no such filter (national inventory) and ignores it.
const RADIUS = numArg('--radius', '75')
// Geolocation pin: browser-level coordinates for ZIP so the page reports the
// delivery location as ZIP if it reads navigator.geolocation (permission is
// granted on the context). Known Austin-metro ZIPs are mapped exactly; any
// other ZIP falls back to the Austin metro centroid. NOTE: probing (2026-07)
// found Carvana's results grid does not localize its "Free shipping" labels to
// this pin — actual delivery fees are finalized per-vehicle at checkout — so the
// pin is set correctly but mainly matters for sites that read geolocation.
const ZIP_COORDS = {
  '78701': { latitude: 30.2711, longitude: -97.7437 },
  '78702': { latitude: 30.2635, longitude: -97.7141 },
  '78745': { latitude: 30.2079, longitude: -97.8009 },
}
const AUSTIN_CENTROID = { latitude: 30.2672, longitude: -97.7431 }
const GEO = ZIP_COORDS[ZIP] || AUSTIN_CENTROID
if (!ZIP_COORDS[ZIP]) process.stderr.write(`No exact coords for ZIP ${ZIP}; pinning geolocation to the Austin metro centroid.\n`)
const MAXITEMS = numArg('--max-items', '25')
// Number of pages to collect (1–3). URL-paginated sources (CarMax, Cars.com) load
// each page separately; scroll-only sources (Carvana) multiply scroll rounds instead.
const PAGES = Math.max(1, Math.min(numArg('--pages', '1'), 3))
// Scroll rounds scale with --max-items so deeper inventories load more cards.
// Minimum of 6 preserves prior behaviour at the default of 25 items.
const SCROLL_ROUNDS = Math.max(6, Math.ceil(MAXITEMS / 4))
const HEADFUL = process.argv.includes('--headful')
const PRICE_FLOOR = Math.min(PRICE_TOKEN_FLOOR, MIN)
// Carvana is national inventory with per-car delivery, so "free shipping" is its
// only availability signal (there is no distance filter). Default Carvana to
// free-shipping-only — the card must say "Free shipping" — so paid-delivery cars
// are excluded. --include-paid-shipping opts out; --free-shipping-only forces it
// for any source. Cards without a detectable shipping status are excluded when
// the filter is on (can't confirm free → don't include).
const FREE_SHIP_ONLY = process.argv.includes('--free-shipping-only') ||
  (SOURCE === 'carvana' && !process.argv.includes('--include-paid-shipping'))

// Per-source search URL + a DOM extractor evaluated in the page. Each extractor
// returns raw {year,make,model,price,miles,url,...} objects; price parsing and
// band filtering happen back in Node.
//
// geoScope: 'metro' = the URL geo-restricts to within RADIUS miles of ZIP (real
// local inventory). 'national' = centralized nationwide inventory that merely
// delivers to the metro; the source exposes no physical-location filter, so its
// listings are tagged national rather than presented as local. (Confirmed 2026-07
// via the stealth browser: CarMax `zip`+`distance` genuinely restricts; Cars.com
// `maximum_distance`+`zip` restricts; Carvana's /cars/<city> path 302-redirects
// to the national /cars grid, so Carvana cannot be metro-restricted.)
const SOURCES = {
  carmax: {
    // zip + distance is CarMax's real radius filter; the price band goes in-URL
    // too (price=min-max) so the server pre-filters to the band and the metro.
    // pageParam: CarMax supports &page=N for URL-based pagination.
    url: `https://www.carmax.com/cars?zip=${ZIP}&distance=${RADIUS}&price=${MIN}-${MAX}`,
    waitFor: 'article, [data-test="car-tile"], a[href*="/car/"]',
    geoScope: 'metro',
    pageParam: 'page',
  },
  carvana: {
    // National inventory. The category path pre-filters to ~under-$20k (Node
    // still band-filters); ?price[max] does not stick on redirect. Carvana has
    // no consumer-facing location filter — /cars/<city> redirects to /cars — so
    // these listings are national (delivered to the metro), not local.
    // pageParam: null — Carvana uses infinite scroll; --pages multiplies scroll rounds.
    url: `https://www.carvana.com/cars/cars-under-${MAX}`,
    waitFor: 'a[href*="/vehicle/"], [data-qa="result-tile"]',
    geoScope: 'national',
    pageParam: null,
  },
  cars: {
    // maximum_distance + zip restricts Cars.com to the metro radius.
    // sort=list_price pre-sorts price ascending so in-band inventory front-loads.
    // pageParam: Cars.com supports &page=N for URL-based pagination.
    url: `https://www.cars.com/shopping/results/?stock_type=used&maximum_price=${MAX}&maximum_distance=${RADIUS}&zip=${ZIP}&sort=list_price`,
    waitFor: '.vehicle-card, a[href*="/vehicledetail/"]',
    geoScope: 'metro',
    pageParam: 'page',
  },
}

// Generic dealer source is built from --site at runtime (SOURCES is otherwise a
// fixed per-retailer map). There is no universal price-filter query param across
// dealer platforms, so we load the used-inventory page as given and band-filter
// in Node; --site can already carry a platform-specific price facet if known.
if (SOURCE === 'dealer') {
  if (!SITE) { process.stderr.write('--source dealer requires --site <used-inventory URL>.\n'); process.exit(2) }
  SOURCES.dealer = {
    url: SITE,
    // Match any of several common dealer-platform card/detail selectors.
    waitFor: 'a[href*="/inventory/"], a[href*="/used"], a[href*="/vehicle"], .vehicle-card, [class*="vehicle-card"], [class*="inventory"], [data-vehicle]',
    geoScope: 'metro',
    pageParam: null,
  }
}

// Generic anchor-based extractor: find vehicle detail links, read nearby text
// for year/make/model/price/miles. Kept simple and resilient to markup churn.
// NOTE: this runs INSIDE the browser via page.evaluate, so it must be a
// self-contained function — options are passed as a runtime argument (closure
// variables do NOT cross the serialization boundary).
function extractInPage({ hints, priceFloor, cardTextCap }) {
  const out = []
  const seen = new Set()
  const priceRe = /\$\s?([1-9]\d{1,2}(?:,\d{3})+|\d{4,6})\b/g
  // A price marker that ends the model/trim span (miles, price, payment, or a
  // dealer price-label that precedes the number — "Doc Fee", "MSRP", "Retail
  // Price" — so trim doesn't absorb those tokens on dealer-platform cards).
  const stopRe = /\$|\b[\d,]+\s*k?\s*(?:mi|miles)\b|current price|original price|retail price|doc(?:umentation)? fee|msrp/i
  const milesRe = /([\d,]+)\s*(k)?\s*(?:mi|miles)\b/i
  // hints is an array of href substrings that mark a vehicle-detail link; a card
  // matches if its anchor href contains ANY of them (generic dealer sites expose
  // several VDP path shapes). Deduped below, and each candidate must have a
  // year+price ancestor, so a broad match set stays safe.
  const sel = hints.map(h => `a[href*="${h}"]`).join(',')
  const anchors = Array.from(document.querySelectorAll(sel))
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
    // Delivery/shipping status from the card text: 'free' (card says "Free
    // shipping/delivery"), 'fee' (a "$… shipping" / "shipping fee"), or null.
    const shipFree = /free\s+(?:shipping|delivery)/i.test(best)
    const shipFee = /\$[\d,]+\s+(?:shipping|delivery)\b|(?:shipping|delivery)\s+fee/i.test(best)
    const shipping = shipFree ? 'free' : (shipFee ? 'fee' : null)
    out.push({
      year, make, model, trim,
      priceRaw,
      milesRaw: miles ? (miles[2] ? String(Number(miles[1].replace(/,/g, '')) * 1000) : miles[1]) : null,
      shipping,
      url: id,
      text: best.slice(0, 140),
    })
  }
  return out
}

// Wait for the page to settle, scroll `rounds` times to trigger lazy-loaded
// inventory, then extract raw listings via the in-page function.
async function scrollAndExtract(page, cfg, rounds) {
  await page.waitForSelector(cfg.waitFor, { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(3500)
  for (let s = 0; s < rounds; s++) { await page.mouse.wheel(0, 3200); await page.waitForTimeout(1100) }
  await page.waitForTimeout(500)
  return page.evaluate(extractInPage, { hints: [].concat(HINTS[SOURCE]), priceFloor: PRICE_FLOOR, cardTextCap: CARD_TEXT_CAP })
}

const HINTS = {
  carmax: '/car/', carvana: '/vehicle/', cars: '/vehicledetail/',
  // Generic dealer VDP path shapes across Dealer.com / DealerOn / DealerInspire.
  dealer: ['/inventory/used', '/used-inventory/', '/used/', '/vehicledetail', '/vehicle-details', '/VehicleDetails', '/vehicle/', '-vin-'],
}
// Canonical source label — used for both `src` and `sellerName`, so casing is
// identical whether or not any listing was found. (CarMax/Carvana ARE the
// seller; for Cars.com this marks the aggregator — the per-dealer name is not
// exposed on the results grid.)
// For a dealer source, label from --name, else the site hostname (sans www).
const dealerLabel = () => {
  if (NAME) return NAME
  try { return new URL(SITE).hostname.replace(/^www\./, '') } catch { return 'dealer' }
}
const SRC_LABEL = SOURCE === 'dealer' ? dealerLabel()
  : ({ carmax: 'CarMax', carvana: 'Carvana', cars: 'Cars.com' }[SOURCE] || SOURCE)

async function main() {
  const cfg = SOURCES[SOURCE]
  if (!cfg) { process.stderr.write(`Unknown --source ${SOURCE}. Known: ${Object.keys(SOURCES).join(', ')}\n`); process.exit(2) }

  let browser = null
  let blocked = false
  let listings = []
  let droppedForShipping = 0
  try {
    browser = await launchStealth(chromium, { headless: !HEADFUL })
    // Pin the reported location to ZIP's coordinates (see GEO above).
    const ctx = await newStealthContext(browser, { geo: GEO })
    const page = await ctx.newPage()

    // Collect raw listings across pages. URL-paginated sources (CarMax, Cars.com)
    // load each page at a separate URL; scroll-only sources (Carvana) accumulate
    // everything from page 1 by multiplying the scroll rounds instead.
    const allRaw = []
    const totalPages = cfg.pageParam ? PAGES : 1
    for (let pg = 1; pg <= totalPages && allRaw.length < MAXITEMS * 2; pg++) {
      const pgUrl = pg === 1 ? cfg.url : `${cfg.url}&${cfg.pageParam}=${pg}`
      // Carvana: no URL pagination — do all scrolls on page 1.
      const rounds = (pg === 1 && !cfg.pageParam) ? SCROLL_ROUNDS * PAGES : SCROLL_ROUNDS
      const resp = await page.goto(pgUrl, { waitUntil: 'domcontentloaded', timeout: 45000 })
      const status = resp ? resp.status() : 0
      if (status === 403 || status === 406 || status === 429) {
        // Bot-blocked: the page has no inventory, so skip the wait/scroll.
        blocked = true
        process.stderr.write(`${SRC_LABEL} returned HTTP ${status} — blocked, skipping extraction.\n`)
        break
      }
      // Client-rendered SPA: wait, then scroll to trigger lazy-loaded inventory.
      const pgRaw = await scrollAndExtract(page, cfg, rounds)
      if (pgRaw.length === 0) break  // no more pages
      allRaw.push(...pgRaw)
    }

    if (!blocked) {
      // Cross-page URL dedup: the same vehicle card can appear on page 1 and 2.
      const seenUrls = new Set()
      const deduped = allRaw.filter(r => { if (seenUrls.has(r.url)) return false; seenUrls.add(r.url); return true })
      // Normalize + band-filter in Node.
      const toInt = s => s == null ? null : Number(String(s).replace(/[^\d]/g, '')) || null
      const bandFiltered = deduped.map(r => ({
        year: r.year, make: r.make, model: r.model, trim: r.trim,
        price: toInt(r.priceRaw),
        miles: toInt(r.milesRaw),
        sellerType: 'dealer',
        sellerName: SRC_LABEL,
        bodyStyle: null,
        // 'free' = card says free shipping/delivery; 'fee' = a paid-delivery
        // card; null = undetectable. Used by the free-shipping gate below.
        shipping: r.shipping,
        url: r.url,
        src: SRC_LABEL,
        // 'metro' listings are physically within RADIUS mi of ZIP; 'national'
        // ones (Carvana) merely deliver there. Carried through so the ranker /
        // report can label or drop non-local inventory per the metro-only rule.
        geoScope: cfg.geoScope,
      })).filter(v => v.price && v.price >= MIN && v.price <= MAX && v.url)
      // Free-shipping gate (default on for Carvana): keep only cards confirmed
      // "Free shipping"; drop paid-delivery and undetectable-shipping cards.
      const shipFiltered = FREE_SHIP_ONLY
        ? bandFiltered.filter(v => v.shipping === 'free')
        : bandFiltered
      droppedForShipping = bandFiltered.length - shipFiltered.length
      listings = shipFiltered.slice(0, MAXITEMS)
    }
  } catch (e) {
    process.stderr.write(`nav error: ${e.message || e}\n`)
  } finally {
    if (browser) await browser.close()
  }

  if (FREE_SHIP_ONLY && droppedForShipping > 0) {
    process.stderr.write(`${SRC_LABEL}: dropped ${droppedForShipping} listing(s) without confirmed free shipping.\n`)
  }

  process.stdout.write(JSON.stringify({
    source: SRC_LABEL,
    url: cfg.url,
    geoScope: cfg.geoScope,
    zip: ZIP,
    pinnedGeo: GEO,
    radiusMi: cfg.geoScope === 'metro' ? RADIUS : null,
    freeShippingOnly: FREE_SHIP_ONLY,
    blocked,
    count: listings.length,
    listings,
  }, null, process.argv.includes('--pretty') ? 1 : 0) + '\n')
}

main().catch(e => { process.stderr.write(String(e?.stack || e) + '\n'); process.exit(1) })
