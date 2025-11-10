#!/bin/bash

# Quick Setup Script - Optimización Extrema
# Ejecutar: bash scripts/quick-setup.sh

echo "🚀 DASHOFFICE - OPTIMIZACIÓN EXTREMA"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Redis
echo -e "${YELLOW}[1/5] Verificando Redis...${NC}"
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis funcionando${NC}"
    else
        echo -e "${RED}❌ Redis no responde. Instalando...${NC}"
        sudo apt update
        sudo apt install redis-server -y
        sudo systemctl start redis
        sudo systemctl enable redis
    fi
else
    echo -e "${RED}❌ Redis no instalado. Instalando...${NC}"
    sudo apt update
    sudo apt install redis-server -y
    sudo systemctl start redis
    sudo systemctl enable redis
fi

# 2. Verificar PM2
echo -e "${YELLOW}[2/5] Verificando PM2...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ PM2 instalado${NC}"
else
    echo -e "${YELLOW}📦 Instalando PM2...${NC}"
    npm install -g pm2
fi

# 3. Instalar dependencias
echo -e "${YELLOW}[3/5] Instalando dependencias Node.js...${NC}"
npm install --production

# 4. Detener procesos anteriores
echo -e "${YELLOW}[4/5] Deteniendo procesos anteriores...${NC}"
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 5. Iniciar microservicios
echo -e "${YELLOW}[5/5] Iniciando microservicios optimizados...${NC}"
pm2 start ecosystem.microservices.js

echo ""
echo -e "${GREEN}✅ ¡SISTEMA OPTIMIZADO INICIADO!${NC}"
echo ""
echo "📊 Ver estado:"
echo "   pm2 status"
echo ""
echo "📈 Ver monitoreo:"
echo "   pm2 monit"
echo ""
echo "📝 Ver logs:"
echo "   pm2 logs"
echo ""
echo "🌐 URLs:"
echo "   API:  http://localhost:3009/health"
echo "   Bot:  http://localhost:3008"
echo ""
echo -e "${YELLOW}⚠️  SIGUIENTE PASO: Crear índices MongoDB${NC}"
echo "   Ver: OPTIMIZACION.md (Paso 3)"
echo ""
