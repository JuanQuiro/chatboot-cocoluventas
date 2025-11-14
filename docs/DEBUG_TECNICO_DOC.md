# 🔧 DEBUG TÉCNICO - DOCUMENTACIÓN COMPLETA

**Para:** Desarrolladores  
**Comando:** `debug` o `tecnico`  
**Fecha:** 10 Noviembre 2025

---

## 🎯 ¿QUÉ ES EL DEBUG TÉCNICO?

Es un comando avanzado que muestra **TODA** la información interna del sistema para un usuario específico. Perfecto para:
- Debugging en producción
- Diagnóstico de problemas
- Auditorías técnicas
- Análisis de estado completo
- Troubleshooting

---

## 💻 CÓMO USAR

### En WhatsApp:
Escribe cualquiera de estos comandos:
```
debug
tecnico
técnico
dev
registro tecnico
```

### Respuesta:
El bot envía un mensaje técnico completo con **TODA** la información del sistema.

---

## 📊 INFORMACIÓN QUE MUESTRA

### 1. **Información de Usuario**
```
👤 Usuario: María López
📞 Teléfono: +58 412 1234567
🔄 Flujo Actual: catalogo
```

### 2. **Estado Completo (RAW STATE)** ⭐
Todas las variables de estado:
```
userName: María López
userId: 584121234567
startTime: 2025-11-10T14:30:00.000Z
currentFlow: catalogo
flowStartedAt: 2025-11-10T14:32:15.000Z
assignedSeller: seller_1
sellerName: Ana López
sellerPhone: +584120000001
wait ingCatalogResponse: TRUE
catalogFollowupSentAt: 2025-11-10T14:52:15.000Z
... [todas las claves]
```

### 3. **Timers Activos**
```
1. ID: followup_20_catalogo_584121234567
   Creado: 10/11/2025 14:32:15
   Delay: 20 min
   Estado: ACTIVO

2. ID: followup_20_final_584121234567
   Creado: 10/11/2025 14:55:20
   Delay: 20 min
   Estado: ACTIVO
```

### 4. **Vendedor Asignado (Detalle)**
```
ID: seller_1
Nombre: Ana López
Teléfono: +584120000001
Estado: ACTIVO
Especialidad: Ventas Premium
```

### 5. **Carga de Trabajo**
```
Ana López: 3 usuarios
María García: 2 usuarios
Carlos Pérez: 1 usuarios
Total disponibles: 3
Total ocupados: 0
```

### 6. **Control del Bot**
```
Estado: ACTIVO
Chats pausados globalmente: 2
```

O si está pausado:
```
Estado: PAUSADO
Pausado en: 2025-11-10T14:40:00.000Z
Pausado por: Developer
Chats pausados globalmente: 3
```

### 7. **Analytics**
```
Mensajes usuario: 15
Conversaciones: 3
```

### 8. **FLAGS de Estado** ⭐
Todos los estados booleanos:
```
waitingFollowupResponse: ❌ FALSE
waitingCatalogResponse: ✅ TRUE
waitingInfoPedidoResponse: ❌ FALSE
waitingProblemaResponse: ❌ FALSE
waitingKeywordResponse: ❌ FALSE
waitingFinalResponse: ❌ FALSE
processCompleted: ❌ FALSE
alertSent: ✅ TRUE
problemEscalated: ❌ FALSE
problemReported: ❌ FALSE
problemResolved: ❌ FALSE
advisorContacted: ✅ TRUE
noQuestions: ❌ FALSE
```

### 9. **Timestamps Críticos**
```
startTime: 10/11/2025 14:30:00
flowStartedAt: 10/11/2025 14:32:15
catalogFollowupSentAt: 10/11/2025 14:52:15
completedAt: (no completado aún)
```

### 10. **Provider Info**
```
Tipo: BaileysProvider
Conectado: SÍ
```

### 11. **Context Info**
```
From: 584121234567@s.whatsapp.net
Push Name: María López
Body: debug
Timestamp: 10/11/2025 15:00:00
Message ID: 3EB0B8F9D8A1234567890ABC
```

### 12. **Sistema (Memoria y Performance)** ⭐
```
RSS: 156.34 MB
Heap Total: 89.12 MB
Heap Used: 67.89 MB
External: 3.45 MB
Uptime: 2h 15m 34s
Node: v18.17.0
PID: 12345
```

### 13. **Variables de Entorno**
```
NODE_ENV: production
PORT: 3008
API_PORT: 3009
DB_PATH: ./database
```

### 14. **Diagnóstico Rápido** ⭐
```
Estado general: ✅ OPERACIONAL
Timers activos: ✅ SÍ
Esperando respuesta: ✅ SÍ
Proceso completo: ❌ NO
Alerta enviada: ✅ SÍ
```

---

## 🎯 CASOS DE USO

### Caso 1: Timer no se ejecutó
```
Dev: debug
[Ve que el timer existe y está activo]
[Verifica el delay y timestamp]
[Identifica si hay problema]
```

### Caso 2: Cliente dice que no recibe respuesta
```
Dev: debug
[Ve flags: wait ingCatalogResponse: TRUE]
[Ve que está esperando respuesta del usuario]
[Identifica que el bot está esperando correctamente]
```

### Caso 3: Memoria alta
```
Dev: debug
[Ve: Heap Used: 245.67 MB]
[Identifica memory leak potencial]
[Toma acción]
```

### Caso 4: Vendedor no asignado
```
Dev: debug
[Ve: Sin vendedor asignado]
[Revisa carga de trabajo]
[Asigna manualmente si es necesario]
```

### Caso 5: Estado inconsistente
```
Dev: debug
[Ve todo el estado RAW]
[Identifica variables en conflicto]
[Puede limpiar estado si es necesario]
```

---

## 🔍 INFORMACIÓN TÉCNICA

### Formato de Timestamps
- **Formato:** ISO 8601
- **Zona horaria:** Local del servidor
- **Ejemplo:** `2025-11-10T14:30:00.000Z`

### Flags Booleanos
- ✅ **TRUE** - Flag activo
- ❌ **FALSE** - Flag inactivo
- Si no aparece, no está definido

### Memoria
- **RSS:** Resident Set Size - Memoria total del proceso
- **Heap Total:** Memoria total asignada al heap
- **Heap Used:** Memoria actualmente en uso
- **External:** Memoria externa (buffers, etc.)

### Timers
- **ID formato:** `{tipo}_{delay}_{flow}_{userId}`
- **Delay:** En minutos
- **Estado:** Siempre ACTIVO (si aparece)

---

## ⚠️ IMPORTANTE

### Seguridad
- ✅ Este comando es SOLO para desarrolladores
- ✅ Muestra información sensible
- ✅ NO compartir con clientes
- ✅ Usar solo en debugging

### Performance
- Comando ligeramente pesado (genera mucho texto)
- Evitar uso excesivo en producción
- Ideal para debugging puntual

### Logs
- Cada vez que se ejecuta, genera log en consola
- Formato:
  ```
  ═══════════════════════════════════════
  🔧 DEBUG TÉCNICO GENERADO
  Usuario: María López (+584121234567)
  Timestamp: 2025-11-10T15:00:00.000Z
  Estado actual: catalogo
  Timers activos: 2
  Bot pausado: false
  ═══════════════════════════════════════
  ```

---

## 📋 CHECKLIST DE DEBUGGING

Cuando uses el comando debug, revisa:

- [ ] **Estado actual** - ¿Es correcto el flujo?
- [ ] **Timers** - ¿Hay timers activos? ¿Cuántos?
- [ ] **Flags** - ¿Qué está esperando el bot?
- [ ] **Vendedor** - ¿Está asignado correctamente?
- [ ] **Timestamps** - ¿Los tiempos tienen sentido?
- [ ] **Memoria** - ¿Está dentro de rangos normales (<200MB)?
- [ ] **Provider** - ¿Está conectado?
- [ ] **Control** - ¿Está pausado cuando no debería?

---

## 🚀 COMANDOS COMPLEMENTARIOS

### Para análisis completo:
1. **`debug`** - Info técnica completa
2. **`registro`** - Info amigable para cliente
3. **`comandos`** - Lista de comandos
4. **`BOT PAUSA YA`** - Pausar para intervenir
5. **`BOT ACTIVA YA`** - Reactivar después

### En API:
```
GET /api/health        → Estado del sistema
GET /api/bots          → Info de bots
GET /api/dashboard     → Métricas generales
GET /api/logs          → Logs del sistema
```

---

## 📊 MÉTRICAS NORMALES

### Memoria (Healthy)
```
RSS: 100-200 MB       ✅
Heap Used: 50-150 MB  ✅
```

### Memoria (Warning)
```
RSS: 200-400 MB       ⚠️
Heap Used: 150-300 MB ⚠️
```

### Memoria (Critical)
```
RSS: >400 MB          🚨
Heap Used: >300 MB    🚨
```

### Timers
```
0-3 timers por usuario: ✅ Normal
4-6 timers por usuario: ⚠️ Verificar
>6 timers por usuario:  🚨 Memory leak potencial
```

---

## 🛠️ SOLUCIÓN DE PROBLEMAS COMUNES

### Problema: Bot no responde
```
1. debug
2. Ver: Estado general
3. Si está PAUSADO → BOT ACTIVA YA
4. Si NO → Ver flags y timers
```

### Problema: Timer no se ejecuta
```
1. debug
2. Ver: Timers activos
3. Verificar timestamp de creación
4. Verificar delay configurado
5. Logs del sistema para errores
```

### Problema: Memoria alta
```
1. debug
2. Ver: Heap Used
3. Reiniciar bot si >300MB
4. Revisar timers acumulados
5. Limpiar database si es necesario
```

### Problema: Estado inconsistente
```
1. debug
2. Ver: Flags contradictorios
3. Ver: Estado RAW completo
4. Limpiar estado manualmente si es necesario
```

---

## 🎓 INTERPRETACIÓN AVANZADA

### waitingXXXResponse Flags
Estos flags indican que el bot está esperando una respuesta del usuario:
- `waitingFollowupResponse` → Esperando respuesta de "¿Ya fuiste atendido?"
- `waitingCatalogResponse` → Esperando respuesta de "¿Te gustó algo?"
- `waitingInfoPedidoResponse` → Esperando respuesta de info pedido
- Etc.

**Si está TRUE:** El bot NO enviará más mensajes hasta recibir respuesta.

### processCompleted
- **FALSE:** El flujo está activo
- **TRUE:** El flujo terminó correctamente
- Si es TRUE pero hay timers activos → Posible inconsistencia

### alertSent
- Indica si se envió alerta al vendedor
- Útil para debugging de alertas

### problemEscalated
- Indica si un problema se escaló a CRITICAL
- Solo en flujo de problemas

---

## 💡 TIPS AVANZADOS

1. **Comparar estados:** Ejecuta `debug` dos veces con minutos de diferencia para ver cambios

2. **Debugging de timers:** Si un timer no se ejecuta, revisa que el delay sea correcto y que el usuario tenga estado activo

3. **Memory leaks:** Si Heap Used crece constantemente, hay un leak. Busca timers que no se cancelan.

4. **Bot "mudo":** Si general está OPERACIONAL pero no responde, revisa los flags waiting*. Puede estar esperando respuesta del usuario.

5. **Múltiples timers:** Normal tener 1-2 por usuario. Más de 3 puede indicar que no se están cancelando correctamente.

---

## ✅ RESUMEN

**Comando:** `debug` o `tecnico`  
**Para:** Developers únicamente  
**Muestra:** TODO el estado técnico interno  
**Uso:** Debugging, troubleshooting, auditorías  
**Performance:** Pesado - usar puntualmente  
**Logs:** Genera log en consola  
**Seguridad:** NO compartir con clientes  

---

**Sistema:** Chatbot Cocolu v5.2  
**Comando implementado:** 10 Nov 2025  
**Categoría:** Developer Tools
