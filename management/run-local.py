#!/usr/bin/env python3
"""Build, test, and launch the management app's local preview server."""

from __future__ import annotations

import os
import signal
import shutil
import socket
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path


APP_DIR = Path(__file__).resolve().parent
HOST = "127.0.0.1"
FIRST_PORT = 5550
MAX_PORT = 5650
PID_FILE = APP_DIR / ".local-server.pid"
LOG_FILE = APP_DIR / ".local-server.log"


def say(message: str) -> None:
    print(f"\n[Franciele Sofiati] {message}", flush=True)


def pause_before_close() -> None:
    """Keep a file-manager-launched terminal open long enough to show errors."""
    if sys.stdin.isatty():
        try:
            input("Pressione Enter para fechar...")
        except EOFError:
            pass


def stop_previous_server() -> None:
    if not PID_FILE.exists():
        return

    try:
        pid = int(PID_FILE.read_text().strip())
    except (OSError, ValueError):
        PID_FILE.unlink(missing_ok=True)
        return

    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        PID_FILE.unlink(missing_ok=True)
        return
    except PermissionError:
        say(f"Não foi possível controlar o servidor anterior (PID {pid}).")
        return

    say("Atualizando o servidor local...")
    try:
        os.killpg(pid, signal.SIGTERM)
    except ProcessLookupError:
        pass

    for _ in range(10):
        try:
            os.kill(pid, 0)
        except (ProcessLookupError, PermissionError):
            break
        time.sleep(1)

    PID_FILE.unlink(missing_ok=True)


def run_checked(command: list[str], label: str) -> None:
    say(label)
    subprocess.run(command, cwd=APP_DIR, check=True)


def port_is_available(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind((HOST, port))
        except OSError:
            return False
    return True


def server_is_ready(port: int) -> bool:
    url = f"http://{HOST}:{port}/"
    try:
        with urllib.request.urlopen(url, timeout=1):
            return True
    except Exception:
        return False


def start_server() -> tuple[subprocess.Popen[bytes], int] | None:
    for port in range(FIRST_PORT, MAX_PORT + 1):
        if not port_is_available(port):
            say(f"A porta {port} está ocupada; tentando a próxima...")
            continue

        say(f"Tentando iniciar o servidor em http://{HOST}:{port}/...")
        log_handle = LOG_FILE.open("ab")
        try:
            server = subprocess.Popen(
                [
                    "npm",
                    "run",
                    "preview",
                    "--",
                    "--host",
                    HOST,
                    "--port",
                    str(port),
                    "--strictPort",
                ],
                cwd=APP_DIR,
                stdout=log_handle,
                stderr=subprocess.STDOUT,
                start_new_session=True,
            )
        finally:
            log_handle.close()

        for _ in range(5):
            if server.poll() is not None:
                break
            if server_is_ready(port):
                return server, port
            time.sleep(1)

        if server.poll() is None:
            os.killpg(server.pid, signal.SIGTERM)
        say(f"Não foi possível iniciar na porta {port}; tentando a próxima...")

    return None


def main() -> int:
    os.chdir(APP_DIR)
    stop_previous_server()

    if not shutil.which("node") or not shutil.which("npm"):
        say("Node.js/npm não foram encontrados. Instale Node.js 20+ e tente novamente.")
        pause_before_close()
        return 1

    try:
        run_checked(["npm", "run", "build"], "Construindo a aplicação...")
        run_checked(["npm", "test"], "Executando testes...")

        say("Iniciando servidor local com o build recém-gerado...")
        result = start_server()
        if result is None:
            say(f"Nenhuma porta disponível entre {FIRST_PORT} e {MAX_PORT}. Consulte {LOG_FILE}")
            if LOG_FILE.exists():
                print(LOG_FILE.read_text(errors="replace"))
            PID_FILE.unlink(missing_ok=True)
            pause_before_close()
            return 1

        server, port = result
        PID_FILE.write_text(str(server.pid))
        url = f"http://{HOST}:{port}/"
        say(f"Pronto. Abrindo {url}")
        webbrowser.open(url)
        say(f"Para parar o servidor, execute: kill {server.pid}")
        return 0
    except subprocess.CalledProcessError as error:
        say(f"O comando falhou com código {error.returncode}.")
        pause_before_close()
        return error.returncode or 1
    except OSError as error:
        say(f"Não foi possível iniciar o servidor: {error}")
        pause_before_close()
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
