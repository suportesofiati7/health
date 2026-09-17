#!/usr/bin/env python3
"""Synchronize edited/created/removed bilingual pages with the local translator.

Incremental mode is the safe default. Full regeneration and deletion of
obsolete outputs require explicit flags and the existing generator's review
gates.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Update Portuguese pages and shared bilingual content.")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing files.")
    parser.add_argument("--full", action="store_true", help="Regenerate all language pairs; requires --yes.")
    parser.add_argument("--delete-obsolete", action="store_true", help="Remove confirmed obsolete translated outputs; requires --yes.")
    parser.add_argument("--yes", action="store_true", help="Confirm full generation or obsolete-output deletion.")
    args = parser.parse_args(argv)
    if (args.full or args.delete_obsolete) and not args.yes:
        parser.error("--full and --delete-obsolete require --yes")
    mode = "dry-run" if args.dry_run else "full" if args.full else "incremental"
    command = [sys.executable, str(ROOT / "scripts" / "generate-portuguese-site.py"), "--mode", mode, "--overrides", "preserve"]
    if args.delete_obsolete:
        command.append("--delete-obsolete")
    if args.yes:
        command.append("--yes")
    return subprocess.run(command, cwd=ROOT).returncode


if __name__ == "__main__":
    raise SystemExit(main())
