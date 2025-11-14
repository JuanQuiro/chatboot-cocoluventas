# 🎮 COMANDOS DE CONTROL DEL BOT

## 🎯 Sistema de Pausa/Reanudación por Chat

Este sistema te permite **pausar y reanudar el bot** en chats específicos sin afectar otros chats.

---

## 🔐 COMANDOS SEGUROS

### Para PAUSAR el bot:

Escribe **EXACTAMENTE** uno de estos comandos (en MAYÚSCULAS):

```
PAUSAR BOT COCOLU AHORA
```

O el comando alternativo más corto:

```
BOT PAUSA YA
```

### Para REANUDAR el bot:

Escribe **EXACTAMENTE** uno de estos comandos (en MAYÚSCULAS):

```
ACTIVAR BOT COCOLU AHORA
```

O el comando alternativo más corto:

```
BOT ACTIVA YA
```

---

## ⚠️ IMPORTANTE - SEGURIDAD

### ¿Por qué comandos complejos?

Los comandos son **intencionalmente complejos** para evitar que:
- Clientes pasen el bot accidentalmente
- Palabras comunes activen el control
- Se confunda con mensajes normales

### Características de seguridad:

✅ **Debe ser EXACTO** - No funciona con variaciones
✅ **Debe ser en MAYÚSCULAS** - `bot pausa ya` NO funciona
✅ **Sin espacios extra** - Se debe escribir tal cual
✅ **Solo en chats específicos** - Cada chat se controla independientemente

---

## 📱 CÓMO USAR

### Escenario 1: Chat Personal (Pausar)

Tienes el bot en tu número personal y no quieres que responda a ciertos contactos.

**Pasos:**

1. Abre WhatsApp con el número que quieres pausar
2. Escribe exactamente: `BOT PAUSA YA`
3. Recibirás confirmación:

```
⏸️ *Bot Pausado*

El bot está pausado en este chat

No responderé a mensajes
hasta que lo reactives

✅ Para reactivar escribe:
*BOT ACTIVA YA*

_Comando en MAYÚSCULAS exacto_
```

4. **El bot dejará de responder** en ese chat específico
5. Otros chats **siguen funcionando normalmente**

### Escenario 2: Reactivar Bot

Quieres que el bot vuelva a funcionar en un chat pausado.

**Pasos:**

1. En el chat pausado, escribe: `BOT ACTIVA YA`
2. Recibirás confirmación:

```
▶️ *Bot Activado*

El bot está activo nuevamente

Puedo ayudarte con:
*1.* Hablar con Asesor
*2.* Ver Catálogo
*3.* Info de Pedido
*4.* Horarios
*5.* Problemas

⏸️ Para pausar escribe:
*BOT PAUSA YA*

💝 _Listo para ayudarte_
```

3. **El bot volverá a funcionar** normalmente

---

## 🔍 QUÉ PASA CUANDO EL BOT ESTÁ PAUSADO

### Comportamiento:

1. **No responde** a ningún mensaje en ese chat
2. **No activa flujos** (catálogo, asesor, etc.)
3. **No envía seguimientos** automáticos
4. **No procesa keywords** de productos
5. **Logs registran** que el chat está pausado

### En la consola verás:

```
⏸️ Bot pausado en 549XXXXXXXX - mensaje ignorado
⏸️ Bot pausado - flujo catálogo bloqueado para 549XXXXXXXX
```

### Otros chats:

✅ **Funcionan totalmente normal**
✅ **Sin afectar nada**
✅ **Cada chat es independiente**

---

## 📊 MONITOREO

### Ver chats pausados:

En la consola del bot verás:

```javascript
// Al pausar
⏸️ Bot PAUSADO en chat: 549XXXXXXXX
   Pausado por: Alberto
   Total chats pausados: 1

// Al reanudar
▶️ Bot REACTIVADO en chat: 549XXXXXXXX
   Estuvo pausado: 15 minutos
   Total chats pausados: 0
```

### Desde código (si necesitas):

```javascript
import botControlService from './src/services/bot-control.service.js';

// Ver si un chat está pausado
botControlService.isPaused('549XXXXXXXX');

// Ver todos los chats pausados
botControlService.getPausedChats();

// Pausar programáticamente
botControlService.pauseBot('549XXXXXXXX', 'Admin');

// Reanudar programáticamente
botControlService.resumeBot('549XXXXXXXX');
```

---

## 💡 CASOS DE USO

### 1. Número Personal

**Problema:** El bot está en tu número personal y responde a tus amigos/familia

**Solución:** 
- Pausa el bot cuando chatees con contactos personales
- Reactiva cuando necesites usar funciones del negocio

### 2. Testing

**Problema:** Necesitas probar algo sin que el bot interfiera

**Solución:**
- Pausa el bot en tu chat de prueba
- Haz lo que necesites
- Reactiva cuando termines

### 3. Chat de Soporte Interno

**Problema:** Equipo interno chatea y el bot responde

**Solución:**
- Pausa el bot en chats del equipo
- El equipo puede chatear normalmente
- Clientes en otros chats siguen con bot activo

### 4. Mantenimiento

**Problema:** Necesitas actualizar info sin que clientes vean errores

**Solución:**
- Pausa chats problemáticos temporalmente
- Actualiza lo necesario
- Reactiva cuando esté listo

---

## 🛡️ CARACTERÍSTICAS TÉCNICAS

### Persistencia:

- ✅ Las pausas se mantienen en memoria
- ✅ Sobreviven mientras el bot esté corriendo
- ⚠️ Se pierden al reiniciar el bot (por diseño)
- 🔄 Limpieza automática de pausas antiguas (30 días)

### Performance:

- ⚡ Verificación ultra-rápida (< 1ms)
- 💾 Mínimo uso de memoria
- 🎯 No afecta rendimiento del bot

### Seguridad:

- 🔐 Comandos complejos
- 📝 Logs detallados
- 🎯 Control por chat
- ⚡ Respuesta inmediata

---

## ❓ PREGUNTAS FRECUENTES

### ¿Puedo usar minúsculas?

**NO.** El comando debe ser **exactamente en MAYÚSCULAS**.

### ¿Puedo cambiar los comandos?

**SÍ.** Edita `src/services/bot-control.service.js`:

```javascript
this.PAUSE_COMMAND = 'TU COMANDO AQUI';
this.RESUME_COMMAND = 'TU OTRO COMANDO';
```

### ¿Se puede pausar permanentemente?

**SÍ.** La pausa dura hasta que la reactives manualmente.

### ¿Afecta a otros chats?

**NO.** Cada chat se controla individualmente.

### ¿Qué pasa si reinicio el bot?

**Se pierden las pausas.** Todas vuelven a estar activas.

### ¿Los clientes saben que el bot está pausado?

**NO.** El bot simplemente no responde. Es silencioso.

### ¿Puedo ver qué chats están pausados?

**SÍ.** En los logs o usando `getPausedChats()`.

---

## 🚀 RESUMEN RÁPIDO

| Acción | Comando | Efecto |
|--------|---------|--------|
| Pausar | `BOT PAUSA YA` | Bot deja de responder en ese chat |
| Reanudar | `BOT ACTIVA YA` | Bot vuelve a funcionar |
| Ver estado | Logs en consola | Info de chats pausados |

---

## ✅ SISTEMA ACTIVADO

El sistema de control está **completamente funcional**.

- ✅ Integrado en todos los flujos
- ✅ Comandos seguros configurados
- ✅ Logs informativos activos
- ✅ Listo para usar

**¡Ya puedes pausar/reanudar el bot en chats específicos!** 🎉

---

_Última actualización: 2025-11-10_
