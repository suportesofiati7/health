#!/usr/bin/env python3
"""Audit the generated Sofiati static presentation."""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
CONCEPTS_DIR = ROOT / "concepts"
REPORT_DIR = ROOT / "final"
PAGES = [
    "home",
    "about",
    "mission",
    "values",
    "care",
    "laser",
    "skin",
    "results",
    "testimonials",
    "journal",
    "blog",
    "faq",
    "contact",
    "consultation",
    "legal",
    "privacy",
    "cookies",
    "accessibility",
    "404",
]

FORBIDDEN_PATTERNS = {
    "public address found": re.compile(r"public address found|endereco publico encontrado|endereço público encontrado", re.I),
    "street address": re.compile(r"\b(rua|avenida|av\.|r\.)\s+[A-ZÀ-Ý0-9]", re.I),
    "map embed": re.compile(r"google maps|map embed|map pin|mapa incorporado|pin de mapa", re.I),
    "unsafe claim": re.compile(r"guaranteed results|miracle treatment|risk-free|perfect skin guaranteed|instant transformation|dream body", re.I),
    "template residue": re.compile(r"lorem ipsum|old portfolio|placeholder brand|generic template", re.I),
}

SERVICE_TERMS = {
    "advanced aesthetic biomedicine": ["advanced aesthetic biomedicine", "biomedicina estética avançada"],
    "professional evaluation": ["professional evaluation", "avaliação profissional"],
    "personalised care": ["personalised care", "personalizado", "personalizada"],
    "laser care": ["laser care", "cuidados com laser"],
    "laser hair removal": ["laser hair removal", "depilação a laser"],
    "laser rejuvenation": ["laser rejuvenation", "rejuvenescimento a laser"],
    "skin care": ["skin care", "cuidados da pele", "cuidado da pele"],
    "skin cleansing": ["skin cleansing", "limpeza de pele"],
    "skin quality": ["skin quality", "qualidade da pele"],
    "melasma education": ["melasma education", "melasma"],
    "rosacea education": ["rosacea education", "rosácea", "rosacea"],
    "flaccidity and wrinkles": ["flaccidity", "flacidez", "wrinkles", "rugas"],
    "technology treatments": ["technology", "tecnologia", "laser harmony", "light sheer duet"],
    "aftercare": ["aftercare", "acompanhamento"],
    "consultation": ["consultation", "consulta"],
    "responsible results": ["results may vary", "resultados podem variar", "resultados éticos"],
}

DISCLAIMER_TERMS = [
    "Results may vary according to individual characteristics",
    "Os resultados podem variar de acordo com características individuais",
    "Information on this website is educational",
    "As informações deste site são educativas",
]


def html_paths() -> list[Path]:
    return sorted(path for path in ROOT.rglob("*.html") if ".git" not in path.parts and "final" not in path.parts)


def text_for(path: Path) -> str:
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    return soup.get_text(" ", strip=True)


def is_external(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https", "mailto", "tel", "sms", "whatsapp"}


def local_target_exists(path: Path, value: str) -> bool:
    if not value or value.startswith("#") or value.startswith("data:"):
        return True
    if is_external(value):
        return True
    clean = value.split("#", 1)[0].split("?", 1)[0]
    if not clean:
        return True
    target = (path.parent / clean).resolve()
    try:
        target.relative_to(ROOT.resolve())
    except ValueError:
        return False
    if clean.endswith("/"):
        return (target / "index.html").exists()
    return target.exists()


def tracked_videos() -> list[str]:
    result = subprocess.run(
        ["git", "ls-files"],
        cwd=ROOT,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
    )
    return [line for line in result.stdout.splitlines() if re.search(r"\.(mp4|mov|webm|avi|mkv)$", line, re.I)]


def audit() -> tuple[list[str], dict[str, object]]:
    errors: list[str] = []
    concepts = sorted(path for path in CONCEPTS_DIR.iterdir() if path.is_dir())
    if len(concepts) != 50:
        errors.append(f"Expected 50 concept directories, found {len(concepts)}")

    for concept in concepts:
        if not re.fullmatch(r"\d{2}", concept.name):
            errors.append(f"Unexpected concept directory name: {concept}")
        if not (concept / "index.html").exists():
            errors.append(f"Missing concept redirect: {concept}/index.html")
        if not (ROOT / "css" / "concepts" / f"{concept.name}.css").exists():
            errors.append(f"Missing concept CSS: css/concepts/{concept.name}.css")
        for page in PAGES:
            page_file = concept / page / "index.html"
            if not page_file.exists():
                errors.append(f"Missing page: concepts/{concept.name}/{page}/index.html")

    all_html = html_paths()
    for path in all_html:
        raw = path.read_text(encoding="utf-8")
        text = text_for(path)
        for label, pattern in FORBIDDEN_PATTERNS.items():
            if pattern.search(text):
                errors.append(f"Forbidden {label}: {path.relative_to(ROOT)}")
        soup = BeautifulSoup(raw, "html.parser")
        for tag in soup.find_all(["a", "link", "script", "img"]):
            attr = "href" if tag.name in {"a", "link"} else "src"
            value = tag.get(attr)
            if not value or value == "#":
                continue
            if not local_target_exists(path, value):
                errors.append(f"Broken local {attr}: {path.relative_to(ROOT)} -> {value}")

    for concept in concepts:
        combined = " ".join(text_for(page) for page in (concept / page / "index.html" for page in PAGES))
        lowered = combined.lower()
        for label, terms in SERVICE_TERMS.items():
            if not any(term.lower() in lowered for term in terms):
                errors.append(f"Missing service/theme '{label}' in concept {concept.name}")
        for page in ["laser", "skin", "results", "consultation"]:
            page_text = text_for(concept / page / "index.html")
            if not any(term in page_text for term in DISCLAIMER_TERMS):
                errors.append(f"Missing disclaimer on concepts/{concept.name}/{page}/index.html")

    videos = tracked_videos()
    if videos:
        errors.append("Tracked video files: " + ", ".join(videos))

    screenshot_manifest = ROOT / "final" / "homepage-screenshots" / "manifest.json"
    screenshot_count = 0
    if screenshot_manifest.exists():
        data = json.loads(screenshot_manifest.read_text(encoding="utf-8"))
        screenshot_count = int(data.get("count", 0))
        if screenshot_count < 102:
            errors.append(f"Expected at least 102 screenshots, found {screenshot_count}")
    else:
        errors.append("Missing homepage screenshot manifest")

    summary = {
        "conceptCount": len(concepts),
        "htmlFileCount": len(all_html),
        "trackedVideos": videos,
        "screenshotCount": screenshot_count,
        "errorCount": len(errors),
    }
    return errors, summary


def write_report(errors: list[str], summary: dict[str, object]) -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    (REPORT_DIR / "audit-report.json").write_text(
        json.dumps({"summary": summary, "errors": errors}, indent=2),
        encoding="utf-8",
    )
    lines = ["# Sofiati Static Site Audit", "", "## Summary", ""]
    for key, value in summary.items():
        lines.append(f"- {key}: {value}")
    lines.extend(["", "## Errors", ""])
    if errors:
        lines.extend(f"- {error}" for error in errors)
    else:
        lines.append("- None")
    (REPORT_DIR / "audit-report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    errors, summary = audit()
    write_report(errors, summary)
    print(json.dumps(summary, indent=2))
    if errors:
        print(f"Audit failed with {len(errors)} errors. See final/audit-report.md")
        raise SystemExit(1)
    print("Audit passed")


if __name__ == "__main__":
    main()
