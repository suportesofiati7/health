#!/usr/bin/env python3
"""A tiny Matrix-style terminal animation. Press Ctrl-C to stop."""

import argparse
import random
import shutil
import sys
import time


CHARS = "アイウエオカキクケコ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def run(fps: int) -> None:
    """Render falling green characters until interrupted."""
    columns = []
    previous_size = None

    sys.stdout.write("\033[2J\033[H\033[?25l")  # clear screen, home, hide cursor
    sys.stdout.flush()
    try:
        while True:
            size = shutil.get_terminal_size((80, 24))
            width, height = size.columns, size.lines

            if previous_size != (width, height):
                columns = [random.randint(-height, 0) for _ in range(width)]
                previous_size = (width, height)
                sys.stdout.write("\033[2J")

            lines = []
            for row in range(height - 1):  # leave the last row alone
                line = []
                for column in range(width):
                    head = columns[column]
                    distance = row - head
                    if 0 <= distance < random.randint(8, 22):
                        if distance == 0:
                            line.append("\033[97m" + random.choice(CHARS) + "\033[0m")
                        else:
                            line.append("\033[32m" + random.choice(CHARS) + "\033[0m")
                    else:
                        line.append(" ")
                lines.append("".join(line))

            sys.stdout.write("\033[H" + "\n".join(lines))
            sys.stdout.flush()
            columns = [head + 1 if head < height + random.randint(2, 15) else random.randint(-height, 0)
                       for head in columns]
            time.sleep(1 / max(fps, 1))
    finally:
        sys.stdout.write("\033[0m\033[?25h\033[H\n")  # reset color and show cursor
        sys.stdout.flush()


def main() -> None:
    parser = argparse.ArgumentParser(description="Matrix-style falling numbers for your terminal")
    parser.add_argument("--fps", type=int, default=10, help="frames per second (default: 10)")
    args = parser.parse_args()
    try:
        run(args.fps)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
