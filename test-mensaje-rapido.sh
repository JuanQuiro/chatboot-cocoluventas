#!/bin/bash

# 🧪 Script para enviar un mensaje de prueba rápido al bot

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Enviando mensaje de prueba al bot...${NC}"
echo ""

# Simular mensaje "hola" desde WhatsApp
curl -X POST http://localhost:3008/webhooks/whatsapp \
  -H 'Content-Type: application/json' \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "2257544068060513",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15551410797",
            "phone_number_id": "886871767837680"
          },
          "messages": [{
            "from": "584244155614",
            "id": "wamid.test123",
            "timestamp": "'$(date +%s)'",
            "type": "text",
            "text": {
              "body": "hola"
            }
          }],
          "contacts": [{
            "profile": {
              "name": "Usuario Prueba"
            },
            "wa_id": "584244155614"
          }]
        },
        "field": "messages"
      }]
    }]
  }' 2>/dev/null

echo ""
echo -e "${GREEN}✅ Mensaje enviado${NC}"
echo ""
echo -e "${BLUE}📝 Revisa los logs para ver la respuesta:${NC}"
echo -e "   tail -f logs/node-api.log"
echo ""

