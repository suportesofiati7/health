#!/usr/bin/env python3
"""Audit the Sofiati static concept inventory, metadata and section rules."""

from __future__ import annotations

import sys
from pathlib import Path

import sofiati_complete_system as sofiati


ROOT = Path(__file__).resolve().parents[1]


def report_passes(content: str) -> bool:
    marker = "## Status\n"
    if marker not in content:
        return False
    status = content.split(marker, 1)[1].splitlines()[0].strip()
    return status == "PASS"


def main() -> int:
    reports = {
        "page-inventory-audit.md": sofiati.page_inventory_audit(),
        "sitemap-audit.md": sofiati.sitemap_audit(),
        "planning-files-audit.md": sofiati.planning_audit(),
        "section-attribute-validation.md": sofiati.section_attribute_audit(),
        "seo-validation.md": sofiati.seo_report(),
        "schema-validation.md": sofiati.schema_report(),
        "alt-text-validation.md": sofiati.alt_text_report(),
        "final-completion-report.md": sofiati.final_completion_report(),
    }
    failed = False
    for filename, content in reports.items():
        path = sofiati.REPORTS / filename
        sofiati.write_if_changed(path, content)
        if not report_passes(content):
            failed = True
    print(f"Static audit reports written to {sofiati.REPORTS.relative_to(ROOT)}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
