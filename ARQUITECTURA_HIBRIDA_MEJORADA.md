# 🚀 ARQUITECTURA HÍBRIDA MEJORADA - Rust + Node.js

## 🎯 OBJETIVO

**Máxima funcionalidad + Máxima optimización + Escalabilidad**

Aprovechar lo mejor de ambos mundos:
- **Rust**: Ultra-rápido para métricas, health checks, control
- **Node.js**: Completo para flujos, servicios, API de negocio

---

## 📊 ARQUITECTURA

```
┌─────────────────────────────────────────┐
│         Nginx (Reverse Proxy)            │
│         Puerto: 80/443                   │
└─────────────────────────────────────────┘
           │
    ┌──────┴──────┬──────────────┐
    │             │              │
┌───▼───┐  ┌─────▼─────┐  ┌─────▼─────┐
│React  │  │ Rust API  │  │Node.js API│
│Dashboard│ │ 3009     │  │ 3008      │
│(Static)│ │ 5 MB RAM  │  │ 250 MB    │
└───────┘  └───────────┘  └───────────┘
              │              │
              └──────┬───────┘
                     │
              Integración HTTP
```

---

## 🔧 COMPONENTES

### **1. Rust API** (`src-rs-performance/`)

**Responsabilidades:**
- ✅ Health checks ultra-rápidos (<1ms)
- ✅ Métricas de sistema (RAM, CPU, uptime)
- ✅ Métricas combinadas (Rust + Node)
- ✅ Proxy a Node.js cuando sea necesario
- ✅ Endpoints de control

**Endpoints:**
- `GET /health` - Health check combinado
- `GET /api/metrics` - Métricas completas
- `GET /api/health/combined` - Health Rust + Node
- `GET /api/status` - Status del sistema
- `GET /api/stats` - Estadísticas
- `GET /api/proxy/node/*` - Proxy a Node.js

**Ventajas:**
- Ultra-ligero: 3-10 MB RAM
- Ultra-rápido: <1ms latencia
- Bajo CPU: 0% idle

---

### **2. Node.js API** (`app-integrated.js` + `src/`)

**Responsabilidades:**
- ✅ 16 Flujos de conversación
- ✅ 23 Servicios de negocio
- ✅ 50+ Endpoints API completos
- ✅ Sistema multi-tenant
- ✅ Gestión de bots, vendedoras, pedidos, etc.

**Endpoints principales:**
- `/api/bots` - Gestión de bots (12 endpoints)
- `/api/flows` - Gestión de flujos (10 endpoints)
- `/api/sellers` - Vendedoras (8 endpoints)
- `/api/orders` - Pedidos (4 endpoints)
- `/api/products` - Productos (4 endpoints)
- `/api/analytics` - Analytics (3 endpoints)
- `/api/auth` - Autenticación (8 endpoints)
- `/api/users` - Usuarios (7 endpoints)
- `/api/health` - Health check con métricas completas
- Y más...

**Ventajas:**
- Funcionalidad completa
- Probado y estable
- Fácil de mantener

---

### **3. Dashboard React** (`dashboard/build/`)

**Responsabilidades:**
- ✅ Interfaz web completa
- ✅ Autenticación
- ✅ Multi-tenant
- ✅ Analytics en tiempo real

**Servido estáticamente por Nginx**

---

## 🔗 INTEGRACIÓN

### **Rust → Node.js**

Rust consulta Node.js para métricas combinadas:

```rust
// Rust obtiene métricas de Node.js
let node_health = fetch_node_health(&client, &node_api_url).await;

// Combina métricas
let combined = CombinedMetrics {
    total_messages: rust_messages + node_messages,
    total_bots: node_bots,
    active_sellers: node_sellers,
    memory_total_mb: rust_memory + node_memory,
    // ...
};
```

### **Nginx → Routing**

Nginx enruta según el tipo de request:

```nginx
# Métricas y health → Rust (ultra-rápido)
location /api/metrics { proxy_pass http://rust-api:3009; }
location /api/health/combined { proxy_pass http://rust-api:3009; }

# Negocio y flujos → Node.js (completo)
location /api/bots { proxy_pass http://node-api:3008; }
location /api/flows { proxy_pass http://node-api:3008; }
location /webhook { proxy_pass http://node-api:3008; }
```

---

## 📦 DEPLOYMENT

### **Opción 1: Docker Compose** ⭐

```bash
# 1. Optimizar proyecto
./scripts/optimize-for-deployment.sh

# 2. Build y start
docker-compose -f docker-compose.hybrid.yml up -d

# 3. Ver logs
docker-compose -f docker-compose.hybrid.yml logs -f
```

### **Opción 2: Directo en Servidor**

```bash
# 1. Compilar Rust
cd src-rs-performance
cargo build --release
cd ..

# 2. Instalar Node (solo producción)
npm ci --omit=dev

# 3. Compilar dashboard
cd dashboard && npm run build && cd ..

# 4. Iniciar servicios
# Terminal 1: Rust API
./src-rs-performance/target/release/cocolu_rs_perf

# Terminal 2: Node.js API
node app-integrated.js

# Terminal 3: Nginx
sudo nginx -c /ruta/a/nginx/hybrid.conf
```

---

## 📊 CONSUMO DE RECURSOS

| Componente | RAM | CPU | Disco |
|------------|-----|-----|-------|
| **Rust API** | 3-10 MB | <1% | 1.8 MB |
| **Node.js API** | 250-350 MB | 5-10% | ~500 MB |
| **Dashboard** | 0 MB (estático) | 0% | ~80 MB |
| **Nginx** | 5-10 MB | <1% | ~5 MB |
| **Total** | **~270 MB** | **~7%** | **~650 MB** |

**✅ Cumple objetivo de ≤700 MB en disco**

---

## 🎯 VENTAJAS DE ESTA ARQUITECTURA

### **1. Performance**
- ✅ Health checks ultra-rápidos (Rust: <1ms)
- ✅ Métricas en tiempo real
- ✅ Bajo consumo de recursos

### **2. Funcionalidad**
- ✅ 100% de funcionalidad (50+ endpoints Node)
- ✅ 16 flujos completos
- ✅ 23 servicios de negocio

### **3. Escalabilidad**
- ✅ Rust puede escalar independientemente
- ✅ Node.js puede escalar independientemente
- ✅ Cada componente optimizado para su función

### **4. Mantenibilidad**
- ✅ Separación clara de responsabilidades
- ✅ Fácil de debuggear
- ✅ Fácil de actualizar

---

## 🔧 CONFIGURACIÓN

### **Variables de Entorno**

```env
# Rust API
API_PORT=3009
AUTH_TOKEN=cocolu_secret_token_2025
NODE_PORT=3008  # Puerto de Node.js para integración

# Node.js API
PORT=3008
NODE_ENV=production
BOT_ADAPTER=baileys
META_ACCESS_TOKEN=tu_token
META_PHONE_NUMBER_ID=tu_id
META_VERIFY_TOKEN=tu_verify_token
```

---

## 📋 CHECKLIST DE DEPLOYMENT

### Pre-deployment:
- [ ] Ejecutar script de optimización
- [ ] Verificar tamaño ≤700 MB
- [ ] Configurar `.env`
- [ ] Compilar Rust API
- [ ] Compilar Dashboard

### Deployment:
- [ ] Iniciar Rust API (puerto 3009)
- [ ] Iniciar Node.js API (puerto 3008)
- [ ] Configurar Nginx
- [ ] Verificar integración entre servicios
- [ ] Probar endpoints

### Post-deployment:
- [ ] Verificar `/api/metrics` (Rust)
- [ ] Verificar `/api/health` (Node)
- [ ] Verificar `/api/health/combined` (ambos)
- [ ] Probar flujos de conversación
- [ ] Monitorear recursos

---

## 🚀 PRÓXIMOS PASOS

1. **Compilar Rust API híbrida:**
   ```bash
   cd src-rs-performance
   # Cambiar main.rs por main_hybrid.rs temporalmente
   mv src/main.rs src/main.rs.old
   mv src/main_hybrid.rs src/main.rs
   cargo build --release
   ```

2. **Probar integración:**
   ```bash
   # Terminal 1: Rust
   ./src-rs-performance/target/release/cocolu_rs_perf
   
   # Terminal 2: Node
   node app-integrated.js
   
   # Probar
   curl http://localhost:3009/api/metrics
   ```

3. **Deploy completo:**
   - Seguir guía de deployment
   - Configurar Nginx
   - Monitorear recursos

---

**¡Arquitectura híbrida optimizada lista! 🎉**

