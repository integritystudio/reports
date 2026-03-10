"""Regression test: dark mode element overrides must come AFTER light-mode rules.

If dark mode @media blocks with element selectors (section, .highlight-box, etc.)
appear BEFORE the light-mode rules they override, the light-mode rules win the
cascade at equal specificity — causing light text on white backgrounds in dark mode.

See commit 6827272 for the original fix.
"""

import re
import sys
from pathlib import Path

CSS_DIR = Path(__file__).resolve().parent.parent / "css"

# Element selectors that MUST appear in a dark-mode block AFTER their light-mode counterpart
DARK_MODE_SELECTORS = [
    "section",
    ".highlight-box",
    ".info-box",
    ".warning-box",
    "blockquote",
    "th",
    "td",
    ".badge-success",
]

# Patterns that indicate a :root-only block (no element overrides — safe anywhere)
ROOT_ONLY_RE = re.compile(r"@media\s*\(prefers-color-scheme:\s*dark\)\s*\{[\s]*:root\s*\{[^}]*\}[\s]*\}")


def find_line_positions(css_text: str):
    """Return {selector: last_line_number} for light-mode rules and dark-mode overrides."""
    lines = css_text.splitlines()
    in_dark_media = False
    dark_depth = 0
    light_positions: dict[str, int] = {}
    dark_positions: dict[str, int] = {}

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        # Track @media (prefers-color-scheme: dark) blocks
        if re.match(r"@media\s*\(prefers-color-scheme:\s*dark\)", stripped):
            in_dark_media = True
            dark_depth = 0

        if in_dark_media:
            dark_depth += stripped.count("{") - stripped.count("}")
            if dark_depth <= 0 and "{" not in stripped and "}" in stripped:
                in_dark_media = False
                continue

        for sel in DARK_MODE_SELECTORS:
            # Match selector at start of rule (handles "section," and "section {")
            pattern = re.escape(sel) + r"[\s,{]"
            if re.search(pattern, stripped):
                if in_dark_media:
                    dark_positions[sel] = max(dark_positions.get(sel, 0), i)
                elif not stripped.startswith("/*") and not stripped.startswith("*"):
                    light_positions[sel] = max(light_positions.get(sel, 0), i)

    return light_positions, dark_positions


def test_report_base_cascade():
    """Dark mode element overrides must appear AFTER their light-mode counterparts."""
    css_path = CSS_DIR / "report-base.css"
    assert css_path.exists(), f"Missing {css_path}"

    css_text = css_path.read_text()
    light_pos, dark_pos = find_line_positions(css_text)

    failures = []
    for sel in DARK_MODE_SELECTORS:
        light_line = light_pos.get(sel)
        dark_line = dark_pos.get(sel)

        if light_line is None:
            continue  # No light-mode rule for this selector — skip
        if dark_line is None:
            failures.append(f"  {sel}: has light-mode rule (L{light_line}) but NO dark-mode override")
            continue
        if dark_line < light_line:
            failures.append(
                f"  {sel}: dark-mode override (L{dark_line}) is BEFORE "
                f"light-mode rule (L{light_line}) — will be overridden by cascade"
            )

    if failures:
        print("FAIL: dark mode cascade ordering broken in report-base.css")
        print("\n".join(failures))
        print("\nDark mode element overrides must be placed AFTER light-mode rules")
        print("to win the cascade at equal specificity.")
        return False

    print("PASS: dark mode cascade ordering correct in report-base.css")
    for sel in DARK_MODE_SELECTORS:
        if sel in light_pos and sel in dark_pos:
            print(f"  {sel}: light L{light_pos[sel]} < dark L{dark_pos[sel]}")
    return True


def test_color_scheme_declared():
    """theme.css must declare color-scheme: light dark to prevent browser auto-dark-mode."""
    css_path = CSS_DIR / "theme.css"
    assert css_path.exists(), f"Missing {css_path}"

    css_text = css_path.read_text()
    if "color-scheme:" not in css_text:
        print("FAIL: theme.css missing color-scheme declaration")
        return False

    print("PASS: theme.css declares color-scheme")
    return True


if __name__ == "__main__":
    ok = True
    ok &= test_report_base_cascade()
    print()
    ok &= test_color_scheme_declared()
    sys.exit(0 if ok else 1)
