import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const PW_DIR = process.env.PW_DIR || '/opt/homebrew/lib/node_modules/openclaw/node_modules'
const { chromium } = require(`${PW_DIR}/playwright-core`)
const LOCS = { austin: { latitude: 30.2635, longitude: -97.7141, tz: 'America/Chicago' },
               montana: { latitude: 48.0, longitude: -106.0, tz: 'America/Denver' } }
async function run(name) {
  const g = LOCS[name]
  const browser = await chromium.launch({ channel: 'chrome', headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'] })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 2400 }, locale: 'en-US',
    timezoneId: g.tz, geolocation: { latitude: g.latitude, longitude: g.longitude }, permissions: ['geolocation'] })
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); window.chrome = { runtime: {} } })
  const page = await ctx.newPage()
  const resp = await page.goto('https://www.carvana.com/cars/cars-under-20000', { waitUntil: 'domcontentloaded', timeout: 45000 })
  const status = resp ? resp.status() : 0
  await page.waitForSelector('a[href*="/vehicle/"]', { timeout: 22000 }).catch(() => {})
  await page.waitForTimeout(5000)
  for (let s = 0; s < 5; s++) { await page.mouse.wheel(0, 3000); await page.waitForTimeout(1100) }
  const r = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="/vehicle/"]'))
    const seen = new Set(); let free=0, fee=0, none=0; const map={}
    for (const a of anchors) { const id=(a.href.split('?')[0].split('/vehicle/')[1]||''); if(!id||seen.has(id))continue; seen.add(id)
      let el=a, txt=''; for(let k=0;k<6&&el;k++){const t=(el.innerText||'').replace(/\s+/g,' ');if(t.length>40){txt=t;break}el=el.parentElement}
      const st=/free\s+(?:shipping|delivery)/i.test(txt)?'free':(/\$[\d,]+\s+(?:shipping|delivery)|(?:shipping|delivery)\s+fee/i.test(txt)?'fee':'none')
      map[id]=st; if(st==='free')free++;else if(st==='fee')fee++;else none++ }
    const bot=/access denied|verify you are human|captcha/i.test(document.body.innerText||'')
    return { total:seen.size, free, fee, none, map, bot }
  })
  await browser.close()
  return { status, ...r }
}
const a = await run('austin')
const m = await run('montana')
console.log('AUSTIN  status', a.status, 'bot', a.bot, '| total', a.total, 'free', a.free, 'fee', a.fee, 'none', a.none)
console.log('MONTANA status', m.status, 'bot', m.bot, '| total', m.total, 'free', m.free, 'fee', m.fee, 'none', m.none)
const common = Object.keys(a.map).filter(id => id in m.map)
const diffs = common.filter(id => a.map[id] !== m.map[id])
console.log('common', common.length, 'differed', diffs.length, JSON.stringify(diffs.slice(0,6).map(id=>({austin:a.map[id],montana:m.map[id]}))))
