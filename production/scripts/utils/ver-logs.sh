#!/bin/bash

# Script para ver logs del bot en tiempo real

echo "================================================"
echo "   📱 MONITOR DE LOGS - COCOLU CHATBOT"
echo "================================================"
echo ""
echo "Mostrando actividad del bot en tiempo real..."
echo "Presiona Ctrl+C para salir"
echo ""
echo "================================================"
echo ""

# Seguir los logs del proceso actual
tail -f bot.log 2>/dev/null || echo "Esperando mensajes del bot..."
