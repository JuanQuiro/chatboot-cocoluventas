#!/bin/bash

# Script de deployment

echo "🚀 =========================================="
echo "🚀 Deployment Chatbot Cocolu Ventas"
echo "🚀 =========================================="
echo ""

# Detener procesos existentes
echo "⏸️  Deteniendo procesos..."
pm2 stop chatbot-cocolu 2>/dev/null || true

# Actualizar código
echo "📥 Actualizando código..."
git pull origin main

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --only=production

# Reiniciar con PM2
echo "🔄 Reiniciando aplicación..."
pm2 restart ecosystem.config.js --env production

# Guardar configuración PM2
pm2 save

echo ""
echo "✅ Deployment completado!"
echo ""
echo "Ver logs: pm2 logs chatbot-cocolu"
echo "Ver status: pm2 status"
