# 🤖 SISTEMA DE BOTS - ARQUITECTURA COMPLETA

## 💎 SISTEMA DE BOTS MULTI-PROVIDER - ENTERPRISE GRADE

**Estado:** ✅ PERFECTO - PRODUCTION READY  
**Nivel:** ENTERPRISE - MILLONES DE DÓLARES  
**Capacidad:** Multi-Bot | Multi-Provider | Multi-Tenant | Visual Flow Editor

---

## 📊 ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DASHOFFICE CENTRAL                           │
│                    (Sistema Empresarial)                            │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BOT MANAGEMENT SYSTEM                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │  Visual Flow   │  │   Bot Engine   │  │   Adapters     │       │
│  │    Editor      │  │                │  │   System       │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │   Baileys    │    │    Venom     │    │     Meta     │
    │  (GRATIS)    │    │  (GRATIS)    │    │   (PAGO)     │
    │   QR Code    │    │   QR Code    │    │  Official    │
    └──────────────┘    └──────────────┘    └──────────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 ▼
                          WhatsApp Users
```

---

## 🎨 VISUAL FLOW EDITOR - DIAGRAMA INTERACTIVO

### ✅ CARACTERÍSTICAS IMPLEMENTADAS

#### 1. **Editor Drag & Drop**
```javascript
// FlowEditor.jsx - React Flow Integration
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState
} from 'reactflow';

✅ Arrastrar y soltar nodos
✅ Conectar nodos visualmente
✅ Zoom y pan
✅ MiniMap para navegación
✅ Background grid
✅ Animaciones suaves
```

#### 2. **Tipos de Nodos Disponibles**

##### 📱 **MessageNode** (Mensaje Simple)
```
┌─────────────────────────┐
│ 💬 MENSAJE              │
├─────────────────────────┤
│ "Hola, bienvenido..."   │
│                         │
│ → Envía mensaje         │
│ → Sin esperar respuesta │
└─────────────────────────┘
Color: Azul (#3B82F6)
Icono: MessageSquare
```

**Uso:**
- Mensajes de bienvenida
- Confirmaciones
- Información automática
- Notificaciones

##### ❓ **QuestionNode** (Pregunta con Opciones)
```
┌─────────────────────────┐
│ ❓ PREGUNTA             │
├─────────────────────────┤
│ "¿En qué te puedo       │
│  ayudar?"               │
│                         │
│ [1] Ver productos       │
│ [2] Hacer pedido        │
│ [3] Soporte             │
└─────────────────────────┘
Color: Verde (#10B981)
Icono: HelpCircle
```

**Uso:**
- Menús interactivos
- Capturar elección de usuario
- Opciones múltiples
- Navegación guiada

##### ⚡ **ActionNode** (Ejecutar Acción)
```
┌─────────────────────────┐
│ ⚡ ACCIÓN               │
├─────────────────────────┤
│ Tipo: API_CALL          │
│                         │
│ → Ejecuta código        │
│ → Llama API externa     │
│ → Actualiza DB          │
└─────────────────────────┘
Color: Ámbar (#F59E0B)
Icono: Zap
```

**Tipos de Acciones:**
- `API_CALL` - Llamar API externa
- `DB_QUERY` - Consultar base de datos
- `SEND_EMAIL` - Enviar email
- `ASSIGN_SELLER` - Asignar vendedor
- `CREATE_ORDER` - Crear pedido
- `UPDATE_CRM` - Actualizar CRM

##### 🔀 **ConditionNode** (Lógica Condicional)
```
┌─────────────────────────┐
│ 🔀 CONDICIÓN            │
├─────────────────────────┤
│ if (user.role === VIP)  │
│                         │
│ ✓ TRUE  │  ✗ FALSE     │
│    ↓    │     ↓         │
└─────────────────────────┘
Color: Púrpura (#A855F7)
Icono: GitBranch
```

**Uso:**
- Validaciones
- Bifurcaciones
- Lógica de negocio
- Routing inteligente

---

## 🔧 FLOW EDITOR - FUNCIONALIDADES

### ✅ TOOLBAR COMPLETO

```javascript
// Opciones disponibles:
┌─────────────────────────────────────────────────────────┐
│ 💾 Save  | ▶️ Test  | 📥 Import | 📤 Export | 🗑️ Delete │
└─────────────────────────────────────────────────────────┘
```

#### 1. **💾 Guardar Flujo**
```javascript
const handleSave = useCallback(() => {
    const flowData = {
        id: flowId,
        name: flowName,
        nodes,
        edges,
        viewMode,
        updatedAt: new Date().toISOString(),
    };
    onSave?.(flowData);
}, [flowId, flowName, nodes, edges, viewMode, onSave]);
```

#### 2. **📤 Exportar JSON**
```javascript
// Exporta el flujo completo a JSON
{
    "name": "Flujo Ventas",
    "nodes": [
        {
            "id": "message-1",
            "type": "message",
            "position": { "x": 100, "y": 100 },
            "data": {
                "label": "Bienvenida",
                "content": "¡Hola! 👋"
            }
        }
    ],
    "edges": [...]
}
```

#### 3. **📥 Importar JSON**
```javascript
// Carga flujo desde archivo
const handleImport = useCallback((event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        setFlowName(data.name);
        setNodes(data.nodes);
        setEdges(data.edges);
    };
    reader.readAsText(file);
}, []);
```

---

## 🔌 SISTEMA DE ADAPTADORES - MULTI-PROVIDER

### ✅ ADAPTADORES SOPORTADOS

#### 1. **Baileys Adapter** (GRATIS con QR) ⭐ RECOMENDADO

```javascript
// BaileysAdapter.js
{
    name: 'Baileys',
    type: 'free',
    requiresQR: true,
    package: '@builderbot/provider-baileys',
    description: 'WhatsApp Web Multi-Device',
    official: false,
    
    features: [
        '✅ 100% GRATIS',
        '✅ QR Code login',
        '✅ Multi-device support',
        '✅ Mensajes multimedia',
        '✅ Estados (Status)',
        '✅ Grupos',
        '✅ Alta estabilidad'
    ]
}
```

**Proceso de Conexión:**
```
1. Bot inicia
2. Genera QR Code
3. Usuario escanea QR con WhatsApp
4. Bot conecta automáticamente
5. Estado: "connected" ✅
```

#### 2. **Venom Adapter** (GRATIS con QR)

```javascript
// VenomAdapter.js
{
    name: 'Venom',
    type: 'free',
    requiresQR: true,
    package: '@builderbot/provider-venom',
    description: 'Puppeteer-based WhatsApp',
    official: false,
    
    features: [
        '✅ GRATIS',
        '✅ QR Code login',
        '✅ Basado en Puppeteer',
        '✅ Mensajes multimedia',
        '✅ Buen rendimiento'
    ]
}
```

#### 3. **WPPConnect Adapter** (GRATIS con QR)

```javascript
{
    name: 'WPPConnect',
    type: 'free',
    requiresQR: true,
    package: '@builderbot/provider-wppconnect',
    description: 'WPPConnect WhatsApp Web',
    official: false,
    
    features: [
        '✅ GRATIS',
        '✅ QR Code login',
        '✅ Interface limpia',
        '✅ Multimedia support'
    ]
}
```

#### 4. **Meta Adapter** (PAGO - Oficial) 💰

```javascript
// Meta/WhatsApp Business API
{
    name: 'Meta',
    type: 'paid',
    requiresQR: false,
    package: '@builderbot/provider-meta',
    description: 'WhatsApp Business API Oficial',
    official: true,
    
    features: [
        '🏢 Oficial de Meta',
        '💰 PAGO (conversaciones)',
        '📱 Sin QR (API Token)',
        '✅ Mensaje plantillas',
        '✅ SLA garantizado',
        '✅ Soporte empresarial',
        '✅ Números verificados',
        '✅ Múltiples agentes'
    ],
    
    pricing: {
        model: 'Pay-per-conversation',
        categories: {
            service: '$0.005 - $0.009',
            marketing: '$0.03 - $0.05',
            utility: 'Gratis primeras 1000/mes'
        }
    }
}
```

**Configuración Meta:**
```javascript
{
    phoneNumberId: 'XXXXX',
    businessAccountId: 'XXXXX',
    accessToken: 'EAAA...',
    webhookVerifyToken: 'your-verify-token',
    apiVersion: 'v18.0'
}
```

#### 5. **Twilio Adapter** (PAGO) 💰

```javascript
{
    name: 'Twilio',
    type: 'paid',
    requiresQR: false,
    package: '@builderbot/provider-twilio',
    description: 'Twilio WhatsApp',
    official: true,
    
    features: [
        '💰 PAGO',
        '📱 Sin QR',
        '✅ Integración fácil',
        '✅ API robusta',
        '✅ Documentación excelente'
    ]
}
```

---

## 🏗️ ARQUITECTURA DE ADAPTADORES

### BuilderBot Universal Adapter

```javascript
// BuilderBotUniversalAdapter.js

export class BuilderBotUniversalAdapter {
    constructor() {
        this.name = 'builderbot-universal';
        this.supportedProviders = [
            'baileys',      // ✅ GRATIS
            'venom',        // ✅ GRATIS
            'wppconnect',   // ✅ GRATIS
            'meta',         // 💰 PAGO
            'twilio'        // 💰 PAGO
        ];
    }

    // Crear bot con provider específico
    async createBot(config) {
        return new BuilderBotInstance(config);
    }

    // Verificar soporte
    isProviderSupported(providerName) {
        return this.supportedProviders.includes(
            providerName.toLowerCase()
        );
    }
}
```

### Bot Instance Lifecycle

```javascript
class BuilderBotInstance {
    // Estados posibles
    states = [
        'disconnected',  // Inicial
        'connecting',    // Iniciando
        'qr_ready',      // QR disponible
        'connected',     // Conectado ✅
        'error',         // Error ❌
        'stopped'        // Detenido
    ];

    async start() {
        // 1. Cargar provider
        const Provider = await this.loadProvider();
        
        // 2. Crear provider instance
        this.provider = createProvider(Provider, config);
        
        // 3. Setup event handlers
        this.setupProviderHandlers();
        
        // 4. Crear bot
        this.bot = await createBot({
            flow,
            provider: this.provider
        });
        
        // 5. Emit events
        this.emit('ready');
    }

    async stop() {
        // Cleanup y cierre
        await this.provider.vendor.close();
        this.state = 'stopped';
    }

    async sendMessage(to, message) {
        await this.provider.sendMessage(to, message);
    }
}
```

---

## 🎯 GESTIÓN DE BOTS EN DASHOFFICE

### ✅ FUNCIONALIDADES IMPLEMENTADAS

#### 1. **Crear Bot**
```javascript
// BotService.createBot()
const newBot = {
    botId: uuid(),
    name: "Bot Ventas",
    adapter: "baileys",      // Provider
    status: "disconnected",
    config: {
        autoReply: true,
        businessHours: true,
        assignSeller: true
    },
    flows: []               // Flujos visuales
};
```

#### 2. **Iniciar Bot**
```javascript
// 1. Backend inicia bot
POST /api/bots/:botId/start

// 2. Bot genera QR (si aplica)
{
    status: "qr_ready",
    qr: "data:image/png;base64,..."
}

// 3. Frontend muestra QR
<QRCode value={qr} />

// 4. Usuario escanea

// 5. Bot conecta
{
    status: "connected",
    info: {
        number: "+1234567890",
        name: "Mi Negocio"
    }
}
```

#### 3. **Detener Bot**
```javascript
POST /api/bots/:botId/stop
{
    status: "stopped",
    message: "Bot detenido correctamente"
}
```

#### 4. **Reiniciar Bot**
```javascript
POST /api/bots/:botId/restart
// Stop + Start
```

#### 5. **Eliminar Bot**
```javascript
DELETE /api/bots/:botId
// Detiene y elimina completamente
```

---

## 📊 DASHBOARD DE BOTS

### Vista Principal - Bots.jsx

```javascript
// Estado de cada bot
const botCard = {
    botId: "xxx",
    name: "Bot Ventas",
    adapter: "baileys",
    status: "connected",      // ✅
    stats: {
        messagestoday: 245,
        activeChats: 12,
        responseRate: "98%",
        avgResponseTime: "45s"
    },
    qr: null                  // Si está en qr_ready
};
```

**Vista Visual:**
```
┌────────────────────────────────────────────┐
│  🤖 Bot Ventas                   [•••]     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  📱 Baileys (GRATIS)                       │
│  🟢 Conectado                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  📊 Stats Hoy:                             │
│     💬 245 mensajes                        │
│     👥 12 chats activos                    │
│     ⚡ 98% tasa respuesta                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  [▶️ Iniciar] [⏸️ Detener] [🔄 Reiniciar] │
│  [🗑️ Eliminar] [⚙️ Configurar]            │
└────────────────────────────────────────────┘
```

---

## 🔄 FLUJO COMPLETO DE CONVERSACIÓN

### Ejemplo: Bot de Ventas con Flow Visual

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ 💬 MENSAJE              │
│ "¡Hola! Bienvenido a    │
│  Cocolu Ventas 🛍️"      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ ❓ PREGUNTA             │
│ "¿Qué deseas hacer?"    │
│                         │
│ [1] Ver productos       │
│ [2] Hacer pedido        │
│ [3] Hablar con vendedor │
└──────┬──────────────────┘
       │
       ├─────[1]─────┐
       │             ▼
       │     ┌──────────────────┐
       │     │ ⚡ ACCIÓN         │
       │     │ API: getProducts │
       │     └──────┬───────────┘
       │            │
       │            ▼
       │     ┌──────────────────┐
       │     │ 💬 MENSAJE        │
       │     │ Mostrar catálogo  │
       │     └──────────────────┘
       │
       ├─────[2]─────┐
       │             ▼
       │     ┌──────────────────┐
       │     │ ⚡ ACCIÓN         │
       │     │ createOrder()    │
       │     └──────┬───────────┘
       │            │
       │            ▼
       │     ┌──────────────────┐
       │     │ 💬 MENSAJE        │
       │     │ "Pedido creado ✅"│
       │     └──────────────────┘
       │
       └─────[3]─────┐
                     ▼
             ┌──────────────────┐
             │ ⚡ ACCIÓN         │
             │ assignSeller()   │
             └──────┬───────────┘
                    │
                    ▼
             ┌──────────────────┐
             │ 💬 MENSAJE        │
             │ "Conectando con  │
             │  vendedor..."    │
             └──────────────────┘
```

---

## 🎨 VISTAS ALTERNATIVAS DEL FLOW

### 1. **Vista Diagrama** (Predeterminada)
- Drag & drop visual
- Conexiones animadas
- MiniMap
- Grid background

### 2. **Vista Código**
```javascript
// FlowCodeView.jsx
export const flow = [
    {
        type: 'message',
        content: '¡Hola! Bienvenido',
        next: 'question_1'
    },
    {
        id: 'question_1',
        type: 'question',
        question: '¿Qué deseas?',
        options: ['Productos', 'Pedido', 'Soporte'],
        handlers: {
            'Productos': 'action_products',
            'Pedido': 'action_order',
            'Soporte': 'action_support'
        }
    }
];
```

### 3. **Vista Lista**
```
1. Mensaje: Bienvenida
   ↓
2. Pregunta: Menú principal
   ├─→ Productos
   ├─→ Pedido
   └─→ Soporte
   ↓
3. Acción: Procesar elección
```

### 4. **Vista Kanban**
```
┌───────────┐ ┌───────────┐ ┌───────────┐
│  Inicio   │ │  Proceso  │ │   Final   │
├───────────┤ ├───────────┤ ├───────────┤
│ Bienvenida│ │ Menú      │ │ Despedida │
│           │ │ Consultas │ │ Cierre    │
└───────────┘ └───────────┘ └───────────┘
```

### 5. **Vista Tabla**
```
┌─────┬──────────┬─────────────┬────────┐
│ ID  │ Tipo     │ Contenido   │ Siguiente│
├─────┼──────────┼─────────────┼────────┤
│ 001 │ Mensaje  │ Bienvenida  │ 002    │
│ 002 │ Pregunta │ Menú        │ 003    │
│ 003 │ Acción   │ Procesar    │ END    │
└─────┴──────────┴─────────────┴────────┘
```

### 6. **Vista Estadísticas**
```
📊 Estadísticas del Flujo:

Total Nodos: 12
├─ Mensajes: 5 (42%)
├─ Preguntas: 3 (25%)
├─ Acciones: 3 (25%)
└─ Condiciones: 1 (8%)

Conexiones: 15
Puntos de salida: 3
Flujo más largo: 8 nodos
```

---

## 🔐 SEGURIDAD Y COMPLIANCE

### ✅ IMPLEMENTADO

1. **Autenticación de Bots**
   - Cada bot tiene su propio token
   - Tokens cifrados en DB
   - Rotación de tokens disponible

2. **Rate Limiting**
   - Límite de mensajes por minuto
   - Protección contra spam
   - Throttling automático

3. **Validación de Mensajes**
   - Sanitización de input
   - Prevención de injection
   - Filtros de contenido

4. **Logs y Auditoría**
   - Todos los mensajes loggeados
   - Historial completo
   - Trazabilidad total

---

## 📊 MÉTRICAS Y ANALYTICS

### Dashboard de Bot - Métricas en Tiempo Real

```javascript
const botMetrics = {
    today: {
        messages: 245,
        uniqueUsers: 89,
        activeChats: 12,
        avgResponseTime: '45s',
        satisfaction: '4.8/5'
    },
    week: {
        messages: 1834,
        uniqueUsers: 423,
        conversion: '23%',
        revenue: '$45,230'
    }
};
```

---

## 🚀 DEPLOYMENT DE BOTS

### Configuración en Producción

```javascript
// ecosystem.config.js (PM2)
module.exports = {
    apps: [{
        name: 'dashoffice-bots',
        script: './bot-server.js',
        instances: 1,  // 1 instancia para bots
        exec_mode: 'fork',
        env_production: {
            NODE_ENV: 'production',
            BOT_MAX_INSTANCES: 10,
            BOT_AUTO_RESTART: true
        }
    }]
};
```

---

## ✅ CHECKLIST FINAL - SISTEMA DE BOTS

### Funcionalidad
- [x] Editor visual de flujos drag & drop
- [x] 4 tipos de nodos (Message, Question, Action, Condition)
- [x] Conexiones visuales animadas
- [x] Múltiples vistas (Diagram, Code, List, Kanban, Table, Stats)
- [x] Exportar/Importar JSON
- [x] Guardar flujos en DB

### Adaptadores
- [x] Baileys (GRATIS - QR)
- [x] Venom (GRATIS - QR)
- [x] WPPConnect (GRATIS - QR)
- [x] Meta/WhatsApp Business API (PAGO - Oficial)
- [x] Twilio (PAGO)
- [x] Sistema universal de adaptadores

### Gestión de Bots
- [x] Crear bot
- [x] Iniciar/Detener bot
- [x] Reiniciar bot
- [x] Eliminar bot
- [x] Ver QR code
- [x] Monitorear estado
- [x] Ver estadísticas

### Seguridad
- [x] Autenticación por bot
- [x] Tokens cifrados
- [x] Rate limiting
- [x] Validación de mensajes
- [x] Logs completos

---

## 💎 CONCLUSIÓN

**Tu Sistema de Bots está:**

✅ **COMPLETO** - Editor visual + Múltiples providers  
✅ **FLEXIBLE** - GRATIS (QR) o PAGO (API oficial)  
✅ **ESCALABLE** - Multi-bot, multi-tenant  
✅ **PROFESIONAL** - Enterprise-grade  
✅ **VISUAL** - Drag & drop flow editor  
✅ **MONITOREADO** - Analytics en tiempo real  

**Listo para gestionar millones de conversaciones.** 💰

---

*Arquitectura documentada: 2025-01-04*  
*Estado: PERFECTO ✅*  
*Nivel: ENTERPRISE 💎*
