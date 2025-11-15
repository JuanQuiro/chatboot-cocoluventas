#!/bin/bash
#
# Script de Deployment desde GitHub
# Para ejecutar EN EL SERVIDOR
#

set -e

# Configuración
GIT_REPO="${GIT_REPO:-}"  # Se configurará automáticamente o manualmente
APP_DIR="/opt/cocolu-bot"
DOMAIN="emberdrago.com"
API_PORT=3009
NODE_PORT=3008

echo "🚀 ========================================"
echo "🚀   DEPLOYMENT DESDE GITHUB"
echo "🚀 ========================================"
echo ""

# Detectar si ya existe el directorio con git
if [ -d "$APP_DIR/.git" ]; then
    echo "📦 Repositorio Git encontrado, actualizando..."
    cd "$APP_DIR"
    
    # Obtener URL del repo si no está configurada
    if [ -z "$GIT_REPO" ]; then
        GIT_REPO=$(git remote get-url origin 2>/dev/null || echo "")
    fi
    
    if [ -n "$GIT_REPO" ]; then
        echo "   Repositorio: $GIT_REPO"
        git fetch origin
        # Intentar actualizar desde la rama actual, o main, o master
        CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
        if [ -n "$CURRENT_BRANCH" ]; then
            git reset --hard "origin/$CURRENT_BRANCH" || git reset --hard origin/master || git reset --hard origin/main
        else
            git reset --hard origin/master || git reset --hard origin/main
        fi
        echo "   ✅ Código actualizado"
    else
        echo "   ⚠️  No se pudo detectar el repositorio"
        echo "   Configura GIT_REPO manualmente o clona el repo"
    fi
else
    echo "📦 Clonando repositorio..."
    
    if [ -z "$GIT_REPO" ]; then
        echo ""
        echo "❌ No se ha configurado GIT_REPO"
        echo ""
        echo "Opciones:"
        echo "   1. Configura la variable: export GIT_REPO='https://github.com/usuario/repo.git'"
        echo "   2. O pasa el repo como argumento: $0 https://github.com/usuario/repo.git"
        echo ""
        read -p "   Ingresa la URL del repositorio: " GIT_REPO
        
        if [ -z "$GIT_REPO" ]; then
            echo "❌ No se proporcionó repositorio. Abortando."
            exit 1
        fi
    fi
    
    # Crear directorio si no existe
    mkdir -p "$(dirname $APP_DIR)"
    
    # Si el directorio existe pero no es un repo git, hacer backup
    if [ -d "$APP_DIR" ] && [ ! -d "$APP_DIR/.git" ]; then
        echo "   Haciendo backup del directorio existente..."
        mv "$APP_DIR" "${APP_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Clonar repositorio
    if [ -d "$APP_DIR" ] && [ -d "$APP_DIR/.git" ]; then
        cd "$APP_DIR"
        CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "master")
        git pull origin "$CURRENT_BRANCH" || git pull origin master || git pull origin main
    else
        git clone "$GIT_REPO" "$APP_DIR" || {
            echo "❌ Error clonando repositorio"
            exit 1
        }
        cd "$APP_DIR"
    fi
    
    echo "   ✅ Repositorio clonado"
fi

# Detectar OS
if [ -f /etc/alpine-release ]; then
    OS="alpine"
    echo ""
    echo "📋 Sistema: Alpine Linux"
elif [ -f /etc/debian_version ]; then
    OS="debian"
    echo ""
    echo "📋 Sistema: Debian/Ubuntu"
else
    OS="unknown"
    echo ""
    echo "📋 Sistema: Desconocido"
fi

# Instalar dependencias del sistema según OS
echo ""
echo "📦 Verificando dependencias del sistema..."
if [ "$OS" = "alpine" ]; then
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        echo "   Instalando Node.js..."
        apk update
        apk add --no-cache nodejs npm bash curl wget git build-base openssl-dev python3 make g++ || true
    fi
    
    # Verificar PM2
    if ! command -v pm2 &> /dev/null; then
        echo "   Instalando PM2..."
        npm install -g pm2 || true
    fi
elif [ "$OS" = "debian" ]; then
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        echo "   Instalando Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - || true
        apt-get install -y -qq nodejs || true
    fi
    
    # Verificar PM2
    if ! command -v pm2 &> /dev/null; then
        echo "   Instalando PM2..."
        npm install -g pm2 || true
    fi
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
    echo "   Instálalo manualmente y vuelve a ejecutar este script"
    exit 1
fi

# Instalar dependencias de la aplicación
echo ""
echo "📦 Instalando dependencias de la aplicación..."
cd "$APP_DIR"
npm install --production || {
    echo "⚠️  Error instalando dependencias, intentando sin --production..."
    npm install || {
        echo "❌ Error crítico instalando dependencias"
        exit 1
    }
}

# Crear directorios necesarios
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
cd "$APP_DIR"
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
echo "🔄 Para actualizar en el futuro:"
echo "   cd $APP_DIR"
echo "   git pull"
echo "   npm install --production"
echo "   pm2 restart cocolu-bot"
echo ""

