#!/usr/bin/env python3
"""Run a safe performance audit and turn the results into an action report.

By default it does not alter page markup, CSS, JavaScript, or images. With
--apply-safe-fixes it may add verified intrinsic dimensions to local raster
images that have neither width nor height. That narrow change reduces CLS
without changing an image, its URL, loading behaviour, CSS, or existing markup.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import shutil
import subprocess
import sys
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
VALIDATION = ROOT / "reports" / "performance" / "validation.json"
REPORT = ROOT / "reports" / "maintenance" / "weekly-performance.md"
QUICK_ROUTES = "index.html,treatments.html,consultation.html"


def command(label: str, *args: str) -> tuple[str, bool, str]:
    result = subprocess.run(args, cwd=ROOT, text=True, capture_output=True)
    output = "\n".join(line.strip() for line in (result.stdout + "\n" + result.stderr).splitlines() if line.strip())
    return label, result.returncode == 0, output or "No output returned."


def metric_actions(validation: dict[str, Any]) -> list[str]:
    actions: list[str] = []
    for group in validation.get("groups", []):
        route = group.get("route", "unknown route")
        profile = group.get("profile", "unknown profile")
        summary = group.get("summary", {})
        performance = summary.get("performance", {}).get("median")
        lcp = summary.get("lcpMs", {}).get("median")
        cls = summary.get("cls", {}).get("median")
        transfer = summary.get("totalTransferBytes", {}).get("median")
        largest = group.get("largestResources", [])
        prefix = f"`{route}` ({profile})"
        if isinstance(lcp, (int, float)) and lcp > (2200 if profile == "mobile" else 1800):
            actions.append(f"{prefix}: LCP is {lcp:.0f} ms. Inspect the reported LCP element and its image/font before changing layout.")
        if isinstance(cls, (int, float)) and cls > 0.05:
            actions.append(f"{prefix}: CLS is {cls:.3f}. Reserve dimensions for the shifting element; do not hide it or change page structure blindly.")
        if isinstance(performance, (int, float)) and performance < (95 if profile == "mobile" else 98):
            actions.append(f"{prefix}: performance score is {performance:.0f}. Review the largest transferred resource and any unused CSS/JavaScript shown in the validation JSON.")
        if isinstance(transfer, (int, float)) and transfer > 900 * 1024:
            actions.append(f"{prefix}: initial transfer is {transfer / 1024:.0f} KB. Prioritize the largest image or third-party request below.")
        for resource in largest[:1]:
            size = resource.get("transferBytes")
            url = resource.get("url")
            if isinstance(size, (int, float)) and size > 200 * 1024 and isinstance(url, str):
                actions.append(f"{prefix}: largest resource is `{url}` ({size / 1024:.0f} KB); review its dimensions, compression and loading priority.")
    return actions


def main() -> int:
    parser = argparse.ArgumentParser(description="Create a weekly, evidence-based performance maintenance report.")
    parser.add_argument("--full", action="store_true", help="Audit all representative routes on mobile and desktop (slower).")
    parser.add_argument("--report-only", action="store_true", help="Write actions from the latest audit without running a new audit.")
    parser.add_argument("--safe-fixes", action="store_true", help="Preview the narrowly safe fixes this script can make.")
    parser.add_argument("--apply-safe-fixes", action="store_true", help="Apply verified intrinsic image dimensions, then validate the site.")
    arguments = parser.parse_args()

    if arguments.report_only and (arguments.safe_fixes or arguments.apply_safe_fixes):
        parser.error("--report-only cannot be combined with a safe-fix option")

    results: list[tuple[str, bool, str]] = []
    try:
        if arguments.safe_fixes or arguments.apply_safe_fixes:
            fixer = ["node", "scripts/performance/safe-image-dimensions.mjs"]
            if arguments.apply_safe_fixes:
                fixer.append("--apply")
            results.append(command("Apply safe image-dimension fixes" if arguments.apply_safe_fixes else "Preview safe image-dimension fixes", *fixer))
            if arguments.apply_safe_fixes:
                results.append(command("Validate local asset references after safe fixes", "python3", "scripts/check-local-assets.py"))
        if not arguments.report_only:
            results.append(command("Build disposable production output", "npm", "run", "build"))
            results.append(command("Refresh image inventory", "node", "scripts/performance/image-audit.mjs"))
            audit = ["node", "scripts/performance/performance-audit.mjs", "--source", "dist", "--label", "final"]
            if arguments.full:
                audit.extend(["--profile", "both", "--runs", "3"])
            else:
                audit.extend(["--profile", "mobile", "--runs", "1", "--routes", QUICK_ROUTES])
            results.append(command("Run Lighthouse performance audit", *audit))
            results.append(command("Check performance budgets", "node", "scripts/performance/check-performance-budgets.mjs"))

        if not VALIDATION.is_file():
            raise RuntimeError("No performance validation exists. Run without --report-only first.")
        validation = json.loads(VALIDATION.read_text(encoding="utf-8"))
        actions = metric_actions(validation)
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        lines = [
            "# Weekly performance maintenance report",
            "",
            f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
            "",
            "## Checks",
            "",
            *([f"- {'PASS' if passed else 'FAIL'} — {label}: {output}" for label, passed, output in results] or ["- Report-only run; using the latest validation report."]),
            "",
            "## Recommended fixes",
            "",
            *((f"- {action}" for action in actions) if actions else ("- No metric crossed the maintenance thresholds in the latest audit.",)),
            "",
            "## Safe automation boundary",
            "",
            "By default the script refreshes generated build and audit files only. `--apply-safe-fixes` is limited to adding verified intrinsic dimensions to local raster images that have neither `width` nor `height`; it never resizes/replaces images, changes CSS, defers scripts, or overrides existing markup.",
            "",
        ]
        REPORT.write_text("\n".join(lines), encoding="utf-8")
        print(f"Wrote {REPORT.relative_to(ROOT)}")
        return 0 if all(passed for _, passed, _ in results) else 1
    finally:
        if not arguments.report_only and DIST.is_dir():
            shutil.rmtree(DIST)


if __name__ == "__main__":
    sys.exit(main())
