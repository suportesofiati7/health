#!/usr/bin/env python3
"""Validate the authoritative CSS manifest, tokens and cascade constraints."""

from __future__ import annotations

import argparse
import importlib.util
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "css" / "src"
BUILD_SCRIPT = ROOT / "scripts" / "build-css.py"
TOKEN_PATTERN = re.compile(r"^\s*(--[a-z0-9-]+)\s*:", re.IGNORECASE | re.MULTILINE)
TOKEN_USE_PATTERN = re.compile(r"var\(\s*(--[a-z0-9-]+)", re.IGNORECASE)
HEX_PATTERN = re.compile(r"(?<![\w-])#[0-9a-f]{3,8}\b", re.IGNORECASE)
POSITIONAL_PATTERN = re.compile(r":nth-(?:child|of-type|last-child|last-of-type)\s*\(", re.IGNORECASE)


def load_manifest() -> tuple[str, ...]:
    spec = importlib.util.spec_from_file_location("sofiati_build_css", BUILD_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError("Could not load scripts/build-css.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return tuple(module.SOURCES)


def strip_comments(value: str) -> str:
    return re.sub(r"/\*.*?\*/", "", value, flags=re.DOTALL)


def selector_specificity(selector: str) -> tuple[int, int, int]:
    selector = re.sub(r":where\([^)]*\)", "", selector)
    ids = len(re.findall(r"#[a-z0-9_-]+", selector, re.IGNORECASE))
    classes = len(re.findall(r"\.[a-z0-9_-]+|\[[^]]+\]|:(?!:)[a-z0-9_-]+", selector, re.IGNORECASE))
    elements = len(re.findall(r"(?:^|[\s>+~,(])([a-z][a-z0-9-]*)", selector, re.IGNORECASE))
    return ids, classes, elements


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--strict-unused", action="store_true", help="Treat unused token declarations as errors.")
    args = parser.parse_args()
    sources = load_manifest()
    errors: list[str] = []
    warnings: list[str] = []
    definitions: list[tuple[str, str]] = []
    uses: Counter[str] = Counter()

    for relative in sources:
        path = SOURCE_ROOT / relative
        if not path.is_file():
            errors.append(f"missing manifest source: css/src/{relative}")
            continue
        source = path.read_text(encoding="utf-8")
        code = strip_comments(source)
        definitions.extend((token, relative) for token in TOKEN_PATTERN.findall(code))
        uses.update(TOKEN_USE_PATTERN.findall(code))

        if relative != "foundations/tokens.css":
            for line_number, line in enumerate(code.splitlines(), start=1):
                if HEX_PATTERN.search(line):
                    errors.append(f"css/src/{relative}:{line_number}: raw hex colour outside tokens")

        for line_number, line in enumerate(source.splitlines(), start=1):
            if "!important" in line and "important:" not in line:
                errors.append(f"css/src/{relative}:{line_number}: undocumented !important")
            if POSITIONAL_PATTERN.search(line):
                errors.append(f"css/src/{relative}:{line_number}: positional selector")

        for prelude in re.findall(r"(?:^|})\s*([^@{}][^{}]*)\{", code):
            for selector in prelude.split(","):
                specificity = selector_specificity(selector.strip())
                if specificity[0] > 1 or specificity[1] > 6:
                    warnings.append(
                        f"css/src/{relative}: high specificity {specificity}: {selector.strip()}"
                    )

        if code.count("{") != code.count("}"):
            errors.append(f"css/src/{relative}: unmatched braces")

    counts = Counter(token for token, _relative in definitions)
    for token, count in sorted(counts.items()):
        if count > 1:
            locations = ", ".join(relative for name, relative in definitions if name == token)
            errors.append(f"duplicate token {token} ({count} definitions): {locations}")

    unused = sorted(token for token in counts if uses[token] == 0)
    for token in unused:
        message = f"unused token: {token}"
        (errors if args.strict_unused else warnings).append(message)

    print(f"CSS architecture: {len(sources)} active modules; {len(counts)} tokens; {len(errors)} errors; {len(warnings)} warnings.")
    for message in errors:
        print(f"ERROR {message}")
    for message in warnings:
        print(f"WARN  {message}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
