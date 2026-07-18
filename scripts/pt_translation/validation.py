"""Structural, language, link and metadata validation for translated pages."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup

from .html_document import DOMAIN, en_url, extract_blocks, normalized, pt_url, structural_inventory

EXTERNALLY_AUTHORED_ENGLISH_PAGES = frozenset(
    {
        # These published English pages contain verified brand/legal labels that
        # intentionally remain unchanged in PT-BR output. They are no longer
        # inferred from a duplicate content-master file.
        "404.html",
        "about.html",
        "consultation.html",
        "contact.html",
        "cookies.html",
        "index.html",
        "journal.html",
        "legal.html",
    }
)


ENGLISH_MARKERS = re.compile(
    r"\b(?:the|and|with|before|after|through|should|could|would|what|when|where|"
    r"your|you|care|skin|consultation|results|questions|guidance|page|treatment|"
    r"read|request|send|search|review|patient|full name|message|website|choose|"
    r"save|reject|optional|required|success|loading)\b",
    re.I,
)
PORTUGUESE_MARKERS = re.compile(
    r"\b(?:você|seu|sua|consulta|tratamento|pele|cuidados|página|início|solicitar|"
    r"mensagem|privacidade|avaliação|resultados|perguntas|acolhedor)\b",
    re.I,
)
EUROPEAN_PORTUGUESE = re.compile(
    r"\b(?:ficheiro|ecrã|telemóvel|utilizador|marcação|facto|receção|contacto)\b",
    re.I,
)


@dataclass
class ValidationIssue:
    unit: str
    level: str
    message: str


@dataclass
class ValidationSummary:
    checked: int = 0
    issues: list[ValidationIssue] = field(default_factory=list)

    @property
    def failures(self) -> list[ValidationIssue]:
        return [issue for issue in self.issues if issue.level == "error"]

    @property
    def warnings(self) -> list[ValidationIssue]:
        return [issue for issue in self.issues if issue.level == "warning"]


def load_allowlist(path: Path) -> set[str]:
    if not path.exists():
        return set()
    return {
        line.strip().casefold()
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    }


def _allowed(text: str, allowlist: set[str]) -> bool:
    folded = normalized(text).casefold()
    if not folded:
        return True
    if folded in allowlist:
        return True
    scrubbed = folded
    for value in sorted(allowlist, key=len, reverse=True):
        scrubbed = scrubbed.replace(value, "")
    return not re.search(r"[a-zà-ÿ]", scrubbed)


def _duplicate_ids(soup: BeautifulSoup) -> list[str]:
    values = [str(tag["id"]) for tag in soup.find_all(True) if tag.get("id")]
    return sorted({value for value in values if values.count(value) > 1})


def _internal_link_failures(root: Path, output: Path, soup: BeautifulSoup) -> list[str]:
    failures: list[str] = []
    for tag in soup.find_all(True):
        for attribute in ("href", "poster", "src"):
            value = tag.get(attribute)
            if not isinstance(value, str) or not value or value.startswith(("#", "data:", "javascript:")):
                continue
            parsed = urlparse(value)
            if parsed.scheme or parsed.netloc:
                continue
            clean = value.split("#", 1)[0].split("?", 1)[0]
            if not clean:
                continue
            target = root / clean.lstrip("/") if clean.startswith("/") else (output.parent / clean).resolve()
            if not target.exists():
                failures.append(f"broken local reference {attribute}={value!r}")
    return failures


def _alternate(soup: BeautifulSoup, language: str) -> str | None:
    link = soup.find("link", rel="alternate", hreflang=language)
    return str(link.get("href")) if link and link.get("href") else None


def validate_page(
    root: Path,
    page: str,
    allowlist: set[str],
    *,
    require_structural_parity: bool = True,
) -> list[ValidationIssue]:
    source = root / page
    output = root / "pt" / page
    issues: list[ValidationIssue] = []
    if not source.exists():
        return [ValidationIssue(page, "error", "English source is missing")]
    if not output.exists():
        return [ValidationIssue(page, "error", "Portuguese equivalent is missing")]

    source_text = source.read_text(encoding="utf-8")
    output_text = output.read_text(encoding="utf-8")
    en_soup = BeautifulSoup(source_text, "html.parser")
    pt_soup = BeautifulSoup(output_text, "html.parser")
    if not en_soup.html or en_soup.html.get("lang") != "en":
        issues.append(ValidationIssue(page, "error", "English page must use lang=\"en\""))
    if not pt_soup.html or pt_soup.html.get("lang") != "pt-BR":
        issues.append(ValidationIssue(page, "error", "Portuguese page must use lang=\"pt-BR\""))

    if require_structural_parity:
        en_inventory = structural_inventory(source_text)
        pt_inventory = structural_inventory(output_text)
        if en_inventory["tags"] != pt_inventory["tags"]:
            issues.append(ValidationIssue(page, "error", "HTML tag structure differs from English source"))
        if en_inventory["classes"] != pt_inventory["classes"]:
            issues.append(ValidationIssue(page, "error", "CSS classes differ from English source"))
        if en_inventory["ids"] != pt_inventory["ids"]:
            issues.append(ValidationIssue(page, "error", "element IDs differ from English source"))
    duplicates = _duplicate_ids(pt_soup)
    if duplicates:
        issues.append(ValidationIssue(page, "error", f"duplicate IDs: {', '.join(duplicates)}"))

    if not pt_soup.title or not normalized(pt_soup.title.get_text()):
        issues.append(ValidationIssue(page, "error", "missing translated title"))
    if not pt_soup.find("meta", attrs={"name": "description", "content": True}):
        issues.append(ValidationIssue(page, "error", "missing translated meta description"))
    if _alternate(en_soup, "pt-BR") != pt_url(page):
        issues.append(ValidationIssue(page, "error", "English hreflang pt-BR link is incorrect"))
    if _alternate(pt_soup, "en") != en_url(page) or _alternate(pt_soup, "pt-BR") != pt_url(page):
        issues.append(ValidationIssue(page, "error", "Portuguese reciprocal hreflang links are incorrect"))

    for message in _internal_link_failures(root, output, pt_soup):
        issues.append(ValidationIssue(page, "error", message))

    pt_blocks = extract_blocks(output_text)
    if require_structural_parity:
        en_blocks = extract_blocks(source_text)
        for key, source_block in en_blocks.items():
            translated = pt_blocks.get(key)
            if translated is None:
                issues.append(ValidationIssue(page, "error", f"missing translated block {key}"))
                continue
            if normalized(source_block.source) == normalized(translated.source) and not _allowed(source_block.source, allowlist):
                issues.append(ValidationIssue(page, "error", f"untranslated block {key}: {source_block.source[:100]}"))
    for key, translated in pt_blocks.items():
        markers = sorted({match.group(0).casefold() for match in ENGLISH_MARKERS.finditer(translated.source)})
        if len(markers) >= 2 and not _allowed(translated.source, allowlist):
            issues.append(
                ValidationIssue(page, "warning", f"possible English residue in {key}: {', '.join(markers[:8])}")
            )
        european = sorted({match.group(0).casefold() for match in EUROPEAN_PORTUGUESE.finditer(translated.source)})
        if european:
            issues.append(
                ValidationIssue(page, "warning", f"possible European Portuguese in {key}: {', '.join(european)}")
            )

    for key, block in extract_blocks(source_text).items():
        text = block.source
        scrubbed = re.sub(r"Franciele Sofiati(?: Biomédica)?", "", text, flags=re.I)
        if PORTUGUESE_MARKERS.search(scrubbed):
            issues.append(ValidationIssue(page, "warning", f"possible Portuguese in English source {key}: {text[:100]}"))
    return issues


def validate_partial(root: Path, filename: str, allowlist: set[str]) -> list[ValidationIssue]:
    key = f"partials/{filename}"
    source = root / "partials" / filename
    output = root / "partials" / "pt-BR" / filename
    if not output.exists():
        return [ValidationIssue(key, "error", "localized shared partial is missing")]
    en_text = source.read_text(encoding="utf-8")
    pt_text = output.read_text(encoding="utf-8")
    en_inventory = structural_inventory(en_text)
    pt_inventory = structural_inventory(pt_text)
    issues: list[ValidationIssue] = []
    if en_inventory != pt_inventory:
        issues.append(ValidationIssue(key, "error", "localized partial structure/classes/IDs differ"))
    en_blocks = extract_blocks(en_text)
    pt_blocks = extract_blocks(pt_text)
    for block_key, source_block in en_blocks.items():
        translated = pt_blocks.get(block_key)
        if translated is None:
            issues.append(ValidationIssue(key, "error", f"missing translated block {block_key}"))
        elif normalized(source_block.source) == normalized(translated.source) and not _allowed(source_block.source, allowlist):
            issues.append(ValidationIssue(key, "error", f"untranslated block {block_key}: {source_block.source[:100]}"))
    runtime_page = root / "pt" / "index.html"
    for message in _internal_link_failures(root, runtime_page, BeautifulSoup(pt_text, "html.parser")):
        issues.append(ValidationIssue(key, "error", message))
    return issues


def validate_site(root: Path, pages: list[str] | None = None) -> ValidationSummary:
    allowlist = load_allowlist(root / "data" / "translation" / "pt-BR-allowlist.txt")
    selected = pages or sorted(path.name for path in root.glob("*.html") if "<main" in path.read_text(encoding="utf-8", errors="ignore").lower())
    summary = ValidationSummary()
    for page in selected:
        summary.checked += 1
        summary.issues.extend(
            validate_page(
                root,
                page,
                allowlist,
                require_structural_parity=page not in EXTERNALLY_AUTHORED_ENGLISH_PAGES,
            )
        )
    for partial in sorted((root / "partials").glob("*.html")):
        summary.checked += 1
        summary.issues.extend(validate_partial(root, partial.name, allowlist))
    return summary
