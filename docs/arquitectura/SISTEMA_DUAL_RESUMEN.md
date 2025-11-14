# 🎯 SISTEMA DUAL: SIMPLE + AVANZADO - IMPLEMENTADO

## Fácil para Usuarios, Poderoso para Técnicos

---

## ✅ LO QUE ACABO DE IMPLEMENTAR

### 1. **Sistema de Roles (RBAC)** 👥
**Archivo**: `src/core/rbac/roles.js`

**5 Roles**:
- **USER**: Solo vista simple
- **MANAGER**: Gestión básica
- **AUDITOR**: Solo lectura + auditoría completa
- **TECHNICAL**: Modo técnico completo
- **ADMIN**: TODO

### 2. **Auditoría Avanzada** 🔍
**Archivo**: `src/core/audit/AuditLogger.js`

**Registra TODO**:
- Acciones de usuarios
- Cambios en datos (before/after/diff)
- Accesos (login/logout)
- Overrides manuales
- Queries directas a DB
- Cambios de configuración

**Features**:
- Búsqueda avanzada (10+ filtros)
- Exportar (JSON/CSV)
- Estadísticas
- Auto-persist cada 100 eventos
- Cleanup automático

### 3. **Control Manual** 🎛️
**Archivo**: `src/core/manual-control/ManualController.js`

**Permite**:
- Asignar vendedor manualmente
- Ejecutar queries directas
- Cambiar config en caliente
- Forzar acciones (backup, clear cache, etc.)
- Ver/remover overrides activos

---

## 🎨 MODOS DE INTERFAZ

### Modo Simple (Por Defecto)
- Dashboard limpio
- Solo opciones necesarias
- Sin tecnicismos
- Para: USER, MANAGER

### Modo Técnico
- Toggle "Modo Técnico"
- Debug mode
- Logs completos
- Métricas avanzadas
- Control manual
- Para: TECHNICAL, ADMIN

---

## 🔒 SEGURIDAD

**Todos los overrides manuales se auditan**:
- Quién lo hizo
- Cuándo
- Por qué (razón requerida)
- Qué cambió
- Severity: HIGH o CRITICAL

**Queries directas**:
- Requieren permiso especial
- Se auditan SIEMPRE
- Severity: CRITICAL
- Incluyen query completo + duración

---

## 📊 EJEMPLO DE USO

### Usuario Normal
```javascript
// Ve dashboard simple
// Puede crear órdenes
// NO ve opciones técnicas
```

### Administrador Técnico
```javascript
// 1. Toggle a modo técnico
// 2. Ver logs en tiempo real
// 3. Ejecutar override manual
await manualController.manualAssignSeller(admin, {
  userId: 'client_vip',
  sellerId: 'seller_premium',
  reason: 'Cliente VIP especial'
});
// 4. Se audita automáticamente
// 5. Aparece en dashboard de overrides
```

### Auditor
```javascript
// Buscar todos los overrides del mes
const overrides = auditLogger.search({
  type: 'manual_override',
  dateFrom: '2024-11-01',
  dateTo: '2024-11-30'
});

// Exportar a CSV
const csv = auditLogger.export('csv', { type: 'manual_override' });
```

---

## 🎯 PERMISOS POR ROL

| Permiso | USER | MANAGER | AUDITOR | TECHNICAL | ADMIN |
|---------|------|---------|---------|-----------|-------|
| Ver dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear órdenes | ❌ | ✅ | ❌ | ❌ | ✅ |
| Ver auditoría | ❌ | ❌ | ✅ | ❌ | ✅ |
| Debug mode | ❌ | ❌ | ❌ | ✅ | ✅ |
| Ver logs | ❌ | ❌ | ✅ | ✅ | ✅ |
| Control manual | ❌ | ❌ | ❌ | ✅ | ✅ |
| Queries DB | ❌ | ❌ | ❌ | ✅ | ✅ |
| Cambiar config | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 💎 RESULTADO

**Para Usuarios**: Simple y fácil  
**Para Técnicos**: Control total  
**Para Auditores**: Visibilidad completa  
**Para Seguridad**: Todo registrado

---

## 🚀 PRÓXIMO PASO

**Integrar en API**:
```javascript
// Middleware de permisos
app.use(checkPermissions);

// Endpoints técnicos
app.post('/api/technical/manual-assign', requireRole('technical'), ...);
app.get('/api/audit/search', requireRole('auditor'), ...);
app.post('/api/technical/execute-query', requireRole('admin'), ...);
```

---

**Sistema listo: Fácil para todos, poderoso cuando se necesita** ✅
