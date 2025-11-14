#!/bin/bash
set -e

BLUE='\033[0;34m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${BLUE}\n╔════════════════════════════════════════════════════════╗\n║    🦀 INSTALACIÓN DE RUST EN GENTOO (OPCIONES)       ║\n╚════════════════════════════════════════════════════════╝${NC}\n"

if [[ $EUID -ne 0 ]]; then
  echo -e "${YELLOW}⚠️  No eres root: se usarán comandos con sudo${NC}\n"
fi

echo -e "${GREEN}Opción 1: Portage (recomendado si compilas desde sistema)${NC}"
echo "  sudo emerge --sync"
echo "  sudo emerge -av dev-lang/rust"
echo -e "\n${GREEN}Opción 2: rustup (rápida y flexible)${NC}"
echo "  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
echo "  source \"$HOME/.cargo/env\""
echo "  rustup default stable"

echo -e "\n${BLUE}Verificación:${NC}"
echo "  rustc --version && cargo --version"

echo -e "\n${GREEN}Listo. Luego compila y ejecuta:${NC}"
echo "  npm run rs:build && npm run rs:run"
