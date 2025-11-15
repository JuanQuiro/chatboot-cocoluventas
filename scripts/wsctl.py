#!/usr/bin/env python3

import argparse
import datetime
import json
import os
import platform
import shutil
import socket
import subprocess
import sys
from pathlib import Path
from typing import List

# Directorio donde se guardan los backups
BACKUP_ROOT = Path.home() / ".local" / "share" / "wsctl" / "backups"

# Candidatos típicos de configuración/caché de Windsurf (fork VS Code)
CANDIDATE_PATHS = [
    Path.home() / ".config" / "Windsurf",
    Path.home() / ".config" / "Code - Windsurf",
    Path.home() / ".config" / "Code",  # por si se guarda aquí
    Path.home() / ".vscode-windsurf",
    Path.home() / ".vscode",
]


def human_size(num: int) -> str:
    units = ["B", "KB", "MB", "GB", "TB"]
    size = float(num)
    for unit in units:
        if size < 1024.0 or unit == units[-1]:
            return f"{size:0.2f} {unit}"
        size /= 1024.0
    return f"{size:0.2f} PB"


def dir_size(path: Path) -> int:
    total = 0
    if not path.exists():
        return 0
    for root, _, files in os.walk(path):
        for name in files:
            try:
                fp = Path(root) / name
                total += fp.stat().st_size
            except OSError:
                pass
    return total


def find_existing_paths() -> List[Path]:
    return [p for p in CANDIDATE_PATHS if p.exists()]


def print_header(title: str) -> None:
    print()
    print("=" * len(title))
    print(title)
    print("=" * len(title))


def print_ip_info() -> None:
    print_header("Red (IP)")
    # Intentar usar `ip -4 addr show` para obtener IPs locales
    try:
        result = subprocess.run(
            ["ip", "-4", "addr", "show"],
            check=False,
            capture_output=True,
            text=True,
        )
        output = result.stdout.strip()
        if output:
            current_iface = None
            for line in output.splitlines():
                line = line.strip()
                if not line:
                    continue
                if line[0].isdigit() and ":" in line:
                    # Cabecera de interfaz, p.ej. "2: eth0: ..."
                    current_iface = line.split(":", 1)[1].strip()
                elif line.startswith("inet "):
                    parts = line.split()
                    ip_cidr = parts[1]
                    print(f"- {current_iface}: {ip_cidr}")
        else:
            raise RuntimeError("sin salida de ip")
    except Exception:
        # Fallback simple
        try:
            hostname = socket.gethostname()
            ip = socket.gethostbyname(hostname)
            print(f"- {hostname}: {ip}")
        except Exception as exc:  # pragma: no cover
            print(f"No se pudo obtener la IP: {exc}")


def cmd_status(_: argparse.Namespace) -> None:
    print_header("Estado de datos locales de Windsurf")
    paths = find_existing_paths()
    if not paths:
        print("No se encontraron carpetas de configuración/caché de Windsurf en rutas conocidas.")
    else:
        for p in paths:
            size = human_size(dir_size(p))
            print(f"- {p} -> {size}")

    print_header("Información del sistema")
    user = os.getenv("USER") or os.getenv("LOGNAME") or "(desconocido)"
    print(f"Usuario   : {user}")
    print(f"Hostname  : {socket.gethostname()}")
    print(
        f"Sistema   : {platform.system()} {platform.release()} ({platform.machine()})"
    )

    print_ip_info()


def ensure_backup_root() -> None:
    BACKUP_ROOT.mkdir(parents=True, exist_ok=True)


def create_backup(selected_paths: List[Path]) -> Path:
    ensure_backup_root()
    ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_dir = BACKUP_ROOT / ts
    backup_dir.mkdir(parents=True, exist_ok=False)

    meta = {"paths": []}

    for idx, p in enumerate(selected_paths):
        if not p.exists():
            continue
        dest = backup_dir / f"path_{idx}"
        print(f"Haciendo backup de {p} -> {dest}")
        if p.is_file():
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, dest)
        else:
            shutil.copytree(p, dest)
        meta["paths"].append({"index": idx, "source": str(p)})

    meta_file = backup_dir / "metadata.json"
    meta_file.write_text(json.dumps(meta, indent=2), encoding="utf-8")

    print(f"\nBackup completado en: {backup_dir}")
    return backup_dir


def cmd_backup(_: argparse.Namespace) -> None:
    paths = find_existing_paths()
    if not paths:
        print("No hay carpetas de Windsurf para respaldar.")
        return
    create_backup(paths)


def cmd_clean(args: argparse.Namespace) -> None:
    paths = find_existing_paths()
    if not paths:
        print("No hay carpetas de Windsurf para limpiar.")
        return

    print_header("LIMPIEZA DE DATOS LOCALES DE WINDSURF")
    for p in paths:
        size = human_size(dir_size(p))
        print(f"- {p} -> {size}")

    backup_dir: Path | None = None

    if not args.no_backup:
        if not args.yes:
            answer = input("\n¿Hacer backup antes de borrar? [S/n]: ").strip().lower()
            do_backup = answer in ("", "s", "y", "si", "sí")
        else:
            do_backup = True

        if do_backup:
            backup_dir = create_backup(paths)
    else:
        print("Saltando backup por petición explícita (--no-backup).")

    if not args.yes:
        confirm = input(
            "\nEsto eliminará las carpetas locales anteriores (no afecta a tu cuenta online). "
            "¿Continuar? [s/N]: "
        ).strip().lower()
        if confirm not in ("s", "y", "si", "sí"):
            print("Operación cancelada.")
            return

    for p in paths:
        if not p.exists():
            continue
        print(f"Eliminando {p}...")
        try:
            if p.is_file():
                p.unlink(missing_ok=True)
            else:
                shutil.rmtree(p, ignore_errors=True)
        except Exception as exc:  # pragma: no cover
            print(f"  Error eliminando {p}: {exc}")

    print("\nLimpieza completada.")
    if backup_dir is not None:
        print(f"Backup guardado en: {backup_dir}")
        print("Puedes restaurar más tarde con: wsctl restore --backup-id", backup_dir.name)


def cmd_switch_account(args: argparse.Namespace) -> None:
    print_header("CAMBIO GUIADO DE CUENTA DE WINDSURF")
    print(
        "Este asistente te ayuda a preparar tu equipo para cambiar de cuenta "
        "de Windsurf de forma limpia. No crea cuentas nuevas ni modifica la "
        "configuración de red."
    )

    print("\nPaso 1: revisar estado actual\n-----------------------------")
    cmd_status(args)

    print(
        "\nPaso 2: backup opcional de tu configuración actual\n" "-----------------------------------------------"
    )
    paths = find_existing_paths()
    if paths:
        if args.yes_backup:
            do_backup = True
        else:
            answer = input(
                "¿Quieres hacer un backup de la configuración antes de limpiar? [S/n]: "
            ).strip().lower()
            do_backup = answer in ("", "s", "y", "si", "sí")

        if do_backup:
            backup_dir = create_backup(paths)
        else:
            backup_dir = None
    else:
        print("No se encontraron carpetas locales de Windsurf para respaldar.")
        backup_dir = None

    print("\nPaso 3: limpieza de datos locales\n---------------------------------")
    if paths:
        # Reutilizar la lógica de cmd_clean de forma no interactiva según flags
        clean_args = argparse.Namespace(yes=args.yes, no_backup=args.no_backup)
        cmd_clean(clean_args)
    else:
        print("No hay datos locales que limpiar.")

    print("\nPaso 4: cambiar de cuenta en el IDE\n-----------------------------------")
    print(
        "Ahora debes cambiar manualmente de cuenta en el IDE de Windsurf. "
        "Guía sugerida:\n\n"
        "  1) Abre Windsurf.\n"
        "  2) Ve a la sección de cuenta / API key (por ejemplo desde la Command Palette).\n"
        "  3) Cierra sesión o limpia la API key actual.\n"
        "  4) Inicia sesión con la nueva cuenta que quieras usar.\n"
        "  5) Si es necesario, pega la nueva API key en la configuración.\n\n"
        "Si algo sale mal, puedes restaurar tu configuración anterior con:\n"
        "  wsctl restore"
    )


def list_backups() -> List[Path]:
    ensure_backup_root()
    backups: List[Path] = []
    for child in BACKUP_ROOT.iterdir():
        if child.is_dir():
            backups.append(child)
    backups.sort()
    return backups


def load_metadata(backup_dir: Path) -> dict:
    meta_file = backup_dir / "metadata.json"
    if not meta_file.exists():
        raise FileNotFoundError(f"No se encontró metadata.json en {backup_dir}")
    return json.loads(meta_file.read_text(encoding="utf-8"))


def cmd_restore(args: argparse.Namespace) -> None:
    backups = list_backups()
    if not backups:
        print("No hay backups disponibles.")
        return

    backup_dir: Path

    if args.backup_id:
        backup_dir = BACKUP_ROOT / args.backup_id
        if not backup_dir.exists():
            print(f"No se encontró el backup con id {args.backup_id}")
            return
    else:
        print_header("Backups disponibles")
        for i, b in enumerate(backups, start=1):
            print(f"{i}. {b.name}")
        choice = input("Elige un número de backup (o ENTER para cancelar): ").strip()
        if not choice:
            print("Operación cancelada.")
            return
        try:
            idx = int(choice)
            if not (1 <= idx <= len(backups)):
                raise ValueError
            backup_dir = backups[idx - 1]
        except ValueError:
            print("Selección inválida.")
            return

    try:
        meta = load_metadata(backup_dir)
    except Exception as exc:
        print(f"No se pudo leer la metadata del backup: {exc}")
        return

    print_header(f"Restaurando desde backup {backup_dir.name}")

    for entry in meta.get("paths", []):
        idx = entry.get("index")
        source_str = entry.get("source")
        if idx is None or source_str is None:
            continue
        src = backup_dir / f"path_{idx}"
        dest = Path(source_str)

        if not src.exists():
            print(f"- Saltando {source_str}, no existe en el backup.")
            continue

        if dest.exists():
            ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
            backup_existing = dest.with_name(dest.name + f".old-{ts}")
            print(
                f"- {dest} ya existe. Se moverá a {backup_existing} antes de restaurar."
            )
            try:
                dest.rename(backup_existing)
            except Exception as exc:
                print(f"  No se pudo mover {dest}: {exc}")
                continue

        print(f"- Restaurando {source_str}...")
        try:
            if src.is_file():
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dest)
            else:
                if dest.exists():
                    shutil.rmtree(dest, ignore_errors=True)
                shutil.copytree(src, dest)
        except Exception as exc:  # pragma: no cover
            print(f"  Error restaurando {source_str}: {exc}")

    print("\nRestauración completada.")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="wsctl",
        description=(
            "Herramienta CLI para gestionar datos locales de Windsurf: "
            "estado, backup, limpieza y restauración. "
            "No modifica tu cuenta online ni tu configuración de red."
        ),
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    # wsctl status
    p_status = subparsers.add_parser("status", help="Mostrar estado de datos locales e info de sistema")
    p_status.set_defaults(func=cmd_status)

    # wsctl backup
    p_backup = subparsers.add_parser("backup", help="Crear backup de datos locales de Windsurf")
    p_backup.set_defaults(func=cmd_backup)

    # wsctl clean
    p_clean = subparsers.add_parser(
        "clean",
        help="Eliminar datos locales de Windsurf (con backup opcional)",
    )
    p_clean.add_argument(
        "--yes",
        action="store_true",
        help="No preguntar confirmaciones (modo no interactivo)",
    )
    p_clean.add_argument(
        "--no-backup",
        action="store_true",
        help="No crear backup antes de limpiar (peligroso)",
    )
    p_clean.set_defaults(func=cmd_clean)

    # wsctl restore
    p_restore = subparsers.add_parser(
        "restore",
        help="Restaurar datos desde un backup previo",
    )
    p_restore.add_argument(
        "--backup-id",
        help="ID del backup (nombre de carpeta en el directorio de backups)",
    )
    p_restore.set_defaults(func=cmd_restore)

    # wsctl switch-account
    p_switch = subparsers.add_parser(
        "switch-account",
        help="Asistente para cambiar de cuenta de Windsurf de forma limpia",
    )
    p_switch.add_argument(
        "--yes",
        action="store_true",
        help="No pedir confirmación extra al limpiar (equivalente a clean --yes)",
    )
    p_switch.add_argument(
        "--no-backup",
        action="store_true",
        help="No crear backup antes de limpiar (no recomendado)",
    )
    p_switch.add_argument(
        "--yes-backup",
        action="store_true",
        help="Forzar backup sin preguntar (útil en scripts)",
    )
    p_switch.set_defaults(func=cmd_switch_account)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    func = getattr(args, "func", None)
    if func is None:
        parser.print_help()
        return 1
    func(args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
