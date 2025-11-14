# 🧪 Testing y Debugging del Monolito Rust

## 📋 Índice

1. [Compilación](#compilación)
2. [Ejecución](#ejecución)
3. [Testing Manual](#testing-manual)
4. [Debugging](#debugging)
5. [Troubleshooting](#troubleshooting)

---

## 🔨 Compilación

### Debug (rápido, sin optimizaciones)

```bash
cargo build --manifest-path src-rs-performance/Cargo.toml
# Binario: target/debug/cocolu_rs_perf
```

### Release (lento, optimizado)

```bash
cargo build --manifest-path src-rs-performance/Cargo.toml --release
# Binario: target/release/cocolu_rs_perf
```

### Con npm

```bash
npm run rs:build  # Release
```

---

## ▶️ Ejecución

### Básico

```bash
cargo run --manifest-path src-rs-performance/Cargo.toml --release
```

### Con npm

```bash
npm run rs:run
```

### Con variables de entorno

```bash
API_PORT=3010 \
USE_PAIRING_CODE=true \
PHONE_NUMBER=+584244370180 \
RUST_LOG=debug \
cargo run --manifest-path src-rs-performance/Cargo.toml --release
```

### Con logs detallados

```bash
RUST_LOG=trace cargo run --manifest-path src-rs-performance/Cargo.toml
```

---

## 🧪 Testing Manual

### 1. Health Check

```bash
curl http://localhost:3009/health | jq
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "uptime_secs": 5,
  "connected": false,
  "messages_received": 0,
  "messages_sent": 0,
  "has_qr": false,
  "has_pairing_code": false,
  "bridge_alive": true,
  "memory_mb": 8
}
```

### 2. Métricas

```bash
curl http://localhost:3009/metrics | jq
```

### 3. Status

```bash
curl http://localhost:3009/status | jq
```

### 4. QR Code

```bash
curl http://localhost:3009/qr | jq
```

**Respuesta si hay QR:**
```json
{
  "qr": "..."
}
```

**Respuesta si no hay QR:**
```
404 Not Found
```

### 5. Pairing Code

```bash
curl http://localhost:3009/pairing | jq
```

### 6. Enviar Mensaje

```bash
curl -X POST http://localhost:3009/send \
  -H "Content-Type: application/json" \
  -d '{"to": "+584244370180", "text": "Hola desde Rust"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "to": "+584244370180"
}
```

### 7. Configurar Adaptador

```bash
curl -X POST http://localhost:3009/config \
  -H "Content-Type: application/json" \
  -d '{"adapter": "baileys", "phone_number": "+584244370180"}'
```

---

## 🐛 Debugging

### Logs Detallados

```bash
RUST_LOG=debug cargo run --manifest-path src-rs-performance/Cargo.toml --release
```

**Salida esperada:**
```
2025-11-14T06:15:30.123Z INFO  cocolu_rs_perf: 🚀 Cocolu Bot - Rust Ultra-Performance Monolith v5.2.0
2025-11-14T06:15:30.124Z INFO  cocolu_rs_perf: 🌐 API listening on 0.0.0.0:3009
2025-11-14T06:15:30.125Z DEBUG cocolu_rs_perf: 🔗 Spawning bridge: "bridge/baileys-bridge.mjs"
2025-11-14T06:15:31.200Z INFO  cocolu_rs_perf: ✅ Bridge connected, waiting for events...
```

### Monitoreo de Memoria

```bash
watch -n 1 'ps aux | grep cocolu_rs_perf'
```

### Monitoreo de Conexiones

```bash
lsof -i :3009
```

### Trace Completo

```bash
RUST_LOG=trace cargo run --manifest-path src-rs-performance/Cargo.toml
```

---

## 🔧 Troubleshooting

### Error: "baileys_not_installed"

```bash
npm install @whiskeysockets/baileys
```

### Error: "bridge_not_found"

Verifica que exista `src-rs-performance/bridge/baileys-bridge.mjs`:

```bash
ls -la src-rs-performance/bridge/
```

### Error: "connection_closed"

El bridge se desconectó. Revisa:

1. Conexión a internet
2. Credenciales de WhatsApp (`bridge/sessions-bridge/`)
3. Logs del bridge (stderr)

### Compilación lenta

Usa caché de compilación:

```bash
cargo build --manifest-path src-rs-performance/Cargo.toml --release -j 4
```

### Memoria alta

Reduce límite Node:

```bash
NODE_OPTIONS="--max-old-space-size=128" cargo run --manifest-path src-rs-performance/Cargo.toml --release
```

### API no responde

Verifica que esté escuchando:

```bash
netstat -tlnp | grep 3009
```

---

## 📊 Benchmarks

### Startup Time

```bash
time cargo run --manifest-path src-rs-performance/Cargo.toml --release
```

**Esperado:** ~0.5 segundos

### Latencia API

```bash
for i in {1..100}; do
  curl -s http://localhost:3009/health > /dev/null
done
```

**Esperado:** 5-10ms por request

### Memoria

```bash
ps aux | grep cocolu_rs_perf | awk '{print $6}'
```

**Esperado:** 8-15 MB (Rust) + 256 MB (Node) = 264-271 MB

---

## 📝 Logs Esperados

### Startup Exitoso

```
🚀 Cocolu Bot - Rust Ultra-Performance Monolith v5.2.0
🌐 API listening on 0.0.0.0:3009
📊 Health: http://localhost:3009/health
📈 Metrics: http://localhost:3009/metrics
🔗 Spawning bridge: "bridge/baileys-bridge.mjs"
✅ Bridge connected, waiting for events...
```

### Conexión WhatsApp

```
✅ Bridge ready
📱 QR code received
```

O:

```
✅ Bridge ready
🔐 Pairing code received: 123-456-789
```

### Mensaje Recibido

```
📨 Message from +584244370180: Hola
```

### Mensaje Enviado

```
✉️  Message sent to +584244370180
```

---

## 🚀 Performance Tuning

### Aumentar Workers

```bash
TOKIO_WORKER_THREADS=8 cargo run --manifest-path src-rs-performance/Cargo.toml --release
```

### Reducir Logs

```bash
RUST_LOG=warn cargo run --manifest-path src-rs-performance/Cargo.toml --release
```

### Compilación Optimizada

```bash
RUSTFLAGS="-C target-cpu=native" cargo build --manifest-path src-rs-performance/Cargo.toml --release
```

---

**Versión:** 5.2.0  
**Última actualización:** 2025-11-14
