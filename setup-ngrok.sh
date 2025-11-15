#!/bin/bash

# Script para configurar ngrok y exponer el webhook localmente

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🌐 CONFIGURACIÓN NGROK PARA WEBHOOK META           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar si ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok no está instalado${NC}"
    echo ""
    echo -e "${YELLOW}📥 Instalando ngrok...${NC}"
    echo ""
    echo "Opciones de instalación:"
    echo "1. Descargar desde: https://ngrok.com/download"
    echo "2. O usar snap: sudo snap install ngrok"
    echo "3. O usar npm: npm install -g ngrok"
    echo ""
    read -p "¿Quieres que intente instalar con npm? (s/n): " install_choice
    
    if [ "$install_choice" = "s" ] || [ "$install_choice" = "S" ]; then
        npm install -g ngrok
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ ngrok instalado${NC}"
        else
            echo -e "${RED}❌ Error instalando ngrok. Por favor instálalo manualmente.${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Por favor instala ngrok manualmente y vuelve a ejecutar este script.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ ngrok encontrado${NC}"
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
echo -e "${BLUE}🚀 Iniciando ngrok...${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "${YELLOW}   1. ngrok mostrará una URL pública (ej: https://abc123.ngrok.io)${NC}"
echo -e "${YELLOW}   2. Copia esa URL y úsala para configurar el webhook en Meta${NC}"
echo -e "${YELLOW}   3. La URL del webhook debe ser: https://abc123.ngrok.io/webhooks/whatsapp${NC}"
echo ""
echo -e "${YELLOW}📋 Pasos para configurar en Meta:${NC}"
echo -e "${YELLOW}   1. Ve a https://developers.facebook.com/${NC}"
echo -e "${YELLOW}   2. Selecciona tu app de WhatsApp${NC}"
echo -e "${YELLOW}   3. Ve a WhatsApp > Configuration${NC}"
echo -e "${YELLOW}   4. En Webhook, configura:${NC}"
echo -e "${YELLOW}      - Callback URL: [LA URL DE NGROK]/webhooks/whatsapp${NC}"
echo -e "${YELLOW}      - Verify Token: [EL TOKEN DE TU .env]${NC}"
echo -e "${YELLOW}   5. Marca los campos: messages y message_status${NC}"
echo ""
echo -e "${GREEN}Presiona Ctrl+C para detener ngrok${NC}"
echo ""

# Iniciar ngrok
ngrok http 3008

