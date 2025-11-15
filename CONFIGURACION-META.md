# 🔧 Configuración Meta (WhatsApp Business API)

## 📋 Requisitos Previos

Para usar Meta como adaptador, necesitas:

1. **Cuenta de Meta Business**
2. **App de WhatsApp Business** creada en Meta Developers
3. **Credenciales de acceso** (JWT Token, Number ID, Verify Token)

---

## 🚀 Pasos de Configuración

### 1. Crear App en Meta Developers

1. Ve a https://developers.facebook.com/
2. Crea una nueva App o selecciona una existente
3. Agrega el producto "WhatsApp"
4. Configura tu número de teléfono de WhatsApp Business

### 2. Obtener Credenciales

#### **META_JWT_TOKEN (Access Token)**

1. En Meta Developers, ve a tu App
2. Ve a "WhatsApp" → "API Setup"
3. Copia el **Temporary Access Token** (para pruebas)
4. O crea un **System User** para producción (recomendado)

#### **META_NUMBER_ID (Phone Number ID)**

1. En "WhatsApp" → "API Setup"
2. Busca tu número de teléfono
3. Copia el **Phone Number ID** (formato: números)

#### **META_VERIFY_TOKEN (Webhook Verify Token)**

1. Crea un token seguro (puede ser cualquier string)
2. Este token se usa para verificar webhooks
3. Ejemplo: `cocolu_webhook_verify_2025_secure_token`

### 3. Configurar Webhook

1. En "WhatsApp" → "Configuration" → "Webhook"
2. URL del webhook: `https://tu-dominio.com/webhooks/whatsapp`
3. Verify Token: El mismo que configuraste en `META_VERIFY_TOKEN`
4. Campos a suscribir: `messages`, `message_status`

### 4. Configurar Variables de Entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Adaptador principal
BOT_ADAPTER=meta

# Credenciales Meta (OBLIGATORIAS)
META_JWT_TOKEN=tu_token_jwt_aqui
META_NUMBER_ID=tu_number_id_aqui
META_VERIFY_TOKEN=tu_verify_token_seguro_aqui
META_API_VERSION=v18.0
```

---

## 🔐 Seguridad

### **Tokens Temporales vs Permanentes**

- **Temporal**: Válido por 1-2 horas, solo para pruebas
- **Permanente (System User)**: Para producción, no expira

### **Crear System User (Recomendado para Producción)**

1. Ve a "Business Settings" → "Users" → "System Users"
2. Crea un nuevo System User
3. Asigna permisos: `whatsapp_business_messaging`, `whatsapp_business_management`
4. Genera un token para este System User
5. Usa este token como `META_JWT_TOKEN`

---

## ✅ Verificación

### 1. Verificar que las variables estén configuradas:

```bash
# Cargar variables
source .env

# Verificar
echo $META_JWT_TOKEN
echo $META_NUMBER_ID
echo $META_VERIFY_TOKEN
```

### 2. Iniciar el sistema:

```bash
./start-production.sh
```

### 3. Verificar logs:

```bash
tail -f logs/node-api.log | grep -i meta
```

Deberías ver:
```
🔧 Configurando provider Meta (WhatsApp Business API)...
📋 Configuración Meta: { numberId: '...', version: 'v18.0' }
```

---

## 🐛 Troubleshooting

### **Error: "Faltan variables META_JWT_TOKEN..."**

**Solución**: Verifica que todas las variables estén en `.env` y que el archivo esté cargado.

### **Error: "Invalid token"**

**Solución**: 
- Verifica que el token no haya expirado (si es temporal)
- Regenera el token en Meta Developers
- Usa un System User para producción

### **Error: "Webhook verification failed"**

**Solución**:
- Verifica que `META_VERIFY_TOKEN` coincida en `.env` y en Meta Developers
- Asegúrate de que la URL del webhook sea accesible públicamente
- Verifica que el servidor esté escuchando en el puerto correcto

### **El bot no recibe mensajes**

**Solución**:
- Verifica que el webhook esté configurado correctamente
- Verifica que el número de teléfono esté verificado en Meta
- Revisa los logs: `tail -f logs/node-api.log`

---

## 📚 Recursos

- [Meta Developers - WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Guía de Configuración de Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [System Users para Producción](https://developers.facebook.com/docs/marketing-api/system-users)

---

## 🎯 Ventajas de Meta

✅ **API Oficial**: Soporte directo de Meta  
✅ **Sin QR Codes**: Conexión directa por API  
✅ **Escalable**: Maneja millones de mensajes  
✅ **Confiabilidad**: SLA garantizado  
✅ **Números Verificados**: Mayor confianza  
✅ **Plantillas de Mensajes**: Para marketing y notificaciones  

---

**¡Configuración completa! 🚀**

