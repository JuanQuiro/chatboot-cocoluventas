# 🚀 Sistema Híbrido Rust + Node.js - Producción

## 🎯 Adaptador Principal: Meta (WhatsApp Business API)

**El sistema está configurado para usar Meta como adaptador principal.**

Meta es la API oficial de WhatsApp Business y es la opción recomendada para producción:
- ✅ API oficial y estable
- ✅ Sin necesidad de QR codes
- ✅ Soporte empresarial
- ✅ Números verificados
- ✅ Escalable y confiable

Los otros adaptadores (Baileys, Venom, WPPConnect) son opcionales y solo se usan si cambias `BOT_ADAPTER` en `.env`.

## ⚡ Inicio Rápido

### **Levantar todo el sistema:**

```bash
./start-production.sh
```

Esto iniciará:
- ✅ Node.js API en puerto **3008** (flujos, servicios, lógica de negocio)
- ✅ Rust API en puerto **3009** (métricas, control, dashboard Leptos)

### **Detener el sistema:**

```bash
./stop-production.sh
```

O presiona `Ctrl+C` en la terminal donde está corriendo.

---

## 📊 Endpoints Disponibles

Una vez iniciado, puedes acceder a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Dashboard Leptos** | http://localhost:3009/ | Dashboard principal con métricas |
| **Rust Health** | http://localhost:3009/health | Health check Rust |
| **Node.js Health** | http://localhost:3008/api/health | Health check Node.js |
| **Métricas Combinadas** | http://localhost:3009/api/health/combined | Métricas Rust + Node.js |
| **Node.js API** | http://localhost:3008/api/* | Todos los endpoints de Node.js |

---

## 📝 Logs

Los logs se guardan en `./logs/`:

```bash
# Ver logs de Node.js
tail -f logs/node-api.log

# Ver logs de Rust
tail -f logs/rust-api.log

# Ver ambos
tail -f logs/*.log
```

---

## ⚙️ Configuración

### Variables de Entorno

Puedes configurar los puertos y otros parámetros:

```bash
# Cambiar puertos
NODE_PORT=3010 RUST_PORT=3011 ./start-production.sh

# Cambiar adaptador de bot
BOT_ADAPTER=meta ./start-production.sh

# Cambiar método de conexión
USE_PAIRING_CODE=false ./start-production.sh  # Usa QR code
```

### Variables disponibles:

- `NODE_PORT` - Puerto de Node.js (default: 3008)
- `RUST_PORT` - Puerto de Rust (default: 3009)
- `BOT_ADAPTER` - Adaptador: `meta` (default), `baileys`, `venom`, `wppconnect`, `twilio`
- `AUTH_TOKEN` - Token de autenticación para API Rust (default: cocolu_secret_token_2025)

### Variables de Meta (OBLIGATORIAS si usas Meta):

- `META_JWT_TOKEN` - Token JWT de Meta (Access Token) - **OBLIGATORIO**
- `META_NUMBER_ID` - ID del número de WhatsApp Business - **OBLIGATORIO**
- `META_VERIFY_TOKEN` - Token de verificación para webhooks - **OBLIGATORIO**
- `META_API_VERSION` - Versión de la API (default: v18.0)

**Nota**: Si no configuras las variables de Meta, el sistema iniciará pero el bot no funcionará. Copia `.env.example` a `.env` y configura tus credenciales.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│         Nginx (Opcional)                │
│         Reverse Proxy                    │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────┐    ┌────────▼──────┐
│ Rust API   │    │  Node.js API  │
│ :3009      │◄───┤  :3008        │
│            │    │               │
│ - Métricas │    │ - 16 Flujos   │
│ - Control  │    │ - 23 Servicios│
│ - Dashboard│    │ - Lógica      │
└────────────┘    └───────────────┘
```

**Rust API:**
- Métricas y monitoreo
- Dashboard Leptos
- Control del sistema
- Health checks

**Node.js API:**
- Todos los flujos de conversación
- Servicios de negocio
- Procesamiento de mensajes
- Base de datos

---

## 🔍 Verificación

### 1. Verificar que ambos servicios están corriendo:

```bash
# Ver procesos
ps aux | grep -E "cocolu_rs_perf|app-integrated"

# Verificar puertos
netstat -tuln | grep -E "3008|3009"
```

### 2. Probar endpoints:

```bash
# Health Rust
curl http://localhost:3009/health

# Health Node.js
curl http://localhost:3008/api/health

# Métricas combinadas
curl http://localhost:3009/api/health/combined
```

### 3. Ver dashboard:

Abre en el navegador: http://localhost:3009/

---

## 🐛 Troubleshooting

### **Node.js no inicia:**

```bash
# Ver logs
tail -f logs/node-api.log

# Verificar dependencias
npm install

# Verificar puerto
lsof -i :3008
```

### **Rust no inicia:**

```bash
# Ver logs
tail -f logs/rust-api.log

# Recompilar
cd src-rs-performance
cargo build --release
cd ..
```

### **Puerto en uso:**

```bash
# Matar proceso en puerto 3008
lsof -ti:3008 | xargs kill -9

# Matar proceso en puerto 3009
lsof -ti:3009 | xargs kill -9
```

### **Permisos:**

```bash
# Dar permisos de ejecución
chmod +x start-production.sh
chmod +x stop-production.sh
```

---

## 📦 Tamaños y Recursos

| Componente | Tamaño | RAM | CPU |
|------------|--------|-----|-----|
| **Rust Binary** | 4.1 MB | ~10 MB | 0-2% |
| **Node.js** | ~250 MB | ~250 MB | 1-5% |
| **Total** | ~254 MB | ~260 MB | 1-7% |

---

## ✅ Checklist de Producción

- [x] Rust API compilada en release
- [x] Node.js con dependencias instaladas
- [x] Logs configurados
- [x] Scripts de inicio/detención
- [x] Health checks funcionando
- [x] Integración Rust ↔ Node.js
- [x] Dashboard Leptos activo
- [x] Manejo de señales (Ctrl+C)
- [x] Limpieza de procesos

---

## 🎯 Próximos Pasos

1. **Configurar Nginx** como reverse proxy (opcional)
2. **Configurar PM2** para Node.js (opcional)
3. **Configurar systemd** para Rust (opcional)
4. **Monitoreo** con herramientas externas
5. **Backup** de base de datos

---

**¡Sistema listo para producción! 🚀**

