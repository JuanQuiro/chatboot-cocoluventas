# 📊 Análisis Completo del Frontend - Cocolu Ventas

## 🏗️ Estructura General

El frontend está dividido en **2 frontends principales**:

### 1️⃣ **Frontend de Login** (`/login`)
- **Ruta**: `/login`
- **Componente**: `Login.jsx`
- **Tipo**: Página pública (sin protección)
- **Funcionalidad**: Autenticación de usuarios

### 2️⃣ **Frontend Principal** (`/`)
- **Ruta**: `/` (raíz)
- **Componente**: `AuthenticatedLayout`
- **Tipo**: Páginas protegidas (requieren autenticación)
- **Funcionalidad**: Dashboard, CRM, Analytics, etc.

---

## 🔐 Sistema de Autenticación

### Flujo de Autenticación

```
Usuario
  ↓
/login (Login.jsx)
  ↓
AuthContext.login() → authService.login()
  ↓
¿Desarrollo? → loginMock() (datos ficticios)
¿Producción? → login() (backend real)
  ↓
localStorage (token + user)
  ↓
PrivateRoute (protege rutas)
  ↓
AuthenticatedLayout (dashboard)
```

### Contextos Utilizados

| Contexto | Archivo | Responsabilidad |
|----------|---------|-----------------|
| **AuthContext** | `AuthContext.jsx` | Autenticación, roles, permisos |
| **ThemeContext** | `ThemeContext.jsx` | Temas (claro/oscuro) |
| **TypographyContext** | `TypographyContext.jsx` | Tipografía y fuentes |
| **TenantContext** | `TenantContext.jsx` | Multi-tenancy (cocolu, etc.) |

---

## 📄 Páginas del Dashboard (Frontend Principal)

### Rutas Disponibles

```
/ (raíz)
├── / → Dashboard (📊)
├── /sellers → Vendedores (👥)
├── /analytics → Analytics (📈)
├── /orders → Pedidos (🛒)
├── /products → Productos (📦)
├── /users → Usuarios (👥) [Requiere permiso users.view]
├── /roles → Roles (🎭) [Requiere permiso users.roles]
└── /bots → Bots (🤖) [Requiere permiso bots.view]
```

### Componentes de Páginas

| Página | Archivo | Componentes |
|--------|---------|-------------|
| Dashboard | `Dashboard.js` | Gráficos, métricas, KPIs |
| Sellers | `Sellers.jsx` | Tabla de vendedores, asignaciones |
| Analytics | `Analytics.js` | Gráficos avanzados, reportes |
| Orders | `Orders.jsx` | Gestión de pedidos |
| Products | `Products.jsx` | Catálogo de productos |
| Users | `Users.jsx` | Gestión de usuarios |
| Roles | `Roles.jsx` | Gestión de roles y permisos |
| Bots | `BotsWrapper.jsx` | Control de bots |

---

## 🔧 Servicios Utilizados

### Archivos de Servicios

```
src/services/
├── api.js              → Cliente HTTP (axios)
├── authService.js      → Autenticación
├── errorMonitor.js     → Monitoreo de errores
└── [otros servicios]
```

### API Service (`api.js`)

```javascript
// Configuración base
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3009/api';

// Interceptores:
// 1. Agrega token Authorization a todas las peticiones
// 2. Agrega X-Tenant-ID si existe
// 3. Maneja errores 401 (token expirado)
```

### Auth Service (`authService.js`)

**Métodos principales:**
- `login(email, password)` → Autenticación backend
- `loginMock(email, password)` → Autenticación mock (desarrollo)
- `logout()` → Cierre de sesión
- `getCurrentUser()` → Obtiene usuario actual
- `hasPermission(permission)` → Verifica permisos

**Credenciales Demo:**
```
Admin:
  Email: admin@cocolu.com
  Password: demo123 (cualquiera en desarrollo)

Seller:
  Email: seller@cocolu.com
  Password: demo123 (cualquiera en desarrollo)
```

---

## 🎨 Componentes Reutilizables

### Componentes de Autenticación

```
src/components/auth/
├── PrivateRoute.jsx    → Protege rutas autenticadas
├── Can.jsx             → Control de permisos (RBAC)
└── RoleBadge.jsx       → Muestra rol del usuario
```

### Componentes Globales

```
src/components/
├── ErrorBoundary.jsx      → Manejo de errores
├── RouteLogger.jsx        → Logging de rutas
├── LogViewer.jsx          → Visor de logs
├── ThemeSelector.jsx      → Selector de tema
├── FontSelector.jsx       → Selector de fuente
└── [otros componentes]
```

---

## 📱 Estructura de Carpetas

```
dashboard/src/
├── App.js                 ← Punto de entrada (rutas principales)
├── index.js               ← Inicialización React
├── pages/                 ← Páginas del dashboard
│   ├── Login.jsx          ← Página de login
│   ├── Dashboard.js       ← Dashboard principal
│   ├── Sellers.jsx
│   ├── Analytics.js
│   ├── Orders.jsx
│   ├── Products.jsx
│   ├── Users.jsx
│   ├── Roles.jsx
│   └── BotsWrapper.jsx
├── components/            ← Componentes reutilizables
│   ├── auth/              ← Componentes de autenticación
│   ├── ErrorBoundary.jsx
│   ├── RouteLogger.jsx
│   ├── LogViewer.jsx
│   └── [otros]
├── contexts/              ← Context API
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   ├── TypographyContext.jsx
│   └── TenantContext.jsx
├── services/              ← Servicios (API, auth, etc.)
│   ├── api.js
│   ├── authService.js
│   └── errorMonitor.js
├── hooks/                 ← Custom hooks
├── styles/                ← Estilos globales
└── lib/                   ← Librerías auxiliares
```

---

## 🔄 Flujo de Datos

### 1. Login Flow

```
Login.jsx
  ↓
useAuth().login(email, password)
  ↓
AuthContext.login()
  ↓
authService.login() o authService.loginMock()
  ↓
localStorage.setItem('token', token)
localStorage.setItem('user', user)
  ↓
navigate('/') → Dashboard
```

### 2. Dashboard Flow

```
App.js
  ↓
<PrivateRoute> (verifica autenticación)
  ↓
AuthenticatedLayout
  ↓
Navigation + Routes
  ↓
Páginas específicas (Dashboard, Sellers, etc.)
  ↓
Llamadas a API via apiClient
```

### 3. API Calls

```
Componente
  ↓
apiClient.get/post/put/delete()
  ↓
Interceptor: Agrega token + tenant
  ↓
Backend API (http://localhost:5000/api)
  ↓
Respuesta
  ↓
Componente actualiza estado
```

---

## 🛡️ Sistema de Permisos (RBAC)

### Permisos Disponibles (39 total)

```
Dashboard:
- dashboard.view
- dashboard.export

Usuarios:
- users.view, users.create, users.edit, users.delete
- users.invite, users.roles

Vendedores:
- sellers.view, sellers.create, sellers.edit, sellers.delete
- sellers.assign, sellers.stats

Productos:
- products.view, products.create, products.edit, products.delete

Pedidos:
- orders.view, orders.create, orders.edit, orders.cancel

Conversaciones:
- conversations.view, conversations.reply, conversations.assign

Analytics:
- analytics.view, analytics.advanced

Configuración:
- settings.view, settings.edit

Bots:
- bots.view, bots.create, bots.manage, bots.delete
- bots.send, bots.configure

Roles:
- roles.view, roles.create, roles.edit, roles.delete
```

### Uso de Permisos en Componentes

```jsx
// Mostrar elemento solo si tiene permiso
<Can permission="users.view">
  <Link to="/users">Usuarios</Link>
</Can>

// Verificar en lógica
const { hasPermission } = useAuth();
if (hasPermission('bots.create')) {
  // Mostrar botón crear bot
}
```

---

## 🌐 Variables de Entorno

### `.env.local` (Dashboard)

```env
REACT_APP_API_URL=http://localhost:5000/api
NODE_ENV=development
GENERATE_SOURCEMAP=false
```

### Comportamiento

- **Desarrollo** (`localhost`): Usa `loginMock()` automáticamente
- **Producción**: Intenta backend real, fallback a mock

---

## 🚀 Flujo Completo de Uso

### 1. Usuario accede a la app

```
http://localhost:5000/
  ↓
¿Autenticado? NO
  ↓
Redirige a /login
```

### 2. Usuario hace login

```
Ingresa: admin@cocolu.com / demo123
  ↓
Login.jsx → useAuth().login()
  ↓
authService.loginMock() (desarrollo)
  ↓
Guarda en localStorage
  ↓
Redirige a /
```

### 3. Usuario ve dashboard

```
/ (raíz)
  ↓
PrivateRoute (verifica token)
  ↓
AuthenticatedLayout
  ↓
Dashboard.js carga datos
  ↓
apiClient.get('/api/dashboard')
  ↓
Muestra gráficos y métricas
```

### 4. Usuario navega

```
Click en "Vendedores"
  ↓
Navigate a /sellers
  ↓
Sellers.jsx carga
  ↓
apiClient.get('/api/sellers')
  ↓
Muestra tabla de vendedores
```

---

## 📊 Tecnologías Utilizadas

### Frontend Stack

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18+ | Framework principal |
| React Router | 6+ | Enrutamiento |
| Axios | 1.x | Cliente HTTP |
| Tailwind CSS | 3+ | Estilos |
| Context API | - | Estado global |
| React Hooks | - | Lógica de componentes |

### Librerías Adicionales

- **Gráficos**: Recharts (Analytics)
- **Tablas**: Componentes custom
- **Validación**: Validación manual
- **Iconos**: Emojis + custom SVGs

---

## 🔧 Configuración Local

### Para desarrollo local

```bash
# 1. Instalar dependencias
cd production/dashboard
npm install

# 2. Crear .env.local
REACT_APP_API_URL=http://localhost:5000/api

# 3. Compilar
npm run build

# 4. Iniciar bot
cd ..
PORT=5001 API_PORT=5000 npm start

# 5. Acceder
http://localhost:5000
```

---

## 📝 Resumen

**El frontend tiene 2 partes:**

1. **Login** (`/login`)
   - Página pública
   - Autenticación simple
   - Credenciales demo para desarrollo

2. **Dashboard** (`/`)
   - Páginas protegidas
   - 8 secciones principales
   - Sistema RBAC con 39 permisos
   - Integración completa con API backend

**Flujo:**
- Login → localStorage → Dashboard → API calls → Datos

**Tecnologías:**
- React 18 + React Router + Axios + Tailwind + Context API

---

**Última actualización:** Nov 17, 2025
