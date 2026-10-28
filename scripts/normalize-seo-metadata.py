#!/usr/bin/env python3
"""Editorially conservative metadata cleanup using each page's existing copy."""

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]

def normalize(value: str) -> str:
    return " ".join(value.split())

def sentence_parts(value: str) -> list[str]:
    return [part.strip() for part in re.split(r"(?<=[.!?])\s+", normalize(value)) if part.strip()]

def fit_description(value: str, maximum: int = 170) -> str:
    words = value.split()
    result = ""
    for word in words:
        candidate = f"{result} {word}".strip()
        if len(candidate) > maximum:
            break
        result = candidate
    if not result:
        return value[: maximum - 1].rsplit(" ", 1)[0].rstrip(" ,:;–-") + "…"
    if len(result) < len(value) and result[-1] not in ".!?…":
        if len(result) >= maximum:
            result = result[: maximum - 1].rsplit(" ", 1)[0].rstrip(" ,:;–-")
        result = result.rstrip(" ,:;–-") + "…"
    return result

def compact_description(description: str, visible_copy: list[str]) -> str:
    parts = sentence_parts(description)
    selected = ""
    for part in parts:
        candidate = f"{selected} {part}".strip()
        if len(candidate) > 170:
            break
        selected = candidate
        if len(selected) >= 120:
            break
    if not selected:
        selected = fit_description(description)
    if len(selected) < 120:
        for copy in visible_copy:
            for part in sentence_parts(copy):
                if part.casefold() in selected.casefold() or selected.casefold() in part.casefold():
                    continue
                candidate = f"{selected} {part}".strip()
                if len(candidate) > 170:
                    if len(selected) < 120:
                        selected = fit_description(candidate)
                    break
                selected = candidate
                if len(selected) >= 120:
                    break
            if len(selected) >= 120:
                break
    if len(selected) < 120:
        for copy in visible_copy:
            if len(selected) >= 120:
                break
            if copy.casefold() in selected.casefold():
                continue
            candidate = f"{selected} {copy}".strip()
            selected = candidate if len(candidate) <= 170 else fit_description(candidate)
    return selected

def compact_title(value: str) -> str:
    value = re.sub(r"\s*[|·–—-]\s*Franciele Sofiati\s*$", "", normalize(value), flags=re.I)
    if len(value) <= 70:
        return value
    prefix = value[:69].rsplit(" ", 1)[0].rstrip(" ,:;–-")
    return f"{prefix}…"

def update_schema(value):
    if isinstance(value, dict):
        type_value = value.get("@type", [])
        types = set(type_value if isinstance(type_value, list) else [type_value])
        if "WebPage" in types:
            if "name" in value:
                value["name"] = CURRENT_TITLE
            if "description" in value:
                value["description"] = CURRENT_DESCRIPTION
        if "BlogPosting" in types and "description" in value:
            value["description"] = CURRENT_DESCRIPTION
        for child in value.values():
            update_schema(child)
    elif isinstance(value, list):
        for child in value:
            update_schema(child)

def replace_meta_content(source: str, attribute: str, key: str, content: str) -> str:
    pattern = re.compile(rf"<meta\b(?=[^>]*\b{attribute}=[\"']{re.escape(key)}[\"'])[^>]*>", re.I)
    match = pattern.search(source)
    if not match:
        return source
    tag = match.group(0)
    content_pattern = re.compile(r"\bcontent=(['\"]).*?\1", re.I)
    changed, count = content_pattern.subn(f'content="{html.escape(content, quote=True)}"', tag, count=1)
    return source[:match.start()] + changed + source[match.end():] if count else source

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Write the reviewed metadata updates.")
    args = parser.parse_args()
    global CURRENT_TITLE, CURRENT_DESCRIPTION
    candidates = sorted({*ROOT.glob("*.html"), *(ROOT / "blog").glob("*.html"), *(ROOT / "servicos").glob("*.html")})
    changes = []
    for path in candidates:
        source = path.read_text(encoding="utf-8")
        soup = BeautifulSoup(source, "html.parser")
        robots = soup.find("meta", attrs={"name": re.compile(r"^robots$", re.I)})
        if robots and "noindex" in normalize(str(robots.get("content", ""))).casefold():
            continue
        title_node = soup.find("title")
        description_node = soup.find("meta", attrs={"name": "description"})
        if not title_node or not description_node:
            continue
        old_title = normalize(title_node.get_text(" ", strip=True))
        old_description = normalize(str(description_node.get("content", "")))
        if not old_title or not old_description:
            continue
        intro = []
        for selector in (".sja-standfirst", ".sf-lede", ".sf-hero-copy p:not(.sf-eyebrow)", "main p"):
            for node in soup.select(selector):
                text = normalize(node.get_text(" ", strip=True))
                if len(text) >= 35 and text.casefold() not in old_description.casefold():
                    intro.append(text)
                    if len(intro) >= 5:
                        break
            if len(intro) >= 5:
                break
        new_title = compact_title(old_title) if len(old_title) > 70 else old_title
        new_description = compact_description(old_description, intro) if not 120 <= len(old_description) <= 170 else old_description
        if new_title == old_title and new_description == old_description:
            continue
        CURRENT_TITLE, CURRENT_DESCRIPTION = new_title, new_description
        updated = re.sub(r"(<title\b[^>]*>).*?(</title>)", lambda m: m.group(1) + html.escape(new_title) + m.group(2), source, count=1, flags=re.I | re.S)
        updated = replace_meta_content(updated, "name", "description", new_description)
        updated = replace_meta_content(updated, "property", "og:title", new_title)
        updated = replace_meta_content(updated, "property", "og:description", new_description)
        updated = replace_meta_content(updated, "name", "twitter:title", new_title)
        updated = replace_meta_content(updated, "name", "twitter:description", new_description)
        blocks = re.compile(r"(<script\b[^>]*type=[\"']application/ld\+json[\"'][^>]*>)(.*?)(</script>)", re.I | re.S)
        def change_json(match):
            try:
                schema = json.loads(match.group(2))
            except json.JSONDecodeError:
                return match.group(0)
            update_schema(schema)
            return match.group(1) + json.dumps(schema, ensure_ascii=False, separators=(",", ":")) + match.group(3)
        updated = blocks.sub(change_json, updated)
        changes.append((path, old_title, new_title, old_description, new_description, updated))
    print(f"Metadata changes prepared: {len(changes)}")
    for path, old_title, new_title, old_description, new_description, _ in changes:
        print(f"{path.relative_to(ROOT)}: title {len(old_title)}→{len(new_title)}, description {len(old_description)}→{len(new_description)}")
    if args.apply:
        for path, _, _, _, _, updated in changes:
            path.write_text(updated, encoding="utf-8")
        print("Applied updates from existing page titles, descriptions and visible introductory copy.")
    else:
        print("Dry run only. Pass --apply to write these metadata changes.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
