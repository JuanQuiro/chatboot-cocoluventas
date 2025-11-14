# 🗄️ SISTEMA DE LOGS EN BASE DE DATOS - ENTERPRISE

## ✨ IMPLEMENTACIÓN COMPLETA

Sistema de logs robusto, sin pérdida de datos, con base de datos PostgreSQL.

---

## 🎯 CARACTERÍSTICAS CLAVE

### ✅ Sin Pérdida de Datos
- **Batch processing**: Agrupa logs cada 5 segundos
- **Cola de retry**: Si falla, guarda en `logs_batch_queue`
- **Archivo de emergencia**: Si BD está caída, guarda en archivo local
- **Persistencia offline**: Cola en localStorage si no hay internet
- **Auto-retry**: Procesa cola cada 1 minuto

### ✅ Performance Optimizado
- **INSERT masivo**: 50 logs por batch
- **Índices estratégicos**: Búsquedas rápidas por tipo, categoría, fecha
- **JSONB**: Datos flexibles con índice GIN
- **Particionamiento**: Preparado para escalar

### ✅ Seguridad y Compliance
- **RBAC**: Permisos por rol
- **Auditoría completa**: Usuario, tenant, sesión
- **Limpieza automática**: Rotación de logs antiguos
- **Encriptación**: En tránsito y en reposo (configurar)

---

## 📊 ARQUITECTURA

```
Frontend (Browser)
    ↓ errorMonitor.log()
    ↓ Batch Queue (localStorage)
    ↓ HTTP POST /api/logs/batch (cada 5s)
    ↓
Backend (Node.js)
    ↓ logsService.log()
    ↓ Batch Queue (memoria)
    ↓ INSERT masivo (cada 5s o 50 logs)
    ↓
Base de Datos (PostgreSQL)
    ↓ system_logs
    ↓ Índices + Vistas
    ↓ Limpieza automática
```

---

## 🗄️ ESQUEMA DE BASE DE DATOS

### Tabla Principal: `system_logs`

```sql
CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    log_type VARCHAR(50) NOT NULL,      -- ERROR, WARNING, INFO, DEBUG
    category VARCHAR(100) NOT NULL,     -- BOTS, AUTH, NETWORK, etc.
    message TEXT NOT NULL,
    
    -- Contexto
    user_id VARCHAR(100),
    tenant_id VARCHAR(100),
    session_id VARCHAR(255),
    
    -- Detalles
    data JSONB,
    stack_trace TEXT,
    error_code VARCHAR(50),
    
    -- Metadata
    url TEXT,
    user_agent TEXT,
    ip_address INET,
    
    -- Performance
    duration_ms INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Flags
    is_resolved BOOLEAN DEFAULT FALSE,
    severity INTEGER DEFAULT 1  -- 1=INFO, 2=WARNING, 3=ERROR, 4=CRITICAL
);
```

### Índices Optimizados

```sql
-- Búsquedas rápidas
CREATE INDEX idx_logs_type ON system_logs(log_type);
CREATE INDEX idx_logs_category ON system_logs(category);
CREATE INDEX idx_logs_created ON system_logs(created_at DESC);
CREATE INDEX idx_logs_severity ON system_logs(severity DESC, created_at DESC);

-- Multi-tenant
CREATE INDEX idx_logs_tenant ON system_logs(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX idx_logs_user ON system_logs(user_id) WHERE user_id IS NOT NULL;

-- Errores sin resolver
CREATE INDEX idx_logs_unresolved ON system_logs(created_at DESC) 
    WHERE is_resolved = FALSE;

-- Búsqueda en JSONB
CREATE INDEX idx_logs_data_gin ON system_logs USING GIN (data);
```

### Vistas Útiles

```sql
-- Errores recientes (últimos 7 días)
CREATE VIEW recent_errors AS
SELECT id, category, message, severity, created_at
FROM system_logs
WHERE log_type IN ('ERROR', 'CRITICAL')
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Errores sin resolver
CREATE VIEW unresolved_errors AS
SELECT id, category, message, severity, created_at
FROM system_logs
WHERE log_type IN ('ERROR', 'CRITICAL')
  AND is_resolved = FALSE
ORDER BY severity DESC, created_at DESC;

-- Estadísticas por categoría (últimas 24h)
CREATE VIEW logs_stats AS
SELECT category, log_type, COUNT(*) as count, MAX(created_at) as last_occurrence
FROM system_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY category, log_type
ORDER BY count DESC;
```

---

## 🚀 API ENDPOINTS

### POST /api/logs
Crear un log individual.

**Body:**
```json
{
  "log_type": "ERROR",
  "category": "BOTS",
  "message": "Error al conectar con WhatsApp",
  "data": { "botId": "bot-123", "provider": "baileys" },
  "severity": 3,
  "stack_trace": "Error: Connection failed..."
}
```

### POST /api/logs/batch
Crear múltiples logs (batch).

**Body:**
```json
{
  "logs": [
    {
      "log_type": "INFO",
      "category": "BOTS",
      "message": "Bot iniciando..."
    },
    {
      "log_type": "WARNING",
      "category": "PERFORMANCE",
      "message": "Operación lenta detectada",
      "duration_ms": 5000
    }
  ]
}
```

### GET /api/logs
Obtener logs con filtros.

**Query Params:**
- `limit`: Número de logs (default: 100)
- `offset`: Paginación (default: 0)
- `log_type`: ERROR | WARNING | INFO | DEBUG
- `category`: BOTS | AUTH | NETWORK | etc.
- `severity`: 1-4
- `tenant_id`: Filtrar por tenant
- `user_id`: Filtrar por usuario
- `from_date`: Desde fecha
- `to_date`: Hasta fecha

**Response:**
```json
{
  "success": true,
  "logs": [...],
  "count": 100
}
```

### GET /api/logs/stats
Obtener estadísticas.

**Query Params:**
- `tenant_id`: Filtrar por tenant
- `hours`: Últimas X horas (default: 24)

**Response:**
```json
{
  "success": true,
  "stats": [
    {
      "log_type": "ERROR",
      "category": "BOTS",
      "count": 15,
      "last_occurrence": "2025-11-04T19:42:31.452Z"
    }
  ]
}
```

### GET /api/logs/errors
Obtener solo errores sin resolver.

### POST /api/logs/cleanup
Limpiar logs antiguos (admin only).

### POST /api/logs/:id/resolve
Marcar error como resuelto.

### GET /api/logs/health
Health check del sistema de logs.

---

## 💻 USO EN FRONTEND

### Importar el servicio

```javascript
import errorMonitor from '../services/errorMonitor';
```

### Log simple

```javascript
errorMonitor.log('Usuario hizo login', {
    userId: user.id,
    timestamp: new Date()
});
```

### Log de error

```javascript
try {
    // código
} catch (error) {
    errorMonitor.logError({
        type: 'CRITICAL',
        category: 'BOTS',
        message: 'Error critico en bot',
        error: error.message,
        stack: error.stack
    });
}
```

### Log de warning

```javascript
errorMonitor.logWarning({
    type: 'PERFORMANCE',
    category: 'API',
    message: 'API response lenta',
    duration: 5000
});
```

---

## 🔧 USO EN BACKEND

### Importar el servicio

```javascript
import logsService from './services/logs.service.js';
```

### Log INFO

```javascript
await logsService.info(
    'BOTS',
    'Bot iniciando...',
    { botId, provider },
    { user_id, tenant_id }
);
```

### Log ERROR

```javascript
try {
    // código
} catch (error) {
    await logsService.error(
        'BOTS',
        'Error al conectar bot',
        error,
        { botId, provider },
        { user_id, tenant_id }
    );
}
```

### Log CRITICAL

```javascript
await logsService.critical(
    'DATABASE',
    'Conexión a BD perdida',
    error,
    { connectionString },
    { user_id, tenant_id }
);
```

### Log PERFORMANCE

```javascript
const start = Date.now();
// ... operación ...
const duration = Date.now() - start;

await logsService.performance(
    'API',
    'GET /api/bots',
    duration,
    { endpoint: '/api/bots', method: 'GET' },
    { user_id, tenant_id }
);
```

---

## 📝 CONFIGURACIÓN INICIAL

### 1. Crear esquema en la base de datos

```bash
psql -U postgres -d dashoffice < database/schema/logs-schema.sql
```

### 2. Verificar tablas creadas

```sql
\dt system_logs
\dt logs_batch_queue
\dv recent_errors
\dv unresolved_errors
\dv logs_stats
```

### 3. Reiniciar el backend

```bash
# Matar procesos
lsof -ti:3009 | xargs kill -9

# Iniciar
node app-integrated.js
```

### 4. Verificar API de logs

```bash
curl http://localhost:3009/api/logs/health
```

**Respuesta esperada:**
```json
{
  "success": true,
  "status": "healthy",
  "can_write": true,
  "timestamp": "2025-11-04T19:42:31.452Z"
}
```

---

## 🎯 FLUJO COMPLETO DE LOGS

### 1. Frontend genera log

```javascript
errorMonitor.log('Bots component mounted');
```

### 2. Se agrega a cola local (localStorage)

```javascript
// Batch queue: [log1, log2, log3...]
```

### 3. Cada 5 segundos o 20 logs, flush al backend

```javascript
POST http://localhost:3009/api/logs/batch
{
  "logs": [...]
}
```

### 4. Backend recibe y agrega a su cola

```javascript
// logsService.backendQueue: [log1, log2, log3...]
```

### 5. Cada 5 segundos o 50 logs, INSERT masivo en BD

```sql
INSERT INTO system_logs (...) VALUES (...), (...), (...)
```

### 6. Si falla, va a retry queue

```sql
INSERT INTO logs_batch_queue (logs) VALUES (...)
```

### 7. Retry automático cada 1 minuto

```javascript
// Procesa logs_batch_queue hasta 3 intentos
```

### 8. Si falla todo, archivo de emergencia

```bash
logs/emergency-logs.json
```

---

## 🛡️ PROTECCIONES ANTI-DESASTRES

### 1. **Batch Processing**
- No hace 1 INSERT por log
- Agrupa en lotes de 50
- Reduce carga en BD

### 2. **Queue de Retry**
- Si falla el INSERT, guarda en `logs_batch_queue`
- Reintenta hasta 3 veces
- Incrementa `retry_count`

### 3. **Archivo de Emergencia**
- Si BD está totalmente caída
- Guarda en `logs/emergency-logs.json`
- Para recuperar después

### 4. **Persistencia Offline**
- Si no hay internet
- Guarda en localStorage
- Envía cuando vuelve la conexión

### 5. **Limpieza Automática**
- INFO/DEBUG: 30 días
- WARNING: 90 días
- ERROR/CRITICAL: 1 año
- Evita que crezca infinito

### 6. **Índices Optimizados**
- Búsquedas rápidas
- Filtros eficientes
- Sin full table scans

### 7. **Transacciones**
- BEGIN/COMMIT
- Si falla, ROLLBACK
- Consistencia garantizada

---

## 📊 MONITOREO

### Ver logs en tiempo real

```sql
-- Últimos 10 errores
SELECT * FROM recent_errors LIMIT 10;

-- Errores sin resolver
SELECT * FROM unresolved_errors;

-- Estadísticas últimas 24h
SELECT * FROM logs_stats;

-- Logs de un usuario específico
SELECT * FROM system_logs 
WHERE user_id = 'user-123' 
ORDER BY created_at DESC LIMIT 50;

-- Logs de una categoría
SELECT * FROM system_logs 
WHERE category = 'BOTS' 
ORDER BY created_at DESC LIMIT 50;

-- Buscar en data JSONB
SELECT * FROM system_logs 
WHERE data @> '{"botId": "bot-123"}';
```

### Estadísticas de performance

```sql
-- Operaciones más lentas
SELECT category, message, duration_ms 
FROM system_logs 
WHERE duration_ms IS NOT NULL 
ORDER BY duration_ms DESC LIMIT 10;

-- Promedio de duración por categoría
SELECT category, AVG(duration_ms) as avg_duration 
FROM system_logs 
WHERE duration_ms IS NOT NULL 
GROUP BY category 
ORDER BY avg_duration DESC;
```

---

## 🧹 LIMPIEZA Y MANTENIMIENTO

### Limpiar logs antiguos (manual)

```sql
SELECT cleanup_old_logs();
```

### Limpiar logs antiguos (automático)

```bash
# Agregar a crontab
0 2 * * * psql -U postgres -d dashoffice -c "SELECT cleanup_old_logs();"
```

### Vaciar tabla de retry

```sql
DELETE FROM logs_batch_queue WHERE processed_at IS NOT NULL;
```

### Ver tamaño de la tabla

```sql
SELECT 
    pg_size_pretty(pg_total_relation_size('system_logs')) as size,
    COUNT(*) as total_logs
FROM system_logs;
```

---

## 🚨 ALERTAS

### Crear alerta para errores críticos

```sql
-- Ya está implementado en el trigger
CREATE TRIGGER trigger_critical_error
    AFTER INSERT ON system_logs
    FOR EACH ROW
    WHEN (NEW.severity >= 4)
    EXECUTE FUNCTION notify_critical_error();
```

### Integrar con Slack/Email (próximo paso)

```javascript
// En notify_critical_error()
// Enviar webhook a Slack
// O enviar email via SendGrid
```

---

## 📈 ESCALABILIDAD

### Particionamiento por fecha (si crece mucho)

```sql
-- Crear particiones mensuales
CREATE TABLE system_logs_2025_01 PARTITION OF system_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE system_logs_2025_02 PARTITION OF system_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- etc...
```

### Replicación (alta disponibilidad)

```bash
# PostgreSQL Streaming Replication
# Master → Replica
```

### Sharding (múltiples tenants)

```sql
-- Particionar por tenant_id
CREATE TABLE system_logs_tenant_cocolu PARTITION OF system_logs
    FOR VALUES WITH (MODULUS 4, REMAINDER 0);
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Schema SQL creado
- [x] Servicio de logs backend
- [x] Rutas API REST
- [x] Integración con errorMonitor frontend
- [x] Sistema de batch y retry
- [x] Persistencia offline
- [x] Archivo de emergencia
- [x] Limpieza automática
- [x] Índices optimizados
- [x] Vistas útiles
- [ ] Crear tablas en BD ⬅️ **FALTA HACER**
- [ ] Reiniciar backend ⬅️ **FALTA HACER**
- [ ] Probar endpoints ⬅️ **FALTA HACER**

---

## 🎉 BENEFICIOS

### Antes (localStorage):
- ❌ Se pierde al limpiar caché
- ❌ Límite de 5-10MB
- ❌ Solo local, no compartido
- ❌ Difícil de analizar
- ❌ No hay histórico

### Ahora (Base de Datos):
- ✅ Persistencia garantizada
- ✅ Sin límite de tamaño
- ✅ Compartido entre usuarios
- ✅ Queries SQL poderosas
- ✅ Histórico completo
- ✅ Auditoría total
- ✅ Analytics y BI
- ✅ Alertas en tiempo real

---

## 🚀 PRÓXIMOS PASOS

### 1. Crear las tablas en la BD

```bash
psql -U postgres -d dashoffice < database/schema/logs-schema.sql
```

### 2. Reiniciar el backend

```bash
lsof -ti:3009 | xargs kill -9
node app-integrated.js
```

### 3. Verificar que funciona

```bash
# Health check
curl http://localhost:3009/api/logs/health

# Ver logs
curl http://localhost:3009/api/logs?limit=10
```

### 4. Probar desde el frontend

```javascript
// Abrir consola del navegador
errorMonitor.log('Test desde frontend', { test: true });

// Esperar 5 segundos
// Verificar en BD:
// SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 10;
```

---

*Sistema de Logs en Base de Datos v1.0*  
*Implementado: 2025-11-04*  
*Estado: ✅ CÓDIGO LISTO - FALTA CONFIGURAR BD*
