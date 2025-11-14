# 🔌 Sistema de Adaptadores Multi-WhatsApp

## 📋 Índice

1. [Adaptadores Disponibles](#adaptadores-disponibles)
2. [Seleccionar Adaptador](#seleccionar-adaptador)
3. [Fallback Automático](#fallback-automático)
4. [Agregar Nuevo Adaptador](#agregar-nuevo-adaptador)
5. [Cambiar en Tiempo Real](#cambiar-en-tiempo-real)

---

## 🔌 Adaptadores Disponibles

### 1. **Baileys** (RECOMENDADO)

**Archivo:** `bridge/baileys-bridge.mjs`

**Características:**
- ✅ Gratis
- ✅ Más compatible
- ✅ Mejor mantenimiento
- ✅ Comunidad grande
- ✅ QR + Pairing Code

**Instalar:**
```bash
npm install @whiskeysockets/baileys
```

**Usar:**
```bash
WA_BRIDGE=bridge/baileys-bridge.mjs npm run rs:run
```

---

### 2. **Venom** (ALTERNATIVA)

**Archivo:** `bridge/venom-bridge.mjs`

**Características:**
- ✅ Alternativa si Baileys falla
- ⚠️ Menos mantenido
- ⚠️ Más lento
- ⚠️ Requiere Chrome/Chromium

**Instalar:**
```bash
npm install venom-bot
```

**Usar:**
```bash
WA_BRIDGE=bridge/venom-bridge.mjs npm run rs:run
```

---

### 3. **WPPConnect** (ALTERNATIVA)

**Archivo:** `bridge/wppconnect-bridge.mjs` (crear)

**Características:**
- ✅ Alternativa si Baileys falla
- ⚠️ Menos mantenido
- ⚠️ Más lento
- ⚠️ Requiere Puppeteer

**Instalar:**
```bash
npm install @wppconnect-team/wppconnect
```

---

## 🎯 Seleccionar Adaptador

### **Opción 1: Variable de Entorno**

```bash
# Baileys (default)
npm run rs:run

# Venom
WA_BRIDGE=bridge/venom-bridge.mjs npm run rs:run

# WPPConnect
WA_BRIDGE=bridge/wppconnect-bridge.mjs npm run rs:run
```

### **Opción 2: Endpoint API**

```bash
# Cambiar adaptador en tiempo real
curl -X POST http://localhost:3009/config \
  -H "Content-Type: application/json" \
  -d '{"adapter": "venom"}'
```

### **Opción 3: Archivo de Configuración**

Crear `src-rs-performance/.adapter.json`:

```json
{
  "primary": "baileys",
  "fallback": ["venom", "wppconnect"],
  "timeout": 5000
}
```

---

## 🔄 Fallback Automático

El sistema intenta conectar en este orden:

```
1. Adaptador configurado (env var o config)
   ↓
   Si falla después de 5s...
   ↓
2. Primer fallback (venom)
   ↓
   Si falla después de 5s...
   ↓
3. Segundo fallback (wppconnect)
   ↓
   Si todos fallan...
   ↓
4. Error y reintentar en 10s
```

**Logs:**
```
✅ Trying baileys...
❌ Baileys failed: connection_timeout
⚠️  Fallback to venom...
✅ Venom connected
```

---

## ➕ Agregar Nuevo Adaptador

### **Paso 1: Crear archivo bridge**

```bash
cp src-rs-performance/bridge/baileys-bridge.mjs \
   src-rs-performance/bridge/mi-adaptador-bridge.mjs
```

### **Paso 2: Implementar protocolo JSON**

El bridge debe:

**Entrada (stdin):**
```json
{ "cmd": "connect", "usePairingCode": true, "phoneNumber": "+584244370180" }
{ "cmd": "send", "to": "+584244370180", "text": "Hola" }
```

**Salida (stdout):**
```json
{ "type": "ready" }
{ "type": "qr", "qr": "..." }
{ "type": "pairing_code", "code": "123-456" }
{ "type": "message", "from": "+584244370180", "body": "Hola" }
{ "type": "sent", "to": "+584244370180", "ok": true }
{ "type": "error", "error": "..." }
```

**Logs (stderr):**
```
[mi-adaptador-bridge] Conectando...
[mi-adaptador-bridge] Conectado
```

### **Paso 3: Usar**

```bash
WA_BRIDGE=bridge/mi-adaptador-bridge.mjs npm run rs:run
```

---

## 🔄 Cambiar en Tiempo Real

### **Endpoint: POST /config**

```bash
curl -X POST http://localhost:3009/config \
  -H "Content-Type: application/json" \
  -d '{
    "adapter": "venom",
    "phone_number": "+584244370180"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "adapter": "venom",
  "message": "Switching to venom bridge..."
}
```

**Logs:**
```
⚠️  Switching from baileys to venom...
🔗 Spawning bridge: "bridge/venom-bridge.mjs"
✅ Venom connected
```

---

## 📊 Comparativa de Adaptadores

| Característica | Baileys | Venom | WPPConnect |
|---|---|---|---|
| Compatibilidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Velocidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Mantenimiento | ✅ Activo | ⚠️ Lento | ⚠️ Lento |
| Costo | Gratis | Gratis | Gratis |
| QR | ✅ | ✅ | ✅ |
| Pairing Code | ✅ | ❌ | ❌ |
| Sesiones | ✅ | ✅ | ✅ |
| Grupos | ✅ | ✅ | ✅ |
| Medios | ✅ | ✅ | ✅ |

---

## 🔒 Seguridad

Cada adaptador:
- Guarda sesiones en carpeta aislada
- No imprime credenciales
- Valida comandos
- Maneja errores robustamente

**Carpetas de sesiones:**
```
src-rs-performance/bridge/
├── sessions-bridge/        (Baileys)
├── sessions-venom/         (Venom)
└── sessions-wppconnect/    (WPPConnect)
```

---

## 🚀 Ejemplos

### **Usar Baileys (default)**

```bash
npm run rs:run
```

### **Usar Venom**

```bash
WA_BRIDGE=bridge/venom-bridge.mjs npm run rs:run
```

### **Cambiar en tiempo real**

```bash
# Terminal 1: Iniciar con Baileys
npm run rs:run

# Terminal 2: Cambiar a Venom
curl -X POST http://localhost:3009/config \
  -H "Content-Type: application/json" \
  -d '{"adapter": "venom"}'
```

### **Con fallback automático**

```bash
# Intentará: baileys → venom → wppconnect
npm run rs:run
```

---

## 🐛 Troubleshooting

### "Adaptador no encontrado"

```bash
ls src-rs-performance/bridge/
# Verificar que el archivo existe
```

### "Venom requiere Chrome"

```bash
# Instalar Chromium
sudo apt install chromium-browser
# O usar Baileys que no lo requiere
```

### "WPPConnect muy lento"

```bash
# Usar Baileys en su lugar
WA_BRIDGE=bridge/baileys-bridge.mjs npm run rs:run
```

---

**Versión:** 5.2.0  
**Última actualización:** 2025-11-14
