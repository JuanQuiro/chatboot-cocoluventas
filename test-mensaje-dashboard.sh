#!/bin/bash

echo "🧪 Probando registro de mensajes en el dashboard..."
echo ""

# Simular mensaje entrante
echo "📨 Enviando mensaje de prueba al webhook..."
curl -X POST http://localhost:3008/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "584244155614",
            "text": {
              "body": "Hola, este es un mensaje de prueba"
            },
            "type": "text"
          }]
        }
      }]
    }]
  }' > /dev/null 2>&1

sleep 2

echo "📊 Verificando mensajes registrados..."
RESULT=$(curl -s http://localhost:3008/api/open/messages)
RECEIVED=$(echo $RESULT | jq '.data.received | length' 2>/dev/null || echo "0")

if [ "$RECEIVED" -gt "0" ]; then
    echo "✅ ¡Éxito! Se registraron $RECEIVED mensajes"
    echo ""
    echo "📋 Últimos mensajes:"
    echo $RESULT | jq '.data.received[0:3]' 2>/dev/null || echo "Error parseando JSON"
else
    echo "❌ No se registraron mensajes. Verificando logs..."
    tail -10 logs/node-api.log | grep -E "Mensaje|message" || echo "No hay logs de mensajes"
fi

echo ""
echo "🌐 Abre el dashboard en: http://localhost:3009/"
echo "   Deberías ver los mensajes en tiempo real"

