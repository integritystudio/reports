// Retry-safe Carvana A/B geolocation probe.
// Improves on probe-carvana-ab2 by:
//   - random backoff between the two location runs (avoids rapid-fire bot detection)
//   - retries on 403 / bot-wall with exponential backoff (up to MAX_ATTEMPTS)
//   - varied scroll cadence + idle jitter to look more human
//   - per-run bot-wall detection before extracting results
//
// Usage: node probe-carvana-ab3.mjs [--max-attempts N] [--backoff-ms N]
// Defaults: max-attempts=3, initial-backoff-ms=45000 (45 s)
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const PW_DIR = process.env.PW_DIR || '/opt/homebrew/lib/node_modules/openclaw/node_modules'
const { chromium } = require(`${PW_DIR}/playwright-core`)

const args = process.argv.slice(2)
const MAX_ATTEMPTS = Number(args[args.indexOf('--max-attempts') + 1] || 3)
const INIT_BACKOFF = Number(args[args.indexOf('--backoff-ms') + 1] || 45_000)

const LOCS = {
  austin:  { latitude: 30.2635, longitude: -97.7141, tz: 'America/Chicago' },
  montana: { latitude: 48.0,    longitude: -106.0,   tz: 'America/Denver'  },
}

const URL = 'https://www.carvana.com/cars/cars-under-20000'

/** ms delay with optional jitter */
function sleep(ms, jitterMs = 0) {
  const actual = ms + Math.floor(Math.random() * jitterMs)
  return new Promise(r => setTimeout(r, actual))
}

async function runOnce(name) {
  const g = LOCS[name]
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
  })
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 2400 },
      locale: 'en-US',
      timezoneId: g.tz,
      geolocation: { latitude: g.latitude, longitude: g.longitude },
      permissions: ['geolocation'],
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    })
    await ctx.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
      window.chrome = { runtime: {} }
    })
    const page = await ctx.newPage()
    const resp = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    const status = resp ? resp.status() : 0

    // Detect hard 403 before spending time scrolling.
    if (status === 403) {
      await browser.close()
      return { status, bot: true, total: 0, free: 0, fee: 0, none: 0, map: {} }
    }

    // Wait for grid cards with generous timeout.
    await page.waitForSelector('a[href*="/vehicle/"]', { timeout: 30_000 }).catch(() => {})
    // Human-like idle before scrolling.
    await sleep(3_000, 2_000)

    // Scroll with varied cadence.
    const scrollRounds = 6 + Math.floor(Math.random() * 3)
    for (let s = 0; s < scrollRounds; s++) {
      await page.mouse.wheel(0, 2_500 + Math.floor(Math.random() * 1_000))
      await sleep(900, 600)
    }
    await sleep(2_000, 1_000)

    const r = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href*="/vehicle/"]'))
      const seen = new Set(); let free = 0, fee = 0, none = 0; const map = {}
      for (const a of anchors) {
        const id = a.href.split('?')[0].split('/vehicle/')[1]
        if (!id || seen.has(id)) continue
        seen.add(id)
        let el = a, txt = ''
        for (let k = 0; k < 6 && el; k++) {
          const t = (el.innerText || '').replace(/\s+/g, ' ')
          if (t.length > 40) { txt = t; break }
          el = el.parentElement
        }
        const isFree = /free\s+(?:shipping|delivery)/i.test(txt)
        const isFee  = /\$[\d,]+\s+(?:shipping|delivery)|(?:shipping|delivery)\s+fee/i.test(txt)
        const st = isFree ? 'free' : isFee ? 'fee' : 'none'
        map[id] = st
        if (st === 'free') free++; else if (st === 'fee') fee++; else none++
      }
      const bot = /access denied|verify you are human|captcha/i.test(document.body.innerText || '')
      return { total: seen.size, free, fee, none, map, bot }
    })
    await browser.close()
    return { status, ...r }
  } catch (err) {
    await browser.close().catch(() => {})
    throw err
  }
}

/** Run with retry + exponential backoff on bot-wall. */
async function runWithRetry(name) {
  let backoff = INIT_BACKOFF
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[${name}] attempt ${attempt}/${MAX_ATTEMPTS}…`)
    const result = await runOnce(name)
    if (!result.bot && result.status !== 403) return result
    console.warn(`[${name}] bot-wall (status=${result.status}, bot=${result.bot}); backing off ${backoff / 1000}s…`)
    if (attempt < MAX_ATTEMPTS) await sleep(backoff, backoff * 0.25)
    backoff *= 2
  }
  return { status: 0, bot: true, total: 0, free: 0, fee: 0, none: 0, map: {} }
}

// Stagger runs: Austin first, then a random inter-run delay, then Montana.
// Separate browser instances per run avoid a shared fingerprint between slots.
const austin = await runWithRetry('austin')

const interRunDelay = INIT_BACKOFF + Math.floor(Math.random() * 20_000)
console.log(`inter-run delay ${(interRunDelay / 1000).toFixed(1)}s…`)
await sleep(interRunDelay)

const montana = await runWithRetry('montana')

// Summary.
console.log('\n=== RESULTS ===')
console.log(`AUSTIN  status=${austin.status}  bot=${austin.bot}  total=${austin.total}  free=${austin.free}  fee=${austin.fee}  none=${austin.none}`)
console.log(`MONTANA status=${montana.status}  bot=${montana.bot}  total=${montana.total}  free=${montana.free}  fee=${montana.fee}  none=${montana.none}`)

const common = Object.keys(austin.map).filter(id => id in montana.map)
const diffs  = common.filter(id => austin.map[id] !== montana.map[id])
console.log(`common=${common.length}  differed=${diffs.length}`)
if (diffs.length) {
  console.log('sample diffs:', JSON.stringify(diffs.slice(0, 8).map(id => ({ id: id.slice(0, 12), austin: austin.map[id], montana: montana.map[id] }))))
}

// Verdict.
if (austin.bot || montana.bot) {
  console.log('\nVERDICT: inconclusive — one or both runs hit bot-wall')
} else if (common.length === 0) {
  console.log('\nVERDICT: inconclusive — no common vehicle IDs to compare')
} else if (diffs.length === 0) {
  console.log('\nVERDICT: no difference — geolocation pin does NOT shift Carvana free/fee labels')
} else {
  const pct = ((diffs.length / common.length) * 100).toFixed(1)
  console.log(`\nVERDICT: ${pct}% of common listings differ — geolocation pin DOES affect Carvana free/fee labels`)
}
