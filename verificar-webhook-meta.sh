#!/bin/bash

# Script para verificar que el webhook esté configurado correctamente

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ✅ VERIFICACIÓN DE WEBHOOK META                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

TUNNEL_URL="https://rooms-sending-highs-material.trycloudflare.com"
WEBHOOK_URL="${TUNNEL_URL}/webhooks/whatsapp"

echo -e "${BLUE}📋 Información del túnel:${NC}"
echo -e "   URL pública: ${GREEN}${TUNNEL_URL}${NC}"
echo -e "   Webhook URL: ${GREEN}${WEBHOOK_URL}${NC}"
echo ""

# Verificar que el túnel esté accesible
echo -e "${BLUE}🔍 Verificando conectividad...${NC}"
if curl -s --max-time 5 "${TUNNEL_URL}/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Túnel accesible desde internet${NC}"
else
    echo -e "${YELLOW}⚠️  El túnel puede tardar unos segundos en estar disponible${NC}"
fi
echo ""

# Verificar servidor local
echo -e "${BLUE}🔍 Verificando servidor local...${NC}"
if curl -s http://localhost:3008/api/health > /dev/null; then
    echo -e "${GREEN}✅ Servidor local funcionando${NC}"
else
    echo -e "${RED}❌ Servidor local no responde. Ejecuta: ./start-production.sh${NC}"
    exit 1
fi
echo ""

# Verificar webhook local
echo -e "${BLUE}🔍 Verificando webhook local...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3008/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"object":"test"}' 2>/dev/null)
if [ "$RESPONSE" = "OK" ] || [ -n "$RESPONSE" ]; then
    echo -e "${GREEN}✅ Webhook local funcionando${NC}"
else
    echo -e "${YELLOW}⚠️  Webhook local no responde correctamente${NC}"
fi
echo ""

echo -e "${BLUE}📋 Checklist para Meta Developers:${NC}"
echo ""
echo -e "${YELLOW}1. Ve a: https://developers.facebook.com/${NC}"
echo -e "${YELLOW}2. Selecciona tu app de WhatsApp${NC}"
echo -e "${YELLOW}3. Ve a: WhatsApp > Configuration${NC}"
echo -e "${YELLOW}4. En Webhook, configura:${NC}"
echo -e "   ${GREEN}Callback URL: ${WEBHOOK_URL}${NC}"
echo -e "   ${GREEN}Verify Token: [El token de tu .env como META_VERIFY_TOKEN]${NC}"
echo -e "${YELLOW}5. Haz clic en 'Verify and Save'${NC}"
echo -e "${YELLOW}6. En 'Webhook fields', marca:${NC}"
echo -e "   ${GREEN}✅ messages${NC}"
echo -e "   ${GREEN}✅ message_status${NC}"
echo -e "${YELLOW}7. Haz clic en 'Save'${NC}"
echo ""

echo -e "${BLUE}🧪 Para probar:${NC}"
echo -e "${YELLOW}1. Mantén el túnel corriendo (no cierres esa terminal)${NC}"
echo -e "${YELLOW}2. Envía un mensaje al bot (+1 555 141-0797)${NC}"
echo -e "${YELLOW}3. Monitorea los logs:${NC}"
echo -e "   ${GREEN}./monitor-webhooks.sh${NC}"
echo ""

echo -e "${BLUE}📊 Estado actual:${NC}"
MESSAGES=$(curl -s http://localhost:3008/api/open/messages 2>/dev/null)
RECEIVED=$(echo $MESSAGES | jq '.data.received | length' 2>/dev/null || echo "0")
echo -e "   Mensajes recibidos: ${GREEN}${RECEIVED}${NC}"
echo ""

if [ "$RECEIVED" -gt "0" ]; then
    echo -e "${GREEN}✅ Ya hay mensajes registrados${NC}"
    echo -e "${BLUE}📋 Último mensaje:${NC}"
    echo $MESSAGES | jq '.data.received[0]' 2>/dev/null
else
    echo -e "${YELLOW}⚠️  Aún no hay mensajes. Configura el webhook en Meta y envía un mensaje.${NC}"
fi

