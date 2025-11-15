#!/bin/bash

# 🧪 Script de Prueba Rápida - Flujo Completo
# Inicia el sistema y muestra cómo probar

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🧪 PRUEBA RÁPIDA - Flujo Completo                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    exit 1
fi

# Cargar variables
export $(cat .env | grep -v '^#' | xargs)

echo -e "${GREEN}📋 Verificando configuración...${NC}"

# Verificar credenciales Meta
if [ -z "$META_JWT_TOKEN" ] || [ -z "$META_NUMBER_ID" ]; then
    echo -e "${YELLOW}⚠️  Credenciales Meta no configuradas completamente${NC}"
    echo -e "${YELLOW}   El sistema iniciará pero el bot puede no funcionar${NC}"
else
    echo -e "${GREEN}✅ Credenciales Meta configuradas${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Iniciando sistema...${NC}"
echo ""

# Iniciar en background
./start-production.sh > /tmp/cocolu-start.log 2>&1 &
START_PID=$!

echo -e "${YELLOW}⏳ Esperando que el sistema esté listo (30 segundos)...${NC}"
sleep 5

# Esperar a que los servicios estén listos
for i in {1..30}; do
    if curl -s http://localhost:3008/api/health > /dev/null 2>&1 && \
       curl -s http://localhost:3009/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Sistema iniciado correctamente${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ El sistema no respondió después de 30 segundos${NC}"
        echo -e "${YELLOW}   Revisa los logs: tail -f logs/*.log${NC}"
        kill $START_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ✅ SISTEMA LISTO PARA PROBAR                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}📊 Endpoints disponibles:${NC}"
echo -e "  🌐 Dashboard:     http://localhost:3009/"
echo -e "  🦀 Rust Health:   http://localhost:3009/health"
echo -e "  📦 Node Health:   http://localhost:3008/api/health"
echo -e "  🔗 Métricas:       http://localhost:3009/api/health/combined"
echo ""

echo -e "${GREEN}🧪 CÓMO PROBAR EL FLUJO:${NC}"
echo ""
echo -e "${YELLOW}OPCIÓN 1: Desde WhatsApp (Recomendado)${NC}"
echo -e "  1. Envía un mensaje desde WhatsApp al número: ${BLUE}+1 555 141 0797${NC}"
echo -e "  2. Escribe: ${BLUE}hola${NC}"
echo -e "  3. El bot debería responder con el menú"
echo ""

echo -e "${YELLOW}OPCIÓN 2: Simular mensaje (Para pruebas rápidas)${NC}"
echo -e "  Ejecuta este comando para simular un mensaje:"
echo ""
echo -e "${BLUE}curl -X POST http://localhost:3008/webhooks/whatsapp \\${NC}"
echo -e "${BLUE}  -H 'Content-Type: application/json' \\${NC}"
echo -e "${BLUE}  -d '{${NC}"
echo -e "${BLUE}    \"object\": \"whatsapp_business_account\",${NC}"
echo -e "${BLUE}    \"entry\": [{${NC}"
echo -e "${BLUE}      \"changes\": [{${NC}"
echo -e "${BLUE}        \"value\": {${NC}"
echo -e "${BLUE}          \"messages\": [{${NC}"
echo -e "${BLUE}            \"from\": \"584244155614\",${NC}"
echo -e "${BLUE}            \"text\": { \"body\": \"hola\" },${NC}"
echo -e "${BLUE}            \"type\": \"text\"${NC}"
echo -e "${BLUE}          }]${NC}"
echo -e "${BLUE}        }${NC}"
echo -e "${BLUE}      }]${NC}"
echo -e "${BLUE}    }]${NC}"
echo -e "${BLUE}  }'${NC}"
echo ""

echo -e "${GREEN}📝 Ver logs en tiempo real:${NC}"
echo -e "  ${BLUE}tail -f logs/node-api.log${NC}"
echo ""

echo -e "${GREEN}🛑 Para detener:${NC}"
echo -e "  ${BLUE}./stop-production.sh${NC}"
echo -e "  O presiona Ctrl+C"
echo ""

# Mantener el script corriendo
echo -e "${YELLOW}💡 El sistema está corriendo. Presiona Ctrl+C para detener.${NC}"
echo ""

# Mostrar logs
tail -f logs/node-api.log logs/rust-api.log 2>/dev/null &
TAIL_PID=$!

# Esperar señal de terminación
trap "kill $TAIL_PID 2>/dev/null; ./stop-production.sh; exit" SIGINT SIGTERM

wait

