# 🧪 COMANDOS DE TESTING Y DEBUG - COCOLU VENTAS BOT

## 📋 GUÍA COMPLETA DE COMANDOS

Este documento contiene TODOS los comandos disponibles para testing, debug y control del bot.

---

## 🔴 CONTROL DEL BOT

### Pausar Bot
```
PAUSAR BOT COCOLU AHORA
BOT PAUSA YA
```
**Efecto:** El bot deja de responder en ese chat hasta que se reactive.

### Activar Bot
```
ACTIVAR BOT COCOLU AHORA
BOT ACTIVA YA
```
**Efecto:** El bot vuelve a estar activo en ese chat.

---

## 🧪 MODO TESTING

### Activar Modo Test
```
MODO TEST ACTIVAR
TEST MODE ON
```
**Efecto:** 
- Timers reducidos automáticamente
- Debug activado
- Logs de testing visibles

### Desactivar Modo Test
```
MODO TEST DESACTIVAR
TEST MODE OFF
```
**Efecto:** Volver a modo producción normal.

---

## 🐛 MODO DEBUG

### Activar Debug
```
DEBUG MODE ON
ACTIVAR DEBUG
```
**Efecto:** 
- Logs detallados en consola
- Información de cada paso
- Ver estado en tiempo real

### Desactivar Debug
```
DEBUG MODE OFF
DESACTIVAR DEBUG
```
**Efecto:** Logs mínimos (solo errores importantes).

---

## ⏱️ CONTROL DE TIMERS

### Timer 30 Segundos (Testing Ultra Rápido)
```
TIMER 30SEG
TIMER 30SEGUNDOS
```
**Efecto:** TODOS los timers esperan solo 30 segundos.
**Uso:** Testing rápido de flujos completos.

### Timer 1 Minuto (Testing Moderado)
```
TIMER 1MIN
TIMER 1MINUTO
```
**Efecto:** TODOS los timers esperan 1 minuto.
**Uso:** Testing con tiempo suficiente para revisar.

### Timer 5 Minutos (Pre-Producción)
```
TIMER 5MIN
TIMER 5MINUTOS
```
**Efecto:** TODOS los timers esperan 5 minutos.
**Uso:** Testing en condiciones casi reales.

### Timer Normal (Producción)
```
TIMER NORMAL
TIMER RESET
```
**Efecto:** Restaurar tiempos originales:
- Asesor: 15 minutos
- Catálogo: 20 minutos
- Pedido: 20 minutos
- Problema: 15 minutos
- Keywords: 20 minutos

### Ver Timers Activos
```
VER TIMERS
SHOW TIMERS
```
**Efecto:** Muestra cuántos timers están corriendo y el override actual.

### Forzar Ejecución de Timer
```
FORZAR TIMER
FORCE TIMER
```
**Efecto:** Información sobre cómo forzar timers.

### Limpiar Todos los Timers
```
LIMPIAR TIMERS
CLEAR TIMERS
```
**Efecto:** Cancela TODOS los timers activos.

---

## 📊 INFORMACIÓN Y ESTADO

### Estado Completo del Bot
```
ESTADO BOT
BOT STATUS
```
**Muestra:**
- Modo test: ON/OFF
- Modo debug: ON/OFF
- Override de timers
- Timers activos
- Usuario actual
- Vendedora asignada
- Flujo actual
- Estados de espera
- Comandos ejecutados

### Ver Vendedoras
```
VER VENDEDORAS
SHOW SELLERS
```
**Muestra:**
- Lista de vendedoras
- Teléfonos
- Asignaciones actuales
- Total de asignaciones

### Ver Usuarios Activos
```
VER USUARIOS
SHOW USERS
```
**Muestra:**
- Total de usuarios con vendedora asignada
- Estado de asignaciones

### Ver Estadísticas
```
ESTADISTICAS
STATS
```
**Muestra:**
- Resumen general del sistema
- Comandos ejecutados
- Timers activos
- Usuarios asignados

---

## 🧹 LIMPIEZA Y RESET

### Limpiar Estado del Usuario
```
LIMPIAR ESTADO
CLEAR STATE
```
**Efecto:** 
- Resetea todos los flags del usuario
- currentFlow = null
- Todos los waiting = false
- Usuario puede empezar de nuevo

### Resetear Vendedoras
```
RESET VENDEDORAS
RESET SELLERS
```
**Efecto:**
- Elimina todas las asignaciones
- Próximo usuario = nueva asignación desde cero

### Reset Completo del Sistema
```
RESET TODO
RESET ALL
```
**Efecto:**
- Modo test: OFF
- Modo debug: OFF
- Timers: Normal
- Vendedoras: Reseteadas
- Estado: Limpio
- Timers: Cancelados

---

## 📝 AYUDA

### Ver Ayuda
```
HELP TESTING
AYUDA TEST
COMANDOS
```
**Efecto:** Muestra resumen de comandos principales.

---

## 🎯 FLUJOS DE TESTING RECOMENDADOS

### Test Rápido de Flujo Completo (2 minutos)
1. `TIMER 30SEG` - Activar timers rápidos
2. `DEBUG MODE ON` - Ver todo en consola
3. Escribir `1` - Ir a Asesor
4. Esperar 30 segundos
5. Ver mensaje de seguimiento
6. Responder `SI` o `NO`
7. `RESET TODO` - Limpiar para siguiente test

### Test de Múltiples Flujos (5 minutos)
1. `MODO TEST ACTIVAR` - Modo test completo
2. `TIMER 1MIN` - 1 minuto por timer
3. Probar flujo 1 (Asesor)
4. Probar flujo 2 (Catálogo)
5. Probar flujo 3 (Pedido)
6. `VER TIMERS` - Verificar timers
7. `ESTADO BOT` - Ver estado completo

### Test de Producción Simulado (30 minutos)
1. `TIMER 5MIN` - Tiempos casi reales
2. Hacer flujo completo
3. `VER VENDEDORAS` - Verificar asignaciones
4. Esperar timers
5. Verificar respuestas
6. `TIMER NORMAL` - Volver a producción

---

## 💡 TIPS Y MEJORES PRÁCTICAS

### Para Testing Rápido
```bash
TIMER 30SEG
DEBUG MODE ON
# Hacer pruebas
RESET TODO
```

### Para Ver Todo en Detalle
```bash
DEBUG MODE ON
ESTADO BOT
VER VENDEDORAS
VER TIMERS
```

### Para Limpiar y Empezar de Cero
```bash
RESET TODO
```

### Para Testing de Producción
```bash
TIMER NORMAL
DEBUG MODE OFF
# Simular uso real
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Comandos son case-insensitive:** Puedes escribir en MAYÚSCULAS o minúsculas
2. **Interceptor prioritario:** Los comandos de testing se ejecutan ANTES que cualquier flujo
3. **Timers override global:** Cuando activas un override, afecta a TODOS los timers
4. **Debug mode:** Solo afecta los logs en consola, no el comportamiento del bot
5. **Reset TODO:** Restaura COMPLETAMENTE el sistema al estado inicial

---

## 🔍 DEBUGGING COMÚN

### El bot no responde
```
ESTADO BOT           # Ver si está pausado
BOT ACTIVA YA        # Activar si está pausado
LIMPIAR ESTADO       # Limpiar estado del usuario
```

### Timer no se ejecuta
```
VER TIMERS           # Ver si hay timers activos
TIMER 30SEG          # Probar con timer rápido
FORZAR TIMER         # Información para forzar
```

### Vendedora no asignada
```
VER VENDEDORAS       # Ver estado de vendedoras
RESET VENDEDORAS     # Resetear asignaciones
```

### Estado corrupto
```
RESET TODO           # Reset completo
```

---

## 📚 EJEMPLOS DE USO

### Ejemplo 1: Test Rápido de Asesor
```
Usuario: TIMER 30SEG
Bot: ⏱️ TIMERS: 30 SEGUNDOS [...]

Usuario: DEBUG MODE ON
Bot: 🐛 MODO DEBUG ACTIVADO [...]

Usuario: 1
Bot: [Flujo de asesor...]

[Esperar 30 segundos]

Bot: ¿Ya fuiste atendido?
Usuario: SI
Bot: [Cierra flujo]

Usuario: RESET TODO
Bot: 🔄 RESET COMPLETO [...]
```

### Ejemplo 2: Ver Estado Completo
```
Usuario: ESTADO BOT
Bot: 📊 ESTADO DEL BOT
     🧪 Modo Test: OFF
     🐛 Modo Debug: OFF
     ⏱️ Override Timers: Normal
     ⏰ Timers activos: 2
     
     👤 Usuario: Juan
     👩‍💼 Vendedora: María
     📱 Tel vendedora: +573XXXXXXXXX
     
     🔄 Flujo actual: Ninguno
     ⏳ Esperando respuesta: Ninguna
     
     📝 Comandos ejecutados: 5
```

### Ejemplo 3: Ciclo Completo de Testing
```
# 1. Preparar
Usuario: MODO TEST ACTIVAR
Usuario: TIMER 1MIN

# 2. Probar
Usuario: catalogo
[Bot responde con catálogo]

# 3. Verificar
Usuario: ESTADO BOT
Usuario: VER TIMERS

# 4. Esperar timer
[1 minuto después]
Bot: ¿Hubo algo que te gustara? 💗

# 5. Responder
Usuario: SI

# 6. Limpiar
Usuario: RESET TODO
```

---

## 🎓 COMANDOS POR CATEGORÍA

### Comandos Esenciales (Uso Diario)
- `TIMER 30SEG`
- `ESTADO BOT`
- `RESET TODO`
- `DEBUG MODE ON`

### Comandos de Información
- `VER VENDEDORAS`
- `VER TIMERS`
- `VER USUARIOS`
- `ESTADISTICAS`

### Comandos de Control
- `PAUSAR BOT COCOLU AHORA`
- `ACTIVAR BOT COCOLU AHORA`
- `TIMER NORMAL`

### Comandos de Limpieza
- `LIMPIAR ESTADO`
- `LIMPIAR TIMERS`
- `RESET VENDEDORAS`
- `RESET TODO`

---

## 🚀 COMANDOS PARA DEMOSTRACIÓN AL CLIENTE

### Setup Inicial
```
TIMER 30SEG
DEBUG MODE ON
```

### Durante Demostración
```
ESTADO BOT         # Mostrar transparencia
VER VENDEDORAS     # Mostrar sistema de asignación
```

### Después de Demostración
```
TIMER NORMAL
RESET TODO
```

---

## 📞 SOPORTE

Si encuentras algún problema con los comandos:
1. Revisa los logs del servidor
2. Usa `ESTADO BOT` para ver el estado actual
3. Intenta `RESET TODO` para limpiar
4. Verifica que el comando esté escrito correctamente (case-insensitive)

---

**Última actualización:** 2025-11-11  
**Versión:** 1.0.0  
**Total de comandos:** 30+
