# 🔧 Solución: Webhook no recibe mensajes

## Problema
El sistema carga bien, el token está configurado, pero **no estás recibiendo mensajes** cuando envías al bot.

## Causas Comunes

### 1. ❌ Webhook no configurado en Meta Developers
**Síntoma:** No ves logs de webhooks cuando envías mensajes

**Solución:**
1. Ve a: https://developers.facebook.com/apps/
2. Selecciona tu App
3. Ve a **"WhatsApp" → "Configuration"**
4. En la sección **"Webhook"**, haz clic en **"Edit"** o **"Configurar"**
5. Configura:
   - **Callback URL**: `https://rooms-sending-highs-material.trycloudflare.com/webhooks/whatsapp`
   - **Verify Token**: `cocolu_webhook_verify_2025_secure_token_meta` (o el que tengas en `.env`)
6. Haz clic en **"Verify and Save"**
7. En **"Webhook fields"**, marca:
   - ✅ `messages`
   - ✅ `message_status`
8. Haz clic en **"Save"**

### 2. ❌ URL de Cloudflare incorrecta o cambiada
**Síntoma:** La URL en Meta no coincide con la URL actual de Cloudflare

**Solución:**
1. Verifica que Cloudflare esté corriendo:
   ```bash
   ps aux | grep cloudflared
   ```
2. Si no está corriendo, inícialo:
   ```bash
   cloudflared tunnel --url http://localhost:3008
   ```
3. Copia la URL que te da (ej: `https://abc123.trycloudflare.com`)
4. Actualiza la URL en Meta Developers:
   - Ve a WhatsApp → Configuration → Webhook
   - Cambia la Callback URL a: `https://TU-URL-AQUI.trycloudflare.com/webhooks/whatsapp`
   - Haz clic en "Save"

### 3. ❌ Verify Token no coincide
**Síntoma:** Meta no puede verificar el webhook

**Solución:**
1. Verifica el Verify Token en tu `.env`:
   ```bash
   grep META_VERIFY_TOKEN .env
   ```
2. Asegúrate de que el mismo token esté en Meta Developers:
   - Ve a WhatsApp → Configuration → Webhook
   - El Verify Token debe ser **exactamente igual** al de `.env`
   - No debe tener espacios ni caracteres extra

### 4. ❌ Campos no suscritos
**Síntoma:** El webhook se verifica pero no recibes mensajes

**Solución:**
1. Ve a WhatsApp → Configuration → Webhook
2. Haz clic en **"Manage"** o **"Gestionar"** junto a "Webhook fields"
3. Asegúrate de que estén marcados:
   - ✅ `messages` (OBLIGATORIO)
   - ✅ `message_status` (recomendado)
4. Haz clic en **"Save"**

### 5. ❌ Cloudflare no está corriendo
**Síntoma:** El webhook no es accesible desde internet

**Solución:**
1. Verifica si Cloudflare está corriendo:
   ```bash
   ps aux | grep cloudflared
   ```
2. Si no está corriendo, inícialo:
   ```bash
   cloudflared tunnel --url http://localhost:3008
   ```
3. **IMPORTANTE:** Mantén Cloudflare corriendo mientras uses el bot
4. Si reinicias Cloudflare, la URL cambiará y debes actualizarla en Meta

## 🔍 Verificar que Funciona

### Paso 1: Verificar que el webhook está configurado
```bash
./verificar-webhook-cloudflare.sh
```

### Paso 2: Monitorear logs en tiempo real
```bash
tail -f logs/node-api.log | grep -E "Webhook|webhook|🔔|📨|MENSAJE"
```

### Paso 3: Enviar mensaje de prueba
1. Envía un mensaje al número del bot: **+1 555 141-0797**
2. Deberías ver en los logs:
   ```
   🔔 Webhook recibido (procesamiento manual): ...
   📨 MENSAJE RECIBIDO DE META
   📨 De: 584244155614
   📨 Texto: hola
   ```

## ✅ Checklist Completo

- [ ] Cloudflare Tunnel está corriendo
- [ ] La URL de Cloudflare está configurada en Meta Developers
- [ ] El Verify Token coincide exactamente con `.env`
- [ ] Los campos `messages` y `message_status` están suscritos
- [ ] El servidor Node.js está corriendo en el puerto 3008
- [ ] El webhook se verificó correctamente (deberías ver "✅ Webhook verificado" en los logs)

## 🆘 Si Aún No Funciona

1. **Verifica los logs de Meta:**
   - Ve a WhatsApp → Configuration → Webhook
   - Revisa si hay errores en la sección de logs

2. **Prueba el webhook manualmente:**
   ```bash
   curl -X GET "https://rooms-sending-highs-material.trycloudflare.com/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=cocolu_webhook_verify_2025_secure_token_meta&hub.challenge=test"
   ```
   Debería responder con "test"

3. **Revisa que el servidor esté accesible:**
   ```bash
   curl -X GET "https://rooms-sending-highs-material.trycloudflare.com/api/health"
   ```

4. **Verifica que el número de teléfono esté correcto:**
   - El número debe ser: **+1 555 141-0797**
   - Debe estar en modo de prueba o tener método de pago configurado

