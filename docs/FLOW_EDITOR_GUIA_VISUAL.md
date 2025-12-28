# 🎨 FLOW EDITOR - GUÍA VISUAL COMPLETA

## 💎 EDITOR VISUAL DE FLUJOS CONVERSACIONALES

**Estado:** ✅ IMPLEMENTADO Y PERFECTO  
**Tecnología:** React Flow + Custom Nodes  
**Nivel:** PROFESSIONAL DRAG & DROP

---

## 🖼️ INTERFAZ DEL EDITOR

```
╔════════════════════════════════════════════════════════════════════════╗
║  📝 Flujo de Ventas         💾 Save  ▶️ Test  📥 Import  📤 Export    ║
╠════════════════════════════════════════════════════════════════════════╣
║  ┌─────────────┐                                                       ║
║  │  PALETA     │    ┌────────────────────────────────────┐            ║
║  ├─────────────┤    │                                    │            ║
║  │ 💬 Mensaje  │    │      CANVAS DE TRABAJO             │            ║
║  │             │    │      (Drag & Drop)                 │            ║
║  │ ❓ Pregunta │    │                                    │            ║
║  │             │    │  Arrastra nodos aquí →            │            ║
║  │ ⚡ Acción   │    │                                    │            ║
║  │             │    │                                    │            ║
║  │ 🔀 Condición│    │                                    │            ║
║  │             │    │                                    │            ║
║  └─────────────┘    └────────────────────────────────────┘            ║
║                                                                        ║
║  [Propiedades del Nodo Seleccionado]                                  ║
║  ┌──────────────────────────────────────────────┐                     ║
║  │ Nodo: Mensaje #1                             │                     ║
║  │ Etiqueta: [Bienvenida            ]           │                     ║
║  │ Contenido: [¡Hola! Bienvenido... ]           │                     ║
║  │ [Actualizar] [Eliminar]                      │                     ║
║  └──────────────────────────────────────────────┘                     ║
╚════════════════════════════════════════════════════════════════════════╝
```

---

## 🎯 TIPOS DE NODOS EN DETALLE

### 1. 💬 MENSAJE NODE

#### Diseño Visual
```
┌──────────────────────────────────┐
│          ⬤ (entrada)             │
│                                  │
│  💬 Bienvenida                   │
│  ─────────────────────────────   │
│  "¡Hola! Bienvenido a Cocolu    │
│   Ventas. ¿En qué te puedo      │
│   ayudar hoy? 🛍️"               │
│                                  │
│          ⬤ (salida)              │
└──────────────────────────────────┘

Color: Azul (#3B82F6)
Borde: 2px sólido
Shadow: Sombra suave
Hover: Ring azul
Selected: Ring más intenso + border-blue-500
```

#### Propiedades Editables
```javascript
{
    id: "message-1674567890",
    type: "message",
    data: {
        label: "Bienvenida",        // Título del nodo
        content: "¡Hola! ...",      // Mensaje a enviar
        delay: 0,                   // Delay en ms (opcional)
        media: null,                // URL de imagen/video (opcional)
        buttons: []                 // Botones quick reply (opcional)
    }
}
```

#### Casos de Uso
- ✅ Mensajes de bienvenida
- ✅ Confirmaciones automáticas
- ✅ Información de productos
- ✅ Notificaciones
- ✅ Despedidas

#### Ejemplo de Flujo
```javascript
// Node configuración
{
    label: "Confirmación Pedido",
    content: "✅ Tu pedido #12345 ha sido confirmado\n\n📦 Llegará en 2-3 días hábiles",
    delay: 1000
}
```

---

### 2. ❓ PREGUNTA NODE

#### Diseño Visual
```
┌──────────────────────────────────┐
│          ⬤ (entrada)             │
│                                  │
│  ❓ Menú Principal                │
│  ─────────────────────────────   │
│  "¿Qué deseas hacer?"            │
│                                  │
│  ┌─────────────────────────┐    │
│  │ [1] Ver productos       │    │
│  ├─────────────────────────┤    │
│  │ [2] Hacer pedido        │    │
│  ├─────────────────────────┤    │
│  │ [3] Hablar con vendedor │    │
│  └─────────────────────────┘    │
│                                  │
│          ⬤ (salida)              │
└──────────────────────────────────┘

Color: Verde (#10B981)
Opciones: Fondo verde-50
Hover: Highlight
```

#### Propiedades Editables
```javascript
{
    id: "question-1674567891",
    type: "question",
    data: {
        label: "Menú Principal",
        question: "¿Qué deseas hacer?",
        options: [
            "Ver productos",
            "Hacer pedido",
            "Hablar con vendedor"
        ],
        optionType: "list",        // list | buttons | quick_reply
        validateInput: true,       // Validar respuesta
        retryMessage: "Por favor, elige una opción válida"
    }
}
```

#### Tipos de Opciones

**A) Lista Numerada**
```
¿Qué deseas hacer?

1️⃣ Ver productos
2️⃣ Hacer pedido
3️⃣ Hablar con vendedor

Responde con el número
```

**B) Botones (WhatsApp)**
```
¿Qué deseas hacer?
[Ver productos] [Hacer pedido] [Soporte]
```

**C) Quick Reply**
```
¿Qué deseas hacer?
💬 Ver productos | 🛒 Hacer pedido | 👤 Soporte
```

#### Casos de Uso
- ✅ Menús de navegación
- ✅ Capturar elección del usuario
- ✅ Formularios interactivos
- ✅ Encuestas
- ✅ Selección de categorías

---

### 3. ⚡ ACCIÓN NODE

#### Diseño Visual
```
┌──────────────────────────────────┐
│          ⬤ (entrada)             │
│                                  │
│  ⚡ Consultar Productos           │
│  ─────────────────────────────   │
│                                  │
│  ┌─────────────────────────┐    │
│  │ Tipo: API_CALL          │    │
│  │ Endpoint: /api/products │    │
│  │ Método: GET             │    │
│  └─────────────────────────┘    │
│                                  │
│          ⬤ (salida)              │
└──────────────────────────────────┘

Color: Ámbar (#F59E0B)
Badge: Tipo de acción con fondo ámbar-50
```

#### Propiedades Editables
```javascript
{
    id: "action-1674567892",
    type: "action",
    data: {
        label: "Consultar Productos",
        actionType: "API_CALL",    // Ver tipos abajo
        config: {
            endpoint: "/api/products",
            method: "GET",
            params: {},
            headers: {},
            saveAs: "products"     // Variable para usar después
        },
        onSuccess: "message-next", // Siguiente nodo si éxito
        onError: "message-error"   // Siguiente nodo si error
    }
}
```

#### Tipos de Acciones Disponibles

**1. API_CALL** - Llamar API Externa
```javascript
{
    actionType: "API_CALL",
    config: {
        endpoint: "https://api.example.com/data",
        method: "POST",
        body: { key: "value" },
        saveAs: "apiResponse"
    }
}
```

**2. DB_QUERY** - Consultar Base de Datos
```javascript
{
    actionType: "DB_QUERY",
    config: {
        table: "products",
        operation: "SELECT",
        where: { category: "electronics" },
        limit: 10,
        saveAs: "productList"
    }
}
```

**3. SEND_EMAIL** - Enviar Email
```javascript
{
    actionType: "SEND_EMAIL",
    config: {
        to: "customer@email.com",
        subject: "Confirmación de Pedido",
        template: "order_confirmation",
        data: { orderId: "12345" }
    }
}
```

**4. ASSIGN_SELLER** - Asignar Vendedor
```javascript
{
    actionType: "ASSIGN_SELLER",
    config: {
        department: "sales",
        priority: "high",
        notifySeller: true
    }
}
```

**5. CREATE_ORDER** - Crear Pedido
```javascript
{
    actionType: "CREATE_ORDER",
    config: {
        customerId: "{{user.id}}",
        items: "{{cart.items}}",
        total: "{{cart.total}}"
    }
}
```

**6. UPDATE_CRM** - Actualizar CRM
```javascript
{
    actionType: "UPDATE_CRM",
    config: {
        customerId: "{{user.id}}",
        fields: {
            lastContact: "{{now}}",
            status: "interested"
        }
    }
}
```

**7. CUSTOM_CODE** - Código Personalizado
```javascript
{
    actionType: "CUSTOM_CODE",
    config: {
        code: `
            // JavaScript code
            const result = await someFunction();
            return result;
        `
    }
}
```

#### Casos de Uso
- ✅ Integración con APIs externas
- ✅ Consultas a base de datos
- ✅ Envío de notificaciones
- ✅ Procesamiento de pedidos
- ✅ Actualización de CRM
- ✅ Lógica de negocio compleja

---

### 4. 🔀 CONDICIÓN NODE

#### Diseño Visual
```
┌──────────────────────────────────┐
│          ⬤ (entrada)             │
│                                  │
│  🔀 Validar Usuario VIP           │
│  ─────────────────────────────   │
│                                  │
│  ┌─────────────────────────┐    │
│  │ if (user.type === VIP)  │    │
│  └─────────────────────────┘    │
│                                  │
│      ⬤ TRUE    ⬤ FALSE           │
│       ↓          ↓               │
│    (verde)    (rojo)             │
└──────────────────────────────────┘

Color: Púrpura (#A855F7)
Salidas: 2 handles (TRUE verde, FALSE rojo)
Code: Fondo gris-50 con fuente mono
```

#### Propiedades Editables
```javascript
{
    id: "condition-1674567893",
    type: "condition",
    data: {
        label: "Validar Usuario VIP",
        condition: "user.type === 'VIP'",  // Expresión JavaScript
        trueNode: "message-vip",           // Si TRUE
        falseNode: "message-regular"       // Si FALSE
    }
}
```

#### Tipos de Condiciones

**1. Comparación Simple**
```javascript
condition: "user.age >= 18"
condition: "cart.total > 100"
condition: "user.country === 'US'"
```

**2. Condiciones Múltiples**
```javascript
condition: "user.verified && cart.items.length > 0"
condition: "user.type === 'VIP' || order.total > 500"
```

**3. Verificación de Existencia**
```javascript
condition: "user.email !== null"
condition: "cart.items.length > 0"
condition: "user.subscribed"
```

**4. Funciones Personalizadas**
```javascript
condition: "isBusinessHours()"
condition: "hasActivePromotion(user.id)"
condition: "checkInventory(product.id)"
```

#### Ejemplos de Uso

**Ejemplo 1: Horario de Atención**
```
┌────────────────────┐
│ 🔀 Verificar Hora  │
│ isBusinessHours()  │
└─────┬──────────┬───┘
      │          │
   TRUE│       FALSE
      │          │
      ▼          ▼
  ┌────────┐  ┌─────────┐
  │Conectar│  │Mensaje  │
  │Vendedor│  │"Cerrado"│
  └────────┘  └─────────┘
```

**Ejemplo 2: Usuario VIP**
```
┌─────────────────────┐
│ 🔀 Tipo de Usuario  │
│ user.type === 'VIP' │
└─────┬───────────┬───┘
      │           │
    TRUE│      FALSE
      │           │
      ▼           ▼
  ┌───────┐   ┌─────────┐
  │Descuento │ │Precio   │
  │  20%   │ │ Normal  │
  └───────┘   └─────────┘
```

**Ejemplo 3: Disponibilidad de Stock**
```
┌──────────────────────┐
│ 🔀 Check Stock       │
│ product.stock > 0    │
└─────┬────────────┬───┘
      │            │
    TRUE│       FALSE
      │            │
      ▼            ▼
  ┌────────┐   ┌────────┐
  │Agregar │   │"Agotado"│
  │al Cart │   │        │
  └────────┘   └────────┘
```

#### Casos de Uso
- ✅ Validaciones de usuario
- ✅ Verificación de horarios
- ✅ Routing inteligente
- ✅ Permisos y accesos
- ✅ Lógica de descuentos
- ✅ Control de inventario

---

## 🔗 CONEXIONES ENTRE NODOS

### Tipos de Conexiones

```javascript
// Configuración de conexiones
const defaultEdgeOptions = {
    style: { 
        strokeWidth: 2, 
        stroke: '#3B82F6'     // Azul
    },
    type: 'smoothstep',       // Líneas suaves
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3B82F6'
    },
    animated: true            // Animación de flujo
};
```

### Estilos Visuales

**Conexión Normal**
```
Node A ────────────► Node B
      (azul, animado)
```

**Conexión TRUE (Condition)**
```
Condition ──────► Node Success
          (verde)
```

**Conexión FALSE (Condition)**
```
Condition ──────► Node Error
          (rojo)
```

---

## 🎨 EJEMPLO COMPLETO: FLUJO DE VENTAS

### Diagrama Visual Completo

```
                    ┌─────────────┐
                    │   START     │
                    └──────┬──────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │ 💬 Mensaje Bienvenida    │
            │ "¡Hola! Bienvenido a     │
            │  Cocolu Ventas 🛍️"       │
            └──────────┬───────────────┘
                       │
                       ▼
            ┌──────────────────────────┐
            │ ❓ Menú Principal         │
            │ "¿Qué deseas?"           │
            │ [1] Ver Catálogo         │
            │ [2] Hacer Pedido         │
            │ [3] Soporte              │
            └──┬────────┬────────┬─────┘
               │        │        │
          [1]  │   [2]  │   [3]  │
               │        │        │
               ▼        ▼        ▼
    ┌────────────┐  ┌────────┐  ┌──────────────┐
    │ ⚡ Acción  │  │ ⚡ Acción│ │ ⚡ Acción     │
    │ getProducts│  │ createOrder│ assignSeller│
    └─────┬──────┘  └────┬───┘  └──────┬───────┘
          │              │              │
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌────────────┐
    │ 🔀 Condi │  │ 💬 Mensaje│ │ 💬 Mensaje │
    │ hasStock?│  │ "Pedido  │  │ "Conectando│
    └─┬────┬───┘  │  creado ✅"│ │ vendedor..."│
      │    │      └──────────┘  └────────────┘
   SI │ NO │
      │    │
      ▼    ▼
  ┌────┐ ┌────┐
  │Mostrar│ Msg│
  │Catálogo│ No │
  │       │Stock│
  └────┘ └────┘
```

### Código del Flujo (JSON Export)

```json
{
    "name": "Flujo de Ventas Completo",
    "version": "1.0",
    "nodes": [
        {
            "id": "start",
            "type": "message",
            "position": { "x": 250, "y": 0 },
            "data": {
                "label": "Bienvenida",
                "content": "¡Hola! 👋 Bienvenido a Cocolu Ventas 🛍️\n\n¿En qué te puedo ayudar hoy?"
            }
        },
        {
            "id": "menu",
            "type": "question",
            "position": { "x": 250, "y": 150 },
            "data": {
                "label": "Menú Principal",
                "question": "Elige una opción:",
                "options": [
                    "Ver Catálogo de Productos",
                    "Hacer un Pedido",
                    "Hablar con Soporte"
                ]
            }
        },
        {
            "id": "action-products",
            "type": "action",
            "position": { "x": 50, "y": 350 },
            "data": {
                "label": "Obtener Productos",
                "actionType": "API_CALL",
                "config": {
                    "endpoint": "/api/products",
                    "method": "GET",
                    "saveAs": "products"
                }
            }
        },
        {
            "id": "check-stock",
            "type": "condition",
            "position": { "x": 50, "y": 500 },
            "data": {
                "label": "Verificar Stock",
                "condition": "products.length > 0"
            }
        },
        {
            "id": "show-catalog",
            "type": "message",
            "position": { "x": 50, "y": 650 },
            "data": {
                "label": "Mostrar Catálogo",
                "content": "📦 Catálogo Disponible:\n\n{{products}}"
            }
        },
        {
            "id": "no-stock",
            "type": "message",
            "position": { "x": 250, "y": 650 },
            "data": {
                "label": "Sin Stock",
                "content": "😔 Lo sentimos, no tenemos productos disponibles en este momento."
            }
        },
        {
            "id": "action-order",
            "type": "action",
            "position": { "x": 250, "y": 350 },
            "data": {
                "label": "Crear Pedido",
                "actionType": "CREATE_ORDER",
                "config": {
                    "customerId": "{{user.id}}",
                    "items": "{{cart.items}}"
                }
            }
        },
        {
            "id": "order-confirmed",
            "type": "message",
            "position": { "x": 250, "y": 500 },
            "data": {
                "label": "Confirmación",
                "content": "✅ ¡Pedido confirmado!\n\n📝 #{{order.id}}\n💰 Total: ${{order.total}}\n📦 Llegada: 2-3 días"
            }
        },
        {
            "id": "action-support",
            "type": "action",
            "position": { "x": 450, "y": 350 },
            "data": {
                "label": "Asignar Vendedor",
                "actionType": "ASSIGN_SELLER",
                "config": {
                    "department": "support",
                    "priority": "normal"
                }
            }
        },
        {
            "id": "support-wait",
            "type": "message",
            "position": { "x": 450, "y": 500 },
            "data": {
                "label": "Esperando Vendedor",
                "content": "⏳ Conectando con un agente...\n\nPor favor espera un momento."
            }
        }
    ],
    "edges": [
        { "source": "start", "target": "menu" },
        { "source": "menu", "target": "action-products", "label": "1" },
        { "source": "menu", "target": "action-order", "label": "2" },
        { "source": "menu", "target": "action-support", "label": "3" },
        { "source": "action-products", "target": "check-stock" },
        { "source": "check-stock", "target": "show-catalog", "sourceHandle": "true" },
        { "source": "check-stock", "target": "no-stock", "sourceHandle": "false" },
        { "source": "action-order", "target": "order-confirmed" },
        { "source": "action-support", "target": "support-wait" }
    ]
}
```

---

## 🛠️ HERRAMIENTAS DEL EDITOR

### 1. MiniMap (Vista Previa)
```
┌───────────────┐
│   MiniMap     │
├───────────────┤
│  ┌─┐          │
│  │ │  ┌─┐     │ ← Vista reducida
│  └─┘  │ │     │   del canvas completo
│       └─┘     │
│    ┌─┐  ┌─┐  │
│    │ │  │ │  │
│    └─┘  └─┘  │
└───────────────┘
```

### 2. Controles
```
┌──────────┐
│ Controls │
├──────────┤
│  ➕ Zoom │
│  ➖ Zoom │
│  🔍 Fit  │
│  🔒 Lock │
└──────────┘
```

### 3. Background Grid
```
┌─────────────────────────┐
│ . . . . . . . . . . .   │
│ . . . . . . . . . . .   │ ← Grid pattern
│ . . . . . . . . . . .   │   para alineación
│ . . . . . . . . . . .   │
└─────────────────────────┘
```

---

## 📊 ESTADÍSTICAS DEL FLUJO

### Panel de Estadísticas
```javascript
const flowStats = {
    nodes: {
        total: 10,
        byType: {
            message: 4,
            question: 2,
            action: 3,
            condition: 1
        }
    },
    edges: {
        total: 12,
        loops: 0,
        deadEnds: 0
    },
    complexity: "Medium",
    estimatedDuration: "2-5 min",
    maxDepth: 6
};
```

### Vista de Estadísticas
```
┌─────────────────────────────────────┐
│  📊 ESTADÍSTICAS DEL FLUJO          │
├─────────────────────────────────────┤
│                                     │
│  Nodos Totales: 10                  │
│  ├─ Mensajes: 4 (40%)               │
│  ├─ Preguntas: 2 (20%)              │
│  ├─ Acciones: 3 (30%)               │
│  └─ Condiciones: 1 (10%)            │
│                                     │
│  Conexiones: 12                     │
│  Complejidad: Media                 │
│  Duración Est: 2-5 min              │
│  Profundidad: 6 niveles             │
│                                     │
│  ✅ Sin loops detectados            │
│  ✅ Sin dead-ends                   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎯 BEST PRACTICES

### ✅ DO (Hacer)
1. **Nombres Descriptivos**
   ```
   ✅ "Consultar Disponibilidad de Producto"
   ❌ "Action 1"
   ```

2. **Flujo Lineal Simple**
   ```
   ✅ Start → Menú → Acción → Resultado
   ❌ Múltiples loops complejos
   ```

3. **Mensajes Claros**
   ```
   ✅ "¡Pedido confirmado! #12345"
   ❌ "ok"
   ```

4. **Validaciones**
   ```
   ✅ Usar condition nodes para validar
   ❌ Asumir datos siempre válidos
   ```

### ❌ DON'T (No Hacer)
1. ❌ Flujos infinitos sin salida
2. ❌ Nodos sin etiqueta
3. ❌ Demasiados niveles de profundidad (>8)
4. ❌ Condiciones sin manejo de error

---

## 💾 EXPORTAR/IMPORTAR

### Exportar a JSON
```javascript
// Click en "📤 Export"
// Genera archivo: flujo-ventas.json
{
    "name": "Flujo Ventas",
    "nodes": [...],
    "edges": [...],
    "metadata": {
        "version": "1.0",
        "created": "2025-01-04",
        "author": "Admin"
    }
}
```

### Importar desde JSON
```javascript
// Click en "📥 Import"
// Selecciona archivo .json
// Flujo se carga automáticamente
```

---

## ✅ CONCLUSIÓN

**Tu Flow Editor tiene:**

✅ **Drag & Drop Visual** - Intuitivo y profesional  
✅ **4 Tipos de Nodos** - Message, Question, Action, Condition  
✅ **Conexiones Animadas** - Visual feedback en tiempo real  
✅ **MiniMap + Controls** - Navegación fácil  
✅ **Export/Import JSON** - Portabilidad total  
✅ **Panel de Propiedades** - Edición en tiempo real  
✅ **Estadísticas** - Métricas del flujo  

**Nivel:** 💎 **ENTERPRISE GRADE**

---

*Guía visual creada: 2025-01-04*  
*Estado: PERFECTO ✅*  
*Ready para diseñar flujos de millones* 💰
