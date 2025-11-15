c#!/bin/bash

# 🔍 Script para verificar configuración del webhook con Cloudflare

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔍 Verificar Webhook con Cloudflare                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Cargar variables del .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    exit 1
fi

# Verificar que el servidor esté corriendo
if ! curl -s http://localhost:3008/api/health > /dev/null 2>&1; then
    echo -e "${RED}❌ El servidor Node.js no está corriendo en el puerto 3008${NC}"
    echo -e "${YELLOW}   Inicia el servidor: ./restart-production.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Servidor Node.js está corriendo${NC}"
echo ""

# Verificar si Cloudflare está corriendo
if pgrep -f "cloudflared" > /dev/null; then
    echo -e "${GREEN}✅ Cloudflare Tunnel está corriendo${NC}"
    
    # Intentar obtener la URL de Cloudflare
    CLOUDFLARE_URL=$(ps aux | grep cloudflared | grep -oP 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | head -1)
    
    if [ -n "$CLOUDFLARE_URL" ]; then
        echo -e "${BLUE}   URL detectada: ${CLOUDFLARE_URL}${NC}"
    else
        echo -e "${YELLOW}   ⚠️  No se pudo detectar la URL de Cloudflare${NC}"
        echo -e "${YELLOW}   Verifica manualmente la URL en la salida de cloudflared${NC}"
    fi
else
    echo -e "${RED}❌ Cloudflare Tunnel NO está corriendo${NC}"
    echo ""
    echo -e "${YELLOW}💡 Para iniciar Cloudflare Tunnel:${NC}"
    echo -e "   ${BLUE}cloudflared tunnel --url http://localhost:3008${NC}"
    echo ""
    echo -e "${YELLOW}   O usa el script:${NC}"
    echo -e "   ${BLUE}./setup-cloudflared.sh${NC}"
    exit 1
fi

echo ""

# Verificar verify token
if [ -z "$META_VERIFY_TOKEN" ]; then
    echo -e "${RED}❌ META_VERIFY_TOKEN no está configurado en .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Verify Token configurado: ${META_VERIFY_TOKEN:0:20}...${NC}"
echo ""

# Mostrar información para configurar en Meta
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  📋 Configuración del Webhook en Meta Developers      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ -n "$CLOUDFLARE_URL" ]; then
    WEBHOOK_URL="${CLOUDFLARE_URL}/webhooks/whatsapp"
else
    read -p "Ingresa la URL completa de Cloudflare (ej: https://abc123.trycloudflare.com): " CLOUDFLARE_URL
    WEBHOOK_URL="${CLOUDFLARE_URL}/webhooks/whatsapp"
fi

echo -e "${YELLOW}1. Ve a: ${BLUE}https://developers.facebook.com/apps/${NC}"
echo -e "${YELLOW}2. Selecciona tu App de WhatsApp${NC}"
echo -e "${YELLOW}3. Ve a 'WhatsApp' → 'Configuration'${NC}"
echo -e "${YELLOW}4. En la sección 'Webhook', haz clic en 'Edit' o 'Configurar'${NC}"
echo ""
echo -e "${GREEN}Configuración del Webhook:${NC}"
echo -e "  ${BLUE}Callback URL:${NC} ${GREEN}${WEBHOOK_URL}${NC}"
echo -e "  ${BLUE}Verify Token:${NC} ${GREEN}${META_VERIFY_TOKEN}${NC}"
echo ""
echo -e "${YELLOW}Campos a suscribir (Webhook fields):${NC}"
echo -e "  ✅ ${GREEN}messages${NC}"
echo -e "  ✅ ${GREEN}message_status${NC}"
echo ""

# Verificar que el webhook esté accesible
echo -e "${YELLOW}🔍 Verificando que el webhook esté accesible...${NC}"

if curl -s "${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${META_VERIFY_TOKEN}&hub.challenge=test" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ El webhook está accesible desde internet${NC}"
else
    echo -e "${RED}❌ El webhook NO está accesible desde internet${NC}"
    echo -e "${YELLOW}   Verifica que:${NC}"
    echo -e "   1. Cloudflare Tunnel esté corriendo"
    echo -e "   2. La URL sea correcta"
    echo -e "   3. El servidor Node.js esté corriendo en el puerto 3008"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🧪 Probar Webhook                                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Para probar si el webhook funciona:${NC}"
echo ""
echo -e "1. ${BLUE}Configura el webhook en Meta Developers${NC} (pasos de arriba)"
echo -e "2. ${BLUE}Meta enviará una petición GET${NC} para verificar"
echo -e "3. ${BLUE}Monitorea los logs:${NC}"
echo -e "   ${GREEN}tail -f logs/node-api.log | grep -E 'Webhook|webhook'${NC}"
echo -e "4. ${BLUE}Envía un mensaje${NC} al número del bot"
echo -e "5. ${BLUE}Deberías ver en los logs:${NC}"
echo -e "   ${GREEN}🔔 Webhook recibido${NC}"
echo -e "   ${GREEN}📨 MENSAJE RECIBIDO DE META${NC}"
echo ""

# Monitorear logs
read -p "¿Quieres monitorear los logs ahora? (s/n): " MONITOR

if [ "$MONITOR" = "s" ] || [ "$MONITOR" = "S" ] || [ "$MONITOR" = "y" ] || [ "$MONITOR" = "Y" ]; then
    echo ""
    echo -e "${YELLOW}📊 Monitoreando logs (Ctrl+C para salir)...${NC}"
    echo ""
    tail -f logs/node-api.log | grep --line-buffered -E "Webhook|webhook|🔔|📨|MENSAJE|Error|error"
fi

