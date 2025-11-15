#!/bin/bash

# Script para probar el webhook localmente simulando un mensaje de Meta

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Probando webhook localmente...${NC}"
echo ""

# Verificar que el servidor esté corriendo
if ! curl -s http://localhost:3008/api/health > /dev/null; then
    echo -e "${YELLOW}⚠️  El servidor no está corriendo. Iniciando...${NC}"
    ./start-production.sh > /dev/null 2>&1 &
    sleep 5
fi

# Simular mensaje de Meta
echo -e "${BLUE}📨 Enviando mensaje de prueba al webhook...${NC}"

RESPONSE=$(curl -s -X POST http://localhost:3008/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15551410797",
            "phone_number_id": "123456789"
          },
          "contacts": [{
            "profile": {
              "name": "Usuario Prueba"
            },
            "wa_id": "584244155614"
          }],
          "messages": [{
            "from": "584244155614",
            "id": "wamid.test123",
            "timestamp": "'$(date +%s)'",
            "text": {
              "body": "Hola, este es un mensaje de prueba desde local"
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }')

if [ "$RESPONSE" = "OK" ]; then
    echo -e "${GREEN}✅ Webhook respondió correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  Respuesta: $RESPONSE${NC}"
fi

echo ""
echo -e "${BLUE}📊 Verificando mensajes registrados...${NC}"
sleep 2

MESSAGES=$(curl -s http://localhost:3008/api/open/messages)
RECEIVED=$(echo $MESSAGES | jq '.data.received | length' 2>/dev/null || echo "0")

if [ "$RECEIVED" -gt "0" ]; then
    echo -e "${GREEN}✅ ¡Éxito! Se registraron $RECEIVED mensajes${NC}"
    echo ""
    echo -e "${BLUE}📋 Último mensaje:${NC}"
    echo $MESSAGES | jq '.data.received[0]' 2>/dev/null
else
    echo -e "${YELLOW}⚠️  No se registraron mensajes. Revisa los logs:${NC}"
    echo -e "${YELLOW}   tail -20 logs/node-api.log${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Dashboard: http://localhost:3009/${NC}"
echo -e "${BLUE}   Deberías ver el mensaje en tiempo real${NC}"

