// Deterministic Craigslist collector — replaces the LLM "collect" agents for
// Craigslist with zero-token Node code. Hits Craigslist's JSON search API
// (sapi), parses the compact positional-array item format, and emits
// normalized listings (year/make/model/price/miles/url/sellerType).
//
// Craigslist is the only one of our sources that is code-accessible; CarGurus,
// Cars.com and KBB bot-wall plain HTTP, so those still need agents.
//
// Usage:
//   node scripts/car-market-research/src/craigslist.mjs \
//     --area 15 --min 10000 --max 20000 --purveyor owner [--searchPath cta] [--pretty]
//
//   # Austin area id is 15. To find another metro's id, load its search page
//   # (e.g. https://<metro>.craigslist.org/search/cta) and grep for "areaId":N.
//
// Prints JSON: { source, searchPath, area, count, listings:[...] } to stdout.
// Feed listings into the ranking workflow via args.preCollected.

import { parseTitle, MAKES } from './collect-lib.mjs'
import { filterListings } from './classify.mjs'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0 Safari/537.36'

// Craigslist posting detail pages embed the VIN as `"vin":"<17>"` when the
// seller entered one. Fetch a posting and extract it deterministically.
async function fetchVin(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!res.ok) return null
    const html = await res.text()
    const m = html.match(/"vin":"([A-HJ-NPR-Z0-9]{17})"/i)
    return m ? m[1].toUpperCase() : null
  } catch { return null }
}

// Enrich private listings with VINs by fetching detail pages, bounded
// concurrency so we don't hammer Craigslist. Only listings with a URL.
async function enrichVins(listings, concurrency = 5) {
  const queue = listings.filter(v => v.url && !v.vin)
  let i = 0
  async function worker() {
    while (i < queue.length) {
      const v = queue[i++]
      v.vin = await fetchVin(v.url)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker))
  return listings
}

function argVal(flag, def) {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def
}
const hasFlag = flag => process.argv.includes(flag)

const AREA = argVal('--area', '15')            // Austin = 15
const MIN = Number(argVal('--min', '10000'))
const MAX = Number(argVal('--max', '20000'))
const PURVEYOR = argVal('--purveyor', 'owner') // owner = private party
const SEARCH_PATH = argVal('--searchPath', 'cta') // cta = cars & trucks

// Craigslist sapi compact item = positional array. Fixed head positions plus a
// tail of [code, value] tagged pairs and a trailing title string. Codes seen:
//   3 = price (int, head index 3)   6 = url slug   9 = odometer (miles)
//   10 = formatted price            item[6][1] = base62 token used in the URL
function parseItem(it) {
  if (!Array.isArray(it)) return null
  const price = typeof it[3] === 'number' ? it[3] : null
  const token = Array.isArray(it[6]) ? it[6][1] : null
  let slug = null, miles = null
  let title = null
  for (const el of it) {
    if (Array.isArray(el) && typeof el[0] === 'number') {
      if (el[0] === 6 && typeof el[1] === 'string') slug = el[1]
      else if (el[0] === 9 && typeof el[1] === 'number') miles = el[1]
    } else if (typeof el === 'string' && el.length > 8 && /[a-z].*[a-z]/i.test(el) && el.includes(' ')) {
      title = el // the human-readable title is the long spaced string
    }
  }
  if (!price || !title) return null
  const url = slug && token ? `https://www.craigslist.org/view/d/${slug}/${token}` : undefined
  const { year, make, model, trim } = parseTitle(title)
  return {
    year, make, model, trim,
    price,
    miles: miles || undefined,
    sellerType: 'private',
    sellerName: 'Private seller (Craigslist)',
    bodyStyle: undefined,
    titleRaw: title,
    url,
    src: 'Craigslist',
  }
}

async function main() {
  const batch = `${AREA}-0-360-0-0` // one batch returns up to 360 postings
  const qs = new URLSearchParams({
    batch, cc: 'US', lang: 'en', searchPath: SEARCH_PATH,
    min_price: String(MIN), max_price: String(MAX), purveyor: PURVEYOR,
  })
  const apiUrl = `https://sapi.craigslist.org/web/v8/postings/search/full?${qs}`
  const res = await fetch(apiUrl, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!res.ok) {
    process.stderr.write(`Craigslist sapi HTTP ${res.status}\n`)
    process.exit(1)
  }
  const json = await res.json()
  const rawItems = json?.data?.items ?? []
  let listings = rawItems
    .map(parseItem)
    .filter(Boolean)
    .filter(v => v.price >= MIN && v.price <= MAX)

  // --enrich-vin: fetch each posting's detail page and extract the VIN in code,
  // so the VIN-required-for-private rule can be enforced without an LLM.
  if (hasFlag('--enrich-vin')) {
    await enrichVins(listings)
  }

  // --filter: apply deterministic body-class exclusion (mid/full-size trucks,
  // vans) and (with --enrich-vin) the VIN-required-for-private rule, so the
  // downstream LLM ranker receives a pre-screened pool and spends no tokens
  // rejecting them. All listings here are private (purveyor=owner).
  let rejected = []
  if (hasFlag('--filter')) {
    const r = filterListings(listings, { requireVinForPrivate: hasFlag('--enrich-vin') })
    listings = r.kept
    rejected = r.rejected
  }

  const withVin = listings.filter(v => v.vin).length
  const out = {
    source: 'Craigslist',
    searchPath: SEARCH_PATH,
    area: Number(AREA),
    total: json?.data?.totalResultCount ?? rawItems.length,
    count: listings.length,
    withVin,
    rejectedCount: rejected.length,
    knownMakes: MAKES.length,
    listings,
    rejected,
  }
  process.stdout.write(JSON.stringify(out, null, hasFlag('--pretty') ? 1 : 0))
  process.stdout.write('\n')
}

main().catch(e => { process.stderr.write(String(e?.stack || e) + '\n'); process.exit(1) })
