#!/usr/bin/env python3
"""Validate share-preview metadata for public HTML pages."""

from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DOMAIN = "www.francielesofiati.com"
EXCLUDED_PARTS = {
    ".venv-argos",
    "backups",
    "dist",
    "docs",
    "node_modules",
    "partials",
}
REQUIRED_PROPERTIES = (
    "og:image",
    "og:image:secure_url",
    "og:image:type",
    "og:image:width",
    "og:image:height",
    "og:image:alt",
)
REQUIRED_NAMES = (
    "twitter:card",
    "twitter:image",
    "twitter:image:alt",
)


def public_html_files():
    for path in sorted(ROOT.glob("**/*.html")):
        if any(part in EXCLUDED_PARTS for part in path.relative_to(ROOT).parts):
            continue
        yield path


def meta_content(soup, attribute, name):
    tag = soup.find("meta", attrs={attribute: name})
    return tag.get("content", "").strip() if tag else ""


def main():
    errors = []
    pages = list(public_html_files())
    for path in pages:
        soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
        properties = {name: meta_content(soup, "property", name) for name in REQUIRED_PROPERTIES}
        names = {name: meta_content(soup, "name", name) for name in REQUIRED_NAMES}
        values = {**properties, **names}
        missing = [name for name, value in values.items() if not value]
        if missing:
            errors.append(f"{path.relative_to(ROOT)} missing: {', '.join(missing)}")
            continue

        social_image = properties["og:image"]
        if properties["og:image:secure_url"] != social_image or names["twitter:image"] != social_image:
            errors.append(f"{path.relative_to(ROOT)} has inconsistent social image URLs")

        if names["twitter:card"] != "summary_large_image":
            errors.append(f"{path.relative_to(ROOT)} should use twitter:card summary_large_image")

        parsed = urlparse(social_image)
        if parsed.scheme != "https" or parsed.netloc != DOMAIN:
            errors.append(f"{path.relative_to(ROOT)} social image must be an absolute production HTTPS URL")
            continue

        image_path = ROOT / parsed.path.lstrip("/")
        if not image_path.is_file():
            errors.append(f"{path.relative_to(ROOT)} social image is missing: {image_path.relative_to(ROOT)}")
            continue

        with Image.open(image_path) as image:
            width, height = image.size
        if (properties["og:image:width"], properties["og:image:height"]) != (str(width), str(height)):
            errors.append(f"{path.relative_to(ROOT)} social image dimensions do not match {width}x{height}")
        if width < 1200 or height < 630:
            errors.append(f"{path.relative_to(ROOT)} social image is below large-preview size: {width}x{height}")
        if properties["og:image:type"] != "image/png":
            errors.append(f"{path.relative_to(ROOT)} social image type should be image/png")

    if errors:
        print("Social preview validation: FAIL")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)

    print(f"Social preview validation: PASS; {len(pages)} pages")


if __name__ == "__main__":
    main()
