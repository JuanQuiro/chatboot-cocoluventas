# 🏗️ ARQUITECTURA COMPLETA - COCOLU VENTAS

## 🎯 Visión General

**Cocolu Ventas** es un sistema empresarial integrado que combina:
- **Bot WhatsApp** (BuilderBot + Meta API)
- **Dashboard React** (Frontend + UI/UX)
- **API REST** (Backend Node.js)
- **Base de Datos** (JSON + MongoDB)

Todo funciona como **UN SOLO SISTEMA COHESIVO**.

---

## 🔄 FLUJO COMPLETO DE LA APLICACIÓN

### 1️⃣ **USUARIO ACCEDE A LA APP**

```
Usuario abre navegador
  ↓
http://localhost:5000 (o https://cocolu.emberdrago.com en VPS)
  ↓
React App carga (App.js)
  ↓
¿Token en localStorage? 
  ├─ NO → Redirige a /login
  └─ SÍ → Va a Dashboard
```

### 2️⃣ **USUARIO HACE LOGIN**

```
/login (Login.jsx)
  ↓
Usuario ingresa: admin@cocolu.com / demo123
  ↓
Login.jsx → useAuth().login(email, password)
  ↓
AuthContext.login()
  ↓
¿localhost? → authService.loginMock() (desarrollo)
¿VPS? → authService.login() (backend real)
  ↓
Backend valida credenciales
  ↓
Responde: { token, user, permissions }
  ↓
localStorage.setItem('token', token)
localStorage.setItem('user', user)
  ↓
navigate('/') → Dashboard
```

### 3️⃣ **USUARIO VE DASHBOARD**

```
/ (raíz)
  ↓
PrivateRoute verifica token ✅
  ↓
AuthenticatedLayout carga
  ├─ Header: Logo, usuario, estado, logout
  ├─ Navigation: 8 links a secciones
  ├─ Main: Contenido dinámico
  └─ Footer: Copyright
  ↓
Dashboard.js carga
  ↓
apiClient.get('/api/dashboard')
  ↓
Interceptor agrega:
  • Authorization: Bearer {token}
  • X-Tenant-ID: cocolu
  ↓
Backend responde con datos
  ↓
Dashboard muestra gráficos, KPIs, métricas
```

### 4️⃣ **USUARIO NAVEGA POR SECCIONES**

```
Click en "Vendedores"
  ↓
navigate('/sellers')
  ↓
Sellers.jsx carga
  ↓
apiClient.get('/api/sellers')
  ↓
Interceptor agrega token + tenant
  ↓
Backend responde con lista de vendedores
  ↓
Sellers.jsx muestra tabla
  ↓
Usuario puede:
  • Ver vendedores (si tiene permiso sellers.view)
  • Crear vendedor (si tiene permiso sellers.create)
  • Editar vendedor (si tiene permiso sellers.edit)
  • Asignar clientes (si tiene permiso sellers.assign)
```

### 5️⃣ **BOT RECIBE MENSAJE DE WHATSAPP**

```
Cliente envía mensaje a WhatsApp
  ↓
Meta API recibe mensaje
  ↓
Meta API envía webhook a: https://cocolu.emberdrago.com/webhook
  ↓
app-integrated.js recibe POST /webhook
  ↓
Procesa mensaje con flujos
  ↓
¿Qué flujo activar?
  ├─ "hola" → flow_welcome_premium
  ├─ "catalogo" → flow_catálogo_premium
  ├─ "pedido" → flow_info_pedido
  ├─ "asesor" → flow_hablar_con_asesor
  └─ [otros 10 flujos]
  ↓
Flujo procesa lógica
  ↓
Bot responde al cliente
  ↓
Datos se guardan en:
  • database/db.json (local)
  • MongoDB (producción)
  ↓
Dashboard se actualiza en tiempo real
  • Nuevos mensajes
  • Nuevos clientes
  • Nuevos pedidos
```

### 6️⃣ **DASHBOARD MUESTRA DATOS DEL BOT**

```
Dashboard.js carga
  ↓
apiClient.get('/api/dashboard')
  ↓
Backend consulta:
  • Mensajes recientes
  • Clientes activos
  • Pedidos pendientes
  • Vendedores disponibles
  • Analytics
  ↓
Responde con datos
  ↓
Dashboard muestra:
  • Gráficos de mensajes
  • Tabla de clientes
  • Tabla de pedidos
  • Estadísticas de vendedores
  • KPIs en tiempo real
```

### 7️⃣ **USUARIO REALIZA ACCIÓN EN DASHBOARD**

```
Usuario hace click en "Asignar Vendedor"
  ↓
Modal abre
  ↓
Usuario selecciona vendedor
  ↓
Usuario hace click en "Asignar"
  ↓
apiClient.post('/api/sellers/assign', { clientId, sellerId })
  ↓
Interceptor agrega token + tenant
  ↓
Backend procesa asignación
  ↓
Backend actualiza database/db.json
  ↓
Backend responde: { success: true }
  ↓
Frontend actualiza UI
  ↓
Usuario ve confirmación
  ↓
Dashboard se actualiza automáticamente
```

---

## 🏛️ ARQUITECTURA EN CAPAS

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTACIÓN (Frontend)                  │
├─────────────────────────────────────────────────────────────┤
│ React Components (Login, Dashboard, Sellers, etc.)          │
│ Context API (Auth, Theme, Typography, Tenant)              │
│ React Router (Enrutamiento)                                 │
│ Tailwind CSS (Estilos)                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICIOS (Frontend)                     │
├─────────────────────────────────────────────────────────────┤
│ apiClient (axios + interceptores)                           │
│ authService (login, logout, permisos)                       │
│ errorMonitor (captura de errores)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API REST (Backend)                       │
├─────────────────────────────────────────────────────────────┤
│ Express.js                                                  │
│ Rutas: /api/dashboard, /api/sellers, /api/bots, etc.      │
│ Autenticación: JWT Token                                   │
│ Autorización: RBAC (39 permisos)                           │
│ Multi-tenancy: X-Tenant-ID                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BOT (BuilderBot)                         │
├─────────────────────────────────────────────────────────────┤
│ Servidor HTTP: Puerto 3008 (BuilderBot)                    │
│ Webhook: POST /webhook (recibe mensajes de Meta)           │
│ Flujos: 10 flujos de conversación                          │
│ Provider: Meta (WhatsApp Cloud API)                        │
│ Servicios: AlertsService, FlowManager, BotManager          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                            │
├─────────────────────────────────────────────────────────────┤
│ JSON: database/db.json (desarrollo local)                  │
│ MongoDB: (producción en VPS)                               │
│ Datos: Usuarios, clientes, pedidos, mensajes, flujos       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 INTEGRACIÓN ENTRE COMPONENTES

### **Frontend ↔ Backend**

```
Frontend (React)
  ↓
apiClient (axios)
  ↓
Interceptor 1: Agrega Authorization header
Interceptor 2: Agrega X-Tenant-ID header
  ↓
HTTP Request
  ↓
Backend (Express.js)
  ↓
Middleware: Verifica JWT token
Middleware: Verifica tenant
Middleware: Verifica permisos (RBAC)
  ↓
Ruta específica
  ↓
Consulta base de datos
  ↓
HTTP Response
  ↓
Frontend recibe datos
  ↓
React actualiza estado
  ↓
UI se re-renderiza
```

### **Bot ↔ Backend**

```
Meta API (WhatsApp)
  ↓
Envía webhook a: https://cocolu.emberdrago.com/webhook
  ↓
app-integrated.js recibe POST /webhook
  ↓
Procesa mensaje
  ↓
Activa flujo correspondiente
  ↓
Flujo procesa lógica
  ↓
Guarda datos en database/db.json
  ↓
Responde al cliente
  ↓
Backend API actualiza datos
  ↓
Frontend (Dashboard) consulta /api/dashboard
  ↓
Dashboard muestra datos actualizados
```

### **Dashboard ↔ Bot**

```
Usuario hace acción en Dashboard
  ↓
Frontend envía POST /api/bots/send
  ↓
Backend procesa
  ↓
Backend envía comando al bot
  ↓
Bot ejecuta comando
  ↓
Bot responde al cliente
  ↓
Bot guarda datos
  ↓
Backend actualiza database
  ↓
Frontend consulta datos
  ↓
Dashboard muestra resultado
```

---

## 🔐 SEGURIDAD INTEGRADA

### **Autenticación**

```
1. Usuario hace login
   ↓
2. Backend valida credenciales
   ↓
3. Backend genera JWT token
   ↓
4. Frontend guarda token en localStorage
   ↓
5. Frontend agrega token a cada request
   ↓
6. Backend verifica token en cada request
   ↓
7. ¿Token válido? → Procesa request
   ¿Token inválido? → Responde 401
```

### **Autorización (RBAC)**

```
1. Usuario hace request a /api/users
   ↓
2. Backend verifica token ✅
   ↓
3. Backend verifica permiso: users.view
   ↓
4. ¿Usuario tiene permiso? 
   ├─ SÍ → Retorna datos
   └─ NO → Responde 403 Forbidden
```

### **Multi-tenancy**

```
1. Frontend agrega header: X-Tenant-ID: cocolu
   ↓
2. Backend verifica tenant
   ↓
3. Backend filtra datos por tenant
   ↓
4. Backend retorna solo datos del tenant
   ↓
5. Otros tenants no ven datos de cocolu
```

---

## 📊 FLUJO DE DATOS EN TIEMPO REAL

### **Escenario: Cliente envía mensaje → Dashboard se actualiza**

```
PASO 1: Cliente envía mensaje
  Cliente: "Hola, quiero ver el catálogo"
  ↓
PASO 2: Meta API recibe mensaje
  Meta: Procesa mensaje
  ↓
PASO 3: Meta envía webhook
  POST https://cocolu.emberdrago.com/webhook
  Body: { from, message, timestamp }
  ↓
PASO 4: Bot recibe webhook
  app-integrated.js → POST /webhook
  ↓
PASO 5: Bot procesa mensaje
  • Identifica flujo: "catalogo" → flow_catálogo_premium
  • Ejecuta flujo
  • Genera respuesta
  ↓
PASO 6: Bot responde al cliente
  Meta API: Envía respuesta al cliente
  ↓
PASO 7: Bot guarda datos
  database/db.json:
    • Nuevo mensaje
    • Nuevo cliente (si es nuevo)
    • Nuevo evento
  ↓
PASO 8: Dashboard consulta datos
  Frontend: apiClient.get('/api/dashboard')
  ↓
PASO 9: Backend retorna datos
  Backend: Consulta database/db.json
  Responde: { messages, clients, events, stats }
  ↓
PASO 10: Dashboard muestra datos
  Frontend: React actualiza estado
  UI: Muestra nuevo mensaje, nuevo cliente, etc.
  ↓
RESULTADO: Usuario ve en Dashboard que llegó nuevo mensaje
```

---

## 🎯 CASOS DE USO INTEGRADOS

### **Caso 1: Nuevo Cliente → Asignación de Vendedor**

```
1. Cliente envía "Hola"
   ↓
2. Bot activa flow_welcome_premium
   ↓
3. Bot crea cliente en database
   ↓
4. Dashboard muestra nuevo cliente
   ↓
5. Usuario hace click en cliente
   ↓
6. Usuario asigna vendedor
   ↓
7. Frontend: POST /api/sellers/assign
   ↓
8. Backend: Actualiza database
   ↓
9. Bot notifica al vendedor
   ↓
10. Vendedor ve cliente asignado en Dashboard
```

### **Caso 2: Cliente Realiza Pedido → Analytics Actualiza**

```
1. Cliente: "Quiero 2 collares"
   ↓
2. Bot activa flow_catálogo_premium
   ↓
3. Bot registra pedido en database
   ↓
4. Dashboard muestra nuevo pedido
   ↓
5. Usuario confirma pedido
   ↓
6. Frontend: POST /api/orders/confirm
   ↓
7. Backend: Actualiza database
   ↓
8. Analytics recalcula:
   • Total de pedidos
   • Ingresos
   • Tasa de conversión
   ↓
9. Dashboard actualiza gráficos
```

### **Caso 3: Vendedor Responde Cliente → Bot Notifica**

```
1. Usuario en Dashboard ve mensaje del cliente
   ↓
2. Usuario hace click en "Responder"
   ↓
3. Usuario escribe respuesta
   ↓
4. Usuario hace click en "Enviar"
   ↓
5. Frontend: POST /api/conversations/reply
   ↓
6. Backend: Procesa respuesta
   ↓
7. Backend: Notifica al bot
   ↓
8. Bot: Envía respuesta al cliente
   ↓
9. Bot: Registra conversación en database
   ↓
10. Dashboard: Actualiza conversación
```

---

## 🚀 FLUJO DE DESPLIEGUE

### **Local (Desarrollo)**

```
npm install (en production/)
  ↓
npm install (en production/dashboard/)
  ↓
npm run build (en production/dashboard/)
  ↓
PORT=5001 API_PORT=5000 npm start
  ↓
Accede a http://localhost:5000
  ↓
Login: admin@cocolu.com / demo123
  ↓
Dashboard funciona con datos mock
  ↓
Bot escucha en http://localhost:5001/webhook
```

### **VPS (Producción)**

```
cd /opt/cocolu-bot
  ↓
podman-compose up -d
  ↓
Contenedor inicia
  ↓
Bot escucha en puerto 3008
  ↓
API escucha en puerto 3010
  ↓
Nginx proxy en puerto 443 (HTTPS)
  ↓
Accede a https://cocolu.emberdrago.com
  ↓
Login: admin@cocolu.com / password
  ↓
Dashboard funciona con datos reales
  ↓
Bot conectado a Meta API
  ↓
Webhook: https://cocolu.emberdrago.com/webhook
```

---

## 📈 FLUJO DE INFORMACIÓN

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO FINAL                            │
│              (Cliente WhatsApp)                             │
└─────────────────────────────────────────────────────────────┘
                            ↑↓
┌─────────────────────────────────────────────────────────────┐
│                    META API                                 │
│              (WhatsApp Cloud API)                           │
└─────────────────────────────────────────────────────────────┘
                            ↑↓
┌─────────────────────────────────────────────────────────────┐
│                    BOT (BuilderBot)                         │
│         (Procesa mensajes, ejecuta flujos)                 │
└─────────────────────────────────────────────────────────────┘
                            ↑↓
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                            │
│              (database/db.json)                             │
└─────────────────────────────────────────────────────────────┘
                            ↑↓
┌─────────────────────────────────────────────────────────────┐
│                    API REST                                 │
│              (Express.js Backend)                           │
└─────────────────────────────────────────────────────────────┘
                            ↑↓
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD                                │
│              (React Frontend)                               │
└─────────────────────────────────────────────────────────────┘
                            ↑↓
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO ADMIN                            │
│              (Vendedor/Gerente)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 CICLO COMPLETO

```
INICIO DEL DÍA
  ↓
1. Vendedor abre navegador
2. Accede a https://cocolu.emberdrago.com
3. Hace login (admin@cocolu.com / password)
4. Ve Dashboard con datos del día anterior
5. Ve clientes asignados
6. Ve pedidos pendientes
7. Ve mensajes sin responder
  ↓
DURANTE EL DÍA
  ↓
8. Clientes envían mensajes a WhatsApp
9. Bot recibe mensajes
10. Bot procesa con flujos
11. Bot responde automáticamente
12. Bot guarda datos en database
13. Dashboard se actualiza en tiempo real
14. Vendedor ve nuevos clientes
15. Vendedor ve nuevos pedidos
16. Vendedor responde desde Dashboard
17. Bot envía respuesta al cliente
  ↓
FIN DEL DÍA
  ↓
18. Vendedor ve Analytics
19. Vendedor ve reportes
20. Vendedor ve estadísticas
21. Vendedor hace logout
  ↓
NOCHE
  ↓
22. Bot sigue recibiendo mensajes
23. Bot responde automáticamente
24. Bot guarda datos
25. Dashboard actualiza datos para mañana
```

---

## ✨ SINERGIA TOTAL

**El sistema funciona como UN TODO INTEGRADO:**

- **Frontend** → Interfaz visual para usuarios
- **Backend** → Procesa datos y lógica
- **Bot** → Automatiza conversaciones
- **Base de Datos** → Almacena información
- **Seguridad** → Protege acceso
- **Multi-tenancy** → Aísla datos por tenant
- **RBAC** → Controla permisos
- **Tiempo Real** → Actualiza datos al instante

**Cada componente depende del otro:**
- Frontend sin Backend = No funciona
- Backend sin Bot = No hay datos
- Bot sin Database = No guarda información
- Dashboard sin Frontend = No se ve
- Todo sin Seguridad = Vulnerable

**RESULTADO: Sistema empresarial completo y funcional** 🚀

---

## 📋 CHECKLIST DE INTEGRACIÓN

- ✅ Frontend (React) conectado a Backend (Express)
- ✅ Backend conectado a Bot (BuilderBot)
- ✅ Bot conectado a Meta API (WhatsApp)
- ✅ Base de datos sincronizada
- ✅ Autenticación integrada (JWT)
- ✅ Autorización integrada (RBAC)
- ✅ Multi-tenancy integrado
- ✅ Interceptores de API configurados
- ✅ Flujos de datos bidireccionales
- ✅ Dashboard en tiempo real
- ✅ Webhook funcionando
- ✅ Despliegue local funcionando
- ✅ Despliegue en VPS funcionando

---

**COCOLU VENTAS = UN SISTEMA INTEGRADO Y COHESIVO** 🎯

**Última actualización:** Nov 17, 2025
