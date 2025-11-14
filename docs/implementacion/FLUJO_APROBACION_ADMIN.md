# 🔐 FLUJO DE APROBACIÓN Y CONTROL ADMIN

## 🎯 Concepto Clave

**EL ADMIN CONTROLA TODO EL SISTEMA**
- Solo el admin habilita bots
- Solo el admin da permisos
- Los usuarios se registran pero necesitan aprobación
- El admin decide si acepta o rechaza clientes

---

## 📋 FLUJO COMPLETO

### 1. **Registro de Usuario (Público)**

```
Usuario Nuevo
    ↓
Formulario de Registro
    ↓
Se crea cuenta con estado: PENDING
    ↓
No puede acceder al sistema
    ↓
Mensaje: "Tu cuenta está pendiente de aprobación"
    ↓
Notificación enviada al Admin
```

**Datos del registro:**
- Email
- Nombre
- Empresa
- Teléfono
- Motivo/Mensaje (¿Por qué quiere usar el sistema?)
- Estado: `PENDING`
- Role: `null` (sin rol hasta aprobación)
- Permissions: `[]` (sin permisos)

---

### 2. **Admin Revisa Solicitudes**

```
Admin Login
    ↓
Dashboard muestra: "⚠️ 5 usuarios pendientes"
    ↓
Admin va a "Usuarios Pendientes"
    ↓
Ve lista de solicitudes:
    - Usuario A - Empresa X - Solicitó hace 2h
    - Usuario B - Empresa Y - Solicitó hace 1d
    - Usuario C - Empresa Z - Solicitó hace 3d
```

**Admin puede:**
- Ver información completa del solicitante
- Aprobar usuario
- Rechazar usuario
- Asignar rol específico
- Asignar permisos personalizados
- Agregar notas internas

---

### 3. **Aprobación de Usuario**

```
Admin selecciona usuario
    ↓
Click en "Aprobar"
    ↓
Modal aparece:
    "Asignar Rol y Permisos"
    ↓
Admin selecciona:
    - Rol: Admin / Manager / Agent / Viewer
    - Tenant: Asignar a qué tenant pertenece
    - Permisos especiales (opcional)
    ↓
Click "Confirmar Aprobación"
    ↓
Usuario pasa a estado: ACTIVE
    ↓
Email enviado al usuario:
    "¡Tu cuenta ha sido aprobada!"
    ↓
Usuario ahora puede hacer login
```

---

### 4. **Rechazo de Usuario**

```
Admin selecciona usuario
    ↓
Click en "Rechazar"
    ↓
Modal aparece:
    "Motivo del rechazo (opcional)"
    ↓
Admin escribe motivo
    ↓
Click "Confirmar Rechazo"
    ↓
Usuario pasa a estado: REJECTED
    ↓
Email enviado (opcional):
    "Tu solicitud no fue aprobada"
    ↓
Usuario no puede acceder
```

---

## 🤖 GESTIÓN DE BOTS (Solo Admin/Owner)

### Flujo de Creación de Bots

```
Solo usuarios con permisos bots.create pueden ver:
    ↓
Botón "➕ Nuevo Bot"
    ↓
Esto significa:
    - Owner: ✅ Puede crear bots
    - Admin: ✅ Puede crear bots
    - Manager: ❌ NO puede crear bots
    - Agent: ❌ NO puede ver sección
    - Viewer: ❌ NO puede ver sección
    ↓
Admin crea bot:
    - Nombre del bot
    - Provider (Baileys, Venom, etc.)
    - Asignar a tenant
    - Configuración
    ↓
Bot creado y asignado al tenant
    ↓
Solo ese tenant puede usar ese bot
```

### Control de Bots por Tenant

```
Tenant A:
    - Bot 1 (Baileys)
    - Bot 2 (Meta)
    - Total: 2 bots

Tenant B:
    - Bot 3 (Venom)
    - Total: 1 bot

Admin puede:
    ✅ Ver todos los bots
    ✅ Crear bots para cualquier tenant
    ✅ Asignar/reasignar bots
    ✅ Iniciar/detener cualquier bot
    ✅ Eliminar bots

Usuario normal:
    ✅ Ver solo bots de su tenant
    ❌ No puede crear bots
    ❌ No puede ver bots de otros tenants
```

---

## 👥 ESTADOS DE USUARIO

| Estado | Descripción | Puede Login | Acciones Disponibles |
|--------|-------------|-------------|---------------------|
| **PENDING** | Registrado, esperando aprobación | ❌ No | Ninguna |
| **ACTIVE** | Aprobado y activo | ✅ Sí | Según sus permisos |
| **SUSPENDED** | Suspendido temporalmente | ❌ No | Ninguna |
| **REJECTED** | Rechazado por admin | ❌ No | Ninguna |
| **BLOCKED** | Bloqueado por mal comportamiento | ❌ No | Ninguna |

---

## 🔐 PERMISOS CRÍTICOS

### Usuarios (users.*)

| Permiso | Owner | Admin | Manager | Agent | Viewer |
|---------|-------|-------|---------|-------|--------|
| `users.view` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `users.create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `users.approve` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `users.reject` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `users.edit` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `users.delete` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `users.roles` | ✅ | ✅ | ❌ | ❌ | ❌ |

### Bots (bots.*)

| Permiso | Owner | Admin | Manager | Agent | Viewer |
|---------|-------|-------|---------|-------|--------|
| `bots.view` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `bots.create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `bots.manage` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `bots.delete` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `bots.send` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `bots.configure` | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 📊 DASHBOARD ADMIN

### Vista del Dashboard para Admin

```
┌─────────────────────────────────────────────────┐
│  Dashboard - Admin                              │
│                                                 │
│  ⚠️ ALERTAS                                     │
│  ┌─────────────────────────────────────────┐  │
│  │ 🔔 5 usuarios esperando aprobación      │  │
│  │ 🤖 3 bots desconectados                 │  │
│  │ ⚠️ 2 tenants sin pago                   │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  📊 ESTADÍSTICAS                               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│  │Total │ │Activos│ │Pend.│ │Bots  │         │
│  │ 50   │ │  42   │ │  5  │ │  8   │         │
│  │Users │ │Users  │ │Users│ │Total │         │
│  └──────┘ └──────┘ └──────┘ └──────┘         │
│                                                 │
│  🎛️ ACCIONES RÁPIDAS                           │
│  [Aprobar Usuarios] [Gestionar Bots]          │
│  [Ver Auditoría]    [Configuración]            │
└─────────────────────────────────────────────────┘
```

---

## 🔔 SISTEMA DE NOTIFICACIONES

### Notificaciones para Admin

```
En tiempo real:
1. Nuevo usuario registrado
   "👤 Juan Pérez se registró hace 5 min"
   
2. Bot desconectado
   "🤖 Bot Principal está desconectado"
   
3. Error crítico
   "⚠️ Error en Bot Ventas - revisar logs"
   
4. Límite alcanzado
   "📊 Tenant X alcanzó límite de mensajes"
```

### Badge de Notificaciones

```
Header Admin:
┌──────────────────────────────────────┐
│ [Aa] [☀️] [🔔 5] Admin ▼            │
│              ↑                       │
│         5 pendientes                 │
└──────────────────────────────────────┘
```

---

## 📝 ENDPOINTS API

### Usuarios Pendientes

```javascript
// Obtener usuarios pendientes
GET /api/users/pending
Response: {
  users: [
    {
      id: "user_123",
      email: "juan@empresa.com",
      name: "Juan Pérez",
      company: "Empresa XYZ",
      phone: "+52 123 456 7890",
      message: "Quiero usar el sistema para...",
      status: "PENDING",
      createdAt: "2025-01-04T10:30:00Z"
    }
  ],
  count: 5
}

// Aprobar usuario
POST /api/users/:userId/approve
Body: {
  role: "agent",
  tenantId: "tenant_abc",
  permissions: ["bots.view", "conversations.reply"],
  sendEmail: true
}

// Rechazar usuario
POST /api/users/:userId/reject
Body: {
  reason: "No cumple requisitos",
  sendEmail: true
}

// Suspender usuario activo
POST /api/users/:userId/suspend
Body: {
  reason: "Impago",
  duration: "30d" // temporal o permanent
}

// Reactivar usuario
POST /api/users/:userId/activate
```

---

## 🎯 FLUJO VISUAL COMPLETO

```
┌─────────────────────────────────────────────────┐
│            NUEVO USUARIO                        │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│     Formulario de Registro Público              │
│  - Email                                         │
│  - Nombre                                        │
│  - Empresa                                       │
│  - Teléfono                                      │
│  - Mensaje (¿Por qué?)                           │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│     Usuario creado: STATUS = PENDING            │
│     Sin rol, sin permisos                        │
│     No puede hacer login                         │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│     Notificación al Admin                       │
│     "🔔 Nuevo usuario esperando"                │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│            ADMIN REVISA                         │
│  Ve información del solicitante                  │
│  Decide: Aprobar / Rechazar                      │
└─────────────┬───────────────────────────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
┌──────────┐   ┌──────────┐
│ APROBAR  │   │ RECHAZAR │
└────┬─────┘   └────┬─────┘
     │              │
     ▼              ▼
┌──────────────┐   ┌────────────────┐
│ Asignar:     │   │ STATUS =       │
│ - Rol        │   │ REJECTED       │
│ - Tenant     │   │                │
│ - Permisos   │   │ Usuario NO     │
└────┬─────────┘   │ puede entrar   │
     │              └────────────────┘
     ▼
┌──────────────────────────────────┐
│ STATUS = ACTIVE                  │
│ Usuario puede hacer login        │
│ Tiene rol y permisos asignados   │
│ Email: "¡Aprobado!"              │
└──────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Usuario accede al sistema        │
│ Ve solo lo que sus permisos      │
│ permiten                          │
└──────────────────────────────────┘
```

---

## 🤖 CONTROL DE BOTS

### Solo Admin Puede:

1. **Crear Bots**
   - Elegir provider
   - Asignar a tenant
   - Configurar parámetros

2. **Asignar Bots**
   - Tenant A → Bot 1, Bot 2
   - Tenant B → Bot 3

3. **Gestionar Bots**
   - Iniciar/Detener
   - Ver QR codes
   - Cambiar configuración
   - Ver estadísticas de todos

4. **Eliminar Bots**
   - Solo admin puede eliminar
   - Confirmación requerida

### Usuarios Normales:

```
Manager con bots.view + bots.manage:
  ✅ Ve bots de su tenant
  ✅ Puede iniciar/detener
  ✅ Ve estadísticas
  ❌ NO puede crear
  ❌ NO puede eliminar
  ❌ NO ve bots de otros tenants

Agent sin permisos de bots:
  ❌ No ve sección de bots
  ❌ No puede gestionar nada
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Agregar campo `status` a usuarios (pending, active, rejected, suspended, blocked)
- [ ] Agregar campo `approvedBy` (quién lo aprobó)
- [ ] Agregar campo `approvedAt` (cuándo)
- [ ] Agregar campo `rejectionReason`
- [ ] API `/api/users/pending` (listar pendientes)
- [ ] API `/api/users/:id/approve` (aprobar)
- [ ] API `/api/users/:id/reject` (rechazar)
- [ ] API `/api/users/:id/suspend` (suspender)
- [ ] Middleware que bloquea login si status != active
- [ ] Notificaciones en tiempo real (WebSocket)
- [ ] Emails automáticos (aprobado/rechazado)
- [ ] Audit log de todas las acciones

### Frontend
- [ ] Página "Usuarios Pendientes"
- [ ] Badge de notificación en header
- [ ] Modal de aprobación con selector de rol
- [ ] Modal de rechazo con campo de motivo
- [ ] Filtros por estado (pending, active, rejected)
- [ ] Página de registro pública
- [ ] Mensaje "Cuenta pendiente" en login
- [ ] Restringir creación de bots a admin/owner
- [ ] Mostrar solo bots del tenant del usuario

### Permisos
- [ ] Agregar `users.approve`
- [ ] Agregar `users.reject`
- [ ] Agregar `users.suspend`
- [ ] Asignar solo a Owner/Admin
- [ ] Validar en backend

---

## 🎯 RESULTADO FINAL

**CONTROL TOTAL DEL ADMIN:**
✅ Admin aprueba cada usuario
✅ Admin asigna roles y permisos
✅ Admin habilita bots
✅ Admin gestiona tenants
✅ Admin ve todo
✅ Admin controla todo

**SEGURIDAD MÁXIMA:**
✅ Nadie entra sin aprobación
✅ Cada acción auditada
✅ Control granular de permisos
✅ Multi-tenant isolation
✅ Bots aislados por tenant

---

*Flujo de Aprobación Admin*
*DashOffice v4.0.0 - Sistema de Control Total*
