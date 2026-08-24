#!/usr/bin/env python3
"""Give every English Journal article an English-only URL slug.

Portuguese routes remain stable under ``/blog/``.  Old English routes are
recorded in ``_redirects`` so external links retain a permanent destination.
"""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PAIRS = ROOT / "data" / "page-pairs.json"
REDIRECTS = ROOT / "_redirects"


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    normalized = normalized.replace("&", " and ")
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", normalized)).strip("-")


def english_slug(path: Path) -> str:
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    heading = soup.find("h1")
    if heading is None:
        raise ValueError(f"{path}: article has no H1")
    slug = slugify(heading.get_text(" ", strip=True))
    if not slug:
        raise ValueError(f"{path}: article H1 cannot form a URL slug")
    return slug


def replace_text(path: Path, changes: dict[str, str]) -> None:
    original = path.read_text(encoding="utf-8")
    updated = original
    for old, new in changes.items():
        updated = updated.replace(old, new)
    if updated != original:
        path.write_text(updated, encoding="utf-8")


def strip_public_comments(path: Path) -> None:
    """Remove implementation notes from the client-delivered Journal markup."""
    original = path.read_text(encoding="utf-8")
    updated = re.sub(r"<!--.*?-->", "", original, flags=re.S)
    if updated != original:
        path.write_text(updated, encoding="utf-8")


def normalize_language_metadata(path: Path, language: str, own_url: str, paired_url: str) -> None:
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    soup.html["lang"] = language
    soup.html["data-default-lang"] = language
    for link in soup.find_all("link"):
        rel = link.get("rel", [])
        if "canonical" in rel:
            link["href"] = own_url
        elif "alternate" in rel:
            code = link.get("hreflang")
            if code == language:
                link["href"] = own_url
            elif code in {"en", "pt-BR"}:
                link["href"] = paired_url
            elif code == "x-default":
                link["href"] = paired_url if language == "en" else own_url
    soup.find("meta", property="og:url")["content"] = own_url
    path.write_text(str(soup), encoding="utf-8")


def localize_portuguese_links(path: Path) -> None:
    replacements = {
        "../results.html": "../resultados.html",
        "../consultation.html": "../consulta.html",
        "../care.html": "../cuidados.html",
        "../treatments.html": "../tratamentos.html",
        "../skin.html": "../pele.html",
    }
    replace_text(path, replacements)


def main() -> int:
    data = json.loads(PAIRS.read_text(encoding="utf-8"))
    pairs = [item for item in data["pages"] if str(item.get("pt-BR", "")).startswith("blog/")]
    routes: dict[str, str] = {}
    claimed: set[str] = set()
    for pair in pairs:
        old = str(pair["en"])
        source = ROOT / old
        new_name = f"{english_slug(source)}.html"
        if new_name in claimed:
            raise ValueError(f"Duplicate English Journal slug: {new_name}")
        claimed.add(new_name)
        routes[old] = f"en/blog/{new_name}"

    # Update every site-level URL first, then local links within /en/blog/.
    absolute_changes = {
        old.removesuffix(".html"): new.removesuffix(".html")
        for old, new in routes.items()
        if old != new
    }
    for path in [*ROOT.glob("*.html"), ROOT / "blog.html", ROOT / "en" / "blog.html", ROOT / "sitemap.xml", REDIRECTS]:
        if path.exists():
            replace_text(path, absolute_changes)
    for path in (ROOT / "blog").glob("*.html"):
        replace_text(path, absolute_changes)
    local_changes = {
        Path(old).name: Path(new).name
        for old, new in routes.items()
        if old != new
    }
    for path in (ROOT / "en" / "blog").glob("*.html"):
        replace_text(path, {**absolute_changes, **local_changes})

    for pair in pairs:
        pair["en"] = routes[str(pair["en"])]
    PAIRS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    redirect_lines = REDIRECTS.read_text(encoding="utf-8").splitlines() if REDIRECTS.exists() else []
    for old, new in routes.items():
        if old == new:
            continue
        line = f"/{old.removesuffix('.html')} /{new.removesuffix('.html')} 301"
        if line not in redirect_lines:
            redirect_lines.append(line)
    REDIRECTS.write_text("\n".join(redirect_lines) + "\n", encoding="utf-8")

    # Article-card URLs on the English index are relative to /en/.  Use the
    # legacy-to-current redirects as a durable migration map for those links.
    index_changes: dict[str, str] = {}
    for line in redirect_lines:
        parts = line.split()
        if len(parts) >= 2 and parts[0].startswith("/en/blog/") and parts[1].startswith("/en/blog/"):
            index_changes[f'href="blog/{parts[0].rsplit("/", 1)[-1]}.html"'] = f'href="blog/{parts[1].rsplit("/", 1)[-1]}.html"'
    replace_text(ROOT / "en" / "blog.html", index_changes)

    # Rename only after every reference points to the new filename.
    for old, new in routes.items():
        if old != new:
            (ROOT / old).rename(ROOT / new)
    for path in [ROOT / "blog.html", ROOT / "en" / "blog.html", *ROOT.glob("blog/*.html"), *(ROOT / "en" / "blog").glob("*.html")]:
        strip_public_comments(path)
    for pair in pairs:
        pt_path = ROOT / pair["pt-BR"]
        en_path = ROOT / pair["en"]
        pt_url = f"https://francielesofiati.com/blog/{pt_path.stem}"
        en_url = f"https://francielesofiati.com/en/blog/{en_path.stem}"
        normalize_language_metadata(pt_path, "pt-BR", pt_url, en_url)
        localize_portuguese_links(pt_path)
        normalize_language_metadata(en_path, "en", en_url, pt_url)
        replace_text(pt_path, {"https://francielesofiati.com/journal": "https://francielesofiati.com/blog"})
        replace_text(en_path, {"https://francielesofiati.com/journal": "https://francielesofiati.com/en/blog"})
    replace_text(ROOT / "blog.html", {"https://francielesofiati.com/journal": "https://francielesofiati.com/blog"})
    replace_text(ROOT / "en" / "blog.html", {"https://francielesofiati.com/journal": "https://francielesofiati.com/en/blog"})
    print(f"Normalized {len(routes)} English Journal routes; {sum(old != new for old, new in routes.items())} renamed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
