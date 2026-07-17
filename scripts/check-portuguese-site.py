#!/usr/bin/env python3
"""Validate English/PT-BR parity, language purity, links and shared partials."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from pt_translation.validation import validate_site  # noqa: E402


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--page", action="append")
    parser.add_argument("--strict-warnings", action="store_true")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    summary = validate_site(args.root.resolve(), args.page)
    for issue in summary.issues:
        stream = sys.stderr if issue.level == "error" else sys.stdout
        print(f"{issue.level.upper()}: {issue.unit}: {issue.message}", file=stream)
    print(
        f"Portuguese validation checked {summary.checked} units: "
        f"{len(summary.failures)} errors, {len(summary.warnings)} warnings."
    )
    return 1 if summary.failures or (args.strict_warnings and summary.warnings) else 0


if __name__ == "__main__":
    raise SystemExit(main())
