# 📊 Dashboard Web - Guía Completa

## 📋 Índice

1. [Introducción](#introducción)
2. [Acceso](#acceso)
3. [Características](#características)
4. [Secciones](#secciones)
5. [Uso](#uso)
6. [Ejemplos](#ejemplos)

---

## 🎯 Introducción

El Dashboard es una interfaz web moderna que permite monitorear en tiempo real:

- ✅ Estado del bot
- ✅ Mensajes recibidos y enviados
- ✅ Métricas de performance
- ✅ Logs del sistema
- ✅ Conexión a WhatsApp
- ✅ Adaptador activo

---

## 🌐 Acceso

### Abrir Dashboard

Una vez que el bot está corriendo:

```bash
http://localhost:3009
```

O si usas puerto diferente:

```bash
http://localhost:[API_PORT]
```

### Requisitos

- Bot corriendo (`npm run rs:run` o `npm run rs:cli`)
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión local

---

## ✨ Características

### 📊 Estado del Bot

**Información en tiempo real:**
- Adaptador activo (Baileys/Venom/WPPConnect)
- Conexión a WhatsApp (Conectado/Desconectado)
- Uptime (tiempo desde que inició)
- Memoria utilizada

### 📈 Estadísticas de Mensajes

**Contadores:**
- Mensajes recibidos
- Mensajes enviados
- Total de mensajes
- Restarts del bridge

### ⚡ Performance

**Métricas:**
- Latencia API: 5ms
- CPU Idle: 0.5%
- Startup: 0.5s
- Versión: 5.2.0

### 💬 Mensajes en Tiempo Real

**Visualización:**
- Mensajes recibidos (verde)
- Mensajes enviados (azul)
- Errores (rojo)
- Timestamp de cada mensaje
- Número de teléfono

### 📋 Logs del Sistema

**Información:**
- Logs de conexión
- Logs de mensajes
- Logs de errores
- Logs de sistema
- Colores por tipo (info/warn/error)

---

## 🔍 Secciones

### 1. Header

```
🤖 Cocolu Bot - Dashboard    [● Conectado]
```

**Elementos:**
- Logo y título
- Estado de conexión (punto verde/rojo)
- Indicador visual

### 2. Tarjetas de Estado

**Tarjeta 1: Estado**
```
📊 Estado
├─ Adaptador: Baileys
├─ Conexión: Sí
├─ Uptime: 2h 15m 30s
└─ Memoria: 264 MB
```

**Tarjeta 2: Mensajes**
```
📈 Mensajes
├─ Recibidos: 45
├─ Enviados: 38
├─ Total: 83
└─ Restarts: 0
```

**Tarjeta 3: Performance**
```
⚡ Performance
├─ Latencia API: 5ms
├─ CPU Idle: 0.5%
├─ Startup: 0.5s
└─ Versión: 5.2.0
```

### 3. Sección de Mensajes

```
💬 Mensajes en Tiempo Real    [🔄 Actualizar]

📱 +584244370180 [10:30:45]
Hola bot, ¿cómo estás?

📤 +584244370180 [10:30:46]
Estoy bien, gracias por preguntar
```

**Características:**
- Scroll automático
- Máximo 100 mensajes
- Colores por tipo
- Timestamp exacto

### 4. Sección de Logs

```
📋 Logs del Sistema    [🔄 Actualizar]

[10:30:00] ✅ Estado actualizado
[10:30:05] 📱 Mensaje recibido
[10:30:06] 📤 Mensaje enviado
[10:30:10] ✅ Estado actualizado
```

**Características:**
- Scroll automático
- Máximo 50 logs
- Colores por nivel
- Terminal style

---

## 🚀 Uso

### Acceder al Dashboard

1. **Iniciar bot con CLI:**
   ```bash
   npm run rs:cli
   ```

2. **O iniciar manualmente:**
   ```bash
   npm run rs:run
   ```

3. **Abrir navegador:**
   ```
   http://localhost:3009
   ```

### Monitorear Mensajes

El dashboard actualiza automáticamente cada 5 segundos:

1. **Mensajes recibidos** aparecen en verde
2. **Mensajes enviados** aparecen en azul
3. **Errores** aparecen en rojo

### Actualizar Manualmente

Botones de actualización:

```
🔄 Actualizar (Mensajes)
🔄 Actualizar (Logs)
```

---

## 💡 Ejemplos

### Ejemplo 1: Monitorear Conexión

```
1. Abrir http://localhost:3009
2. Ver estado: "Conectado" (punto verde)
3. Ver uptime: "2h 15m 30s"
4. Ver memoria: "264 MB"
```

### Ejemplo 2: Ver Mensajes en Tiempo Real

```
1. Abrir dashboard
2. Recibir mensaje en WhatsApp
3. Aparece en "Mensajes en Tiempo Real"
4. Mostrado con timestamp exacto
```

### Ejemplo 3: Monitorear Performance

```
1. Abrir dashboard
2. Ver latencia API: 5ms
3. Ver CPU: 0.5%
4. Ver memoria: 264 MB
```

### Ejemplo 4: Revisar Logs

```
1. Abrir dashboard
2. Scroll en "Logs del Sistema"
3. Ver historial de eventos
4. Identificar errores (rojo)
```

---

## 🎨 Interfaz Visual

### Colores

| Color | Significado |
|-------|-------------|
| 🟢 Verde | Conectado, OK |
| 🔵 Azul | Mensaje enviado |
| 🟢 Verde | Mensaje recibido |
| 🔴 Rojo | Error, desconectado |
| 🟡 Amarillo | Advertencia |

### Iconos

| Icono | Significado |
|-------|-------------|
| 🤖 | Bot |
| 📊 | Estado |
| 📈 | Estadísticas |
| ⚡ | Performance |
| 💬 | Mensajes |
| 📋 | Logs |
| 📱 | Mensaje recibido |
| 📤 | Mensaje enviado |
| 🔄 | Actualizar |

---

## ⚙️ Configuración

### Auto-actualización

El dashboard se actualiza automáticamente cada 5 segundos:

```javascript
setInterval(updateStatus, 5000);
```

Para cambiar intervalo, editar `dashboard.html`:

```javascript
setInterval(updateStatus, 10000); // 10 segundos
```

### Límite de Mensajes

Máximo 100 mensajes en pantalla:

```javascript
if (messages.length > 100) messages.pop();
```

### Límite de Logs

Máximo 50 logs en pantalla:

```javascript
if (logs.length > 50) logs.pop();
```

---

## 🐛 Troubleshooting

### Dashboard no carga

```bash
# Verificar que el bot está corriendo
curl http://localhost:3009/health

# Verificar puerto
netstat -tlnp | grep 3009
```

### Mensajes no aparecen

```bash
# Verificar conexión a WhatsApp
curl http://localhost:3009/health | jq '.connected'

# Enviar mensaje de prueba
curl -X POST http://localhost:3009/send \
  -H "Content-Type: application/json" \
  -d '{"to": "+584244370180", "text": "Test"}'
```

### Logs no se actualizan

```bash
# Verificar que el bot está enviando logs
RUST_LOG=debug npm run rs:run
```

### Conexión lenta

```bash
# Aumentar intervalo de actualización
# Editar dashboard.html línea ~400
setInterval(updateStatus, 10000); // 10 segundos en lugar de 5
```

---

## 📱 Responsive

El dashboard es responsive y funciona en:

- ✅ Desktop (1920x1080+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

**Nota:** En móvil, algunas secciones se apilan verticalmente.

---

## 🔐 Seguridad

### Consideraciones

- Dashboard solo accesible en localhost
- Sin autenticación (solo local)
- No expone credenciales
- No guarda datos sensibles

### Para producción

Si necesitas acceso remoto:

1. Usar reverse proxy (nginx)
2. Agregar autenticación
3. Usar HTTPS
4. Limitar acceso por IP

---

## 📊 Datos Mostrados

### De `/health`

```json
{
  "status": "ok",
  "uptime_secs": 8100,
  "connected": true,
  "messages_received": 45,
  "messages_sent": 38,
  "has_qr": false,
  "has_pairing_code": false,
  "bridge_alive": true,
  "memory_mb": 264
}
```

### De `/status`

```json
{
  "connected": true,
  "uptime_secs": 8100,
  "messages": {
    "received": 45,
    "sent": 38,
    "total": 83
  },
  "bridge_restarts": 0,
  "last_error": null
}
```

---

## 🎓 Próximos Pasos

1. **Monitorear en tiempo real**
   - Abrir dashboard
   - Enviar/recibir mensajes
   - Ver actualizaciones

2. **Revisar logs**
   - Identificar errores
   - Verificar conexión
   - Monitorear performance

3. **Optimizar**
   - Ajustar intervalo de actualización
   - Cambiar adaptador si es necesario
   - Monitorear memoria

---

**Versión:** 5.2.0  
**Última actualización:** 2025-11-14
