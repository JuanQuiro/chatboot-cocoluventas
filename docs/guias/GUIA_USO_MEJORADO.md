# 🚀 GUÍA DE USO - Sistema Mejorado

## Cómo usar el sistema con todas las mejoras implementadas

---

## 📋 PREREQUISITOS

- Node.js 18+ instalado
- npm o yarn
- Dependencias instaladas: `npm install`

---

## 🎯 INICIO RÁPIDO

### 1. Usar el Sistema Mejorado

```bash
# Opción 1: Ejecutar directamente
node app-mejorado.js

# Opción 2: Agregar script en package.json
npm run improved
```

### 2. Verificar que está funcionando

```bash
# Verificar health check
curl http://localhost:3009/health

# Deberías ver:
{
  "status": "healthy",
  "timestamp": "2024-11-04T04:43:00.000Z",
  "uptime": 45.2,
  "memory": { ... },
  "checks": {
    "basic": { "status": "healthy" },
    "memory": { "status": "healthy" },
    "cpu": { "status": "healthy" }
  }
}
```

---

## 🔧 CONFIGURACIÓN

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
# Puertos
PORT=3008                # Puerto del bot de WhatsApp
API_PORT=3009            # Puerto de la API REST

# Base de datos
DB_PATH=./database       # Ruta de la base de datos JSON

# Logging
LOG_LEVEL=info          # error, warn, info, debug, trace

# CORS
CORS_ORIGIN=*           # Origen permitido para CORS

# Rate Limiting
RATE_LIMIT_MAX=100      # Máximo requests por ventana
RATE_LIMIT_WINDOW=60000 # Ventana en milisegundos

# Persistencia
DATA_PATH=./data        # Ruta para guardar estado
AUTO_SAVE_INTERVAL=300000 # Auto-save cada 5 min
```

---

## 📊 ENDPOINTS DISPONIBLES

### Health Check
```bash
GET /health
```
Retorna estado de salud del sistema

### API Sellers
```bash
GET /api/sellers
POST /api/sellers/assign
GET /api/sellers/stats
```

### API Analytics
```bash
GET /api/analytics
GET /api/analytics/summary
```

### Dashboard
```bash
GET /
```
Dashboard React (si está compilado)

---

## 🛠️ FUNCIONALIDADES MEJORADAS

### 1. Persistencia Automática

El sistema guarda el estado automáticamente:

- ✅ **Auto-save cada 5 minutos**
- ✅ **Guardado al cerrar (graceful shutdown)**
- ✅ **Recuperación al iniciar**

**Archivos generados**:
```
data/
├── sellers-state.json
├── analytics-state.json
└── backups/
    └── backup_TIMESTAMP/
```

### 2. Rate Limiting

Protección automática contra spam:

- ✅ **Mensajes**: 20 por minuto por usuario
- ✅ **API**: 100 requests por minuto por IP

**Headers de respuesta**:
```
X-RateLimit-Remaining: 95
```

**Si se excede**:
```json
{
  "error": "Too many requests",
  "retryAfter": 45
}
```

### 3. Logging Estructurado

Todos los eventos son logueados:

```
ℹ️  [2024-11-04T04:43:00.000Z] [ChatBot] Sistema iniciado
ℹ️  [2024-11-04T04:43:01.000Z] [API] Request { method: 'GET', path: '/health', status: 200, duration: '5ms' }
❌ [2024-11-04T04:43:02.000Z] [ChatBot] Error en operación { error: 'Connection failed' }
```

### 4. Health Monitoring

**Verificación continua**:
- ✅ Memoria (alerta si >90%)
- ✅ CPU usage
- ✅ Uptime
- ✅ Checks personalizados

**Endpoint**: `GET /health`

### 5. Graceful Shutdown

**Al presionar Ctrl+C**:
```
🛑 =======================================
🛑 Señal recibida: SIGINT
🛑 Iniciando apagado limpio...
🛑 =======================================
🧹 Limpiando: API Server...
✅ API Server limpiado
🧹 Limpiando: Bot Server...
✅ Bot Server limpiado
🧹 Limpiando: Save State...
💾 Datos guardados: sellers-state
💾 Datos guardados: analytics-state
✅ Save State limpiado
✅ =======================================
✅ Apagado completado correctamente
✅ =======================================
```

---

## 🔍 MONITOREO Y DEBUG

### Ver Logs

Los logs se guardan en memoria (últimos 1000):

```javascript
// En el código
import logger from './src/utils/logger.js';

// Ver logs recientes
const logs = logger.getLogs('error', 50);
```

### Ver Errores

```javascript
import errorHandler from './src/utils/error-handler.js';

// Ver errores recientes
const errors = errorHandler.getRecentErrors(50);
```

### Verificar Estado

```javascript
import sellersManager from './src/services/sellers.service.js';
import analyticsService from './src/services/analytics.service.js';

// Estado de vendedores
const sellersState = sellersManager.getState();

// Estado de analytics
const analyticsState = analyticsService.getState();
```

---

## 🚨 MANEJO DE ERRORES

### Error Handling Automático

Todos los errores son capturados:

```javascript
// En tu código
import errorHandler from './src/utils/error-handler.js';

// Wrap automático
await errorHandler.tryAsync(async () => {
    await miOperacionRiesgosa();
}, { userId: '123', operation: 'create-order' });
```

### Circuit Breaker

Para operaciones externas:

```javascript
import CircuitBreaker from './src/utils/circuit-breaker.js';

const breaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000
});

try {
    const result = await breaker.execute(async () => {
        return await externalAPI.call();
    });
} catch (error) {
    if (error.message === 'Circuit breaker is OPEN') {
        // Circuit abierto, usar fallback
    }
}
```

---

## 📦 BACKUPS

### Crear Backup Manual

```javascript
import persistence from './src/utils/persistence.js';

// Crear backup
const backupName = await persistence.backup('mi-backup');
// Resultado: data/backups/mi-backup/
```

### Backup Automático

Se recomienda configurar backup periódico:

```bash
# Cron job diario (Linux/Mac)
0 3 * * * cd /path/to/app && node -e "require('./src/utils/persistence.js').default.backup('daily-backup')"
```

---

## 🔐 SEGURIDAD

### Validación de Inputs

```javascript
import validator from './src/utils/validator.js';

// Validar datos
try {
    const cleanEmail = validator.email(userInput);
    const cleanPhone = validator.phone(phoneInput);
    const sanitized = validator.sanitize(textInput);
} catch (error) {
    // ValidationError
}
```

### Rate Limiting

Ya configurado automáticamente en API.

### CORS

Configurar en `.env`:
```
CORS_ORIGIN=https://midominio.com
```

---

## ⚡ PERFORMANCE

### Monitoreo de Memoria

El sistema monitorea automáticamente:

```
⚠️  Alto uso de memoria {
  heapUsed: '850MB',
  heapTotal: '1000MB',
  percentage: '85.00%'
}
```

### Limpieza Automática

- ✅ Rate limiter: limpia cada 1 minuto
- ✅ Analytics: limpia usuarios activos cada hora
- ✅ Logs: mantiene últimos 1000

---

## 🐛 TROUBLESHOOTING

### Problema: Memory Leak

**Síntoma**: Memoria crece constantemente

**Solución**:
1. Verificar logs: `logger.getLogs('warn')`
2. Revisar monitoreo de memoria
3. Reiniciar si supera 90%

### Problema: Rate Limit alcanzado

**Síntoma**: 429 Too Many Requests

**Solución**:
1. Esperar `retryAfter` segundos
2. O aumentar límite en código:
```javascript
import { apiLimiter } from './src/utils/rate-limiter.js';
apiLimiter.reset(userId);
```

### Problema: Circuit Breaker OPEN

**Síntoma**: "Circuit breaker is OPEN"

**Solución**:
1. Esperar tiempo de reset (60s por defecto)
2. O reset manual:
```javascript
breaker.reset();
```

### Problema: Datos no se guardan

**Síntoma**: Estado se pierde al reiniciar

**Solución**:
1. Verificar carpeta `data/` existe
2. Verificar permisos de escritura
3. Ver logs: `logger.getLogs('error')`

---

## 📈 MEJORES PRÁCTICAS

### 1. Siempre usar logger

```javascript
// ❌ No hacer
console.log('Usuario conectado');

// ✅ Hacer
logger.info('Usuario conectado', { userId: '123' });
```

### 2. Validar inputs

```javascript
// ❌ No hacer
const seller = sellersManager.assignSeller(userId);

// ✅ Hacer
const userId = validator.required(req.body.userId, 'UserId');
const seller = sellersManager.assignSeller(userId);
```

### 3. Manejar errores

```javascript
// ❌ No hacer
await riesgosoOperation();

// ✅ Hacer
await errorHandler.tryAsync(async () => {
    await riesgosoOperation();
}, { context: 'mi-operacion' });
```

### 4. Usar circuit breaker para externos

```javascript
// Para APIs externas, webhooks, etc.
const breaker = new CircuitBreaker();
await breaker.execute(() => externalAPI.call());
```

---

## 🎯 MIGRACIÓN DESDE app.js ORIGINAL

### Paso 1: Backup

```bash
cp app.js app-original-backup.js
```

### Paso 2: Reemplazar

```bash
cp app-mejorado.js app.js
```

### Paso 3: Verificar

```bash
node app.js
```

### Paso 4: Verificar funcionalidad

```bash
# Health check
curl http://localhost:3009/health

# API funcionando
curl http://localhost:3009/api/sellers
```

---

## ✅ VERIFICACIÓN POST-IMPLEMENTACIÓN

**Checklist**:

- [ ] Sistema inicia sin errores
- [ ] `/health` retorna 200
- [ ] API responde correctamente
- [ ] Se crean archivos en `data/`
- [ ] Logs estructurados aparecen
- [ ] Graceful shutdown funciona (Ctrl+C)
- [ ] Estado se recupera al reiniciar

---

## 🎓 RECURSOS

- **Documentación completa**: `MEJORAS_IMPLEMENTADAS_COMPLETAS.md`
- **Análisis de puntos débiles**: `ANALISIS_COMPLETO.md`
- **Plan de implementación**: `PLAN_PARA_PERFECCION.md`

---

## 💡 PRÓXIMOS PASOS RECOMENDADOS

1. **Usar sistema mejorado** en desarrollo
2. **Probar todas las funcionalidades**
3. **Monitorear logs y errores**
4. **Ajustar configuración** según necesidad
5. **Implementar en producción**

---

**Estado**: ✅ Sistema listo para usar  
**Nivel**: ⭐⭐⭐⭐⭐ Production-Ready  
**Soporte**: Todos los archivos de utilities disponibles
