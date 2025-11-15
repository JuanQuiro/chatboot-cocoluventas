# 🔐 Convertir Token de Meta a Larga Duración

## Problema
Los tokens generados desde la interfaz de Meta Developers son **temporales** (cortos, 1-2 horas). Para producción necesitas un token de **larga duración** (60 días) o **permanente**.

## Solución: Convertir Token Temporal a Larga Duración

### Paso 1: Obtener App ID y App Secret

1. Ve a **Meta Developers Console**: https://developers.facebook.com/apps/
2. Selecciona tu aplicación
3. Ve a **Settings** → **Basic**
4. Copia:
   - **App ID**
   - **App Secret** (haz clic en "Show" para verlo)

### Paso 2: Intercambiar Token Temporal por Token de Larga Duración

Usa este comando (reemplaza los valores):

```bash
curl -X GET "https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=TU_APP_ID&client_secret=TU_APP_SECRET&fb_exchange_token=TU_TOKEN_TEMPORAL"
```

**Ejemplo:**
```bash
curl -X GET "https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=123456789&client_secret=abcdef123456&fb_exchange_token=EAAL3ftfa2LoBP67K0axWkossaBZBNhCeN7BMX5uily8A32fKaKdOlJNij26f2gXBAw3EPa9S46g9LbXWyaRXEZAZABZAuRygkCTZCHO74thl9xTG5ZAJgZA6dcyZC1ZCncXach8P9Fm0u9x3DnVu76orbCEZBwZBn4zP3joqZA1b0zZBZCL5lqFrLZA2RXgg6sV8CT7YGHcwxDh8cmamWpQunlZBBFyWyyS781Jffw4n25sRW3iPFgMZD"
```

**Respuesta esperada:**
```json
{
  "access_token": "EAAL...NUEVO_TOKEN_DE_LARGA_DURACION...",
  "token_type": "bearer",
  "expires_in": 5183944
}
```

El `expires_in` está en segundos. 5183944 segundos = ~60 días.

### Paso 3: Actualizar .env

Copia el nuevo `access_token` y actualiza `META_JWT_TOKEN` en tu `.env`:

```bash
META_JWT_TOKEN=EAAL...NUEVO_TOKEN_DE_LARGA_DURACION...
```

### Paso 4: Reiniciar Sistema

```bash
./restart-production.sh
```

## Alternativa: Token Permanente (Sistema)

Para un token que **nunca expire** (hasta que lo revoques):

1. Ve a **Business Settings** → **System Users**
2. Crea un System User con permisos de WhatsApp
3. Genera un token para ese System User
4. Este token no expira automáticamente

## Verificar Token

Para verificar cuánto tiempo le queda a tu token:

```bash
curl -X GET "https://graph.facebook.com/v22.0/debug_token?input_token=TU_TOKEN&access_token=TU_TOKEN"
```

Busca el campo `expires_at` en la respuesta.

## Notas Importantes

- ⚠️ **Nunca compartas** tu App Secret públicamente
- ⚠️ Los tokens de larga duración duran **60 días**
- ⚠️ Los tokens de sistema **no expiran** (hasta revocación manual)
- ✅ Para producción, usa tokens de larga duración o de sistema
- ✅ Renueva el token antes de que expire (configura un recordatorio)

