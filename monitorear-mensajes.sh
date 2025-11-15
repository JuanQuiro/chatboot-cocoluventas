#!/bin/bash

# Script para monitorear mensajes recibidos en tiempo real

echo "📨 Monitoreando mensajes del bot..."
echo "Presiona Ctrl+C para salir"
echo ""

tail -f logs/node-api.log 2>/dev/null | grep --line-buffered -E "Webhook|📨|MENSAJE|message|incomingMsg|Provider|Bot debería procesar" || echo "No se encontraron logs. Verifica que el servidor esté corriendo."

