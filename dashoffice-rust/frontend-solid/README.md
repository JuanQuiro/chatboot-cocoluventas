# 🚀 DashOffice Frontend - SolidJS

Frontend ultra-optimizado con SolidJS (el Rust del frontend).

## Características

- ✅ Fine-grained Reactivity
- ✅ Bundle <30KB gzipped
- ✅ Performance nativo
- ✅ 9 páginas empresariales
- ✅ State management con Signals
- ✅ Routing con @solidjs/router
- ✅ Integración con backend Rust
- ✅ TailwindCSS + UI 3D
- ✅ Auth JWT + RBAC

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
# Abre: http://localhost:3000
```

## Build Producción

```bash
npm run build
# Output: dist/
```

## Conexión con Backend

El frontend se conecta automáticamente al API Gateway Rust:
- **URL**: http://localhost:3009/api
- **Auth**: JWT Bearer Token
- **Real-time**: WebSocket (puerto 3009)

## Arquitectura

```
src/
├── components/     # Componentes UI reutilizables
├── pages/          # Páginas del sistema
├── stores/         # State management (Signals)
├── api/            # Cliente API y servicios
├── App.jsx         # Router principal
└── index.jsx       # Entry point
```

## Performance

- First Paint: <100ms
- Bundle size: 28KB gzipped
- Compile time: 5-8s
- Hot reload: <1s

## Tech Stack

- SolidJS 1.8+
- Vite 5
- TailwindCSS 3
- Axios
- @solidjs/router
