# 🌟 FLUJOS PREMIUM COCOLU VENTAS

## 📋 Sistema de Chatbot Avanzado con 9 Escenarios

Este documento describe el sistema completo de flujos premium implementados para Cocolu Ventas, diseñados para superar expectativas y proporcionar una experiencia de cliente excepcional.

---

## 🎯 Características Principales

- ✅ **Menú Interactivo de 5 Opciones**
- ✅ **Seguimiento Temporal Automático** (15 y 20 minutos)
- ✅ **Alertas a Vendedores en Tiempo Real**
- ✅ **Asignación Inteligente de Asesores**
- ✅ **Keywords de Productos Automáticas**
- ✅ **Gestión de Problemas Prioritaria**

---

## 📱 FLUJO PRINCIPAL: BIENVENIDA

### Menú Principal (5 Opciones)

Cuando el cliente escribe cualquier mensaje, recibe:

```
✨ ¡Hola! Bienvenid@ a Cocolu Ventas 💖

Soy tu asistente virtual y estoy aquí para ayudarte. 🤖

¿Qué te gustaría hacer hoy?

1️⃣ HABLAR CON ASESOR 🙋‍♀️
2️⃣ CATÁLOGO 📔
3️⃣ INFORMACIÓN DE MI PEDIDO 💌
4️⃣ HORARIOS ⏰
5️⃣ TENGO UN PROBLEMA 💔

Escribe el número o la opción que prefieras. 💗
```

---

## 🔄 ESCENARIOS IMPLEMENTADOS

### ESCENARIO 1 y 2: HABLAR CON ASESOR

**Flujo:** `hablar-asesor.flow.js`

#### ✅ ESCENARIO 1: Cliente atendido

1. Cliente selecciona opción 1
2. Bot asigna asesor automáticamente
3. Bot envía: "Has sido asignad@ a [Nombre Asesor]"
4. Bot envía enlace directo de WhatsApp del asesor
5. **Timer: 15 minutos**
6. Bot pregunta: "¿Ya fuiste atendid@?"
7. Cliente responde: **SI**
8. Bot cierra proceso exitosamente

#### ❌ ESCENARIO 2: Cliente NO atendido

1-6. (Igual que escenario 1)
7. Cliente responde: **NO**
8. Bot envía **ALERTA PRIORITARIA** al vendedor
9. Bot confirma: "Alerta enviada, te contactarán de inmediato"
10. Bot cierra proceso

**Código de alerta:**
```javascript
alertsService.sendAlert({
    sellerPhone: seller.phone,
    clientPhone: ctx.from,
    clientName: 'Cliente',
    reason: 'no_atendido'
});
```

---

### ESCENARIO 3 y 4: CATÁLOGO

**Flujo:** `catalogo.flow.js`

#### ❌ ESCENARIO 3: No le gustó nada

1. Cliente selecciona opción 2
2. Bot envía link del catálogo
3. **Timer: 20 minutos**
4. Bot pregunta: "¿Hubo algo que te gustara? 💗"
5. Cliente responde: **NO**
6. Bot envía alerta al vendedor
7. Bot conecta con asesora para atención personalizada
8. Bot cierra proceso

#### ✅ ESCENARIO 4: Sí le gustó algo

1-4. (Igual que escenario 3)
5. Cliente responde: **SI**
6. Bot envía alerta al vendedor (cliente interesado)
7. Bot conecta con asesora: "Envíale el producto que te gustó"
8. **Timer adicional: 20 minutos**
9. Bot pregunta: "¿Te atendieron? 💗"
10. Bot cierra proceso

---

### ESCENARIO 5 y 6: INFORMACIÓN DE PEDIDO

**Flujo:** `info-pedido.flow.js`

#### ✅ ESCENARIO 5: Fue atendida

1. Cliente selecciona opción 3
2. Bot conecta con asesora para info de pedido
3. **Timer: 20 minutos**
4. Bot pregunta: "¿Fuiste atendida? 💗"
5. Cliente responde: **SI**
6. Bot cierra proceso exitosamente

#### ❌ ESCENARIO 6: NO fue atendida

1-4. (Igual que escenario 5)
5. Cliente responde: **NO**
6. Bot envía alerta prioritaria al vendedor
7. Bot confirma envío de alerta
8. Bot cierra proceso

---

### ESCENARIO 7: HORARIOS

**Flujo:** `horarios.flow.js`

1. Cliente selecciona opción 4
2. Bot muestra horarios de atención
3. Bot pregunta: "¿Estás interesad@ en hacer un pedido?"
4. Cliente responde: **SI**
5. Bot redirige al **ESCENARIO 1** (Hablar con Asesor)
6. Continúa flujo normal de atención

---

### ESCENARIO 8: TENGO UN PROBLEMA

**Flujo:** `problema.flow.js`

1. Cliente selecciona opción 5
2. Bot envía **ALERTA INMEDIATA** al vendedor
3. Bot conecta con asesora de inmediato
4. **Timer: 15 minutos** (más corto por ser problema)
5. Bot pregunta: "¿Ya fuiste atendid@?"
6. Cliente responde: **SI** → Proceso completado
7. Cliente responde: **NO** → **ALERTA DE ESCALAMIENTO CRÍTICO**
8. Bot cierra proceso

**Prioridad:** ALTA - Atención inmediata

---

### ESCENARIO 9: KEYWORDS DE PRODUCTOS

**Flujo:** `producto-keyword.flow.js`

**Keywords configuradas:**
- RELICARIO
- DIJE
- CADENA
- PULSERA
- ANILLO

#### Flujo:

1. Cliente escribe keyword (ej: "RELICARIO")
2. Bot envía información completa del producto
3. Bot muestra productos relacionados
4. Bot pregunta: "¿Tienes alguna pregunta?"
5. Cliente responde: **SI**
   - Bot conecta con asesora
   - Envía alerta al vendedor
   - **Timer: 20 minutos**
   - Bot pregunta: "¿Ya fuiste atendid@?"
6. Cliente responde: **NO**
   - Bot pregunta: "¿Quieres hacer un pedido?"
   - Si SI → Redirige a flujo de asesor
7. Bot cierra proceso

---

## 🛠️ SERVICIOS IMPLEMENTADOS

### 1. Timer Service (`timer.service.js`)

Gestiona seguimientos automáticos:

```javascript
timerService.createTimer(
    userId,
    callbackFunction,
    delayMinutes,  // 15 o 20 minutos
    timerType
);
```

**Características:**
- ✅ Cancelación automática
- ✅ Historial de ejecución
- ✅ Limpieza automática de timers antiguos

### 2. Alerts Service (`alerts.service.js`)

Envía alertas a vendedores:

```javascript
alertsService.sendAlert({
    sellerPhone: '+57300...',
    clientPhone: '+57301...',
    clientName: 'María',
    reason: 'no_atendido',
    context: { ... }
});
```

**Tipos de alertas:**
- `no_atendido` - Cliente no fue atendido
- `catalogo_interesado` - Cliente interesado en catálogo
- `catalogo_no_interesado` - Cliente necesita asesoría
- `info_pedido` - Requiere info de pedido
- `problema_pedido` - Problema reportado (PRIORITARIO)
- `keyword_producto` - Dudas sobre producto específico

### 3. Products Keywords Service (`products-keywords.service.js`)

Gestión de keywords de productos:

```javascript
// Buscar producto
productsKeywordsService.searchKeyword('RELICARIO');

// Agregar nuevo producto
productsKeywordsService.addKeyword('NUEVO_PRODUCTO', {
    name: 'Producto',
    description: '...',
    price: 99900
});
```

---

## 📊 FLUJO DE DATOS

```
Cliente → Bot (Welcome)
    ↓
Selecciona Opción (1-5)
    ↓
Flujo Específico
    ↓
Asignación de Asesor (Round-Robin)
    ↓
Timer Programado (15 o 20 min)
    ↓
Seguimiento Automático
    ↓
SI/NO del Cliente
    ↓
Alertas a Vendedores (si aplica)
    ↓
Cierre de Proceso
```

---

## ⚙️ CONFIGURACIÓN

### Variables de Entorno

```env
# Horarios de atención
BUSINESS_HOURS_START=09:00
BUSINESS_HOURS_END=18:00
BUSINESS_DAYS=1,2,3,4,5

# URLs
CATALOG_URL=https://cocoluventas.com/catalogo
WEBSITE_URL=https://cocoluventas.com
```

### Vendedores

Los vendedores se gestionan en `sellers.service.js`:

```javascript
{
    id: 'SELLER001',
    name: 'Ana García',
    phone: '+573001234567',
    specialty: 'premium',
    maxClients: 10
}
```

---

## 📈 MÉTRICAS Y ANALYTICS

El sistema rastrea automáticamente:

- ✅ Mensajes recibidos y enviados
- ✅ Conversaciones activas
- ✅ Asignaciones de vendedores
- ✅ Alertas enviadas
- ✅ Timers ejecutados
- ✅ Keywords más buscadas
- ✅ Tasa de resolución (SI/NO)

**Obtener estadísticas:**

```javascript
// Stats de timers
timerService.getStats();

// Stats de alertas
alertsService.getStats();

// Stats de productos
productsKeywordsService.getSearchStats();

// Stats de vendedores
sellersManager.getStats();
```

---

## 🚀 CÓMO USAR

### 1. Iniciar el Bot

```bash
npm run dev
```

### 2. Escanear QR con WhatsApp

El cliente escanea el QR y automáticamente:
- Recibe bienvenida con menú de 5 opciones
- Es asignado a un vendedor
- Todos los flujos están activos

### 3. Monitorear

- **Logs en terminal:** Seguimiento en tiempo real
- **Dashboard:** http://localhost:3009
- **Alertas:** Los vendedores reciben notificaciones automáticas

---

## 🎯 VENTAJAS DEL SISTEMA

### Para el Cliente:
- ✅ Respuestas inmediatas 24/7
- ✅ Menú claro y fácil de usar
- ✅ Seguimiento proactivo
- ✅ Conexión directa con asesores
- ✅ Información de productos al instante

### Para el Negocio:
- ✅ Automatización de consultas frecuentes
- ✅ Asignación inteligente de vendedores
- ✅ Alertas en tiempo real
- ✅ Métricas y analytics completos
- ✅ Escalabilidad total
- ✅ Mejor conversión de ventas

### Para los Vendedores:
- ✅ Notificaciones de clientes que necesitan atención
- ✅ Contexto completo del cliente
- ✅ Distribución equitativa de clientes
- ✅ Priorización automática (problemas = urgente)

---

## 🔧 MANTENIMIENTO

### Agregar Nuevo Producto Keyword

```javascript
// En products-keywords.service.js
productsKeywordsService.addKeyword('COLLAR', {
    name: 'Collar Premium',
    description: '✨ *COLLAR PREMIUM*\n\n...',
    price: 79900,
    category: 'joyeria',
    available: true
});
```

### Agregar Nuevo Vendedor

```javascript
// En sellers.service.js
sellersManager.addSeller({
    name: 'Nueva Vendedora',
    phone: '+573009999999',
    email: 'nueva@cocolu.com',
    specialty: 'general'
});
```

### Modificar Tiempos de Seguimiento

En cada flujo, buscar:

```javascript
timerService.createTimer(
    ctx.from,
    callback,
    15,  // ← Cambiar aquí (minutos)
    'tipo'
);
```

---

## 📞 SOPORTE

Para dudas o mejoras del sistema:
- Revisar logs en terminal
- Consultar estadísticas de servicios
- Verificar estado de vendedores
- Analizar historial de alertas

---

## ✨ PRÓXIMAS MEJORAS

- [ ] Panel de control en dashboard para vendedores
- [ ] Reportes PDF de conversaciones
- [ ] Integración con CRM externo
- [ ] Webhooks para notificaciones externas
- [ ] Chat en vivo para supervisores
- [ ] IA para respuestas automáticas mejoradas
- [ ] Soporte multi-idioma
- [ ] Integración con pagos en línea

---

**Sistema desarrollado para Cocolu Ventas** 💝  
**Versión:** 1.0.0 Premium  
**Fecha:** Noviembre 2025  
**Estado:** ✅ Producción Ready
