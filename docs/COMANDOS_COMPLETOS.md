# 🎮 COMANDOS COMPLETOS - CHATBOT COCOLU VENTAS

**Actualizado:** 10 Noviembre 2025  
**Estado:** ✅ **TODOS LOS COMANDOS ACTIVOS**

---

## 📱 CÓMO USAR LOS COMANDOS

### En WhatsApp:
Escribe **`comandos`** o **`ayuda`** en cualquier momento para ver la lista completa.

### En API:
Consulta: `GET http://localhost:3009/api/comandos`

---

## 🎛️ COMANDOS DE CONTROL (Desarrollador)

### ⏸️ PAUSAR BOT

**Comando principal:**
```
BOT PAUSA YA
```

**Comando alternativo:**
```
PAUSAR BOT COCOLU AHORA
```

**¿Qué hace?**
- Pausa el bot en ESE chat específico
- El bot NO responderá hasta que se reactive
- NO afecta a otros chats
- Útil para mantenimiento o pruebas

**Importante:** ⚠️
- DEBE escribirse en MAYÚSCULAS
- DEBE ser exacto (sin espacios extra)
- Es case-sensitive

---

### ▶️ ACTIVAR BOT

**Comando principal:**
```
BOT ACTIVA YA
```

**Comando alternativo:**
```
ACTIVAR BOT COCOLU AHORA
```

**¿Qué hace?**
- Reactiva el bot en ese chat
- Vuelve a responder normalmente
- Muestra mensaje de confirmación

**Cooldown:** 1 hora desde la última pausa

---

## 🏠 COMANDOS DE NAVEGACIÓN

### Ver Menú Principal

Escribe cualquiera de estos:
```
hola
hi
hello
inicio
empezar
comenzar
menu
menú
start
```

**Respuesta del bot:**
```
✨ ¡Hola! Bienvenid@ a Cocolu Ventas 💖

¿En qué puedo ayudarte?

1. Hablar con Asesor 👥
2. Ver Catálogo 📖
3. Info de mi Pedido 📦
4. Horarios ⏰
5. Tengo un Problema ⚠️

👉 Escribe el número
```

---

### Ver Lista de Comandos

Escribe:
```
comandos
ayuda
help
comando
```

**Muestra:** Lista completa de comandos disponibles

---

## 🔢 OPCIONES DEL MENÚ (Atajos Rápidos)

### 1️⃣ Hablar con Asesor

**Formas de activar:**
- Escribe: `1`
- O escribe: `asesor`, `hablar`, `atención`

**Qué hace:**
1. Asigna un asesor personal
2. Envía link de WhatsApp del asesor
3. Seguimiento a 15 minutos: "¿Ya fuiste atendid@?"
4. Si NO → Envía alerta urgente

---

### 2️⃣ Ver Catálogo

**Formas de activar:**
- Escribe: `2`
- O escribe: `catalogo`, `catálogo`, `productos`

**Qué hace:**
1. Envía link del catálogo completo
2. Seguimiento a 20 minutos: "¿Encontraste algo que te enamorara?"
3. Si SI → Conecta con asesor + segundo seguimiento
4. Si NO → Conecta con asesor experto

---

### 3️⃣ Info de mi Pedido

**Formas de activar:**
- Escribe: `3`
- O escribe: `pedido`, `información pedido`, `info pedido`

**Qué hace:**
1. Conecta con asesor experto en pedidos
2. Seguimiento a 20 minutos: "¿Fuiste atendida?"
3. Si NO → Alerta urgente

---

### 4️⃣ Horarios

**Formas de activar:**
- Escribe: `4`
- O escribe: `horario`, `horarios`, `hora`

**Qué hace:**
1. Muestra horarios de atención
2. Pregunta: "¿List@ para hacer un pedido?"
3. Si SI → Redirige a flujo de Asesor

---

### 5️⃣ Tengo un Problema

**Formas de activar:**
- Escribe: `5`
- O escribe: `problema`, `queja`, `reclamo`

**Qué hace:**
1. Alerta INMEDIATA con prioridad HIGH
2. Asigna asesor prioritario
3. Seguimiento a 15 minutos
4. Si NO resuelto → ESCALA a CRITICAL

---

## 💎 BÚSQUEDA DE PRODUCTOS (Keywords)

Escribe el nombre del producto directamente:

### RELICARIO
```
RELICARIO
relicario
```
**Respuesta:** Info completa sobre relicarios

---

### DIJE
```
DIJE
dije
```
**Respuesta:** Info completa sobre dijes

---

### CADENA
```
CADENA
cadena
```
**Respuesta:** Info completa sobre cadenas

---

### PULSERA
```
PULSERA
pulsera
```
**Respuesta:** Info completa sobre pulseras

---

### ANILLO
```
ANILLO
anillo
```
**Respuesta:** Info completa sobre anillos

---

**Flujo de Keywords:**
1. Bot envía info del producto
2. Pregunta: "¿Tienes preguntas?"
3. Si SI → Conecta con experta
4. Seguimiento a 20 minutos
5. Cierra proceso

---

## 📊 RESUMEN RÁPIDO

| Comando | Qué hace | Prioridad |
|---------|----------|-----------|
| `BOT PAUSA YA` | Pausa bot | ⚠️ Control |
| `BOT ACTIVA YA` | Activa bot | ⚠️ Control |
| `hola`, `menu` | Menú principal | 🏠 Core |
| `comandos`, `ayuda` | Lista comandos | 📋 Ayuda |
| `1` o `asesor` | Hablar con asesor | 👥 Alta |
| `2` o `catalogo` | Ver catálogo | 📖 Alta |
| `3` o `pedido` | Info de pedido | 📦 Media |
| `4` o `horarios` | Ver horarios | ⏰ Media |
| `5` o `problema` | Reportar problema | 🚨 Crítica |
| `RELICARIO`, etc. | Info producto | 💎 Media |

---

## 🔗 ENDPOINTS API

### GET /api/comandos

**URL:** `http://localhost:3009/api/comandos`

**Respuesta:**
```json
{
  "success": true,
  "comandos": {
    "control": {
      "pause": {
        "command": "BOT PAUSA YA",
        "alternative": "PAUSAR BOT COCOLU AHORA",
        "description": "Pausa el bot en este chat",
        "caseSensitive": true,
        "exactMatch": true
      },
      "resume": {
        "command": "BOT ACTIVA YA",
        "alternative": "ACTIVAR BOT COCOLU AHORA",
        "description": "Reactiva el bot en este chat",
        "caseSensitive": true,
        "exactMatch": true
      }
    },
    "navigation": { /* ... */ },
    "menuOptions": { /* ... */ },
    "productKeywords": { /* ... */ },
    "tips": [ /* ... */ ]
  },
  "timestamp": "2025-11-10T14:30:00.000Z"
}
```

---

## 💡 TIPS Y MEJORES PRÁCTICAS

### Para Desarrolladores:
1. ✅ Los comandos de control (`BOT PAUSA YA`) DEBEN estar en MAYÚSCULAS
2. ✅ Son case-sensitive y exactos (sin espacios extra)
3. ✅ El cooldown de welcome es de 1 hora
4. ✅ Cada chat tiene su propio estado independiente
5. ✅ Los timers son individuales por usuario

### Para Usuarios:
1. ✅ Escribe `menu` en cualquier momento para volver al inicio
2. ✅ Los números (1-5) son atajos rápidos
3. ✅ Las keywords de productos funcionan en mayúsculas o minúsculas
4. ✅ Responde "SI" o "NO" claramente en los seguimientos
5. ✅ El bot tiene delays de 100-200ms para respuesta rápida

### Para Testing:
1. ✅ Usa `comandos` para ver la lista completa
2. ✅ Prueba cada flujo independientemente
3. ✅ Verifica los timers con seguimientos
4. ✅ Comprueba las alertas a vendedores
5. ✅ Testea los comandos de control

---

## 🎯 CASOS DE USO COMUNES

### Caso 1: Usuario nuevo
```
Usuario: hola
Bot: [Menú 1-5]
Usuario: 1
Bot: [Asigna asesor]
```

### Caso 2: Usuario busca producto
```
Usuario: RELICARIO
Bot: [Info de relicario]
Bot: ¿Tienes preguntas?
Usuario: si
Bot: [Conecta con experta]
```

### Caso 3: Desarrollador haciendo testing
```
Dev: BOT PAUSA YA
Bot: ⏸️ Bot pausado
[Bot no responde más]
Dev: BOT ACTIVA YA
Bot: ▶️ Bot activado
```

### Caso 4: Usuario necesita ayuda
```
Usuario: comandos
Bot: [Lista completa de comandos]
```

---

## 🧪 TESTING CHECKLIST

### Comandos de Control:
- [ ] `BOT PAUSA YA` pausa correctamente
- [ ] `BOT ACTIVA YA` reactiva correctamente
- [ ] Cooldown de 1 hora funciona
- [ ] No afecta otros chats

### Navegación:
- [ ] `hola` muestra menú
- [ ] `menu` vuelve al inicio
- [ ] `comandos` muestra lista
- [ ] Números (1-5) funcionan

### Flujos:
- [ ] Opción 1: Asesor + seguimiento 15 min
- [ ] Opción 2: Catálogo + seguimiento 20 min
- [ ] Opción 3: Info Pedido + seguimiento 20 min
- [ ] Opción 4: Horarios + redirección
- [ ] Opción 5: Problema + escalamiento

### Keywords:
- [ ] RELICARIO funciona
- [ ] DIJE funciona
- [ ] CADENA funciona
- [ ] PULSERA funciona
- [ ] ANILLO funciona

---

## 📞 SOPORTE

### Para Desarrolladores:
- Consulta logs: `/api/logs`
- Consulta bots: `/api/bots`
- Consulta stats: `/api/dashboard`
- Consulta comandos: `/api/comandos`

### Para Usuarios:
- Escribe `comandos` en WhatsApp
- Escribe `menu` para volver al inicio
- Escribe `ayuda` para asistencia

---

## ✅ ESTADO ACTUAL

```
✅ 8 flujos activos (incluyendo comandos)
✅ 2 comandos de control operativos
✅ 5 opciones de menú funcionando
✅ 5 keywords de productos activas
✅ API /api/comandos disponible
✅ Delays optimizados (100-200ms)
✅ Sistema 100% operacional
```

---

**Sistema:** Cocolu Ventas Chatbot  
**Versión:** 5.1.0  
**Última actualización:** 10 Nov 2025, 10:30 AM  
**Estado:** ✅ PRODUCTION READY
