#!/usr/bin/env python3
"""Name and place Franciele's new portrait library across non-treatment pages.

The script is idempotent: it never changes service/treatment imagery and it
replaces only its own marked portrait figure on subsequent runs.
"""

from __future__ import annotations

import re
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "assets" / "new-hair-franciele"
MARKER = "sf:portrait-library:start"
SKIP_DIRECTORIES = {".git", "dist", "node_modules", "performance-reports", "tmp"}
SKIP_PAGE_NAMES = {"treatments", "skin", "laser"}
CURATED = {
    "01-professional-clinic-homepage-hero.webp": "franciele-sofiati-biomedica-consulta-clinica-londrina.webp",
    "02-professional-about-portrait.webp": "franciele-sofiati-biomedica-retrato-profissional-londrina.webp",
    "03-online-consultation-office.webp": "franciele-sofiati-biomedica-consulta-online-londrina.webp",
    "04-editorial-biography-portrait.webp": "franciele-sofiati-biomedica-retrato-editorial-londrina.webp",
    "05-full-length-clinic-professional.webp": "franciele-sofiati-biomedica-retrato-inteiro-clinica-londrina.webp",
    "06-outdoor-professional-brand-story.webp": "franciele-sofiati-biomedica-historia-profissional-londrina.webp",
    "07-dark-website-cta-banner.webp": "franciele-sofiati-biomedica-banner-consulta-londrina.webp",
    "08-warm-contact-page-portrait.webp": "franciele-sofiati-biomedica-retrato-contato-londrina.webp",
    "09-expertise-presentation-section.webp": "franciele-sofiati-biomedica-apresentacao-profissional-londrina.webp",
    "10-black-and-white-press-portrait.webp": "franciele-sofiati-biomedica-retrato-imprensa-londrina.webp",
}
SCENES = (
    "retrato-profissional-no-consultorio",
    "consulta-estetica-humanizada",
    "planejamento-de-cuidado-personalizado",
    "avaliacao-estetica-responsavel",
    "atendimento-profissional-em-londrina",
    "conversa-sobre-cuidado-da-pele",
    "presenca-profissional-na-clinica",
    "orientacao-estetica-individualizada",
    "retrato-editorial-da-biomedica",
    "consulta-com-escuta-e-planejamento",
    "profissional-em-ambiente-clinico",
    "cuidado-estetico-com-responsabilidade",
    "imagem-profissional-para-consulta",
    "planejamento-estetico-em-londrina",
    "atendimento-de-pele-e-bem-estar",
    "retrato-profissional-de-franciele",
    "consulta-de-cuidado-personalizado",
    "orientacao-profissional-para-a-pele",
    "presenca-acolhedora-na-clinica",
    "biomedica-em-consulta-estetica",
)


def rename_library() -> None:
    for previous, current in CURATED.items():
        source, target = LIBRARY / previous, LIBRARY / current
        if source.exists() and not target.exists():
            source.rename(target)
    for number in range(1, 101):
        source = LIBRARY / f"franciele-sofiati-website-image-{number:03d}.webp"
        scene = SCENES[(number - 1) % len(SCENES)]
        target = LIBRARY / f"franciele-sofiati-biomedica-{scene}-londrina-{number:03d}.webp"
        if source.exists() and not target.exists():
            source.rename(target)


def source_pages() -> list[Path]:
    pages: list[Path] = []
    for path in ROOT.rglob("*.html"):
        relative = path.relative_to(ROOT)
        if any(part in SKIP_DIRECTORIES for part in relative.parts):
            continue
        if relative.parts and relative.parts[0] == "servicos":
            continue
        source = path.read_text(encoding="utf-8")
        page_name = re.search(r'\bdata-page=["\']([^"\']+)', source)
        if page_name and page_name.group(1).casefold() in SKIP_PAGE_NAMES:
            continue
        if "<main" in source.lower() and "</main>" in source.lower():
            pages.append(path)
    return sorted(pages, key=lambda item: item.relative_to(ROOT).as_posix())


def title_for(source: str) -> str:
    match = re.search(r"<title[^>]*>(.*?)</title>", source, re.IGNORECASE | re.DOTALL)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", match.group(1))).strip() if match else "esta página"


def portrait_markup(path: Path, asset: Path, source: str) -> str:
    depth = len(path.relative_to(ROOT).parent.parts)
    relative_asset = "../" * depth + asset.relative_to(ROOT).as_posix()
    width, height = Image.open(asset).size
    language = "en" if re.search(r'<html\b[^>]*\blang=["\']en(?:[-_][^"\']*)?["\']', source, re.I) else "pt"
    title = title_for(source)
    if language == "en":
        alt = (
            "Professional portrait of Franciele Sofiati, Biomedic, Esthetician and Cosmetologist "
            f"in Londrina, for {title}."
        )
        caption = "Franciele Sofiati · Biomedic | Esthetician | Cosmetologist · CRBM 6277"
    else:
        alt = (
            "Retrato profissional de Franciele Sofiati, biomédica, esteticista e cosmetóloga "
            f"em Londrina, para {title}."
        )
        caption = "Franciele Sofiati · Biomédica | Esteticista | Cosmetóloga · CRBM 6277"
    return (
        f'<!-- {MARKER} -->\n'
        '<figure class="sf-portrait-library" data-franciele-portrait>\n'
        f'  <img alt="{alt}" decoding="async" height="{height}" loading="lazy" '
        f'src="{relative_asset}" width="{width}"/>\n'
        f'  <figcaption>{caption}</figcaption>\n'
        '</figure>\n'
        '<!-- sf:portrait-library:end -->\n'
    )


def apply_portraits() -> int:
    assets = sorted(LIBRARY.glob("franciele-sofiati-biomedica-*.webp"))
    if len(assets) < 100:
        raise RuntimeError(f"Expected 100+ renamed portraits, found {len(assets)}")
    changed = 0
    marker_pattern = re.compile(
        rf"\s*<!-- {re.escape(MARKER)} -->.*?<!-- sf:portrait-library:end -->\s*",
        re.DOTALL,
    )
    for index, path in enumerate(source_pages()):
        source = path.read_text(encoding="utf-8")
        source = marker_pattern.sub("\n", source)
        markup = portrait_markup(path, assets[index % len(assets)], source)
        updated, replacements = re.subn(r"(<main\b[^>]*>)", r"\1\n" + markup, source, count=1, flags=re.I)
        if replacements != 1:
            raise RuntimeError(f"Could not locate main element in {path.relative_to(ROOT)}")
        if updated != path.read_text(encoding="utf-8"):
            path.write_text(updated, encoding="utf-8")
            changed += 1
    return changed


def main() -> int:
    rename_library()
    changed = apply_portraits()
    print(f"Portrait library applied to {changed} non-treatment pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
