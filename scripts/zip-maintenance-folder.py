#!/usr/bin/env python3
"""Create a ChatGPT-uploadable ZIP archive of the maintenance reports."""

from __future__ import annotations

import argparse
from pathlib import Path
import tempfile
import zipfile


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "reports" / "maintenance"
DEFAULT_OUTPUT = ROOT / "reports" / "maintenance-chatgpt.zip"
# Use decimal MB because the upload limit is stated as 512 MB.
MAX_UPLOAD_BYTES = 512 * 1000 * 1000


def format_size(size: int) -> str:
    """Return a human-readable binary size."""
    value = float(size)
    for unit in ("B", "KiB", "MiB", "GiB"):
        if value < 1024 or unit == "GiB":
            return f"{value:.2f} {unit}" if unit != "B" else f"{size} B"
        value /= 1024
    return f"{size} B"


def create_archive(source: Path, output: Path) -> int:
    source = source.resolve()
    output = output.resolve()

    if not source.is_dir():
        raise FileNotFoundError(f"Maintenance folder not found: {source}")
    if output == source or source in output.parents:
        raise ValueError("The ZIP output must be outside the maintenance folder.")

    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(prefix=f".{output.name}.", suffix=".tmp", dir=output.parent, delete=False) as handle:
        temporary = Path(handle.name)

    try:
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            files = sorted(path for path in source.rglob("*") if path.is_file())
            for path in files:
                archive.write(path, Path(source.name) / path.relative_to(source))

        size = temporary.stat().st_size
        if size > MAX_UPLOAD_BYTES:
            print(f"Archive is {format_size(size)}, which is over the 512 MB upload limit.")
            print("The archive was not kept. ZIP compression level 9 was already used; remove unnecessary files or split the folder before uploading.")
            return 1

        temporary.replace(output)
        print(f"Created: {output}")
        print(f"Archive size: {format_size(size)} ({size:,} bytes)")
        print(f"Upload limit: {MAX_UPLOAD_BYTES:,} bytes (512 MB)")
        print("Result: under the 512 MB upload limit.")
        return 0
    finally:
        temporary.unlink(missing_ok=True)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", nargs="?", type=Path, default=DEFAULT_SOURCE, help=f"folder to archive (default: {DEFAULT_SOURCE})")
    parser.add_argument("-o", "--output", type=Path, default=DEFAULT_OUTPUT, help=f"ZIP path (default: {DEFAULT_OUTPUT})")
    args = parser.parse_args(argv)
    try:
        return create_archive(args.source, args.output)
    except (FileNotFoundError, OSError, ValueError, zipfile.BadZipFile) as error:
        parser.error(str(error))
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
