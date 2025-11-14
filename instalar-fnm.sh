#!/bin/bash

# Script de Verificación e Instalación de Node.js
# Este script verifica si npm está instalado y lo usa directamente

set -e

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║        🚀 VERIFICACIÓN DE NODE.JS Y NPM               ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar si npm está instalado
echo -e "${BLUE}🔍 Verificando npm...${NC}"
echo ""

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ npm está instalado${NC}"
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
    echo ""
    
    # Verificar versión mínima
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✅ Versión de Node.js compatible (>= 18)${NC}"
        echo ""
    else
        echo -e "${YELLOW}⚠️  Versión de Node.js antigua (< 18)${NC}"
        echo "    Se recomienda actualizar a Node.js 18 o superior"
        echo ""
    fi
else
    echo -e "${RED}❌ npm NO está instalado${NC}"
    echo ""
    echo -e "${YELLOW}📋 Para instalar Node.js y npm:${NC}"
    echo ""
    echo "En Ubuntu/Debian:"
    echo "  $ sudo apt update"
    echo "  $ sudo apt install nodejs npm"
    echo ""
    echo "En macOS (con Homebrew):"
    echo "  $ brew install node"
    echo ""
    echo "En otras distribuciones:"
    echo "  Visita: https://nodejs.org/"
    echo ""
    exit 1
fi

echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║        ✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE        ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo -e "${BLUE}📋 Próximos pasos:${NC}"
echo ""
echo "1. Navega al proyecto:"
echo "   $ cd /home/guest/Documents/chatboot-cocoluventas"
echo ""
echo "2. Instala dependencias:"
echo "   $ npm install"
echo ""
echo "3. Inicia el bot:"
echo "   $ npm start"
echo ""
echo -e "${GREEN}¡Listo! El CLI interactivo te guiará.${NC}"
echo ""
