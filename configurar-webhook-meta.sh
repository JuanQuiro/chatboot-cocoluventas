#!/bin/bash

# 🔧 Script para configurar webhook de Meta
# Este script te ayuda a configurar el webhook en Meta Developers

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔧 Configuración de Webhook Meta                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Cargar variables de .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    exit 1
fi

# Verificar que las variables estén configuradas
if [ -z "$META_VERIFY_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  META_VERIFY_TOKEN no configurado en .env${NC}"
    exit 1
fi

echo -e "${GREEN}📋 Información de configuración:${NC}"
echo ""
echo -e "  Verify Token: ${YELLOW}$META_VERIFY_TOKEN${NC}"
echo -e "  Number ID:    ${YELLOW}$META_NUMBER_ID${NC}"
echo -e "  API Version: ${YELLOW}$META_API_VERSION${NC}"
echo ""

# Obtener IP pública o URL
echo -e "${BLUE}🌐 Configuración de URL del Webhook:${NC}"
echo ""
echo -e "${YELLOW}Para desarrollo local, puedes usar:${NC}"
echo -e "  1. ngrok (recomendado para pruebas)"
echo -e "  2. Tu dominio público (para producción)"
echo ""

read -p "¿Tienes una URL pública para el webhook? (s/n): " tiene_url

if [ "$tiene_url" = "s" ] || [ "$tiene_url" = "S" ]; then
    read -p "Ingresa la URL completa del webhook (ej: https://tu-dominio.com/webhooks/whatsapp): " webhook_url
else
    echo ""
    echo -e "${YELLOW}Para desarrollo local, instala ngrok:${NC}"
    echo -e "  sudo apt install ngrok  # o descarga desde https://ngrok.com/"
    echo ""
    echo -e "${YELLOW}Luego ejecuta:${NC}"
    echo -e "  ngrok http 3008"
    echo ""
    echo -e "${YELLOW}Y usa la URL HTTPS que te proporciona ngrok${NC}"
    read -p "Ingresa la URL del webhook (con ngrok o tu dominio): " webhook_url
fi

echo ""
echo -e "${GREEN}📝 Pasos para configurar en Meta Developers:${NC}"
echo ""
echo -e "1. Ve a: ${BLUE}https://developers.facebook.com/apps/${NC}"
echo -e "2. Selecciona tu App"
echo -e "3. Ve a 'WhatsApp' → 'Configuration'"
echo -e "4. En 'Webhook', haz clic en 'Edit'"
echo ""
echo -e "${YELLOW}Configuración del Webhook:${NC}"
echo -e "  Callback URL: ${GREEN}$webhook_url/webhooks/whatsapp${NC}"
echo -e "  Verify Token: ${GREEN}$META_VERIFY_TOKEN${NC}"
echo ""
echo -e "${YELLOW}Campos a suscribir:${NC}"
echo -e "  ✅ messages"
echo -e "  ✅ message_status"
echo ""

# Crear endpoint de verificación
echo -e "${GREEN}✅ El endpoint de verificación ya está configurado en:${NC}"
echo -e "   ${BLUE}/webhooks/whatsapp${NC} (GET para verificación, POST para mensajes)"
echo ""

echo -e "${GREEN}🚀 Para probar:${NC}"
echo -e "  1. Inicia el servidor: ${BLUE}./start-production.sh${NC}"
echo -e "  2. Configura el webhook en Meta Developers con la URL de arriba"
echo -e "  3. Meta enviará una petición GET para verificar"
echo -e "  4. Si todo está bien, verás 'Webhook verificado' en los logs"
echo ""

