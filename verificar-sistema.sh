#!/bin/bash

# Script de Verificación del Sistema
# Verifica que todo esté listo para ejecutar el bot

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║        🔍 VERIFICACIÓN DEL SISTEMA - COCOLU VENTAS                ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Función para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

echo -e "${BLUE}📋 Verificando requisitos...${NC}"
echo ""

# 1. Node.js
echo -n "Node.js: "
which node > /dev/null 2>&1
check "Node.js instalado"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  Versión: $NODE_VERSION"
    MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR" -lt 18 ]; then
        warn "Node.js versión antigua (< 18)"
    fi
fi

# 2. npm
echo -n "npm: "
which npm > /dev/null 2>&1
check "npm instalado"

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  Versión: $NPM_VERSION"
fi

# 3. Git
echo -n "Git: "
which git > /dev/null 2>&1
check "Git instalado"

# 4. Directorio del proyecto
echo -n "Proyecto: "
[ -d "/home/guest/Documents/chatboot-cocoluventas" ]
check "Directorio del proyecto existe"

# 5. package.json
echo -n "package.json: "
[ -f "/home/guest/Documents/chatboot-cocoluventas/package.json" ]
check "package.json existe"

# 6. node_modules
echo -n "node_modules: "
if [ -d "/home/guest/Documents/chatboot-cocoluventas/node_modules" ]; then
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${YELLOW}⚠️  Dependencias no instaladas (ejecutar: npm install)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 7. .env
echo -n ".env: "
if [ -f "/home/guest/Documents/chatboot-cocoluventas/.env" ]; then
    echo -e "${GREEN}✅ Archivo .env existe${NC}"
else
    echo -e "${YELLOW}⚠️  Archivo .env no existe (se creará automáticamente)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 8. app-integrated.js
echo -n "app-integrated.js: "
[ -f "/home/guest/Documents/chatboot-cocoluventas/app-integrated.js" ]
check "Archivo principal existe"

# 9. iniciar-bot-profesional.js
echo -n "iniciar-bot-profesional.js: "
[ -f "/home/guest/Documents/chatboot-cocoluventas/iniciar-bot-profesional.js" ]
check "CLI profesional existe"

# 10. src/ directorio
echo -n "src/: "
[ -d "/home/guest/Documents/chatboot-cocoluventas/src" ]
check "Directorio src existe"

echo ""
echo -e "${BLUE}📊 Resumen de Verificación${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ SISTEMA COMPLETAMENTE LISTO${NC}"
    echo ""
    echo "Puedes iniciar el bot con:"
    echo "  $ npm start"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  SISTEMA LISTO CON ADVERTENCIAS ($WARNINGS)${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Instalar dependencias: npm install"
    echo "  2. Iniciar bot: npm start"
    echo ""
    exit 0
else
    echo -e "${RED}❌ ERRORES ENCONTRADOS ($ERRORS)${NC}"
    echo ""
    echo "Por favor, resuelve los errores antes de continuar."
    echo ""
    exit 1
fi
