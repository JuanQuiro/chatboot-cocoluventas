# 📱 Guía Completa: Conectar Bot a Tu Teléfono

## 🎯 Objetivo

Conectar el chatbot de Cocolu Ventas a tu número de WhatsApp personal usando `app-integrated.js` y los flujos de `src/`.

---

## ✅ Prerrequisitos

Antes de empezar, asegúrate de tener:

- [x] Node.js >= 18.0.0 instalado
- [x] npm >= 9.0.0 instalado
- [x] WhatsApp instalado en tu teléfono
- [x] Conexión a internet estable
- [x] Teléfono con cámara (para escanear QR)

---

## 🚀 Paso 1: Preparar el Entorno

### 1.1 Instalar Dependencias

```bash
cd /home/guest/Documents/chatboot-cocoluventas
npm install
```

Esto instalará:
- BuilderBot y sus providers
- Baileys (WhatsApp Web)
- 11 dependencias nuevas de la v5.0.1
- Todas las dependencias del proyecto

### 1.2 Verificar Instalación

```bash
node --version  # Debe ser >= 18.0.0
npm --version   # Debe ser >= 9.0.0
```

---

## ⚙️ Paso 2: Configurar Variables de Entorno

### 2.1 Crear archivo .env

```bash
cp .env.example .env
```

### 2.2 Editar .env

Abre `.env` y configura:

```env
# ============================================
# CONFIGURACIÓN DEL BOT
# ============================================

# Puerto del bot (no cambiar si no es necesario)
PORT=3008

# Puerto de la API/Dashboard
API_PORT=3009

# Nombre del bot
BOT_NAME=Bot Cocolu Ventas

# ID del tenant (para multi-tenant)
TENANT_ID=cocolu

# Teléfono del bot (tu número, opcional)
BOT_PHONE=+58XXXXXXXXXX

# ============================================
# CONFIGURACIÓN DEL NEGOCIO
# ============================================

BUSINESS_NAME=Cocolu Ventas
BUSINESS_PHONE=+58XXXXXXXXXX
BUSINESS_EMAIL=contacto@cocoluventas.com
BUSINESS_ADDRESS=Tu dirección comercial

# Horario de atención (formato 24h)
BUSINESS_HOURS_START=09:00
BUSINESS_HOURS_END=18:00

# Días de atención (0=Domingo, 1=Lunes, ..., 6=Sábado)
BUSINESS_DAYS=1,2,3,4,5

# ============================================
# RUTAS Y URLs
# ============================================

# Ruta de la base de datos
DB_PATH=./database

# URL del catálogo (opcional)
CATALOG_URL=https://tudominio.com/catalogo

# URL del sitio web (opcional)
WEBSITE_URL=https://tudominio.com

# ============================================
# CONFIGURACIÓN AVANZADA (Opcional)
# ============================================

# Modo de desarrollo
NODE_ENV=development

# Nivel de logs
LOG_LEVEL=info
```

### 2.3 Guardar y Cerrar

Guarda el archivo `.env` con tus configuraciones.

---

## 🤖 Paso 3: Iniciar el Bot

### 3.1 Modo Desarrollo (Recomendado para primera vez)

```bash
npm run dev
```

Verás algo como:

```
🤖 =======================================
🤖   COCOLU VENTAS - EMBER DRAGO
🤖   Bot Integrado con Dashboard
🤖 =======================================

🔧 Configurando provider Baileys con configuración robusta...
📋 Configuración Baileys: {
  qrTimeout: '60s',
  authTimeout: '60s',
  maxRetries: 3,
  browser: 'Bot Cocolu'
}

✅ API REST iniciada en puerto 3009
🌐 Dashboard: http://localhost:3009
📊 API Health: http://localhost:3009/api/health
🤖 Bots API: http://localhost:3009/api/bots

📝 Cargando flujos de negocio...
✅ 10 flujos PREMIUM cargados

🤖 Creando bot principal...
✅ AlertsService configurado con provider
✅ Bot HTTP server en puerto 3008

🎯 Registrando bot en el dashboard...
✅ Bot registrado en dashboard con ID: bot_principal_cocolu

🔗 Conectando eventos con bot-manager...
```

### 3.2 Esperar el QR Code

Después de unos segundos, verás:

```
🔥 =======================================
📱 QR CODE GENERADO - INSTRUCCIONES:
🔥 =======================================

[AQUÍ APARECERÁ EL QR CODE EN LA TERMINAL]

1️⃣ En tu teléfono: WhatsApp → Ajustes → Dispositivos vinculados
2️⃣ CERRAR TODAS las sesiones activas
3️⃣ Tocar "Vincular un dispositivo"
4️⃣ Escanear el QR de arriba ⬆️
5️⃣ NO cerrar esta ventana hasta ver "BOT CONECTADO"

⚠️  IMPORTANTE: NO abrir WhatsApp Web en navegador
⏰ Tienes 60 segundos para escanear
```

---

## 📱 Paso 4: Vincular Tu Teléfono

### 4.1 En Tu Teléfono

1. **Abre WhatsApp** en tu teléfono
2. Ve a **Ajustes** (⚙️)
3. Toca **Dispositivos vinculados**
4. **IMPORTANTE**: Cierra TODAS las sesiones activas primero
5. Toca **"Vincular un dispositivo"**
6. Escanea el **QR code** que aparece en tu terminal

### 4.2 Consejos Importantes

✅ **Usa datos móviles** (no WiFi) para mejor conexión
✅ **Cierra WhatsApp Web** en navegadores
✅ **Escanea rápido** (tienes 60 segundos)
✅ **Mantén la terminal abierta** hasta ver "BOT CONECTADO"

### 4.3 Si el QR Expira

Si no alcanzas a escanear en 60 segundos:

```
⏳ QR no escaneado en 90s. Si sigue fallando:
   • Cierra TODAS las sesiones en el teléfono
   • Cambia a datos móviles (evitar WiFi/VPN)
   • Reabre WhatsApp y vuelve a intentar
```

El bot generará un **nuevo QR automáticamente**. Solo espera y escanea el nuevo.

---

## ✅ Paso 5: Verificar Conexión

### 5.1 Mensaje de Éxito

Cuando se conecte correctamente, verás:

```
✅ ¡BOT CONECTADO Y LISTO!

🤖 =======================================
🤖   SISTEMA COMPLETAMENTE INICIALIZADO
🤖 =======================================
🤖 Bot Principal: Bot Cocolu Ventas
🤖 Tenant: cocolu
🤖 Puerto Bot: 3008
🌐 Puerto API: 3009
🤖 Flujos activos: 10
🤖 =======================================
📱 Bot conectado a WhatsApp
🌐 Dashboard: http://localhost:3009
🎛️ Control de Bots: http://localhost:3009/bots
🤖 =======================================
✨ El bot ahora es controlable desde el dashboard
🤖 =======================================
```

### 5.2 Probar el Bot

Envía un mensaje a tu propio número (el bot):

```
hola
```

Deberías recibir:

```
🤖 ¡Hola! Bienvenido a Cocolu Ventas

Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?

Elige una opción:

1️⃣ Hablar con un asesor
2️⃣ Ver catálogo de productos
3️⃣ Información de mi pedido
4️⃣ Horarios de atención
5️⃣ Reportar un problema

Escribe el número de la opción o la palabra clave.
```

---

## 🎯 Paso 6: Flujos Disponibles

El bot tiene **10 flujos premium** activos:

### Flujos Principales

1. **Welcome Premium** (`hola`, `inicio`, `menu`)
   - Menú principal con 5 opciones
   - Detección de horario laboral
   - Asignación automática de vendedor

2. **Hablar con Asesor** (`1`, `asesor`, `hablar`)
   - Conexión con vendedor disponible
   - Sistema de turnos
   - Notificaciones a vendedores

3. **Catálogo Premium** (`2`, `catalogo`, `productos`)
   - Navegación por categorías
   - Búsqueda de productos
   - Seguimiento automático

4. **Info Pedido** (`3`, `pedido`, `información`)
   - Estado de pedidos
   - Tracking de órdenes
   - Historial

5. **Horarios** (`4`, `horario`, `horarios`)
   - Horarios de atención
   - Días laborales
   - Información de contacto

6. **Problema** (`5`, `problema`, `queja`)
   - Atención prioritaria
   - Sistema de tickets
   - Escalamiento automático

### Flujos Especiales

7. **Comandos** (`comandos`, `ayuda`, `help`)
   - Lista de comandos disponibles
   - Guía de uso

8. **Registro** (`registro`, `estado`, `historial`)
   - Historial del cliente
   - Estado de cuenta

9. **Debug Técnico** (`debug`, `tecnico`, `dev`)
   - Información técnica (solo desarrollo)

10. **Keywords Productos** (`RELICARIO`, `DIJE`, `CADENA`, etc.)
    - Búsqueda directa por producto

---

## 🎛️ Paso 7: Acceder al Dashboard

### 7.1 Abrir Dashboard

En tu navegador, ve a:

```
http://localhost:3009
```

### 7.2 Funcionalidades del Dashboard

- **Control de Bots**: Ver estado, QR, estadísticas
- **Gestión de Vendedores**: Asignar, ver carga de trabajo
- **Analytics**: Métricas en tiempo real
- **Logs**: Ver logs del sistema
- **Flujos**: Gestionar flujos activos

---

## 🔧 Comandos de Control

### Comandos del Bot

El bot responde a estos comandos especiales:

```
BOT PAUSA YA          # Pausar el bot en este chat
BOT ACTIVA YA         # Reactivar el bot
PAUSAR BOT COCOLU AHORA   # Alternativa para pausar
ACTIVAR BOT COCOLU AHORA  # Alternativa para activar
```

⚠️ **Importante**: Los comandos DEBEN escribirse en MAYÚSCULAS exactas.

### Comandos de Terminal

```bash
# Ver logs en tiempo real
npm run dev

# Iniciar en producción
npm run prod

# Iniciar con PM2
npm run prod:pm2

# Ver logs de PM2
pm2 logs cocolu-dashoffice

# Reiniciar bot
pm2 restart cocolu-dashoffice

# Detener bot
pm2 stop cocolu-dashoffice
```

---

## 🐛 Solución de Problemas

### Problema 1: QR No Aparece

**Síntomas**: No se genera el QR code

**Soluciones**:
```bash
# 1. Limpiar sesión anterior
rm -rf bot_principal_sessions/

# 2. Reiniciar bot
npm run dev
```

### Problema 2: Error de Autenticación

**Síntomas**: "AUTH FAILURE" o error de sesión

**Soluciones**:
```bash
# 1. Eliminar carpetas de sesión
rm -rf bot_principal_sessions/
rm -rf auth/
rm -rf tokens/

# 2. Cerrar TODAS las sesiones en WhatsApp
# 3. Reiniciar bot
npm run dev
```

### Problema 3: Timeout de Conexión

**Síntomas**: "Timeout" o "Connection failed"

**Soluciones**:
1. Verifica tu conexión a internet
2. Usa datos móviles en el teléfono (no WiFi)
3. Desactiva VPN si tienes
4. Reinicia el bot

### Problema 4: Bot No Responde

**Síntomas**: Bot conectado pero no responde a mensajes

**Soluciones**:
```bash
# 1. Verificar que el bot esté activo
# Envía: hola

# 2. Ver logs
npm run dev

# 3. Verificar flujos
cat docs/implementacion/FLUJOS_PREMIUM_COCOLU.md
```

### Problema 5: Puerto en Uso

**Síntomas**: "Port 3008 already in use"

**Soluciones**:
```bash
# Opción 1: Matar proceso en puerto 3008
lsof -ti:3008 | xargs kill -9

# Opción 2: Cambiar puerto en .env
# Editar .env y cambiar PORT=3009
```

---

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
# Modo desarrollo (con logs)
npm run dev

# Ver logs de PM2
pm2 logs cocolu-dashoffice

# Ver logs específicos
tail -f logs/app.log
```

### Verificar Estado

```bash
# Estado del bot
curl http://localhost:3009/api/health

# Estado de bots
curl http://localhost:3009/api/bots

# Métricas
curl http://localhost:3009/api/analytics/summary
```

---

## 🚀 Producción

### Iniciar en Producción

```bash
# Con PM2 (recomendado)
npm run prod:pm2

# Ver estado
pm2 status

# Ver logs
pm2 logs cocolu-dashoffice

# Monitorear
pm2 monit
```

### Configurar Inicio Automático

```bash
# Guardar configuración de PM2
pm2 save

# Configurar inicio automático
pm2 startup

# Ejecutar el comando que PM2 te muestre
```

---

## 📋 Checklist de Verificación

Antes de considerar que todo funciona:

- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado
- [ ] Bot iniciado (`npm run dev`)
- [ ] QR code escaneado
- [ ] Mensaje "BOT CONECTADO" visible
- [ ] Bot responde a "hola"
- [ ] Dashboard accesible (http://localhost:3009)
- [ ] Flujos funcionando correctamente
- [ ] Sin errores en logs

---

## 🎯 Próximos Pasos

Una vez conectado:

1. **Personalizar Flujos**
   - Editar mensajes en `src/flows/`
   - Agregar nuevos flujos
   - Personalizar respuestas

2. **Configurar Vendedores**
   - Agregar vendedores en el dashboard
   - Configurar horarios
   - Asignar clientes

3. **Agregar Productos**
   - Actualizar catálogo
   - Agregar imágenes
   - Configurar precios

4. **Monitorear**
   - Ver analytics
   - Revisar conversaciones
   - Optimizar respuestas

---

## 📚 Documentación Adicional

- `README.md` - Documentación principal
- `docs/guias/` - Más guías de uso
- `docs/implementacion/FLUJOS_PREMIUM_COCOLU.md` - Detalles de flujos
- `ORGANIZACION_COMPLETADA.md` - Estructura del proyecto

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa la sección "Solución de Problemas"
2. Verifica los logs: `npm run dev`
3. Consulta la documentación en `docs/`
4. Ejecuta el verificador: `bash scripts/utils/verificar-actualizacion.sh`

---

**¡Listo! Tu bot está conectado y funcionando. 🎉**

Siguiente paso: Personalizar los flujos según tus necesidades.
