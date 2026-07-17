// Shared deterministic helpers for the collect stage — pure code, no network.
// Centralizes the logic that does NOT need an LLM: title parsing, the task
// matrix, in-band filtering, and dedupe keys. Imported by the Node collectors
// (e.g. craigslist.mjs); the Workflow scripts keep their own copies of the
// pure filters because the sandbox cannot import modules.

// Common makes + aliases, longest-first so multi-word makes match before a
// bare token (e.g. "Land Rover" before "Land").
export const MAKES = [
  'Alfa Romeo', 'Land Rover', 'Mercedes-Benz', 'Aston Martin', 'Range Rover',
  'Chevrolet', 'Chevy', 'Cadillac', 'Chrysler', 'Mitsubishi', 'Volkswagen', 'VW',
  'Mercedes', 'Maserati', 'Lamborghini', 'Lincoln', 'Infiniti', 'INFINITI',
  'Hyundai', 'Porsche', 'Bentley', 'Genesis', 'Ferrari', 'Pontiac', 'Peugeot',
  'Acura', 'Buick', 'Dodge', 'Honda', 'Lexus', 'Mazda', 'Nissan', 'Subaru',
  'Toyota', 'Volvo', 'Tesla', 'Jaguar', 'Suzuki', 'Saturn', 'Scion',
  'Audi', 'BMW', 'Fiat', 'Ford', 'GMC', 'Jeep', 'Kia', 'Mini', 'Ram', 'RAM',
]

const MAKE_ALIAS = { chevy: 'Chevrolet', vw: 'Volkswagen', mercedes: 'Mercedes-Benz' }

// Common nameplates → make, so titles that omit the brand ("Civic Sport",
// "RX 350") still resolve a make. Keys are lowercase model tokens.
const MODEL_TO_MAKE = {
  civic: 'Honda', accord: 'Honda', 'cr-v': 'Honda', crv: 'Honda', pilot: 'Honda', odyssey: 'Honda',
  corolla: 'Toyota', camry: 'Toyota', rav4: 'Toyota', tacoma: 'Toyota', tundra: 'Toyota',
  highlander: 'Toyota', prius: 'Toyota', '4runner': 'Toyota', sienna: 'Toyota',
  rx: 'Lexus', es: 'Lexus', gx: 'Lexus', nx: 'Lexus', is: 'Lexus',
  altima: 'Nissan', sentra: 'Nissan', rogue: 'Nissan', frontier: 'Nissan', maxima: 'Nissan',
  silverado: 'Chevrolet', malibu: 'Chevrolet', equinox: 'Chevrolet', colorado: 'Chevrolet',
  tahoe: 'Chevrolet', suburban: 'Chevrolet', impala: 'Chevrolet', traverse: 'Chevrolet',
  'f-150': 'Ford', f150: 'Ford', escape: 'Ford', explorer: 'Ford', mustang: 'Ford',
  fusion: 'Ford', ranger: 'Ford', edge: 'Ford', maverick: 'Ford',
  elantra: 'Hyundai', sonata: 'Hyundai', tucson: 'Hyundai', santa: 'Hyundai',
  sorento: 'Kia', sportage: 'Kia', optima: 'Kia', forte: 'Kia', soul: 'Kia',
  outback: 'Subaru', forester: 'Subaru', impreza: 'Subaru', crosstrek: 'Subaru',
  wrangler: 'Jeep', cherokee: 'Jeep', compass: 'Jeep', 'grand': 'Jeep',
}

const escapeRe = s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

// Parse a free-text listing title → { year, make, model, trim }. Best-effort:
// the collectors pass titleRaw through as well so the ranker can refine.
export function parseTitle(title) {
  const t = String(title || '').trim()
  const yearMatch = t.match(/\b(19[89]\d|20[0-2]\d)\b/)
  const year = yearMatch ? Number(yearMatch[0]) : undefined

  // Scan the WHOLE title for a make token (year may be at either end).
  let make, afterIdx = -1, matchLen = 0
  for (const m of MAKES) {
    const hit = t.match(new RegExp(`\\b${escapeRe(m)}\\b`, 'i'))
    if (hit) {
      make = MAKE_ALIAS[m.toLowerCase()] || m
      afterIdx = (hit.index ?? 0)
      matchLen = hit[0].length
      break
    }
  }

  // Tokens for model/trim: everything after the make (if found), else the whole
  // title; drop any year token.
  const region = afterIdx >= 0 ? t.slice(afterIdx + matchLen) : t
  const tokens = region.replace(/[^\w\s-]/g, ' ').split(/\s+/)
    .filter(Boolean).filter(tok => !/^(19[89]\d|20[0-2]\d)$/.test(tok))

  // If no make from the brand list, infer from the first known nameplate token.
  if (!make) {
    for (const tok of tokens) {
      const inferred = MODEL_TO_MAKE[tok.toLowerCase()]
      if (inferred) { make = inferred; break }
    }
  }

  const model = tokens.slice(0, 2).join(' ') || undefined
  const trim = tokens.slice(2, 5).join(' ') || undefined
  return { year, make: make || undefined, model, trim }
}

// In-band price filter.
export const inBand = (min, max) => v =>
  typeof v.price === 'number' && v.price >= min && v.price <= max

// Default source × body-style task matrix (for the search workflow / docs).
export function buildTasks({ metro, priceMin, priceMax, sources, bodyStyles }) {
  return sources.flatMap(src => bodyStyles.map(body => ({
    src, body,
    query: `${src} used ${body === 'all' ? 'cars' : body} for sale ${metro} ` +
      `$${priceMin.toLocaleString()} to $${priceMax.toLocaleString()} best deal clean title`,
  })))
}

// Dedupe key: same vehicle if year+make+model match and price is within
// tolerance. Returns a coarse key for grouping; callers apply the price band.
export const dedupeKey = v =>
  `${v.year || '?'}|${String(v.make || '').toLowerCase()}|${String(v.model || '').toLowerCase()}`
