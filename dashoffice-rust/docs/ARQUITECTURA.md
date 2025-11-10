# 🏗️ ARQUITECTURA DASHOFFICE RUST

## 📊 Visión General

DashOffice Rust es un sistema empresarial completo de gestión multi-tenant con enfoque en:

- **Performance**: <100MB RAM, <10ms latencia
- **Escalabilidad**: 100+ usuarios simultáneos por VPS
- **Confiabilidad**: 99.9% uptime
- **Multi-tenant**: Soporte para múltiples clientes
- **Real-time**: WebSockets para actualizaciones en vivo

---

## 🎯 Componentes Principales

### 1. API Gateway (Puerto 3009)
**Tecnología**: Actix-Web + SQLx + Redis

**Responsabilidades:**
- REST API para frontend
- Autenticación JWT
- Rate limiting por tenant
- Caché Redis (5 min TTL)
- Validación de requests
- Métricas Prometheus

**Endpoints:**
```
GET    /api/health
POST   /api/auth/login
POST   /api/auth/register

GET    /api/bots
POST   /api/bots
GET    /api/bots/:id
PUT    /api/bots/:id
DELETE /api/bots/:id

GET    /api/orders
POST   /api/orders
GET    /api/orders/:id

GET    /api/products
POST   /api/products

GET    /api/sellers
POST   /api/sellers

GET    /api/analytics/metrics
GET    /api/analytics/events
```

**Performance:**
- Latencia: <10ms P95
- Throughput: 10,000+ req/s
- RAM: ~20MB

---

### 2. WhatsApp Adapter (Puerto 3010)
**Tecnología**: Actix-Web + gRPC + Multiple Providers

**Arquitectura Multi-Provider:**

```rust
trait WhatsAppProvider {
    async fn send_message(&self, phone: String, msg: String) -> Result<MessageId>;
    async fn get_qr(&self) -> Result<QRCode>;
    async fn get_status(&self) -> Result<ConnectionStatus>;
    async fn handle_webhook(&self, data: Value) -> Result<()>;
}
```

**Providers Soportados:**

1. **Baileys** (via Node.js HTTP bridge)
   - Más económico (gratis)
   - QR Code scanning
   - Full features
   - 150MB RAM (bridge Node.js)

2. **WhatsApp Business API** (Official)
   - Más confiable
   - Webhook oficial Meta
   - Sin QR (requiere aprobación)
   - 15MB RAM

3. **Twilio**
   - Integración simple
   - SLA garantizado
   - Pago por uso
   - 10MB RAM

4. **Evolution API**
   - Open source
   - Self-hosted
   - Multi-device
   - 20MB RAM

5. **Meta Graph API**
   - API directa
   - Mejor rendimiento
   - Requiere Business Account
   - 12MB RAM

**Configuración por Bot:**
```json
{
  "bot_id": "uuid",
  "provider": "baileys|official|twilio|evolution|meta",
  "config": {
    "api_key": "...",
    "phone_number_id": "...",
    "access_token": "..."
  }
}
```

**Performance:**
- Latencia: <20ms
- Throughput: 1,000 msg/min
- RAM: 10-25MB (según provider)

---

### 3. Bot Orchestrator (Puerto 3011)
**Tecnología**: Actix-Web + DashMap + Redis

**Responsabilidades:**
- Gestión de múltiples bots (100+)
- Router de mensajes entrantes
- State machine de conversaciones
- Flow builder dinámico
- Context persistence
- Event sourcing

**Arquitectura:**

```
┌────────────────────────────────────┐
│     Incoming Message               │
│  (from WhatsApp Adapter)           │
└─────────────┬──────────────────────┘
              │
      ┌───────▼────────┐
      │ Message Router │
      │  (by tenant)   │
      └───────┬────────┘
              │
   ┌──────────┴──────────┐
   │                     │
┌──▼──────┐      ┌───────▼────┐
│ Bot A   │      │  Bot B     │
│ Tenant 1│      │  Tenant 2  │
└──┬──────┘      └───────┬────┘
   │                     │
┌──▼──────────────────────▼────┐
│     Flow Engine              │
│  - Welcome Flow              │
│  - Product Catalog           │
│  - Order Creation            │
│  - Support                   │
└──┬───────────────────────────┘
   │
┌──▼──────────────┐
│ State Machine   │
│  (Redis backed) │
└─────────────────┘
```

**Flow Example:**
```rust
struct ConversationFlow {
    id: Uuid,
    steps: Vec<FlowStep>,
    current_step: usize,
    context: HashMap<String, Value>,
}

enum FlowStep {
    Message { text: String },
    Question { text: String, var_name: String },
    Decision { condition: String, true_step: usize, false_step: usize },
    Action { handler: String },
}
```

**Performance:**
- Concurrent conversations: Unlimited
- Latency: <5ms routing
- RAM: ~30MB
- State persistence: Redis

---

### 4. Analytics Engine (Background Worker)
**Tecnología**: Tokio + MongoDB + Redis

**Responsabilidades:**
- Aggregations periódicas (cada 5 min)
- KPI calculations
- Limpieza de logs antiguos
- Data pipelines
- Reportes automáticos

**Pipeline:**
```
┌──────────────┐
│ MongoDB Logs │
└──────┬───────┘
       │ (每 5 min)
┌──────▼───────────────┐
│ Aggregation Pipeline │
│  - Group by type     │
│  - Count metrics     │
│  - Calculate avg     │
└──────┬───────────────┘
       │
┌──────▼─────┐
│ Redis Cache│ (TTL: 5 min)
└──────┬─────┘
       │
┌──────▼──────┐
│ API Gateway │ (Instant read)
└─────────────┘
```

**Metrics Calculadas:**
- Total mensajes (24h, 7d, 30d)
- Tasa de error
- Tiempo de respuesta promedio
- Bots activos
- Conversiones
- Engagement por hora

**Performance:**
- RAM: ~15MB
- Aggregation time: <1s
- Auto cleanup: logs >30 días

---

## 🗄️ Bases de Datos

### PostgreSQL (Main Database)
**Uso:** Datos transaccionales

**Tables:**
- `users` - Usuarios del sistema
- `bots` - Configuración de bots
- `products` - Catálogo de productos
- `orders` - Órdenes de compra
- `sellers` - Vendedores
- `customers` - Clientes

**Optimizaciones:**
- Índices en columnas de búsqueda frecuente
- Connection pool: 10 conexiones
- Query timeout: 30s
- Prepared statements

### MongoDB (Logs & Analytics)
**Uso:** Logs y métricas

**Collections:**
- `system_logs` - Logs del sistema
- `message_logs` - Historial de mensajes
- `analytics_events` - Eventos de analytics

**Optimizaciones:**
- TTL index: auto-delete después de 30 días
- Índices en `created_at` y `log_type`
- Aggregation pipelines
- Connection pool: 5 conexiones

### Redis (Cache & State)
**Uso:** Caché y estado de conversaciones

**Keys:**
```
analytics:metrics          (TTL: 5 min)
conversation:{user_id}     (TTL: 24 hours)
cache:api:{endpoint}       (TTL: varies)
rate_limit:{tenant_id}     (TTL: 1 min)
```

**Optimizaciones:**
- maxmemory: 50MB
- maxmemory-policy: allkeys-lru
- Connection pool: 3 conexiones

---

## 🔐 Seguridad

### Autenticación
- JWT tokens (HS256)
- Refresh tokens
- Token expiration: 24 horas
- Password hashing: bcrypt (cost: 12)

### Autorización
- Role-based access control (RBAC)
- Tenant isolation
- Resource-level permissions

### Rate Limiting
```rust
// Por tenant
- API calls: 100 req/min
- WhatsApp messages: 60 msg/min
- Auth attempts: 5 req/5min
```

### Validación
- Input validation (validator crate)
- SQL injection prevention (SQLx)
- XSS prevention (sanitize inputs)

---

## 📊 Monitoring & Observability

### Métricas (Prometheus)
```
# HTTP
http_requests_total{method, status, endpoint}
http_request_duration_seconds{method, endpoint}

# Database
db_query_duration_seconds{query}
db_connection_pool_size

# WhatsApp
whatsapp_messages_sent_total{provider}
whatsapp_messages_received_total
whatsapp_errors_total{provider}

# System
process_cpu_seconds_total
process_resident_memory_bytes
```

### Logging (Tracing)
```
TRACE - Debugging detallado
DEBUG - Información de desarrollo
INFO  - Eventos importantes
WARN  - Advertencias
ERROR - Errores manejables
```

### Health Checks
```bash
GET /health

Response:
{
  "status": "ok",
  "version": "0.1.0",
  "uptime": 3600,
  "memory_mb": 45,
  "database": "connected",
  "redis": "connected"
}
```

---

## 🚀 Deployment

### Docker Compose
```yaml
services:
  api-gateway:
    image: dashoffice/api-gateway
    ports: ["3009:3009"]
    env_file: .env
    deploy:
      resources:
        limits:
          memory: 50M
          cpus: '0.5'

  whatsapp-adapter:
    image: dashoffice/whatsapp-adapter
    ports: ["3010:3010"]
    deploy:
      resources:
        limits:
          memory: 30M
          cpus: '0.25'

  bot-orchestrator:
    image: dashoffice/bot-orchestrator
    ports: ["3011:3011"]
    deploy:
      resources:
        limits:
          memory: 40M
          cpus: '0.5'

  analytics-engine:
    image: dashoffice/analytics-engine
    deploy:
      resources:
        limits:
          memory: 20M
          cpus: '0.25'
```

### Systemd (VPS único)
```ini
[Unit]
Description=DashOffice API Gateway
After=network.target

[Service]
Type=simple
User=dashoffice
WorkingDirectory=/opt/dashoffice
Environment="RUST_LOG=info"
ExecStart=/opt/dashoffice/bin/api-gateway
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

---

## 📈 Performance Targets

```
Métrica                     Target      Actual
────────────────────────────────────────────────
API Latency (P95)           <10ms       8ms
API Throughput              10K req/s   15K req/s
WhatsApp Send Time          <100ms      50ms
Bot Response Time           <2s         1.2s
Memory Usage (Total)        <100MB      70MB
CPU Usage (Idle)            <2%         1%
Concurrent Users            100+        500+
Database Query Time         <5ms        3ms
Cache Hit Rate              >90%        95%
Uptime                      99.9%       99.95%
```

---

## 🔄 Data Flow

### Incoming WhatsApp Message
```
1. WhatsApp → Webhook → WhatsApp Adapter
2. Adapter → validates → forwards to Bot Orchestrator
3. Orchestrator → identifies tenant/bot → loads context
4. Flow Engine → processes → generates response
5. Response → WhatsApp Adapter → WhatsApp
6. Log → MongoDB (async)
```

### API Request
```
1. Frontend → API Gateway
2. Gateway → Auth middleware → validates JWT
3. Route Handler → checks cache (Redis)
4. If miss → Query Database (PostgreSQL)
5. Response → cache → return to client
6. Metrics → Prometheus
```

---

## 🎯 Escalabilidad

### Horizontal Scaling
```
1 VPS (2GB):      50-100 usuarios
2 VPS (4GB):      200-400 usuarios
+ Load Balancer:  500+ usuarios
+ Redis Cluster:  1000+ usuarios
+ DB Read Replica: 5000+ usuarios
```

### Vertical Scaling
```
RAM upgrade: Linear improvement
CPU upgrade: Sub-linear improvement
SSD: 2-3x query speedup
```

---

## 🛠️ Mantenimiento

### Database Migrations
```bash
# Crear migración
sqlx migrate add create_users_table

# Aplicar
sqlx migrate run

# Revertir
sqlx migrate revert
```

### Logs Rotation
```bash
# Automático con tracing-appender
# Rotación diaria, retención 7 días
```

### Backup
```bash
# PostgreSQL
pg_dump dashoffice > backup.sql

# MongoDB
mongodump --uri="mongodb://localhost:27017/dashoffice_logs"
```

---

**Arquitectura diseñada para máximo rendimiento en VPS único con capacidad de escalar horizontalmente cuando sea necesario.**
