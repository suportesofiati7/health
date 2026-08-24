#!/usr/bin/env python3
"""Create the PT-BR versions of the ten original English Journal articles.

The Portuguese routes are the canonical ``/blog/`` routes.  Keeping these
files in sync with their ``/en/blog/`` counterparts means the shared language
switcher always has a real, like-for-like destination.
"""

from __future__ import annotations

import json
import sys
import argparse
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from pt_translation.argos_engine import ArgosEngine
from pt_translation.generator import BrazilianTranslator
from pt_translation.html_document import (
    JSON_NON_TEXT_KEYS,
JSON_TEXT_KEYS,
    META_KEYS,
    SKIP_TAGS,
    TEXT_ATTRIBUTES,
    contains_words,
)

HEADLINES = {
    "why-aesthetic-care-begins-with-consultation": "Consulta estética antes do tratamento",
    "rebuilding-an-overwhelmed-skin-barrier": "Reconstruindo uma barreira cutânea sobrecarregada",
    "professional-skin-cleansing-guide": "Guia profissional de limpeza de pele",
    "understanding-facial-pigmentation": "Entendendo a pigmentação facial",
    "understanding-acne-scar-treatment": "Entendendo o tratamento de cicatrizes de acne",
    "persistent-facial-redness-and-vessels": "Vermelhidão facial persistente e vasos",
    "fractional-co2-laser-recovery-and-aftercare": "Laser CO₂ fracionado: recuperação e cuidados posteriores",
    "ultrasound-radiofrequency-collagen-treatment": "Ultrassom e radiofrequência para colágeno",
    "laser-hair-removal-process-and-maintenance": "Depilação a laser: processo e manutenção",
    "hair-thinning-causes-and-scalp-care": "Afinamento capilar: causas e cuidados com o couro cabeludo",
}


def should_translate(tag) -> bool:
    return tag.name not in SKIP_TAGS and not tag.find_parent(SKIP_TAGS) and tag.get("translate") != "no"


def translate(translator: BrazilianTranslator, value: str) -> str:
    return translator.translate(value)[0] if contains_words(value) else value


def translate_json(node, translator: BrazilianTranslator) -> None:
    if isinstance(node, dict):
        for key, value in node.items():
            if key in JSON_TEXT_KEYS and isinstance(value, str):
                node[key] = translate(translator, value)
            elif key not in JSON_NON_TEXT_KEYS:
                translate_json(value, translator)
    elif isinstance(node, list):
        for value in node:
            translate_json(value, translator)


def localize_document(source: Path, target: Path, translator: BrazilianTranslator) -> None:
    soup = BeautifulSoup(source.read_text(encoding="utf-8"), "html.parser")
    soup.html["lang"] = "pt-BR"
    soup.html["data-default-lang"] = "pt-BR"

    for tag in soup.find_all(True):
        if not should_translate(tag):
            continue
        for attribute in TEXT_ATTRIBUTES:
            if tag.has_attr(attribute):
                tag[attribute] = translate(translator, str(tag[attribute]))
        if (tag.name, tag.get("name")) in META_KEYS or (tag.name, tag.get("property")) in META_KEYS:
            tag["content"] = translate(translator, str(tag.get("content", "")))
        for node in list(tag.contents):
            if isinstance(node, NavigableString) and not node.parent.find_parent(SKIP_TAGS):
                text = str(node)
                if contains_words(text):
                    node.replace_with(translate(translator, text))

    for script in soup.select('script[type="application/ld+json"]'):
        try:
            data = json.loads(script.string or "")
        except json.JSONDecodeError:
            continue
        translate_json(data, translator)
        script.string = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

    slug = target.stem
    pt_url = f"https://francielesofiati.com/blog/{slug}"
    en_url = f"https://francielesofiati.com/en/blog/{slug}"
    for link in soup.find_all("link"):
        rel = link.get("rel", [])
        if "canonical" in rel:
            link["href"] = pt_url
        elif "alternate" in rel:
            link["href"] = en_url if link.get("hreflang") == "en" else pt_url
    head = soup.head
    if not soup.find("link", rel="alternate", hreflang="pt-BR"):
        alternate = soup.new_tag("link", rel="alternate", hreflang="pt-BR", href=pt_url)
        head.append(alternate)
    default = soup.find("link", rel="alternate", hreflang="x-default")
    if default is None:
        head.append(soup.new_tag("link", rel="alternate", hreflang="x-default", href=pt_url))
    else:
        default["href"] = pt_url
    for meta in soup.find_all("meta"):
        if meta.get("property") == "og:url":
            meta["content"] = pt_url
        elif meta.get("property") == "og:locale":
            meta["content"] = "pt_BR"
        elif meta.get("property") == "og:locale:alternate":
            meta["content"] = "en_US"

    target.write_text(str(soup), encoding="utf-8")


def ensure_english_alternates(path: Path, portuguese_path: Path) -> None:
    """Give the English page the reciprocal PT-BR and default annotations."""
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    slug = portuguese_path.stem
    pt_url = f"https://francielesofiati.com/blog/{slug}"
    pt_link = soup.find("link", rel="alternate", hreflang="pt-BR")
    if pt_link is None:
        soup.head.append(soup.new_tag("link", rel="alternate", hreflang="pt-BR", href=pt_url))
    else:
        pt_link["href"] = pt_url
    default = soup.find("link", rel="alternate", hreflang="x-default")
    if default is None:
        soup.head.append(soup.new_tag("link", rel="alternate", hreflang="x-default", href=pt_url))
    else:
        default["href"] = pt_url
    path.write_text(str(soup), encoding="utf-8")


def apply_editorial_headline(path: Path) -> None:
    headline = HEADLINES[path.stem]
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    soup.title.string = f"{headline} | Franciele Sofiati"
    soup.find("h1").string = headline
    for selector in ('meta[property="og:title"]', 'meta[name="twitter:title"]'):
        soup.select_one(selector)["content"] = f"{headline} | Franciele Sofiati"
    for script in soup.select('script[type="application/ld+json"]'):
        try:
            data = json.loads(script.string or "")
        except json.JSONDecodeError:
            continue
        for item in data.get("@graph", []) if isinstance(data, dict) else []:
            if item.get("@type") in {"BlogPosting", "WebPage"}:
                item["headline" if item.get("@type") == "BlogPosting" else "name"] = headline
        script.string = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    path.write_text(str(soup), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--metadata-only", action="store_true", help="Repair reciprocal hreflang links without retranslating content.")
    args = parser.parse_args()
    pairs = json.loads((ROOT / "data" / "page-pairs.json").read_text(encoding="utf-8"))["pages"]
    originals = [pair for pair in pairs if str(pair.get("id", "")).startswith("original-journal-")]
    if args.metadata_only:
        for pair in originals:
            portuguese = ROOT / pair["pt-BR"]
            english = ROOT / pair["en"]
            soup = BeautifulSoup(portuguese.read_text(encoding="utf-8"), "html.parser")
            slug = portuguese.stem
            pt_url = f"https://francielesofiati.com/blog/{slug}"
            if not soup.find("link", rel="alternate", hreflang="pt-BR"):
                soup.head.append(soup.new_tag("link", rel="alternate", hreflang="pt-BR", href=pt_url))
                portuguese.write_text(str(soup), encoding="utf-8")
            apply_editorial_headline(portuguese)
            ensure_english_alternates(english, portuguese)
        return 0
    engine = ArgosEngine.load_installed()
    glossary = json.loads((ROOT / "data" / "translation" / "pt-BR-glossary.json").read_text(encoding="utf-8"))
    memory = json.loads((ROOT / "data" / "translation" / "pt-BR-memory.json").read_text(encoding="utf-8"))
    translator = BrazilianTranslator(engine, glossary, memory, "original-journal-pairs")
    for pair in originals:
        english = ROOT / pair["en"]
        portuguese = ROOT / pair["pt-BR"]
        localize_document(english, portuguese, translator)
        apply_editorial_headline(portuguese)
        ensure_english_alternates(english, portuguese)
        print(f"Translated {pair['pt-BR']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
