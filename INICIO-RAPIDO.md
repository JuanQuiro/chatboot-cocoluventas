# ⚡ INICIO RÁPIDO - Sistema Híbrido

## 🚀 Levantar Todo el Sistema

```bash
./start-production.sh
```

Esto iniciará automáticamente:
- ✅ Node.js API (puerto 3008) - Flujos y servicios
- ✅ Rust API (puerto 3009) - Métricas y dashboard

## 🛑 Detener el Sistema

```bash
./stop-production.sh
```

O presiona `Ctrl+C` en la terminal.

## 📊 Acceder al Sistema

Una vez iniciado:

- **Dashboard Leptos**: http://localhost:3009/
- **Node.js Health**: http://localhost:3008/api/health
- **Rust Health**: http://localhost:3009/health
- **Métricas**: http://localhost:3009/api/health/combined

## 📝 Ver Logs

```bash
# Logs de Node.js
tail -f logs/node-api.log

# Logs de Rust
tail -f logs/rust-api.log

# Ambos
tail -f logs/*.log
```

## ✅ Verificar que Funciona

```bash
# Verificar procesos
ps aux | grep -E "cocolu_rs_perf|app-integrated"

# Probar endpoints
curl http://localhost:3009/health
curl http://localhost:3008/api/health
```

---

**¡Listo para probar! 🎉**
