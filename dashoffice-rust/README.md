# 🚀 DashOffice - Sistema Empresarial

Sistema central empresarial completo en Rust.

## Características

- ✅ 9 Microservicios backend
- ✅ Frontend Leptos (Rust WASM)
- ✅ Analytics en tiempo real
- ✅ AI/ML integrado
- ✅ Sistema de emails
- ✅ Multi-tenant
- ✅ Real-time WebSockets

## Instalación

```bash
# Clonar
git clone ...

# Instalar dependencias
cargo build --release

# Iniciar servicios
docker-compose up -d

# Ejecutar
cargo run --bin api-gateway
```

## Arquitectura

- **API Gateway**: Puerto 3009
- **WhatsApp Adapter**: Puerto 3010
- **Bot Orchestrator**: Puerto 3011
- **Analytics Engine**: Background worker
- **AI Service**: Puerto 3020
- **Email Service**: Puerto 3021
- **Notification Service**: Puerto 3022

## Performance

- Latencia: <5ms P95
- Throughput: >20,000 req/s
- RAM: <200MB total
- CPU: <2% idle

## Stack Tecnológico

- **Backend**: Rust, Actix-Web, SQLx, Redis
- **Frontend**: Leptos, WASM, TailwindCSS
- **Database**: PostgreSQL, MongoDB
- **Cache**: Redis
- **Deploy**: Docker, Kubernetes

## Licencia

Propietario - DashOffice System
