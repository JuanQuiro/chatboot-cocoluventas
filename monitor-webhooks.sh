#!/bin/bash

echo "🔍 Monitoreando webhooks y mensajes en tiempo real..."
echo "Presiona Ctrl+C para salir"
echo ""
echo "=========================================="
echo ""

tail -f logs/node-api.log | grep --line-buffered -E "Webhook|Mensaje|message|📨|📦|📥|🔔" | while read line; do
    echo "$(date '+%H:%M:%S') $line"
done

