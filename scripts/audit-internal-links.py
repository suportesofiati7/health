#!/usr/bin/env python3
"""Create a repeatable internal-link and indexability audit for the static site.

This report deliberately inspects only canonical indexable pages from sitemap.xml.
Run it after every content or navigation change:
    python3 scripts/audit-internal-links.py
"""

from __future__ import annotations

import csv
import re
import xml.etree.ElementTree as ET
from collections import Counter, deque
from pathlib import Path
from urllib.parse import unquote, urlparse

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://francielesofiati.com"
REPORT_DIR = ROOT / "reports" / "seo"
SITEMAP_NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


def route_for_path(path: Path) -> str:
    value = path.relative_to(ROOT).as_posix()
    if value == "index.html":
        return "/"
    if value == "en/index.html":
        return "/en/"
    return "/" + value.removesuffix(".html")


def path_for_route(route: str) -> Path | None:
    clean = route.split("#", 1)[0].split("?", 1)[0].strip("/")
    if not clean:
        return ROOT / "index.html"
    if clean == "en":
        return ROOT / "en" / "index.html"
    candidate = ROOT / clean
    if candidate.is_file():
        return candidate
    html = candidate.with_suffix(".html")
    return html if html.is_file() else None


def canonical_pages() -> dict[str, Path]:
    tree = ET.parse(ROOT / "sitemap.xml")
    pages: dict[str, Path] = {}
    for location in tree.findall("sm:url/sm:loc", SITEMAP_NS):
        url = (location.text or "").rstrip("/") or ORIGIN
        parsed = urlparse(url)
        local = path_for_route(parsed.path)
        if local:
            pages[url] = local
    return pages


def internal_destination(source: Path, href: str) -> tuple[str | None, str]:
    parsed = urlparse(href)
    if parsed.scheme and (parsed.scheme != "https" or parsed.netloc != urlparse(ORIGIN).netloc):
        return None, "external"
    if parsed.netloc and parsed.netloc != urlparse(ORIGIN).netloc:
        return None, "external"
    if parsed.netloc and parsed.netloc == urlparse(ORIGIN).netloc:
        local = path_for_route(unquote(parsed.path))
    elif href.startswith("/"):
        local = path_for_route(unquote(parsed.path))
    else:
        local = (source.parent / unquote(parsed.path or "")).resolve() if parsed.path else source
        if local.is_dir():
            local = local / "index.html"
        if not local.is_file() and not local.suffix:
            local = local.with_suffix(".html")
    if local and local.exists():
        return (ORIGIN + route_for_path(local)).rstrip("/") or ORIGIN, "internal"
    return None, "broken"


def link_kind(tag) -> str:
    parents = " ".join(
        " ".join(str(value) for value in parent.get("class", []))
        for parent in tag.parents
        if getattr(parent, "attrs", None)
    )
    if "sf-breadcrumbs" in parents:
        return "breadcrumb"
    if tag.find_parent("header") or tag.find_parent("footer") or "nav" in parents:
        return "navigational"
    return "contextual"


def click_depth(pages: dict[str, Path], graph: dict[str, set[str]]) -> dict[str, int | None]:
    home = ORIGIN
    depth: dict[str, int | None] = {url: None for url in pages}
    depth[home] = 0
    queue: deque[str] = deque([home])
    while queue:
        source = queue.popleft()
        for destination in graph.get(source, set()):
            if destination in depth and depth[destination] is None:
                depth[destination] = (depth[source] or 0) + 1
                queue.append(destination)
    return depth


def main() -> None:
    pages = canonical_pages()
    links: list[dict[str, str]] = []
    graph: dict[str, set[str]] = {url: set() for url in pages}
    incoming: Counter[str] = Counter()
    broken: list[dict[str, str]] = []

    for source_url, source_path in pages.items():
        soup = BeautifulSoup(source_path.read_text(encoding="utf-8"), "html.parser")
        for tag in soup.find_all("a", href=True):
            href = str(tag["href"]).strip()
            if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
                continue
            destination, status = internal_destination(source_path, href)
            if status == "external":
                continue
            anchor = " ".join(tag.stripped_strings)
            rel = " ".join(tag.get("rel", [])) or "follow"
            item = {
                "source_page": source_url,
                "destination_page": destination or href,
                "anchor_text": anchor,
                "status": "200" if status == "internal" else "broken",
                "rel": rel,
                "type": link_kind(tag),
            }
            links.append(item)
            if status == "internal" and destination in pages:
                graph[source_url].add(destination)
                incoming[destination] += 1
            elif status == "broken":
                broken.append(item)

    depth = click_depth(pages, graph)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    with (REPORT_DIR / "internal-links.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["source_page", "destination_page", "anchor_text", "status", "rel", "type"])
        writer.writeheader()
        writer.writerows(links)

    page_rows = []
    for url in sorted(pages):
        page_rows.append((url, incoming[url], depth[url], "yes" if incoming[url] == 0 and url != ORIGIN else "no"))
    with (REPORT_DIR / "internal-link-pages.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["page", "incoming_internal_links", "click_depth_from_home", "orphan"])
        writer.writerows(page_rows)

    underlinked = [row for row in page_rows if row[1] < 2 and row[0] != ORIGIN]
    report = [
        "# Internal-link audit",
        "",
        "Generated from the canonical URLs in `sitemap.xml`; run `python3 scripts/audit-internal-links.py` after changes.",
        "",
        f"- Canonical indexable pages: {len(pages)}",
        f"- Crawlable internal links: {sum(1 for item in links if item['status'] == '200')}",
        f"- Broken internal links: {len(broken)}",
        f"- Orphan pages: {sum(1 for row in page_rows if row[3] == 'yes')}",
        f"- Underlinked pages (<2 internal links): {len(underlinked)}",
        "",
        "## Files",
        "",
        "- `internal-links.csv`: source, destination, descriptive anchor, status, rel and link type.",
        "- `internal-link-pages.csv`: incoming-link totals, click depth and orphan flag.",
        "",
    ]
    if broken:
        report.extend(["## Broken internal links", ""])
        report.extend(f"- `{item['source_page']}` → `{item['destination_page']}`" for item in broken)
        report.append("")
    if underlinked:
        report.extend(["## Underlinked pages", ""])
        report.extend(f"- `{url}` ({count} incoming links; depth {page_depth})" for url, count, page_depth, _ in underlinked)
        report.append("")
    (REPORT_DIR / "internal-link-audit.md").write_text("\n".join(report), encoding="utf-8")


if __name__ == "__main__":
    main()
