#!/bin/bash
# audit-html.sh — Check a single HTML file across 4 quality dimensions
# Usage: audit-html.sh <file.html>
# Output: JSON with pass/fail per dimension to stdout

set -euo pipefail

FILE="${1:?Usage: audit-html.sh <file.html>}"

if [[ ! -f "$FILE" ]]; then
  echo "{\"error\": \"file not found: $FILE\"}"
  exit 1
fi

BASENAME=$(basename "$FILE")

# --- Dark Mode ---
# Pass: links theme.css with data-brand on <html>, OR has prefers-color-scheme: dark
dark_mode=false
if grep -q 'prefers-color-scheme' "$FILE" 2>/dev/null; then
  dark_mode=true
elif grep -q 'theme\.css' "$FILE" 2>/dev/null && grep -q 'data-brand' "$FILE" 2>/dev/null; then
  dark_mode=true
fi

# --- Responsive ---
# Pass: contains @media with max-width breakpoints
responsive=false
if grep -qE '@media[^{]*max-width' "$FILE" 2>/dev/null; then
  responsive=true
elif grep -q 'portal-base\.css\|report-base\.css\|competitor-base\.css\|marketing-plan\.css' "$FILE" 2>/dev/null; then
  # Base CSS files contain responsive grid rules
  responsive=true
fi

# --- Tables ---
# Pass: no <table> tags, OR tables have overflow handling
tables=true
table_count=$(grep -c '<table' "$FILE" 2>/dev/null || true)
table_count="${table_count:-0}"
if [[ "$table_count" -gt 0 ]]; then
  # Check for overflow-x or table-responsive wrapper
  if grep -qE 'overflow-x|overflow:\s*auto|table-responsive|\.table-wrap' "$FILE" 2>/dev/null; then
    tables=true
  else
    tables=false
  fi
fi

# --- Accessibility ---
# Pass: lang attr + skip-link + heading hierarchy
a11y=true
a11y_notes=""

# Check lang attribute on <html>
if ! grep -qE '<html[^>]+lang=' "$FILE" 2>/dev/null; then
  a11y=false
  a11y_notes="missing lang attribute"
fi

# Check skip-link
if ! grep -qE 'skip-link|skip-to|Skip to' "$FILE" 2>/dev/null; then
  a11y=false
  if [[ -n "$a11y_notes" ]]; then
    a11y_notes="$a11y_notes, missing skip-link"
  else
    a11y_notes="missing skip-link"
  fi
fi

# Check heading hierarchy (h1 exists)
if ! grep -q '<h1' "$FILE" 2>/dev/null; then
  a11y=false
  if [[ -n "$a11y_notes" ]]; then
    a11y_notes="$a11y_notes, missing h1"
  else
    a11y_notes="missing h1"
  fi
fi

# --- Grade ---
pass_count=0
$dark_mode && ((pass_count++)) || true
$responsive && ((pass_count++)) || true
$tables && ((pass_count++)) || true
$a11y && ((pass_count++)) || true

case $pass_count in
  4) grade="A" ;;
  3) grade="B" ;;
  2) grade="C" ;;
  *) grade="D" ;;
esac

# --- Output JSON ---
cat <<EOF
{
  "file": "$BASENAME",
  "dark_mode": $dark_mode,
  "responsive": $responsive,
  "tables": $tables,
  "accessibility": $a11y,
  "grade": "$grade",
  "notes": "$a11y_notes"
}
EOF
