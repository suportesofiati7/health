#!/usr/bin/env python3
"""Normalize public HTML metadata after retiring translated site routes."""
from __future__ import annotations

import json
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent


def visit(value):
    if isinstance(value, dict):
        for key, child in list(value.items()):
            if key == "inLanguage":
                value[key] = "pt-BR"
            else:
                visit(child)
    elif isinstance(value, list):
        for child in value:
            visit(child)


for path in [*ROOT.glob("*.html"), *(ROOT / "blog").glob("*.html"), *(ROOT / "servicos").glob("*.html")]:
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    soup.html["lang"] = "pt-BR"
    for link in soup.select('link[rel="alternate"][hreflang]'):
        link.decompose()
    for script in soup.select('script[type="application/ld+json"]'):
        try:
            payload = json.loads(script.string or "")
        except json.JSONDecodeError:
            continue
        visit(payload)
        script.string = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    path.write_text(str(soup).rstrip() + "\n", encoding="utf-8")
