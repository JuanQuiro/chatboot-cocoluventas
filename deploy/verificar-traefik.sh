#!/bin/bash
#
# Script para verificar la configuración de Traefik
#

set -e

DOMAIN="${1:-emberdrago.com}"
VPS_IP="173.249.205.142"
API_PORT=3009

echo "🔍 ========================================"
echo "🔍   VERIFICACIÓN DE TRAEFIK"
echo "🔍 ========================================"
echo ""

echo "📋 Configuración esperada:"
echo "   Dominio: $DOMAIN"
echo "   IP del servidor: $VPS_IP"
echo "   Puerto API: 3009"
echo ""

# Verificar que Traefik esté corriendo
echo "🔍 Verificando Traefik..."
if systemctl is-active --quiet traefik; then
    echo "   ✅ Traefik está corriendo"
    systemctl status traefik --no-pager -l | head -10
else
    echo "   ⚠️  Traefik no está corriendo como servicio systemd"
    echo "   Verificando si está corriendo como proceso..."
    if pgrep -x traefik > /dev/null; then
        echo "   ✅ Traefik está corriendo como proceso"
    else
        echo "   ❌ Traefik no está corriendo"
    fi
fi

echo ""
echo "🔍 Verificando puertos..."
if netstat -tuln | grep -q ":80 "; then
    echo "   ✅ Puerto 80 está en uso"
    netstat -tuln | grep ":80 "
else
    echo "   ⚠️  Puerto 80 no está en uso"
fi

if netstat -tuln | grep -q ":443 "; then
    echo "   ✅ Puerto 443 está en uso"
    netstat -tuln | grep ":443 "
else
    echo "   ⚠️  Puerto 443 no está en uso"
fi

echo ""
echo "🔍 Verificando aplicación..."
if pm2 list | grep -q "cocolu-bot"; then
    echo "   ✅ Aplicación está corriendo con PM2"
    pm2 list | grep cocolu-bot
else
    echo "   ⚠️  Aplicación no está corriendo con PM2"
fi

echo ""
echo "🔍 Verificando puertos de la aplicación..."
if netstat -tuln 2>/dev/null | grep -q ":$API_PORT " || ss -tuln 2>/dev/null | grep -q ":$API_PORT "; then
    echo "   ✅ Puerto $API_PORT está en uso"
    netstat -tuln 2>/dev/null | grep ":$API_PORT " || ss -tuln 2>/dev/null | grep ":$API_PORT "
else
    echo "   ⚠️  Puerto $API_PORT no está en uso"
    echo "   La aplicación puede no estar corriendo"
fi

echo ""
echo "📝 Configuración de DNS requerida:"
echo "   Tipo: A"
echo "   Nombre: $DOMAIN (o @ si es dominio raíz)"
echo "   Valor: $VPS_IP"
echo "   TTL: 3600 (o automático)"
echo ""

echo "📝 Verificar configuración de Traefik:"
echo "   1. Archivo de configuración: /etc/traefik/traefik.yml"
echo "   2. Configuración dinámica: /etc/traefik/dynamic/"
echo "   3. Logs: journalctl -u traefik -f"
echo ""

