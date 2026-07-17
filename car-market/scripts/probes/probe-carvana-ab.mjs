// Does a geolocation override change Carvana's free/fee shipping on the grid?
// A/B the SAME query under Austin 78702 vs remote rural Montana. If the fee
// distribution differs, the pin works; if identical, the grid ignores it.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const PW_DIR = process.env.PW_DIR || '/opt/homebrew/lib/node_modules/openclaw/node_modules'
const { chromium } = require(`${PW_DIR}/playwright-core`)

const LOCS = {
  austin:  { latitude: 30.2635, longitude: -97.7141 },   // 78702
  montana: { latitude: 48.0,    longitude: -106.0 },      // rural MT
}
const browser = await chromium.launch({ channel: 'chrome', headless: true,
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'] })

async function run(name, geo) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 2400 }, locale: 'en-US',
    timezoneId: name === 'austin' ? 'America/Chicago' : 'America/Denver',
    geolocation: geo, permissions: ['geolocation'],
  })
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); window.chrome = { runtime: {} } })
  const page = await ctx.newPage()
  await page.goto('https://www.carvana.com/cars/cars-under-20000', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForSelector('a[href*="/vehicle/"]', { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(4000)
  for (let s = 0; s < 5; s++) { await page.mouse.wheel(0, 3000); await page.waitForTimeout(1000) }
  const r = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="/vehicle/"]'))
    const seen = new Set(); let free = 0, fee = 0, none = 0; const map = {}
    for (const a of anchors) {
      const id = a.href.split('?')[0].split('/vehicle/')[1]; if (!id || seen.has(id)) continue; seen.add(id)
      let el = a, txt = ''
      for (let k = 0; k < 6 && el; k++) { const t=(el.innerText||'').replace(/\s+/g,' '); if(t.length>40){txt=t;break} el=el.parentElement }
      const isFree = /free\s+(?:shipping|delivery)/i.test(txt)
      const isFee = /\$[\d,]+\s+(?:shipping|delivery)|(?:shipping|delivery)\s+fee/i.test(txt)
      const st = isFree ? 'free' : isFee ? 'fee' : 'none'
      map[id] = st; if (st==='free') free++; else if (st==='fee') fee++; else none++
    }
    return { total: seen.size, free, fee, none, map }
  })
  await ctx.close()
  return r
}

const a = await run('austin', LOCS.austin)
const m = await run('montana', LOCS.montana)
console.log('AUSTIN :', a.total, 'free', a.free, 'fee', a.fee, 'none', a.none)
console.log('MONTANA:', m.total, 'free', m.free, 'fee', m.fee, 'none', m.none)
// Compare shipping status for vehicle IDs seen in BOTH runs.
const common = Object.keys(a.map).filter(id => id in m.map)
const diffs = common.filter(id => a.map[id] !== m.map[id])
console.log('common IDs:', common.length, 'status DIFFERED on:', diffs.length)
console.log('sample diffs:', JSON.stringify(diffs.slice(0,6).map(id => ({ id: id.slice(0,10), austin: a.map[id], montana: m.map[id] })), null, 0))
await browser.close()
