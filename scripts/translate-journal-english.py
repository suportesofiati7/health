#!/usr/bin/env python3
"""Translate the generated Portuguese Journal route into its paired EN route."""
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString
import argostranslate.translate

ROOT = Path(__file__).resolve().parents[1]
pt = next(language for language in argostranslate.translate.get_installed_languages() if language.code == "pt")
en = next(language for language in argostranslate.translate.get_installed_languages() if language.code == "en")
translate = pt.get_translation(en).translate
SKIP = {"script", "style", "svg"}

for source in sorted((ROOT / "blog").glob("*.html")):
    destination = ROOT / "en" / "journal" / source.name
    soup = BeautifulSoup(destination.read_text(encoding="utf-8"), "html.parser")
    for node in list(soup.find_all(string=True)):
        if not node.strip() or node.parent.name in SKIP:
            continue
        text = str(node)
        if any(character.isalpha() for character in text):
            node.replace_with(translate(text))
    for element in soup.select("[alt], [aria-label], meta[content]"):
        attribute = "alt" if element.has_attr("alt") else "aria-label" if element.has_attr("aria-label") else "content"
        value = element.get(attribute, "")
        if value and any(character.isalpha() for character in value):
            element[attribute] = translate(value)
    destination.write_text(str(soup), encoding="utf-8")
print("Translated paired English Journal pages.")
