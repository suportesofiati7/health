#!/usr/bin/env python3
"""Stage, commit and push the repository in one explicit command.

Examples:
    python3 scripts/git-publish.py
    python3 scripts/git-publish.py "Update patient workflow"
    python3 scripts/git-publish.py --allow-empty
    python3 scripts/git-publish.py --no-push
"""

from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]


def git(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(["git", *args], cwd=ROOT, text=True, check=check)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Git add, commit and push with today's date.")
    parser.add_argument("message", nargs="?", default="Website and management updates")
    parser.add_argument("--allow-empty", action="store_true", help="Create a commit even when there are no changes.")
    parser.add_argument("--no-push", action="store_true", help="Create the commit without pushing it.")
    args = parser.parse_args(argv)

    status = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, text=True, capture_output=True, check=True)
    if not status.stdout.strip() and not args.allow_empty:
        print("Nothing to commit. Use --allow-empty if an empty dated checkpoint is intentional.")
        return 0

    branch = subprocess.run(["git", "branch", "--show-current"], cwd=ROOT, text=True, capture_output=True, check=True).stdout.strip()
    if not branch:
        print("Refusing to publish from a detached HEAD.", file=sys.stderr)
        return 2

    today = date.today().isoformat()
    commit_message = f"{today}: {args.message.strip()}"
    git("add", "-A")
    commit_args = ["commit"]
    if args.allow_empty:
        commit_args.append("--allow-empty")
    git(*commit_args, "-m", commit_message)
    if not args.no_push:
        git("push", "origin", branch)
    print(f"Published {branch}: {commit_message}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
