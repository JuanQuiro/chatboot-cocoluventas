#!/bin/bash
#
# Script de Setup Inicial del VPS
# Configura el servidor para el deployment del bot
#

set -e

echo "🚀 ========================================"
echo "🚀   SETUP INICIAL DEL VPS"
echo "🚀 ========================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Información del servidor
VPS_IP="173.249.205.142"
VPS_USER="${USER:-root}"
APP_DIR="/opt/cocolu-bot"
APP_USER="cocolu"

echo "📋 Información del servidor:"
echo "   IP: $VPS_IP"
echo "   Usuario: $VPS_USER"
echo "   Directorio de la app: $APP_DIR"
echo ""

# Verificar si es root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  Este script requiere permisos de root${NC}"
    echo "   Ejecuta: sudo $0"
    exit 1
fi

echo ""
echo "🔧 Paso 1: Actualizando el sistema..."
apt-get update -qq
apt-get upgrade -y -qq

echo ""
echo "🔧 Paso 2: Instalando dependencias básicas..."
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    nano \
    vim \
    unzip \
    zip

echo ""
echo "🔧 Paso 3: Instalando Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verificar instalación
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "   ✅ Node.js: $NODE_VERSION"
echo "   ✅ npm: $NPM_VERSION"

echo ""
echo "🔧 Paso 4: Instalando PM2 (gestor de procesos)..."
npm install -g pm2

echo ""
echo "🔧 Paso 5: Instalando Nginx..."
apt-get install -y nginx

echo ""
echo "🔧 Paso 6: Instalando Certbot (para SSL)..."
apt-get install -y certbot python3-certbot-nginx

echo ""
echo "🔧 Paso 7: Configurando firewall (UFW)..."
# Permitir SSH
ufw allow 22/tcp
# Permitir HTTP
ufw allow 80/tcp
# Permitir HTTPS
ufw allow 443/tcp
# Permitir puertos de la aplicación (si es necesario)
ufw allow 3008/tcp
ufw allow 3009/tcp

# Habilitar firewall (con confirmación)
echo ""
echo -e "${YELLOW}⚠️  Se habilitará el firewall (UFW)${NC}"
echo "   Asegúrate de que el puerto SSH (22) esté abierto"
read -p "   ¿Continuar? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ufw --force enable
    echo "   ✅ Firewall habilitado"
else
    echo "   ⚠️  Firewall no habilitado (puedes hacerlo después con: ufw enable)"
fi

echo ""
echo "🔧 Paso 8: Configurando Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban
echo "   ✅ Fail2Ban configurado"

echo ""
echo "🔧 Paso 9: Creando usuario para la aplicación..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$APP_USER"
    echo "   ✅ Usuario $APP_USER creado"
else
    echo "   ℹ️  Usuario $APP_USER ya existe"
fi

echo ""
echo "🔧 Paso 10: Creando directorio de la aplicación..."
mkdir -p "$APP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"
echo "   ✅ Directorio $APP_DIR creado"

echo ""
echo "🔧 Paso 11: Configurando PM2 para iniciar al arrancar..."
pm2 startup systemd -u "$APP_USER" --hp /home/$APP_USER
echo "   ✅ PM2 configurado para iniciar al arrancar"

echo ""
echo "✅ ========================================"
echo "✅   SETUP INICIAL COMPLETADO"
echo "✅ ========================================"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Sube tu código al servidor"
echo "   2. Ejecuta: ./deploy/deploy.sh"
echo "   3. Configura tu dominio (opcional)"
echo ""
echo "🔐 Información importante:"
echo "   - IP del servidor: $VPS_IP"
echo "   - Usuario de la app: $APP_USER"
echo "   - Directorio de la app: $APP_DIR"
echo ""

