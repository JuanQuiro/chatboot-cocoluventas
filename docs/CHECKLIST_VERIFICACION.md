# ✅ CHECKLIST DE VERIFICACIÓN

## Lista de verificación post-implementación de mejoras

---

## 🎯 VERIFICACIÓN RÁPIDA (5 minutos)

### 1. Instalación

- [ ] `npm install` ejecutado sin errores
- [ ] Todas las dependencias instaladas
- [ ] Archivo `.env` creado (basado en `.env.example`)

### 2. Inicio del Sistema

```bash
npm run improved
# o
npm run dev
```

- [ ] Sistema inicia sin errores
- [ ] Puerto 3008 activo (Bot)
- [ ] Puerto 3009 activo (API)
- [ ] QR Code de WhatsApp aparece
- [ ] No hay errores en consola

### 3. Health Check

```bash
curl http://localhost:3009/health
```

**Esperado**:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...,
  "memory": { ... },
  "checks": {
    "basic": { "status": "healthy" },
    "memory": { "status": "healthy" },
    "cpu": { "status": "healthy" }
  }
}
```

- [ ] Responde con status 200
- [ ] Todos los checks retornan "healthy"
- [ ] Memory usage < 90%

### 4. API Básica

```bash
curl http://localhost:3009/api/sellers
```

- [ ] Retorna lista de 5 vendedores
- [ ] Status 200
- [ ] JSON válido

### 5. Persistencia

- [ ] Carpeta `data/` se crea automáticamente
- [ ] Al iniciar, carga estado previo (si existe)

---

## 🔍 VERIFICACIÓN DETALLADA (15 minutos)

### Error Handling ✅

**Test**: Provocar un error

```javascript
// En cualquier parte del código
throw new Error('Test error');
```

- [ ] Error es capturado
- [ ] Aparece en logs estructurados
- [ ] Sistema NO se cae
- [ ] Error se guarda en historial

### Validación ✅

**Test**: Enviar datos inválidos

```bash
curl -X POST http://localhost:3009/api/sellers/assign \
  -H "Content-Type: application/json" \
  -d '{"userId": ""}'
```

- [ ] Rechaza con error 400
- [ ] Mensaje de error descriptivo
- [ ] No procesa datos inválidos

### Rate Limiting ✅

**Test**: Enviar muchas peticiones rápido

```bash
for i in {1..150}; do
  curl http://localhost:3009/api/sellers &
done
```

- [ ] Después de ~100 requests, retorna 429
- [ ] Header `X-RateLimit-Remaining` presente
- [ ] Indica `retryAfter` en respuesta

### Persistencia ✅

**Test 1 - Auto-save**:

1. Iniciar sistema
2. Hacer algunas operaciones (asignar vendedores)
3. Esperar 5+ minutos
4. Verificar:

- [ ] Archivos en `data/` se actualizan
- [ ] `sellers-state.json` existe
- [ ] `analytics-state.json` existe

**Test 2 - Recovery**:

1. Iniciar sistema
2. Hacer operaciones
3. Detener con `Ctrl+C` (graceful shutdown)
4. Reiniciar
5. Verificar:

- [ ] Estado se recupera
- [ ] Vendedores mantienen asignaciones
- [ ] Analytics mantienen métricas

### Graceful Shutdown ✅

**Test**: Presionar `Ctrl+C`

Debes ver:

```
🛑 =======================================
🛑 Señal recibida: SIGINT
🛑 Iniciando apagado limpio...
🧹 Limpiando: API Server...
✅ API Server limpiado
🧹 Limpiando: Save State...
💾 Datos guardados: sellers-state
✅ Save State limpiado
✅ Apagado completado correctamente
```

- [ ] Mensaje de shutdown aparece
- [ ] Servers se cierran ordenadamente
- [ ] Estado se guarda
- [ ] Proceso termina limpiamente

### Logging ✅

**Verificar logs estructurados**:

- [ ] Cada request HTTP es logueado
- [ ] Logs tienen timestamp
- [ ] Logs tienen contexto
- [ ] Niveles de log funcionan (info, error, warn)

**Formato esperado**:
```
ℹ️  [2024-11-04T04:43:00.000Z] [API] Request { method: 'GET', path: '/health', status: 200, duration: '5ms' }
```

### Health Monitoring ✅

**Test memoria**:

1. Abrir http://localhost:3009/health
2. Verificar:

- [ ] `memory.heapUsed` presente
- [ ] `memory.heapTotal` presente
- [ ] `memory.heapUsedPercent` presente
- [ ] Uptime correcto

### Circuit Breaker ✅

**Test** (si tienes integraciones externas):

```javascript
// Provocar 5+ fallos consecutivos
const breaker = new CircuitBreaker();

for (let i = 0; i < 6; i++) {
  try {
    await breaker.execute(() => Promise.reject('fail'));
  } catch {}
}

// Verificar estado
const state = breaker.getState();
```

- [ ] Después de 5 fallos, circuit se ABRE
- [ ] Siguientes llamadas fallan inmediatamente
- [ ] Después de timeout, pasa a HALF_OPEN
- [ ] Con éxito, vuelve a CLOSED

---

## 🔐 VERIFICACIÓN DE SEGURIDAD

### CORS ✅

```bash
curl -H "Origin: http://evil.com" \
  http://localhost:3009/api/sellers
```

- [ ] CORS headers presentes
- [ ] Origen controlado según `.env`

### Input Sanitization ✅

```bash
curl -X POST http://localhost:3009/api/sellers/assign \
  -H "Content-Type: application/json" \
  -d '{"userId": "<script>alert(1)</script>"}'
```

- [ ] No ejecuta scripts
- [ ] Input es sanitizado
- [ ] Sistema funciona normal

### Rate Limiting ✅

Ya verificado arriba.

---

## 📊 VERIFICACIÓN DE PERFORMANCE

### Memory Leaks ✅

**Test largo** (dejar corriendo 1 hora):

1. Iniciar sistema
2. Dejar corriendo 1+ hora
3. Hacer requests periódicos
4. Verificar:

- [ ] Memoria no crece indefinidamente
- [ ] Auto-cleanup funciona
- [ ] No warnings de memoria

### Resource Cleanup ✅

**Verificar intervalos se limpian**:

1. Iniciar sistema
2. Detener con Ctrl+C
3. Verificar:

- [ ] Todos los intervals se cancelan
- [ ] No quedan timers activos
- [ ] Proceso termina completamente

---

## 🎯 VERIFICACIÓN DE FUNCIONALIDAD

### Sellers Service ✅

```bash
# Ver vendedores
curl http://localhost:3009/api/sellers

# Asignar vendedor
curl -X POST http://localhost:3009/api/sellers/assign \
  -H "Content-Type: application/json" \
  -d '{"userId": "test123"}'

# Ver stats
curl http://localhost:3009/api/sellers/stats
```

- [ ] Lista de vendedores retorna 5
- [ ] Asignación funciona con Round-Robin
- [ ] Stats se actualizan correctamente

### Analytics Service ✅

```bash
# Ver analytics
curl http://localhost:3009/api/analytics

# Ver resumen
curl http://localhost:3009/api/analytics/summary
```

- [ ] Métricas retornan valores
- [ ] Se actualizan con actividad
- [ ] Resumen ejecutivo disponible

### BuilderBot Integration ✅

1. Escanear QR con WhatsApp
2. Enviar mensaje al bot
3. Verificar:

- [ ] Bot responde
- [ ] Vendedor es asignado
- [ ] Analytics registra mensaje
- [ ] Flujos funcionan

---

## 📱 VERIFICACIÓN DE DASHBOARD

Si tienes dashboard:

```bash
npm run dashboard:install
npm run dashboard:build
```

- [ ] Dashboard compila sin errores
- [ ] Accesible en http://localhost:3009/
- [ ] Muestra vendedores
- [ ] Muestra analytics
- [ ] Updates en tiempo real

---

## 🐛 TROUBLESHOOTING

### ❌ Puerto ya en uso

**Error**: `EADDRINUSE: address already in use`

**Solución**:
```bash
# Encontrar proceso
lsof -i :3009

# Matar proceso
kill -9 <PID>

# O cambiar puerto en .env
PORT=3010
API_PORT=3011
```

### ❌ Permisos de escritura

**Error**: `EACCES: permission denied, mkdir 'data'`

**Solución**:
```bash
# Dar permisos
chmod 755 .

# O crear carpeta manualmente
mkdir data
```

### ❌ Módulos no encontrados

**Error**: `Cannot find module`

**Solución**:
```bash
# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

### ❌ Health check falla

**Error**: Status unhealthy

**Verificar**:
1. Logs con errores
2. Uso de memoria > 90%
3. Servicios externos caídos

---

## ✅ CHECKLIST FINAL

### Sistema Básico
- [ ] Inicia sin errores
- [ ] Health check retorna 200
- [ ] API responde correctamente
- [ ] Bot de WhatsApp conecta

### Mejoras Críticas
- [ ] Error handling funciona
- [ ] Persistencia guarda datos
- [ ] Rate limiting protege
- [ ] Graceful shutdown limpio
- [ ] Logging estructurado activo

### Mejoras Avanzadas
- [ ] Memory monitoring alerta
- [ ] Circuit breaker protege
- [ ] Auto-save cada 5 min
- [ ] Recovery automático
- [ ] Validation rechaza inválidos

### Documentación
- [ ] Todos los archivos MD leídos
- [ ] .env configurado
- [ ] Scripts en package.json probados

---

## 🎓 RESULTADO ESPERADO

Si todos los checks pasan:

✅ **Sistema 100% funcional**  
✅ **Todas las mejoras activas**  
✅ **Listo para producción**  
✅ **Robusto y confiable**  

---

## 📞 SOPORTE

Si algún check falla:

1. **Revisar documentación**: `GUIA_USO_MEJORADO.md`
2. **Ver troubleshooting**: Sección arriba
3. **Revisar logs**: `logger.getLogs()`
4. **Verificar errores**: `errorHandler.getRecentErrors()`

---

**Tiempo estimado de verificación**: 20-30 minutos  
**Última actualización**: 2024-11-04  
**Versión del sistema**: 2.0.0 Mejorado
