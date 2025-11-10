#!/bin/bash

# Script para iniciar el chatbot

echo "🤖 Iniciando Chatbot Cocolu Ventas..."
echo ""

# Verificar que existe .env
if [ ! -f .env ]; then
    echo "❌ Archivo .env no encontrado"
    echo "Por favor ejecuta: npm run setup"
    exit 1
fi

# Crear directorios si no existen
mkdir -p database
mkdir -p logs

# Iniciar con PM2 si está disponible
if command -v pm2 &> /dev/null; then
    echo "🚀 Iniciando con PM2..."
    pm2 start ecosystem.config.js --env production
else
    echo "🚀 Iniciando con Node.js..."
    node app.js
fi
