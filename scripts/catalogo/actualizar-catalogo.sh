#!/bin/bash

# Script para actualizar el enlace del catálogo
# Uso: ./actualizar-catalogo.sh "https://tu-enlace-de-canva"

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar el enlace del catálogo"
    echo ""
    echo "Uso:"
    echo "  ./actualizar-catalogo.sh \"https://www.canva.com/design/XXXXXXX/view\""
    echo ""
    echo "📋 Enlace actual:"
    grep "CATALOG_URL=" .env
    exit 1
fi

NEW_URL="$1"

echo "🔄 Actualizando catálogo..."
echo "📋 Nuevo enlace: $NEW_URL"

# Hacer backup del .env
cp .env .env.backup
echo "✅ Backup creado: .env.backup"

# Actualizar en .env
sed -i "s|CATALOG_URL=.*|CATALOG_URL=$NEW_URL|" .env

echo "✅ Archivo .env actualizado"
echo ""
echo "📋 Verificación:"
grep "CATALOG_URL=" .env
echo ""
echo "🔄 Para aplicar los cambios, reinicia el bot:"
echo "   pkill -9 -f node.*app-integrated && node app-integrated.js"
