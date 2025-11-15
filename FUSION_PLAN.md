# 🔗 PLAN DE FUSIÓN - BOT RUST + DASHBOARD LEPTOS

## Estrategia

Crear un proyecto monolítico que combine:

1. **Backend Rust (Axum)** - Bot + API
2. **Frontend Leptos** - Dashboard SSR + WASM
3. **Integración** - WebSocket para real-time

---

## Estructura Final

```
cocolu-bot-final/
├── src/
│   ├── main.rs                 # Punto de entrada (Axum + Leptos)
│   ├── bot/                    # Lógica del bot
│   │   ├── meta.rs            # Meta Cloud API
│   │   ├── baileys.rs         # Baileys (opcional)
│   │   └── handlers.rs        # Handlers de mensajes
│   ├── api/                    # API REST
│   │   ├── auth.rs            # Autenticación
│   │   ├── messages.rs        # Endpoints de mensajes
│   │   ├── status.rs          # Status del bot
│   │   └── ws.rs              # WebSocket
│   ├── dashboard/              # Frontend Leptos
│   │   ├── components/        # Componentes
│   │   ├── pages/             # Páginas
│   │   └── app.rs             # App Leptos
│   └── lib.rs                 # Librería compartida
├── Cargo.toml                  # Configuración monolítica
└── Cargo.lock
```

---

## Pasos de Fusión

### 1. Crear Cargo.toml monolítico
- Combinar dependencias de Bot + Leptos
- Configurar features (ssr, hydrate, wasm)
- Optimizar para release

### 2. Integrar Backend
- Copiar lógica del bot actual
- Crear módulo `bot/`
- Crear módulo `api/`
- Crear módulo `ws/` para WebSocket

### 3. Integrar Frontend
- Copiar componentes Leptos
- Crear módulo `dashboard/`
- Conectar API Backend
- Configurar WebSocket

### 4. Compilar
- `cargo build --release --features ssr`
- Resultado: Binario monolítico

---

## Compilación

```bash
# Compilación única
cargo build --release --features "ssr,hydrate"

# Resultado:
# - Binario: target/release/cocolu_bot_final
# - Tamaño: ~5-10 MB
# - RAM: ~50-100 MB en runtime
```

---

## Despliegue

```bash
# En VPS:
./cocolu_bot_final

# Acceso:
# http://tu-dominio.com        # Dashboard
# http://tu-dominio.com/api    # API
# ws://tu-dominio.com/ws       # WebSocket
```

---

## Ventajas de Fusión

✅ Un solo binario  
✅ Un solo proceso  
✅ Compartir estado entre backend/frontend  
✅ WebSocket nativo  
✅ SSR + WASM  
✅ Ultra-optimizado  

---

**Tiempo estimado**: 60-90 minutos  
**Resultado**: Proyecto final listo para producción

