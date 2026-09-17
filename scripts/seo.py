#!/usr/bin/env python3
"""Run the complete local SEO audit and print actionable recommendations.

The default is read-only. ``--apply`` runs only reviewed, deterministic fixes
already maintained by the repository; speculative medical copy, filenames,
alt text, schema and keyword changes are reported for human review instead of
being invented by a bulk rewrite.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import subprocess
import sys
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"


def run(label: str, command: list[str]) -> tuple[bool, str]:
    result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
    output = (result.stdout + "\n" + result.stderr).strip()
    print(f"\n{'PASS' if result.returncode == 0 else 'REVIEW'}  {label}")
    if output:
        print(output[-5000:])
    return result.returncode == 0, output


def external_links() -> list[str]:
    """Check unique external HTTP(S) links without crawling the whole web."""
    from bs4 import BeautifulSoup
    links: set[str] = set()
    for page in ROOT.glob("**/*.html"):
        if any(part in {"dist", "node_modules", ".git", "docs", "management"} for part in page.relative_to(ROOT).parts):
            continue
        soup = BeautifulSoup(page.read_text(encoding="utf-8"), "html.parser")
        links.update(a.get("href", "").split("#", 1)[0] for a in soup.find_all("a", href=True))
    target = {link for link in links if urlparse(link).scheme in {"http", "https"} and "francielesofiati.com" not in urlparse(link).netloc}
    failures: list[str] = []
    for link in sorted(target):
        try:
            request = Request(link, method="HEAD", headers={"User-Agent": "SofiatiSEO/1.0"})
            with urlopen(request, timeout=8) as response:
                if response.status >= 400:
                    failures.append(f"{response.status} {link}")
        except Exception as error:
            failures.append(f"unverified {link} ({type(error).__name__})")
    print(f"\nExternal links checked: {len(target)}; needs review: {len(failures)}")
    for failure in failures[:80]:
        print(f"- {failure}")
    return failures


def recommendations(outputs: list[str], external_failures: list[str]) -> None:
    joined = "\n".join(outputs).lower()
    print("\nACTIONABLE SEO RECOMMENDATIONS")
    if "title" in joined or "description" in joined:
        print("- Review page titles and meta descriptions in the SEO validation report; keep one clear search intent per page.")
    if "alt" in joined or "image" in joined:
        print("- Add descriptive Portuguese and English alt text to meaningful images; use empty alt only for decorative images.")
    if "schema" in joined or "json" in joined:
        print("- Review JSON-LD against the real service, location and professional facts; do not add invented ratings, prices or awards.")
    if "internal" in joined or "orphan" in joined:
        print("- Repair broken/orphan internal links and connect every important page from a relevant hub page.")
    if external_failures:
        print("- Recheck external links marked unverified or failed before replacing them; some sites block automated HEAD requests.")
    print("- Rename files only with a reference map and redirects; update alt text, canonical URLs, sitemap and language links together.")
    print("- Review keyword/tag changes manually for clinical accuracy and Brazilian Portuguese before publishing.")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Complete local SEO, link and metadata audit.")
    parser.add_argument("--apply", action="store_true", help="Apply only reviewed deterministic metadata fixes.")
    parser.add_argument("--no-external", action="store_true", help="Skip external HTTP link checks.")
    args = parser.parse_args(argv)
    commands = [
        ("Local assets", [sys.executable, str(SCRIPTS / "check-local-assets.py")]),
        ("Portuguese/English parity", [sys.executable, str(SCRIPTS / "check-portuguese-site.py"), "--strict-warnings"]),
        ("Discovery files", [sys.executable, str(SCRIPTS / "check-seo-files.py")]),
        ("On-page SEO, schema and images", [sys.executable, str(SCRIPTS / "check-seo-implementation.py")]),
        ("Social previews", [sys.executable, str(SCRIPTS / "check-social-previews.py")]),
        ("Internal links", [sys.executable, str(SCRIPTS / "audit-internal-links.py")]),
    ]
    outputs: list[str] = []
    failures = 0
    for label, command in commands:
        passed, output = run(label, command)
        outputs.append(output)
        failures += not passed
    if args.apply:
        passed, output = run("Refresh robots, sitemap and llms.txt", [sys.executable, str(SCRIPTS / "index-site.py"), "--rebuild", "--no-notify"])
        outputs.append(output)
        failures += not passed
        passed, output = run("Reviewed safe metadata fixes", [sys.executable, str(SCRIPTS / "apply-seo-metadata-fixes.py"), "--apply"])
        outputs.append(output)
        failures += not passed
    external_failures = [] if args.no_external else external_links()
    recommendations(outputs, external_failures)
    print(f"\nSEO audit complete: {failures} local check(s) need attention.")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
