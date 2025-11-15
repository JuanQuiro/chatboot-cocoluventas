# 🧪 Probar Meta Webhook Localmente

## ✅ Lo que ya funciona

El webhook está funcionando correctamente. Acabas de probar con `./test-webhook-local.sh` y funcionó.

## 🌐 Exponer servidor local a internet (ngrok)

Para que Meta pueda enviar webhooks a tu servidor local, necesitas usar ngrok:

### Paso 1: Iniciar ngrok

```bash
./setup-ngrok.sh
```

O manualmente:

```bash
ngrok http 3008
```

Esto te dará una URL pública como: `https://abc123.ngrok.io`

### Paso 2: Configurar webhook en Meta

1. Ve a https://developers.facebook.com/
2. Selecciona tu app de WhatsApp
3. Ve a **WhatsApp > Configuration**
4. En la sección **Webhook**, haz clic en **Edit**
5. Configura:
   - **Callback URL**: `https://abc123.ngrok.io/webhooks/whatsapp`
     (reemplaza `abc123.ngrok.io` con tu URL de ngrok)
   - **Verify Token**: El mismo que tienes en tu `.env` como `META_VERIFY_TOKEN`
6. Haz clic en **Verify and Save**
7. En **Webhook fields**, marca:
   - ✅ `messages`
   - ✅ `message_status`
8. Haz clic en **Save**

### Paso 3: Probar

1. **Mantén ngrok corriendo** (no lo cierres)
2. **Mantén el servidor corriendo** (`./start-production.sh`)
3. **Envía un mensaje** al número del bot (+1 555 141-0797)
4. **Monitorea los logs**:
   ```bash
   ./monitor-webhooks.sh
   ```
   O:
   ```bash
   tail -f logs/node-api.log | grep -E "Webhook|Mensaje|📨"
   ```

## 🧪 Pruebas rápidas

### Probar webhook localmente (sin Meta)
```bash
./test-webhook-local.sh
```

### Ver mensajes registrados
```bash
curl -s http://localhost:3008/api/open/messages | jq '.data.received'
```

### Ver dashboard
Abre en el navegador: http://localhost:3009/

## ⚠️ Importante

1. **ngrok debe estar corriendo** mientras quieras recibir mensajes
2. **La URL de ngrok cambia** cada vez que lo reinicias (a menos que tengas cuenta de pago)
3. **Si reinicias ngrok**, debes actualizar la URL en Meta Developers

## 🔧 Alternativa: ngrok con URL fija (opcional)

Si tienes cuenta de ngrok, puedes configurar una URL fija:

```bash
ngrok http 3008 --domain=tu-dominio.ngrok.io
```

Esto requiere cuenta de pago de ngrok.

## 📋 Checklist

- [ ] ngrok está corriendo (`./setup-ngrok.sh`)
- [ ] Webhook configurado en Meta Developers con la URL de ngrok
- [ ] Verify Token coincide con el de `.env`
- [ ] Campos `messages` y `message_status` marcados
- [ ] Servidor Node.js corriendo (`./start-production.sh`)
- [ ] Enviar mensaje de prueba al bot

## 🐛 Si no funciona

1. **Verifica que ngrok esté corriendo**: Debe mostrar una URL pública
2. **Verifica la URL en Meta**: Debe ser exactamente `https://[tu-url-ngrok]/webhooks/whatsapp`
3. **Verifica el Verify Token**: Debe coincidir exactamente
4. **Revisa los logs**: `tail -f logs/node-api.log`
5. **Prueba el webhook localmente**: `./test-webhook-local.sh`

