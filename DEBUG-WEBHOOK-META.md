# 🔍 Debug: Webhook Meta no recibe mensajes

## ✅ Lo que está funcionando

1. **Código del webhook**: El endpoint `/webhooks/whatsapp` está configurado y tiene logging detallado
2. **Registro de mensajes**: Los mensajes se registran en `messageLog` cuando llegan
3. **Dashboard**: El dashboard muestra los mensajes en tiempo real vía SSE
4. **Sistema**: Node.js y Rust están corriendo correctamente

## 🔴 Problema probable

**Meta no está enviando los webhooks a tu servidor** porque:

1. **El webhook no está configurado en Meta Developers**
2. **Tu servidor no es accesible desde internet** (necesitas ngrok o un dominio público)
3. **El webhook está configurado pero apunta a una URL incorrecta**

## 🔧 Solución paso a paso

### 1. Verificar que el webhook esté recibiendo peticiones

```bash
# Monitorear logs en tiempo real
./monitor-webhooks.sh

# O manualmente:
tail -f logs/node-api.log | grep -E "Webhook|Mensaje|📨"
```

### 2. Si NO ves logs cuando envías mensajes:

**El problema es que Meta no está enviando webhooks a tu servidor.**

#### Opción A: Usar ngrok (para desarrollo)

```bash
# Instalar ngrok si no lo tienes
# https://ngrok.com/download

# Iniciar ngrok apuntando al puerto 3008
ngrok http 3008

# Copiar la URL que te da (ej: https://abc123.ngrok.io)
# Configurar en Meta Developers:
# - Webhook URL: https://abc123.ngrok.io/webhooks/whatsapp
# - Verify Token: (el mismo que tienes en .env como META_VERIFY_TOKEN)
```

#### Opción B: Configurar webhook en Meta Developers

1. Ve a https://developers.facebook.com/
2. Selecciona tu app
3. Ve a WhatsApp > Configuration
4. En "Webhook", configura:
   - **Callback URL**: `https://tu-dominio.com/webhooks/whatsapp`
   - **Verify Token**: El mismo que tienes en `.env` como `META_VERIFY_TOKEN`
   - **Webhook fields**: Marca `messages` y `message_status`

### 3. Verificar que el webhook esté funcionando

```bash
# Enviar mensaje de prueba
./test-mensaje-dashboard.sh

# Deberías ver en los logs:
# 🔔 Webhook recibido: ...
# 📨 MENSAJE RECIBIDO DE META
```

### 4. Si ves los logs pero no aparecen en el dashboard

El mensaje se está recibiendo pero no se está procesando. Revisa:

```bash
# Ver logs completos
tail -50 logs/node-api.log

# Verificar que el mensaje se registró
curl -s http://localhost:3008/api/open/messages | jq '.data.received | length'
```

## 📋 Checklist

- [ ] El servidor está corriendo (`./start-production.sh`)
- [ ] El webhook está configurado en Meta Developers
- [ ] La URL del webhook es accesible desde internet (ngrok o dominio público)
- [ ] El `META_VERIFY_TOKEN` en `.env` coincide con el de Meta Developers
- [ ] Los campos del webhook incluyen `messages` y `message_status`
- [ ] El número de teléfono está verificado en Meta Business

## 🧪 Pruebas

```bash
# 1. Verificar que el servidor responde
curl http://localhost:3008/api/health

# 2. Probar webhook localmente
./test-mensaje-dashboard.sh

# 3. Monitorear en tiempo real
./monitor-webhooks.sh
```

## 📞 Si aún no funciona

1. **Verifica los logs de Meta**: En Meta Developers > WhatsApp > Webhooks, hay un log de eventos
2. **Verifica que el número esté verificado**: El número debe estar verificado en Meta Business
3. **Verifica el formato del webhook**: Meta envía el webhook en un formato específico, el código lo maneja pero verifica los logs

