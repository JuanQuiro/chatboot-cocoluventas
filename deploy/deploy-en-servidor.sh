#!/bin/bash
# Script para ejecutar EN EL SERVIDOR
# Copia y pega este script completo en el servidor

set -e

APP_DIR="/opt/cocolu-bot"
DOMAIN="emberdrago.com"
API_PORT=3009
NODE_PORT=3008

echo "🚀 ========================================"
echo "🚀   DEPLOYMENT EN EL SERVIDOR"
echo "🚀 ========================================"
echo ""

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
    apk add --no-cache nodejs npm bash curl wget git build-base openssl-dev || true
    npm install -g pm2 || true
elif [ "$OS" = "debian" ]; then
    apt-get update -qq
    apt-get install -y -qq curl wget git build-essential || true
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - || true
    apt-get install -y -qq nodejs || true
    npm install -g pm2 || true
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
pm2 logs cocolu-bot --lines 5 --nostream || echo "   ⚠️  No se pudieron obtener logs aún"

echo ""
echo "✅ ========================================"
echo "✅   DEPLOYMENT COMPLETADO"
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
echo "   3. Verifica Traefik: systemctl reload traefik (o reinicia contenedor Docker)"
echo "   4. Actualiza webhook de Meta: https://$DOMAIN/webhooks/whatsapp"
echo ""

