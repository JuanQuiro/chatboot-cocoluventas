#!/bin/bash

# Script de Instalación de Node.js y npm en Gentoo Linux
# Instalación segura y optimizada para Gentoo

set -e

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║    🚀 INSTALACIÓN DE NODE.JS Y NPM EN GENTOO          ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar si es root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Este script debe ejecutarse como root${NC}"
    echo ""
    echo "Ejecuta:"
    echo "  $ sudo bash instalar-npm-gentoo.sh"
    echo ""
    exit 1
fi

echo -e "${BLUE}📋 Verificando sistema...${NC}"
echo ""

# Verificar si es Gentoo
if [ ! -f /etc/os-release ]; then
    echo -e "${RED}❌ No se puede determinar el SO${NC}"
    exit 1
fi

source /etc/os-release
if [ "$ID" != "gentoo" ]; then
    echo -e "${YELLOW}⚠️  Este script está optimizado para Gentoo${NC}"
    echo "    Se detectó: $PRETTY_NAME"
    echo ""
fi

echo -e "${BLUE}🔄 Actualizando portage...${NC}"
echo ""

# Actualizar portage
emerge --sync

echo ""
echo -e "${BLUE}📦 Instalando Node.js y npm...${NC}"
echo ""

# Instalar Node.js con npm
# Usar la versión LTS más reciente
emerge -av net-libs/nodejs

echo ""
echo -e "${GREEN}✅ Instalación completada${NC}"
echo ""

# Verificar instalación
echo -e "${BLUE}✅ Verificando instalación...${NC}"
echo ""

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

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
    echo "    Se recomienda actualizar"
    echo ""
fi

echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║        ✅ INSTALACIÓN COMPLETADA EXITOSAMENTE         ║"
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
echo -e "${GREEN}¡Listo! El CLI profesional te guiará.${NC}"
echo ""
