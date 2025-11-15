#!/bin/bash
#
# Script para subir el proyecto al VPS
# Ejecutar desde tu máquina local
#

set -e

# Configuración
VPS_IP="173.249.205.142"
VPS_USER="root"
VPS_DIR="/opt/cocolu-bot"
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "📤 ========================================"
echo "📤   SUBIENDO PROYECTO AL VPS"
echo "📤 ========================================"
echo ""
echo "🌐 Servidor: $VPS_USER@$VPS_IP"
echo "📁 Directorio local: $LOCAL_DIR"
echo "📁 Directorio remoto: $VPS_DIR"
echo ""

# Verificar conexión
echo "🔍 Verificando conexión al servidor..."
if ! ssh -o ConnectTimeout=5 "$VPS_USER@$VPS_IP" "echo 'Conexión OK'" 2>/dev/null; then
    echo "❌ No se pudo conectar al servidor"
    echo "   Verifica que:"
    echo "   1. El servidor esté encendido"
    echo "   2. Tengas acceso SSH"
    echo "   3. La IP sea correcta: $VPS_IP"
    exit 1
fi
echo "   ✅ Conexión establecida"
echo ""

# Crear directorio en el servidor
echo "📁 Creando directorio en el servidor..."
ssh "$VPS_USER@$VPS_IP" "mkdir -p $VPS_DIR"
echo "   ✅ Directorio creado"
echo ""

# Subir archivos (excluyendo node_modules, .git, etc.)
echo "📤 Subiendo archivos..."
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
    "$LOCAL_DIR/" "$VPS_USER@$VPS_IP:$VPS_DIR/"

echo ""
echo "✅ ========================================"
echo "✅   ARCHIVOS SUBIDOS EXITOSAMENTE"
echo "✅ ========================================"
echo ""
echo "📝 Próximos pasos en el servidor:"
echo "   1. Conectarse: ssh $VPS_USER@$VPS_IP"
echo "   2. Configurar .env: nano $VPS_DIR/.env"
echo "   3. Ejecutar deployment: cd $VPS_DIR && sudo ./deploy/deploy.sh"
echo ""

