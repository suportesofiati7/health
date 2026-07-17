#!/usr/bin/env python3
"""Capture every public page at desktop, tablet, and mobile widths."""

from __future__ import annotations

import json
import os
import re
import socket
import subprocess
import tempfile
import time
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = ROOT / "screenshots" / "sitewide-current"
VIEWPORTS = {
    "mobile-320": {"width": 320, "height": 740, "isMobile": True},
    "mobile-390": {"width": 390, "height": 844, "isMobile": True},
    "mobile-430": {"width": 430, "height": 900, "isMobile": True},
    "tablet-768": {"width": 768, "height": 1024, "isMobile": False},
    "desktop-1024": {"width": 1024, "height": 900, "isMobile": False},
    "desktop-1280": {"width": 1280, "height": 1000, "isMobile": False},
    "desktop-1366": {"width": 1366, "height": 900, "isMobile": False},
    "desktop-1440": {"width": 1440, "height": 1200, "isMobile": False},
    "desktop-1920": {"width": 1920, "height": 1080, "isMobile": False},
    "desktop-2560": {"width": 2560, "height": 1440, "isMobile": False},
    "ultrawide-3440": {"width": 3440, "height": 1440, "isMobile": False},
}
EXCLUDED_DIRS = {
    ".git",
    "node_modules",
    "assets",
    "css",
    "data",
    "docs",
    "js",
    "partials",
    "qa",
    "references",
    "screenshots",
    "scripts",
    "backups",
}


def run(command: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        command,
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    if check and result.returncode != 0:
        raise RuntimeError(result.stdout)
    return result


def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def start_server(port: int) -> ThreadingHTTPServer:
    os.chdir(ROOT)

    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format: str, *args: object) -> None:
            return

    server = ThreadingHTTPServer(("127.0.0.1", port), QuietHandler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def wait_for_server(port: int, timeout: float = 8.0) -> None:
    started = time.time()
    while time.time() - started < timeout:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(0.25)
            if sock.connect_ex(("127.0.0.1", port)) == 0:
                return
        time.sleep(0.1)
    raise RuntimeError(f"Local server did not start on port {port}.")


def public_html_pages() -> list[str]:
    """Return deployable routes, never HTML owned by tools or environments.

    Public pages currently live at the repository root and one level below the
    ``journal`` and ``pt`` routes. Deliberately enumerating those roots prevents virtualenv,
    backup, fixture, and future build-tool HTML from entering visual QA.
    """
    pages = [path.relative_to(ROOT).as_posix() for path in ROOT.glob("*.html")]
    journal_root = ROOT / "journal"
    if journal_root.is_dir():
        pages.extend(
            path.relative_to(ROOT).as_posix()
            for path in journal_root.glob("*.html")
        )
    portuguese_root = ROOT / "pt"
    if portuguese_root.is_dir():
        pages.extend(
            path.relative_to(ROOT).as_posix()
            for path in portuguese_root.glob("*.html")
        )
    return sorted(pages, key=lambda value: (value.count("/"), value))


def slug_for_page(page: str) -> str:
    if page == "index.html":
        return "home"
    slug = page.removesuffix(".html").replace("/", "__")
    return re.sub(r"[^a-zA-Z0-9_-]+", "-", slug).strip("-").lower()


def capture_pages(base_url: str, output_dir: Path, pages: list[str]) -> list[dict[str, object]]:
    runner = """
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const baseUrl = process.argv[2];
const outputDir = process.argv[3];
const pages = JSON.parse(process.argv[4]);
const viewports = JSON.parse(process.argv[5]);

function slugForPage(pagePath) {
  if (pagePath === "index.html") return "home";
  return pagePath
    .replace(/\\.html$/, "")
    .replace(/\\//g, "__")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });
  const results = [];

  for (const [viewportName, viewport] of Object.entries(viewports)) {
    const viewportDir = path.join(outputDir, viewportName);
    fs.mkdirSync(viewportDir, { recursive: true });

    // Reuse one context per viewport so large local imagery and fonts remain
    // cached while every route is still isolated in its own page object.
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      deviceScaleFactor: 1,
    });
    await context.addInitScript(() => {
      localStorage.setItem(
        "sofiati_cookie_preferences_v3",
        JSON.stringify({ essential: true, preferences: false, analytics: false, externalMedia: false })
      );
    });

    for (const pagePath of pages) {
      const page = await context.newPage();
      const browserErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") browserErrors.push(`console: ${message.text()}`);
      });
      page.on("pageerror", (error) => browserErrors.push(`page: ${error.message}`));
      page.on("requestfailed", (request) => {
        browserErrors.push(`request: ${request.url()} ${request.failure()?.errorText || ""}`);
      });
      const url = `${baseUrl}/${pagePath}`;
      await page.goto(url, { waitUntil: "load", timeout: 30000 });
      await page.waitForTimeout(250);
      await page.evaluate(() => {
        if (!document.fonts || !document.fonts.ready) return Promise.resolve();
        return Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 800)),
        ]);
      });
      await page.evaluate(async () => {
        const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
        const previousScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        // Keep the step smaller than short reveal components. A large jump can
        // skip an IntersectionObserver target and make a valid image appear
        // blank in the final full-page evidence.
        const step = Math.min(360, Math.max(180, Math.floor(window.innerHeight * 0.35)));
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await delay(30);
        }
        await Promise.all(
          Array.from(document.images).map((image) => {
            if (image.complete) return Promise.resolve();
            return Promise.race([
              new Promise((resolve) => {
                image.addEventListener("load", resolve, { once: true });
                image.addEventListener("error", resolve, { once: true });
              }),
              delay(800),
            ]);
          })
        );
        window.scrollTo(0, 0);
        await delay(80);
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
      });

      const metrics = await page.evaluate(() => {
        const documentElement = document.documentElement;
        const body = document.body;
        const width = Math.max(
          documentElement.scrollWidth,
          documentElement.offsetWidth,
          body ? body.scrollWidth : 0,
          body ? body.offsetWidth : 0
        );
        const height = Math.max(
          documentElement.scrollHeight,
          documentElement.offsetHeight,
          body ? body.scrollHeight : 0,
          body ? body.offsetHeight : 0
        );
        return {
          title: document.title,
          scrollWidth: width,
          scrollHeight: height,
          horizontalOverflow: width > window.innerWidth + 1,
          h1Count: document.querySelectorAll("h1").length,
          sectionCount: document.querySelectorAll("main > section").length,
          brokenImages: Array.from(document.images)
            .filter((image) => !image.complete || image.naturalWidth === 0)
            .map((image) => image.currentSrc || image.src),
          sectionTones: Array.from(document.querySelectorAll('main > section[data-tone]'))
            .map((section) => ({
              section: section.dataset.section,
              tone: section.dataset.tone,
              background: getComputedStyle(section).backgroundColor,
              backgroundImage: getComputedStyle(section).backgroundImage,
              color: getComputedStyle(section).color,
            })),
          heroVisual: (() => {
            const figure = document.querySelector('.sf-generated-hero-figure');
            const image = figure && figure.querySelector('img');
            return figure ? {
              backgroundImage: getComputedStyle(figure).backgroundImage,
              imageDisplay: image ? getComputedStyle(image).display : null,
            } : null;
          })(),
          artDirectionLoaded: getComputedStyle(document.documentElement)
            .getPropertyValue('--sf-art-paper').trim(),
          artDirectionRuleCount: Array.from(document.styleSheets).reduce((count, sheet) => {
            try {
              return count + Array.from(sheet.cssRules)
                .filter((rule) => rule.cssText.includes('sf-tone--forest')).length;
            } catch (_error) {
              return count;
            }
          }, 0),
          finalSectionBackgroundRules: (() => {
            const target = document.querySelector('main > section[data-section="10"]');
            if (!target) return [];
            const matches = [];
            const visit = (rules) => Array.from(rules || []).forEach((rule) => {
              if (rule.cssRules) visit(rule.cssRules);
              if (!rule.selectorText || !rule.style) return;
              if (!rule.style.background && !rule.style.backgroundColor && !rule.style.backgroundImage) return;
              try {
                if (target.matches(rule.selectorText)) {
                  matches.push({ selector: rule.selectorText, style: rule.style.cssText });
                }
              } catch (_error) {
                return;
              }
            });
            Array.from(document.styleSheets).forEach((sheet) => {
              try { visit(sheet.cssRules); } catch (_error) { return; }
            });
            return matches.slice(-16);
          })(),
        };
      });

      const fileName = `${slugForPage(pagePath)}.png`;
      const filePath = path.join(viewportDir, fileName);
      await page.screenshot({ path: filePath, fullPage: true });
      results.push({
        page: pagePath,
        viewport: viewportName,
        width: viewport.width,
        height: viewport.height,
        file: path.relative(outputDir, filePath),
        url,
        browserErrors,
        ...metrics,
      });
      await page.close();
    }
    await context.close();
  }

  await browser.close();
  console.log(JSON.stringify({ results }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
"""

    with tempfile.NamedTemporaryFile("w", suffix=".cjs", dir=ROOT, delete=False) as temp:
        temp.write(runner)
        temp_path = Path(temp.name)

    try:
        result = run(
            [
                "node",
                str(temp_path),
                base_url,
                str(output_dir),
                json.dumps(pages),
                json.dumps(VIEWPORTS),
            ]
        )
    finally:
        temp_path.unlink(missing_ok=True)

    return json.loads(result.stdout)["results"]


def write_index(output_dir: Path, pages: list[str], results: list[dict[str, object]]) -> None:
    by_page = {page: [] for page in pages}
    for result in results:
        by_page[str(result["page"])].append(result)

    viewport_names = list(VIEWPORTS)
    lines = [
        "# Sitewide Responsive Screenshots",
        "",
        f"Captured: {datetime.now().isoformat(timespec='seconds')}",
        "",
        f"Pages: {len(pages)}",
        "",
        "| Page | " + " | ".join(viewport_names) + " | Notes |",
        "| --- | " + " | ".join("---" for _ in viewport_names) + " | --- |",
    ]

    for page in pages:
        captures = {str(item["viewport"]): item for item in by_page[page]}
        cells = []
        notes = []
        for viewport_name in VIEWPORTS:
            item = captures.get(viewport_name)
            if not item:
                cells.append("")
                continue
            rel = item["file"]
            cells.append(f"[{viewport_name}]({rel})")
            if item["horizontalOverflow"]:
                notes.append(f"{viewport_name} overflow {item['scrollWidth']}px")
            if item.get("h1Count") != 1:
                notes.append(f"{viewport_name} h1 count {item.get('h1Count')}")
            if item.get("brokenImages"):
                notes.append(f"{viewport_name} broken images {len(item['brokenImages'])}")
            if item.get("browserErrors"):
                notes.append(f"{viewport_name} browser errors {len(item['browserErrors'])}")
        lines.append(
            f"| `{page}` | {' | '.join(cells)} | {'; '.join(notes) or 'OK'} |"
        )

    (output_dir / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    global VIEWPORTS
    run(["node", "-e", "require('playwright');"])
    pages = public_html_pages()
    requested_pages = {
        value.strip()
        for value in os.environ.get("SOFIATI_PAGES", "").split(",")
        if value.strip()
    }
    if requested_pages:
        pages = [page for page in pages if page in requested_pages]
    if os.environ.get("SOFIATI_ENGLISH_ONLY", "").lower() in {"1", "true", "yes"}:
        pages = [page for page in pages if not page.startswith("pt/")]
    requested_viewports = {
        value.strip()
        for value in os.environ.get("SOFIATI_VIEWPORTS", "").split(",")
        if value.strip()
    }
    if requested_viewports:
        unknown = requested_viewports.difference(VIEWPORTS)
        if unknown:
            raise RuntimeError(f"Unknown viewports: {', '.join(sorted(unknown))}")
        VIEWPORTS = {
            name: viewport
            for name, viewport in VIEWPORTS.items()
            if name in requested_viewports
        }
    if not pages:
        raise RuntimeError("No public HTML pages found.")

    stamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    output_dir = OUTPUT_ROOT / stamp
    output_dir.mkdir(parents=True, exist_ok=True)

    port = find_free_port()
    server = start_server(port)
    try:
        wait_for_server(port)
        results = capture_pages(f"http://127.0.0.1:{port}", output_dir, pages)
    finally:
        server.shutdown()

    manifest = {
        "capturedAt": datetime.now().isoformat(timespec="seconds"),
        "domain": "https://www.francielesofiati.com",
        "outputDir": str(output_dir.relative_to(ROOT)),
        "viewports": VIEWPORTS,
        "pages": pages,
        "results": results,
    }
    (output_dir / "manifest.json").write_text(
        json.dumps(manifest, indent=2), encoding="utf-8"
    )
    write_index(output_dir, pages, results)
    print(f"Captured {len(pages)} pages across {len(VIEWPORTS)} viewports.")
    print(f"Screenshots: {output_dir.relative_to(ROOT)}")
    print(f"Index: {(output_dir / 'README.md').relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
