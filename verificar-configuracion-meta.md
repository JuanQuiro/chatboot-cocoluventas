# 🔍 Verificación de Configuración Meta

## ⚠️ PROBLEMA DETECTADO

En la configuración de Meta que veo, solo está suscrito el campo **"about"**, pero necesitas suscribir:
- ✅ **messages** (para recibir mensajes)
- ✅ **message_status** (para recibir estados de mensajes)

## 📋 Pasos para corregir

### 1. En la sección "Campos del webhook" (Webhook fields):

Busca y suscribe estos campos:

1. **messages**
   - Versión: `v24.0` (o la que tengas disponible)
   - Toggle "Suscribirse": **ACTIVAR** (debe estar en azul)

2. **message_status**
   - Versión: `v24.0` (o la que tengas disponible)
   - Toggle "Suscribirse": **ACTIVAR** (debe estar en azul)

### 2. Verificar que el webhook esté verificado:

1. Haz clic en **"Verificar y guardar"** (Verify and save)
2. Debe aparecer un mensaje de éxito
3. El webhook debe mostrar estado "Verificado" o "Activo"

### 3. Verificar la URL:

La URL debe ser exactamente:
```
https://rooms-sending-highs-material.trycloudflare.com/webhooks/whatsapp
```

### 4. Verificar el Verify Token:

Debe coincidir exactamente con el que tienes en tu `.env` como `META_VERIFY_TOKEN`

## 🧪 Probar después de configurar

1. Mantén el túnel corriendo (cloudflared)
2. Mantén el servidor corriendo
3. Monitorea los logs:
   ```bash
   ./monitor-webhooks.sh
   ```
4. Envía un mensaje al bot (+1 555 141-0797)
5. Deberías ver en los logs:
   ```
   🔔 Webhook recibido: ...
   📨 MENSAJE RECIBIDO DE META
   ```

## 🔍 Verificar que funciona

Ejecuta:
```bash
./verificar-webhook-meta.sh
```

