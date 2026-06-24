#!/usr/bin/env python3
"""Capture desktop and mobile homepage screenshots for review."""

from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FINAL_DIR = ROOT / "final" / "homepage-screenshots"
PORT = 8000
BASE_URL = f"http://127.0.0.1:{PORT}"
VIEWPORTS = {
    "desktop": "1440,1100",
    "mobile": "390,844",
}


def server_ready() -> bool:
    try:
        urllib.request.urlopen(BASE_URL, timeout=1).read(64)
        return True
    except (urllib.error.URLError, TimeoutError):
        return False


def ensure_server() -> subprocess.Popen[bytes] | None:
    if server_ready():
        return None
    process = subprocess.Popen(
        ["python3", "-m", "http.server", str(PORT)],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    for _ in range(30):
        if server_ready():
            return process
        time.sleep(0.2)
    process.terminate()
    raise RuntimeError(f"Local server did not start on port {PORT}")


def chrome_binary() -> str:
    for name in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser"):
        path = shutil.which(name)
        if path:
            return path
    raise RuntimeError("Could not find Chrome or Chromium for screenshots")


def prime_profile(chrome: str, profile: Path) -> None:
    prime = ROOT / "__screenshot_prime.html"
    prime.write_text(
        "<!doctype html><meta charset='utf-8'>"
        "<script>localStorage.setItem('sofiati_cookie_choice','accept');"
        "localStorage.setItem('sofiati-language','pt');</script>ready",
        encoding="utf-8",
    )
    try:
        subprocess.run(
            [
                chrome,
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                f"--user-data-dir={profile}",
                "--virtual-time-budget=1000",
                f"{BASE_URL}/__screenshot_prime.html",
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    finally:
        prime.unlink(missing_ok=True)


def pages() -> list[tuple[str, str]]:
    concepts = json.loads((ROOT / "data" / "concepts.json").read_text(encoding="utf-8"))
    result = [("selector-home", "/")]
    result.extend((f"concept-{item['number']}-home", f"/concepts/{item['number']}/home/") for item in concepts)
    return result


def capture(chrome: str, profile: Path, slug: str, url_path: str, viewport: str, size: str) -> Path:
    out_dir = FINAL_DIR / viewport
    out_dir.mkdir(parents=True, exist_ok=True)
    output = out_dir / f"{slug}-{viewport}.png"
    subprocess.run(
        [
            chrome,
            "--headless=new",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--hide-scrollbars",
            f"--user-data-dir={profile}",
            f"--window-size={size}",
            "--virtual-time-budget=3500",
            f"--screenshot={output}",
            f"{BASE_URL}{url_path}",
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return output


def write_manifest(captured: list[dict[str, str]]) -> None:
    manifest = {
        "baseUrl": BASE_URL,
        "viewports": VIEWPORTS,
        "count": len(captured),
        "screenshots": captured,
    }
    (FINAL_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (FINAL_DIR / "README.md").write_text(
        "# Homepage Screenshots\n\n"
        "Desktop and mobile first-viewport screenshots for the selector homepage and all 50 concept homepages.\n",
        encoding="utf-8",
    )


def main() -> None:
    server = ensure_server()
    chrome = chrome_binary()
    captured: list[dict[str, str]] = []
    try:
        FINAL_DIR.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix="sofiati-screenshots-") as tmp:
            profile = Path(tmp) / "chrome-profile"
            prime_profile(chrome, profile)
            all_pages = pages()
            total = len(all_pages) * len(VIEWPORTS)
            done = 0
            for slug, url_path in all_pages:
                for viewport, size in VIEWPORTS.items():
                    output = capture(chrome, profile, slug, url_path, viewport, size)
                    done += 1
                    rel = output.relative_to(ROOT).as_posix()
                    captured.append({"viewport": viewport, "page": slug, "url": url_path, "file": rel})
                    print(f"[{done:03d}/{total:03d}] {rel}")
        write_manifest(captured)
    finally:
        if server:
            server.terminate()


if __name__ == "__main__":
    main()
