#!/usr/bin/env python3
"""Apply the verified practice location to every public business schema."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCATION = json.loads((ROOT / "data" / "business-location.json").read_text(encoding="utf-8"))
SCRIPT_PATTERN = re.compile(r'(<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)', re.I | re.S)


def is_business(value: object) -> bool:
    if not isinstance(value, dict):
        return False
    kinds = value.get("@type", [])
    return "HealthAndBeautyBusiness" in (kinds if isinstance(kinds, list) else [kinds])


def enrich(value: object) -> bool:
    if not isinstance(value, dict):
        return False
    changed = False
    nodes = value.get("@graph", [value])
    if not isinstance(nodes, list):
        nodes = [value]
    for node in nodes:
        if not is_business(node):
            continue
        node["telephone"] = LOCATION["telephone"]
        node["address"] = LOCATION["address"]
        node["hasMap"] = LOCATION["mapUrl"]
        node["openingHoursSpecification"] = LOCATION["openingHoursSpecification"]
        changed = True
    return changed


def replace(match: re.Match[str]) -> str:
    try:
        schema = json.loads(match.group(2))
    except json.JSONDecodeError:
        return match.group(0)
    if not enrich(schema):
        return match.group(0)
    return f"{match.group(1)}{json.dumps(schema, ensure_ascii=False, separators=(',', ':'))}{match.group(3)}"


def public_pages() -> list[Path]:
    globs = ("*.html", "en/*.html", "en/blog/*.html", "blog/*.html", "servicos/*.html")
    return sorted({path for pattern in globs for path in ROOT.glob(pattern) if path.is_file()})


def main() -> None:
    changed = 0
    for path in public_pages():
        original = path.read_text(encoding="utf-8")
        updated = SCRIPT_PATTERN.sub(replace, original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed += 1
    print(f"Updated verified location schema on {changed} pages.")


if __name__ == "__main__":
    main()
