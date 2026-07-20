#!/usr/bin/env python3
"""
Create a timestamped Git checkpoint and optionally push it.

Usage:

    python3 scripts/git-save.py

    python3 scripts/git-save.py "Update website content"

    python3 scripts/git-save.py --no-push

    GIT_SAVE_REMOTE_URL=git@github.com:ORG/REPO.git python3 scripts/git-save.py

Environment variables:

    GIT_SAVE_REMOTE
        Name of the remote to use (default: origin)

    GIT_SAVE_REMOTE_URL
        If provided, creates or updates that remote before pushing.
"""


from __future__ import annotations

import argparse
from datetime import datetime
import os
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]


def run_git(*args: str, capture: bool = False) -> subprocess.CompletedProcess[str]:
    """
    Run a Git command inside the repository.
    """

    return subprocess.run(
        ["git", *args],
        cwd=ROOT,
        text=True,
        capture_output=capture,
        check=True,
    )


def git_output(*args: str) -> str:
    """
    Return Git command output as clean text.
    """

    return run_git(*args, capture=True).stdout.strip()


def get_remotes() -> list[str]:
    """
    Return configured Git remotes.
    """

    output = git_output("remote")

    return [
        remote.strip()
        for remote in output.splitlines()
        if remote.strip()
    ]


def get_remote_url(remote: str) -> str:
    return git_output("remote", "get-url", remote)


def configure_remote() -> str:
    """
    Determine which remote should be used.

    Priority:

    1. GIT_SAVE_REMOTE_URL
    2. GIT_SAVE_REMOTE
    3. origin
    """

    remote_name = os.environ.get(
        "GIT_SAVE_REMOTE",
        "origin"
    ).strip()

    remote_url = os.environ.get(
        "GIT_SAVE_REMOTE_URL",
        ""
    ).strip()


    # If a URL is provided, create/update remote

    if remote_url:

        if remote_name in get_remotes():

            run_git(
                "remote",
                "set-url",
                remote_name,
                remote_url
            )

        else:

            run_git(
                "remote",
                "add",
                remote_name,
                remote_url
            )

        return remote_name


    # Otherwise use existing remote

    remotes = get_remotes()


    if remote_name in remotes:
        return remote_name


    if "origin" in remotes:
        return "origin"


    raise RuntimeError(
        "No Git remote configured.\n"
        "Add one with:\n"
        "git remote add origin git@github.com:ORG/REPO.git"
    )


def current_branch() -> str:
    branch = git_output(
        "branch",
        "--show-current"
    )

    return branch or "main"


def main() -> int:

    parser = argparse.ArgumentParser(
        description="Create a Git checkpoint and push."
    )

    parser.add_argument(
        "message",
        nargs="*",
        help="Optional commit message"
    )

    parser.add_argument(
        "--no-push",
        action="store_true",
        help="Create commit only"
    )

    parser.add_argument(
        "--remote",
        help="Remote name to push to"
    )

    args = parser.parse_args()


    timestamp = datetime.now().astimezone().strftime(
        "%Y-%m-%d %H:%M:%S %z"
    )


    message = (
        " ".join(args.message).strip()
        or f"Site update - {timestamp}"
    )


    try:

        branch = current_branch()


        print("Adding files...")
        run_git("add", "-A")


        print(f"Creating commit: {message}")

        run_git(
            "commit",
            "--allow-empty",
            "-m",
            message
        )


        if args.no_push:

            print(
                "Commit created. Push skipped (--no-push)."
            )

            return 0


        remote = (
            args.remote
            or configure_remote()
        )


        url = get_remote_url(remote)

        print(
            f"Pushing {branch} to {remote}"
        )

        print(
            f"Remote: {url}"
        )


        run_git(
            "push",
            "-u",
            remote,
            f"HEAD:{branch}"
        )


        print(
            "✓ Git save completed successfully."
        )


    except subprocess.CalledProcessError as error:

        print(
            "Git command failed.",
            file=sys.stderr
        )

        return error.returncode


    except RuntimeError as error:

        print(
            str(error),
            file=sys.stderr
        )

        return 2


    return 0



if __name__ == "__main__":
    sys.exit(main())