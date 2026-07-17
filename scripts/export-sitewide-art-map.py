#!/usr/bin/env python3
"""Export the executable section journeys as a human-readable art map."""

from __future__ import annotations

import importlib.util
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "data" / "content-master.json"
RENDERER = ROOT / "scripts" / "render-english-site.py"
OUTPUT = ROOT / "docs" / "sitewide-art-map.md"


PATTERN_CONTRACTS = {
    "editorial_split": (
        "the assigned photograph or editorial statement",
        "chapter heading, then the short introduction",
        "asymmetric media/prose split with one dominant side",
        "No; supporting facts use dividers inside the split.",
    ),
    "evidence_panel": (
        "the evidence board or major supporting image",
        "chapter heading, then explanatory context",
        "broad evidence field with an anchored text edge",
        "Only when evidence needs discrete labels; items share one surface.",
    ),
    "staggered_cards": (
        "the chapter proposition",
        "one deliberately larger module, then supporting details",
        "offset editorial ledger rather than equal floating tiles",
        "Yes, but related items are consolidated and internally divided.",
    ),
    "quote_panel": (
        "the quotation or practitioner statement",
        "chapter heading and attribution/context",
        "short-measure serif statement with generous negative space",
        "No; a quote is not a generic card.",
    ),
    "pull_quote": (
        "the pull quote",
        "chapter label and its supporting context",
        "full-width rhythm break with a gold quotation accent",
        "No.",
    ),
    "definition_blocks": (
        "the chapter heading",
        "the strongest definition, then the supporting distinctions",
        "one composed definition field with internal rules",
        "Only as joined definition cells, never tiny independent cards.",
    ),
    "reading_column": (
        "the chapter heading or key principle",
        "short introduction, then readable long-form copy",
        "calm editorial column aligned to the master reading rail",
        "No unless a caution genuinely needs a separate surface.",
    ),
    "route_map": (
        "the route choice or decision prompt",
        "chapter heading, then concise route explanations",
        "wide navigation ledger with stable tap/click targets",
        "Route modules share a surface and divider system.",
    ),
    "page_directory": (
        "the directory heading",
        "the primary route, followed by secondary destinations",
        "broad directory ledger, not a field of pastel boxes",
        "Yes, but only as large linked rows within one composition.",
    ),
    "horizontal_bands": (
        "the chapter proposition",
        "the first band, then the remaining supporting sequence",
        "low horizontal bands that punctuate taller scenes",
        "No floating cards; content is grouped by rules and bands.",
    ),
    "numbered_sequence": (
        "the process heading",
        "step one, then the left-to-right care sequence",
        "full-canvas process rail whose gold rule carries the eye",
        "Steps are one process, not equal catalogue cards.",
    ),
    "comparison": (
        "the comparison question",
        "the two principal alternatives",
        "one joined comparison surface with a clear dividing axis",
        "No; comparison halves remain visibly related.",
    ),
    "timeline": (
        "the time or care sequence",
        "chapter heading, then ordered milestones",
        "horizontal gold rule becoming a vertical mobile spine",
        "No; milestones remain part of one chronology.",
    ),
    "form": (
        "the form and its action",
        "chapter heading, then privacy/response expectations",
        "one substantial functional surface balanced by concise copy",
        "No; fields belong to one form surface.",
    ),
    "accordion": (
        "the category question",
        "chapter heading, then scannable question rows",
        "compact question bank with visible disclosure states",
        "No; native disclosures form one category set.",
    ),
    "oversized_statement": (
        "one oversized principle",
        "a short explanatory passage",
        "concentrated statement interruption with a controlled measure",
        "No.",
    ),
    "question_gateway": (
        "the next-step question",
        "the clearest action route",
        "short gateway strip before the final CTA",
        "No.",
    ),
}

SCENE_ASSETS = {
    "porcelain": "porcelain paper, warm light and a restrained rule",
    "paper-line": "porcelain paper with a real column/rule anchor",
    "sage-shadow": "pale sage field with a low-opacity botanical shadow",
    "blush-silk": "luminous blush silk and peach diffusion",
    "rose-metal": "ivory/blush field with a rose-gold diagonal detail",
    "architectural-light": "light architectural fragment with an open copy area",
    "clinic-light": "treatment-room light with the page-specific supporting photograph",
    "technical-light": "cooler technical light and equipment detail",
    "olive-garden": "full-width olive garden shadow with shared edge illumination",
}

SCALE_CONTRACTS = {
    "micro": "micro · 80–180px target",
    "compact": "compact · 220–400px target",
    "standard": "standard · 500–850px target",
    "immersive": "immersive · 700–1000px when content earns it",
}


def load_renderer():
    spec = importlib.util.spec_from_file_location("sofiati_renderer", RENDERER)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load {RENDERER}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def text(value: object) -> str:
    cleaned = re.sub(r"\s+", " ", str(value or "")).strip()
    return cleaned.replace("|", "\\|")


def transition(scenes: tuple[str, ...], index: int) -> str:
    previous_scene = "approved hero" if index == 1 else scenes[index - 1]
    next_scene = "approved CTA" if index == len(scenes) - 2 else scenes[index + 1]
    return f"{previous_scene} → **{scenes[index]}** → {next_scene}"


def main() -> None:
    renderer = load_renderer()
    data = json.loads(CONTENT.read_text(encoding="utf-8"))
    pages = sorted(data["pages"].values(), key=lambda page: data["page_order"].index(page["slug"]))

    lines = [
        "# Sitewide section art map",
        "",
        "Status: canonical pre-code decision register for all numbered body chapters. The Treatments rebuild has its own more detailed [Treatments art map](treatments-art-map.md).",
        "",
        "This register is exported from the renderer's explicit `PAGE_PATTERN_JOURNEYS`, `PAGE_SCALE_JOURNEYS`, `PAGE_SCENE_JOURNEYS`, `PAGE_TONE_JOURNEYS` and `EDITORIAL_MEDIA_MAP`. There is no modulo rotation or automatic layout cycle. A renderer change is incomplete until this export is reviewed again.",
        "",
        "## Non-negotiable section contract",
        "",
        "Every body chapter starts at the same site-canvas left anchor with `01 / SMALL SECTION LABEL / Main heading`. Artwork may bleed beyond the inner rails, but prose, media and wide compositions resolve to the shared tokens documented in [Grid and containers](design-system/grid-and-containers.md). Section height is content-sized; scale is a pacing target, never a fixed height.",
        "",
        "For every row below, the message is the section heading. The focal and second-read fields answer the visual hierarchy question; the assigned scene/media and pattern answer the asset and silhouette questions; the transition records how the chapter differs from its neighbours; and the module decision records whether cards are justified.",
        "",
        "Across every row: body copy is at least 16px, orientation labels at least 14px, normal text contrast at least 4.5:1, headings use balanced word-aware measures, Portuguese expands height without shrinking type, and the composition must pass at 390px and 1920px. At mobile widths splits stack in semantic source order and horizontal processes become vertical without changing the chapter anchor.",
        "",
        "## Composition contracts",
        "",
        "| Pattern | First read | Second read | Silhouette | Does it need cards? |",
        "|---|---|---|---|---|",
    ]
    for pattern, contract in PATTERN_CONTRACTS.items():
        lines.append(f"| `{pattern}` | {contract[0]} | {contract[1]} | {contract[2]} | {contract[3]} |")

    lines.extend(["", "## Route maps", ""])

    for page in pages:
        filename = page["filename"]
        if filename == "treatments.html":
            lines.extend([
                "### Treatments",
                "",
                "Chapters 01–09, the finder, sticky index, treatment inventory and responsive/contrast decisions are documented in the [Treatments art map](treatments-art-map.md).",
                "",
            ])
            continue

        patterns = renderer.PAGE_PATTERN_JOURNEYS[filename]
        scales = renderer.PAGE_SCALE_JOURNEYS[filename]
        scenes = renderer.PAGE_SCENE_JOURNEYS[filename]
        tones = renderer.PAGE_TONE_JOURNEYS[filename]
        sections = page["sections"]
        lengths = {len(patterns), len(scales), len(scenes), len(tones), len(sections)}
        if len(lengths) != 1:
            raise RuntimeError(f"Journey length mismatch for {filename}: {sorted(lengths)}")

        lines.extend([
            f"### {text(page['title'])} (`{filename}`)",
            "",
            "| Chapter and message | First → second | Asset and silhouette | Scale / intensity | Transition | Module decision |",
            "|---|---|---|---|---|---|",
        ])
        for index in range(1, len(sections) - 1):
            section = sections[index]
            pattern = patterns[index]
            contract = PATTERN_CONTRACTS[pattern]
            media = renderer.EDITORIAL_MEDIA_MAP.get((filename, index + 1))
            asset = f"`{media[0]}`" if media else SCENE_ASSETS.get(scenes[index], scenes[index])
            intensity = int(scales[index] == "immersive") + int(scales[index] == "standard") + int(scenes[index] == "olive-garden") + 1
            lines.append(
                "| "
                f"**{index:02d} · {text(section.get('label'))}**<br>{text(section.get('heading'))} | "
                f"{contract[0]} → {contract[1]} | "
                f"{asset}; {contract[2]} | "
                f"{SCALE_CONTRACTS[scales[index]]}; intensity {intensity}/4; `{tones[index]}` tone | "
                f"{transition(scenes, index)} | "
                f"{contract[3]} |"
            )
        lines.append("")

    OUTPUT.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
