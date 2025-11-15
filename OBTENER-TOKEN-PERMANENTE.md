# 🔐 Obtener Token PERMANENTE de Meta (No Expira)

## ¿Qué es un Token Permanente?

Un token permanente es un token de acceso que **NO expira automáticamente**. Solo se revoca si lo haces manualmente desde Meta Business Settings. Es ideal para producción.

## Método Recomendado: System User (Más Fácil)

### Paso 1: Crear System User

1. **Ve a Meta Business Settings:**
   - https://business.facebook.com/settings/system-users
   - O ve a: https://business.facebook.com → Settings → System Users

2. **Crear nuevo System User:**
   - Haz clic en **"Agregar"** o **"Add"**
   - Ingresa un nombre (ej: "WhatsApp Bot System")
   - Selecciona el rol: **"Administrador del sistema"** o **"Empleado"**
   - Haz clic en **"Crear usuario del sistema"** o **"Create System User"**

### Paso 2: Asignar Permisos

1. **Selecciona el System User** que acabas de crear
2. Haz clic en **"Asignar activos"** o **"Assign Assets"**
3. Selecciona tu **WhatsApp Business Account**
4. Asigna los permisos:
   - ✅ **WhatsApp Business Management API**
   - ✅ **WhatsApp Business Messaging API** (si está disponible)
5. Haz clic en **"Guardar cambios"**

### Paso 3: Generar Token Permanente

1. **En la página del System User**, busca la sección **"Tokens"** o **"Access Tokens"**
2. Haz clic en **"Generar nuevo token"** o **"Generate New Token"**
3. Selecciona tu **WhatsApp Business Account**
4. Selecciona los permisos:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
5. Haz clic en **"Generar token"**
6. **Copia el token** (solo se muestra una vez)

### Paso 4: Actualizar .env

Abre tu archivo `.env` y actualiza:

```bash
META_JWT_TOKEN=TU_TOKEN_PERMANENTE_AQUI
```

### Paso 5: Reiniciar Sistema

```bash
./restart-production.sh
```

## Método Alternativo: Usando Script Automático

Si ya tienes un System User creado, puedes usar el script:

```bash
./obtener-token-permanente.sh
```

El script te pedirá:
- Business Account ID (META_BUSINESS_ACCOUNT_ID)
- App ID
- App Secret
- System User ID

## Verificar Token

Para verificar que tu token es permanente:

```bash
curl -X GET "https://graph.facebook.com/v22.0/debug_token?input_token=TU_TOKEN&access_token=TU_TOKEN"
```

Busca el campo `expires_at`. Si es `0` o no existe, el token es permanente.

## Ventajas del Token Permanente

✅ **No expira** automáticamente  
✅ **Ideal para producción**  
✅ **No necesitas renovarlo** cada 60 días  
✅ **Más estable** para sistemas en producción  

## Desventajas

⚠️ **Requiere acceso a Meta Business Settings**  
⚠️ **Solo se puede revocar manualmente**  
⚠️ **Más permisos** (requiere System User)  

## Notas Importantes

- 🔒 **Nunca compartas** tu token públicamente
- 🔒 **Guarda el token** en un lugar seguro (solo se muestra una vez)
- 🔒 **Revoca el token** si sospechas que fue comprometido
- ✅ **Usa tokens permanentes** solo en producción
- ✅ **Usa tokens temporales** para desarrollo/testing

## Revocar Token

Si necesitas revocar un token permanente:

1. Ve a: https://business.facebook.com/settings/system-users
2. Selecciona el System User
3. Ve a la sección **"Tokens"**
4. Haz clic en **"Revocar"** junto al token que quieres revocar

## Solución de Problemas

### Error: "No tienes permisos para crear System Users"
- Necesitas ser **Administrador** de la cuenta de negocio de Meta
- Contacta al administrador de tu cuenta de negocio

### Error: "No se pueden asignar permisos"
- Asegúrate de que tu app tenga los permisos necesarios
- Verifica que tu WhatsApp Business Account esté correctamente configurado

### Error: "Token no funciona"
- Verifica que el token tenga los permisos correctos
- Asegúrate de que el System User tenga acceso a tu WhatsApp Business Account

