#!/bin/bash

# Script para iniciar el bot con Meta y hacer pruebas locales

echo "🤖 =========================================="
echo "🤖   INICIANDO BOT COCOLU CON META"
echo "🤖 =========================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
  echo "❌ Error: No estamos en la raíz del proyecto"
  exit 1
fi

# Verificar que .env existe
if [ ! -f ".env" ]; then
  echo "❌ Error: No existe archivo .env"
  exit 1
fi

# Asegurarse de que BOT_ADAPTER=meta
if ! grep -q "BOT_ADAPTER=meta" .env; then
  echo "⚠️  Agregando BOT_ADAPTER=meta a .env"
  echo "BOT_ADAPTER=meta" >> .env
fi

echo "✅ Configuración verificada"
echo ""

# Iniciar el bot en background
echo "🚀 Iniciando bot..."
npm start &
BOT_PID=$!

echo "⏳ Esperando a que el bot se inicie (10 segundos)..."
sleep 10

# Verificar que el bot está corriendo
if ! ps -p $BOT_PID > /dev/null; then
  echo "❌ El bot no se inició correctamente"
  exit 1
fi

echo "✅ Bot iniciado (PID: $BOT_PID)"
echo ""

# Ejecutar pruebas de webhook
echo "🧪 Ejecutando pruebas de webhook..."
echo ""

node test-webhook-local.js

echo ""
echo "🤖 =========================================="
echo "✅ PRUEBAS COMPLETADAS"
echo "🤖 =========================================="
echo ""
echo "📝 Próximos pasos:"
echo "   1. Revisa los logs arriba para ver si el bot procesó los mensajes"
echo "   2. Si todo funcionó, el bot está listo para recibir mensajes reales desde Meta"
echo "   3. Para exponer a Internet, usa: ngrok http 3008 (requiere token)"
echo ""
echo "El bot seguirá corriendo. Presiona Ctrl+C para detenerlo."
echo ""

# Mantener el bot corriendo
wait $BOT_PID
