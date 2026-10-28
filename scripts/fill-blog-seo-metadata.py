#!/usr/bin/env python3
"""Fill missing blog share tags and JSON-LD from visible, maintained page data.

The script only repairs blog pages with no social metadata and no graph. It
uses each page's existing title, description, canonical, H1 and visible
breadcrumbs plus the approved site-wide social image in data/seo.json. It does
not create dates, medical claims, prices, reviews or article-specific imagery.
"""

from __future__ import annotations

import argparse
import html
import json
from pathlib import Path
import re
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
SEO = json.loads((ROOT / "data/seo.json").read_text(encoding="utf-8"))
ORIGIN = str(SEO["domain"]).rstrip("/")
SOCIAL_IMAGE = f"{ORIGIN}/{str(SEO['defaultOgImage']).lstrip('/')}"
SOCIAL_ALT = "Franciele Sofiati em Londrina, estética avançada para pele, rosto, corpo e couro cabeludo"
IMAGE_WIDTH = 1200
IMAGE_HEIGHT = 630


def canonical(route: str) -> str:
    if route == "index.html":
        return f"{ORIGIN}/"
    return f"{ORIGIN}/{route.removesuffix('.html')}"


def breadcrumb_items(soup: BeautifulSoup, page_url: str) -> list[dict[str, object]]:
    nav = soup.find("nav", attrs={"aria-label": re.compile("Navega.*estrutural", re.I)})
    items: list[dict[str, object]] = []
    if nav:
        for li in nav.select("ol > li"):
            anchor = li.find("a", href=True)
            current = li.find(attrs={"aria-current": "page"})
            label = " ".join((anchor or current or li).get_text(" ", strip=True).split())
            if not label:
                continue
            if anchor:
                target = urljoin(page_url, str(anchor["href"]))
                parsed = urlparse(target)
                if parsed.scheme == "https" and parsed.netloc == urlparse(ORIGIN).netloc:
                    route = parsed.path.lstrip("/")
                    target = canonical("index.html" if route in {"", "index.html"} else route)
            else:
                target = page_url
            items.append({
                "@type": "ListItem",
                "position": len(items) + 1,
                "name": label,
                "item": target,
            })
    if not items:
        items = [
            {"@type": "ListItem", "position": 1, "name": "Início", "item": f"{ORIGIN}/"},
            {"@type": "ListItem", "position": 2, "name": "Journal", "item": f"{ORIGIN}/blog"},
            {"@type": "ListItem", "position": 3, "name": soup.find("h1").get_text(" ", strip=True), "item": page_url},
        ]
    return items


def build_metadata(path: Path) -> tuple[list[str], str]:
    source = path.read_text(encoding="utf-8")
    soup = BeautifulSoup(source, "html.parser")
    title_tag = soup.find("title")
    description_tag = soup.find("meta", attrs={"name": "description"})
    canonical_tag = soup.find("link", rel=lambda value: value and "canonical" in value)
    heading = soup.find("h1")
    if not all((title_tag, description_tag, canonical_tag, heading)):
        raise RuntimeError(f"{path.relative_to(ROOT)} lacks title, description, canonical or H1")
    title = " ".join(title_tag.get_text(" ", strip=True).split())
    description = str(description_tag.get("content", "")).strip()
    page_url = str(canonical_tag.get("href", ""))
    if not page_url.startswith(f"{ORIGIN}/blog/"):
        raise RuntimeError(f"{path.relative_to(ROOT)} has an unexpected canonical: {page_url}")
    h1 = " ".join(heading.get_text(" ", strip=True).split())
    route = path.relative_to(ROOT).as_posix()
    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": f"{ORIGIN}/#website",
                "url": f"{ORIGIN}/",
                "name": SEO["siteName"],
                "inLanguage": "pt-BR",
                "publisher": {"@id": f"{ORIGIN}/#practice"},
            },
            {
                "@type": "Person",
                "@id": f"{ORIGIN}/#franciele",
                "name": "Franciele Sofiati",
                "url": f"{ORIGIN}/sobre",
            },
            {
                "@type": "HealthAndBeautyBusiness",
                "@id": f"{ORIGIN}/#practice",
                "name": SEO["siteName"],
                "url": f"{ORIGIN}/",
            },
            {
                "@type": "WebPage",
                "@id": f"{page_url}#webpage",
                "url": page_url,
                "name": title,
                "description": description,
                "inLanguage": "pt-BR",
                "isPartOf": {"@id": f"{ORIGIN}/#website"},
                "breadcrumb": {"@id": f"{page_url}#breadcrumb"},
                "primaryImageOfPage": {"@id": f"{SOCIAL_IMAGE}#primaryimage"},
            },
            {
                "@type": "BlogPosting",
                "@id": f"{page_url}#article",
                "url": page_url,
                "headline": h1,
                "description": description,
                "inLanguage": "pt-BR",
                "mainEntityOfPage": {"@id": f"{page_url}#webpage"},
                "author": {"@id": f"{ORIGIN}/#franciele"},
                "publisher": {"@id": f"{ORIGIN}/#practice"},
                "image": {"@id": f"{SOCIAL_IMAGE}#primaryimage"},
            },
            {
                "@type": "ImageObject",
                "@id": f"{SOCIAL_IMAGE}#primaryimage",
                "url": SOCIAL_IMAGE,
                "contentUrl": SOCIAL_IMAGE,
                "encodingFormat": "image/png",
                "width": IMAGE_WIDTH,
                "height": IMAGE_HEIGHT,
                "caption": SOCIAL_ALT,
                "representativeOfPage": True,
            },
            {
                "@type": "BreadcrumbList",
                "@id": f"{page_url}#breadcrumb",
                "itemListElement": breadcrumb_items(soup, page_url),
            },
        ],
    }
    properties = {
        "og:type": "article",
        "og:site_name": str(SEO["siteName"]),
        "og:locale": "pt_BR",
        "og:title": title,
        "og:description": description,
        "og:url": page_url,
        "og:image": SOCIAL_IMAGE,
        "og:image:secure_url": SOCIAL_IMAGE,
        "og:image:type": "image/png",
        "og:image:width": str(IMAGE_WIDTH),
        "og:image:height": str(IMAGE_HEIGHT),
        "og:image:alt": SOCIAL_ALT,
    }
    names = {
        "twitter:card": "summary_large_image",
        "twitter:title": title,
        "twitter:description": description,
        "twitter:image": SOCIAL_IMAGE,
        "twitter:image:alt": SOCIAL_ALT,
    }
    tags = [f'<meta property="{key}" content="{html.escape(value, quote=True)}">' for key, value in properties.items()]
    tags.extend(f'<meta name="{key}" content="{html.escape(value, quote=True)}">' for key, value in names.items())
    tags.append(f'<script type="application/ld+json">{json.dumps(graph, ensure_ascii=False, separators=(",", ":"))}</script>')
    if not re.search(r"</head\s*>", source, flags=re.I):
        raise RuntimeError(f"{route} has no closing head tag")
    return tags, source


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="write the safe shared metadata repair")
    args = parser.parse_args()
    social_image_path = ROOT / str(SEO["defaultOgImage"])
    if not social_image_path.is_file():
        raise RuntimeError(f"Configured social image is missing: {social_image_path}")

    candidates = 0
    changed = 0
    for path in sorted((ROOT / "blog").glob("*.html")):
        tags, source = build_metadata(path)
        soup = BeautifulSoup(source, "html.parser")
        has_social = bool(soup.find("meta", attrs={"property": "og:image"}))
        has_graph = bool(soup.select("script[type='application/ld+json']"))
        if has_social or has_graph:
            continue
        candidates += 1
        updated = re.sub(r"</head\s*>", "\n" + "\n".join(tags) + "\n</head>", source, count=1, flags=re.I)
        if updated != source:
            changed += 1
            if args.apply:
                path.write_text(updated, encoding="utf-8")

    label = "Applied" if args.apply else "Preview"
    print(f"{label}: {changed} of {candidates} blog pages are missing both the shared social image tag and JSON-LD graph.")
    if not args.apply:
        print("Run with --apply to add tags based on existing title/description/canonical/H1/breadcrumbs and the configured site social image.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
