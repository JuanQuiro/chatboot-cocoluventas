# ✅ Configuración Meta Completada

## 📋 Credenciales Configuradas

Tu archivo `.env` ya está configurado con:

- ✅ **META_JWT_TOKEN**: Token de acceso configurado
- ✅ **META_NUMBER_ID**: 886871767837680
- ✅ **META_VERIFY_TOKEN**: cocolu_webhook_verify_2025_secure_token_meta
- ✅ **META_API_VERSION**: v22.0
- ✅ **BOT_ADAPTER**: meta

## 🔗 Endpoint Webhook

El webhook está configurado en:
- **URL**: `http://tu-servidor:3008/webhooks/whatsapp`
- **Métodos**: GET (verificación) y POST (mensajes)

## 🚀 Pasos para Activar

### 1. Iniciar el Sistema

```bash
./start-production.sh
```

### 2. Configurar Webhook en Meta Developers

1. Ve a: https://developers.facebook.com/apps/
2. Selecciona tu App
3. Ve a "WhatsApp" → "Configuration"
4. Haz clic en "Edit" en la sección "Webhook"
5. Configura:
   - **Callback URL**: `https://tu-dominio.com/webhooks/whatsapp` (o usa ngrok para pruebas locales)
   - **Verify Token**: `cocolu_webhook_verify_2025_secure_token_meta`
   - **Campos a suscribir**: 
     - ✅ `messages`
     - ✅ `message_status`

### 3. Para Desarrollo Local (ngrok)

```bash
# Instalar ngrok
sudo apt install ngrok  # o descarga desde https://ngrok.com/

# Iniciar túnel
ngrok http 3008

# Usa la URL HTTPS que te proporciona ngrok como Callback URL
```

### 4. Verificar que Funciona

1. Envía un mensaje de prueba desde WhatsApp al número configurado
2. Revisa los logs:
   ```bash
   tail -f logs/node-api.log
   ```
3. Deberías ver: `📨 Mensaje recibido de Meta: ...`

## 📊 Información de tu Cuenta Meta

- **Número de prueba**: +1 555 141 0797
- **Phone Number ID**: 886871767837680
- **Business Account ID**: 2257544068060513
- **API Version**: v22.0

## ⚠️ Notas Importantes

1. **Token Temporal**: El token actual es temporal (expira en 1-2 horas). Para producción, crea un System User.

2. **Período Gratuito**: Solo los clientes pueden iniciar conversaciones. Para enviar mensajes, necesitas agregar método de pago.

3. **Webhook Público**: El webhook debe ser accesible desde internet. Usa ngrok para desarrollo local o un dominio público para producción.

## 🎯 Próximos Pasos

1. ✅ Credenciales configuradas
2. ✅ Webhook endpoint creado
3. ⏳ Configurar webhook en Meta Developers
4. ⏳ Agregar método de pago (para enviar mensajes)
5. ⏳ Probar enviando un mensaje

---

**¡Configuración lista! 🚀**

