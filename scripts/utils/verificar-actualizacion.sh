#!/bin/bash

# Script de verificación de actualización del sistema
# Verifica que todos los cambios se hayan aplicado correctamente

echo ""
echo "🔍 ==============================================="
echo "🔍 VERIFICACIÓN DE ACTUALIZACIÓN DEL SISTEMA"
echo "🔍 ==============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de verificaciones
PASS=0
FAIL=0

# Función para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ $1${NC}"
        ((FAIL++))
    fi
}

# 1. Verificar que app-integrated.js tiene los cambios
echo "📋 Verificando app-integrated.js..."
grep -q "qrWatchdog" app-integrated.js
check "Variable qrWatchdog agregada"

grep -q "providerConfig" app-integrated.js
check "Configuración Baileys mejorada"

grep -q "connection.update" app-integrated.js
check "Listener connection.update agregado"

grep -q "require_action" app-integrated.js
check "Listener require_action agregado"

grep -q "auth_failure" app-integrated.js
check "Listener auth_failure agregado"

grep -q "SIGTERM" app-integrated.js
check "Handler SIGTERM agregado"

grep -q "unhandledRejection" app-integrated.js
check "Handler unhandledRejection agregado"

# 2. Verificar .gitignore
echo ""
echo "📋 Verificando .gitignore..."
grep -q "ocr-debug/" .gitignore
check "ocr-debug/ en .gitignore"

grep -q "auth/" .gitignore
check "auth/ en .gitignore"

grep -q "pairing-code.txt" .gitignore
check "pairing-code.txt en .gitignore"

# 3. Verificar package.json
echo ""
echo "📋 Verificando package.json..."
grep -q "@hapi/boom" package.json
check "@hapi/boom agregado"

grep -q "@whiskeysockets/baileys" package.json
check "@whiskeysockets/baileys agregado"

grep -q "qrcode" package.json
check "qrcode agregado"

grep -q "tesseract.js" package.json
check "tesseract.js agregado"

grep -q "helmet" package.json
check "helmet agregado"

# 4. Verificar que Node.js está instalado
echo ""
echo "📋 Verificando dependencias del sistema..."
node --version > /dev/null 2>&1
check "Node.js instalado"

npm --version > /dev/null 2>&1
check "npm instalado"

# 5. Verificar estructura de carpetas
echo ""
echo "📋 Verificando estructura de carpetas..."
[ -d "src" ]
check "Carpeta src existe"

[ -d "src/flows" ]
check "Carpeta src/flows existe"

[ -d "src/services" ]
check "Carpeta src/services existe"

[ -f "app-integrated.js" ]
check "app-integrated.js existe"

# Resumen
echo ""
echo "🔍 ==============================================="
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "🔍 ==============================================="
echo -e "${GREEN}✅ Pasadas: $PASS${NC}"
echo -e "${RED}❌ Fallidas: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡TODAS LAS VERIFICACIONES PASARON!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. npm install          # Instalar nuevas dependencias"
    echo "2. npm run dev          # Iniciar en modo desarrollo"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  ALGUNAS VERIFICACIONES FALLARON${NC}"
    echo ""
    echo "Por favor, revisa los cambios aplicados."
    echo ""
    exit 1
fi
