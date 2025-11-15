# 🔐 Obtener Token PERMANENTE - Guía Paso a Paso

## ⚠️ IMPORTANTE: No uses la sección "Configuración de la API"

La sección que estás viendo en Meta Developers (`Configuración de la API`) solo genera **tokens temporales**. Para un token permanente, necesitas ir a **Meta Business Settings**.

## 📍 Ubicación Correcta: Meta Business Settings

### Paso 1: Ir a Meta Business Settings

1. **Abre esta URL directamente:**
   ```
   https://business.facebook.com/settings/system-users
   ```

   O si prefieres navegar:
   - Ve a: https://business.facebook.com
   - Haz clic en el menú (☰) en la esquina superior izquierda
   - Ve a **"Configuración"** o **"Settings"**
   - En el menú lateral izquierdo, busca **"Usuarios del sistema"** o **"System Users"**

### Paso 2: Crear System User

1. **Haz clic en el botón "Agregar"** o **"Add"** (botón azul, generalmente en la parte superior derecha)

2. **Completa el formulario:**
   - **Nombre:** Ingresa un nombre descriptivo (ej: "WhatsApp Bot System" o "Sistema Cocolu")
   - **Rol:** Selecciona **"Administrador del sistema"** o **"System Admin"**
   - Haz clic en **"Crear usuario del sistema"** o **"Create System User"**

### Paso 3: Asignar Permisos a WhatsApp

1. **Selecciona el System User** que acabas de crear (haz clic en su nombre)

2. **Busca la sección "Activos asignados"** o **"Assigned Assets"**

3. **Haz clic en "Asignar activos"** o **"Assign Assets"**

4. **Selecciona tu WhatsApp Business Account:**
   - Busca tu cuenta de WhatsApp Business
   - Selecciónala

5. **Asigna los permisos:**
   - ✅ **WhatsApp Business Management API**
   - ✅ **WhatsApp Business Messaging API** (si está disponible)
   - Haz clic en **"Guardar cambios"** o **"Save Changes"**

### Paso 4: Generar Token Permanente

1. **En la página del System User**, desplázate hacia abajo hasta encontrar la sección **"Tokens"** o **"Access Tokens"**

2. **Haz clic en "Generar nuevo token"** o **"Generate New Token"**

3. **Selecciona:**
   - Tu **WhatsApp Business Account**
   - Los permisos:
     - ✅ `whatsapp_business_messaging`
     - ✅ `whatsapp_business_management`

4. **Haz clic en "Generar token"** o **"Generate Token"**

5. **⚠️ IMPORTANTE: Copia el token inmediatamente**
   - El token solo se muestra **UNA VEZ**
   - Si lo pierdes, tendrás que generar uno nuevo
   - Copia todo el token completo

### Paso 5: Actualizar .env

Abre tu archivo `.env` y actualiza:

```bash
META_JWT_TOKEN=TU_TOKEN_PERMANENTE_AQUI
```

### Paso 6: Reiniciar Sistema

```bash
./restart-production.sh
```

## 🔍 Diferencias Clave

| Ubicación | Tipo de Token | Duración |
|-----------|---------------|----------|
| **Meta Developers** → Configuración de la API | Temporal | 1-2 horas |
| **Meta Business Settings** → System Users | Permanente | No expira |

## ❓ ¿No encuentras System Users?

Si no ves la opción "System Users" en Meta Business Settings:

1. **Verifica que tengas permisos de administrador** en la cuenta de negocio
2. **Asegúrate de estar en la cuenta de negocio correcta** (no en tu cuenta personal)
3. **Intenta esta URL directa:**
   ```
   https://business.facebook.com/settings/system-users?business_id=TU_BUSINESS_ID
   ```
   (Reemplaza `TU_BUSINESS_ID` con tu Business Account ID)

## ✅ Verificar que el Token es Permanente

Para verificar que tu token es permanente:

```bash
curl -X GET "https://graph.facebook.com/v22.0/debug_token?input_token=TU_TOKEN&access_token=TU_TOKEN"
```

Busca el campo `expires_at`. Si es `0` o no existe, el token es permanente.

## 🆘 Problemas Comunes

### "No tengo acceso a System Users"
- Necesitas ser **Administrador** de la cuenta de negocio de Meta
- Contacta al administrador de tu cuenta de negocio para que te dé acceso

### "No puedo asignar permisos de WhatsApp"
- Asegúrate de que tu app de Meta Developers esté correctamente configurada
- Verifica que tu WhatsApp Business Account esté vinculada a tu app

### "El token no funciona"
- Verifica que el token tenga los permisos correctos
- Asegúrate de que el System User tenga acceso a tu WhatsApp Business Account
- Verifica que el token no haya sido revocado

