#!/bin/bash

# Script para configurar localtunnel (alternativa ligera)

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🌐 CONFIGURACIÓN LOCALTUNNEL (Alternativa ligera)   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar si localtunnel está instalado
if ! command -v lt &> /dev/null; then
    echo -e "${YELLOW}📥 Instalando localtunnel...${NC}"
    npm install -g localtunnel
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error instalando localtunnel${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ localtunnel encontrado${NC}"
echo ""

# Verificar que el servidor esté corriendo
if ! curl -s http://localhost:3008/api/health > /dev/null; then
    echo -e "${YELLOW}⚠️  El servidor Node.js no está corriendo en el puerto 3008${NC}"
    echo -e "${YELLOW}   Iniciando servidor...${NC}"
    ./start-production.sh > /dev/null 2>&1 &
    sleep 5
fi

# Verificar que el servidor responda
if curl -s http://localhost:3008/api/health > /dev/null; then
    echo -e "${GREEN}✅ Servidor Node.js está corriendo${NC}"
else
    echo -e "${RED}❌ No se pudo iniciar el servidor. Por favor inicia manualmente con: ./start-production.sh${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Iniciando localtunnel...${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "${YELLOW}   1. localtunnel mostrará una URL pública (ej: https://abc-123.loca.lt)${NC}"
echo -e "${YELLOW}   2. Copia esa URL y úsala para configurar el webhook en Meta${NC}"
echo -e "${YELLOW}   3. La URL del webhook debe ser: https://abc-123.loca.lt/webhooks/whatsapp${NC}"
echo ""
echo -e "${GREEN}Presiona Ctrl+C para detener localtunnel${NC}"
echo ""

# Iniciar localtunnel
lt --port 3008

