#!/bin/bash
set -e

echo "=========================================="
echo "DESPLIEGUE COMPLETO - Cocolu Chatbot"
echo "=========================================="
echo ""

# Crear directorio
echo "[1/10] Creando estructura de directorios..."
mkdir -p /var/www/cocolu-chatbot
cd /var/www/cocolu-chatbot

# Actualizar sistema
echo "[2/10] Actualizando sistema..."
apt update -qq

# Instalar Node.js
echo "[3/10] Instalando Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    echo "Node.js ya instalado: $(node -v)"
fi

# Instalar dependencias del sistema
echo "[4/10] Instalando dependencias del sistema..."
apt install -y nginx build-essential python3 certbot python3-certbot-nginx git -qq

# Instalar PM2
echo "[5/10] Instalando PM2..."
npm install -g pm2

echo ""
echo "=========================================="
echo "Sistema base instalado correctamente"
echo "=========================================="
echo ""
echo "Siguiente paso: Transferir archivos del proyecto"
echo "Ejecuta desde tu PC:"
echo "  scp -i C:\\Users\\grana\\.ssh\\cocolu_deploy_key -r C:\\Users\\grana\\chatboot-cocoluventas\\deploy-temp\\* root@173.249.205.142:/var/www/cocolu-chatbot/"
echo ""
