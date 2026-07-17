// Shared stealth-browser session helpers for the headless collector/verifier.
// Centralizes playwright-core resolution, launch, and the anti-bot context so
// browser-collect.mjs (collection) and browser-verify.mjs (link verification)
// drive an identical Chromium — the same stealth that turns the 403 bot-wall
// into a loaded page.
//
// playwright-core is a global (not a repo dep) and ESM `import` ignores
// NODE_PATH, so it is resolved by absolute path via createRequire. PW_DIR (set
// by the wrappers) or a small candidate list points at the global node_modules.
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'

const require = createRequire(import.meta.url)
const PW_CANDIDATES = [
  process.env.PW_DIR,
  '/opt/homebrew/lib/node_modules/openclaw/node_modules',
  '/usr/local/lib/node_modules/openclaw/node_modules',
].filter(Boolean)

// Resolve the global playwright-core's chromium, or null if it can't be found.
export function resolveChromium() {
  for (const dir of PW_CANDIDATES) {
    if (existsSync(`${dir}/playwright-core`)) return require(`${dir}/playwright-core`).chromium
  }
  try { return require('playwright-core').chromium } catch { return null }
}

const STEALTH_ARGS = ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-dev-shm-usage']

// Launch a stealth Chromium, preferring the real installed Google Chrome
// (channel:'chrome' — far less detectable than bundled Chromium), falling back
// to bundled chromium if Chrome is absent.
export async function launchStealth(chromium, { headless = true } = {}) {
  const opts = { headless, args: STEALTH_ARGS }
  try { return await chromium.launch({ ...opts, channel: 'chrome' }) }
  catch { return chromium.launch(opts) }
}

// Create an anti-bot browser context: spoofed UA/webdriver/plugins and an
// optional geolocation pin (pass { geo } to report a specific location).
export async function newStealthContext(browser, { geo = null } = {}) {
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 2200 },
    locale: 'en-US',
    timezoneId: 'America/Chicago',
    ...(geo ? { geolocation: geo, permissions: ['geolocation'] } : {}),
  })
  // Hide the headless/automation tells before any page script runs.
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] })
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] })
    window.chrome = window.chrome || { runtime: {} }
  })
  return ctx
}
