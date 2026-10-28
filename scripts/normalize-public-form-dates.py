#!/usr/bin/env python3
"""Use Brazilian day/month/year entry fields on the public intake form."""
from pathlib import Path

path = Path(__file__).resolve().parent.parent / "formulario.html"
source = path.read_text(encoding="utf-8")
for field in ("birth-date", "appointment-date"):
    old = f'id="{field}"'
    start = source.index(old)
    end = source.index("/>", start) + 2
    tag = source[start - source[:start][::-1].index("<"):end]
    tag = tag.replace('type="date"', 'type="text" inputmode="numeric" placeholder="dd/mm/aaaa" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"')
    source = source[:start - source[:start][::-1].index("<")] + tag + source[end:]
path.write_text(source, encoding="utf-8")
