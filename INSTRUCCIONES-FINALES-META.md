# 🎯 INSTRUCCIONES FINALES - Configurar Meta Correctamente

## ⚠️ PROBLEMA ACTUAL

Tu webhook está configurado con la URL correcta, pero **solo está suscrito el campo "about"**. Necesitas suscribir **"messages"** y **"message_status"** para recibir mensajes.

## 📋 PASOS EXACTOS EN META DEVELOPERS

### 1. Ve a la sección "Campos del webhook" (Webhook fields)

En la tabla que muestra los campos disponibles:

### 2. Busca y activa "messages"

1. Busca la fila que dice **"messages"** en la columna "Campo"
2. En la columna "Versión", selecciona `v24.0` (o la versión que tengas)
3. En la columna "Suscribirse", **ACTIVA el toggle** (debe quedar en azul/activado)
4. Debe decir "Suscritos" o mostrar un check ✅

### 3. Busca y activa "message_status"

1. Busca la fila que dice **"message_status"** en la columna "Campo"
2. En la columna "Versión", selecciona `v24.0` (o la versión que tengas)
3. En la columna "Suscribirse", **ACTIVA el toggle** (debe quedar en azul/activado)
4. Debe decir "Suscritos" o mostrar un check ✅

### 4. Verifica y guarda

1. Haz clic en el botón **"Verificar y guardar"** (Verify and save)
2. Debe aparecer un mensaje de éxito
3. El webhook debe mostrar estado "Verificado" o "Activo"

## ✅ Verificación

Después de configurar, verifica:

1. **URL del webhook**: `https://rooms-sending-highs-material.trycloudflare.com/webhooks/whatsapp`
2. **Campos suscritos**: Debes ver al menos:
   - ✅ messages
   - ✅ message_status
3. **Estado**: Debe estar "Verificado" o "Activo"

## 🧪 Probar

1. **Mantén el túnel corriendo** (cloudflared en una terminal)
2. **Mantén el servidor corriendo** (`./start-production.sh`)
3. **Monitorea en otra terminal**:
   ```bash
   ./monitor-mensajes-tiempo-real.sh
   ```
4. **Envía un mensaje** al bot (+1 555 141-0797)
5. **Deberías ver** en los logs:
   ```
   🔔 Webhook recibido: ...
   📨 MENSAJE RECIBIDO DE META
   📨 De: [número]
   📨 Texto: [tu mensaje]
   ```

## 🔍 Si aún no funciona

### Verificar que el webhook esté recibiendo peticiones:

```bash
# Monitorear logs en tiempo real
tail -f logs/node-api.log | grep -E "Webhook|Mensaje|📨|🔔"
```

### Verificar mensajes registrados:

```bash
curl -s http://localhost:3008/api/open/messages | jq '.data.received | length'
```

### Verificar que el túnel esté activo:

El túnel de cloudflared debe estar corriendo y mostrar:
```
Registered tunnel connection
```

### Verificar el Verify Token:

El token en Meta debe coincidir exactamente con el de tu `.env`:
```bash
grep META_VERIFY_TOKEN .env
```

## 📊 Dashboard

Una vez que lleguen mensajes, podrás verlos en:
- **Dashboard**: http://localhost:3009/
- **API de mensajes**: http://localhost:3008/api/open/messages

