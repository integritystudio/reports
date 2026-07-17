// Deterministic vehicle classification + body-class filtering — pure code, no
// network. Moves work OUT of the LLM ranker: instead of paying tokens for the
// ranker to identify and reject full-size/mid-size trucks and vans, we tag and
// filter them here for free, and hand the ranker a pre-screened pool.
//
// Exports:
//   classifyBody(make, model)  -> { bodyStyle, truckSize|null, excludeClass|null }
//   filterListings(listings, { excludeClasses, requireVinForPrivate }) -> { kept, rejected }

const norm = s => String(s == null ? '' : s).trim().toLowerCase()

// Pickup nameplates by size class. Matched on model (case-insensitive substring).
const FULLSIZE_TRUCKS = [
  'f-150', 'f150', 'f-250', 'f250', 'f-350', 'f350', 'f-450', 'super duty',
  'silverado 1500', 'silverado 2500', 'silverado 3500', 'silverado',
  'sierra 1500', 'sierra 2500', 'sierra 3500', 'sierra',
  'ram 1500', 'ram 2500', 'ram 3500', '1500', '2500', '3500',
  'tundra', 'titan', 'avalanche',
]
const MIDSIZE_TRUCKS = [
  'colorado', 'canyon', 'ranger', 'tacoma', 'frontier', 'ridgeline',
  'dakota', 'gladiator', 'nissan np300',
]
const COMPACT_TRUCKS = ['maverick', 'santa cruz', 'santa-cruz']

// Van nameplates (cargo, passenger, minivan).
const VANS = [
  'transit', 'express', 'promaster', 'sprinter', 'nv200', 'nv1500', 'nv2500', 'nv3500',
  'savana', 'metris', 'sienna', 'odyssey', 'pacifica', 'carnival', 'sedona', 'quest',
  'town & country', 'town and country', 'grand caravan', 'caravan', 'transit connect',
]

const SUVS = [
  'rav4', 'cr-v', 'crv', 'cx-5', 'cx-9', 'cx-30', 'cx-50', 'rogue', 'murano', 'pathfinder',
  'explorer', 'escape', 'edge', 'expedition', 'equinox', 'traverse', 'tahoe', 'suburban',
  'blazer', 'trailblazer', 'trax', 'encore', 'enclave', 'highlander', '4runner', 'rav-4',
  'santa fe', 'tucson', 'kona', 'palisade', 'telluride', 'sorento', 'sportage', 'seltos',
  'soul', 'forester', 'outback', 'crosstrek', 'ascent', 'compass', 'cherokee', 'wrangler',
  'grand cherokee', 'renegade', 'qx60', 'qx80', 'qx50', 'mdx', 'rdx', 'xt5', 'xt6', 'x1',
  'x3', 'x5', 'q5', 'q7', 'gle', 'glc', 'gla', 'macan', 'cayenne', 'discovery', 'range rover',
  'lr4', 'f-pace', 'xc60', 'xc90', 'xc40', 'bronco', 'gx', 'nx', 'rx', 'lx', 'ux',
]

const HATCH_WAGONS = ['golf', 'gti', 'mazda3', 'impreza hatch', 'ioniq', 'prius', 'leaf', 'bolt', 'fit', 'venza']

const includesAny = (hay, arr) => arr.some(k => hay.includes(k))

// Return the exclusion class for a listing, or null if it's not in an
// exclusion-eligible truck/van category. bodyStyle is a coarse guess used only
// when make/model is ambiguous.
export function classifyBody(make, model, bodyStyleHint) {
  const m = norm(model)
  const full = `${norm(make)} ${m}`

  // Compact trucks are KEPT — check before the broader truck lists so a
  // "Maverick" is never mistaken for something excludable.
  if (includesAny(m, COMPACT_TRUCKS)) return { bodyStyle: 'truck', truckSize: 'compact', excludeClass: null }
  if (includesAny(m, VANS) || includesAny(full, VANS)) return { bodyStyle: 'van', truckSize: null, excludeClass: 'van' }
  if (includesAny(m, MIDSIZE_TRUCKS)) return { bodyStyle: 'truck', truckSize: 'midsize', excludeClass: 'midsize-truck' }
  if (includesAny(m, FULLSIZE_TRUCKS)) return { bodyStyle: 'truck', truckSize: 'fullsize', excludeClass: 'fullsize-truck' }
  if (includesAny(m, SUVS) || includesAny(full, SUVS)) return { bodyStyle: 'suv', truckSize: null, excludeClass: null }
  if (includesAny(m, HATCH_WAGONS)) return { bodyStyle: 'hatchback', truckSize: null, excludeClass: null }

  // Fall back to the collector-provided hint (e.g. Craigslist bodytype) if the
  // nameplate wasn't recognized; a raw "truck"/"van" hint is treated
  // conservatively as excludable only when it clearly says so.
  const hint = norm(bodyStyleHint)
  if (hint === 'van') return { bodyStyle: 'van', truckSize: null, excludeClass: 'van' }
  if (hint === 'truck') return { bodyStyle: 'truck', truckSize: 'unknown', excludeClass: null } // unknown-size truck: keep, let ranker judge
  return { bodyStyle: hint || 'other', truckSize: null, excludeClass: null }
}

// Split listings into kept vs rejected, applying body-class exclusions and the
// VIN-required-for-private rule entirely in code. Each rejected item carries a
// { label, reason } for transparency (same shape the ranker emits).
export function filterListings(listings, opts = {}) {
  const excludeClasses = new Set(opts.excludeClasses || ['fullsize-truck', 'midsize-truck', 'van'])
  const requireVinForPrivate = opts.requireVinForPrivate !== false // default on
  const kept = [], rejected = []
  for (const v of listings) {
    const label = `${v.year || '?'} ${v.make || ''} ${v.model || ''} $${v.price}`.trim()
    const cls = classifyBody(v.make, v.model, v.bodyStyle)
    if (cls.excludeClass && excludeClasses.has(cls.excludeClass)) {
      rejected.push({ label, reason: `Excluded body class: ${cls.excludeClass}.`, excludeClass: cls.excludeClass })
      continue
    }
    if (requireVinForPrivate && norm(v.sellerType) === 'private' && !v.vin) {
      rejected.push({ label, reason: 'Private listing with no VIN — excluded by VIN requirement.', excludeClass: 'no-vin-private' })
      continue
    }
    kept.push({ ...v, bodyStyle: v.bodyStyle || cls.bodyStyle, truckSize: cls.truckSize })
  }
  return { kept, rejected }
}
