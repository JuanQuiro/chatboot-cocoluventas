#!/bin/bash
#
# Script de Deployment Paso a Paso
# Guía interactiva para deployment en Alpine Linux con Traefik
#

set -e

# Configuración
VPS_IP="173.249.205.142"
VPS_USER="root"
APP_DIR="/opt/cocolu-bot"
DOMAIN="emberdrago.com"
API_PORT=3009
NODE_PORT=3008

echo "🚀 ========================================"
echo "🚀   DEPLOYMENT PASO A PASO"
echo "🚀 ========================================"
echo ""
echo "Este script te guiará paso a paso"
echo "Necesitarás conectarte al servidor manualmente"
echo ""
echo "📋 Información del servidor:"
echo "   IP: $VPS_IP"
echo "   Usuario: $VPS_USER"
echo "   Contraseña: a9psHSvLyrKock45yE2F"
echo ""

# Paso 1: Subir archivos
echo "📤 PASO 1: Subir archivos al servidor"
echo "   Ejecuta este comando desde tu máquina local:"
echo ""
echo "   rsync -avz --progress \\"
echo "     --exclude='node_modules' \\"
echo "     --exclude='.git' \\"
echo "     --exclude='dashboard/node_modules' \\"
echo "     --exclude='dashboard/build' \\"
echo "     --exclude='logs' \\"
echo "     --exclude='*.log' \\"
echo "     --exclude='.env' \\"
echo "     --exclude='tokens' \\"
echo "     --exclude='src-rs-performance/target' \\"
echo "     ./ $VPS_USER@$VPS_IP:$APP_DIR/"
echo ""
read -p "   ¿Ya subiste los archivos? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "   ⚠️  Sube los archivos primero y luego ejecuta este script de nuevo"
    exit 1
fi

# Paso 2: Conectarse al servidor
echo ""
echo "🔌 PASO 2: Conectarse al servidor"
echo "   Ejecuta: ssh $VPS_USER@$VPS_IP"
echo "   Contraseña: a9psHSvLyrKock45yE2F"
echo ""
read -p "   ¿Estás conectado al servidor? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "   ⚠️  Conéctate primero y luego ejecuta los comandos en el servidor"
    exit 1
fi

# Generar script para ejecutar en el servidor
cat > /tmp/deploy-en-servidor.sh <<'DEPLOYSCRIPT'
#!/bin/bash
set -e

APP_DIR="/opt/cocolu-bot"
DOMAIN="emberdrago.com"
API_PORT=3009
NODE_PORT=3008

echo "🚀 Iniciando deployment en el servidor..."

# Detectar OS
if [ -f /etc/alpine-release ]; then
    OS="alpine"
    echo "📋 Sistema: Alpine Linux"
elif [ -f /etc/debian_version ]; then
    OS="debian"
    echo "📋 Sistema: Debian/Ubuntu"
else
    OS="unknown"
    echo "📋 Sistema: Desconocido"
fi

# Instalar dependencias según OS
echo ""
echo "📦 Instalando dependencias..."
if [ "$OS" = "alpine" ]; then
    apk update
    apk add --no-cache nodejs npm python3 py3-pip bash curl wget git build-base openssl-dev || true
    npm install -g pm2 || true
elif [ "$OS" = "debian" ]; then
    apt-get update -qq
    apt-get install -y -qq curl wget git build-essential || true
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - || true
    apt-get install -y -qq nodejs || true
    npm install -g pm2 || true
else
    echo "⚠️  Sistema no reconocido, intentando instalar Node.js genérico..."
    curl -fsSL https://nodejs.org/dist/v20.x/node-v20.x-linux-x64.tar.xz -o /tmp/node.tar.xz || true
fi

# Verificar Node.js
echo ""
echo "🔍 Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    echo "   ✅ Node.js: $NODE_VERSION"
    echo "   ✅ npm: $NPM_VERSION"
else
    echo "   ❌ Node.js no está instalado"
    exit 1
fi

# Ir al directorio
cd "$APP_DIR" || {
    echo "❌ No se encuentra el directorio $APP_DIR"
    echo "   Asegúrate de haber subido los archivos"
    exit 1
}

# Instalar dependencias de la aplicación
echo ""
echo "📦 Instalando dependencias de la aplicación..."
npm install --production || {
    echo "⚠️  Error instalando dependencias, continuando..."
}

# Crear directorios
echo ""
echo "📁 Creando directorios..."
mkdir -p logs .pm2

# Crear configuración PM2
echo ""
echo "📝 Creando configuración de PM2..."
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'cocolu-bot',
    script: './app-integrated.js',
    cwd: '$APP_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: $NODE_PORT,
      API_PORT: $API_PORT,
    },
    error_file: '$APP_DIR/logs/pm2-error.log',
    out_file: '$APP_DIR/logs/pm2-out.log',
    log_file: '$APP_DIR/logs/pm2-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    watch: false,
  }]
};
EOF

# Crear configuración Traefik
echo ""
echo "🌐 Creando configuración de Traefik..."
mkdir -p /etc/traefik/dynamic

cat > /etc/traefik/dynamic/cocolu-bot.yml <<EOF
http:
  routers:
    cocolu-api:
      rule: "Host(\`$DOMAIN\`) && PathPrefix(\`/api\`)"
      service: cocolu-api
      entryPoints:
        - web
        - websecure
      middlewares:
        - cocolu-headers
      tls:
        certResolver: letsencrypt

    cocolu-webhooks:
      rule: "Host(\`$DOMAIN\`) && PathPrefix(\`/webhooks\`)"
      service: cocolu-api
      entryPoints:
        - web
        - websecure
      middlewares:
        - cocolu-headers
      tls:
        certResolver: letsencrypt

    cocolu-dashboard:
      rule: "Host(\`$DOMAIN\`)"
      service: cocolu-api
      entryPoints:
        - web
        - websecure
      middlewares:
        - cocolu-headers
      tls:
        certResolver: letsencrypt

  services:
    cocolu-api:
      loadBalancer:
        servers:
          - url: "http://localhost:$API_PORT"

  middlewares:
    cocolu-headers:
      headers:
        customRequestHeaders:
          X-Forwarded-Proto: "https"
        customResponseHeaders:
          X-Content-Type-Options: "nosniff"
          X-Frame-Options: "DENY"
EOF

echo "   ✅ Configuración creada en /etc/traefik/dynamic/cocolu-bot.yml"

# Detener aplicación anterior
echo ""
echo "🛑 Deteniendo aplicación anterior..."
pm2 stop cocolu-bot 2>/dev/null || true
pm2 delete cocolu-bot 2>/dev/null || true

# Iniciar aplicación
echo ""
echo "🚀 Iniciando aplicación..."
pm2 start ecosystem.config.js
pm2 save

# Configurar PM2 para iniciar al arrancar
echo ""
echo "⚙️  Configurando PM2 para iniciar al arrancar..."
pm2 startup systemd -u root --hp /root 2>/dev/null || pm2 startup 2>/dev/null || echo "   ⚠️  No se pudo configurar startup automático"

# Verificar
echo ""
echo "🔍 Verificando deployment..."
pm2 list
echo ""
echo "📊 Estado de la aplicación:"
pm2 logs cocolu-bot --lines 5 --nostream

echo ""
echo "✅ ========================================"
echo "✅   DEPLOYMENT COMPLETADO EN EL SERVIDOR"
echo "✅ ========================================"
echo ""
echo "🌐 URLs:"
echo "   Dashboard: https://$DOMAIN"
echo "   API: https://$DOMAIN/api"
echo "   Webhooks: https://$DOMAIN/webhooks/whatsapp"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Configura .env: nano $APP_DIR/.env"
echo "   2. Configura DNS: A record $DOMAIN -> 173.249.205.142"
echo "   3. Verifica Traefik: systemctl reload traefik (o reinicia contenedor)"
echo "   4. Actualiza webhook de Meta: https://$DOMAIN/webhooks/whatsapp"
echo ""
DEPLOYSCRIPT

echo ""
echo "✅ Script generado: /tmp/deploy-en-servidor.sh"
echo ""
echo "📋 INSTRUCCIONES:"
echo ""
echo "1. Sube los archivos (si no lo has hecho):"
echo "   rsync -avz --exclude='node_modules' --exclude='.git' --exclude='tokens' --exclude='src-rs-performance/target' ./ root@$VPS_IP:$APP_DIR/"
echo ""
echo "2. Conéctate al servidor:"
echo "   ssh root@$VPS_IP"
echo ""
echo "3. Una vez en el servidor, ejecuta estos comandos:"
echo ""
echo "   cd $APP_DIR"
echo "   bash <(curl -s https://raw.githubusercontent.com/your-repo/deploy-en-servidor.sh) || bash /tmp/deploy-en-servidor.sh"
echo ""
echo "   O copia y pega este script completo en el servidor:"
echo ""
cat /tmp/deploy-en-servidor.sh
echo ""

