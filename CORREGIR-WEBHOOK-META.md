# 🔧 CORRECCIÓN URGENTE - Webhook Meta

## ❌ PROBLEMAS DETECTADOS

### 1. Token incorrecto
- **En Meta**: `cocolu_webhook_verify_2025_secure_token_me` ❌
- **En .env**: `cocolu_webhook_verify_2025_secure_token_meta` ✅
- **Falta "ta" al final en Meta**

### 2. Producto incorrecto
- Estás configurando webhooks para **"Application"** ❌
- Debes configurar para **"WhatsApp Business Account"** ✅

## ✅ SOLUCIÓN PASO A PASO

### Paso 1: Cambiar el producto

1. En el dropdown **"Seleccionar producto"**
2. Selecciona **"WhatsApp Business Account"** (NO "Application")
3. Esto cambiará la página y mostrará los campos correctos

### Paso 2: Corregir el token

1. En el campo **"Token de verificación"**
2. Cambia de: `cocolu_webhook_verify_2025_secure_token_me`
3. A: `cocolu_webhook_verify_2025_secure_token_meta` (con "ta" al final)
4. **Debe coincidir EXACTAMENTE** con el de tu `.env`

### Paso 3: Verificar la URL

La URL debe ser:
```
https://rooms-sending-highs-material.trycloudflare.com/webhooks/whatsapp
```

### Paso 4: Suscribir campos

Una vez que cambies a "WhatsApp Business Account", verás una tabla con campos. Debes suscribir:

- ✅ **messages** (toggle activado)
- ✅ **message_status** (toggle activado)

### Paso 5: Verificar y guardar

1. Haz clic en **"Verificar y guardar"**
2. Debe aparecer un mensaje de éxito (sin errores rojos)
3. El webhook debe quedar "Verificado"

## 🧪 Verificar que funciona

Después de corregir:

1. **Mantén el túnel corriendo** (cloudflared)
2. **Monitorea los logs**:
   ```bash
   ./monitor-mensajes-tiempo-real.sh
   ```
3. **Envía un mensaje** al bot (+1 555 141-0797)
4. **Deberías ver**:
   ```
   🔔 Webhook recibido: ...
   📨 MENSAJE RECIBIDO DE META
   ```

## 📝 Nota sobre el funcionamiento anterior

Si antes funcionaba sin webhooks, era porque estabas usando **Baileys** (conexión directa). Ahora estás usando **Meta API** que **SÍ requiere webhooks** para recibir mensajes.

