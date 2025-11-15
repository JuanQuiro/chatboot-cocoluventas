#!/bin/bash
#
# Script de Deployment
# Despliega la aplicación en el VPS
#

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
VPS_IP="173.249.205.142"
APP_DIR="/opt/cocolu-bot"
APP_USER="cocolu"
NODE_PORT=3008
API_PORT=3009
DOMAIN="${1:-}" # Dominio opcional como primer argumento

echo "🚀 ========================================"
echo "🚀   DEPLOYMENT DE COCOLU BOT"
echo "🚀 ========================================"
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -f "app-integrated.js" ]; then
    echo -e "${RED}❌ Error: No se encuentra app-integrated.js${NC}"
    echo "   Asegúrate de ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar si es root o tiene sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  Este script requiere permisos de root${NC}"
    echo "   Ejecuta: sudo $0 [dominio]"
    exit 1
fi

echo "📋 Configuración:"
echo "   Directorio: $APP_DIR"
echo "   Usuario: $APP_USER"
echo "   Puerto Node.js: $NODE_PORT"
echo "   Puerto API: $API_PORT"
if [ -n "$DOMAIN" ]; then
    echo "   Dominio: $DOMAIN"
fi
echo ""

# Paso 1: Detener servicios existentes
echo "🛑 Paso 1: Deteniendo servicios existentes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
echo "   ✅ Servicios detenidos"

# Paso 2: Copiar archivos
echo ""
echo "📦 Paso 2: Copiando archivos al directorio de producción..."
rsync -av --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dashboard/build' \
    --exclude='dashboard/node_modules' \
    --exclude='logs' \
    --exclude='*.log' \
    --exclude='.env' \
    --exclude='.env.*' \
    ./ "$APP_DIR/"

# Cambiar propietario
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
echo "   ✅ Archivos copiados"

# Paso 3: Instalar dependencias
echo ""
echo "📦 Paso 3: Instalando dependencias..."
cd "$APP_DIR"
sudo -u "$APP_USER" npm install --production
echo "   ✅ Dependencias instaladas"

# Paso 4: Verificar archivo .env
echo ""
echo "🔐 Paso 4: Verificando configuración..."
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    echo "   Creando .env desde .env.example (si existe)..."
    if [ -f "$APP_DIR/.env.example" ]; then
        cp "$APP_DIR/.env.example" "$APP_DIR/.env"
        chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
        echo -e "${YELLOW}   ⚠️  IMPORTANTE: Edita $APP_DIR/.env con tus credenciales${NC}"
    else
        echo -e "${RED}   ❌ No se encontró .env.example${NC}"
        echo "   Crea manualmente el archivo .env"
    fi
else
    echo "   ✅ Archivo .env encontrado"
fi

# Paso 5: Compilar dashboard (si existe)
echo ""
echo "🏗️  Paso 5: Compilando dashboard..."
if [ -d "$APP_DIR/dashboard" ]; then
    cd "$APP_DIR/dashboard"
    if [ -f "package.json" ]; then
        sudo -u "$APP_USER" npm install
        sudo -u "$APP_USER" npm run build 2>/dev/null || echo "   ⚠️  Error al compilar dashboard (puede que no tenga script build)"
    fi
    cd "$APP_DIR"
fi
echo "   ✅ Dashboard procesado"

# Paso 6: Crear directorios necesarios
echo ""
echo "📁 Paso 6: Creando directorios necesarios..."
mkdir -p "$APP_DIR/logs"
mkdir -p "$APP_DIR/.pm2"
chown -R "$APP_USER:$APP_USER" "$APP_DIR/logs" "$APP_DIR/.pm2"
echo "   ✅ Directorios creados"

# Paso 7: Configurar Nginx
echo ""
echo "🌐 Paso 7: Configurando Nginx..."
cat > /etc/nginx/sites-available/cocolu-bot <<EOF
# Configuración para Cocolu Bot
server {
    listen 80;
    server_name ${DOMAIN:-$VPS_IP} ${DOMAIN:-};

    # Logs
    access_log /var/log/nginx/cocolu-access.log;
    error_log /var/log/nginx/cocolu-error.log;

    # Tamaño máximo de upload
    client_max_body_size 50M;

    # Dashboard (si está compilado)
    location / {
        root $APP_DIR/dashboard/build;
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }

    # API - Node.js
    location /api {
        proxy_pass http://localhost:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Webhooks de Meta
    location /webhooks {
        proxy_pass http://localhost:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # SSE (Server-Sent Events)
    location /api/stream {
        proxy_pass http://localhost:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Cache-Control 'no-cache';
        proxy_set_header X-Accel-Buffering 'no';
        proxy_buffering off;
        proxy_read_timeout 24h;
    }
}
EOF

# Habilitar sitio
ln -sf /etc/nginx/sites-available/cocolu-bot /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Probar configuración
nginx -t
systemctl reload nginx
echo "   ✅ Nginx configurado"

# Paso 8: Iniciar aplicación con PM2
echo ""
echo "🚀 Paso 8: Iniciando aplicación con PM2..."
cd "$APP_DIR"

# Crear archivo de configuración PM2
cat > "$APP_DIR/ecosystem.config.js" <<EOF
module.exports = {
  apps: [{
    name: 'cocolu-bot',
    script: './app-integrated.js',
    cwd: '$APP_DIR',
    user: '$APP_USER',
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

chown "$APP_USER:$APP_USER" "$APP_DIR/ecosystem.config.js"

# Iniciar con PM2
sudo -u "$APP_USER" pm2 start ecosystem.config.js
sudo -u "$APP_USER" pm2 save
echo "   ✅ Aplicación iniciada con PM2"

# Paso 9: Configurar SSL (si hay dominio)
if [ -n "$DOMAIN" ]; then
    echo ""
    echo "🔒 Paso 9: Configurando SSL con Certbot..."
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN || {
        echo -e "${YELLOW}   ⚠️  No se pudo configurar SSL automáticamente${NC}"
        echo "   Puedes configurarlo manualmente después con: certbot --nginx -d $DOMAIN"
    }
    echo "   ✅ SSL configurado"
fi

# Paso 10: Mostrar estado
echo ""
echo "📊 Paso 10: Estado de los servicios..."
pm2 list
pm2 logs --lines 10

echo ""
echo "✅ ========================================"
echo "✅   DEPLOYMENT COMPLETADO"
echo "✅ ========================================"
echo ""
echo "🌐 URLs:"
if [ -n "$DOMAIN" ]; then
    echo "   Dashboard: http://$DOMAIN"
    echo "   API: http://$DOMAIN/api"
else
    echo "   Dashboard: http://$VPS_IP"
    echo "   API: http://$VPS_IP/api"
fi
echo ""
echo "📝 Comandos útiles:"
echo "   Ver logs: pm2 logs cocolu-bot"
echo "   Reiniciar: pm2 restart cocolu-bot"
echo "   Estado: pm2 status"
echo "   Monitoreo: pm2 monit"
echo ""

