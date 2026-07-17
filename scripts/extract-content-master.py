#!/usr/bin/env python3
"""Extract the Franciele Sofiati Word content master into deterministic JSON.

The extractor uses only Python's standard library. It reads WordprocessingML
directly so paragraph order, paragraph styles, lists, table cells, quotations,
calls to action, and form copy remain available to downstream renderers.

Typical usage:

    python3 scripts/extract-content-master.py \
      --primary /path/to/franciele-sofiati-website-content-master-complete.docx \
      --supplementary "/path/to/Docs para site - Sofiati.docx" \
      --brief /path/to/pasted-text.txt

Use ``--check`` to verify that ``data/content-master.json`` is current without
rewriting it.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence
from xml.etree import ElementTree as ET
from zipfile import BadZipFile, ZipFile


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "data" / "content-master.json"
PRIMARY_FILENAME = "franciele-sofiati-website-content-master-complete.docx"
SUPPLEMENTARY_FILENAME = "Docs para site - Sofiati.docx"

EXPECTED_PAGE_FILES = (
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
EXPECTED_SECTIONS_PER_UNIT = 10

WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
W = f"{{{WORD_NS}}}"

SECTION_PATTERN = re.compile(
    r"^(?P<marker>\S+)\s+(?P<number>\d{2})\s+·\s+(?P<label>.+)$"
)
ACTION_PATTERN = re.compile(r"^(?P<label>.+?)\s+(?P<indicator>[→↗])\s*$")
CARD_HEADER_PATTERN = re.compile(
    r"^(?P<marker>[✦◇○◎↗⌁◌✓＋→!]|\d{2})\s{2,}(?P<title>.+)$"
)
SUPPLEMENTARY_SECTION_PATTERN = re.compile(r"^\d{2}\s+—\s+.+$")


class ExtractionError(ValueError):
    """Raised when the source no longer matches the documented structure."""


@dataclass(frozen=True)
class Paragraph:
    """A non-rendered Word paragraph with exact visible text."""

    text: str
    style_id: str
    style: str
    list_level: int | None = None
    numbering_id: int | None = None


@dataclass(frozen=True)
class Cell:
    """A Word table cell in source order."""

    paragraphs: tuple[Paragraph, ...]
    grid_span: int
    vertical_merge: str | None


@dataclass(frozen=True)
class Table:
    """A Word table in source order."""

    rows: tuple[tuple[Cell, ...], ...]
    style_id: str


@dataclass(frozen=True)
class Element:
    """One supported top-level Word body element."""

    kind: str
    paragraph: Paragraph | None = None
    table: Table | None = None


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256_text_sequence(items: Iterable[str]) -> str:
    payload = "\u241e".join(items).encode("utf-8")
    return sha256_bytes(payload)


def normalise_style(style_id: str) -> str:
    if not style_id:
        return "body"
    value = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", style_id)
    value = re.sub(r"(?<=[A-Za-z])(?=\d)|(?<=\d)(?=[A-Za-z])", "_", value)
    value = re.sub(r"[^A-Za-z0-9]+", "_", value)
    return value.strip("_").lower() or "body"


def stable_name(label: str) -> str:
    value = unicodedata.normalize("NFKD", label)
    value = "".join(character for character in value if not unicodedata.combining(character))
    value = value.casefold()
    value = re.sub(r"[^a-z0-9]+", "_", value)
    return value.strip("_")


def slug_for_filename(filename: str) -> str:
    if not filename.endswith(".html"):
        raise ExtractionError(f"Page filename does not end in .html: {filename!r}")
    return filename[:-5]


def source_candidates(filename: str) -> tuple[Path, ...]:
    return (
        ROOT / "data" / "source" / filename,
        ROOT / "references" / filename,
        Path.home() / "Downloads" / filename,
    )


def locate_source(requested: Path | None, filename: str, required: bool = True) -> Path | None:
    candidates = (requested,) if requested is not None else source_candidates(filename)
    for candidate in candidates:
        if candidate is not None and candidate.is_file():
            return candidate.resolve()
    if not required:
        return None
    locations = ", ".join(str(path) for path in candidates if path is not None)
    raise ExtractionError(f"Could not find {filename!r}. Checked: {locations}")


def paragraph_text(node: ET.Element) -> str:
    parts: list[str] = []
    for descendant in node.iter():
        if descendant.tag == W + "t":
            parts.append(descendant.text or "")
        elif descendant.tag == W + "tab":
            parts.append("\t")
        elif descendant.tag in {W + "br", W + "cr"}:
            parts.append("\n")
        elif descendant.tag == W + "noBreakHyphen":
            parts.append("‑")
        elif descendant.tag == W + "softHyphen":
            parts.append("\u00ad")
    return "".join(parts)


def parse_paragraph(node: ET.Element) -> Paragraph:
    style_id = ""
    list_level: int | None = None
    numbering_id: int | None = None
    properties = node.find(W + "pPr")
    if properties is not None:
        style_node = properties.find(W + "pStyle")
        if style_node is not None:
            style_id = style_node.get(W + "val", "")
        numbering = properties.find(W + "numPr")
        if numbering is not None:
            level_node = numbering.find(W + "ilvl")
            id_node = numbering.find(W + "numId")
            if level_node is not None:
                list_level = int(level_node.get(W + "val", "0"))
            if id_node is not None:
                numbering_id = int(id_node.get(W + "val", "0"))
    return Paragraph(
        text=paragraph_text(node),
        style_id=style_id,
        style=normalise_style(style_id),
        list_level=list_level,
        numbering_id=numbering_id,
    )


def direct_cell_paragraphs(node: ET.Element) -> tuple[Paragraph, ...]:
    paragraphs: list[Paragraph] = []
    for child in node:
        if child.tag == W + "p":
            paragraph = parse_paragraph(child)
            if paragraph.text:
                paragraphs.append(paragraph)
        elif child.tag == W + "tbl":
            raise ExtractionError("Nested Word tables are not supported by this content schema.")
    return tuple(paragraphs)


def parse_cell(node: ET.Element) -> Cell:
    properties = node.find(W + "tcPr")
    grid_span = 1
    vertical_merge: str | None = None
    if properties is not None:
        span_node = properties.find(W + "gridSpan")
        if span_node is not None:
            grid_span = int(span_node.get(W + "val", "1"))
        merge_node = properties.find(W + "vMerge")
        if merge_node is not None:
            vertical_merge = merge_node.get(W + "val", "continue")
    return Cell(
        paragraphs=direct_cell_paragraphs(node),
        grid_span=grid_span,
        vertical_merge=vertical_merge,
    )


def parse_table(node: ET.Element) -> Table:
    style_id = ""
    properties = node.find(W + "tblPr")
    if properties is not None:
        style_node = properties.find(W + "tblStyle")
        if style_node is not None:
            style_id = style_node.get(W + "val", "")
    rows = tuple(
        tuple(parse_cell(cell) for cell in row.findall(W + "tc"))
        for row in node.findall(W + "tr")
    )
    return Table(rows=rows, style_id=style_id)


def load_docx_elements(path: Path) -> list[Element]:
    try:
        with ZipFile(path) as archive:
            document_xml = archive.read("word/document.xml")
    except (BadZipFile, KeyError) as error:
        raise ExtractionError(f"Invalid DOCX source {path}: {error}") from error
    root = ET.fromstring(document_xml)
    body = root.find(W + "body")
    if body is None:
        raise ExtractionError(f"DOCX has no Word document body: {path}")
    elements: list[Element] = []
    for child in body:
        if child.tag == W + "p":
            elements.append(Element(kind="paragraph", paragraph=parse_paragraph(child)))
        elif child.tag == W + "tbl":
            elements.append(Element(kind="table", table=parse_table(child)))
        elif child.tag != W + "sectPr":
            raise ExtractionError(f"Unsupported Word body element: {child.tag}")
    return elements


def paragraph_source(paragraph: Paragraph) -> dict[str, Any]:
    result: dict[str, Any] = {
        "text": paragraph.text,
        "style": paragraph.style,
    }
    if paragraph.style_id:
        result["source_style"] = paragraph.style_id
    if paragraph.list_level is not None:
        result["list_level"] = paragraph.list_level
    if paragraph.numbering_id is not None:
        result["numbering_id"] = paragraph.numbering_id
    return result


def paragraph_is_list_item(paragraph: Paragraph) -> bool:
    return (
        paragraph.style.startswith("list_")
        or paragraph.list_level is not None
        or paragraph.text.lstrip().startswith("• ")
    )


def list_item_payload(paragraph: Paragraph) -> dict[str, Any]:
    raw_text = paragraph.text
    explicit_marker = raw_text.lstrip().startswith("• ")
    text = raw_text.lstrip()[2:] if explicit_marker else raw_text
    result: dict[str, Any] = {"text": text}
    if raw_text != text:
        result["raw_text"] = raw_text
        result["marker"] = "•"
    if paragraph.list_level is not None:
        result["level"] = paragraph.list_level
    return result


def paragraph_to_block(paragraph: Paragraph) -> dict[str, Any]:
    heading_match = re.fullmatch(r"heading_(\d+)", paragraph.style)
    if heading_match:
        block: dict[str, Any] = {
            "type": "heading",
            "level": int(heading_match.group(1)),
            "text": paragraph.text,
        }
    elif paragraph.style == "title":
        block = {"type": "heading", "level": 0, "text": paragraph.text}
    else:
        block = {
            "type": "paragraph",
            "style": paragraph.style,
            "text": paragraph.text,
        }
    if paragraph.style_id:
        block["source_style"] = paragraph.style_id
    return block


def paragraphs_to_blocks(paragraphs: Sequence[Paragraph]) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []
    index = 0
    while index < len(paragraphs):
        paragraph = paragraphs[index]
        if paragraph_is_list_item(paragraph):
            ordered = "number" in paragraph.style
            items: list[dict[str, Any]] = []
            source_style = paragraph.style
            while index < len(paragraphs) and paragraph_is_list_item(paragraphs[index]):
                current = paragraphs[index]
                items.append(list_item_payload(current))
                ordered = ordered or "number" in current.style
                index += 1
            blocks.append(
                {
                    "type": "list",
                    "ordered": ordered,
                    "style": source_style,
                    "items": items,
                }
            )
            continue
        blocks.append(paragraph_to_block(paragraph))
        index += 1
    return blocks


def raw_rows(table: Table) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for row in table.rows:
        cells: list[dict[str, Any]] = []
        for cell in row:
            payload: dict[str, Any] = {
                "paragraphs": [paragraph_source(paragraph) for paragraph in cell.paragraphs]
            }
            if cell.grid_span != 1:
                payload["grid_span"] = cell.grid_span
            if cell.vertical_merge is not None:
                payload["vertical_merge"] = cell.vertical_merge
            cells.append(payload)
        rows.append({"cells": cells})
    return rows


def structured_rows(table: Table) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for row in table.rows:
        cells: list[dict[str, Any]] = []
        for cell in row:
            payload: dict[str, Any] = {
                "blocks": paragraphs_to_blocks(cell.paragraphs)
            }
            if cell.paragraphs:
                first_text = cell.paragraphs[0].text
                payload["title"] = first_text
                header_match = CARD_HEADER_PATTERN.match(first_text)
                if header_match:
                    payload["marker"] = header_match.group("marker")
                    payload["title_text"] = header_match.group("title")
            if cell.grid_span != 1:
                payload["grid_span"] = cell.grid_span
            if cell.vertical_merge is not None:
                payload["vertical_merge"] = cell.vertical_merge
            cells.append(payload)
        rows.append({"cells": cells})
    return rows


def table_cells(table: Table) -> list[Cell]:
    return [cell for row in table.rows for cell in row]


def table_is_actions(table: Table) -> bool:
    cells = table_cells(table)
    return bool(cells) and all(
        len(cell.paragraphs) == 1
        and ACTION_PATTERN.match(cell.paragraphs[0].text.rstrip()) is not None
        for cell in cells
    )


def table_is_quote(table: Table) -> bool:
    return any(
        paragraph.style == "quote_text"
        for cell in table_cells(table)
        for paragraph in cell.paragraphs
    )


def table_is_steps(table: Table) -> bool:
    cells = table_cells(table)
    return bool(cells) and all(
        len(cell.paragraphs) >= 3
        and re.fullmatch(r"\d{2}", cell.paragraphs[0].text) is not None
        for cell in cells
    )


def table_to_block(table: Table) -> dict[str, Any]:
    if table_is_actions(table):
        items: list[dict[str, Any]] = []
        for row_index, row in enumerate(table.rows):
            for column_index, cell in enumerate(row):
                raw_text = cell.paragraphs[0].text
                match = ACTION_PATTERN.match(raw_text.rstrip())
                if match is None:
                    raise ExtractionError(f"Invalid action table cell: {raw_text!r}")
                items.append(
                    {
                        "label": match.group("label"),
                        "indicator": match.group("indicator"),
                        "raw_text": raw_text,
                        "row": row_index,
                        "column": column_index,
                    }
                )
        return {
            "type": "actions",
            "items": items,
            "source_rows": raw_rows(table),
        }

    if table_is_quote(table):
        quote_paragraphs = [
            paragraph
            for cell in table_cells(table)
            for paragraph in cell.paragraphs
            if paragraph.style == "quote_text"
        ]
        other_paragraphs = [
            paragraph
            for cell in table_cells(table)
            for paragraph in cell.paragraphs
            if paragraph.style != "quote_text"
        ]
        block: dict[str, Any] = {
            "type": "quote",
            "text": quote_paragraphs[0].text,
            "source_rows": raw_rows(table),
        }
        if len(quote_paragraphs) > 1:
            block["additional_quotes"] = [paragraph.text for paragraph in quote_paragraphs[1:]]
        if other_paragraphs:
            block["attribution"] = other_paragraphs[0].text
        if len(other_paragraphs) > 1:
            block["additional_copy"] = [paragraph.text for paragraph in other_paragraphs[1:]]
        return block

    if table_is_steps(table):
        items = []
        for cell in table_cells(table):
            paragraphs = list(cell.paragraphs)
            item: dict[str, Any] = {
                "number": paragraphs[0].text,
                "title": paragraphs[1].text,
                "text": paragraphs[2].text,
            }
            if len(paragraphs) > 3:
                item["additional_copy"] = [paragraph.text for paragraph in paragraphs[3:]]
            items.append(item)
        return {
            "type": "steps",
            "items": items,
            "source_rows": raw_rows(table),
        }

    block = {
        "type": "cards",
        "rows": structured_rows(table),
    }
    if table.style_id:
        block["source_style"] = table.style_id
    return block


def elements_to_blocks(elements: Sequence[Element]) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []
    pending_paragraphs: list[Paragraph] = []

    def flush_paragraphs() -> None:
        if pending_paragraphs:
            blocks.extend(paragraphs_to_blocks(pending_paragraphs))
            pending_paragraphs.clear()

    for element in elements:
        if element.kind == "paragraph":
            if element.paragraph is None:
                raise ExtractionError("Paragraph element is missing its paragraph payload.")
            if element.paragraph.text:
                pending_paragraphs.append(element.paragraph)
        elif element.kind == "table":
            flush_paragraphs()
            if element.table is None:
                raise ExtractionError("Table element is missing its table payload.")
            blocks.append(table_to_block(element.table))
    flush_paragraphs()
    return blocks


def source_text_sequence(elements: Sequence[Element]) -> list[str]:
    texts: list[str] = []
    for element in elements:
        if element.kind == "paragraph" and element.paragraph is not None:
            if element.paragraph.text:
                texts.append(element.paragraph.text)
        elif element.kind == "table" and element.table is not None:
            for row in element.table.rows:
                for cell in row:
                    texts.extend(paragraph.text for paragraph in cell.paragraphs if paragraph.text)
    return texts


def raw_row_text_sequence(rows: Sequence[dict[str, Any]]) -> list[str]:
    return [
        paragraph["text"]
        for row in rows
        for cell in row["cells"]
        for paragraph in cell["paragraphs"]
        if paragraph["text"]
    ]


def block_text_sequence(block: dict[str, Any]) -> list[str]:
    block_type = block["type"]
    if block_type in {"paragraph", "heading"}:
        return [block["text"]]
    if block_type == "list":
        return [item.get("raw_text", item["text"]) for item in block["items"]]
    if block_type == "cards":
        return [
            text
            for row in block["rows"]
            for cell in row["cells"]
            for nested in cell["blocks"]
            for text in block_text_sequence(nested)
        ]
    if block_type in {"actions", "quote", "steps"}:
        return raw_row_text_sequence(block["source_rows"])
    if block_type == "form":
        return [
            text
            for item in block["items"]
            for text in raw_row_text_sequence(item["source_rows"])
        ]
    raise ExtractionError(f"Unknown block type during fidelity validation: {block_type}")


def blocks_text_sequence(blocks: Sequence[dict[str, Any]]) -> list[str]:
    return [text for block in blocks for text in block_text_sequence(block)]


def infer_field_type(label: str, value: str, options: Sequence[str]) -> str:
    normalised = label.casefold()
    if "acknowledgement" in normalised:
        return "checkbox"
    if "email" in normalised:
        return "email"
    if "phone" in normalised or "whatsapp" in normalised:
        return "tel"
    if "date" in normalised and re.search(r"D{2}/M{2}/Y{4}", value, re.I):
        return "date"
    if label in {"What would you like to understand?", "Your message"}:
        return "textarea"
    if options:
        return "select"
    return "text"


def field_from_table(table: Table) -> dict[str, Any]:
    cells = table_cells(table)
    if len(cells) != 1:
        raise ExtractionError("Form field tables must contain exactly one cell.")
    paragraphs = list(cells[0].paragraphs)
    if len(paragraphs) < 2:
        raise ExtractionError("Form field tables must contain a label and field copy.")
    raw_label = paragraphs[0].text
    required = raw_label.rstrip().endswith("*")
    label = re.sub(r"\s*\*\s*$", "", raw_label)
    value = paragraphs[1].text
    options = [part for part in re.split(r"\s+·\s+", value) if part]
    if len(options) < 2:
        options = []
    field_type = infer_field_type(label, value, options)
    field: dict[str, Any] = {
        "name": stable_name(label),
        "label": label,
        "raw_label": raw_label,
        "type": field_type,
        "required": required,
    }
    if field_type == "checkbox":
        field["acknowledgement"] = value
    elif options:
        field["options"] = options
        field["options_text"] = value
    else:
        field["placeholder"] = value
    if len(paragraphs) > 2:
        field["helper"] = paragraphs[2].text
        length_match = re.search(r"Up to\s+([\d,]+)\s+characters", paragraphs[2].text, re.I)
        if length_match:
            field["max_length"] = int(length_match.group(1).replace(",", ""))
    if len(paragraphs) > 3:
        field["additional_copy"] = [paragraph.text for paragraph in paragraphs[3:]]
    return field


def status_from_table(table: Table) -> tuple[str, dict[str, Any]]:
    cells = table_cells(table)
    paragraphs = list(cells[0].paragraphs) if len(cells) == 1 else []
    if len(paragraphs) < 2:
        raise ExtractionError("Form status tables must contain a title and message.")
    raw_title = paragraphs[0].text
    marker = raw_title.lstrip()[:1]
    if marker == "✓":
        kind = "success"
    elif marker == "!":
        kind = "error"
    else:
        raise ExtractionError(f"Unknown form status marker in {raw_title!r}")
    title = raw_title.lstrip()[1:].strip()
    payload: dict[str, Any] = {
        "title": title,
        "raw_title": raw_title,
        "message": paragraphs[1].text,
    }
    if len(paragraphs) > 2:
        payload["additional_copy"] = [paragraph.text for paragraph in paragraphs[2:]]
    return kind, payload


def form_from_elements(elements: Sequence[Element]) -> dict[str, Any]:
    fields: list[dict[str, Any]] = []
    acknowledgements: list[dict[str, Any]] = []
    submit: dict[str, Any] | None = None
    status_messages: dict[str, dict[str, Any]] = {}
    items: list[dict[str, Any]] = []

    for element in elements:
        if element.kind == "paragraph":
            if element.paragraph is not None and element.paragraph.text:
                raise ExtractionError(
                    f"Unexpected paragraph inside form table sequence: {element.paragraph.text!r}"
                )
            continue
        if element.table is None:
            raise ExtractionError("Form table element is missing its table payload.")
        table = element.table
        rows = raw_rows(table)
        cells = table_cells(table)
        paragraphs = list(cells[0].paragraphs) if len(cells) == 1 else []

        if table_is_actions(table):
            if submit is not None:
                raise ExtractionError("A form contains more than one submit action.")
            raw_text = paragraphs[0].text
            match = ACTION_PATTERN.match(raw_text.rstrip())
            if match is None:
                raise ExtractionError(f"Invalid form submit action: {raw_text!r}")
            submit = {
                "label": match.group("label"),
                "indicator": match.group("indicator"),
                "raw_text": raw_text,
            }
            items.append({"kind": "submit", "source_rows": rows})
            continue

        if paragraphs and paragraphs[0].text.lstrip().startswith(("✓", "!")):
            kind, status = status_from_table(table)
            if kind in status_messages:
                raise ExtractionError(f"A form contains duplicate {kind!r} status messages.")
            status_messages[kind] = status
            items.append({"kind": "status", "status": kind, "source_rows": rows})
            continue

        field = field_from_table(table)
        fields.append(field)
        items.append({"kind": "field", "name": field["name"], "source_rows": rows})
        if field["type"] == "checkbox":
            acknowledgements.append(
                {
                    "name": field["name"],
                    "label": field["label"],
                    "required": field["required"],
                    "text": field["acknowledgement"],
                }
            )

    if submit is None:
        raise ExtractionError("Form is missing its submit action.")
    for required_status in ("success", "error"):
        if required_status not in status_messages:
            raise ExtractionError(f"Form is missing its {required_status} status message.")
    return {
        "type": "form",
        "fields": fields,
        "acknowledgements": acknowledgements,
        "submit": submit,
        "status_messages": status_messages,
        "items": items,
    }


def first_content_table_index(elements: Sequence[Element]) -> int | None:
    for index, element in enumerate(elements):
        if element.kind == "table":
            return index
    return None


def section_blocks(label: str, elements: Sequence[Element]) -> list[dict[str, Any]]:
    if not label.endswith("FORM"):
        return elements_to_blocks(elements)
    table_index = first_content_table_index(elements)
    if table_index is None:
        raise ExtractionError(f"Form section {label!r} contains no field tables.")
    blocks = elements_to_blocks(elements[:table_index])
    blocks.append(form_from_elements(elements[table_index:]))
    return blocks


def first_nonempty_paragraph_index(elements: Sequence[Element], start: int = 0) -> int:
    for index in range(start, len(elements)):
        element = elements[index]
        if (
            element.kind == "paragraph"
            and element.paragraph is not None
            and element.paragraph.text
        ):
            return index
    raise ExtractionError("Expected a non-empty Word paragraph.")


def first_table_index(elements: Sequence[Element], start: int = 0) -> int:
    for index in range(start, len(elements)):
        if elements[index].kind == "table":
            return index
    raise ExtractionError("Expected a Word table.")


def parse_metadata(table: Table) -> dict[str, Any]:
    values: dict[str, str] = {}
    for row in table.rows:
        if len(row) != 2:
            raise ExtractionError("SEO metadata table rows must contain exactly two cells.")
        key_paragraphs = row[0].paragraphs
        value_paragraphs = row[1].paragraphs
        if len(key_paragraphs) != 1 or len(value_paragraphs) != 1:
            raise ExtractionError("SEO metadata cells must contain exactly one paragraph.")
        values[key_paragraphs[0].text] = value_paragraphs[0].text
    expected_keys = {"SEO TITLE", "META DESCRIPTION", "SEARCH THEMES"}
    if set(values) != expected_keys:
        raise ExtractionError(
            f"SEO metadata keys changed: expected {sorted(expected_keys)}, got {sorted(values)}"
        )
    search_themes = values["SEARCH THEMES"]
    return {
        "title": values["SEO TITLE"],
        "meta_description": values["META DESCRIPTION"],
        "search_themes": search_themes,
        "search_theme_list": [item.strip() for item in search_themes.split(",") if item.strip()],
    }


def parse_section(elements: Sequence[Element]) -> dict[str, Any]:
    marker_index = first_nonempty_paragraph_index(elements)
    marker_paragraph = elements[marker_index].paragraph
    if marker_paragraph is None:
        raise ExtractionError("Section marker paragraph is missing.")
    match = SECTION_PATTERN.match(marker_paragraph.text)
    if match is None:
        raise ExtractionError(f"Invalid section marker: {marker_paragraph.text!r}")
    heading_index = first_nonempty_paragraph_index(elements, marker_index + 1)
    heading_paragraph = elements[heading_index].paragraph
    if heading_paragraph is None or heading_paragraph.style != "heading_2":
        raise ExtractionError(f"Section {marker_paragraph.text!r} is missing its Heading 2.")
    body_elements = elements[heading_index + 1 :]
    label = match.group("label")
    blocks = section_blocks(label, body_elements)
    expected_text = source_text_sequence(body_elements)
    actual_text = blocks_text_sequence(blocks)
    if actual_text != expected_text:
        mismatch = next(
            (
                index,
                expected_text[index] if index < len(expected_text) else None,
                actual_text[index] if index < len(actual_text) else None,
            )
            for index in range(max(len(expected_text), len(actual_text)))
            if index >= len(expected_text)
            or index >= len(actual_text)
            or expected_text[index] != actual_text[index]
        )
        raise ExtractionError(
            f"Text fidelity failure in {marker_paragraph.text!r} at item {mismatch[0]}: "
            f"source={mismatch[1]!r}, output={mismatch[2]!r}"
        )
    return {
        "number": int(match.group("number")),
        "marker": match.group("marker"),
        "label": label,
        "eyebrow": marker_paragraph.text,
        "heading": heading_paragraph.text,
        "blocks": blocks,
        "content_sha256": sha256_text_sequence(expected_text),
    }


def section_ranges(elements: Sequence[Element], start: int) -> list[tuple[int, int]]:
    starts: list[int] = []
    for index in range(start, len(elements)):
        element = elements[index]
        if element.kind != "paragraph" or element.paragraph is None:
            continue
        if SECTION_PATTERN.match(element.paragraph.text):
            starts.append(index)
    return [
        (section_start, starts[index + 1] if index + 1 < len(starts) else len(elements))
        for index, section_start in enumerate(starts)
    ]


def parse_content_unit(filename: str, elements: Sequence[Element]) -> dict[str, Any]:
    if not elements:
        raise ExtractionError(f"Content unit {filename!r} is empty.")
    filename_index = first_nonempty_paragraph_index(elements)
    filename_paragraph = elements[filename_index].paragraph
    if filename_paragraph is None or filename_paragraph.style != "filename":
        raise ExtractionError(f"Content unit {filename!r} does not start with a Filename paragraph.")
    if filename_paragraph.text != filename:
        raise ExtractionError(
            f"Content unit filename mismatch: expected {filename!r}, got {filename_paragraph.text!r}"
        )
    site_label_index = first_nonempty_paragraph_index(elements, filename_index + 1)
    site_label = elements[site_label_index].paragraph
    title_index = first_nonempty_paragraph_index(elements, site_label_index + 1)
    title = elements[title_index].paragraph
    if site_label is None or title is None:
        raise ExtractionError(f"Content unit {filename!r} has an incomplete header.")
    if title.style != "heading_1":
        raise ExtractionError(f"Content unit {filename!r} is missing its Heading 1 title.")
    metadata_index = first_table_index(elements, title_index + 1)
    metadata_table = elements[metadata_index].table
    if metadata_table is None:
        raise ExtractionError(f"Content unit {filename!r} is missing its SEO table.")
    ranges = section_ranges(elements, metadata_index + 1)
    sections = [parse_section(elements[start:end]) for start, end in ranges]
    if len(sections) != EXPECTED_SECTIONS_PER_UNIT:
        raise ExtractionError(
            f"{filename!r} has {len(sections)} sections; "
            f"expected {EXPECTED_SECTIONS_PER_UNIT}."
        )
    section_numbers = [section["number"] for section in sections]
    expected_numbers = list(range(1, EXPECTED_SECTIONS_PER_UNIT + 1))
    if section_numbers != expected_numbers:
        raise ExtractionError(
            f"{filename!r} section numbering is {section_numbers}; expected {expected_numbers}."
        )
    unit: dict[str, Any] = {
        "filename": filename,
        "site_label": site_label.text,
        "title": title.text,
        "seo": parse_metadata(metadata_table),
        "sections": sections,
    }
    if filename.endswith(".html"):
        unit["slug"] = slug_for_filename(filename)
    return unit


def filename_boundaries(elements: Sequence[Element]) -> dict[str, tuple[int, int]]:
    starts: list[tuple[str, int]] = []
    for index, element in enumerate(elements):
        if (
            element.kind == "paragraph"
            and element.paragraph is not None
            and element.paragraph.style == "filename"
        ):
            starts.append((element.paragraph.text, index))
    return {
        name: (start, starts[index + 1][1] if index + 1 < len(starts) else len(elements))
        for index, (name, start) in enumerate(starts)
    }


def parse_content_index(elements: Sequence[Element]) -> dict[str, Any]:
    filename_index = first_nonempty_paragraph_index(elements)
    site_label_index = first_nonempty_paragraph_index(elements, filename_index + 1)
    title_index = first_nonempty_paragraph_index(elements, site_label_index + 1)
    metadata_index = first_table_index(elements, title_index + 1)
    filename_paragraph = elements[filename_index].paragraph
    site_label = elements[site_label_index].paragraph
    title = elements[title_index].paragraph
    metadata = elements[metadata_index].table
    if None in {filename_paragraph, site_label, title, metadata}:
        raise ExtractionError("Content index header is incomplete.")
    pages: list[dict[str, Any]] = []
    pattern = re.compile(r"^(?P<number>\d{2})\s+(?P<filename>[^\s]+\.html)$")
    for element in elements[metadata_index + 1 :]:
        if element.kind != "paragraph" or element.paragraph is None:
            continue
        raw_text = element.paragraph.text
        if not raw_text:
            continue
        match = pattern.match(raw_text)
        if match is None:
            raise ExtractionError(f"Invalid content-index page entry: {raw_text!r}")
        pages.append(
            {
                "number": int(match.group("number")),
                "filename": match.group("filename"),
                "raw_text": raw_text,
            }
        )
    if tuple(item["filename"] for item in pages) != EXPECTED_PAGE_FILES:
        raise ExtractionError("The Word content index no longer matches the required 21 pages.")
    if filename_paragraph is None or site_label is None or title is None or metadata is None:
        raise ExtractionError("Content index header is incomplete.")
    return {
        "filename": filename_paragraph.text,
        "site_label": site_label.text,
        "title": title.text,
        "seo": parse_metadata(metadata),
        "pages": pages,
    }


def file_manifest(path: Path) -> dict[str, Any]:
    return {
        "filename": path.name,
        "byte_size": path.stat().st_size,
        "sha256": sha256_file(path),
    }


def supplementary_manifest(path: Path) -> dict[str, Any]:
    elements = load_docx_elements(path)
    paragraphs = [
        element.paragraph.text
        for element in elements
        if element.kind == "paragraph"
        and element.paragraph is not None
        and element.paragraph.text
    ]
    outline = [text for text in paragraphs if SUPPLEMENTARY_SECTION_PATTERN.match(text)]
    result = file_manifest(path)
    result.update(
        {
            "paragraph_count": len(paragraphs),
            "outline": outline,
            "usage": "Context only; not merged into primary content copy.",
        }
    )
    return result


def brief_manifest(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    missing_pages = [filename for filename in EXPECTED_PAGE_FILES if filename not in text]
    if missing_pages:
        raise ExtractionError(
            "The implementation brief does not list every required page: "
            + ", ".join(missing_pages)
        )
    result = file_manifest(path)
    result.update(
        {
            "line_count": len(lines),
            "headings": [line[3:] for line in lines if line.startswith("## ")],
            "usage": "Requirements context only; not merged into primary content copy.",
        }
    )
    return result


def document_stats(
    pages: dict[str, dict[str, Any]], shared: dict[str, Any]
) -> dict[str, Any]:
    page_sections = sum(len(page["sections"]) for page in pages.values())
    forms: list[dict[str, Any]] = []
    quotes = 0
    for unit in [shared, *pages.values()]:
        for section in unit["sections"]:
            for block in section["blocks"]:
                if block["type"] == "form":
                    forms.append(block)
                if block["type"] == "quote":
                    quotes += 1
    return {
        "page_count": len(pages),
        "sections_per_page": EXPECTED_SECTIONS_PER_UNIT,
        "page_section_count": page_sections,
        "shared_section_count": len(shared["sections"]),
        "form_count": len(forms),
        "form_field_count": sum(len(form["fields"]) for form in forms),
        "quote_block_count": quotes,
    }


def extract_content(
    primary_path: Path,
    supplementary_path: Path | None,
    brief_path: Path | None,
) -> dict[str, Any]:
    elements = load_docx_elements(primary_path)
    boundaries = filename_boundaries(elements)
    required_units = {"CONTENT INDEX", "SHARED SITE COPY", *EXPECTED_PAGE_FILES}
    missing_units = sorted(required_units - set(boundaries))
    unexpected_units = sorted(set(boundaries) - required_units)
    if missing_units or unexpected_units:
        raise ExtractionError(
            f"Unexpected Filename records. Missing={missing_units}, unexpected={unexpected_units}"
        )

    content_index_start, content_index_end = boundaries["CONTENT INDEX"]
    shared_start, shared_end = boundaries["SHARED SITE COPY"]
    cover_blocks = elements_to_blocks(elements[:content_index_start])
    cover_source_text = source_text_sequence(elements[:content_index_start])
    if blocks_text_sequence(cover_blocks) != cover_source_text:
        raise ExtractionError("Text fidelity failure in the document cover.")

    content_index = parse_content_index(elements[content_index_start:content_index_end])
    shared = parse_content_unit("SHARED SITE COPY", elements[shared_start:shared_end])
    pages: dict[str, dict[str, Any]] = {}
    for filename in EXPECTED_PAGE_FILES:
        start, end = boundaries[filename]
        page = parse_content_unit(filename, elements[start:end])
        pages[page["slug"]] = page

    sources: dict[str, Any] = {
        "primary": {
            **file_manifest(primary_path),
            "usage": "Sole source of extracted website copy.",
        }
    }
    if supplementary_path is not None:
        sources["supplementary"] = supplementary_manifest(supplementary_path)
    if brief_path is not None:
        sources["brief"] = brief_manifest(brief_path)

    result: dict[str, Any] = {
        "schema_version": 1,
        "language": "en",
        "provenance": {
            "policy": (
                "Website copy is extracted only from the primary content master. "
                "Supplementary material and the implementation brief are recorded as context."
            ),
            "sources": sources,
        },
        "cover": {
            "blocks": cover_blocks,
            "content_sha256": sha256_text_sequence(cover_source_text),
        },
        "content_index": content_index,
        "page_order": [slug_for_filename(filename) for filename in EXPECTED_PAGE_FILES],
        "shared": shared,
        "pages": pages,
    }
    result["stats"] = document_stats(pages, shared)
    validate_content(result)
    return result


def validate_form(page_slug: str, section: dict[str, Any], errors: list[str]) -> None:
    forms = [block for block in section["blocks"] if block["type"] == "form"]
    if len(forms) != 1:
        errors.append(f"{page_slug} section {section['number']}: expected exactly one form block")
        return
    form = forms[0]
    names = [field["name"] for field in form["fields"]]
    if len(names) != len(set(names)):
        errors.append(f"{page_slug} section {section['number']}: duplicate form field names")
    for field in form["fields"]:
        for key in ("name", "label", "raw_label", "type", "required"):
            if key not in field:
                errors.append(
                    f"{page_slug} section {section['number']}: field missing {key!r}"
                )
    if not form.get("submit", {}).get("label"):
        errors.append(f"{page_slug} section {section['number']}: submit label is missing")
    for status in ("success", "error"):
        if status not in form.get("status_messages", {}):
            errors.append(
                f"{page_slug} section {section['number']}: {status} status is missing"
            )


def validate_content(data: dict[str, Any]) -> None:
    errors: list[str] = []
    pages = data.get("pages", {})
    expected_slugs = [slug_for_filename(filename) for filename in EXPECTED_PAGE_FILES]
    if list(pages) != expected_slugs:
        errors.append(
            f"page key order mismatch: expected {expected_slugs}, got {list(pages)}"
        )
    if data.get("page_order") != expected_slugs:
        errors.append("page_order does not match the required architecture")
    if len(pages) != len(EXPECTED_PAGE_FILES):
        errors.append(f"expected 21 pages, found {len(pages)}")

    units: list[tuple[str, dict[str, Any]]] = [("shared", data.get("shared", {}))]
    units.extend((slug, pages.get(slug, {})) for slug in expected_slugs)
    form_locations: list[tuple[str, int]] = []
    for slug, unit in units:
        seo = unit.get("seo", {})
        for key in ("title", "meta_description", "search_themes"):
            if not seo.get(key):
                errors.append(f"{slug}: missing SEO field {key!r}")
        sections = unit.get("sections", [])
        if len(sections) != EXPECTED_SECTIONS_PER_UNIT:
            errors.append(
                f"{slug}: expected {EXPECTED_SECTIONS_PER_UNIT} sections, found {len(sections)}"
            )
        numbers = [section.get("number") for section in sections]
        if numbers != list(range(1, EXPECTED_SECTIONS_PER_UNIT + 1)):
            errors.append(f"{slug}: invalid section order {numbers}")
        for section in sections:
            if not section.get("eyebrow") or not section.get("heading"):
                errors.append(f"{slug} section {section.get('number')}: missing heading copy")
            if any(block.get("type") == "form" for block in section.get("blocks", [])):
                form_locations.append((slug, section["number"]))
                validate_form(slug, section, errors)

    expected_forms = [("consultation", 7), ("contact", 5)]
    if form_locations != expected_forms:
        errors.append(f"form locations changed: expected {expected_forms}, got {form_locations}")

    expected_stats = {
        "page_count": 21,
        "sections_per_page": 10,
        "page_section_count": 210,
        "shared_section_count": 10,
        "form_count": 2,
        "form_field_count": 25,
    }
    for key, expected in expected_stats.items():
        actual = data.get("stats", {}).get(key)
        if actual != expected:
            errors.append(f"stats.{key}: expected {expected}, got {actual}")

    if errors:
        raise ExtractionError("Content validation failed:\n- " + "\n- ".join(errors))


def serialise(data: dict[str, Any]) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n"


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--primary",
        type=Path,
        help=f"Primary content DOCX (default search name: {PRIMARY_FILENAME})",
    )
    parser.add_argument(
        "--supplementary",
        type=Path,
        help=f"Supplementary legal/copy DOCX (default search name: {SUPPLEMENTARY_FILENAME})",
    )
    parser.add_argument(
        "--brief",
        type=Path,
        help="Complete implementation brief text file; recorded as provenance context.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Generated JSON path (default: {DEFAULT_OUTPUT.relative_to(ROOT)})",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Validate that the existing output is byte-for-byte current; do not write.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        primary = locate_source(args.primary, PRIMARY_FILENAME, required=True)
        supplementary = locate_source(
            args.supplementary, SUPPLEMENTARY_FILENAME, required=False
        )
        brief = args.brief.resolve() if args.brief is not None else None
        if brief is not None and not brief.is_file():
            raise ExtractionError(f"Implementation brief does not exist: {brief}")
        if primary is None:
            raise ExtractionError("Primary DOCX could not be resolved.")
        data = extract_content(primary, supplementary, brief)
        output = args.output.resolve()
        rendered = serialise(data)
        if args.check:
            if not output.is_file():
                raise ExtractionError(f"Generated output is missing: {output}")
            existing = output.read_text(encoding="utf-8")
            if existing != rendered:
                raise ExtractionError(
                    f"Generated output is stale: {output.relative_to(ROOT)}"
                )
            action = "verified"
        else:
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(rendered, encoding="utf-8")
            action = "wrote"
        stats = data["stats"]
        print(
            f"Content master {action}: {output.relative_to(ROOT)} "
            f"({stats['page_count']} pages, {stats['page_section_count']} page sections, "
            f"{stats['shared_section_count']} shared sections, "
            f"{stats['form_field_count']} form fields)."
        )
        return 0
    except (ExtractionError, ET.ParseError, OSError) as error:
        print(f"Content extraction failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
