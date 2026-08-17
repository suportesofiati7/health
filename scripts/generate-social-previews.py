#!/usr/bin/env python3
"""Create branded 1200×630 share previews for service and Journal pages.

Each preview starts with that page's first editorial photograph, rather than a
generic stock image.  It is then cropped, toned and labelled for legible social
sharing.  The script also updates the matching Open Graph and Twitter metadata.
"""
from __future__ import annotations

from pathlib import Path
from urllib.parse import urlparse
import sys

from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://www.francielesofiati.com/"
OUTPUT = ROOT / "assets" / "social" / "content-pages"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def cover(source: Image.Image) -> Image.Image:
    source = source.convert("RGB")
    scale = max(1200 / source.width, 630 / source.height)
    size = (round(source.width * scale), round(source.height * scale))
    source = source.resize(size, Image.Resampling.LANCZOS)
    left, top = (source.width - 1200) // 2, (source.height - 630) // 2
    return source.crop((left, top, left + 1200, top + 630))


def wrapped(draw: ImageDraw.ImageDraw, text: str, limit: int, label_font):
    words, lines, current = text.split(), [], ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textlength(candidate, font=label_font) <= limit:
            current = candidate
        else:
            lines.append(current); current = word
    if current: lines.append(current)
    return lines[:3]


def update_meta(soup: BeautifulSoup, property_name: str, content: str, attribute: str = "property"):
    tag = soup.find("meta", attrs={attribute: property_name})
    if tag is None:
        tag = soup.new_tag("meta"); tag[attribute] = property_name; soup.head.append(tag)
    tag["content"] = content


requested = {Path(value).name for value in sys.argv[1:]}
pages = sorted([*ROOT.glob("servicos/*.html"), *ROOT.glob("blog/*.html")])
for page in pages:
    if requested and page.name not in requested:
        continue
    soup = BeautifulSoup(page.read_text(encoding="utf-8"), "html.parser")
    title_tag = soup.find("title")
    hero = soup.select_one(".sja-hero__feature img")
    if title_tag is None or hero is None or not hero.get("src"):
        continue
    title = title_tag.get_text(" ", strip=True).removesuffix(" | Franciele Sofiati")
    source = (page.parent / hero["src"]).resolve()
    if not source.is_file():
        raise FileNotFoundError(source)
    slug = page.stem
    destination = OUTPUT / page.parent.name / f"{slug}.png"
    destination.parent.mkdir(parents=True, exist_ok=True)

    image = cover(Image.open(source)).filter(ImageFilter.GaussianBlur(radius=.25))
    image = ImageEnhance.Color(image).enhance(.76)
    overlay = Image.new("RGBA", image.size, (20, 38, 29, 0))
    gradient = ImageDraw.Draw(overlay)
    for x in range(1200):
        alpha = int(206 * (1 - x / 1200) ** .75 + 32)
        gradient.line((x, 0, x, 630), fill=(20, 38, 29, alpha))
    image = Image.alpha_composite(image.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(image)
    draw.text((72, 78), "FRANCIELE SOFIATI  ·  LONDRINA", font=font(FONT_BOLD, 22), fill=(236, 213, 173))
    y = 150
    for line in wrapped(draw, title, 720, font(FONT_BOLD, 56)):
        draw.text((72, y), line, font=font(FONT_BOLD, 56), fill=(255, 253, 247), spacing=8)
        y += 68
    draw.rectangle((72, 540, 340, 544), fill=(236, 213, 173))
    draw.text((72, 564), "Conteúdo educativo · avaliação individual", font=font(FONT, 19), fill=(255, 253, 247))
    image.convert("RGB").save(destination, "PNG", optimize=True)

    public = ORIGIN + destination.relative_to(ROOT).as_posix()
    alt = f"{title}: conteúdo de Franciele Sofiati em Londrina."
    update_meta(soup, "og:image", public)
    update_meta(soup, "og:image:secure_url", public)
    update_meta(soup, "og:image:type", "image/png")
    update_meta(soup, "og:image:width", "1200")
    update_meta(soup, "og:image:height", "630")
    update_meta(soup, "og:image:alt", alt)
    update_meta(soup, "twitter:image", public, "name")
    update_meta(soup, "twitter:image:alt", alt, "name")
    page.write_text(str(soup), encoding="utf-8")

print("Created and linked branded social previews for service and Journal pages.")
