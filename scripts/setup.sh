#!/bin/bash

# Script de configuración inicial para Chatbot Cocolu Ventas

echo "🤖 =========================================="
echo "🤖 Setup Chatbot Cocolu Ventas"
echo "🤖 =========================================="
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Por favor instala Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versión $NODE_VERSION es muy antigua"
    echo "Por favor actualiza a Node.js >= 18.0.0"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"
echo ""

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "✅ Archivo .env creado"
    echo "⚠️  Por favor configura tus credenciales en .env"
    echo ""
else
    echo "✅ Archivo .env ya existe"
    echo ""
fi

# Crear directorio de base de datos
if [ ! -d "database" ]; then
    echo "📁 Creando directorio database..."
    mkdir -p database
    echo "✅ Directorio database creado"
    echo ""
else
    echo "✅ Directorio database ya existe"
    echo ""
fi

# Crear directorio de logs
if [ ! -d "logs" ]; then
    echo "📁 Creando directorio logs..."
    mkdir -p logs
    echo "✅ Directorio logs creado"
    echo ""
else
    echo "✅ Directorio logs ya existe"
    echo ""
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
    echo ""
else
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo "🤖 =========================================="
echo "🤖 Setup completado!"
echo "🤖 =========================================="
echo ""
echo "Próximos pasos:"
echo "1. Configura tus credenciales en el archivo .env"
echo "2. Ejecuta: npm run dev"
echo ""
echo "¡Listo para empezar! 🚀"
