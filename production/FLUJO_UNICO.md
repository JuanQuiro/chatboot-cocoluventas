# 🎯 FLUJO ÚNICO Y UNIFICADO - COCOLU VENTAS

## 📋 Estructura de Rutas

### Flujo Claro y Único

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO NO AUTENTICADO                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Accede a cualquier URL                                    │
│  ├─ http://localhost:5000/                                 │
│  ├─ http://localhost:5000/dashboard                        │
│  ├─ http://localhost:5000/sellers                          │
│  └─ http://localhost:5000/cualquier-ruta                   │
│                                                             │
│  ↓ REDIRIGE A ↓                                             │
│                                                             │
│  http://localhost:5000/login                               │
│                                                             │
│  ✅ Formulario de login                                    │
│  ✅ Credenciales demo                                      │
│  ✅ Botones de acceso rápido                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   USUARIO HACE LOGIN                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Email: admin@cocolu.com                                   │
│  Password: demo123                                         │
│                                                             │
│  ↓ VALIDA ↓                                                │
│                                                             │
│  ✅ Credenciales correctas                                 │
│  ✅ Genera JWT token                                       │
│  ✅ Guarda en localStorage                                 │
│                                                             │
│  ↓ REDIRIGE A ↓                                             │
│                                                             │
│  http://localhost:5000/                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  USUARIO AUTENTICADO                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  http://localhost:5000/                                    │
│  ↓                                                          │
│  Muestra: Dashboard Principal                              │
│  ├─ Header: Logo, usuario, estado, logout                 │
│  ├─ Navigation: 8 links a secciones                        │
│  ├─ Main: Dashboard con KPIs                              │
│  └─ Footer: Copyright                                      │
│                                                             │
│  Rutas disponibles:                                         │
│  ├─ http://localhost:5000/          → Dashboard           │
│  ├─ http://localhost:5000/sellers   → Vendedores          │
│  ├─ http://localhost:5000/analytics → Analytics           │
│  ├─ http://localhost:5000/orders    → Pedidos             │
│  ├─ http://localhost:5000/products  → Productos           │
│  ├─ http://localhost:5000/users     → Usuarios (admin)    │
│  ├─ http://localhost:5000/roles     → Roles (admin)       │
│  └─ http://localhost:5000/bots      → Bots (admin)        │
│                                                             │
│  ✅ Todas las rutas dentro del mismo layout                │
│  ✅ Sin duplicados                                         │
│  ✅ Flujo único y claro                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  USUARIO HACE LOGOUT                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Click en "Cerrar Sesión"                                  │
│                                                             │
│  ↓ LIMPIA ↓                                                │
│                                                             │
│  ✅ Elimina token de localStorage                          │
│  ✅ Limpia estado de usuario                               │
│  ✅ Limpia permisos                                        │
│                                                             │
│  ↓ REDIRIGE A ↓                                             │
│                                                             │
│  http://localhost:5000/login                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo Técnico

### 1. App.js Carga

```javascript
function App() {
  const { isAuthenticated, loading } = useAuth();
  
  // Mientras carga, muestra spinner
  if (loading) return <LoadingSpinner />;
  
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<Login />} />
      
      {/* Ruta raíz */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
        }
      />
      
      {/* Todas las demás rutas */}
      <Route 
        path="/*" 
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}
```

### 2. Flujo de Autenticación

```
Usuario accede a http://localhost:5000/
  ↓
App.js verifica: ¿isAuthenticated?
  ├─ NO → Redirige a /login
  └─ SÍ → Muestra Dashboard
```

### 3. Flujo de Navegación

```
Usuario en Dashboard
  ↓
Click en "Vendedores"
  ↓
Navigate a /sellers
  ↓
App.js verifica: ¿isAuthenticated?
  ├─ NO → Redirige a /login
  └─ SÍ → Muestra Sellers dentro del mismo layout
```

---

## ✨ Características del Flujo Único

### ✅ No Hay Duplicados

```
❌ ANTES:
   http://localhost:5000/          → Dashboard
   http://localhost:5000/dashboard → Dashboard (duplicado)

✅ AHORA:
   http://localhost:5000/          → Dashboard (único)
```

### ✅ Flujo Claro

```
No autenticado → /login
Autenticado → / (dashboard)
Todas las rutas → Mismo layout
```

### ✅ Máxima Funcionalidad

```
• 8 secciones principales
• 39 permisos RBAC
• Temas personalizables
• Tipografía personalizable
• Visor de logs
• Error boundaries
• Loading states
```

### ✅ Protección de Rutas

```
Todas las rutas verifican autenticación:
├─ ¿Token válido? → Muestra contenido
└─ ¿Token inválido? → Redirige a /login
```

---

## 🎯 Rutas Disponibles

### Públicas (Sin autenticación)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/login` | Login.jsx | Formulario de autenticación |

### Protegidas (Con autenticación)

| Ruta | Componente | Descripción | Permisos |
|------|-----------|-------------|----------|
| `/` | Dashboard.js | Dashboard principal | dashboard.view |
| `/sellers` | Sellers.jsx | Gestión de vendedores | sellers.view |
| `/analytics` | Analytics.js | Analytics avanzado | analytics.view |
| `/orders` | Orders.jsx | Gestión de pedidos | orders.view |
| `/products` | Products.jsx | Catálogo de productos | products.view |
| `/users` | Users.jsx | Gestión de usuarios | users.view |
| `/roles` | Roles.jsx | Gestión de roles | users.roles |
| `/bots` | BotsWrapper.jsx | Control de bots | bots.view |

---

## 🔐 Seguridad del Flujo

### 1. Verificación de Autenticación

```javascript
// En App.js
if (!isAuthenticated) {
  return <Navigate to="/login" replace />;
}
```

### 2. Verificación de Permisos

```javascript
// En componentes
<Can permission="users.view">
  <Link to="/users">Usuarios</Link>
</Can>
```

### 3. Protección de Token

```javascript
// En apiClient
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO ACCEDE                           │
│              http://localhost:5000/X                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    App.js CARGA                             │
│         Verifica: ¿isAuthenticated?                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    ↓               ↓
            ❌ NO AUTENTICADO  ✅ AUTENTICADO
                    ↓               ↓
            ┌──────────────┐  ┌──────────────┐
            │ Redirige a   │  │ Muestra      │
            │ /login       │  │ Dashboard    │
            └──────────────┘  └──────────────┘
                    ↓               ↓
            ┌──────────────┐  ┌──────────────┐
            │ Login.jsx    │  │ AuthLayout   │
            │ • Formulario │  │ • Header     │
            │ • Demo creds │  │ • Nav        │
            │ • Validación │  │ • Main       │
            └──────────────┘  │ • Footer     │
                    ↓         └──────────────┘
            ┌──────────────┐         ↓
            │ Usuario hace │  ┌──────────────┐
            │ login        │  │ Usuario navega
            │              │  │ • /sellers
            └──────────────┘  │ • /analytics
                    ↓         │ • /orders
            ┌──────────────┐  │ • /products
            │ Guarda token │  │ • /users
            │ en localStorage
            └──────────────┘  │ • /roles
                    ↓         │ • /bots
            ┌──────────────┐  └──────────────┘
            │ Redirige a / │         ↓
            │ (dashboard)  │  ┌──────────────┐
            └──────────────┘  │ Verifica:
                    ↓         │ ¿Permiso?
            ┌──────────────┐  │ ¿Token?
            │ Muestra      │  └──────────────┘
            │ Dashboard    │         ↓
            └──────────────┘  ┌──────────────┐
                              │ Muestra
                              │ componente
                              └──────────────┘
```

---

## 🚀 Implementación

### Cambios Realizados

1. ✅ Agregado `isAuthenticated` y `loading` de `useAuth()`
2. ✅ Agregado loading spinner mientras se verifica autenticación
3. ✅ Ruta raíz `/` redirige a `/login` si no está autenticado
4. ✅ Ruta wildcard `/*` también verifica autenticación
5. ✅ Importado `Navigate` de react-router-dom
6. ✅ Recompilado dashboard

### Resultado

```
✅ Flujo único y claro
✅ Sin duplicados
✅ Máxima funcionalidad
✅ Protección de rutas
✅ Mejor UX
```

---

## 📝 Resumen

### Antes

```
❌ Múltiples rutas equivalentes
❌ Confusión de flujo
❌ Posibles duplicados
❌ UX confusa
```

### Ahora

```
✅ Flujo único: /login → / → Secciones
✅ Sin duplicados
✅ Máxima funcionalidad
✅ UX clara y consistente
✅ Protección de rutas
✅ Mejor experiencia de usuario
```

---

**Flujo completamente unificado y optimizado** 🎯

**Última actualización:** Nov 18, 2025
