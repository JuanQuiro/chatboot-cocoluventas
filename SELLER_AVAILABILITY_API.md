# 📊 API de Disponibilidad de Vendedores

## Descripción
Sistema completo de gestión de disponibilidad de vendedores con horarios, días de descanso y estado activo/inactivo.

## Endpoints Disponibles

### 1. Obtener Vendedores Disponibles Ahora
```bash
GET /api/sellers/available?specialty=general
```
**Respuesta:**
```json
{
  "success": true,
  "count": 3,
  "sellers": [
    {
      "id": "123",
      "name": "Juan",
      "specialty": "general",
      "status": "online",
      "loadPercentage": 45,
      "rating": 4.8
    }
  ]
}
```

### 2. Obtener Mejor Vendedor Disponible
```bash
GET /api/sellers/available/best?specialty=premium
```
Retorna el vendedor con menor carga de trabajo disponible.

### 3. Obtener Estado Completo de un Vendedor
```bash
GET /api/sellers/:id/status
```
**Respuesta:**
```json
{
  "success": true,
  "status": {
    "id": "123",
    "name": "Juan",
    "active": true,
    "status": "online",
    "isWorkingNow": true,
    "nextAvailability": "2025-11-19T09:00:00Z",
    "currentClients": 3,
    "maxClients": 10,
    "loadPercentage": 30,
    "workSchedule": {
      "monday": { "enabled": true, "startTime": "09:00", "endTime": "18:00" },
      "tuesday": { "enabled": true, "startTime": "09:00", "endTime": "18:00" },
      ...
    },
    "daysOff": [],
    "isAvailable": true
  }
}
```

### 4. Cambiar Disponibilidad (Activo/Inactivo)
```bash
PUT /api/sellers/:id/toggle-availability
Content-Type: application/json

{
  "active": false,
  "reason": "Enfermo"
}
```

### 5. Actualizar Horario de Trabajo
```bash
PUT /api/sellers/:id/work-schedule
Content-Type: application/json

{
  "dayOfWeek": "monday",
  "enabled": true,
  "startTime": "08:00",
  "endTime": "17:00"
}
```

### 6. Agregar Día de Descanso
```bash
POST /api/sellers/:id/days-off
Content-Type: application/json

{
  "date": "2025-11-20",
  "reason": "Vacaciones"
}
```

### 7. Remover Día de Descanso
```bash
DELETE /api/sellers/:id/days-off/2025-11-20
```

### 8. Obtener Próxima Disponibilidad
```bash
GET /api/sellers/:id/next-availability
```

### 9. Obtener Reporte de Disponibilidad
```bash
GET /api/sellers/availability/report
```
**Respuesta:**
```json
{
  "success": true,
  "report": {
    "total": 10,
    "workingNow": 7,
    "available": 5,
    "offline": 2,
    "busy": 1,
    "sellers": [...]
  }
}
```

## Características Principales

### ✅ Horarios de Trabajo
- Configuración por día de la semana
- Horarios de inicio y fin personalizables
- Habilitación/deshabilitación por día

### ✅ Días de Descanso
- Agregar días específicos de descanso
- Incluir razón del descanso
- Remover días de descanso

### ✅ Estado Activo/Inactivo
- Cambiar disponibilidad del vendedor
- Registrar razón de inactividad
- Refleja automáticamente en asignación

### ✅ Disponibilidad en Tiempo Real
- Verifica horario actual
- Verifica días de descanso
- Verifica carga de trabajo
- Verifica estado (online/offline)

### ✅ Asignación Inteligente
- Obtiene vendedor menos ocupado
- Filtra por especialidad
- Respeta horarios y disponibilidad

## Ejemplo de Uso en Flujo

```javascript
import { SellerAvailabilityService } from './seller-availability.service.js';

// Obtener mejor vendedor disponible
const seller = await SellerAvailabilityService.getAvailableSellerNow('premium');

if (seller) {
  // Asignar cliente al vendedor
  await seller.assignClient();
  console.log(`Cliente asignado a ${seller.name}`);
} else {
  console.log('No hay vendedores disponibles');
  // Mostrar próxima disponibilidad
}
```

## Modelo de Datos

### Seller Schema
```javascript
{
  name: String,
  email: String,
  phone: String,
  specialty: ['general', 'premium', 'vip', 'technical'],
  active: Boolean,
  status: ['online', 'offline', 'busy', 'away'],
  currentClients: Number,
  maxClients: Number,
  rating: Number,
  totalSales: Number,
  completedOrders: Number,
  workSchedule: {
    monday: { enabled: Boolean, startTime: String, endTime: String },
    tuesday: { enabled: Boolean, startTime: String, endTime: String },
    // ... resto de días
  },
  daysOff: [{ date: Date, reason: String }],
  availabilityByHour: Map<String, Boolean>
}
```

## Métodos Disponibles en el Modelo

### `seller.isWorkingNow()`
Verifica si el vendedor está trabajando en este momento.

### `seller.getNextAvailability()`
Retorna la próxima fecha/hora de disponibilidad.

### `seller.toggleActive(active, reason)`
Cambia el estado activo/inactivo.

### `seller.updateWorkSchedule(dayOfWeek, enabled, startTime, endTime)`
Actualiza el horario de un día específico.

### `seller.assignClient()`
Incrementa el contador de clientes actuales.

### `seller.releaseClient()`
Decrementa el contador de clientes actuales.

## Integración con Flujos

Los flujos pueden usar esta lógica para:
1. Asignar clientes automáticamente al vendedor disponible
2. Mostrar próxima disponibilidad si no hay vendedores
3. Respetar horarios de trabajo
4. Manejar días de descanso
5. Balancear carga entre vendedores

## URLs de Acceso

- **Dashboard**: https://cocolu.emberdrago.com/dashboard
- **API Base**: https://cocolu.emberdrago.com/api
- **Sellers Availability**: https://cocolu.emberdrago.com/api/sellers/available

---

**Estado**: ✅ Completamente implementado y desplegado
**Última actualización**: 2025-11-19
