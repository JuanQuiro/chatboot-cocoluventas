#!/bin/bash

# Script de Instalación de fnm (Fast Node Manager)
# Este script instala fnm y Node.js LTS

set -e

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║        🚀 INSTALACIÓN DE FNM (Fast Node Manager)      ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📥 Descargando fnm...${NC}"
echo ""

# Detectar el sistema operativo
OS=$(uname -s)
ARCH=$(uname -m)

if [ "$OS" = "Linux" ]; then
    if [ "$ARCH" = "x86_64" ]; then
        FNM_URL="https://github.com/Schniz/fnm/releases/download/v1.37.1/fnm-linux"
    elif [ "$ARCH" = "aarch64" ]; then
        FNM_URL="https://github.com/Schniz/fnm/releases/download/v1.37.1/fnm-linux-arm64"
    else
        echo "❌ Arquitectura no soportada: $ARCH"
        exit 1
    fi
elif [ "$OS" = "Darwin" ]; then
    if [ "$ARCH" = "x86_64" ]; then
        FNM_URL="https://github.com/Schniz/fnm/releases/download/v1.37.1/fnm-macos"
    elif [ "$ARCH" = "arm64" ]; then
        FNM_URL="https://github.com/Schniz/fnm/releases/download/v1.37.1/fnm-macos-arm64"
    else
        echo "❌ Arquitectura no soportada: $ARCH"
        exit 1
    fi
else
    echo "❌ Sistema operativo no soportado: $OS"
    exit 1
fi

echo -e "${BLUE}🔗 URL: $FNM_URL${NC}"
echo ""

# Crear directorio si no existe
mkdir -p ~/.local/bin

# Descargar fnm
echo -e "${BLUE}📥 Descargando fnm...${NC}"
curl -fsSL "$FNM_URL" -o ~/.local/bin/fnm || wget -q "$FNM_URL" -O ~/.local/bin/fnm

# Hacer ejecutable
chmod +x ~/.local/bin/fnm

echo -e "${GREEN}✅ fnm descargado${NC}"
echo ""

# Configurar PATH
echo -e "${BLUE}⚙️  Configurando PATH...${NC}"

# Detectar shell
SHELL_RC=""
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
else
    SHELL_RC="$HOME/.bashrc"
fi

echo -e "${BLUE}📝 Shell detectado: $SHELL_RC${NC}"
echo ""

# Agregar fnm al PATH si no está
if ! grep -q "fnm env" "$SHELL_RC"; then
    echo "" >> "$SHELL_RC"
    echo "# fnm (Fast Node Manager)" >> "$SHELL_RC"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
    echo 'eval "$(fnm env --use-on-cd)"' >> "$SHELL_RC"
    echo -e "${GREEN}✅ fnm agregado a $SHELL_RC${NC}"
else
    echo -e "${YELLOW}⚠️  fnm ya está configurado en $SHELL_RC${NC}"
fi

echo ""

# Recargar shell
echo -e "${BLUE}🔄 Recargando shell...${NC}"
source "$SHELL_RC"

echo -e "${GREEN}✅ Shell recargado${NC}"
echo ""

# Verificar fnm
echo -e "${BLUE}✅ Verificando fnm...${NC}"
FNM_VERSION=$(~/.local/bin/fnm --version)
echo -e "${GREEN}✅ fnm versión: $FNM_VERSION${NC}"
echo ""

# Instalar Node.js LTS
echo -e "${BLUE}📥 Instalando Node.js LTS...${NC}"
~/.local/bin/fnm install --lts
~/.local/bin/fnm use lts-latest

echo ""
echo -e "${GREEN}✅ Node.js LTS instalado${NC}"
echo ""

# Verificar Node.js
echo -e "${BLUE}✅ Verificando Node.js...${NC}"
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
echo ""

echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║        ✅ INSTALACIÓN COMPLETADA EXITOSAMENTE         ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo -e "${BLUE}📋 Próximos pasos:${NC}"
echo ""
echo "1. Abre una nueva terminal"
echo "2. Navega al proyecto:"
echo "   $ cd /home/guest/Documents/chatboot-cocoluventas"
echo ""
echo "3. Instala dependencias:"
echo "   $ npm install"
echo ""
echo "4. Inicia el bot:"
echo "   $ npm start"
echo ""
echo -e "${GREEN}¡Listo! El CLI interactivo te guiará.${NC}"
echo ""
