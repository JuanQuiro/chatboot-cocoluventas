# 🔐 Solución: Token de Meta Expirado

## Problema
El token de acceso de Meta ha expirado. El error muestra:
```
Error validating access token: Session has expired on Saturday, 15-Nov-25 14:00:00 PST
```

## Solución

### Opción 1: Renovar el Token (Recomendado)

1. **Ve a Meta Developers Console:**
   - https://developers.facebook.com/apps/
   - Selecciona tu aplicación

2. **Obtén un nuevo token:**
   - Ve a **Tools** → **Graph API Explorer**
   - Selecciona tu aplicación
   - En **User or Page**, selecciona tu WhatsApp Business Account
   - En **Permissions**, asegúrate de tener:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
   - Haz clic en **Generate Access Token**
   - **IMPORTANTE**: Selecciona un token de larga duración (60 días) o permanente

3. **Actualiza el archivo `.env`:**
   ```bash
   META_JWT_TOKEN=TU_NUEVO_TOKEN_AQUI
   ```

4. **Reinicia el sistema:**
   ```bash
   ./restart-production.sh
   ```

### Opción 2: Usar Token Permanente (Mejor para Producción)

1. **Crea un token permanente:**
   - Ve a **Settings** → **Basic** en tu app de Meta
   - Copia el **App ID** y **App Secret**
   - Usa la API de Graph para generar un token permanente:
   ```bash
   curl -X GET "https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=TU_APP_ID&client_secret=TU_APP_SECRET&fb_exchange_token=TU_TOKEN_TEMPORAL"
   ```

2. **Actualiza `.env` con el token permanente**

### Opción 3: Configurar Token de Sistema (Más Avanzado)

Si tienes acceso a la cuenta de negocio de Meta:
1. Ve a **Business Settings** → **System Users**
2. Crea un System User con permisos de WhatsApp
3. Genera un token para ese System User
4. Este token no expira (a menos que lo revoques manualmente)

## Verificar Token

Para verificar si tu token es válido:
```bash
curl -X GET "https://graph.facebook.com/v22.0/me?access_token=TU_TOKEN"
```

Si es válido, recibirás información sobre la cuenta.

## Nota Importante

Los tokens de acceso de Meta tienen diferentes duraciones:
- **Tokens de corta duración**: 1-2 horas
- **Tokens de larga duración**: 60 días
- **Tokens de sistema**: No expiran (hasta que se revoquen)

Para producción, usa tokens de larga duración o tokens de sistema.

