#!/bin/bash

# Script para iniciar Cloudflare Tunnel en segundo plano

echo "🌐 Iniciando Cloudflare Tunnel..."

# Matar cualquier instancia anterior de cloudflared
pkill -f "cloudflared tunnel" 2>/dev/null
sleep 1

# Crear directorio de logs si no existe
mkdir -p logs

# Iniciar cloudflared en segundo plano
nohup cloudflared tunnel --url http://localhost:3008 > logs/cloudflared.log 2>&1 &
CLOUDFLARED_PID=$!

echo "✅ Cloudflare Tunnel iniciado (PID: $CLOUDFLARED_PID)"
echo "⏳ Esperando 5 segundos para que se establezca la conexión..."

sleep 5

# Extraer la URL del túnel
if [ -f logs/cloudflared.log ]; then
    TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' logs/cloudflared.log | head -1)
    if [ ! -z "$TUNNEL_URL" ]; then
        echo ""
        echo "✅ URL del túnel: $TUNNEL_URL"
        echo "📋 URL del webhook: $TUNNEL_URL/webhooks/whatsapp"
        echo ""
        echo "💡 Configura esto en Meta Developers:"
        echo "   - Callback URL: $TUNNEL_URL/webhooks/whatsapp"
        echo "   - Verify Token: cocolu_webhook_verify_2025_secure_token_meta"
        echo ""
        echo "📝 Para ver los logs: tail -f logs/cloudflared.log"
        echo "🛑 Para detener: pkill -f 'cloudflared tunnel'"
    else
        echo "⚠️  No se pudo detectar la URL del túnel. Revisa logs/cloudflared.log"
    fi
else
    echo "⚠️  No se encontró el archivo de logs"
fi

