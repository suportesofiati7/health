#!/usr/bin/env python3
"""Build, validate and optionally submit the site's search discovery assets.

The source tree is a static site.  The HTML files are therefore the routing
source of truth; page-pair/content JSON is used only for language alternates
and the curated llms.txt guide.  The state file is intentionally outside the
published artifact.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime, timezone
from email.message import Message
from html import escape
from html.parser import HTMLParser
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import time
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
SEO = ROOT / "data" / "seo.json"
DISCOVERY_CONFIG = ROOT / "data" / "search-discovery.json"
STATE = ROOT / ".search-discovery-state.json"
ROBOTS = ROOT / "robots.txt"
SITEMAP = ROOT / "sitemap.xml"
IMAGE_SITEMAP = ROOT / "sitemap-images.xml"
SITEMAP_INDEX = ROOT / "sitemap-index.xml"
LLMS = ROOT / "llms.txt"
KEY = "e7555acad3a644ab84a3f76774ab4ede"
KEY_FILE = ROOT / f"{KEY}.txt"
INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow"
XML_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
XHTML_NS = "http://www.w3.org/1999/xhtml"

EXCLUDED_DIRS = {
    ".git", ".venv", "node_modules", "dist", "management", "partials",
    "backups", "docs", "reports", "qa", "screenshots", "scripts", "tests",
    "tmp", "validation-artifacts", "performance-reports", "exports",
}
EXCLUDED_TERMS = {
    "admin", "management", "api", "dashboard", "private", "storage", "internal",
    "preview", "development", "staging", "login", "logout", "account", "profile",
    "form", "formulario", "thank-you", "obrigada", "404", "typography-plan",
}


@dataclass(frozen=True)
class Page:
    source: Path
    canonical: str
    title: str
    description: str
    language: str
    content_hash: str
    lastmod: str | None
    alternates: tuple[tuple[str, str], ...]


class Metadata(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.canonical: list[str] = []
        self.robots: list[str] = []
        self.title = ""
        self.description = ""
        self.lang = ""
        self._in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs = {k.casefold(): v or "" for k, v in attrs}
        if tag.casefold() == "html":
            self.lang = attrs.get("lang", "")
        elif tag.casefold() == "title":
            self._in_title = True
        elif tag.casefold() == "link" and "canonical" in attrs.get("rel", "").casefold().split():
            self.canonical.append(attrs.get("href", ""))
        elif tag.casefold() == "meta":
            if attrs.get("name", "").casefold() == "robots":
                self.robots.append(attrs.get("content", ""))
            if attrs.get("name", "").casefold() == "description":
                self.description = attrs.get("content", "")

    def handle_endtag(self, tag: str) -> None:
        if tag.casefold() == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title += data


def read_json(path: Path) -> dict:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError(f"{path.relative_to(ROOT)} must contain a JSON object")
    return value


def origin() -> str:
    value = str(read_json(SEO).get("domain", "")).rstrip("/")
    parsed = urlparse(value)
    if parsed.scheme != "https" or not parsed.netloc or parsed.path not in ("", "/"):
        raise RuntimeError("data/seo.json domain must be the canonical HTTPS origin")
    return value


def public_url(path: str, site_origin: str) -> str:
    path = path.removesuffix(".html")
    if path == "index":
        return f"{site_origin}/"
    if path == "en/index":
        return f"{site_origin}/en/"
    return f"{site_origin}/{path.lstrip('/')}"


def should_scan(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    if path.suffix.casefold() != ".html" or any(part in EXCLUDED_DIRS or part.startswith(".venv-") for part in rel.parts):
        return False
    if rel.as_posix() in {"404.html", "en/404.html", "obrigada.html", "en/thank-you.html", "formulario.html", "en/form.html", "typography-plan.html"}:
        return False
    return True


def route_is_excluded(url: str) -> bool:
    parts = [part.casefold() for part in urlparse(url).path.split("/") if part]
    return any(term in parts for term in EXCLUDED_TERMS)


def redirect_sources(site_origin: str) -> set[str]:
    """Redirecting legacy routes are not sitemap candidates."""
    sources: set[str] = set()
    try:
        for line in (ROOT / "_redirects").read_text(encoding="utf-8").splitlines():
            fields = line.split()
            if len(fields) >= 2 and not fields[0].startswith("#"):
                source = fields[0]
                if source.startswith("/"):
                    sources.add(site_origin + source.rstrip("/") or site_origin)
    except OSError:
        pass
    return sources


def reliable_lastmod(path: Path) -> str | None:
    rel = path.relative_to(ROOT).as_posix()
    try:
        clean = subprocess.run(["git", "diff", "--quiet", "HEAD", "--", rel], cwd=ROOT, timeout=10, check=False)
        if clean.returncode == 0:
            result = subprocess.run(["git", "log", "-1", "--format=%cs", "--", rel], cwd=ROOT, timeout=10, check=False, capture_output=True, text=True)
            value = result.stdout.strip()
            if re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
                return value
    except (OSError, subprocess.SubprocessError):
        pass
    try:
        return datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).date().isoformat()
    except OSError:
        return None


def language_for(path: Path) -> str:
    return "en" if path.relative_to(ROOT).as_posix().startswith("en/") else "pt-BR"


def load_alternates(site_origin: str, pages_by_source: dict[str, str]) -> dict[str, tuple[tuple[str, str], ...]]:
    result: dict[str, tuple[tuple[str, str], ...]] = {}
    try:
        pairs = read_json(ROOT / "data" / "page-pairs.json").get("pages", [])
    except (OSError, json.JSONDecodeError):
        pairs = []
    for item in pairs:
        if not isinstance(item, dict):
            continue
        paths = {lang: str(item.get(lang, "")) for lang in ("en", "pt-BR")}
        if not all(paths.values()) or not all(path in pages_by_source for path in paths.values()):
            continue
        urls = {lang: pages_by_source[path] for lang, path in paths.items()}
        default = urls["pt-BR"]
        alternates = (("en", urls["en"]), ("pt-BR", urls["pt-BR"]), ("x-default", default))
        for url in urls.values():
            result[url] = alternates
    return result


def discover(site_origin: str) -> tuple[list[Page], list[str]]:
    pages: list[Page] = []
    excluded: list[str] = []
    redirected = redirect_sources(site_origin)
    candidates = sorted(path for path in ROOT.rglob("*.html") if should_scan(path))
    raw: list[tuple[Path, str, Metadata, str]] = []
    for path in candidates:
        rel = path.relative_to(ROOT).as_posix()
        expected = public_url(rel, site_origin)
        if expected.rstrip("/") in {url.rstrip("/") for url in redirected}:
            excluded.append(f"{rel}: redirect source")
            continue
        parser = Metadata()
        parser.feed(path.read_text(encoding="utf-8"))
        if route_is_excluded(expected):
            excluded.append(f"{rel}: protected/utility route pattern")
            continue
        if len(parser.canonical) != 1:
            excluded.append(f"{rel}: requires exactly one canonical")
            continue
        canonical = expected if expected.endswith("/") else parser.canonical[0].rstrip("/")
        if parser.canonical[0].rstrip("/") != expected.rstrip("/") or urlparse(canonical).query or urlparse(canonical).fragment:
            excluded.append(f"{rel}: canonical is {canonical}, expected {expected}")
            continue
        directives = {item.strip().casefold() for value in parser.robots for item in value.split(",") if item.strip()}
        if "noindex" in directives:
            excluded.append(f"{rel}: noindex")
            continue
        if urlparse(canonical).netloc != urlparse(site_origin).netloc or not parser.title.strip() or not parser.description.strip():
            excluded.append(f"{rel}: invalid host or incomplete metadata")
            continue
        content_hash = hashlib.sha256(path.read_bytes()).hexdigest()
        raw.append((path, canonical, parser, content_hash))
    pages_by_source = {path.relative_to(ROOT).as_posix(): canonical for path, canonical, _, _ in raw}
    alternates = load_alternates(site_origin, pages_by_source)
    for path, canonical, parser, content_hash in raw:
        pages.append(Page(path, canonical, " ".join(parser.title.split()), " ".join(parser.description.split()), language_for(path), content_hash, reliable_lastmod(path), alternates.get(canonical, ((language_for(path), canonical), ("x-default", canonical)))))
    if len({page.canonical for page in pages}) != len(pages):
        raise RuntimeError("Duplicate canonical URLs discovered")
    return pages, excluded


def render_sitemap(pages: list[Page]) -> str:
    blocks = []
    for page in pages:
        lines = ["  <url>", f"    <loc>{escape(page.canonical)}</loc>"]
        if page.lastmod:
            lines.append(f"    <lastmod>{page.lastmod}</lastmod>")
        lines.extend(f'    <xhtml:link rel="alternate" hreflang="{lang}" href="{escape(url)}" />' for lang, url in page.alternates)
        lines.append("  </url>")
        blocks.append("\n".join(lines))
    return '<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<urlset\n  xmlns="' + XML_NS + '"\n  xmlns:xhtml="' + XHTML_NS + '">\n' + "\n\n".join(blocks) + "\n</urlset>\n"


def render_image_sitemap(site_origin: str, pages: list[Page]) -> str:
    blocks: list[str] = []
    for page in pages:
        source = page.source.read_text(encoding="utf-8")
        images = re.findall(r"<img\b[^>]*\bsrc=[\"']([^\"']+)", source, re.IGNORECASE)
        local = [value for value in images if not value.startswith(("http://", "https://", "data:"))]
        if not local:
            continue
        lines = ["  <url>", f"    <loc>{escape(page.canonical)}</loc>"]
        for value in sorted(set(local)):
            image_url = urljoin(page.canonical + "/", value)
            if urlparse(image_url).netloc != urlparse(site_origin).netloc:
                continue
            lines.extend(["    <image:image>", f"      <image:loc>{escape(image_url)}</image:loc>", "    </image:image>"])
        lines.append("  </url>")
        blocks.append("\n".join(lines))
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="' + XML_NS + '" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' + "\n".join(blocks) + "\n</urlset>\n"


def render_robots(site_origin: str) -> str:
    paths = ["/.git/", "/.codex/", "/.agents/", "/__pycache__/", "/backups/", "/docs/", "/management/", "/node_modules/", "/qa/", "/reports/", "/scripts/", "/tests/", "/tmp/", "/.search-discovery-state.json", "/.env", "/.gitignore", "/README.md"]
    return "# Public crawl guidance only; this is not an access-control mechanism.\n\nUser-agent: *\nAllow: /\n" + "\n".join(f"Disallow: {path}" for path in paths) + f"\n\nSitemap: {site_origin}/sitemap.xml\n"


def render_llms(site_origin: str, pages: list[Page]) -> str:
    config = read_json(DISCOVERY_CONFIG)
    by_path = {urlparse(page.canonical).path.rstrip("/") or "/": page for page in pages}
    lines = [f"# {config.get('name', 'Website')}", "", f"> {config.get('summary', '').strip()}", ""]
    for section in config.get("sections", []):
        lines.extend([f"## {section.get('title', 'Pages')}", ""])
        for path in section.get("paths", []):
            page = by_path.get("/" if path == "/" else str(path).rstrip("/"))
            if not page:
                continue
            lines.append(f"- [{page.title}]({page.canonical}): {page.description}")
        lines.append("")
    lines.extend(["## Optional", "", f"- [XML sitemap]({site_origin}/sitemap.xml): Complete canonical index of crawlable public pages.", f"- [Robots policy]({site_origin}/robots.txt): Public crawler guidance and sitemap location.", ""])
    return "\n".join(lines)


def write_if_changed(path: Path, content: str, dry_run: bool) -> bool:
    current = path.read_text(encoding="utf-8") if path.exists() else None
    changed = current != content
    if changed and not dry_run:
        path.write_text(content, encoding="utf-8", newline="\n")
    return changed


def state_load() -> dict:
    try:
        value = json.loads(STATE.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def classify(pages: list[Page], previous: dict) -> tuple[dict[str, str], list[str]]:
    old = previous.get("urls", {}) if isinstance(previous.get("urls"), dict) else {}
    current = {page.canonical: page.content_hash for page in pages}
    changes = {url: ("NEW" if url not in old or old[url].get("status") != "current" else "UPDATED" if old[url].get("content_hash") != digest else "UNCHANGED") for url, digest in current.items()}
    active_old = {url for url, value in old.items() if isinstance(value, dict) and value.get("status", "current") == "current"}
    removed = sorted(active_old - set(current))
    return changes, removed


def submit_indexnow(urls: list[str], site_origin: str, dry_run: bool) -> tuple[str, str]:
    if not urls:
        return "SKIPPED", "no NEW, UPDATED or REMOVED URLs"
    if dry_run:
        return "DRY-RUN", f"would submit {len(urls)} URL(s)"
    payload = {"host": urlparse(site_origin).netloc, "key": KEY, "keyLocation": f"{site_origin}/{KEY}.txt", "urlList": urls}
    request = Request(INDEXNOW_ENDPOINT, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": "FrancieleSofiatiSearchDiscovery/1.0"}, method="POST")
    for attempt in range(4):
        try:
            with urlopen(request, timeout=15) as response:
                status = response.status
                if 200 <= status < 300:
                    return "SUCCESS", f"IndexNow accepted {len(urls)} URL(s), HTTP {status} (not proof of indexing)"
                return "FAILED", f"HTTP {status}"
        except HTTPError as error:
            if error.code in {400, 403, 422}:
                return "FAILED", f"HTTP {error.code} (malformed request, invalid key or host/key mismatch)"
            if error.code == 429 or error.code >= 500:
                if attempt < 3:
                    time.sleep(2 ** attempt)
                    continue
            return "FAILED", f"HTTP {error.code}"
        except (URLError, TimeoutError) as error:
            if attempt < 3:
                time.sleep(2 ** attempt)
                continue
            return "FAILED", f"network error: {error}"
    return "FAILED", "retry budget exhausted"


def validate_files(site_origin: str, pages: list[Page]) -> list[str]:
    errors: list[str] = []
    if KEY_FILE.read_text(encoding="utf-8") != KEY:
        errors.append(f"{KEY_FILE.name} must contain exactly the IndexNow key")
    try:
        root = ET.fromstring(SITEMAP.read_text(encoding="utf-8"))
        locations = [child.text.strip() for node in root if node.tag.rsplit("}", 1)[-1] == "url" for child in node if child.tag.rsplit("}", 1)[-1] == "loc" and child.text]
        expected = [page.canonical for page in pages]
        if locations != expected:
            errors.append("sitemap.xml does not exactly match the discovered canonical public route set")
        if len(locations) != len(set(locations)):
            errors.append("sitemap.xml contains duplicate URLs")
        if any(urlparse(url).netloc != urlparse(site_origin).netloc or urlparse(url).query for url in locations):
            errors.append("sitemap.xml contains a non-canonical host or query URL")
    except (OSError, ET.ParseError) as error:
        errors.append(f"sitemap.xml is invalid: {error}")
    robots = ROBOTS.read_text(encoding="utf-8") if ROBOTS.exists() else ""
    if f"Sitemap: {site_origin}/sitemap.xml" not in robots or "User-agent: *\nAllow: /" not in robots:
        errors.append("robots.txt must allow crawling and reference the canonical sitemap")
    if not LLMS.exists() or not LLMS.read_text(encoding="utf-8").endswith("\n"):
        errors.append("llms.txt must exist as UTF-8 text ending with a newline")
    return errors


def live_check(site_origin: str) -> list[str]:
    errors: list[str] = []
    for path, expected_type in [("/robots.txt", "text/plain"), ("/sitemap.xml", "xml"), ("/llms.txt", "text/plain"), (f"/{KEY}.txt", "text/plain")]:
        try:
            with urlopen(Request(site_origin + path, headers={"User-Agent": "SearchDiscoveryValidator/1.0"}), timeout=15) as response:
                body = response.read()
                content_type = response.headers.get_content_type()
                if response.status != 200:
                    errors.append(f"{path}: HTTP {response.status}")
                if expected_type == "xml":
                    ET.fromstring(body)
                elif path.endswith(f"/{KEY}.txt") and body.decode("utf-8") != KEY:
                    errors.append(f"{path}: key contents are incorrect")
                if expected_type == "text/plain" and content_type != "text/plain":
                    errors.append(f"{path}: expected text/plain, got {content_type}")
        except Exception as error:
            errors.append(f"{path}: {error}")
    return errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true", help="show changes and notifications without writing or submitting")
    mode.add_argument("--validate", action="store_true", help="validate current files without modifying or submitting")
    mode.add_argument("--rebuild", action="store_true", help="regenerate discovery files and notify changed URLs")
    parser.add_argument("--no-notify", action="store_true", help="do not call IndexNow; useful for local builds")
    parser.add_argument("--live", action="store_true", help="also validate the canonical production URLs over HTTPS")
    args = parser.parse_args(argv)
    site_origin = origin()
    pages, excluded = discover(site_origin)
    previous = state_load()
    changes, removed = classify(pages, previous)
    notification_urls = sorted([url for url, state in changes.items() if state in {"NEW", "UPDATED"}] + removed)
    print(f"Discovered {len(pages)} canonical, indexable public URLs.")
    print(f"Deliberately excluded {len(excluded)} routes; removed since prior state: {len(removed)}.")
    for state in ("NEW", "UPDATED", "UNCHANGED"):
        listed = sorted(url for url, value in changes.items() if value == state)
        print(f"{state}: {len(listed)}")
        for url in listed[:20]:
            print(f"  {url}")
    if removed:
        print("REMOVED:")
        for url in removed:
            print(f"  {url}")
    if args.validate:
        errors = validate_files(site_origin, pages)
        if args.live:
            errors.extend(live_check(site_origin))
        if errors:
            for error in errors:
                print(f"ERROR: {error}", file=sys.stderr)
            return 1
        print("Validation passed.")
        return 0
    dry_run = args.dry_run
    outputs = {ROBOTS: render_robots(site_origin), SITEMAP: render_sitemap(pages), IMAGE_SITEMAP: render_image_sitemap(site_origin, pages), SITEMAP_INDEX: f'<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="{XML_NS}">\n  <sitemap><loc>{site_origin}/sitemap.xml</loc></sitemap>\n  <sitemap><loc>{site_origin}/sitemap-images.xml</loc></sitemap>\n</sitemapindex>\n', LLMS: render_llms(site_origin, pages), KEY_FILE: KEY}
    changed_files = [path.relative_to(ROOT).as_posix() for path, content in outputs.items() if write_if_changed(path, content, dry_run)]
    print(f"Files {'would change' if dry_run else 'changed'}: {', '.join(changed_files) if changed_files else 'none'}")
    notification_status = "SKIPPED"
    if args.no_notify:
        print("IndexNow: SKIPPED (--no-notify)")
    else:
        status, detail = submit_indexnow(notification_urls, site_origin, dry_run)
        notification_status = status
        print(f"IndexNow: {status} — {detail}")
    if not dry_run:
        now = datetime.now(timezone.utc).isoformat()
        old_urls = previous.get("urls", {}) if isinstance(previous.get("urls"), dict) else {}
        new_urls = {page.canonical: {"content_hash": page.content_hash, "lastmod": page.lastmod, "status": "current", "last_notification": old_urls.get(page.canonical, {}).get("last_notification")} for page in pages}
        for url in removed:
            prior = old_urls.get(url, {})
            new_urls[url] = {"content_hash": prior.get("content_hash"), "lastmod": prior.get("lastmod"), "status": "removed", "removed_at": now, "last_notification": prior.get("last_notification")}
        if notification_status == "SUCCESS":
            for url in notification_urls:
                if url in new_urls:
                    new_urls[url]["last_notification"] = now
        new_state = {"version": 1, "origin": site_origin, "generated_at": now, "urls": new_urls}
        STATE.write_text(json.dumps(new_state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if not dry_run:
        errors = validate_files(site_origin, pages)
        if errors:
            for error in errors:
                print(f"ERROR: {error}", file=sys.stderr)
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
