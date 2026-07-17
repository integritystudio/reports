// Discover how to pin Carvana's delivery location to a zip (78702, East Austin).
// Try: (A) Playwright geolocation override; (B) find/enter zip via the UI; then
// dump cookies + localStorage to find the key Carvana persists the location in.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const PW_DIR = process.env.PW_DIR || '/opt/homebrew/lib/node_modules/openclaw/node_modules'
const { chromium } = require(`${PW_DIR}/playwright-core`)

const ZIP = '78702'
const COORD = { latitude: 30.2635, longitude: -97.7141 } // 78702 centroid

const browser = await chromium.launch({ channel: 'chrome', headless: true,
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'] })
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 2400 }, locale: 'en-US', timezoneId: 'America/Chicago',
  geolocation: COORD, permissions: ['geolocation'],
})
await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); window.chrome = { runtime: {} } })
const page = await ctx.newPage()
await page.goto('https://www.carvana.com/cars/cars-under-20000', { waitUntil: 'domcontentloaded', timeout: 45000 })
await page.waitForTimeout(4000)

// Look for a location/zip control in the header.
const controls = await page.evaluate(() => {
  const hits = []
  const nodes = Array.from(document.querySelectorAll('button, a, [role="button"], input'))
  for (const n of nodes) {
    const t = ((n.innerText || n.getAttribute('aria-label') || n.getAttribute('placeholder') || '')).replace(/\s+/g,' ').trim()
    if (/zip|location|deliver|change|near you|\bTX\b|\d{5}/i.test(t) && t.length < 60) hits.push({ tag: n.tagName, t })
  }
  return hits.slice(0, 20)
})
console.log('LOCATION CONTROLS:', JSON.stringify(controls, null, 1))

// Dump any storage / cookies that mention a zip or location.
const store = await page.evaluate(() => {
  const out = {}
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); const v = localStorage.getItem(k)||''
    if (/loc|zip|geo|market|deliver|address|region/i.test(k) || /\b7\d{4}\b|austin/i.test(v)) out['ls:'+k] = v.slice(0,160) }
  return out
})
const cookies = (await ctx.cookies()).filter(c => /loc|zip|geo|market|deliver|region/i.test(c.name) || /\b7\d{4}\b|austin/i.test(c.value||''))
console.log('STORAGE:', JSON.stringify(store, null, 1))
console.log('COOKIES:', JSON.stringify(cookies.map(c => ({ name: c.name, value: (c.value||'').slice(0,140) })), null, 1))

// What location does the page think we're in?
const shown = await page.evaluate(() => {
  const m = document.body.innerText.match(/(?:deliver(?:ing)? to|your location|near)\s*:?\s*([A-Za-z .,]{0,24}\b\d{5}\b|[A-Za-z]+,?\s*TX)/i)
  const zipShown = (document.body.innerText.match(/\b7\d{4}\b/g) || []).slice(0,5)
  return { locLine: m ? m[0] : '', zipsOnPage: zipShown }
})
console.log('SHOWN:', JSON.stringify(shown, null, 1))
await browser.close()
