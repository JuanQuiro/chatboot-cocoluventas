# 👀 CÓMO VER EL BOT EN ACCIÓN

## 🎯 3 FORMAS DE MONITOREAR EL CHATBOT

---

## 🌐 OPCIÓN 1: DASHBOARD WEB (Recomendada) ⭐

### Paso 1: Acceder al Dashboard
```
URL: http://localhost:3009
```

### Paso 2: Navegación

#### 📊 **Dashboard Principal**
- Vista general del sistema
- Bots activos
- Métricas en tiempo real

#### 💬 **Conversaciones** (Aquí ves los mensajes)
```
http://localhost:3009/conversations
```
- Lista de todas las conversaciones
- Mensajes en tiempo real
- Historial completo
- Estado de cada chat

#### 🤖 **Control de Bots**
```
http://localhost:3009/bots
```
- Estado: Conectado/Desconectado
- Número de teléfono vinculado
- Flujos activos
- Botones de control

#### 📈 **Analytics**
```
http://localhost:3009/analytics
```
- Mensajes enviados/recibidos
- Flujos más usados
- Conversiones
- Tiempos de respuesta

---

## 📝 OPCIÓN 2: LOGS EN TERMINAL

### Ejecutar Monitor de Logs:
```bash
cd /home/alberto/Documentos/chatboot-cocoluventas
./ver-logs.sh
```

### Lo que verás:
```
📱 Cliente +549xxxxxxxx envió: hola
✅ Flow activado: Welcome Premium
💬 Bot respondió: ✨ ¡Hola! Bienvenid@ a Cocolu Ventas...
───────────────────────────────────────

📱 Cliente +549xxxxxxxx envió: 1
✅ Flow activado: Hablar con Asesor
💬 Bot respondió: 💝 ¡Excelente elección!...
🔗 Conectando con asesor María López
⏰ Timer programado: 15 minutos
───────────────────────────────────────
```

---

## 🔍 OPCIÓN 3: INSPECCIÓN DIRECTA

### Ver proceso del bot:
```bash
ps aux | grep node
```

### Ver conversaciones guardadas:
```bash
ls -la bot_principal_sessions/
```

### Ver base de datos (si está configurada):
```bash
# MongoDB
mongo cocolu_db

# Ver conversaciones
db.conversations.find().pretty()
```

---

## 🎮 PRUEBA EN VIVO

### Paso a Paso para Probar:

1. **Abre WhatsApp** en tu teléfono
2. **Envía un mensaje** al número del bot
3. **Escribe:** `hola`

### Dónde verlo:

#### En el Dashboard:
- Ve a **Conversaciones** → Verás el chat aparecer
- Click en la conversación → Verás todo el intercambio

#### En los Logs:
```
[2025-11-10 06:50:23] 📱 Mensaje recibido
  De: +549xxxxxxxx
  Mensaje: "hola"

[2025-11-10 06:50:23] 🤖 Procesando...
  Flow: Welcome Premium
  Action: Enviar menú principal

[2025-11-10 06:50:24] ✅ Mensaje enviado
  Contenido: "✨ ¡Hola! Bienvenid@ a Cocolu Ventas 💖..."
  Caracteres: 342
  Delay: 500ms
```

---

## 📊 QUÉ INFORMACIÓN VES

### En cada conversación verás:

1. **Cliente:**
   - Número de teléfono
   - Nombre (si está guardado)
   - Última actividad

2. **Mensajes:**
   - Hora exacta
   - Contenido completo
   - Dirección (entrante/saliente)
   - Estado (enviado/recibido/leído)

3. **Flujos:**
   - Qué flujo se activó
   - Estado actual
   - Variables guardadas

4. **Acciones:**
   - Timers programados
   - Alertas enviadas
   - Vendedor asignado

---

## 🚀 COMANDOS RÁPIDOS

### Ver estado del bot:
```bash
curl http://localhost:3009/api/health
```

### Ver bots activos:
```bash
curl http://localhost:3009/api/bots
```

### Ver conversaciones recientes:
```bash
curl http://localhost:3009/api/conversations | jq
```

---

## 💡 TIPS PROFESIONALES

### 1. **Monitor en 2 Pantallas**
- Pantalla 1: Dashboard Web
- Pantalla 2: Terminal con logs

### 2. **Filtrar Logs**
```bash
# Solo mensajes de clientes
grep "Cliente" bot.log

# Solo respuestas del bot
grep "respondió" bot.log

# Solo errores
grep "ERROR\|Error" bot.log
```

### 3. **Dashboard Siempre Visible**
- Déjalo abierto en una pestaña
- Se actualiza en tiempo real
- No necesitas refrescar

---

## 🎯 EJEMPLO VISUAL

Cuando un cliente escribe, verás esto:

### En el Dashboard:
```
┌─────────────────────────────────────┐
│ 💬 Conversación #001                │
│ +549 11 1234-5678                   │
│ Activo hace 2 segundos              │
├─────────────────────────────────────┤
│ Cliente:     hola                   │
│ 06:50:23                            │
├─────────────────────────────────────┤
│ Bot:         ✨ ¡Hola! Bienvenid@  │
│              a Cocolu Ventas 💖     │
│              [Menú de opciones...]  │
│ 06:50:24                            │
├─────────────────────────────────────┤
│ Flow: Welcome Premium               │
│ Estado: Esperando selección         │
└─────────────────────────────────────┘
```

### En los Logs:
```
[INFO] Nueva conversación iniciada
  ID: conv_001
  Cliente: +549111234567
  Timestamp: 2025-11-10T06:50:23.456Z

[FLOW] Welcome Premium activado
  Trigger: "hola"
  Priority: 100

[MESSAGE] Enviando respuesta
  Tipo: text
  Líneas: 15
  Emojis: 8
  Delay: 500ms

[TIMER] Programado
  Usuario: +549111234567
  Espera: No requiere
  
[SUCCESS] Mensaje entregado ✓
```

---

## ⚡ ACCESO RÁPIDO

| Función | URL |
|---------|-----|
| Dashboard | http://localhost:3009 |
| Conversaciones | http://localhost:3009/conversations |
| Control Bots | http://localhost:3009/bots |
| Analytics | http://localhost:3009/analytics |
| Clientes | http://localhost:3009/customers |
| Configuración | http://localhost:3009/settings |

---

## 🎉 ¡EMPIEZA A MONITOREAR!

1. ✅ Dashboard abierto en http://localhost:3009
2. ✅ Bot conectado y escuchando
3. ✅ Listo para recibir mensajes

**Envía un mensaje de prueba y observa la magia** ✨

---

_Tip: Mantén el dashboard abierto mientras pruebas el bot para ver todo en tiempo real._
