"""HTML-aware extraction and reconstruction for Portuguese output."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path
from typing import Any, Callable, Iterable
from urllib.parse import urlparse

from bs4 import BeautifulSoup, Comment, NavigableString, Tag


DOMAIN = "https://www.francielesofiati.com"
SKIP_TAGS = {"script", "style", "svg", "code", "pre", "noscript", "template"}
TEXT_ATTRIBUTES = {
    "alt", "aria-description", "aria-label", "aria-placeholder", "placeholder", "title",
    "data-label-close", "data-label-open", "data-tooltip",
}
META_KEYS = {
    ("name", "description"),
    ("name", "twitter:title"),
    ("name", "twitter:description"),
    ("property", "og:title"),
    ("property", "og:description"),
}
JSON_TEXT_KEYS = {"caption", "description", "headline", "jobTitle", "name", "text"}
JSON_NON_TEXT_KEYS = {
    "@context", "@id", "@type", "contentUrl", "email", "image", "item", "logo",
    "mainEntityOfPage", "sameAs", "telephone", "thumbnailUrl", "url",
}


def digest(value: str) -> str:
    return sha256(value.encode("utf-8")).hexdigest()


def normalized(value: str) -> str:
    return " ".join(value.replace("\xa0", " ").split())


def contains_words(value: str) -> bool:
    return bool(re.search(r"[A-Za-zÀ-ÿ]", value))


@dataclass(frozen=True)
class TranslationBlock:
    key: str
    source: str
    kind: str

    @property
    def source_hash(self) -> str:
        return digest(self.source)


@dataclass
class BlockTarget:
    block: TranslationBlock
    set_value: Callable[[str], None]


def _segment(tag: Tag) -> str:
    siblings = [item for item in tag.parent.find_all(tag.name, recursive=False)] if isinstance(tag.parent, Tag) else [tag]
    return f"{tag.name}[{siblings.index(tag) + 1}]"


def element_locator(tag: Tag) -> str:
    if tag.name == "meta":
        for attribute in ("name", "property", "http-equiv", "charset"):
            if tag.get(attribute):
                return f"meta[{attribute}={tag.get(attribute)}]"
    if tag.name == "link" and tag.get("hreflang"):
        return f"link[hreflang={tag.get('hreflang')}]"
    if tag.get("id"):
        return f"id:{tag['id']}"

    parts: list[str] = []
    current: Tag | None = tag
    while current is not None and current.name != "[document]":
        if current.get("id"):
            parts.append(f"id:{current['id']}")
            break
        parts.append(_segment(current))
        current = current.parent if isinstance(current.parent, Tag) else None
    return "/".join(reversed(parts))


def _direct_text_nodes(tag: Tag) -> list[NavigableString]:
    return [
        child
        for child in tag.contents
        if isinstance(child, NavigableString)
        and not isinstance(child, Comment)
        and normalized(str(child))
    ]


def _is_translatable_element(tag: Tag) -> bool:
    if tag.name in SKIP_TAGS:
        return False
    if tag.find_parent(SKIP_TAGS):
        return False
    if tag.get("translate") == "no" or tag.find_parent(attrs={"translate": "no"}):
        return False
    return True


def _text_target(tag: Tag, node: NavigableString, index: int) -> BlockTarget:
    raw = str(node)
    source = normalized(raw)
    leading = raw[: len(raw) - len(raw.lstrip())]
    trailing = raw[len(raw.rstrip()) :]
    key = f"text:{element_locator(tag)}:{index}"

    def setter(value: str, target: NavigableString = node) -> None:
        target.replace_with(f"{leading}{value}{trailing}")

    return BlockTarget(TranslationBlock(key, source, "text"), setter)


def _attribute_target(tag: Tag, attribute: str) -> BlockTarget:
    source = normalized(str(tag.get(attribute, "")))
    key = f"attr:{element_locator(tag)}:{attribute}"

    def setter(value: str, target: Tag = tag, name: str = attribute) -> None:
        target[name] = value

    return BlockTarget(TranslationBlock(key, source, f"attribute:{attribute}"), setter)


def _json_path(path: Iterable[str | int]) -> str:
    return "/".join(str(item).replace("/", "~1") for item in path)


def _json_targets(script: Tag, script_index: int) -> tuple[list[BlockTarget], dict[str, Any]]:
    try:
        data = json.loads(script.string or "")
    except (TypeError, json.JSONDecodeError):
        return [], {}
    targets: list[BlockTarget] = []

    def visit(node: Any, path: list[str | int], parent: Any = None, slot: Any = None) -> None:
        if isinstance(node, dict):
            for key, value in node.items():
                if key in JSON_NON_TEXT_KEYS:
                    continue
                if key in JSON_TEXT_KEYS and isinstance(value, str) and contains_words(value):
                    block_key = f"jsonld:{script_index}:{_json_path([*path, key])}"

                    def setter(translated: str, container: dict[str, Any] = node, name: str = key) -> None:
                        container[name] = translated

                    targets.append(BlockTarget(TranslationBlock(block_key, normalized(value), f"jsonld:{key}"), setter))
                else:
                    visit(value, [*path, key], node, key)
        elif isinstance(node, list):
            for index, value in enumerate(node):
                visit(value, [*path, index], node, index)

    visit(data, [])
    return targets, data


def collect_targets(soup: BeautifulSoup) -> tuple[list[BlockTarget], list[tuple[Tag, dict[str, Any]]]]:
    targets: list[BlockTarget] = []
    json_documents: list[tuple[Tag, dict[str, Any]]] = []

    for tag in soup.find_all(True):
        if not _is_translatable_element(tag):
            continue
        for index, node in enumerate(_direct_text_nodes(tag)):
            source = normalized(str(node))
            if contains_words(source):
                targets.append(_text_target(tag, node, index))

        attributes = set(TEXT_ATTRIBUTES)
        if tag.name == "meta" and any(tag.get(a) == v for a, v in META_KEYS):
            attributes.add("content")
        if tag.name == "input" and tag.get("type") in {"button", "reset", "submit"}:
            attributes.add("value")
        for attribute in sorted(attributes):
            value = tag.get(attribute)
            if isinstance(value, str) and contains_words(value):
                targets.append(_attribute_target(tag, attribute))

    for index, script in enumerate(soup.find_all("script", attrs={"type": "application/ld+json"})):
        script_targets, data = _json_targets(script, index)
        targets.extend(script_targets)
        json_documents.append((script, data))
    return targets, json_documents


def extract_blocks(html_text: str) -> dict[str, TranslationBlock]:
    soup = BeautifulSoup(html_text, "html.parser")
    targets, _ = collect_targets(soup)
    blocks: dict[str, TranslationBlock] = {}
    for target in targets:
        if target.block.key in blocks:
            raise ValueError(f"Duplicate translation block key: {target.block.key}")
        blocks[target.block.key] = target.block
    return blocks


def en_url(page: str) -> str:
    return f"{DOMAIN}/" if page == "index.html" else f"{DOMAIN}/{page}"


def pt_url(page: str) -> str:
    return f"{DOMAIN}/pt/" if page == "index.html" else f"{DOMAIN}/pt/{page}"


def _is_external(value: str) -> bool:
    parsed = urlparse(value)
    return bool(parsed.scheme or parsed.netloc or value.startswith(("#", "data:", "javascript:")))


def _prefix_page_asset(value: str) -> str:
    if _is_external(value) or value.startswith("../") or value.startswith("/"):
        return value
    if value.startswith(("assets/", "css/", "js/", "partials/", "data/", "journal/")) or value in {"favicon.ico", "site.webmanifest"}:
        return f"../{value}"
    return value


def _localize_partial_references(soup: BeautifulSoup) -> None:
    """Make generated partial references resolve from a page inside /pt/."""
    for tag in soup.find_all(True):
        for attribute in ("href", "poster", "src"):
            value = tag.get(attribute)
            if isinstance(value, str) and value.startswith("assets/"):
                tag[attribute] = f"../{value}"
        if isinstance(tag.get("srcset"), str):
            candidates = []
            for candidate in tag["srcset"].split(","):
                pieces = candidate.strip().split()
                if pieces:
                    source = f"../{pieces[0]}" if pieces[0].startswith("assets/") else pieces[0]
                    candidates.append(" ".join([source, *pieces[1:]]))
            tag["srcset"] = ", ".join(candidates)

    for link in soup.find_all("a", attrs={"data-lang": True}):
        language = str(link.get("data-lang"))
        if language == "en":
            link["href"] = "../index.html"
        elif language in {"pt", "pt-BR"}:
            link["href"] = "index.html"


def _localize_json_urls(data: Any, page: str) -> None:
    english_page = en_url(page)
    portuguese_page = pt_url(page)
    english_home = en_url("index.html")
    portuguese_home = pt_url("index.html")

    def visit(node: Any) -> None:
        if isinstance(node, dict):
            types = node.get("@type")
            type_values = {types} if isinstance(types, str) else set(types or []) if isinstance(types, list) else set()
            if type_values & {"WebPage", "FAQPage", "ContactPage", "AboutPage"}:
                for key in ("url", "mainEntityOfPage"):
                    if key in node:
                        node[key] = portuguese_page
                if isinstance(node.get("@id"), str) and node["@id"].startswith(english_page):
                    node["@id"] = node["@id"].replace(english_page, portuguese_page, 1)
                node["inLanguage"] = "pt-BR"
            if "BreadcrumbList" in type_values:
                for item in node.get("itemListElement", []):
                    if not isinstance(item, dict):
                        continue
                    if item.get("position") == 1:
                        item["item"] = portuguese_home
                    else:
                        item["item"] = portuguese_page
            for key, value in list(node.items()):
                if key == "inLanguage" and value == "en":
                    node[key] = "pt-BR"
                elif isinstance(value, str):
                    if value == english_page:
                        node[key] = portuguese_page
                    elif value == english_home and key == "item":
                        node[key] = portuguese_home
                else:
                    visit(value)
        elif isinstance(node, list):
            for value in node:
                visit(value)

    visit(data)


def render_portuguese_html(
    source_html: str,
    translations: dict[str, str],
    page: str,
    *,
    partial: bool = False,
) -> str:
    soup = BeautifulSoup(source_html, "html.parser")
    targets, json_documents = collect_targets(soup)
    for target in targets:
        value = translations.get(target.block.key)
        if value is not None:
            target.set_value(value)

    for script, data in json_documents:
        if data:
            _localize_json_urls(data, page)
            script.string = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

    if partial:
        _localize_partial_references(soup)
    else:
        if soup.html is None or soup.head is None:
            raise ValueError(f"{page}: source document is missing html/head")
        soup.html["lang"] = "pt-BR"
        soup.html["data-default-lang"] = "pt-BR"
        main = soup.find("main")
        if main is not None:
            main["aria-label"] = translations.get(
                f"attr:{element_locator(main)}:aria-label", "Conteúdo da página"
            )

        for tag in soup.find_all(True):
            for attribute in ("href", "poster", "src"):
                value = tag.get(attribute)
                if isinstance(value, str):
                    tag[attribute] = _prefix_page_asset(value)
            if isinstance(tag.get("srcset"), str):
                candidates = []
                for candidate in tag["srcset"].split(","):
                    pieces = candidate.strip().split()
                    if pieces:
                        candidates.append(" ".join([_prefix_page_asset(pieces[0]), *pieces[1:]]))
                tag["srcset"] = ", ".join(candidates)

        for link in soup.find_all("link"):
            rel = link.get("rel", [])
            if "canonical" in rel:
                link["href"] = pt_url(page)
            elif "alternate" in rel:
                language = link.get("hreflang")
                link["href"] = pt_url(page) if language == "pt-BR" else en_url(page)
        for meta in soup.find_all("meta"):
            if meta.get("property") == "og:url":
                meta["content"] = pt_url(page)
            elif meta.get("property") == "og:locale":
                meta["content"] = "pt_BR"
            elif meta.get("property") == "og:locale:alternate":
                meta["content"] = "en_US"

    return str(soup)


def structural_inventory(html_text: str) -> dict[str, Any]:
    soup = BeautifulSoup(html_text, "html.parser")
    tags = [tag.name for tag in soup.find_all(True)]
    classes = sorted({value for tag in soup.find_all(True) for value in tag.get("class", [])})
    ids = [tag["id"] for tag in soup.find_all(True) if tag.get("id")]
    return {"tags": tags, "classes": classes, "ids": ids}
