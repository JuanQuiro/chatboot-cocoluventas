#!/bin/bash

# Script para monitorear mensajes en tiempo real

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  📊 MONITOREO DE MENSAJES EN TIEMPO REAL             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Presiona Ctrl+C para salir${NC}"
echo ""
echo -e "${BLUE}🔍 Monitoreando webhooks y mensajes...${NC}"
echo ""

# Contador inicial
INITIAL_COUNT=$(curl -s http://localhost:3008/api/open/messages 2>/dev/null | jq '.data.received | length' 2>/dev/null || echo "0")

echo -e "${GREEN}📊 Mensajes actuales: ${INITIAL_COUNT}${NC}"
echo ""

# Monitorear logs
tail -f logs/node-api.log 2>/dev/null | while IFS= read -r line; do
    # Filtrar líneas relevantes
    if echo "$line" | grep -qE "Webhook|Mensaje|📨|🔔|webhook|whatsapp|message"; then
        echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $line"
        
        # Si es un mensaje recibido, actualizar contador
        if echo "$line" | grep -qE "MENSAJE RECIBIDO|Mensaje registrado"; then
            sleep 1
            NEW_COUNT=$(curl -s http://localhost:3008/api/open/messages 2>/dev/null | jq '.data.received | length' 2>/dev/null || echo "0")
            if [ "$NEW_COUNT" -gt "$INITIAL_COUNT" ]; then
                echo -e "${GREEN}✅ ¡Nuevo mensaje recibido! Total: ${NEW_COUNT}${NC}"
                INITIAL_COUNT=$NEW_COUNT
            fi
        fi
    fi
done

