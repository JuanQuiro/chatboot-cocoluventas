# 🚀 Monolito Ultra-Performance en Rust (con puente Baileys)

Este módulo `src-rs-performance` implementa un monolito en Rust orientado a máxima velocidad y baja memoria. Se conecta a WhatsApp usando un puente Node (Baileys) por stdio.

## 🎯 Objetivos

- Máximo rendimiento en PC/servidores modestos
- Monolito con arquitectura limpia
- Conectividad WhatsApp completa (QR y Pairing Code)
- Loggers robustos (Rust `tracing`, bridge etiquetado)
- API HTTP minimalista (Axum) para control

## 📁 Estructura

```
src-rs-performance/
├── Cargo.toml
├── src/
│   └── main.rs              # Monolito Rust (API + orquestación)
└── bridge/
    ├── baileys-bridge.mjs   # Puente Node ESM hacia Baileys
    └── sessions-bridge/     # (auto) Credenciales WhatsApp
```

## ⚙️ Requisitos

- Rust 1.74+ (Gentoo o rustup)
- Node.js 20+ con npm
- Dependencia JS: `@whiskeysockets/baileys` (ya incluida en package.json raíz)

## 🧪 Endpoints

- GET `/health` → estado, uptime, memoria
- GET `/qr` → QR actual (si aplica)
- GET `/pairing` → código de vinculación (si aplica)
- POST `/send` → `{ "to": "+584244370180", "text": "Hola" }`

## 🧩 Variables de entorno

- `API_PORT` (default 3009)
- `USE_PAIRING_CODE` (true/false, default true)
- `PHONE_NUMBER` (default +584244370180)

## 🐧 Instalación en Gentoo

Opción 1 (Portage):
```bash
sudo emerge --sync
sudo emerge -av dev-lang/rust
```

Opción 2 (rustup):
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup default stable
```

## ▶️ Compilar y Ejecutar

Desde la raíz del repo (usa los scripts npm):
```bash
# Construir
npm run rs:build

# Ejecutar (con pairing-code y número por defecto)
npm run rs:run

# Personalizado
API_PORT=3010 USE_PAIRING_CODE=true PHONE_NUMBER=+584244370180 npm run rs:run
```

También puedes usar cargo directamente:
```bash
cargo run --manifest-path src-rs-performance/Cargo.toml
```

## 🧠 Diseño y Arquitectura

- Rust `axum` para API HTTP 1.1 sin overhead
- `tokio` multi-thread runtime
- Puente Node por `stdin/stdout` (JSON line-delimited)
- `tracing` con `EnvFilter` para controlar niveles (INFO/DEBUG)
- Estado compartido con `Arc<RwLock<...>>` (sin bloqueo excesivo)
- Resiliencia: si el bridge emite `error`, se loguea y la API sigue viva

## 🔒 Seguridad

- Sesiones de WhatsApp aisladas en `bridge/sessions-bridge/`
- `.env` en raíz (no se commitea)
- No se imprimen secretos en logs

## 🔍 Logs

- Rust: `RUST_LOG=info` (o `debug`) controla verbosidad
- Bridge: logs etiquetados `[bridge]` a STDERR (no interfieren con JSON de eventos)

## 🛠 Troubleshooting

- `baileys_not_installed`: ejecuta `npm install` en la raíz
- `connection_closed:xxx`: reintentar, revisar red o sesión
- `pairing_code_error`: confirmar formato E164 del número (`+584...`)

## 📌 Notas

- Este monolito prioriza rendimiento. El dashboard/UI puede apuntar a los mismos endpoints si se requiere.
- La compatibilidad con futuros providers oficiales (Meta/Twilio) se puede añadir con nuevos bridges.

---

Licencia: MIT (igual al proyecto)
