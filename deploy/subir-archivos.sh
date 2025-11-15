#!/bin/bash
#
# Script para subir archivos al servidor
# Te pedirá la contraseña interactivamente
#

VPS_IP="173.249.205.142"
VPS_USER="root"
APP_DIR="/opt/cocolu-bot"

echo "📤 Subiendo archivos al servidor..."
echo "   Te pedirá la contraseña: a9psHSvLyrKock45yE2F"
echo ""

rsync -avz --progress \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dashboard/node_modules' \
  --exclude='dashboard/build' \
  --exclude='logs' \
  --exclude='*.log' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='.pm2' \
  --exclude='*.pid' \
  --exclude='tokens' \
  --exclude='src-rs-performance/target' \
  ./ "$VPS_USER@$VPS_IP:$APP_DIR/"

echo ""
echo "✅ Archivos subidos"
echo ""
echo "Ahora ejecuta en el servidor:"
echo "  ssh $VPS_USER@$VPS_IP"
echo "  cd $APP_DIR"
echo "  bash deploy/deploy-en-servidor.sh"

