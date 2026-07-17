// Deterministic ranking CLI — zero tokens. Takes valued listings (each with a
// price and an estMarketValue, optionally isScam/dealRating/miles/vin) on stdin
// or via --file, and emits the ranked top-N with discounts, rule-based
// confidence, and templated rationales computed entirely in code.
//
// The LLM's only job upstream is to attach estMarketValue (+ optional isScam);
// dedup, discount math, demotion, sorting, confidence, and rationale all happen
// here for free.
//
// Usage:
//   node src/rank.mjs --file valued.json [--top 20 --demote 20 --start-rank 1]
//   cat valued.json | node src/rank.mjs
//
// Input JSON: an array of listings, or { listings: [...] } / { topBargains: [...] }.
// Output JSON: { topBargains, merged, dropped, stats }.

import fs from 'node:fs'
import { dedupeListings, rankBargains } from './rank-lib.mjs'

const arg = (flag, def) => {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def
}

function readInput() {
  const file = arg('--file')
  const raw = file ? fs.readFileSync(file, 'utf8') : fs.readFileSync(0, 'utf8')
  const j = JSON.parse(raw)
  if (Array.isArray(j)) return j
  return j.listings || j.topBargains || j.valued || []
}

function main() {
  const listings = readInput()
  if (!Array.isArray(listings) || listings.length === 0) {
    process.stderr.write('No listings on stdin/--file (expected an array or {listings:[...]}).\n')
    process.exit(1)
  }
  const topN = Number(arg('--top', '20'))
  const demoteThreshold = Number(arg('--demote', '20'))
  const startRank = Number(arg('--start-rank', '1'))

  const { unique, merged } = dedupeListings(listings)
  const { topBargains, dropped, scoredCount } = rankBargains(unique, { topN, demoteThreshold, startRank })

  const out = {
    topBargains,
    merged,
    dropped,
    stats: {
      input: listings.length,
      unique: unique.length,
      mergedAway: merged.length,
      scored: scoredCount,
      ranked: topBargains.length,
      dropped: dropped.length,
    },
  }
  process.stdout.write(JSON.stringify(out, null, process.argv.includes('--pretty') ? 1 : 0) + '\n')
}

main()
