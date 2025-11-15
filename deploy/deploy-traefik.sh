#!/bin/bash
#
# Script de Deployment con Traefik
# Para servidores que ya tienen Traefik configurado
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
# Usar root si no hay otro usuario, o el usuario actual
if [ "$EUID" -eq 0 ]; then
    APP_USER="root"
else
    APP_USER="${SUDO_USER:-$USER}"
fi
NODE_PORT=3008
API_PORT=3009
DOMAIN="${1:-emberdrago.com}"  # Subdominio por defecto

echo "🚀 ========================================"
echo "🚀   DEPLOYMENT CON TRAEFIK"
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
    echo "   Ejecuta: sudo $0 [subdominio]"
    exit 1
fi

echo "📋 Configuración:"
echo "   Directorio: $APP_DIR"
echo "   Usuario: $APP_USER"
echo "   Puerto Node.js: $NODE_PORT"
echo "   Puerto API: $API_PORT"
echo "   Subdominio: $DOMAIN"
echo ""

# Paso 1: Detener servicios existentes
echo "🛑 Paso 1: Deteniendo servicios existentes..."
pm2 stop cocolu-bot 2>/dev/null || true
pm2 delete cocolu-bot 2>/dev/null || true
echo "   ✅ Servicios detenidos"

# Paso 2: Verificar usuario
echo ""
echo "👤 Paso 2: Verificando usuario..."
echo "   ℹ️  Usando usuario: $APP_USER"
if [ "$APP_USER" != "root" ] && ! id "$APP_USER" &>/dev/null; then
    echo -e "${YELLOW}   ⚠️  Usuario $APP_USER no existe, usando root${NC}"
    APP_USER="root"
fi
echo "   ✅ Usuario: $APP_USER"

# Paso 3: Instalar dependencias
echo ""
echo "📦 Paso 3: Instalando dependencias..."
cd "$APP_DIR"
npm install --production
echo "   ✅ Dependencias instaladas"

# Paso 4: Verificar archivo .env
echo ""
echo "🔐 Paso 4: Verificando configuración..."
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    if [ -f "$APP_DIR/.env.example" ]; then
        cp "$APP_DIR/.env.example" "$APP_DIR/.env"
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
        npm install
        npm run build 2>/dev/null || echo "   ⚠️  Error al compilar dashboard (puede que no tenga script build)"
    fi
    cd "$APP_DIR"
fi
echo "   ✅ Dashboard procesado"

# Paso 6: Crear directorios necesarios
echo ""
echo "📁 Paso 6: Creando directorios necesarios..."
mkdir -p "$APP_DIR/logs"
mkdir -p "$APP_DIR/.pm2"
chown -R "$APP_USER:$APP_USER" "$APP_DIR/logs" "$APP_DIR/.pm2" 2>/dev/null || true
echo "   ✅ Directorios creados"

# Paso 7: Configurar Traefik (labels para Docker o archivo de configuración)
echo ""
echo "🌐 Paso 7: Configurando Traefik..."
echo "   ℹ️  Traefik ya está configurado en el servidor"
echo "   ℹ️  Asegúrate de que Traefik tenga acceso a los puertos $NODE_PORT y $API_PORT"

# Crear archivo de configuración para Traefik (si usa archivos)
TRAEFIK_CONFIG="/etc/traefik/dynamic/cocolu-bot.yml"
mkdir -p /etc/traefik/dynamic 2>/dev/null || true

cat > "$TRAEFIK_CONFIG" <<EOF
# Configuración de Traefik para Cocolu Bot
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
          X-Real-IP: ""
        customResponseHeaders:
          X-Content-Type-Options: "nosniff"
          X-Frame-Options: "DENY"
EOF

echo "   ✅ Configuración de Traefik creada en $TRAEFIK_CONFIG"
echo "   ⚠️  IMPORTANTE: Verifica que Traefik esté leyendo este archivo"

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

chown "$APP_USER:$APP_USER" "$APP_DIR/ecosystem.config.js" 2>/dev/null || true

# Iniciar con PM2
if [ "$APP_USER" = "root" ]; then
    pm2 start ecosystem.config.js
    pm2 save
else
    sudo -u "$APP_USER" pm2 start ecosystem.config.js || pm2 start ecosystem.config.js
    sudo -u "$APP_USER" pm2 save || pm2 save
fi
echo "   ✅ Aplicación iniciada con PM2"

# Paso 9: Verificar que Traefik esté funcionando
echo ""
echo "🔍 Paso 9: Verificando configuración de Traefik..."
if systemctl is-active --quiet traefik; then
    echo "   ✅ Traefik está corriendo"
    systemctl reload traefik 2>/dev/null || echo "   ⚠️  No se pudo recargar Traefik (puede requerir reinicio manual)"
else
    echo -e "${YELLOW}   ⚠️  Traefik no está corriendo o no está como servicio systemd${NC}"
    echo "   Verifica manualmente que Traefik esté activo"
fi

# Paso 10: Mostrar estado
echo ""
echo "📊 Paso 10: Estado de los servicios..."
pm2 list
pm2 logs cocolu-bot --lines 10 --nostream

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
echo "   1. Verifica que Traefik tenga la configuración correcta"
echo "   2. Configura DNS: A record $DOMAIN -> $VPS_IP"
echo "   3. Verifica que Traefik esté escuchando en puertos 80 y 443"
echo "   4. Actualiza el webhook de Meta: https://$DOMAIN/webhooks/whatsapp"
echo ""
echo "📝 Comandos útiles:"
echo "   Ver logs: pm2 logs cocolu-bot"
echo "   Reiniciar: pm2 restart cocolu-bot"
echo "   Estado: pm2 status"
echo "   Monitoreo: pm2 monit"
echo ""

