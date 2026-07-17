#!/usr/bin/env python3
"""Validate the rebuilt English Franciele Sofiati static site.

The checker is intentionally read-only and uses only Python's standard
library.  It validates the 21 root HTML pages against
``data/content-master.json`` and checks the shared release contracts that are
easy to regress during static generation: document section order, headings
and complete section copy; metadata, structured data, compiled shared chrome,
links/assets, forms, language purity, verified contact details, testimonial
guardrails, sitemap, and robots.txt.

Run from anywhere with::

    python3 scripts/check-english-site.py

Use ``--json`` for a machine-readable report.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Iterable, Mapping, Sequence
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONTENT = ROOT / "data" / "content-master.json"
DEFAULT_SEO = ROOT / "data" / "seo.json"
DEFAULT_SHARED = ROOT / "data" / "shared-site.json"
DEFAULT_TESTIMONIALS = ROOT / "data" / "testimonials.json"

ENGLISH_PAGES: tuple[str, ...] = (
    "404.html",
    "about.html",
    "accessibility.html",
    "blog.html",
    "care.html",
    "consultation.html",
    "contact.html",
    "cookies.html",
    "faq.html",
    "index.html",
    "journal.html",
    "laser.html",
    "legal.html",
    "mission.html",
    "privacy.html",
    "results.html",
    "skin.html",
    "testimonials.html",
    "thank-you.html",
    "treatments.html",
    "values.html",
)

SITEMAP_PAGES = tuple(
    page for page in ENGLISH_PAGES if page not in {"404.html", "thank-you.html"}
)
EXPECTED_PARTIALS = (
    "topbar",
    "header",
    "mobile-menu",
    "footer",
    "cookie-banner",
    "floating-widgets",
)

VOID_ELEMENTS = frozenset(
    {
        "area",
        "base",
        "br",
        "col",
        "embed",
        "hr",
        "img",
        "input",
        "link",
        "meta",
        "param",
        "source",
        "track",
        "wbr",
    }
)
NON_VISIBLE_ELEMENTS = frozenset({"script", "style", "template", "noscript"})
CONTROL_TAGS = frozenset({"input", "select", "textarea"})
NON_LABELLED_INPUT_TYPES = frozenset({"hidden", "submit", "button", "reset", "image"})
EXTERNAL_SCHEMES = frozenset({"mailto", "tel", "sms", "whatsapp", "data", "blob"})
COPY_ATTRIBUTE_NAMES = frozenset(
    {"alt", "aria-label", "href", "placeholder", "title", "value"}
)

URL_IN_STYLE_RE = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.I)
EMAIL_RE = re.compile(r"(?<![\w.+-])([\w.+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})(?![\w.-])")
REGISTRATION_RE = re.compile(r"\bCRBM\s*[-:]?\s*(\d+)\b", re.I)
RATING_RE = re.compile(r"(?:★\s*){3,}|\b[1-5](?:[.,]\d+)?\s*(?:/\s*5|stars?)\b", re.I)

# These are deliberately high-signal Portuguese UI/content terms.  Brand and
# place names such as "Biomédica", "Londrina" and "Paraná" are intentionally
# absent because they are valid on the English site.
PORTUGUESE_RE = re.compile(
    r"\b(?:"
    r"início|tratamentos|depoimentos|contato|privacidade|acessibilidade|"
    r"política\s+de\s+privacidade|termos\s+de\s+uso|solicitar\s+consulta|"
    r"enviar\s+mensagem|nome\s+completo|endereço\s+de\s+e-mail|"
    r"campo\s+obrigatório|mensagem\s+recebida|saiba\s+mais|"
    r"ver\s+detalhes|fechar\s+detalhes|aceitar\s+cookies|"
    r"rejeitar\s+cookies|salvar\s+(?:minhas\s+)?escolhas|"
    r"configurações\s+de\s+cookies|preferências|"
    r"você|vocês|não|atenção|avaliação|cuidados\s+posteriores"
    r")\b",
    re.I,
)

# Known statements that appeared in the old runtime but were not among the
# four patient comments approved by the content master.
KNOWN_UNAPPROVED_TESTIMONIALS = (
    "Quality products and thoughtful technique.",
    "Modern techniques and equipment.",
    "Everything is explained clearly before care.",
    "The best treatment for each skin type.",
    "Very attentive and dedicated.",
)


def normalise_space(value: Any) -> str:
    return " ".join(str(value or "").split())


def normalise_key(value: Any) -> str:
    return normalise_space(value).casefold()


def normalise_quote(value: Any) -> str:
    return normalise_key(value).strip('"\'“”‘’ ')


def fidelity_key(value: Any) -> str:
    """Return a comparison key for document copy and rendered section copy.

    The source document uses a small set of symbols as layout instructions.
    The renderer intentionally turns those symbols into card treatments,
    required-field semantics, option elements, and button styling.  Removing
    only those presentation tokens keeps the comparison strict about the
    actual words and punctuation.
    """

    text = normalise_space(value).replace("\u00a0", " ")
    additional_button = re.fullmatch(r"Additional button:\s*(.+)", text, flags=re.I)
    if additional_button:
        text = additional_button.group(1)
    while True:
        stripped = re.sub(
            r"^(?:\d{2}\s*[·.]?|[✦◇○◎↗⌁◌✓＋→!?])\s+",
            "",
            text,
        )
        if stripped == text:
            break
        text = stripped
    text = re.sub(r"\s*[→↗]\s*$", "", text)
    text = text.replace("·", " ").replace("*", " ")
    text = normalise_space(text).strip('"\'“”‘’ ')
    return text.casefold()


def digits(value: Any) -> str:
    return "".join(character for character in str(value or "") if character.isdigit())


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8-sig") as handle:
        return json.load(handle)


def as_mapping(value: Any) -> Mapping[str, Any]:
    return value if isinstance(value, Mapping) else {}


def published_sections(filename: str, page: Mapping[str, Any]) -> list[Mapping[str, Any]]:
    """Return the authored sections that the public renderer publishes.

    Contact deliberately reduces the longer editorial source document to its
    single CONTACT FORM section.  Keeping that exception here makes the audit
    validate the published contract without weakening the source-document
    checks performed by ``validate_content_index``.
    """

    if page.get("external_renderer"):
        return []
    raw_sections = page.get("sections")
    if not isinstance(raw_sections, list):
        return []
    sections = [section for section in raw_sections if isinstance(section, Mapping)]
    if filename != "contact.html":
        return sections
    return [
        section
        for section in sections
        if normalise_key(section.get("label")).replace(" ", "_") == "contact_form"
    ]


def replaces_final_section(filename: str, order: int, count: int) -> bool:
    """Whether the renderer swaps the final source section for its art CTA."""

    return filename != "contact.html" and order == count


def values_in(value: Any) -> Iterable[Any]:
    if isinstance(value, Mapping):
        for child in value.values():
            yield from values_in(child)
    elif isinstance(value, list):
        for child in value:
            yield from values_in(child)
    else:
        yield value


def keyed_values(value: Any, wanted: set[str]) -> Iterable[Any]:
    if isinstance(value, Mapping):
        for key, child in value.items():
            if str(key).casefold() in wanted:
                yield child
            yield from keyed_values(child, wanted)
    elif isinstance(value, list):
        for child in value:
            yield from keyed_values(child, wanted)


def jsonld_types(value: Any) -> set[str]:
    found: set[str] = set()
    for raw in keyed_values(value, {"@type"}):
        candidates = raw if isinstance(raw, list) else [raw]
        for candidate in candidates:
            if isinstance(candidate, str):
                found.add(candidate.casefold())
    return found


def document_form_blocks(page: Mapping[str, Any]) -> list[Mapping[str, Any]]:
    found: list[Mapping[str, Any]] = []

    def visit(value: Any) -> None:
        if isinstance(value, Mapping):
            if normalise_key(value.get("type")) == "form":
                found.append(value)
                return
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(page.get("sections", []))
    return found


def document_form_fields(form: Mapping[str, Any]) -> list[Mapping[str, Any]]:
    fields: list[Mapping[str, Any]] = []
    seen: set[str] = set()
    for collection in (form.get("fields", []), form.get("acknowledgements", [])):
        if not isinstance(collection, list):
            continue
        for candidate in collection:
            if not isinstance(candidate, Mapping):
                continue
            name = normalise_space(candidate.get("name"))
            if not name or name in seen:
                continue
            fields.append(candidate)
            seen.add(name)
    return fields


def accessibility_feedback_form() -> Mapping[str, Any]:
    return {
        "fields": [
            {"name": "name", "label": "Name", "type": "text", "required": False},
            {"name": "email_or_whatsapp", "label": "Email or WhatsApp", "type": "text", "required": True},
            {"name": "page_or_feature", "label": "Page or feature", "type": "text", "required": False},
            {"name": "accessibility_need_or_problem", "label": "Accessibility need or problem", "type": "textarea", "required": True},
            {"name": "preferred_reply_format", "label": "Preferred reply format", "type": "select", "required": False},
        ]
    }


def document_quotes(page: Mapping[str, Any]) -> set[str]:
    quotes: set[str] = set()

    def visit(value: Any) -> None:
        if isinstance(value, Mapping):
            if normalise_key(value.get("type")) == "quote":
                text = value.get("text") or value.get("quote") or value.get("body")
                if text:
                    quotes.add(normalise_quote(text))
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(page.get("sections", []))
    return quotes


@dataclass
class Heading:
    level: int
    section_index: int | None
    parts: list[str] = field(default_factory=list)

    @property
    def text(self) -> str:
        return normalise_space("".join(self.parts))


@dataclass
class Section:
    raw_order: str
    attrs: dict[str, str]
    headings: list[int] = field(default_factory=list)
    text_parts: list[str] = field(default_factory=list)
    attribute_values: list[str] = field(default_factory=list)

    @property
    def copy_text(self) -> str:
        return normalise_space(" ".join((*self.text_parts, *self.attribute_values)))


@dataclass
class Label:
    for_id: str
    form_index: int | None
    parts: list[str] = field(default_factory=list)
    nested_controls: set[int] = field(default_factory=set)

    @property
    def text(self) -> str:
        return normalise_space("".join(self.parts))


@dataclass
class Control:
    tag: str
    attrs: dict[str, str]
    form_index: int | None
    implicit_labels: set[int] = field(default_factory=set)

    @property
    def identifier(self) -> str:
        return self.attrs.get("id", "")

    @property
    def name(self) -> str:
        return self.attrs.get("name", "")

    @property
    def input_type(self) -> str:
        if self.tag == "select":
            return "select"
        if self.tag == "textarea":
            return "textarea"
        return self.attrs.get("type", "text").casefold() or "text"

    @property
    def required(self) -> bool:
        return "required" in self.attrs


@dataclass
class Form:
    attrs: dict[str, str]
    controls: list[int] = field(default_factory=list)


@dataclass(frozen=True)
class Reference:
    tag: str
    attribute: str
    value: str


@dataclass
class StackEntry:
    tag: str
    marker: str = ""
    marker_value: int | None = None
    text_parts: list[str] | None = None


class SiteHTMLParser(HTMLParser):
    """Small purpose-built HTML audit parser with no third-party dependency."""

    def __init__(self, source: str) -> None:
        super().__init__(convert_charrefs=True)
        self.source = source
        self.stack: list[StackEntry] = []
        self.html_attrs: dict[str, str] = {}
        self.main_count = 0
        self.title_parts: list[list[str]] = []
        self.meta: defaultdict[str, list[str]] = defaultdict(list)
        self.links: list[dict[str, str]] = []
        self.jsonld_parts: list[list[str]] = []
        self.headings: list[Heading] = []
        self.sections: list[Section] = []
        self.labels: list[Label] = []
        self.controls: list[Control] = []
        self.forms: list[Form] = []
        self.ids: list[str] = []
        self.references: list[Reference] = []
        self.partial_mounts: Counter[str] = Counter()
        self.partial_placeholders: Counter[str] = Counter()
        self.embedded_partial_mounts: Counter[str] = Counter()
        self.partial_conflicts: list[str] = []
        self.visible_parts: list[str] = []
        self.blockquotes: list[list[str]] = []
        self.q_elements: list[list[str]] = []

    def _active(self, marker: str) -> int | None:
        for entry in reversed(self.stack):
            if entry.marker == marker:
                return entry.marker_value
        return None

    def _has_tag(self, tag: str) -> bool:
        return any(entry.tag == tag for entry in self.stack)

    def _attrs(self, attrs: list[tuple[str, str | None]]) -> dict[str, str]:
        return {name.casefold(): value or "" for name, value in attrs}

    def _record_attributes(self, tag: str, attrs: dict[str, str]) -> None:
        identifier = attrs.get("id")
        if identifier:
            self.ids.append(identifier)

        compiled_partial = attrs.get("data-loaded-partial", "")
        canonical_partial = attrs.get("data-sofiati-partial", "")
        legacy_partial = attrs.get("data-partial", "")
        placeholder_partial = attrs.get("data-sf-partial", "")
        partial = placeholder_partial or compiled_partial or canonical_partial or legacy_partial
        if partial:
            self.partial_mounts[partial] += 1
        if placeholder_partial:
            self.partial_placeholders[placeholder_partial] += 1
            if tag != "template":
                self.partial_conflicts.append(
                    f"{tag} uses data-sf-partial={placeholder_partial!r}; placeholders must be template elements"
                )
        if compiled_partial:
            self.embedded_partial_mounts[compiled_partial] += 1
        declared = {
            value for value in (placeholder_partial, compiled_partial, canonical_partial, legacy_partial)
            if value
        }
        if len(declared) > 1:
            self.partial_conflicts.append(
                f"{tag} has conflicting shared-component declarations: {sorted(declared)}"
            )

        for attribute in ("href", "src", "poster", "action"):
            value = attrs.get(attribute)
            if value:
                self.references.append(Reference(tag, attribute, value))
        srcset = attrs.get("srcset", "")
        if srcset:
            for candidate in srcset.split(","):
                value = candidate.strip().split()[0] if candidate.strip() else ""
                if value:
                    self.references.append(Reference(tag, "srcset", value))
        for _quote, value in URL_IN_STYLE_RE.findall(attrs.get("style", "")):
            if value:
                self.references.append(Reference(tag, "style", value.strip()))

        section_index = self._active("section")
        if section_index is not None and tag not in NON_VISIBLE_ELEMENTS:
            for name in COPY_ATTRIBUTE_NAMES:
                value = attrs.get(name)
                if value:
                    self.sections[section_index].attribute_values.append(value)

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        tag = tag.casefold()
        attrs = self._attrs(attrs_list)
        self._record_attributes(tag, attrs)
        entry = StackEntry(tag)

        if tag == "html" and not self.html_attrs:
            self.html_attrs = attrs
        elif tag == "main":
            self.main_count += 1
            entry.marker = "main"
            entry.marker_value = self.main_count - 1
        elif tag == "body":
            entry.marker = "body"
            entry.marker_value = 0
        elif tag == "section" and self._active("main") is not None and attrs.get("data-section"):
            section_index = len(self.sections)
            self.sections.append(Section(attrs["data-section"], attrs))
            entry.marker = "section"
            entry.marker_value = section_index
        elif tag == "form":
            form_index = len(self.forms)
            self.forms.append(Form(attrs))
            entry.marker = "form"
            entry.marker_value = form_index
        elif tag == "label":
            label_index = len(self.labels)
            self.labels.append(Label(attrs.get("for", ""), self._active("form")))
            entry.marker = "label"
            entry.marker_value = label_index
            entry.text_parts = self.labels[label_index].parts

        if tag in CONTROL_TAGS:
            form_index = self._active("form")
            implicit_label = self._active("label")
            control_index = len(self.controls)
            control = Control(tag, attrs, form_index)
            if implicit_label is not None:
                control.implicit_labels.add(implicit_label)
                self.labels[implicit_label].nested_controls.add(control_index)
            self.controls.append(control)
            if form_index is not None:
                self.forms[form_index].controls.append(control_index)

        if tag == "title":
            parts: list[str] = []
            self.title_parts.append(parts)
            entry.text_parts = parts
        elif tag == "meta":
            key = attrs.get("property") or attrs.get("name")
            if key:
                self.meta[key.casefold()].append(attrs.get("content", ""))
        elif tag == "link":
            self.links.append(attrs)
        elif tag == "script" and attrs.get("type", "").casefold() == "application/ld+json":
            parts = []
            self.jsonld_parts.append(parts)
            entry.text_parts = parts
        elif re.fullmatch(r"h[1-6]", tag) and self._active("main") is not None:
            heading_index = len(self.headings)
            section_index = self._active("section")
            self.headings.append(Heading(int(tag[1]), section_index))
            if section_index is not None:
                self.sections[section_index].headings.append(heading_index)
            entry.marker = "heading"
            entry.marker_value = heading_index
            entry.text_parts = self.headings[heading_index].parts
        elif tag == "blockquote":
            parts = []
            self.blockquotes.append(parts)
            entry.text_parts = parts
        elif tag == "q":
            parts = []
            self.q_elements.append(parts)
            entry.text_parts = parts

        if tag not in VOID_ELEMENTS:
            self.stack.append(entry)

    def handle_startendtag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        self.handle_starttag(tag, attrs)
        if tag.casefold() not in VOID_ELEMENTS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.casefold()
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, data: str) -> None:
        if not data:
            return
        for entry in self.stack:
            if entry.text_parts is not None:
                entry.text_parts.append(data)
        if (
            self._active("body") is not None
            and not any(entry.tag in NON_VISIBLE_ELEMENTS for entry in self.stack)
        ):
            self.visible_parts.append(data)
            section_index = self._active("section")
            if section_index is not None:
                self.sections[section_index].text_parts.append(data)

    @property
    def titles(self) -> list[str]:
        return [normalise_space("".join(parts)) for parts in self.title_parts]

    @property
    def visible_text(self) -> str:
        return normalise_space(" ".join(self.visible_parts))


@dataclass(frozen=True)
class Issue:
    scope: str
    message: str


class Checker:
    def __init__(self, root: Path, content_path: Path) -> None:
        self.root = root.resolve()
        self.content_path = content_path.resolve()
        self.issues: list[Issue] = []
        self.content: Mapping[str, Any] = {}
        self.pages: dict[str, Mapping[str, Any]] = {}
        self.seo: Mapping[str, Any] = {}
        self.shared: Mapping[str, Any] = {}
        self.testimonials: Mapping[str, Any] = {}
        self.audits: dict[str, SiteHTMLParser] = {}
        self.id_cache: dict[Path, set[str]] = {}
        self.domain = ""

    def add(self, scope: str, message: str) -> None:
        self.issues.append(Issue(scope, message))

    def load_inputs(self) -> bool:
        paths = {
            "content master": self.content_path,
            "SEO data": self.root / DEFAULT_SEO.relative_to(ROOT),
            "shared-site data": self.root / DEFAULT_SHARED.relative_to(ROOT),
            "testimonial data": self.root / DEFAULT_TESTIMONIALS.relative_to(ROOT),
        }
        loaded: dict[str, Any] = {}
        for label, path in paths.items():
            if not path.is_file():
                self.add("global", f"missing {label}: {path.relative_to(self.root)}")
                continue
            try:
                loaded[label] = load_json(path)
            except (OSError, json.JSONDecodeError) as error:
                self.add("global", f"invalid {label} {path.relative_to(self.root)}: {error}")
        if "content master" not in loaded:
            return False
        self.content = as_mapping(loaded["content master"])
        self.seo = as_mapping(loaded.get("SEO data"))
        self.shared = as_mapping(loaded.get("shared-site data"))
        self.testimonials = as_mapping(loaded.get("testimonial data"))
        self.domain = str(self.seo.get("domain") or "https://www.francielesofiati.com").rstrip("/")
        self.validate_content_index()
        return True

    def validate_content_index(self) -> None:
        raw_pages = self.content.get("pages")
        if not isinstance(raw_pages, Mapping):
            self.add("global", "content master has no pages object")
            return
        by_filename: dict[str, Mapping[str, Any]] = {}
        for slug, value in raw_pages.items():
            if not isinstance(value, Mapping):
                self.add("global", f"content page {slug!r} is not an object")
                continue
            filename = normalise_space(value.get("filename")) or f"{slug}.html"
            by_filename[filename] = value
        missing = sorted(set(ENGLISH_PAGES) - set(by_filename))
        extra = sorted(set(by_filename) - set(ENGLISH_PAGES))
        if missing:
            self.add("global", f"content master missing pages: {', '.join(missing)}")
        if extra:
            self.add("global", f"content master has unexpected pages: {', '.join(extra)}")
        self.pages = by_filename

        order = self.content.get("page_order")
        expected_slugs = [Path(filename).stem for filename in ENGLISH_PAGES]
        if order != expected_slugs:
            self.add("global", "content master page_order does not match the 21-page contract")
        for filename, page in by_filename.items():
            sections = page.get("sections")
            if not isinstance(sections, list) or not sections:
                self.add(filename, "content master must define at least one section")
                continue
            numbers = [section.get("number") for section in sections if isinstance(section, Mapping)]
            expected_orders = list(range(1, len(sections) + 1))
            if numbers != expected_orders:
                self.add(filename, f"content-master section order is {numbers}, expected {expected_orders}")
            seo = as_mapping(page.get("seo"))
            if not seo.get("title") or not seo.get("meta_description"):
                self.add(filename, "content master is missing SEO title or meta description")

    def parse_pages(self) -> None:
        for filename in ENGLISH_PAGES:
            path = self.root / filename
            if not path.is_file():
                self.add(filename, "missing root HTML file")
                continue
            try:
                source = path.read_text(encoding="utf-8")
                audit = SiteHTMLParser(source)
                audit.feed(source)
                audit.close()
            except (OSError, UnicodeError) as error:
                self.add(filename, f"could not read/parse HTML: {error}")
                continue
            self.audits[filename] = audit
            self.id_cache[path.resolve()] = set(audit.ids)

    def canonical_url(self, filename: str) -> str:
        return f"{self.domain}/" if filename == "index.html" else f"{self.domain}/{filename}"

    def portuguese_url(self, filename: str) -> str:
        return f"{self.domain}/pt/" if filename == "index.html" else f"{self.domain}/pt/{filename}"

    def validate_page(self, filename: str) -> None:
        audit = self.audits.get(filename)
        page = self.pages.get(filename)
        if audit is None or page is None:
            return
        self.validate_structure(filename, page, audit)
        self.validate_content_fidelity(filename, page, audit)
        self.validate_head(filename, page, audit)
        self.validate_jsonld(filename, page, audit)
        self.validate_partials(filename, audit)
        self.validate_forms(filename, page, audit)
        self.validate_language(filename, audit)
        self.validate_contact(filename, audit)

    def validate_structure(
        self, filename: str, page: Mapping[str, Any], audit: SiteHTMLParser
    ) -> None:
        language = audit.html_attrs.get("lang", "")
        if not language.casefold().startswith("en"):
            self.add(filename, f"html lang must be English, found {language!r}")
        if audit.main_count != 1:
            self.add(filename, f"expected exactly one main element, found {audit.main_count}")

        duplicate_ids = sorted(identifier for identifier, count in Counter(audit.ids).items() if count > 1)
        if duplicate_ids:
            self.add(filename, f"duplicate IDs: {', '.join(duplicate_ids)}")

        raw_orders = [section.raw_order for section in audit.sections]
        try:
            orders = [int(value) for value in raw_orders]
        except ValueError:
            orders = []
        expected_sections = published_sections(filename, page)
        if not page.get("external_renderer"):
            expected_orders = list(range(1, len(expected_sections) + 1))
            if orders != expected_orders:
                self.add(filename, f"top-level data-section order is {raw_orders}, expected {expected_orders}")

        h1s = [heading for heading in audit.headings if heading.level == 1]
        if len(h1s) != 1:
            self.add(filename, f"expected exactly one H1, found {len(h1s)}")

        empty = [f"H{heading.level}" for heading in audit.headings if not heading.text]
        if empty:
            self.add(filename, f"empty headings found: {', '.join(empty)}")
        jumps: list[str] = []
        previous: Heading | None = None
        for heading in audit.headings:
            if previous is not None and heading.level > previous.level + 1:
                jumps.append(
                    f"H{previous.level} {previous.text!r} -> H{heading.level} {heading.text!r}"
                )
            previous = heading
        if jumps:
            self.add(filename, "heading hierarchy skips levels: " + "; ".join(jumps))

        sections_by_order: dict[int, list[Section]] = defaultdict(list)
        for section in audit.sections:
            try:
                sections_by_order[int(section.raw_order)].append(section)
            except ValueError:
                continue
        missing_headings: list[str] = []
        wrong_levels: list[str] = []
        for order, expected in enumerate(expected_sections, start=1):
            # The renderer deliberately replaces the final authored content
            # block with an approved, page-specific art CTA concept.
            if replaces_final_section(filename, order, len(expected_sections)):
                continue
            if not isinstance(expected, Mapping):
                continue
            expected_heading = normalise_space(expected.get("heading"))
            candidates = sections_by_order.get(order, [])
            if len(candidates) != 1:
                missing_headings.append(f"{order:02d} {expected_heading!r}")
                continue
            section_headings = [audit.headings[index] for index in candidates[0].headings]
            exact = [
                heading
                for heading in section_headings
                if normalise_key(heading.text) == normalise_key(expected_heading)
            ]
            if not exact:
                missing_headings.append(f"{order:02d} {expected_heading!r}")
                continue
            expected_level = 1 if order == 1 else 2
            if not any(heading.level == expected_level for heading in exact):
                actual = "/".join(f"H{heading.level}" for heading in exact)
                wrong_levels.append(f"section {order:02d} is {actual}, expected H{expected_level}")
        if missing_headings:
            self.add(filename, "missing exact document section headings: " + "; ".join(missing_headings))
        if wrong_levels:
            self.add(filename, "document section heading levels are wrong: " + "; ".join(wrong_levels))

        if h1s and expected_sections and isinstance(expected_sections[0], Mapping):
            expected_h1 = normalise_space(expected_sections[0].get("heading"))
            if normalise_space(h1s[0].text) != expected_h1:
                self.add(filename, f"H1 must exactly match document heading {expected_h1!r}")

    def _section_copy_expectations(
        self, section: Mapping[str, Any]
    ) -> list[tuple[str, str]]:
        """Extract semantic copy from one content-master section.

        This deliberately follows the lossless extractor's public block
        schema instead of walking every JSON string.  Fields such as
        ``raw_text``, ``source_rows``, hashes, Word styles and layout markers
        preserve source mechanics; requiring them in HTML would turn a
        fidelity check into an implementation-detail check.
        """

        expectations: list[tuple[str, str]] = []
        seen: set[str] = set()

        def add(value: Any, origin: str) -> None:
            if not isinstance(value, str):
                return
            key = fidelity_key(value)
            if not key or key in seen:
                return
            seen.add(key)
            expectations.append((key, f"{origin}: {normalise_space(value)!r}"))

        def item_copy(item: Any, origin: str) -> None:
            if isinstance(item, str):
                add(item, origin)
                return
            if not isinstance(item, Mapping):
                return
            for key in ("title", "heading", "label", "term"):
                if item.get(key):
                    add(item[key], f"{origin} {key}")
                    break
            for key in ("text", "body", "description", "definition", "answer"):
                if item.get(key):
                    add(item[key], f"{origin} {key}")
                    break
            nested = item.get("items")
            if isinstance(nested, list):
                for index, child in enumerate(nested, start=1):
                    item_copy(child, f"{origin} item {index}")

        def block_copy(block: Any, origin: str) -> None:
            if isinstance(block, str):
                add(block, origin)
                return
            if not isinstance(block, Mapping):
                return
            kind = normalise_key(block.get("type"))
            if kind in {"paragraph", "heading"}:
                add(block.get("text"), f"{origin} {kind}")
                return
            if kind == "quote":
                add(block.get("text"), f"{origin} quote")
                add(block.get("attribution"), f"{origin} attribution")
                return
            if kind == "list":
                items = block.get("items")
                if isinstance(items, list):
                    for index, item in enumerate(items, start=1):
                        item_copy(item, f"{origin} list item {index}")
                return
            if kind == "steps":
                items = block.get("items")
                if isinstance(items, list):
                    for index, item in enumerate(items, start=1):
                        item_copy(item, f"{origin} step {index}")
                return
            if kind == "actions":
                items = block.get("items")
                if isinstance(items, list):
                    for index, item in enumerate(items, start=1):
                        if isinstance(item, Mapping):
                            add(item.get("label"), f"{origin} action {index}")
                        else:
                            add(item, f"{origin} action {index}")
                return
            if kind == "cards":
                rows = block.get("rows")
                if not isinstance(rows, list):
                    return
                card_index = 0
                for row in rows:
                    if not isinstance(row, Mapping) or not isinstance(row.get("cells"), list):
                        continue
                    for cell in row["cells"]:
                        if not isinstance(cell, Mapping):
                            continue
                        card_index += 1
                        title = cell.get("title_text") or cell.get("title")
                        add(title, f"{origin} card {card_index} title")
                        nested = cell.get("blocks")
                        if not isinstance(nested, list):
                            continue
                        start = 0
                        if nested and isinstance(nested[0], Mapping):
                            first_text = nested[0].get("text")
                            if title and fidelity_key(first_text) == fidelity_key(title):
                                start = 1
                        for index, child in enumerate(nested[start:], start=start + 1):
                            block_copy(child, f"{origin} card {card_index} block {index}")
                return
            if kind == "form":
                fields = block.get("fields")
                if isinstance(fields, list):
                    for index, field in enumerate(fields, start=1):
                        if not isinstance(field, Mapping):
                            continue
                        field_type = normalise_key(field.get("type"))
                        acknowledgement = field.get("acknowledgement")
                        if field_type == "checkbox" and acknowledgement:
                            add(acknowledgement, f"{origin} field {index} acknowledgement")
                        else:
                            add(field.get("label"), f"{origin} field {index} label")
                        add(field.get("placeholder"), f"{origin} field {index} placeholder")
                        add(field.get("helper"), f"{origin} field {index} helper")
                        options = field.get("options")
                        if isinstance(options, list):
                            for option_index, option in enumerate(options, start=1):
                                item_copy(option, f"{origin} field {index} option {option_index}")
                submit = block.get("submit")
                if isinstance(submit, Mapping):
                    add(
                        submit.get("label") or submit.get("text") or submit.get("title"),
                        f"{origin} submit",
                    )
                else:
                    add(submit, f"{origin} submit")
                states = block.get("status_messages")
                if isinstance(states, Mapping):
                    for state, value in states.items():
                        if isinstance(value, Mapping):
                            add(value.get("title"), f"{origin} {state} status title")
                            add(value.get("message"), f"{origin} {state} status message")
                        else:
                            add(value, f"{origin} {state} status")
                return

        add(section.get("label"), "section label")
        add(section.get("heading"), "section heading")
        blocks = section.get("blocks")
        if isinstance(blocks, list):
            for index, block in enumerate(blocks, start=1):
                block_copy(block, f"block {index}")
        return expectations

    def validate_content_fidelity(
        self, filename: str, page: Mapping[str, Any], audit: SiteHTMLParser
    ) -> None:
        """Require every semantic source string in its rendered section."""

        expected_sections = published_sections(filename, page)
        if not expected_sections:
            return
        sections_by_order: defaultdict[int, list[Section]] = defaultdict(list)
        for section in audit.sections:
            try:
                sections_by_order[int(section.raw_order)].append(section)
            except ValueError:
                continue
        for order, expected in enumerate(expected_sections, start=1):
            # Final sections are intentionally replaced by the unique CTA
            # component assigned to that page.
            if replaces_final_section(filename, order, len(expected_sections)):
                continue
            candidates = sections_by_order.get(order, [])
            if not isinstance(expected, Mapping) or len(candidates) != 1:
                continue
            rendered = fidelity_key(candidates[0].copy_text)
            missing = [
                description
                for key, description in self._section_copy_expectations(expected)
                if key not in rendered
            ]
            if missing:
                self.add(
                    filename,
                    f"section {order:02d} is missing {len(missing)} content-master "
                    f"string(s): {'; '.join(missing)}",
                )

    def _single_meta(
        self,
        filename: str,
        audit: SiteHTMLParser,
        key: str,
        expected: str | None = None,
    ) -> str:
        values = audit.meta.get(key.casefold(), [])
        if len(values) != 1:
            self.add(filename, f"expected one {key} meta tag, found {len(values)}")
            return values[0] if values else ""
        value = normalise_space(values[0])
        if expected is not None and value != normalise_space(expected):
            self.add(filename, f"{key} must exactly equal {normalise_space(expected)!r}, found {value!r}")
        return value

    def validate_head(
        self, filename: str, page: Mapping[str, Any], audit: SiteHTMLParser
    ) -> None:
        seo = as_mapping(page.get("seo"))
        external = bool(page.get("external_renderer"))
        expected_title = None if external else normalise_space(seo.get("title"))
        expected_description = None if external else normalise_space(seo.get("meta_description"))
        canonical = self.canonical_url(filename)

        if len(audit.titles) != 1:
            self.add(filename, f"expected one title element, found {len(audit.titles)}")
        elif expected_title is not None and audit.titles[0] != expected_title:
            self.add(filename, f"title must exactly equal {expected_title!r}, found {audit.titles[0]!r}")
        description = self._single_meta(filename, audit, "description", expected_description)
        if not description:
            self.add(filename, "description must have a non-empty value")

        canonical_links = [
            link
            for link in audit.links
            if "canonical" in link.get("rel", "").casefold().split()
        ]
        if len(canonical_links) != 1:
            self.add(filename, f"expected one canonical link, found {len(canonical_links)}")
        elif canonical_links[0].get("href") != canonical:
            self.add(filename, f"canonical must be {canonical!r}")

        alternates: defaultdict[str, list[str]] = defaultdict(list)
        for link in audit.links:
            if "alternate" not in link.get("rel", "").casefold().split():
                continue
            hreflang = link.get("hreflang", "")
            if hreflang:
                alternates[hreflang].append(link.get("href", ""))
        expected_alternates = {
            "en": canonical,
            "pt-BR": self.portuguese_url(filename),
            "x-default": canonical,
        }
        for language, expected in expected_alternates.items():
            values = alternates.get(language, [])
            if values != [expected]:
                self.add(filename, f"hreflang {language} must be exactly {expected!r}, found {values}")

        for key, expected in (
            ("og:title", expected_title),
            ("og:description", expected_description),
            ("og:url", canonical),
            ("twitter:title", expected_title),
            ("twitter:description", expected_description),
        ):
            value = self._single_meta(filename, audit, key, expected)
            if not value:
                self.add(filename, f"{key} must have a non-empty value")
        for key in ("og:type", "og:image", "twitter:card", "twitter:image"):
            value = self._single_meta(filename, audit, key)
            if not value:
                self.add(filename, f"{key} must have a non-empty value")

        for key in ("og:image", "twitter:image"):
            for value in audit.meta.get(key, []):
                audit.references.append(Reference("meta", key, value))

    def validate_jsonld(
        self, filename: str, page: Mapping[str, Any], audit: SiteHTMLParser
    ) -> None:
        if not audit.jsonld_parts:
            self.add(filename, "missing application/ld+json structured data")
            return
        parsed_documents: list[Any] = []
        for index, parts in enumerate(audit.jsonld_parts, start=1):
            raw = "".join(parts).strip()
            if not raw:
                self.add(filename, f"JSON-LD block {index} is empty")
                continue
            try:
                value = json.loads(raw)
            except json.JSONDecodeError as error:
                self.add(filename, f"JSON-LD block {index} is invalid JSON: {error}")
                continue
            if not isinstance(value, (dict, list)):
                self.add(filename, f"JSON-LD block {index} root must be an object or array")
                continue
            parsed_documents.append(value)

        if not parsed_documents:
            return
        if not any(list(keyed_values(document, {"@context"})) for document in parsed_documents):
            self.add(filename, "JSON-LD has no @context")
        if not any(jsonld_types(document) for document in parsed_documents):
            self.add(filename, "JSON-LD has no @type")

        canonical = self.canonical_url(filename)
        page_urls: set[str] = set()
        descriptions: set[str] = set()
        emails: set[str] = set()
        telephones: set[str] = set()
        types: set[str] = set()
        has_review_key = False
        for document in parsed_documents:
            types.update(jsonld_types(document))
            for raw in keyed_values(document, {"url", "mainentityofpage", "@id"}):
                if isinstance(raw, str):
                    page_urls.add(raw.split("#", 1)[0])
                elif isinstance(raw, Mapping):
                    for nested in keyed_values(raw, {"url", "@id"}):
                        if isinstance(nested, str):
                            page_urls.add(nested.split("#", 1)[0])
            descriptions.update(
                normalise_space(raw)
                for raw in keyed_values(document, {"description"})
                if isinstance(raw, str)
            )
            emails.update(
                raw.casefold()
                for raw in keyed_values(document, {"email"})
                if isinstance(raw, str)
            )
            telephones.update(
                digits(raw)
                for raw in keyed_values(document, {"telephone"})
                if isinstance(raw, str)
            )
            has_review_key = has_review_key or any(
                True for _ in keyed_values(document, {"review", "reviews", "aggregaterating", "ratingvalue"})
            )
            for raw in keyed_values(document, {"image", "logo", "thumbnailurl"}):
                if isinstance(raw, str):
                    audit.references.append(Reference("json-ld", "asset", raw))

        if canonical not in page_urls:
            self.add(filename, f"JSON-LD does not identify the canonical page URL {canonical!r}")
        if page.get("external_renderer"):
            descriptions_from_head = audit.meta.get("description", [])
            expected_description = normalise_space(
                descriptions_from_head[0] if len(descriptions_from_head) == 1 else ""
            )
        else:
            expected_description = normalise_space(as_mapping(page.get("seo")).get("meta_description"))
        if expected_description not in descriptions:
            self.add(filename, "JSON-LD does not contain the exact document meta description")

        expected_email = str(self.seo.get("email") or "").casefold()
        if emails and emails != {expected_email}:
            self.add(filename, f"JSON-LD email values are inconsistent: {sorted(emails)}")
        expected_phone = digits(self.seo.get("telephone"))
        if telephones and telephones != {expected_phone}:
            self.add(filename, f"JSON-LD telephone values are inconsistent: {sorted(telephones)}")
        if has_review_key or types.intersection({"review", "aggregaterating"}):
            self.add(filename, "review/rating JSON-LD is not permitted for these testimonials")

    def validate_partials(self, filename: str, audit: SiteHTMLParser) -> None:
        for conflict in audit.partial_conflicts:
            self.add(filename, conflict)
        for name in EXPECTED_PARTIALS:
            count = audit.partial_placeholders.get(name, 0)
            if count != 1:
                self.add(filename, f"expected one {name!r} template placeholder, found {count}")
            embedded = audit.embedded_partial_mounts.get(name, 0)
            if embedded:
                self.add(filename, f"expected no embedded {name!r} component, found {embedded}")
        unexpected = sorted(set(audit.partial_mounts) - set(EXPECTED_PARTIALS))
        if unexpected:
            self.add(filename, f"unexpected shared components: {', '.join(unexpected)}")

    def _label_texts(self, audit: SiteHTMLParser, control_index: int) -> list[str]:
        control = audit.controls[control_index]
        texts = [audit.labels[index].text for index in sorted(control.implicit_labels)]
        identifier = control.identifier
        if identifier:
            texts.extend(label.text for label in audit.labels if label.for_id == identifier)
        return [text for text in texts if text]

    def _ignored_control(self, control: Control) -> bool:
        if control.input_type in NON_LABELLED_INPUT_TYPES:
            return True
        classes = set(control.attrs.get("class", "").casefold().split())
        return (
            "sf-honeypot" in classes
            or control.attrs.get("aria-hidden", "").casefold() == "true"
            and control.attrs.get("tabindex") == "-1"
        )

    def validate_forms(
        self, filename: str, page: Mapping[str, Any], audit: SiteHTMLParser
    ) -> None:
        for label in audit.labels:
            if label.for_id and label.for_id not in set(audit.ids):
                self.add(filename, f"label for={label.for_id!r} has no matching control ID")
        unlabelled: list[str] = []
        for index, control in enumerate(audit.controls):
            if control.form_index is None or self._ignored_control(control):
                continue
            if not self._label_texts(audit, index):
                unlabelled.append(control.name or control.identifier or f"{control.tag}#{index + 1}")
        if unlabelled:
            self.add(filename, f"form controls without associated label elements: {', '.join(unlabelled)}")

        document_forms = [
            (index, form)
            for index, form in enumerate(audit.forms)
            if "sf-form" in form.attrs.get("class", "").split()
            or "data-enhanced-form" in form.attrs
            or "data-consultation-form" in form.attrs
        ]
        endpoint = normalise_space(as_mapping(self.shared.get("forms")).get("endpoint"))
        if page.get("external_renderer"):
            for form_index, html_form in document_forms:
                action = html_form.attrs.get("action", "")
                method = html_form.attrs.get("method", "").casefold()
                if endpoint and action != endpoint:
                    self.add(filename, f"document form action must use verified endpoint {endpoint!r}, found {action!r}")
                if method != "post":
                    self.add(filename, f"document form method must be post, found {method!r}")
                control_indices = audit.forms[form_index].controls
                has_honeypot = any(
                    self._ignored_control(audit.controls[index])
                    and audit.controls[index].name
                    for index in control_indices
                )
                if not has_honeypot:
                    self.add(filename, "document form has no static honeypot/spam-protection field")
            return

        expected_forms = document_form_blocks(page)
        if filename == "accessibility.html" and not expected_forms:
            expected_forms = [accessibility_feedback_form()]
        if len(document_forms) != len(expected_forms):
            self.add(
                filename,
                f"expected {len(expected_forms)} document form(s), found {len(document_forms)}",
            )
            return

        for pair_index, (form_index, html_form) in enumerate(document_forms):
            expected_form = expected_forms[pair_index]
            action = html_form.attrs.get("action", "")
            method = html_form.attrs.get("method", "").casefold()
            if endpoint and action != endpoint:
                self.add(filename, f"document form action must use verified endpoint {endpoint!r}, found {action!r}")
            if method != "post":
                self.add(filename, f"document form method must be post, found {method!r}")

            control_indices = audit.forms[form_index].controls
            controls_by_name: defaultdict[str, list[int]] = defaultdict(list)
            for control_index in control_indices:
                control = audit.controls[control_index]
                if self._ignored_control(control):
                    continue
                if control.name:
                    controls_by_name[control.name].append(control_index)

            expected_fields = document_form_fields(expected_form)
            expected_names = [normalise_space(field.get("name")) for field in expected_fields]
            missing = [name for name in expected_names if name not in controls_by_name]
            extras = sorted(set(controls_by_name) - set(expected_names))
            if missing:
                self.add(filename, f"document form missing fields: {', '.join(missing)}")
            if extras:
                self.add(filename, f"document form has unexpected fields: {', '.join(extras)}")

            required_mismatches: list[str] = []
            type_mismatches: list[str] = []
            label_mismatches: list[str] = []
            for expected in expected_fields:
                name = normalise_space(expected.get("name"))
                indices = controls_by_name.get(name, [])
                if not indices:
                    continue
                expected_required = bool(expected.get("required"))
                if any(audit.controls[index].required != expected_required for index in indices):
                    required_mismatches.append(f"{name}={expected_required}")
                expected_type = normalise_key(expected.get("type") or "text")
                if expected_type in {"acknowledgement", "consent"}:
                    expected_type = "checkbox"
                actual_types = {audit.controls[index].input_type for index in indices}
                if expected_type not in actual_types:
                    type_mismatches.append(f"{name}: expected {expected_type}, found {sorted(actual_types)}")
                if expected_type != "checkbox":
                    expected_label = normalise_key(expected.get("label"))
                    actual_labels = [
                        normalise_key(text)
                        for index in indices
                        for text in self._label_texts(audit, index)
                    ]
                    if expected_label and not any(expected_label in text for text in actual_labels):
                        label_mismatches.append(name)
            if required_mismatches:
                self.add(filename, "required-state mismatches: " + ", ".join(required_mismatches))
            if type_mismatches:
                self.add(filename, "field type mismatches: " + "; ".join(type_mismatches))
            if label_mismatches:
                self.add(filename, "field labels differ from document: " + ", ".join(label_mismatches))

            has_honeypot = any(
                self._ignored_control(audit.controls[index])
                and audit.controls[index].name
                for index in control_indices
            )
            if not has_honeypot:
                self.add(filename, "document form has no static honeypot/spam-protection field")

    def validate_language(self, filename: str, audit: SiteHTMLParser) -> None:
        matches = sorted({normalise_key(match.group(0)) for match in PORTUGUESE_RE.finditer(audit.visible_text)})
        if matches:
            self.add(filename, f"obvious Portuguese text on English page: {', '.join(matches)}")

    def allowed_emails(self) -> set[str]:
        shared_contact = as_mapping(self.shared.get("contact"))
        professional = as_mapping(self.shared.get("professional"))
        return {
            normalise_key(value)
            for value in (
                self.seo.get("email"),
                self.seo.get("privacyEmail"),
                shared_contact.get("email"),
                professional.get("officialPrivacyEmail"),
                "yourname@email.com",
                "name@example.com",
            )
            if value
        }

    def validate_contact(self, filename: str, audit: SiteHTMLParser) -> None:
        emails = {match.group(1).casefold() for match in EMAIL_RE.finditer(audit.source)}
        unknown_emails = sorted(emails - self.allowed_emails())
        if unknown_emails:
            self.add(filename, f"unverified/inconsistent email addresses: {', '.join(unknown_emails)}")

        expected_phone = digits(self.seo.get("telephone"))
        expected_instagram = urlsplit(str(as_mapping(self.shared.get("contact")).get("instagramHref") or "")).path.strip("/").casefold()
        bad_phones: set[str] = set()
        bad_whatsapp: set[str] = set()
        bad_instagram: set[str] = set()
        for reference in audit.references:
            value = reference.value.strip()
            parsed = urlsplit(value)
            if parsed.scheme.casefold() == "tel" and digits(parsed.path) != expected_phone:
                bad_phones.add(value)
            hostname = (parsed.hostname or "").casefold()
            if hostname in {"wa.me", "www.wa.me"} and digits(parsed.path) != expected_phone:
                bad_whatsapp.add(value)
            if hostname in {"instagram.com", "www.instagram.com"}:
                handle = parsed.path.strip("/").casefold()
                if expected_instagram and handle != expected_instagram:
                    bad_instagram.add(value)
        if bad_phones:
            self.add(filename, f"telephone links disagree with verified number: {sorted(bad_phones)}")
        if bad_whatsapp:
            self.add(filename, f"WhatsApp links disagree with verified number: {sorted(bad_whatsapp)}")
        if bad_instagram:
            self.add(filename, f"Instagram links disagree with verified profile: {sorted(bad_instagram)}")

        expected_registration = digits(self.seo.get("professionalRegistration"))
        registrations = {match.group(1) for match in REGISTRATION_RE.finditer(audit.source)}
        if registrations and registrations != {expected_registration}:
            self.add(filename, f"professional registration values are inconsistent: {sorted(registrations)}")

    def _same_site(self, hostname: str | None) -> bool:
        expected = (urlsplit(self.domain).hostname or "").casefold().removeprefix("www.")
        actual = (hostname or "").casefold().removeprefix("www.")
        return bool(actual) and actual == expected

    def resolve_reference(self, filename: str, value: str) -> tuple[Path | None, str, str | None]:
        value = value.strip()
        if not value:
            return None, "", "empty URL"
        parsed = urlsplit(value)
        scheme = parsed.scheme.casefold()
        if scheme == "javascript":
            return None, "", "javascript: URL is not permitted"
        if scheme in EXTERNAL_SCHEMES:
            return None, "", None
        if scheme in {"http", "https"} and not self._same_site(parsed.hostname):
            return None, "", None
        if scheme and scheme not in {"http", "https"}:
            return None, "", None
        if parsed.netloc and not self._same_site(parsed.hostname):
            return None, "", None

        path_text = unquote(parsed.path)
        fragment = unquote(parsed.fragment)
        base = (self.root / filename).parent
        if not path_text:
            target = self.root / filename
        elif path_text.startswith("/"):
            target = self.root / path_text.lstrip("/")
        elif filename in ENGLISH_PAGES and path_text.startswith("../assets/"):
            # Inline CSS custom properties are consumed by the root stylesheet.
            target = self.root / path_text.removeprefix("../")
        else:
            target = base / path_text
        if path_text.endswith("/") or (target.exists() and target.is_dir()):
            target = target / "index.html"
        target = target.resolve()
        try:
            target.relative_to(self.root)
        except ValueError:
            return target, fragment, "local URL escapes the repository root"
        if value == "#":
            return target, fragment, "empty fragment target"
        return target, fragment, None

    def ids_for_path(self, path: Path) -> set[str]:
        path = path.resolve()
        if path in self.id_cache:
            return self.id_cache[path]
        if not path.is_file() or path.suffix.casefold() not in {".html", ".htm"}:
            return set()
        try:
            source = path.read_text(encoding="utf-8")
            parser = SiteHTMLParser(source)
            parser.feed(source)
            parser.close()
            ids = set(parser.ids)
        except (OSError, UnicodeError):
            ids = set()
        self.id_cache[path] = ids
        return ids

    def validate_references(self) -> None:
        for filename, audit in self.audits.items():
            missing: list[str] = []
            bad: list[str] = []
            bad_fragments: list[str] = []
            seen: set[tuple[str, str, str]] = set()
            for reference in audit.references:
                identity = (reference.tag, reference.attribute, reference.value)
                if identity in seen:
                    continue
                seen.add(identity)
                target, fragment, error = self.resolve_reference(filename, reference.value)
                descriptor = f"{reference.tag}[{reference.attribute}]={reference.value!r}"
                if error:
                    bad.append(f"{descriptor} ({error})")
                    continue
                if target is None:
                    continue
                if not target.exists():
                    missing.append(descriptor)
                    continue
                if fragment and target.suffix.casefold() in {".html", ".htm"}:
                    if fragment not in self.ids_for_path(target) and fragment != "top":
                        bad_fragments.append(descriptor)
            if missing:
                self.add(filename, "missing local link/asset targets: " + "; ".join(missing))
            if bad:
                self.add(filename, "invalid local URLs: " + "; ".join(bad))
            if bad_fragments:
                self.add(filename, "missing fragment IDs: " + "; ".join(bad_fragments))

    def validate_shared_data(self) -> None:
        contact = as_mapping(self.shared.get("contact"))
        professional = as_mapping(self.shared.get("professional"))
        reviews = as_mapping(self.shared.get("reviews"))
        if self.seo.get("email") and contact.get("email") != self.seo.get("email"):
            self.add("global", "shared contact email disagrees with data/seo.json")
        if self.seo.get("privacyEmail") and professional.get("officialPrivacyEmail") != self.seo.get("privacyEmail"):
            self.add("global", "shared privacy email disagrees with data/seo.json")
        review_urls = {
            normalise_space(value)
            for value in (
                self.seo.get("googleReviewsUrl"),
                self.testimonials.get("googleReviewsUrl"),
                reviews.get("googleReviewsUrl"),
            )
            if value
        }
        if len(review_urls) != 1:
            self.add("global", f"Google review URLs are inconsistent: {sorted(review_urls)}")

    def approved_testimonial_texts(self) -> list[str]:
        approved: list[str] = []
        items = self.testimonials.get("items")
        if isinstance(items, list):
            for item in items:
                if isinstance(item, Mapping) and item.get("en"):
                    approved.append(normalise_space(item["en"]))
        return approved

    def validate_testimonials(self) -> None:
        approved = self.approved_testimonial_texts()
        if len(approved) != 4 or len(set(approved)) != 4:
            self.add("global", f"expected exactly four unique approved English testimonials, found {approved}")
        page = self.pages.get("testimonials.html", {})
        master_quotes = document_quotes(page)
        missing_from_master = [text for text in approved if normalise_quote(text) not in master_quotes]
        if missing_from_master:
            self.add("global", f"testimonial data is not backed by content master: {missing_from_master}")

        audit = self.audits.get("testimonials.html")
        if audit:
            visible = normalise_key(audit.visible_text)
            missing_visible = [text for text in approved if normalise_key(text) not in visible]
            if missing_visible:
                self.add("testimonials.html", f"approved testimonials missing from page: {missing_visible}")
            unexpected_quotes = sorted(
                {
                    normalise_quote(
                        re.sub(r"\s*patient words\s*$", "", "".join(parts), flags=re.I)
                    )
                    for parts in audit.blockquotes
                    if normalise_quote(
                        re.sub(r"\s*patient words\s*$", "", "".join(parts), flags=re.I)
                    )
                    and normalise_quote(
                        re.sub(r"\s*patient words\s*$", "", "".join(parts), flags=re.I)
                    ) not in master_quotes
                }
            )
            if unexpected_quotes:
                self.add("testimonials.html", f"blockquote copy is not in the content master: {unexpected_quotes}")

        approved_keys = {normalise_quote(text) for text in approved}
        for filename, page_audit in self.audits.items():
            q_values = {
                normalise_quote("".join(parts))
                for parts in page_audit.q_elements
                if normalise_quote("".join(parts))
            }
            unapproved_q = sorted(q_values - approved_keys)
            if unapproved_q:
                self.add(filename, f"unapproved patient-style <q> text: {unapproved_q}")
            known = [text for text in KNOWN_UNAPPROVED_TESTIMONIALS if normalise_key(text) in normalise_key(page_audit.source)]
            if known:
                self.add(filename, f"known unapproved testimonial statements present: {known}")
            if RATING_RE.search(page_audit.visible_text):
                self.add(filename, "hard-coded star/rating language is not permitted")

    def validate_sitemap_and_robots(self) -> None:
        sitemap = self.root / "sitemap.xml"
        if not sitemap.is_file():
            self.add("global", "missing sitemap.xml")
        else:
            try:
                tree = ET.parse(sitemap)
                locations = [
                    normalise_space(node.text)
                    for node in tree.getroot().iter()
                    if node.tag.rsplit("}", 1)[-1] == "loc" and normalise_space(node.text)
                ]
                duplicates = sorted(value for value, count in Counter(locations).items() if count > 1)
                if duplicates:
                    self.add("global", f"sitemap has duplicate locations: {duplicates}")
                missing = [self.canonical_url(page) for page in SITEMAP_PAGES if self.canonical_url(page) not in locations]
                if missing:
                    self.add("global", f"sitemap missing English URLs: {missing}")
                if self.canonical_url("404.html") in locations:
                    self.add("global", "sitemap must not publish the 404 URL")
            except (OSError, ET.ParseError) as error:
                self.add("global", f"invalid sitemap.xml: {error}")

        robots = self.root / "robots.txt"
        if not robots.is_file():
            self.add("global", "missing robots.txt")
        else:
            try:
                text = robots.read_text(encoding="utf-8")
            except (OSError, UnicodeError) as error:
                self.add("global", f"could not read robots.txt: {error}")
            else:
                expected = f"Sitemap: {self.domain}/sitemap.xml"
                if expected.casefold() not in text.casefold():
                    self.add("global", f"robots.txt must declare {expected!r}")
                if re.search(r"(?im)^\s*disallow\s*:\s*/\s*$", text):
                    self.add("global", "robots.txt blocks the entire site")

    def run(self) -> list[Issue]:
        if not self.load_inputs():
            return self.issues
        self.parse_pages()
        self.validate_shared_data()
        for filename in ENGLISH_PAGES:
            self.validate_page(filename)
        self.validate_references()
        self.validate_testimonials()
        self.validate_sitemap_and_robots()
        scope_order = {"global": -1, **{name: index for index, name in enumerate(ENGLISH_PAGES)}}
        self.issues.sort(key=lambda issue: (scope_order.get(issue.scope, 999), issue.message))
        return self.issues


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT, help="Repository root (default: script parent).")
    parser.add_argument(
        "--content",
        type=Path,
        default=DEFAULT_CONTENT,
        help="Structured English content master JSON.",
    )
    parser.add_argument("--json", action="store_true", help="Print a machine-readable JSON report.")
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    checker = Checker(args.root, args.content)
    issues = checker.run()
    scopes = sorted({issue.scope for issue in issues if issue.scope != "global"})
    if args.json:
        print(
            json.dumps(
                {
                    "ok": not issues,
                    "pages_expected": len(ENGLISH_PAGES),
                    "pages_parsed": len(checker.audits),
                    "issue_count": len(issues),
                    "affected_pages": scopes,
                    "issues": [issue.__dict__ for issue in issues],
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    elif issues:
        print(
            f"English site check failed: {len(issues)} issue(s); "
            f"{len(checker.audits)}/{len(ENGLISH_PAGES)} pages parsed.",
            file=sys.stderr,
        )
        current_scope = ""
        for issue in issues:
            if issue.scope != current_scope:
                current_scope = issue.scope
                print(f"\n[{current_scope}]", file=sys.stderr)
            print(f"- {issue.message}", file=sys.stderr)
    else:
        print(
            f"English site checks passed for all {len(ENGLISH_PAGES)} pages: "
            "content, metadata, structured data, partials, links/assets, forms, "
            "language, contact details, testimonials, sitemap and robots.txt."
        )
    return 1 if issues else 0


if __name__ == "__main__":
    raise SystemExit(main())
