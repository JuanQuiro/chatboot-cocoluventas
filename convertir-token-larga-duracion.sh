#!/bin/bash

# 🔐 Script para convertir token temporal de Meta a token de larga duración

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔐 Convertir Token de Meta a Larga Duración          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Cargar variables del .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    exit 1
fi

# Verificar que existe el token actual
if [ -z "$META_JWT_TOKEN" ]; then
    echo -e "${RED}❌ META_JWT_TOKEN no está configurado en .env${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Token actual encontrado${NC}"
echo -e "   ${META_JWT_TOKEN:0:50}..."
echo ""

# Solicitar App ID y App Secret
echo -e "${BLUE}📝 Necesito tu App ID y App Secret de Meta Developers${NC}"
echo -e "${YELLOW}   Puedes encontrarlos en:${NC}"
echo -e "   https://developers.facebook.com/apps/"
echo -e "   → Tu App → Settings → Basic"
echo ""

read -p "App ID: " APP_ID
read -sp "App Secret: " APP_SECRET
echo ""

if [ -z "$APP_ID" ] || [ -z "$APP_SECRET" ]; then
    echo -e "${RED}❌ App ID y App Secret son requeridos${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔄 Convirtiendo token temporal a token de larga duración...${NC}"
echo ""

# Hacer la petición para convertir el token
RESPONSE=$(curl -s -X GET "https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${META_JWT_TOKEN}")

# Verificar si hubo error
if echo "$RESPONSE" | grep -q "error"; then
    echo -e "${RED}❌ Error al convertir el token:${NC}"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

# Extraer el nuevo token
NEW_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")

if [ -z "$NEW_TOKEN" ]; then
    echo -e "${RED}❌ No se pudo extraer el nuevo token de la respuesta:${NC}"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

# Extraer expires_in
EXPIRES_IN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('expires_in', 'N/A'))" 2>/dev/null || echo "N/A")

# Calcular días
if [ "$EXPIRES_IN" != "N/A" ]; then
    DAYS=$((EXPIRES_IN / 86400))
    echo -e "${GREEN}✅ Token convertido exitosamente${NC}"
    echo -e "   Duración: ${DAYS} días (~${EXPIRES_IN} segundos)"
else
    echo -e "${GREEN}✅ Token convertido exitosamente${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Nuevo token:${NC}"
echo -e "   ${NEW_TOKEN:0:50}..."
echo ""

# Preguntar si actualizar .env
read -p "¿Actualizar .env con el nuevo token? (s/n): " UPDATE_ENV

if [ "$UPDATE_ENV" = "s" ] || [ "$UPDATE_ENV" = "S" ] || [ "$UPDATE_ENV" = "y" ] || [ "$UPDATE_ENV" = "Y" ]; then
    # Actualizar .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^META_JWT_TOKEN=.*/META_JWT_TOKEN=${NEW_TOKEN}/" .env
    else
        # Linux
        sed -i "s/^META_JWT_TOKEN=.*/META_JWT_TOKEN=${NEW_TOKEN}/" .env
    fi
    
    echo -e "${GREEN}✅ .env actualizado${NC}"
    echo ""
    echo -e "${YELLOW}🔄 Reinicia el sistema para aplicar los cambios:${NC}"
    echo -e "   ${BLUE}./restart-production.sh${NC}"
else
    echo ""
    echo -e "${YELLOW}📋 Copia este token y actualiza .env manualmente:${NC}"
    echo -e "   ${BLUE}META_JWT_TOKEN=${NEW_TOKEN}${NC}"
fi

echo ""
echo -e "${GREEN}✅ Proceso completado${NC}"

