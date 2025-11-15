#!/bin/bash

# 🔐 Script para obtener token PERMANENTE de Meta usando System User
# Este token NO expira (hasta que lo revoques manualmente)

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔐 Obtener Token PERMANENTE de Meta                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📋 Este script te ayudará a obtener un token PERMANENTE${NC}"
echo -e "${YELLOW}   que NO expira (hasta que lo revoques manualmente)${NC}"
echo ""
echo -e "${BLUE}⚠️  IMPORTANTE: Necesitas acceso a Meta Business Settings${NC}"
echo ""

# Cargar variables del .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    exit 1
fi

echo -e "${YELLOW}📝 Paso 1: Necesito información de tu cuenta de Meta${NC}"
echo ""

read -p "Business Account ID (META_BUSINESS_ACCOUNT_ID): " BUSINESS_ACCOUNT_ID
read -p "App ID: " APP_ID
read -sp "App Secret: " APP_SECRET
echo ""

if [ -z "$BUSINESS_ACCOUNT_ID" ] || [ -z "$APP_ID" ] || [ -z "$APP_SECRET" ]; then
    echo -e "${RED}❌ Todos los campos son requeridos${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 Paso 2: Verificando System Users...${NC}"
echo ""

# Obtener System Users
SYSTEM_USERS_RESPONSE=$(curl -s -X GET "https://graph.facebook.com/v22.0/${BUSINESS_ACCOUNT_ID}/system_users?access_token=${APP_ID}|${APP_SECRET}")

if echo "$SYSTEM_USERS_RESPONSE" | grep -q "error"; then
    echo -e "${RED}❌ Error al obtener System Users:${NC}"
    echo "$SYSTEM_USERS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SYSTEM_USERS_RESPONSE"
    echo ""
    echo -e "${YELLOW}💡 Si no tienes System Users, necesitas crearlos manualmente:${NC}"
    echo -e "   1. Ve a: https://business.facebook.com/settings/system-users"
    echo -e "   2. Crea un nuevo System User"
    echo -e "   3. Asigna permisos de WhatsApp"
    echo -e "   4. Genera un token para ese System User"
    exit 1
fi

# Mostrar System Users disponibles
SYSTEM_USERS=$(echo "$SYSTEM_USERS_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); [print(f\"{u['id']}: {u.get('name', 'Sin nombre')}\") for u in data.get('data', [])]" 2>/dev/null || echo "")

if [ -z "$SYSTEM_USERS" ]; then
    echo -e "${YELLOW}⚠️  No se encontraron System Users${NC}"
    echo ""
    echo -e "${YELLOW}💡 Necesitas crear un System User manualmente:${NC}"
    echo -e "   1. Ve a: https://business.facebook.com/settings/system-users"
    echo -e "   2. Haz clic en 'Agregar'"
    echo -e "   3. Ingresa un nombre (ej: 'WhatsApp Bot System')"
    echo -e "   4. Selecciona 'Administrador del sistema' o 'Empleado'"
    echo -e "   5. Haz clic en 'Crear usuario del sistema'"
    echo -e "   6. Asigna permisos: 'WhatsApp Business Management API'"
    echo -e "   7. Genera un token para ese usuario"
    echo ""
    echo -e "${BLUE}📋 Alternativa: Usa el método manual (más fácil)${NC}"
    echo -e "   Ver: OBTENER-TOKEN-PERMANENTE.md"
    exit 1
fi

echo -e "${GREEN}✅ System Users encontrados:${NC}"
echo "$SYSTEM_USERS"
echo ""

read -p "System User ID (o presiona Enter para crear uno nuevo): " SYSTEM_USER_ID

if [ -z "$SYSTEM_USER_ID" ]; then
    echo ""
    echo -e "${YELLOW}💡 Para crear un System User:${NC}"
    echo -e "   1. Ve a: https://business.facebook.com/settings/system-users"
    echo -e "   2. Haz clic en 'Agregar'"
    echo -e "   3. Ingresa un nombre (ej: 'WhatsApp Bot System')"
    echo -e "   4. Selecciona 'Administrador del sistema'"
    echo -e "   5. Haz clic en 'Crear usuario del sistema'"
    echo -e "   6. Asigna permisos: 'WhatsApp Business Management API'"
    echo -e "   7. Genera un token para ese usuario"
    echo ""
    echo -e "${BLUE}📋 Luego ejecuta este script de nuevo con el System User ID${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🔄 Generando token permanente para System User ${SYSTEM_USER_ID}...${NC}"
echo ""

# Generar token permanente
TOKEN_RESPONSE=$(curl -s -X POST "https://graph.facebook.com/v22.0/${SYSTEM_USER_ID}/access_tokens?access_token=${APP_ID}|${APP_SECRET}")

if echo "$TOKEN_RESPONSE" | grep -q "error"; then
    echo -e "${RED}❌ Error al generar token:${NC}"
    echo "$TOKEN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TOKEN_RESPONSE"
    exit 1
fi

# Extraer el token
PERMANENT_TOKEN=$(echo "$TOKEN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")

if [ -z "$PERMANENT_TOKEN" ]; then
    echo -e "${RED}❌ No se pudo extraer el token de la respuesta:${NC}"
    echo "$TOKEN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TOKEN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Token permanente generado exitosamente${NC}"
echo ""
echo -e "${YELLOW}📝 Token permanente:${NC}"
echo -e "   ${PERMANENT_TOKEN:0:50}..."
echo ""
echo -e "${GREEN}✨ Este token NO expira (hasta que lo revoques manualmente)${NC}"
echo ""

# Preguntar si actualizar .env
read -p "¿Actualizar .env con el nuevo token permanente? (s/n): " UPDATE_ENV

if [ "$UPDATE_ENV" = "s" ] || [ "$UPDATE_ENV" = "S" ] || [ "$UPDATE_ENV" = "y" ] || [ "$UPDATE_ENV" = "Y" ]; then
    # Actualizar .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^META_JWT_TOKEN=.*/META_JWT_TOKEN=${PERMANENT_TOKEN}/" .env
    else
        # Linux
        sed -i "s/^META_JWT_TOKEN=.*/META_JWT_TOKEN=${PERMANENT_TOKEN}/" .env
    fi
    
    echo -e "${GREEN}✅ .env actualizado con token permanente${NC}"
    echo ""
    echo -e "${YELLOW}🔄 Reinicia el sistema para aplicar los cambios:${NC}"
    echo -e "   ${BLUE}./restart-production.sh${NC}"
else
    echo ""
    echo -e "${YELLOW}📋 Copia este token y actualiza .env manualmente:${NC}"
    echo -e "   ${BLUE}META_JWT_TOKEN=${PERMANENT_TOKEN}${NC}"
fi

echo ""
echo -e "${GREEN}✅ Proceso completado${NC}"
echo ""
echo -e "${BLUE}💡 Nota: Este token es PERMANENTE y no expirará${NC}"
echo -e "${BLUE}   Solo se revocará si lo haces manualmente desde Meta Business Settings${NC}"

