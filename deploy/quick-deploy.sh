#!/bin/bash
#
# Script de Deployment Rápido
# Para cuando ya tienes el servidor configurado
#

set -e

APP_DIR="/opt/cocolu-bot"
APP_USER="cocolu"

echo "🚀 Deployment rápido..."

# Detener aplicación
pm2 stop cocolu-bot 2>/dev/null || true

# Actualizar código (asumiendo que estás en el directorio del proyecto)
cd "$APP_DIR"
git pull || echo "⚠️  No se pudo hacer git pull"

# Instalar dependencias
npm install --production

# Reiniciar
pm2 restart cocolu-bot

echo "✅ Deployment rápido completado"
pm2 status

