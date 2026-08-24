#!/usr/bin/env python3
"""Create branded 1200×630 share previews from each page's editorial image."""
from __future__ import annotations

from pathlib import Path
from urllib.parse import urlparse
import sys

from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://francielesofiati.com/"
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


def journal_cover(title: str, section: str) -> Image.Image:
    """Draw a refined, subject-coded editorial cover without photography."""
    palettes = [
        ((24, 52, 42), (111, 145, 117), (236, 213, 173)),
        ((65, 45, 36), (155, 109, 81), (236, 213, 173)),
        ((35, 53, 71), (99, 139, 154), (223, 210, 180)),
        ((68, 55, 82), (139, 120, 159), (238, 222, 190)),
        ((66, 65, 43), (151, 149, 95), (239, 219, 176)),
    ]
    background, accent, gold = palettes[sum(map(ord, section)) % len(palettes)]
    image = Image.new("RGB", (1600, 900), background)
    art = ImageDraw.Draw(image, "RGBA")
    # Layered arcs provide visual depth while staying quiet enough for the title.
    for size, alpha, offset in ((1130, 46, 0), (872, 64, 104), (615, 82, 214)):
        bounds = (1050 + offset, -160 + offset // 2, 1050 + offset + size, -160 + offset // 2 + size)
        art.arc(bounds, 105, 288, fill=(*accent, alpha), width=24)
    art.ellipse((1240, 515, 1480, 755), outline=(*gold, 150), width=4)
    art.line((1240, 635, 1482, 635), fill=(*gold, 150), width=4)
    art.line((1360, 555, 1360, 795), fill=(*gold, 100), width=3)
    return image


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
    slug = page.stem
    destination = OUTPUT / page.parent.name / f"{slug}.png"
    destination.parent.mkdir(parents=True, exist_ok=True)

    source = (page.parent / hero["src"]).resolve()
    if not source.is_file():
        raise FileNotFoundError(source)
    image = cover(Image.open(source)).filter(ImageFilter.GaussianBlur(radius=.25))
    image = ImageEnhance.Color(image).enhance(.76)
    overlay = Image.new("RGBA", image.size, (20, 38, 29, 0))
    gradient = ImageDraw.Draw(overlay)
    for x in range(1200):
        alpha = int(206 * (1 - x / 1200) ** .75 + 32)
        gradient.line((x, 0, x, 630), fill=(20, 38, 29, alpha))
    image = Image.alpha_composite(image.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(image)
    x, label_y, title_y, limit, title_size, step, rule_y, note_y = 72, 78, 150, 720, 56, 68, 540, 564
    draw.text((x, label_y), "FRANCIELE SOFIATI  ·  LONDRINA", font=font(FONT_BOLD, round(title_size * .39)), fill=(236, 213, 173))
    y = title_y
    for line in wrapped(draw, title, limit, font(FONT_BOLD, title_size)):
        draw.text((x, y), line, font=font(FONT_BOLD, title_size), fill=(255, 253, 247), spacing=8)
        y += step
    draw.rectangle((x, rule_y, x + round(title_size * 4.8), rule_y + 5), fill=(236, 213, 173))
    draw.text((x, note_y), "Conteúdo educativo · avaliação individual", font=font(FONT, round(title_size * .34)), fill=(255, 253, 247))
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
