# 🚀 INSTALACIÓN Y USO - Arquitectura TypeScript

## Sistema con Clean Architecture implementada

---

## 📦 INSTALACIÓN

### 1. Instalar Dependencias

```bash
npm install
```

Esto instalará:
- NestJS framework
- TypeScript
- CQRS
- Testing tools (Jest)
- Todas las dependencias necesarias

### 2. Compilar TypeScript

```bash
npm run build
```

---

## 🎯 EJECUCIÓN

### Modo Desarrollo (con hot-reload)
```bash
npm run start:dev
```

### Modo Producción
```bash
npm run build
npm run start:prod
```

### Sistema Legacy (JavaScript actual)
```bash
npm run legacy:dev
```

---

## 🧪 TESTING

```bash
# Unit tests
npm test

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e
```

---

## 📡 API ENDPOINTS

### Sellers (Vendedores)

**GET /api/v1/sellers**
- Obtener todos los vendedores
- Query param: `?available=true` (solo disponibles)

**POST /api/v1/sellers/assign**
```json
{
  "userId": "user123",
  "specialty": "premium"
}
```

---

## 🏗️ ESTRUCTURA

```
src-ts/
├── domain/           # Lógica de negocio pura
├── application/      # Casos de uso (CQRS)
├── infrastructure/   # Implementaciones
└── presentation/     # API REST

# Sistema legacy (sigue funcionando)
src/
app.js
dashboard/
```

---

## 🔄 MIGRACIÓN GRADUAL

Ambos sistemas funcionan en paralelo:

1. **Sistema TypeScript**: Puerto 3000 (nuevo)
2. **Sistema JavaScript**: Puerto 3008 (legacy)

Puedes usar cualquiera de los dos.

---

## 📊 PROGRESO

Ver archivo `PROGRESO.md` para detalles completos.

Estado actual: **35% completado**
- ✅ Domain Layer (Sellers)
- ✅ Application Layer (CQRS básico)
- ✅ Infrastructure (Memory Repository)
- ✅ Presentation (REST Controller)
- 🚧 Otros módulos en progreso

---

**¿Dudas?** Ver `ARQUITECTURA_RESUMEN.md`
