#!/usr/bin/env python3
"""Report image assets not directly referenced by the source site.

This intentionally does not delete files.  It gives an auditable, exact list
first, including the pages/scripts that reference every retained asset.  Dynamic
asset paths are reported separately for manual review before any removal.
"""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
REPORT = ROOT / "reports" / "assets" / "reference-audit.json"
IMAGE_SUFFIXES = {".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"}
TEXT_SUFFIXES = {".css", ".html", ".js", ".json", ".md", ".mjs", ".py", ".xml"}
SKIP_PARTS = {".git", "node_modules", "dist", ".cache", "assets"}
REFERENCE = re.compile(r"(?<![\w.-])(?:\.\./|/)?(assets/[A-Za-z0-9_./-]+\.[A-Za-z0-9]+)")

assets = {
    path.relative_to(ROOT).as_posix()
    for path in ASSETS.rglob("*")
    if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES
}
references: dict[str, list[str]] = defaultdict(list)
dynamic_mentions: list[str] = []

for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
        continue
    if any(part in SKIP_PARTS for part in path.relative_to(ROOT).parts):
        continue
    relative = path.relative_to(ROOT).as_posix()
    text = path.read_text(encoding="utf-8", errors="ignore")
    for match in REFERENCE.finditer(text):
        candidate = match.group(1)
        if candidate in assets:
            references[candidate].append(relative)
    if "assets/" in text and ("${" in text or "{slug}" in text or "{article[" in text):
        dynamic_mentions.append(relative)

unused = sorted(assets - set(references))
report = {
    "summary": {
        "image_assets": len(assets),
        "directly_referenced": len(references),
        "unreferenced_candidates": len(unused),
    },
    "unreferenced_candidates": unused,
    "referenced_assets": {asset: sorted(paths) for asset, paths in sorted(references.items())},
    "files_with_dynamic_asset_paths_for_review": sorted(set(dynamic_mentions)),
}
REPORT.parent.mkdir(parents=True, exist_ok=True)
REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"Asset audit: {len(assets)} image assets; {len(references)} directly referenced; {len(unused)} removal candidates.")
print(f"Report: {REPORT}")
