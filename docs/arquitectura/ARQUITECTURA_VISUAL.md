# 🎨 ARQUITECTURA VISUAL - Guía Rápida

## Diagramas y Flujos de la Arquitectura Senior

---

## 🏗️ ARQUITECTURA DE CAPAS

```
┌────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                         │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Express API  │  │ BuilderBot   │  │  Dashboard   │        │
│  │  REST/HTTP   │  │   WhatsApp   │  │    React     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└──────────────────────────┬─────────────────────────────────────┘
                           │ HTTP/WebSocket/Events
┌──────────────────────────┴─────────────────────────────────────┐
│                    APPLICATION LAYER                           │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  CQRS Pattern                                          │   │
│  │                                                        │   │
│  │  Commands:           Queries:                         │   │
│  │  ┌─────────────┐     ┌─────────────┐                 │   │
│  │  │   Assign    │     │    Get      │                 │   │
│  │  │   Seller    │     │   Sellers   │                 │   │
│  │  └──────┬──────┘     └──────┬──────┘                 │   │
│  │         │                    │                         │   │
│  │         ▼                    ▼                         │   │
│  │  ┌─────────────┐     ┌─────────────┐                 │   │
│  │  │  Command    │     │   Query     │                 │   │
│  │  │  Handler    │     │  Handler    │                 │   │
│  │  └──────┬──────┘     └──────┬──────┘                 │   │
│  └─────────┼────────────────────┼────────────────────────┘   │
└────────────┼────────────────────┼────────────────────────────┘
             │                    │
┌────────────┴────────────────────┴────────────────────────────┐
│                       DOMAIN LAYER                            │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Entities   │  │    Value     │  │   Domain     │        │
│  │              │  │   Objects    │  │   Events     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Domain     │  │ Aggregates   │  │Specification │        │
│  │   Services   │  │     Root     │  │   Pattern    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└────────────────────────┬───────────────────────────────────────┘
                         │ Ports (Interfaces)
┌────────────────────────┴───────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                          │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Repositories │  │   Event Bus  │  │     ACL      │        │
│  │  (Adapters)  │  │  (Adapters)  │  │  BuilderBot  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Logger     │  │ Persistence  │  │   External   │        │
│  │              │  │              │  │   Services   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE UN COMMAND (Asignar Vendedor)

```
1. API Request
   │
   │  POST /api/v2/sellers/assign
   │  { userId: "123", userName: "Juan" }
   │
   ▼
2. Controller crea Command
   │
   │  new AssignSellerCommand(userId, userName)
   │  ├─ Validación automática
   │  └─ Genera correlationId
   │
   ▼
3. DI Container resuelve Handler
   │
   │  container.resolve('assignSellerHandler')
   │  ├─ Inyecta Repository
   │  ├─ Inyecta Domain Service
   │  └─ Inyecta Event Bus
   │
   ▼
4. Handler ejecuta Command
   │
   │  handler.handle(command)
   │  ├─ Logger: "Handling command..."
   │  ├─ ErrorHandler wrap
   │  └─ Business logic
   │
   ▼
5. Domain Service aplica lógica
   │
   │  assignmentService.assignSeller(sellers, criteria)
   │  ├─ Specifications filter
   │  │  ├─ ActiveSellerSpec
   │  │  ├─ AvailableSellerSpec
   │  │  └─ SpecialtySpec (if needed)
   │  │
   │  └─ Strategy pattern
   │     ├─ Round-Robin
   │     ├─ Least-Loaded
   │     └─ Highest-Rated
   │
   ▼
6. Repository actualiza estado
   │
   │  repository.update(sellerId, newData)
   │  └─ Persiste cambios
   │
   ▼
7. Domain Event publicado
   │
   │  new SellerAssignedEvent(userId, sellerId, ...)
   │  ├─ Event inmutable
   │  ├─ Con correlationId
   │  └─ Versionado (v1.0)
   │
   ▼
8. Event Bus distribuye
   │
   │  eventBus.publish('seller.assigned', event)
   │  ├─ Handler 1: Analytics
   │  ├─ Handler 2: Persistence
   │  ├─ Handler 3: Notifications (future)
   │  └─ Handler 4: Metrics (future)
   │
   ▼
9. Response al cliente
   │
   │  { success: true, seller: {...} }
   │  └─ HTTP 200
```

---

## 💉 DEPENDENCY INJECTION FLOW

```
Application Startup
        │
        ▼
┌─────────────────┐
│   bootstrap.js  │  Configura todas las dependencias
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│         DI Container Registration               │
│                                                 │
│  container.registerSingleton('eventBus', ...)  │
│  container.registerSingleton('logger', ...)    │
│  container.registerTransient('handler', ...)   │
│  ...                                           │
└────────┬────────────────────────────────────────┘
         │
         │  En cualquier momento...
         │
         ▼
┌─────────────────┐
│  Necesito un    │
│  servicio       │
└────────┬────────┘
         │
         ▼
   container.resolve('serviceName')
         │
         ├─ ¿Existe instancia (Singleton)? → Retorna
         ├─ ¿Es Transient? → Crea nueva
         └─ ¿Es Scoped? → Busca en scope
         │
         ▼
   Servicio con todas sus dependencias inyectadas
```

---

## 🎯 SPECIFICATION PATTERN EN ACCIÓN

```
Problema: Necesito vendedores activos, disponibles y premium

Solución Tradicional (❌):
────────────────────────────
sellers.filter(s => 
    s.active === true && 
    s.currentClients < s.maxClients &&
    s.specialty === 'premium' &&
    s.status !== 'offline'
)
// ❌ Código duplicado
// ❌ Difícil de testear
// ❌ No reutilizable


Solución con Specifications (✅):
──────────────────────────────────
const spec = new ActiveSellerSpecification()
    .and(new AvailableSellerSpecification())
    .and(new SpecialtySellerSpecification('premium'));

const sellers = allSellers.filter(s => spec.isSatisfiedBy(s));

// ✅ Reutilizable
// ✅ Testeable
// ✅ Legible
// ✅ Combinable
```

---

## 🛡️ ANTI-CORRUPTION LAYER (ACL)

```
┌─────────────────────────────────────────────────────────┐
│                   EXTERNAL SYSTEM                       │
│                   (BuilderBot)                          │
│                                                         │
│   Estructura propia, convenciones propias,             │
│   puede cambiar en cualquier momento                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 │  BuilderBot Context
                 │  { from, body, pushName, key, ... }
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│         ANTI-CORRUPTION LAYER (ACL)                     │
│              BuilderBotAdapter                          │
│                                                         │
│  translateIncomingMessage(builderBotCtx)               │
│  ├─ Extrae userId                                      │
│  ├─ Extrae userName                                    │
│  ├─ Extrae message                                     │
│  ├─ Genera timestamp                                   │
│  └─ Normaliza a modelo de dominio                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 │  Domain Message
                 │  { userId, userName, message, timestamp, ... }
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                DOMAIN LAYER (PURO)                      │
│                                                         │
│   Independiente de BuilderBot                          │
│   Modelos propios de negocio                           │
│   NO conoce la existencia de BuilderBot                │
└─────────────────────────────────────────────────────────┘

Beneficio: Si BuilderBot cambia o cambiamos de proveedor,
solo tocamos el ACL, el dominio permanece intacto.
```

---

## 📊 EVENT SOURCING BÁSICO

```
Eventos Guardados en Event Bus:
─────────────────────────────────

Event 1: ConversationStarted
{
    eventId: "evt_001",
    eventType: "ConversationStartedEvent",
    eventVersion: "1.0",
    aggregateId: "user_123",
    data: {
        userName: "Juan",
        platform: "whatsapp"
    },
    occurredOn: "2024-11-04T10:00:00Z",
    metadata: {
        correlationId: "corr_abc"
    }
}

Event 2: SellerAssigned
{
    eventId: "evt_002",
    eventType: "SellerAssignedEvent",
    eventVersion: "1.0",
    aggregateId: "user_123",
    data: {
        sellerId: "seller_001",
        sellerName: "Pedro"
    },
    occurredOn: "2024-11-04T10:00:05Z",
    metadata: {
        correlationId: "corr_abc",
        causationId: "evt_001"
    }
}

Event 3: MessageReceived
{
    eventId: "evt_003",
    eventType: "MessageReceivedEvent",
    eventVersion: "1.0",
    aggregateId: "user_123",
    data: {
        message: "Hola, quiero comprar",
        platform: "whatsapp"
    },
    occurredOn: "2024-11-04T10:00:10Z",
    metadata: {
        correlationId: "corr_abc",
        causationId: "evt_002"
    }
}

Replay: Reconstruir estado desde eventos
────────────────────────────────────────
userState = events
    .filter(e => e.aggregateId === "user_123")
    .reduce((state, event) => applyEvent(state, event), {});

// Resultado:
{
    userId: "user_123",
    userName: "Juan",
    assignedSeller: "seller_001",
    lastMessage: "Hola, quiero comprar",
    conversationStarted: "2024-11-04T10:00:00Z"
}
```

---

## 🎭 STRATEGY PATTERN PARA ASIGNACIÓN

```
Interface: Seller Assignment Strategy
──────────────────────────────────────

┌─────────────────────────────────────┐
│   SellerAssignmentService           │
│                                     │
│   assignSeller(sellers, criteria)   │
│          │                          │
│          ├─ Round-Robin             │
│          ├─ Least-Loaded            │
│          ├─ Highest-Rated           │
│          └─ Random                  │
└─────────────────────────────────────┘

Uso:
────
const service = new SellerAssignmentService('least-loaded');
const seller = service.assignSeller(sellers, { specialty: 'premium' });

// Cambiar estrategia en runtime
service.setStrategy('highest-rated');
const anotherSeller = service.assignSeller(sellers);

// ✅ Fácil agregar nuevas estrategias
// ✅ Fácil cambiar comportamiento
// ✅ Fácil testear cada estrategia
```

---

## 🔗 FLUJO COMPLETO INTEGRADO

```
1. Usuario en WhatsApp
   │
   │  "Hola, quiero comprar un producto"
   │
   ▼
2. BuilderBot recibe mensaje
   │
   ▼
3. Welcome Flow activado
   │
   ▼
4. ACL traduce mensaje
   │
   │  BuilderBotAdapter.translateIncomingMessage()
   │
   ▼
5. Event Bus: message.received
   │
   ▼
6. Analytics registra
   │
   ▼
7. Command: AssignSeller
   │
   │  new AssignSellerCommand(userId, userName)
   │
   ▼
8. Handler obtiene vendedores del Repository
   │
   │  repository.findActive()
   │
   ▼
9. Domain Service con Specifications
   │
   │  specs = Active AND Available AND Specialty
   │  sellers.filter(s => specs.isSatisfiedBy(s))
   │
   ▼
10. Strategy aplica (Least-Loaded)
    │
    │  return seller con menos carga
    │
    ▼
11. Repository actualiza
    │
    │  repository.update(sellerId, { currentClients++ })
    │
    ▼
12. Event: SellerAssigned
    │
    │  new SellerAssignedEvent(...)
    │
    ▼
13. Event Bus distribuye
    │
    ├─ Analytics actualiza stats
    ├─ Persistence guarda evento
    └─ (Futuro: enviar notificación)
    │
    ▼
14. Response al usuario
    │
    │  "Has sido asignado a Pedro"
    │
    ▼
15. BuilderBot envía mensaje
    │
    └─  Usuario recibe respuesta
```

---

## 📁 ORGANIZACIÓN DE ARCHIVOS POR CAPA

```
src/
│
├── core/                           ← ARQUITECTURA SENIOR
│   │
│   ├── di-container.js            ← IoC Container
│   ├── bootstrap.js               ← Configuración central
│   │
│   ├── ports/                     ← Interfaces (Contratos)
│   │   ├── ISellersRepository.js
│   │   ├── IEventBus.js
│   │   └── ILogger.js (future)
│   │
│   ├── adapters/                  ← Implementaciones
│   │   ├── InMemoryEventBus.js
│   │   ├── MongoSellersRepository.js (future)
│   │   └── BuilderBotAdapter.js
│   │
│   ├── domain/                    ← Lógica de negocio pura
│   │   ├── entities/
│   │   │   └── Seller.js
│   │   ├── value-objects/
│   │   │   └── SellerId.js
│   │   ├── events/
│   │   │   └── DomainEvent.js
│   │   ├── services/
│   │   │   └── SellerAssignmentService.js
│   │   └── specifications/
│   │       └── SellerSpecification.js
│   │
│   └── application/               ← Casos de uso
│       ├── commands/
│       │   └── AssignSellerCommand.js
│       ├── queries/
│       │   └── GetSellersQuery.js (future)
│       └── handlers/
│           └── AssignSellerHandler.js
│
├── utils/                          ← Utilities cross-cutting
│   ├── logger.js
│   ├── persistence.js
│   └── ...
│
├── services/                       ← Legacy services
├── flows/                          ← BuilderBot flows
└── api/                            ← REST API
```

---

## 🎯 DECISIONES DE DISEÑO

### ¿Por qué DI Container?
```
✅ Desacoplamiento total
✅ Testing fácil (inyectar mocks)
✅ Cambiar implementaciones sin tocar código
✅ Lifetime management (Singleton, Transient, Scoped)
```

### ¿Por qué Hexagonal Architecture?
```
✅ Dominio protegido de cambios externos
✅ Cambiar DB sin tocar lógica
✅ Testing sin infraestructura
✅ Puertos claros, contratos explícitos
```

### ¿Por qué Specifications?
```
✅ Queries complejas reutilizables
✅ Combinables con AND/OR/NOT
✅ Testeable individualmente
✅ Código autodocumentado
```

### ¿Por qué Domain Events?
```
✅ Auditoría completa
✅ Event Sourcing ready
✅ Desacoplamiento temporal
✅ Múltiples suscriptores sin cambiar emisor
```

### ¿Por qué CQRS?
```
✅ Optimización separada (lectura vs escritura)
✅ Escalabilidad independiente
✅ Validación explícita en Commands
✅ Logging y tracing facilitado
```

---

## 🏆 CONCLUSIÓN

**Sistema con arquitectura visual clara**:

- ✅ Capas bien definidas
- ✅ Flujos documentados
- ✅ Patrones implementados
- ✅ Decisiones justificadas
- ✅ Fácil onboarding

**Usa este documento** para:
- Entender rápidamente la arquitectura
- Explicar a nuevos developers
- Diseñar nuevas features
- Hacer code reviews

---

**🚀 Arquitectura Senior Visualizada**
