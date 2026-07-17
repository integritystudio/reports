// Browser link-verifier — opens each listing's detail URL in the same stealth
// Chromium the collector uses (browser-lib.mjs), so CarMax/Carvana URLs (which
// 403 both plain fetch AND WebFetch) can actually be verified. This is the path
// stage 3 can't take itself: the Workflow sandbox has no network, and its
// WebFetch verifier bot-walls on these domains.
//
// Per URL the verdict is:
//   live-match    — 200 and the page shows a SPECIFIC vehicle whose
//                   year/make/model matches the expected row.
//   live-mismatch — a specific listing loaded but it's a DIFFERENT vehicle, or
//                   the URL redirected to a search/home page (recycled/guessed ID).
//   dead          — 404 / "no longer available" / "sold".
//   blocked       — 403/406/429 anti-bot refusal: UNVERIFIABLE, not proof it's gone.
//
// Input:  a JSON array of { url, year, make, model, price } via `--file <path>`
//         or stdin. (Extra fields are ignored; the collector's listing shape works.)
// Output: a JSON array of verdicts to stdout, each
//         { url, status, httpStatus, pageYear, pageMake, pageModel, pagePrice,
//           priceMatches, evidence } — feed it to stage 3 as args.preVerified.
//
// Run via the wrapper (sets PW_DIR):
//   car-market/scripts/run-browser-verify.sh --file listings.json > verdicts.json
//   cat listings.json | car-market/scripts/run-browser-verify.sh

import { readFileSync } from 'node:fs'
import { resolveChromium, launchStealth, newStealthContext } from './browser-lib.mjs'
import { parseTitle } from './collect-lib.mjs'

const chromium = resolveChromium()
if (!chromium) {
  process.stderr.write('playwright-core not found. Set PW_DIR to the node_modules dir containing it.\n')
  process.exit(3)
}

const arg = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d }
const HEADFUL = process.argv.includes('--headful')
const PRETTY = process.argv.includes('--pretty')
// Austin metro centroid — verification isn't location-dependent, but pinning a
// plausible geo keeps some sites from throwing a location interstitial.
const GEO = { latitude: 30.2672, longitude: -97.7431 }

const norm = s => String(s == null ? '' : s).trim().toLowerCase()
const toInt = s => s == null ? null : Number(String(s).replace(/[^\d]/g, '')) || null

// Read the input listings from --file or stdin.
function readInput() {
  const file = arg('--file', null)
  const raw = file ? readFileSync(file, 'utf8') : readFileSync(0, 'utf8')
  let data
  try { data = JSON.parse(raw) } catch (e) {
    process.stderr.write(`Could not parse input JSON: ${e.message}\n`); process.exit(2)
  }
  // Accept a bare array, or an object with { listings } / { items } (collector output).
  const arr = Array.isArray(data) ? data
    : Array.isArray(data.listings) ? data.listings
    : Array.isArray(data.items) ? data.items
    : null
  if (!arr) { process.stderr.write('Input must be a JSON array of listings (or { listings:[...] }).\n'); process.exit(2) }
  return arr.filter(v => v && v.url)
}

// Read the page's title/H1/price and whether it says the listing is gone.
// Runs INSIDE the browser via page.evaluate — must be self-contained.
function readPageInPage() {
  const clean = s => (s || '').replace(/\s+/g, ' ').trim()
  const title = clean(document.title)
  const h1 = clean(document.querySelector('h1') ? document.querySelector('h1').innerText : '')
  const body = clean(document.body ? document.body.innerText : '').slice(0, 5000)
  const gone = /no longer available|has been sold|this vehicle is (?:sold|unavailable)|listing (?:not found|has ended|removed)|page (?:not found|unavailable)|404 error/i.test(body)
  const priceM = body.match(/\$\s?([1-9]\d{1,2}(?:,\d{3})+|\d{4,6})\b/)
  return { title, h1, snippet: (h1 + ' ' + title).slice(0, 200), gone, pagePriceRaw: priceM ? priceM[1] : null, finalUrl: location.href }
}

// Compare the parsed page vehicle to the expected row → a verdict object.
function decide(v, http, info) {
  const pagePrice = toInt(info.pagePriceRaw)
  const priceMatches = pagePrice != null && v.price ? Math.abs(pagePrice - Number(v.price)) <= 500 : undefined
  if (info.gone) {
    return { status: 'dead', httpStatus: http, pagePrice, priceMatches, evidence: `Page indicates the listing is gone: "${info.snippet}"` }
  }
  const p = parseTitle(info.snippet)
  // Titles read "<Year> <Make> <Model> in <City>, <ST>", so parseTitle can
  // absorb the location word ("Fit in") — strip a trailing " in" artifact.
  const pModel = (p.model || '').replace(/\s+in$/i, '')
  const specific = Boolean(p.year && p.make)   // a real vehicle title, not a search/home page
  const yearOk = p.year && v.year && p.year === Number(v.year)
  const makeOk = p.make && v.make && norm(p.make) === norm(v.make)
  // Model match on the nameplate: prefix logic (mirrors CM1's sameVehicle, so
  // "Sentra SR" ≈ "Sentra") plus a first-token fallback for trim/location noise.
  const pm = norm(pModel), em = norm(v.model)
  const modelOk = !em || !pm || pm === em || pm.startsWith(em + ' ') || em.startsWith(pm + ' ') ||
    pm.split(' ')[0] === em.split(' ')[0]
  const base = { httpStatus: http, pageYear: p.year || null, pageMake: p.make || null, pageModel: pModel || null, pagePrice, priceMatches }
  if (specific && yearOk && makeOk && modelOk) {
    return { status: 'live-match', ...base, evidence: `Detail page: "${info.snippet}"${priceMatches === false ? ` (on-page $${pagePrice} vs listed $${v.price} — stale)` : ''}` }
  }
  if (!specific) {
    return { status: 'live-mismatch', ...base, evidence: `No specific vehicle on page (redirect to ${info.finalUrl}?): "${info.snippet}"` }
  }
  return { status: 'live-mismatch', ...base, evidence: `Loaded ${p.year || '?'} ${p.make || '?'} ${pModel || ''}, expected ${v.year} ${v.make} ${v.model}` }
}

async function verifyOne(ctx, v) {
  const page = await ctx.newPage()
  try {
    const resp = await page.goto(v.url, { waitUntil: 'domcontentloaded', timeout: 45000 })
    const http = resp ? resp.status() : 0
    if (http === 403 || http === 406 || http === 429) {
      return { url: v.url, status: 'blocked', httpStatus: http, evidence: `HTTP ${http} — anti-bot refusal (unverifiable, not proof the listing is gone).` }
    }
    if (http === 404 || http === 410) {
      return { url: v.url, status: 'dead', httpStatus: http, evidence: `HTTP ${http}.` }
    }
    // Client-rendered detail pages hydrate the title/price after load.
    await page.waitForTimeout(2500)
    const info = await page.evaluate(readPageInPage)
    return { url: v.url, ...decide(v, http, info) }
  } catch (e) {
    return { url: v.url, status: 'blocked', httpStatus: 0, evidence: `Navigation error (unverifiable): ${e.message || e}` }
  } finally {
    await page.close().catch(() => {})
  }
}

async function main() {
  const items = readInput()
  if (items.length === 0) {
    process.stdout.write('[]\n'); return
  }
  let browser = null
  const verdicts = []
  try {
    browser = await launchStealth(chromium, { headless: !HEADFUL })
    const ctx = await newStealthContext(browser, { geo: GEO })
    // Sequential: parallel tabs on the same domain trip the rate-limiter these
    // sites use, which is the exact 403 we're trying to get past.
    for (const v of items) {
      const verdict = await verifyOne(ctx, v)
      verdicts.push(verdict)
      process.stderr.write(`${v.year || '?'} ${v.make || '?'} ${v.model || ''}: ${verdict.status}${verdict.priceMatches === false ? ' (stale price)' : ''}\n`)
    }
  } catch (e) {
    process.stderr.write(`verify error: ${e.message || e}\n`)
  } finally {
    if (browser) await browser.close()
  }
  process.stdout.write(JSON.stringify(verdicts, null, PRETTY ? 1 : 0) + '\n')
}

main().catch(e => { process.stderr.write(String(e?.stack || e) + '\n'); process.exit(1) })
