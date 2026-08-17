#!/usr/bin/env python3
"""Download distinct licensed Pixabay editorial images for treatment pages.

Usage: PIXABAY_API_KEY=... python3 scripts/download-pixabay-service-images.py
The key is deliberately read only from the environment and is never written.
"""
from __future__ import annotations
import json, os, re, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "assets" / "services" / "editorial"
RECORDS = ROOT / "data" / "service-image-sources.json"
KEY = os.environ.get("PIXABAY_API_KEY")
if not KEY: raise SystemExit("PIXABAY_API_KEY is required")

slug_data = ROOT / "data" / "all-treatment-slugs.json"
if slug_data.exists():
    slugs = json.loads(slug_data.read_text())["slugs"]
else:
    titles = re.findall(r'title:\s*"([^"]+)"\s*,\s*image:\s*"[^"]+"\s*,\s*alt:\s*"[^"]+"\s*,\s*summary:', (ROOT / "tratamentos.html").read_text(encoding="utf-8"), re.S)
    def slugify(value: str) -> str:
        return re.sub(r"[^a-z0-9]+", "-", value.lower().translate(str.maketrans("áàãâéêíóôõúç", "aaaaeeiooouc"))).strip("-")
    slugs = [slugify(title) for title in titles]
def query_for(slug: str, number: int) -> str:
    if any(token in slug for token in ("lightsheer", "pelos", "laser")):
        base = "laser hair removal clinic"
    elif any(token in slug for token in ("peeling", "limpeza", "microdermoabrasao", "despigmentacao")):
        base = "facial skin treatment clinic"
    elif any(token in slug for token in ("toxina", "ultraformer", "radiofrequencia", "plasma")):
        base = "facial aesthetics consultation"
    elif any(token in slug for token in ("mesoterapia", "microinfusao")):
        base = "scalp hair treatment clinic"
    elif "microagulhamento" in slug:
        base = "microneedling facial treatment"
    elif "microvasos" in slug:
        base = "leg skin clinic consultation"
    else:
        base = "aesthetic clinic consultation"
    accents = ("professional", "woman clinic", "beauty care")
    return f"{base} {accents[number]}"
records = json.loads(RECORDS.read_text(encoding="utf-8")) if RECORDS.exists() else {}
used: set[int] = {image["id"] for images in records.values() for image in images}
start = int(os.environ.get("PIXABAY_START", "0")); limit = int(os.environ.get("PIXABAY_MAX_PAGES", str(len(slugs))))
TARGET.mkdir(parents=True, exist_ok=True)
for index, slug in enumerate(slugs[start:start + limit], start=start):
    if slug in records and len(records[slug]) == 3:
        continue
    images = []
    for number in range(3):
        query = query_for(slug, number)
        params = urllib.parse.urlencode({"key": KEY, "q": query, "image_type": "photo", "safesearch": "true", "per_page": 200, "order": "popular"})
        with urllib.request.urlopen(f"https://pixabay.com/api/?{params}", timeout=30) as response:
            hits = json.load(response).get("hits", [])
        hit = next((item for item in hits if item.get("id") not in used), None)
        if not hit: raise RuntimeError(f"Pixabay did not return a new image for {slug}")
        used.add(hit["id"])
        image_url = hit.get("webformatURL") or hit["largeImageURL"]
        suffix = Path(urllib.parse.urlparse(image_url).path).suffix or ".jpg"
        destination = TARGET / f"{slug}-{number + 1}{suffix}"
        request = urllib.request.Request(image_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(request, timeout=30) as response:
            destination.write_bytes(response.read())
        images.append({"file": destination.relative_to(ROOT).as_posix(), "id": hit["id"], "pageURL": hit["pageURL"], "tags": hit.get("tags", "")})
    records[slug] = images
    RECORDS.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
RECORDS.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
