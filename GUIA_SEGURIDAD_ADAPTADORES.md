# 🔒 Guía de Seguridad y Adaptadores Intercambiables

## 🎯 Objetivo

Proporcionar un sistema **seguro, funcional y flexible** con múltiples adaptadores de WhatsApp intercambiables.

---

## 🚀 Adaptadores Disponibles

### 1. **Baileys** (Recomendado - Gratis)

**Características:**
- ✅ Gratis
- ✅ Conexión por QR o código de vinculación
- ✅ WhatsApp Web Multi-Device
- ✅ Sin credenciales externas
- ✅ Mejor para desarrollo

**Uso:**
```bash
npm start
# Seleccionar: Baileys

# O directo:
npm run start:baileys
```

**Seguridad:**
- Almacena sesión en `./sessions/`
- No requiere API keys
- Credenciales locales

---

### 2. **Venom** (Gratis)

**Características:**
- ✅ Gratis
- ✅ Basado en Puppeteer
- ✅ Requiere navegador
- ✅ Conexión por QR

**Uso:**
```bash
npm run start:venom
```

**Seguridad:**
- Requiere Chromium/Chrome
- Almacena sesión localmente
- Mayor consumo de recursos

---

### 3. **WPPConnect** (Gratis)

**Características:**
- ✅ Gratis
- ✅ Conexión por QR
- ✅ Basado en WhatsApp Web
- ✅ Comunidad activa

**Uso:**
```bash
npm run start:wppconnect
```

**Seguridad:**
- Almacena sesión localmente
- No requiere credenciales externas

---

### 4. **Meta** (Pago - Oficial)

**Características:**
- ✅ Oficial de Meta
- ✅ API WhatsApp Business
- ✅ Producción recomendada
- ❌ Requiere credenciales
- ❌ Requiere pago

**Credenciales Requeridas:**
```env
META_JWT_TOKEN=tu_jwt_token
META_NUMBER_ID=tu_numero_id
META_VERIFY_TOKEN=tu_verify_token
```

**Uso:**
```bash
# El CLI pedirá las credenciales
npm start
# Seleccionar: Meta

# O directo:
npm run start:meta
```

**Seguridad:**
- ✅ Oficial de Meta
- ✅ Encriptación de extremo a extremo
- ✅ Cumplimiento normativo
- ⚠️ Requiere verificación de dominio

---

### 5. **Twilio** (Pago)

**Características:**
- ✅ API confiable
- ✅ Soporte profesional
- ❌ Requiere credenciales
- ❌ Requiere pago

**Credenciales Requeridas:**
```env
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_VENDOR_NUMBER=tu_numero
TWILIO_PUBLIC_URL=tu_url_publica
```

**Uso:**
```bash
npm run start:twilio
```

**Seguridad:**
- ✅ Encriptación SSL/TLS
- ✅ Autenticación de dos factores
- ✅ Auditoría completa

---

## 🔒 Seguridad General

### 1. **Protección de Credenciales**

**Nunca hagas esto:**
```bash
# ❌ NO HAGAS ESTO
git add .env
export META_JWT_TOKEN=token_secreto
```

**Haz esto:**
```bash
# ✅ CORRECTO
echo ".env" >> .gitignore
# Usar variables de entorno seguras
chmod 600 .env
```

### 2. **Archivo .env**

```env
# Seguridad
BOT_ADAPTER=baileys
USE_PAIRING_CODE=true
PHONE_NUMBER=+584244370180

# Meta (si usas)
META_JWT_TOKEN=xxxx
META_NUMBER_ID=xxxx
META_VERIFY_TOKEN=xxxx

# Twilio (si usas)
TWILIO_ACCOUNT_SID=xxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_VENDOR_NUMBER=xxxx
TWILIO_PUBLIC_URL=xxxx
```

### 3. **Permisos de Archivos**

```bash
# Proteger .env
chmod 600 .env

# Proteger sesiones
chmod 700 ./sessions/

# Proteger credenciales
chmod 700 ./auth/
```

### 4. **Rotación de Credenciales**

Para Meta y Twilio:
```bash
# Cada 90 días
1. Generar nuevas credenciales en el panel
2. Actualizar .env
3. Reiniciar bot
4. Revocar credenciales antiguas
```

---

## 🎯 Selección de Adaptador

### Para Desarrollo
```bash
npm start
# Seleccionar: Baileys
```

### Para Producción (Gratis)
```bash
npm run start:baileys
# O
npm run start:wppconnect
```

### Para Producción (Oficial)
```bash
npm run start:meta
# Requiere: META_JWT_TOKEN, META_NUMBER_ID, META_VERIFY_TOKEN
```

### Para Producción (Profesional)
```bash
npm run start:twilio
# Requiere: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VENDOR_NUMBER
```

---

## 🔐 Validación de Seguridad

### Checklist de Seguridad

- [ ] `.env` no está en git
- [ ] `.env` tiene permisos 600
- [ ] Credenciales no están en código
- [ ] Sesiones están protegidas
- [ ] Logs no contienen secretos
- [ ] HTTPS en producción
- [ ] Firewall configurado
- [ ] Backups de credenciales

---

## 🚨 Manejo de Errores

### Error: "Credenciales inválidas"
```bash
# Verificar .env
cat .env | grep META_

# Regenerar credenciales en panel de Meta
# Actualizar .env
# Reiniciar bot
npm start
```

### Error: "Adaptador no soportado"
```bash
# Verificar adaptador
echo $BOT_ADAPTER

# Usar adaptador válido
npm run start:baileys
```

### Error: "Sesión expirada"
```bash
# Limpiar sesiones
rm -rf ./sessions/

# Reiniciar
npm start
```

---

## 📊 Monitoreo

### Ver adaptador actual
```bash
grep BOT_ADAPTER .env
```

### Ver logs de conexión
```bash
npm start 2>&1 | grep -i adapter
```

### Verificar credenciales
```bash
# Meta
grep META_ .env

# Twilio
grep TWILIO_ .env
```

---

## 🔄 Cambiar Adaptador

### Cambiar de Baileys a Meta

```bash
# 1. Obtener credenciales de Meta
# 2. Actualizar .env
echo "META_JWT_TOKEN=xxxx" >> .env
echo "META_NUMBER_ID=xxxx" >> .env
echo "META_VERIFY_TOKEN=xxxx" >> .env

# 3. Cambiar adaptador
npm start
# Seleccionar: Meta

# 4. Verificar
grep BOT_ADAPTER .env
```

---

## 🎓 Mejores Prácticas

### 1. **Usar Variables de Entorno**
```bash
# ✅ CORRECTO
export BOT_ADAPTER=baileys
npm start

# ❌ INCORRECTO
BOT_ADAPTER=baileys npm start
```

### 2. **Rotación de Credenciales**
```bash
# Cada 90 días
1. Generar nuevas credenciales
2. Actualizar .env
3. Reiniciar bot
4. Revocar antiguas
```

### 3. **Auditoría de Logs**
```bash
# Ver logs importantes
npm start 2>&1 | grep -i "error\|warning\|adapter"
```

### 4. **Backup de Sesiones**
```bash
# Backup regular
tar -czf sessions-backup.tar.gz ./sessions/

# Restaurar si es necesario
tar -xzf sessions-backup.tar.gz
```

---

## 🆘 Soporte

Para problemas de seguridad:
1. Revisa `GUIA_SEGURIDAD_ADAPTADORES.md`
2. Verifica permisos de archivos
3. Valida credenciales
4. Consulta logs

---

**Versión:** 5.1.0  
**Fecha:** 2025-11-14  
**Estado:** ✅ Seguro y Funcional
