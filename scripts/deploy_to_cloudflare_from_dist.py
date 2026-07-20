#!/usr/bin/env python3
"""
Build dist, commit the result, and push to GitHub.

Cloudflare Pages can then deploy from the pushed commit when the project is
configured to publish the dist directory.
"""

from __future__ import annotations

import argparse
from datetime import datetime
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]


def run(command: list[str]) -> None:
    print("+ " + " ".join(command))
    subprocess.run(command, cwd=ROOT, check=True)


def output(command: list[str]) -> str:
    return subprocess.run(
        command,
        cwd=ROOT,
        check=True,
        text=True,
        capture_output=True,
    ).stdout.strip()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build dist, commit, and push to trigger Cloudflare."
    )
    parser.add_argument(
        "message",
        nargs="*",
        help="Optional commit message.",
    )
    parser.add_argument(
        "--remote",
        default="origin",
        help="Git remote to push to. Defaults to origin.",
    )
    parser.add_argument(
        "--branch",
        help="Remote branch name. Defaults to the current branch.",
    )
    parser.add_argument(
        "--no-push",
        action="store_true",
        help="Build and commit, but do not push.",
    )
    args = parser.parse_args()

    timestamp = datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %z")
    message = " ".join(args.message).strip() or f"Deploy dist to Cloudflare - {timestamp}"
    branch = args.branch or output(["git", "branch", "--show-current"]) or "main"

    try:
      run(["npm", "run", "build"])
      run(["git", "add", "-A"])
      run(["git", "commit", "--allow-empty", "-m", message])

      if args.no_push:
          print("Commit created. Push skipped.")
          return 0

      run(["git", "push", "-u", args.remote, f"HEAD:{branch}"])
      print("Deploy commit pushed. Cloudflare should pick up the new GitHub commit.")
      return 0
    except subprocess.CalledProcessError as error:
      return error.returncode


if __name__ == "__main__":
    sys.exit(main())
