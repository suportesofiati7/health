#!/usr/bin/env python3
"""Audit the generated Journal against its ten-article Word authority."""

from __future__ import annotations

import json
import re
import runpy
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
BUILD = runpy.run_path(str(ROOT / "scripts" / "build-journal.py"))
SITE_ORIGIN = "https://www.francielesofiati.com"


def normalise(value: str) -> str:
    return " ".join(value.replace("\u00a0", " ").split())


def canonical_text(value: str) -> str:
    return normalise(value).casefold()


@dataclass
class ParsedPage:
    source: str
    lang: str = ""
    titles: list[str] = field(default_factory=list)
    h1s: list[str] = field(default_factory=list)
    headings: list[tuple[int, str]] = field(default_factory=list)
    ids: list[str] = field(default_factory=list)
    metas: dict[str, list[str]] = field(default_factory=lambda: defaultdict(list))
    canonicals: list[str] = field(default_factory=list)
    alternates: dict[str, list[str]] = field(default_factory=lambda: defaultdict(list))
    links: list[dict[str, str]] = field(default_factory=list)
    images: list[dict[str, str]] = field(default_factory=list)
    jsonld: list[object] = field(default_factory=list)
    visible_text: str = ""
    details: int = 0


class JournalHTMLParser(HTMLParser):
    def __init__(self, source: str) -> None:
        super().__init__(convert_charrefs=True)
        self.page = ParsedPage(source=source)
        self.stack: list[str] = []
        self.hidden_depth = 0
        self.title_parts: list[str] | None = None
        self.heading_level = 0
        self.heading_parts: list[str] | None = None
        self.script_type = ""
        self.script_parts: list[str] | None = None
        self.visible_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {name: value or "" for name, value in attrs}
        self.stack.append(tag)
        if tag in {"script", "style", "template", "noscript"}:
            self.hidden_depth += 1
        if tag == "html":
            self.page.lang = attributes.get("lang", "")
        identifier = attributes.get("id")
        if identifier:
            self.page.ids.append(identifier)
        if tag == "title":
            self.title_parts = []
        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self.heading_level = int(tag[1])
            self.heading_parts = []
        if tag == "meta":
            key = attributes.get("name") or attributes.get("property")
            if key:
                self.page.metas[key.casefold()].append(attributes.get("content", ""))
        if tag == "link":
            rel = attributes.get("rel", "").casefold().split()
            if "canonical" in rel:
                self.page.canonicals.append(attributes.get("href", ""))
            if "alternate" in rel and attributes.get("hreflang"):
                self.page.alternates[attributes["hreflang"]].append(attributes.get("href", ""))
        if tag == "a":
            self.page.links.append(attributes)
        if tag == "img":
            self.page.images.append(attributes)
        if tag == "details":
            self.page.details += 1
        if tag == "script":
            self.script_type = attributes.get("type", "")
            self.script_parts = [] if self.script_type == "application/ld+json" else None

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        if tag == "title" and self.title_parts is not None:
            self.page.titles.append(normalise("".join(self.title_parts)))
            self.title_parts = None
        if self.heading_parts is not None and tag == f"h{self.heading_level}":
            text = normalise("".join(self.heading_parts))
            self.page.headings.append((self.heading_level, text))
            if self.heading_level == 1:
                self.page.h1s.append(text)
            self.heading_parts = None
            self.heading_level = 0
        if tag == "script" and self.script_parts is not None:
            raw = "".join(self.script_parts).strip()
            try:
                self.page.jsonld.append(json.loads(raw))
            except json.JSONDecodeError:
                self.page.jsonld.append({"__invalid__": raw})
            self.script_parts = None
            self.script_type = ""
        if tag in {"script", "style", "template", "noscript"}:
            self.hidden_depth = max(0, self.hidden_depth - 1)
        if self.stack:
            self.stack.pop()

    def handle_data(self, data: str) -> None:
        if self.title_parts is not None:
            self.title_parts.append(data)
        if self.heading_parts is not None:
            self.heading_parts.append(data)
        if self.script_parts is not None:
            self.script_parts.append(data)
        if not self.hidden_depth:
            self.visible_parts.append(data)

    def close(self) -> None:
        super().close()
        self.page.visible_text = normalise("".join(self.visible_parts))


def parse_page(path: Path) -> ParsedPage:
    source = path.read_text(encoding="utf-8")
    parser = JournalHTMLParser(source)
    parser.feed(source)
    parser.close()
    return parser.page


def schema_types(value: object) -> set[str]:
    found: set[str] = set()
    if isinstance(value, dict):
        raw = value.get("@type")
        if isinstance(raw, str):
            found.add(raw)
        elif isinstance(raw, list):
            found.update(item for item in raw if isinstance(item, str))
        for child in value.values():
            found.update(schema_types(child))
    elif isinstance(value, list):
        for child in value:
            found.update(schema_types(child))
    return found


def local_target(page_path: Path, value: str) -> tuple[Path | None, str]:
    parsed = urlsplit(value)
    if parsed.scheme in {"http", "https"}:
        if (parsed.hostname or "").removeprefix("www.") != "francielesofiati.com":
            return None, ""
        raw_path = unquote(parsed.path).lstrip("/")
        target = ROOT / (raw_path or "index.html")
    elif parsed.scheme or parsed.netloc or value.startswith(("mailto:", "tel:", "#")):
        return None, ""
    else:
        raw_path = unquote(parsed.path)
        if not raw_path:
            target = page_path
        elif raw_path.startswith("/"):
            target = ROOT / raw_path.lstrip("/")
        else:
            target = page_path.parent / raw_path
    if target.is_dir():
        target = target / "index.html"
    return target.resolve(), unquote(parsed.fragment)


def main() -> int:
    issues: list[str] = []
    source_articles = BUILD["parse_source"]()
    BUILD["validate_configuration"](source_articles)
    by_number = {article.config.number: article for article in source_articles}
    article_dir = ROOT / "journal"
    article_paths = sorted(article_dir.glob("*.html"))
    expected_paths = {
        article_dir / f"{article.config.slug}.html"
        for article in source_articles
    }
    if set(article_paths) != expected_paths:
        missing = sorted(path.name for path in expected_paths - set(article_paths))
        extra = sorted(path.name for path in set(article_paths) - expected_paths)
        issues.append(f"article file set differs; missing={missing}, extra={extra}")
    if len(article_paths) != 10:
        issues.append(f"expected exactly 10 article pages, found {len(article_paths)}")

    index_path = ROOT / "journal.html"
    pages: dict[Path, ParsedPage] = {}
    for path in [index_path, *article_paths]:
        if not path.is_file():
            issues.append(f"missing page: {path.relative_to(ROOT)}")
            continue
        pages[path] = parse_page(path)

    index = pages.get(index_path)
    if index:
        if index.lang != "en":
            issues.append("journal.html: html lang is not en")
        if index.h1s != ["Journal"]:
            issues.append(f"journal.html: expected one Journal H1, found {index.h1s}")
        linked_articles = {
            (index_path.parent / urlsplit(link.get("href", "")).path).resolve()
            for link in index.links
            if link.get("href", "").startswith("journal/")
        }
        if linked_articles != expected_paths:
            issues.append("journal.html: article previews do not link to the exact ten-page set")
        types = set().union(*(schema_types(document) for document in index.jsonld))
        for expected_type in {"Blog", "CollectionPage", "ItemList", "BreadcrumbList"}:
            if expected_type not in types:
                issues.append(f"journal.html: JSON-LD is missing {expected_type}")
        if '"numberOfItems":10' not in index.source:
            issues.append("journal.html: ItemList does not declare exactly ten items")

    title_values: list[str] = []
    description_values: list[str] = []
    canonical_values: list[str] = []
    for article in source_articles:
        path = article_dir / f"{article.config.slug}.html"
        page = pages.get(path)
        scope = path.relative_to(ROOT).as_posix()
        if page is None:
            continue
        if page.lang != "en":
            issues.append(f"{scope}: html lang is not en")
        if page.h1s != [article.title]:
            issues.append(f"{scope}: H1 does not exactly match the authoritative title")
        if len(page.titles) != 1:
            issues.append(f"{scope}: expected one title element")
        else:
            title_values.append(page.titles[0])
        descriptions = page.metas.get("description", [])
        if descriptions != [article.config.meta_description]:
            issues.append(f"{scope}: meta description does not match configuration")
        else:
            description_values.extend(descriptions)
        expected_canonical = f"{SITE_ORIGIN}/journal/{article.config.slug}.html"
        if page.canonicals != [expected_canonical]:
            issues.append(f"{scope}: canonical is incorrect: {page.canonicals}")
        else:
            canonical_values.extend(page.canonicals)
        if page.alternates.get("en") != [expected_canonical] or page.alternates.get("x-default") != [expected_canonical]:
            issues.append(f"{scope}: self-referencing English/x-default alternates are incorrect")
        if page.alternates.get("pt-BR"):
            issues.append(f"{scope}: claims a Portuguese article alternate that does not exist")
        for key, expected in (
            ("og:title", page.titles[0] if page.titles else ""),
            ("og:description", article.config.meta_description),
            ("og:url", expected_canonical),
            ("twitter:title", page.titles[0] if page.titles else ""),
            ("twitter:description", article.config.meta_description),
        ):
            if page.metas.get(key) != [expected]:
                issues.append(f"{scope}: {key} is missing or inconsistent")

        required_text = [
            article.title,
            article.deck,
            article.caption,
            *article.at_glance,
            *(item.text for item in article.body),
            article.faq_heading,
            *(text for pair in article.faqs for text in pair),
            article.author.name,
            *article.author.credentials,
            article.author.statement,
            article.author.bio,
            article.author.signoff,
        ]
        rendered = canonical_text(page.visible_text)
        missing_source = [text for text in required_text if text and canonical_text(text) not in rendered]
        if missing_source:
            issues.append(f"{scope}: missing {len(missing_source)} authoritative source strings: {missing_source!r}")
        if page.details != 10:
            issues.append(f"{scope}: expected 10 accessible FAQ disclosures, found {page.details}")
        if page.source.count('class="sja-related-card"') != 3:
            issues.append(f"{scope}: related reading must contain exactly three articles")
        if page.source.count('class="sja-at-glance"') != 1 or page.source.count('<li>') < 5:
            issues.append(f"{scope}: At a Glance panel is incomplete")
        if "../consultation.html" not in [link.get("href", "") for link in page.links]:
            issues.append(f"{scope}: consultation invitation does not reach consultation.html")
        if "BlogPosting" not in set().union(*(schema_types(document) for document in page.jsonld)):
            issues.append(f"{scope}: JSON-LD is missing BlogPosting")
        if re.search(r'"date(?:Published|Modified)"', page.source):
            issues.append(f"{scope}: contains an invented publication/modification date")

        eager_images = [image for image in page.images if image.get("loading") == "eager"]
        if len(eager_images) != 1 or eager_images[0].get("src") != f"../assets/posts/journal/{article.config.feature_filename}":
            issues.append(f"{scope}: exactly the principal feature image must be eager")
        for image in page.images:
            if "alt" not in image:
                issues.append(f"{scope}: image without alt attribute: {image.get('src')}")
            if not image.get("width") or not image.get("height"):
                issues.append(f"{scope}: image without intrinsic dimensions: {image.get('src')}")

    if len(set(title_values)) != 10:
        issues.append("article title elements are not all unique")
    if len(set(description_values)) != 10:
        issues.append("article meta descriptions are not all unique")
    if len(set(canonical_values)) != 10:
        issues.append("article canonical URLs are not all unique")

    all_ids: dict[Path, set[str]] = {path.resolve(): set(page.ids) for path, page in pages.items()}
    for page_path, page in pages.items():
        duplicates = [identifier for identifier, count in Counter(page.ids).items() if count > 1]
        if duplicates:
            issues.append(f"{page_path.relative_to(ROOT)}: duplicate IDs {duplicates}")
        for link in page.links:
            value = link.get("href", "")
            target, fragment = local_target(page_path, value)
            if target is None:
                continue
            try:
                target.relative_to(ROOT)
            except ValueError:
                issues.append(f"{page_path.relative_to(ROOT)}: link escapes site root: {value}")
                continue
            if not target.exists():
                issues.append(f"{page_path.relative_to(ROOT)}: broken local link: {value}")
            elif fragment and target.suffix == ".html":
                target_ids = all_ids.get(target) or set(parse_page(target).ids)
                if fragment not in target_ids:
                    issues.append(f"{page_path.relative_to(ROOT)}: missing link fragment: {value}")
        for image in page.images:
            source = image.get("src", "")
            target, _ = local_target(page_path, source)
            if target is not None and not target.exists():
                issues.append(f"{page_path.relative_to(ROOT)}: broken image: {source}")

    page_pairs_path = ROOT / "data" / "page-pairs.json"
    pairs = json.loads(page_pairs_path.read_text(encoding="utf-8"))["pages"]
    mapped = {entry.get("en") for entry in pairs}
    expected_pair_paths = {f"journal/{article.config.slug}.html" for article in source_articles}
    if not expected_pair_paths.issubset(mapped):
        issues.append("data/page-pairs.json does not map all ten Journal articles")

    sitemap_path = ROOT / "sitemap.xml"
    try:
        locations = {
            node.text or ""
            for node in ET.parse(sitemap_path).getroot().iter()
            if node.tag.endswith("}loc") or node.tag == "loc"
        }
    except (OSError, ET.ParseError) as error:
        issues.append(f"invalid sitemap.xml: {error}")
        locations = set()
    expected_canonicals = {f"{SITE_ORIGIN}/journal/{article.config.slug}.html" for article in source_articles}
    if not expected_canonicals.issubset(locations):
        issues.append("sitemap.xml does not publish all ten Journal article canonicals")

    if issues:
        print(f"Journal audit failed with {len(issues)} issue(s):", file=sys.stderr)
        for issue in issues:
            print(f"  - {issue}", file=sys.stderr)
        return 1
    print(
        "Journal audit passed: exactly 10 distinct articles; complete source content; "
        "10 previews; unique SEO; valid local links, imagery, metadata, schema, FAQs, "
        "related reading, navigation, language mapping, and sitemap coverage."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
