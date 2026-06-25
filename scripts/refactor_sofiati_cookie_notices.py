#!/usr/bin/env python3
"""
Create 50 super-minimal cookie bars BELOW the footer/copyright area.

What this script does:
- Removes older cookie banners/notices from all HTML/CSS/JS files.
- Adds one tiny JS loader to every HTML page.
- Creates a concept-specific JS file:
    assets/js/sofiati-footer-cookie.js
- The JS inserts a minimal cookie bar AFTER the page footer.
- Nothing is fixed.
- Nothing floats.
- Nothing appears as a modal.
- Nothing covers the screen.
- All 50 bars are minimal but slightly different.
- If the visitor does not respond, it auto-saves essential-only and disappears.

Run dry:
  python3 scripts/refactor_sofiati_footer_cookie_bars.py

Apply:
  python3 scripts/refactor_sofiati_footer_cookie_bars.py --apply --force
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path


NEW_HTML_START = "<!-- SOFIATI FOOTER COOKIE BAR START -->"
NEW_HTML_END = "<!-- SOFIATI FOOTER COOKIE BAR END -->"

OLD_MARKER_BLOCKS = [
    ("<!-- SOFIATI COOKIE NOTICE V1 START -->", "<!-- SOFIATI COOKIE NOTICE V1 END -->"),
    ("<!-- SOFIATI COOKIE NOTICE V2 START -->", "<!-- SOFIATI COOKIE NOTICE V2 END -->"),
    ("<!-- SOFIATI MINIMAL HOME COOKIE START -->", "<!-- SOFIATI MINIMAL HOME COOKIE END -->"),
    ("<!-- SOFIATI FOOTER COOKIE BAR START -->", "<!-- SOFIATI FOOTER COOKIE BAR END -->"),
    ("/* SOFIATI COOKIE NOTICE V1 START */", "/* SOFIATI COOKIE NOTICE V1 END */"),
    ("/* SOFIATI COOKIE NOTICE V2 START */", "/* SOFIATI COOKIE NOTICE V2 END */"),
    ("/* SOFIATI MINIMAL HOME COOKIE START */", "/* SOFIATI MINIMAL HOME COOKIE END */"),
    ("/* SOFIATI FOOTER COOKIE BAR START */", "/* SOFIATI FOOTER COOKIE BAR END */"),
]


@dataclass(frozen=True)
class CookieBarRecipe:
    number: int
    slug: str
    bg: str
    fg: str
    muted: str
    accent: str
    border: str
    width: str
    padding: str
    font_size: str
    align: str
    layout: str
    separator: str
    marker: str
    button_style: str
    radius: str
    auto_delay_ms: int


R = CookieBarRecipe


RECIPES: dict[int, CookieBarRecipe] = {
    1: R(1, "inspire", "#252321", "#F8F7F2", "rgba(248,247,242,.70)", "#C9A56A", "1px solid rgba(201,165,106,.26)", "min(1180px,calc(100% - 36px))", "10px 0 12px", ".82rem", "left", "inline", "top-line", "dot", "pill", "999px", 11000),
    2: R(2, "empower", "#F8F7F2", "#252321", "rgba(37,35,33,.62)", "#879588", "1px solid rgba(127,141,130,.22)", "min(1160px,calc(100% - 34px))", "11px 0", ".82rem", "left", "split", "top-line", "leaf", "soft", "999px", 12000),
    3: R(3, "enhance", "#FFFFFF", "#252321", "rgba(37,35,33,.64)", "#7F8D82", "1px solid rgba(37,35,33,.12)", "min(1120px,calc(100% - 32px))", "9px 0", ".8rem", "left", "ledger", "left-rule", "line", "square", "4px", 10000),
    4: R(4, "renew", "#EEF1EA", "#252321", "rgba(37,35,33,.64)", "#879588", "1px solid rgba(127,141,130,.22)", "min(1140px,calc(100% - 34px))", "11px 0", ".82rem", "left", "inline", "soft-top", "sprig", "pill", "999px", 11000),
    5: R(5, "elevate", "#F4EFE5", "#252321", "rgba(37,35,33,.64)", "#9A6B35", "1px solid rgba(154,107,53,.22)", "min(1220px,calc(100% - 40px))", "12px 0", ".83rem", "center", "centered", "champagne", "diamond", "pill", "999px", 13000),
    6: R(6, "refine", "#FBFBF8", "#252321", "rgba(37,35,33,.58)", "#7F8D82", "1px solid rgba(37,35,33,.10)", "min(980px,calc(100% - 28px))", "8px 0", ".78rem", "left", "minimal", "none", "none", "text", "0", 9000),
    7: R(7, "glow", "#FFFFFF", "#252321", "rgba(37,35,33,.62)", "#C9A56A", "1px solid rgba(201,165,106,.18)", "min(1120px,calc(100% - 36px))", "11px 0", ".82rem", "center", "inline", "glow", "sun", "pill", "999px", 12000),
    8: R(8, "balance", "#F8F7F2", "#252321", "rgba(37,35,33,.62)", "#879588", "1px solid rgba(127,141,130,.20)", "min(1120px,calc(100% - 36px))", "10px 0", ".82rem", "center", "split", "center-line", "bracket", "soft", "999px", 11000),
    9: R(9, "radiance", "#FFFDF8", "#252321", "rgba(37,35,33,.62)", "#C9A56A", "1px solid rgba(201,165,106,.20)", "min(1200px,calc(100% - 38px))", "11px 0", ".82rem", "left", "inline", "top-line", "ray", "pill", "999px", 12000),
    10: R(10, "essence", "transparent", "#252321", "rgba(37,35,33,.55)", "#7F8D82", "0", "min(920px,calc(100% - 28px))", "8px 0", ".77rem", "center", "minimal", "none", "none", "text", "0", 8000),
    11: R(11, "bloom", "#EAF0E8", "#252321", "rgba(37,35,33,.64)", "#879588", "1px solid rgba(127,141,130,.22)", "min(1140px,calc(100% - 34px))", "11px 0", ".82rem", "left", "inline", "soft-top", "sprig", "pill", "999px", 11000),
    12: R(12, "vital", "#F8F7F2", "#252321", "rgba(37,35,33,.64)", "#9A6B35", "1px solid rgba(154,107,53,.18)", "min(1180px,calc(100% - 36px))", "10px 0", ".82rem", "left", "split", "motion", "arrow", "soft", "999px", 11000),
    13: R(13, "poise", "#252321", "#F8F7F2", "rgba(248,247,242,.70)", "#C9A56A", "1px solid rgba(201,165,106,.24)", "min(1120px,calc(100% - 34px))", "11px 0", ".81rem", "left", "editorial", "top-line", "diamond", "text", "0", 10000),
    14: R(14, "aura", "#F8F7F2", "#252321", "rgba(37,35,33,.62)", "#C9A56A", "1px solid rgba(201,165,106,.18)", "min(1120px,calc(100% - 36px))", "11px 0", ".82rem", "center", "centered", "soft-top", "halo", "pill", "999px", 12000),
    15: R(15, "clarity", "#FFFFFF", "#252321", "rgba(37,35,33,.66)", "#7F8D82", "1px solid rgba(37,35,33,.12)", "min(1100px,calc(100% - 32px))", "9px 0", ".8rem", "left", "ledger", "top-line", "check", "square", "4px", 9000),
    16: R(16, "grace", "#F8F7F2", "#252321", "rgba(37,35,33,.62)", "#A2AEA0", "1px solid rgba(162,174,160,.22)", "min(1100px,calc(100% - 34px))", "11px 0", ".82rem", "center", "inline", "soft-top", "curve", "pill", "999px", 11000),
    17: R(17, "sculpt", "#2B2B27", "#F8F7F2", "rgba(248,247,242,.70)", "#C9A56A", "1px solid rgba(201,165,106,.22)", "min(1140px,calc(100% - 34px))", "10px 0", ".81rem", "left", "split", "diagonal", "angle", "square", "4px", 10000),
    18: R(18, "lumin", "#FFFFFF", "#252321", "rgba(37,35,33,.62)", "#C9A56A", "1px solid rgba(201,165,106,.16)", "min(1120px,calc(100% - 36px))", "11px 0", ".82rem", "center", "inline", "glow", "ray", "pill", "999px", 12000),
    19: R(19, "verda", "#2E3A32", "#F8F7F2", "rgba(248,247,242,.70)", "#DAB26F", "1px solid rgba(218,178,111,.22)", "min(1160px,calc(100% - 36px))", "11px 0", ".82rem", "left", "inline", "soft-top", "sprig", "pill", "999px", 11000),
    20: R(20, "halo", "#252321", "#F8F7F2", "rgba(248,247,242,.72)", "#C9A56A", "1px solid rgba(201,165,106,.20)", "min(1120px,calc(100% - 36px))", "11px 0", ".82rem", "center", "centered", "center-line", "halo", "pill", "999px", 12000),
    21: R(21, "calm", "#F8F7F2", "#252321", "rgba(37,35,33,.58)", "#A2AEA0", "1px solid rgba(162,174,160,.18)", "min(980px,calc(100% - 30px))", "8px 0", ".79rem", "left", "minimal", "none", "dash", "text", "0", 8500),
    22: R(22, "precision", "#FFFFFF", "#252321", "rgba(37,35,33,.66)", "#7F8D82", "1px solid rgba(37,35,33,.12)", "min(1080px,calc(100% - 32px))", "8px 0", ".79rem", "left", "ledger", "left-rule", "ledger", "square", "2px", 8500),
    23: R(23, "ritual", "#F4EFE5", "#252321", "rgba(37,35,33,.64)", "#9A6B35", "1px solid rgba(154,107,53,.20)", "min(1100px,calc(100% - 34px))", "10px 0", ".81rem", "left", "inline", "step-line", "step", "pill", "999px", 10000),
    24: R(24, "signal", "#202524", "#F8F7F2", "rgba(248,247,242,.70)", "#A2AEA0", "1px solid rgba(162,174,160,.22)", "min(1120px,calc(100% - 34px))", "9px 0", ".8rem", "left", "ledger", "scan", "signal", "square", "6px", 9000),
    25: R(25, "align", "#FBFBF8", "#252321", "rgba(37,35,33,.64)", "#879588", "1px solid rgba(127,141,130,.18)", "min(1120px,calc(100% - 34px))", "9px 0", ".8rem", "left", "split", "center-line", "line", "square", "8px", 9000),
    26: R(26, "vivant", "#EEF1EA", "#252321", "rgba(37,35,33,.64)", "#9A6B35", "1px solid rgba(154,107,53,.18)", "min(1140px,calc(100% - 34px))", "10px 0", ".82rem", "left", "inline", "motion", "arrow", "pill", "999px", 11000),
    27: R(27, "form", "#2B2B27", "#F8F7F2", "rgba(248,247,242,.72)", "#C9A56A", "1px solid rgba(201,165,106,.22)", "min(1120px,calc(100% - 34px))", "10px 0", ".81rem", "left", "split", "diagonal", "angle", "square", "4px", 10000),
    28: R(28, "pure", "transparent", "#252321", "rgba(37,35,33,.55)", "#A2AEA0", "0", "min(900px,calc(100% - 28px))", "7px 0", ".77rem", "center", "minimal", "none", "none", "text", "0", 8000),
    29: R(29, "solace", "#F8F7F2", "#252321", "rgba(37,35,33,.62)", "#879588", "1px solid rgba(127,141,130,.18)", "min(1080px,calc(100% - 34px))", "10px 0", ".82rem", "left", "inline", "soft-top", "circle", "pill", "999px", 11000),
    30: R(30, "method", "#FBFAF6", "#252321", "rgba(37,35,33,.64)", "#9A6B35", "1px solid rgba(154,107,53,.18)", "min(1080px,calc(100% - 32px))", "9px 0", ".8rem", "left", "ledger", "step-line", "step", "square", "6px", 9000),
    31: R(31, "evolve", "#EEF1EA", "#252321", "rgba(37,35,33,.64)", "#9A6B35", "1px solid rgba(154,107,53,.18)", "min(1120px,calc(100% - 34px))", "10px 0", ".82rem", "center", "inline", "motion", "arrow", "pill", "999px", 11000),
    32: R(32, "serene", "#F8F7F2", "#252321", "rgba(37,35,33,.58)", "#A2AEA0", "1px solid rgba(162,174,160,.16)", "min(980px,calc(100% - 30px))", "8px 0", ".79rem", "center", "minimal", "none", "dash", "text", "0", 8500),
    33: R(33, "elan", "#252321", "#F8F7F2", "rgba(248,247,242,.72)", "#C9A56A", "1px solid rgba(201,165,106,.24)", "min(1160px,calc(100% - 36px))", "11px 0", ".82rem", "left", "editorial", "top-line", "diamond", "text", "0", 10000),
    34: R(34, "flora", "#E9F0E6", "#252321", "rgba(37,35,33,.64)", "#879588", "1px solid rgba(127,141,130,.20)", "min(1140px,calc(100% - 34px))", "10px 0", ".82rem", "left", "inline", "soft-top", "sprig", "pill", "999px", 11000),
    35: R(35, "atelier", "#FBFAF6", "#252321", "rgba(37,35,33,.64)", "#9A6B35", "1px solid rgba(154,107,53,.20)", "min(1160px,calc(100% - 36px))", "10px 0", ".82rem", "left", "split", "left-rule", "bracket", "square", "6px", 10000),
    36: R(36, "lumina", "#FFFFFF", "#252321", "rgba(37,35,33,.62)", "#C9A56A", "1px solid rgba(201,165,106,.16)", "min(1120px,calc(100% - 34px))", "10px 0", ".82rem", "center", "inline", "glow", "ray", "pill", "999px", 12000),
    37: R(37, "vellum", "#FBFAF6", "#252321", "rgba(37,35,33,.64)", "#9A6B35", "1px dashed rgba(154,107,53,.22)", "min(1040px,calc(100% - 32px))", "8px 0", ".79rem", "left", "ledger", "none", "ledger", "text", "0", 9000),
    38: R(38, "origin", "#2B312D", "#F8F7F2", "rgba(248,247,242,.70)", "#C9A56A", "1px solid rgba(201,165,106,.20)", "min(1120px,calc(100% - 34px))", "10px 0", ".82rem", "left", "inline", "left-rule", "root", "pill", "999px", 11000),
    39: R(39, "kindred", "#F8F7F2", "#252321", "rgba(37,35,33,.62)", "#A2AEA0", "1px solid rgba(162,174,160,.18)", "min(1080px,calc(100% - 34px))", "10px 0", ".82rem", "left", "inline", "soft-top", "circle", "pill", "999px", 11000),
    40: R(40, "noble", "#201F1E", "#F8F7F2", "rgba(248,247,242,.72)", "#DAB26F", "1px solid rgba(218,178,111,.24)", "min(1160px,calc(100% - 36px))", "11px 0", ".82rem", "center", "editorial", "champagne", "diamond", "text", "0", 11000),
    41: R(41, "vista", "#F8F7F2", "#252321", "rgba(37,35,33,.64)", "#879588", "1px solid rgba(127,141,130,.18)", "min(1240px,calc(100% - 42px))", "9px 0", ".8rem", "center", "wide", "top-line", "horizon", "square", "8px", 9500),
    42: R(42, "softline", "#F8F7F2", "#252321", "rgba(37,35,33,.62)", "#A2AEA0", "1px solid rgba(162,174,160,.18)", "min(1080px,calc(100% - 34px))", "10px 0", ".82rem", "center", "inline", "soft-top", "curve", "pill", "999px", 11000),
    43: R(43, "meridian", "#FFFFFF", "#252321", "rgba(37,35,33,.64)", "#879588", "1px solid rgba(127,141,130,.18)", "min(1080px,calc(100% - 34px))", "9px 0", ".8rem", "left", "split", "left-rule", "compass", "square", "8px", 9500),
    44: R(44, "safeguard", "#FFFFFF", "#252321", "rgba(37,35,33,.66)", "#7F8D82", "1px solid rgba(37,35,33,.12)", "min(1060px,calc(100% - 32px))", "9px 0", ".8rem", "left", "ledger", "top-line", "shield", "square", "6px", 9000),
    45: R(45, "silhouette", "#252321", "#F8F7F2", "rgba(248,247,242,.68)", "#C9A56A", "1px solid rgba(201,165,106,.18)", "min(1080px,calc(100% - 34px))", "10px 0", ".81rem", "left", "minimal", "none", "silhouette", "text", "0", 9000),
    46: R(46, "curate", "#F4EFE5", "#252321", "rgba(37,35,33,.64)", "#9A6B35", "1px solid rgba(154,107,53,.20)", "min(1140px,calc(100% - 34px))", "10px 0", ".82rem", "left", "split", "soft-top", "bracket", "pill", "999px", 11000),
    47: R(47, "proof", "#FBFBF8", "#252321", "rgba(37,35,33,.66)", "#7F8D82", "1px solid rgba(37,35,33,.12)", "min(1060px,calc(100% - 32px))", "8px 0", ".79rem", "left", "ledger", "left-rule", "check", "square", "4px", 9000),
    48: R(48, "signature", "#F8F7F2", "#252321", "rgba(37,35,33,.64)", "#9A6B35", "1px solid rgba(154,107,53,.20)", "min(1180px,calc(100% - 38px))", "11px 0", ".82rem", "center", "centered", "champagne", "signature", "pill", "999px", 12000),
    49: R(49, "wisdom", "#252321", "#F8F7F2", "rgba(248,247,242,.70)", "#C9A56A", "1px solid rgba(201,165,106,.20)", "min(1120px,calc(100% - 34px))", "10px 0", ".82rem", "left", "inline", "top-line", "book", "pill", "999px", 11000),
    50: R(50, "sovereign", "#1F1E1D", "#F8F7F2", "rgba(248,247,242,.74)", "#DAB26F", "1px solid rgba(218,178,111,.24)", "min(1220px,calc(100% - 40px))", "12px 0", ".83rem", "center", "wide", "champagne", "crest", "pill", "999px", 13000),
}


def concept_dirs(concepts_dir: Path) -> list[Path]:
    if not concepts_dir.exists():
        raise FileNotFoundError(f"Missing concepts directory: {concepts_dir}")
    return sorted(p for p in concepts_dir.iterdir() if p.is_dir() and re.match(r"^\d{2}-", p.name))


def concept_number(concept: Path) -> int:
    return int(concept.name.split("-", 1)[0])


def page_files(concept: Path) -> list[Path]:
    return sorted(p for p in concept.glob("*.html") if p.is_file())


def backup_file(path: Path) -> None:
    if path.exists():
        shutil.copy2(path, path.with_suffix(path.suffix + ".footer-cookie-bar.bak"))


def git_is_dirty(root: Path) -> bool:
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=root,
            text=True,
            capture_output=True,
            check=False,
        )
        return bool(result.stdout.strip())
    except Exception:
        return False


def remove_between_markers(text: str) -> str:
    for start, end in OLD_MARKER_BLOCKS:
        pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)
        text = pattern.sub("", text)

    text = re.sub(
        r"\s*<section\b[^>]*data-cookie-notice[^>]*>.*?</section>\s*",
        "\n",
        text,
        flags=re.S | re.I,
    )

    text = re.sub(
        r'\s*<script\b[^>]*(sofiati-home-cookie|sofiati-footer-cookie|data-sofiati-cookie-loader)[^>]*>\s*</script>\s*',
        "\n",
        text,
        flags=re.S | re.I,
    )

    return re.sub(r"\n{3,}", "\n\n", text).rstrip() + "\n"


def remove_old_cookie_blocks_from_asset(text: str) -> str:
    for start, end in OLD_MARKER_BLOCKS:
        pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)
        text = pattern.sub("", text)
    return re.sub(r"\n{3,}", "\n\n", text).rstrip() + "\n"


def inject_loader(html: str) -> str:
    loader = f"""
{NEW_HTML_START}
<script src="assets/js/sofiati-footer-cookie.js" defer data-sofiati-cookie-loader></script>
{NEW_HTML_END}
""".strip()

    html = remove_between_markers(html)

    if re.search(r"</body\s*>", html, flags=re.I):
        return re.sub(r"</body\s*>", loader + "\n</body>", html, count=1, flags=re.I)

    return html.rstrip() + "\n" + loader + "\n"


def find_cleanup_files(concept: Path, extensions: tuple[str, ...]) -> list[Path]:
    files: list[Path] = []
    for ext in extensions:
        files.extend(concept.glob(f"*.{ext}"))
        files.extend((concept / "assets").glob(f"**/*.{ext}") if (concept / "assets").exists() else [])
        files.extend((concept / "css").glob(f"**/*.{ext}") if (concept / "css").exists() else [])
        files.extend((concept / "js").glob(f"**/*.{ext}") if (concept / "js").exists() else [])
    return sorted(set(p for p in files if p.is_file()))


def write_if_changed(path: Path, content: str, apply: bool) -> bool:
    old = path.read_text(encoding="utf-8") if path.exists() else ""
    if old == content:
        return False
    if apply:
        path.parent.mkdir(parents=True, exist_ok=True)
        backup_file(path)
        path.write_text(content, encoding="utf-8")
    return True


def render_js(recipe: CookieBarRecipe, code: str) -> str:
    return f'''{NEW_HTML_START.replace("<!--", "/*").replace("-->", "*/")}
(() => {{
  "use strict";

  const CONFIG = {{
    key: "sofiatiFooterCookie:{code}",
    autoMode: "essential",
    autoDelayMs: {recipe.auto_delay_ms},
    recipe: {{
      code: "{code}",
      slug: "{recipe.slug}",
      bg: "{recipe.bg}",
      fg: "{recipe.fg}",
      muted: "{recipe.muted}",
      accent: "{recipe.accent}",
      border: "{recipe.border}",
      width: "{recipe.width}",
      padding: "{recipe.padding}",
      fontSize: "{recipe.font_size}",
      align: "{recipe.align}",
      layout: "{recipe.layout}",
      separator: "{recipe.separator}",
      marker: "{recipe.marker}",
      buttonStyle: "{recipe.button_style}",
      radius: "{recipe.radius}"
    }}
  }};

  if (localStorage.getItem(CONFIG.key)) return;

  function saveConsent(mode) {{
    const payload = {{
      essential: true,
      analytics: mode === "all",
      experience: mode === "all",
      mode,
      updatedAt: new Date().toISOString()
    }};
    localStorage.setItem(CONFIG.key, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("sofiati:cookie-consent", {{ detail: payload }}));
  }}

  function createBar() {{
    const bar = document.createElement("section");
    bar.className = "sf-footer-cookie-bar";
    bar.setAttribute("data-cookie-bar", CONFIG.recipe.code);
    bar.setAttribute("data-layout", CONFIG.recipe.layout);
    bar.setAttribute("data-separator", CONFIG.recipe.separator);
    bar.setAttribute("data-marker", CONFIG.recipe.marker);
    bar.setAttribute("data-button-style", CONFIG.recipe.buttonStyle);
    bar.setAttribute("aria-label", "Cookie notice");

    bar.innerHTML = `
      <div class="sf-footer-cookie-inner">
        <span class="sf-footer-cookie-mark" aria-hidden="true"></span>
        <p class="sf-footer-cookie-text">
          <strong>Cookies:</strong> essential cookies keep this site working. Optional cookies help improve the experience.
        </p>
        <div class="sf-footer-cookie-actions">
          <button type="button" data-cookie-choice="all">Accept</button>
          <button type="button" data-cookie-choice="essential">Essential only</button>
          <a href="cookies.html">Cookies</a>
        </div>
      </div>
    `;

    const style = document.createElement("style");
    style.setAttribute("data-sofiati-footer-cookie-style", CONFIG.recipe.code);
    style.textContent = `
      .sf-footer-cookie-bar {{
        --bar-bg: ${{CONFIG.recipe.bg}};
        --bar-fg: ${{CONFIG.recipe.fg}};
        --bar-muted: ${{CONFIG.recipe.muted}};
        --bar-accent: ${{CONFIG.recipe.accent}};
        --bar-border: ${{CONFIG.recipe.border}};
        --bar-width: ${{CONFIG.recipe.width}};
        --bar-padding: ${{CONFIG.recipe.padding}};
        --bar-font-size: ${{CONFIG.recipe.fontSize}};
        --bar-radius: ${{CONFIG.recipe.radius}};

        background: var(--bar-bg);
        color: var(--bar-fg);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }}

      .sf-footer-cookie-bar[data-separator="top-line"] {{
        border-top: var(--bar-border);
      }}

      .sf-footer-cookie-bar[data-separator="soft-top"] {{
        border-top: var(--bar-border);
        box-shadow: inset 0 1px 0 color-mix(in srgb, var(--bar-accent) 12%, transparent);
      }}

      .sf-footer-cookie-bar[data-separator="champagne"] {{
        border-top: 1px solid color-mix(in srgb, var(--bar-accent) 34%, transparent);
      }}

      .sf-footer-cookie-bar[data-separator="left-rule"] .sf-footer-cookie-inner {{
        border-left: 3px solid var(--bar-accent);
        padding-left: 12px;
      }}

      .sf-footer-cookie-bar[data-separator="center-line"] .sf-footer-cookie-inner::before {{
        content: "";
        width: 34px;
        height: 1px;
        background: var(--bar-accent);
        opacity: .7;
      }}

      .sf-footer-cookie-bar[data-separator="diagonal"] .sf-footer-cookie-inner {{
        background-image: linear-gradient(112deg, transparent 0 46%, color-mix(in srgb, var(--bar-accent) 18%, transparent) 46% 47%, transparent 47%);
      }}

      .sf-footer-cookie-bar[data-separator="motion"] {{
        border-top: 1px solid color-mix(in srgb, var(--bar-accent) 18%, transparent);
        background-image: linear-gradient(90deg, color-mix(in srgb, var(--bar-accent) 8%, transparent), transparent 34%, color-mix(in srgb, var(--bar-accent) 6%, transparent));
      }}

      .sf-footer-cookie-bar[data-separator="scan"] {{
        background-image: repeating-linear-gradient(180deg, color-mix(in srgb, var(--bar-accent) 8%, transparent) 0 1px, transparent 1px 7px);
      }}

      .sf-footer-cookie-inner {{
        width: var(--bar-width);
        margin-inline: auto;
        min-height: 42px;
        display: flex;
        align-items: center;
        justify-content: ${{CONFIG.recipe.align === "center" ? "center" : "space-between"}};
        gap: 10px 14px;
        padding: var(--bar-padding);
        text-align: ${{CONFIG.recipe.align}};
        font-size: var(--bar-font-size);
        line-height: 1.35;
      }}

      .sf-footer-cookie-bar[data-layout="minimal"] .sf-footer-cookie-inner {{
        min-height: 34px;
        justify-content: center;
      }}

      .sf-footer-cookie-bar[data-layout="centered"] .sf-footer-cookie-inner {{
        justify-content: center;
      }}

      .sf-footer-cookie-bar[data-layout="split"] .sf-footer-cookie-text {{
        max-width: 68ch;
      }}

      .sf-footer-cookie-bar[data-layout="ledger"] .sf-footer-cookie-inner {{
        min-height: 36px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        letter-spacing: -.02em;
      }}

      .sf-footer-cookie-bar[data-layout="editorial"] .sf-footer-cookie-text strong {{
        letter-spacing: .08em;
        text-transform: uppercase;
      }}

      .sf-footer-cookie-bar[data-layout="wide"] .sf-footer-cookie-inner {{
        min-height: 40px;
      }}

      .sf-footer-cookie-mark {{
        width: 7px;
        height: 7px;
        flex: 0 0 auto;
        background: var(--bar-accent);
        opacity: .85;
        border-radius: 999px;
      }}

      .sf-footer-cookie-bar[data-marker="none"] .sf-footer-cookie-mark {{
        display: none;
      }}

      .sf-footer-cookie-bar[data-marker="line"] .sf-footer-cookie-mark,
      .sf-footer-cookie-bar[data-marker="dash"] .sf-footer-cookie-mark,
      .sf-footer-cookie-bar[data-marker="ledger"] .sf-footer-cookie-mark {{
        width: 16px;
        height: 1px;
        border-radius: 0;
      }}

      .sf-footer-cookie-bar[data-marker="diamond"] .sf-footer-cookie-mark {{
        width: 7px;
        height: 7px;
        border-radius: 0;
        transform: rotate(45deg);
      }}

      .sf-footer-cookie-bar[data-marker="leaf"] .sf-footer-cookie-mark,
      .sf-footer-cookie-bar[data-marker="sprig"] .sf-footer-cookie-mark,
      .sf-footer-cookie-bar[data-marker="root"] .sf-footer-cookie-mark {{
        width: 12px;
        height: 7px;
        border-radius: 100% 0 100% 0;
        transform: rotate(-24deg);
      }}

      .sf-footer-cookie-bar[data-marker="bracket"] .sf-footer-cookie-mark {{
        width: 8px;
        height: 12px;
        background: transparent;
        border-left: 1px solid var(--bar-accent);
        border-top: 1px solid var(--bar-accent);
        border-bottom: 1px solid var(--bar-accent);
        border-radius: 0;
      }}

      .sf-footer-cookie-text {{
        margin: 0;
        color: var(--bar-muted);
        flex: 1 1 auto;
      }}

      .sf-footer-cookie-text strong {{
        color: var(--bar-fg);
        font-weight: 850;
      }}

      .sf-footer-cookie-actions {{
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        flex: 0 0 auto;
      }}

      .sf-footer-cookie-actions button,
      .sf-footer-cookie-actions a {{
        min-height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 4px 9px;
        border: 1px solid color-mix(in srgb, var(--bar-accent) 32%, transparent);
        border-radius: var(--bar-radius);
        background: transparent;
        color: var(--bar-fg);
        font: inherit;
        font-size: .78rem;
        font-weight: 800;
        text-decoration: none;
        cursor: pointer;
        white-space: nowrap;
      }}

      .sf-footer-cookie-actions button:first-child {{
        background: var(--bar-accent);
        border-color: var(--bar-accent);
        color: #fff;
      }}

      .sf-footer-cookie-bar[data-button-style="text"] .sf-footer-cookie-actions button,
      .sf-footer-cookie-bar[data-button-style="text"] .sf-footer-cookie-actions a {{
        border: 0;
        padding-inline: 4px;
        text-decoration: underline;
        text-underline-offset: .25em;
        background: transparent;
        color: var(--bar-muted);
      }}

      .sf-footer-cookie-bar[data-button-style="text"] .sf-footer-cookie-actions button:first-child {{
        color: var(--bar-fg);
      }}

      .sf-footer-cookie-bar[data-button-style="square"] .sf-footer-cookie-actions button,
      .sf-footer-cookie-bar[data-button-style="square"] .sf-footer-cookie-actions a {{
        border-radius: var(--bar-radius);
      }}

      .sf-footer-cookie-actions button:focus-visible,
      .sf-footer-cookie-actions a:focus-visible {{
        outline: 2px solid var(--bar-accent);
        outline-offset: 3px;
      }}

      @media (max-width: 720px) {{
        .sf-footer-cookie-inner {{
          width: min(520px, calc(100% - 26px));
          display: grid;
          justify-items: start;
          justify-content: start;
          text-align: left;
          gap: 8px;
          padding-block: 10px;
        }}

        .sf-footer-cookie-bar[data-layout="minimal"] .sf-footer-cookie-inner,
        .sf-footer-cookie-bar[data-layout="centered"] .sf-footer-cookie-inner {{
          justify-items: center;
          text-align: center;
        }}

        .sf-footer-cookie-actions {{
          justify-content: start;
          flex-wrap: wrap;
        }}

        .sf-footer-cookie-actions button,
        .sf-footer-cookie-actions a {{
          min-height: 30px;
        }}
      }}
    `;

    bar.addEventListener("click", (event) => {{
      const choice = event.target.closest("[data-cookie-choice]");
      if (!choice) return;
      const mode = choice.getAttribute("data-cookie-choice") || "essential";
      saveConsent(mode === "all" ? "all" : "essential");
      bar.remove();
    }});

    document.head.appendChild(style);

    const footers = Array.from(document.querySelectorAll("footer"));
    const footer = footers.length ? footers[footers.length - 1] : null;

    if (footer && footer.parentNode) {{
      footer.insertAdjacentElement("afterend", bar);
    }} else {{
      document.body.appendChild(bar);
    }}

    window.setTimeout(() => {{
      if (!localStorage.getItem(CONFIG.key) && document.body.contains(bar)) {{
        saveConsent(CONFIG.autoMode);
        bar.remove();
      }}
    }}, CONFIG.autoDelayMs);
  }}

  if (document.readyState === "loading") {{
    document.addEventListener("DOMContentLoaded", createBar, {{ once: true }});
  }} else {{
    createBar();
  }}
}})();
{NEW_HTML_END.replace("<!--", "/*").replace("-->", "*/")}
'''


def update_concept(concept: Path, recipe: CookieBarRecipe, root: Path, apply: bool) -> tuple[int, int, int]:
    html_changed = 0
    css_cleaned = 0
    js_cleaned = 0

    for page in page_files(concept):
        old = page.read_text(encoding="utf-8")
        new = inject_loader(old)
        if write_if_changed(page, new, apply):
            html_changed += 1

    for css_file in find_cleanup_files(concept, ("css",)):
        old = css_file.read_text(encoding="utf-8")
        new = remove_old_cookie_blocks_from_asset(old)
        if write_if_changed(css_file, new, apply):
            css_cleaned += 1

    for js_file in find_cleanup_files(concept, ("js",)):
        if js_file.name == "sofiati-footer-cookie.js":
            continue
        old = js_file.read_text(encoding="utf-8")
        new = remove_old_cookie_blocks_from_asset(old)
        if write_if_changed(js_file, new, apply):
            js_cleaned += 1

    js_path = concept / "assets" / "js" / "sofiati-footer-cookie.js"
    new_js = render_js(recipe, f"{recipe.number:02d}")
    if write_if_changed(js_path, new_js, apply):
        js_cleaned += 1

    return html_changed, css_cleaned, js_cleaned


def assert_unique_recipes() -> None:
    seen: dict[tuple[str, str, str, str, str, str, str], int] = {}
    for number, recipe in RECIPES.items():
        signature = (
            recipe.bg,
            recipe.accent,
            recipe.layout,
            recipe.separator,
            recipe.marker,
            recipe.button_style,
            recipe.width,
        )
        if signature in seen:
            raise ValueError(f"Recipe {number} duplicates recipe {seen[signature]}")
        seen[signature] = number


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="Repository root.")
    parser.add_argument("--apply", action="store_true", help="Write changes. Without this, dry run only.")
    parser.add_argument("--force", action="store_true", help="Allow running on a dirty Git tree.")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    concepts_dir = root / "concepts"

    assert_unique_recipes()

    if git_is_dirty(root) and not args.force:
        print("Git tree has changes. Commit/stash first, or rerun with --force.")
        return

    audit = [
        "# Sofiati Footer Cookie Bar Audit",
        "",
        "- Bars are inserted after the final footer element.",
        "- Bars are not fixed, floating, modal, or invasive.",
        "- Old cookie notices are removed from HTML/CSS/JS.",
        "- Each concept gets a small variation of the same minimal footer-bar idea.",
        "- No optional cookies are silently accepted by default.",
        "- If the visitor does nothing, essential-only is saved automatically.",
        "",
    ]

    total_html = total_css = total_js = 0

    for concept in concept_dirs(concepts_dir):
        number = concept_number(concept)
        recipe = RECIPES.get(number)
        if not recipe:
            print(f"Skipping {concept.name}: no recipe.")
            continue

        html_count, css_count, js_count = update_concept(concept, recipe, root, args.apply)

        total_html += html_count
        total_css += css_count
        total_js += js_count

        audit.extend([
            f"## {concept.name}",
            "",
            f"- Recipe: `{recipe.slug}`",
            f"- Layout: `{recipe.layout}`",
            f"- Separator: `{recipe.separator}`",
            f"- Marker: `{recipe.marker}`",
            f"- Button style: `{recipe.button_style}`",
            f"- Background: `{recipe.bg}`",
            f"- Accent: `{recipe.accent}`",
            f"- Auto fallback: `essential-only after {recipe.auto_delay_ms}ms`",
            f"- Placement: `after final footer element`",
            f"- HTML pages changed: `{html_count}`",
            f"- CSS files cleaned: `{css_count}`",
            f"- JS files cleaned/written: `{js_count}`",
            "",
        ])

        print(
            f"{'Would update' if not args.apply else 'Updated'} "
            f"{concept.name}: html={html_count}, css={css_count}, js={js_count}"
        )

    audit_path = root / "audit" / "footer-cookie-bar-audit.md"
    if args.apply:
        audit_path.parent.mkdir(parents=True, exist_ok=True)
        audit_path.write_text("\n".join(audit).rstrip() + "\n", encoding="utf-8")

    if args.apply:
        print(f"Done. HTML changed: {total_html}, CSS cleaned: {total_css}, JS cleaned/written: {total_js}")
        print("Audit written to audit/footer-cookie-bar-audit.md")
    else:
        print(f"Dry run complete. HTML would change: {total_html}, CSS would clean: {total_css}, JS would clean/write: {total_js}")
        print("Rerun with --apply --force to write files.")


if __name__ == "__main__":
    main()