# 🚀 Chatbot Cocolu Ventas - Ember Drago Edition

## 🎯 Chatbot Profesional con Rotación de Vendedores & Dashboard Web

Desarrollado por **Ember Drago** - Agencia de Tecnología

---

## ✨ Características Premium

### 🤖 Sistema de Chatbot Inteligente
- ✅ **Rotación Automática de Vendedores** (Round-Robin)
- ✅ **5 Vendedores Pre-configurados** con especialidades
- ✅ **Analytics en Tiempo Real**
- ✅ **Asignación Inteligente** basada en carga de trabajo
- ✅ **Tracking Completo** de conversaciones y métricas

### 👥 Sistema de Vendedores
- **Rotación Round-Robin**: Distribución equitativa de clientes
- **Especialidades**: Premium, General, Technical, VIP
- **Estados**: Disponible, Ocupado, Offline
- **Límite de Clientes**: Control de capacidad por vendedor
- **Métricas Individuales**: Ventas, rating, clientes actuales

### 📊 Dashboard Web Profesional
- **Vista en Tiempo Real** de todas las métricas
- **Gestión de Vendedores** con cambio de estados
- **Analytics Avanzado**: gráficos, eventos, KPIs
- **Seguimiento de Pedidos** completo
- **Catálogo de Productos** administrable
- **Diseño Responsive** y moderno

### 📈 Analytics y Métricas
- Mensajes totales (enviados/recibidos)
- Usuarios únicos y activos
- Tasa de conversión
- Productos más vistos
- Búsquedas populares
- Tiempo de respuesta promedio
- Eventos en tiempo real

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                   USUARIOS DE WHATSAPP                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              BAILEYS PROVIDER (WhatsApp Web)            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   CHATBOT CORE (BuilderBot)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Flujos    │  │   Servicios  │  │  Analytics   │  │
│  │ Conversación │◄─┤   Negocio    │◄─┤  & Tracking  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  SELLERS MANAGER │      │  API REST :3009  │
│  Round-Robin     │      │  (Express)       │
│  Rotation        │      └────────┬─────────┘
└──────────────────┘               │
                                   ▼
                         ┌──────────────────┐
                         │  DASHBOARD WEB   │
                         │  (React)         │
                         │  - Métricas      │
                         │  - Vendedores    │
                         │  - Pedidos       │
                         └──────────────────┘
```

---

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
# Backend (chatbot)
npm install

# Frontend (dashboard)
npm run dashboard:install
```

### 2. Configurar Variables de Entorno

El archivo `.env` ya está configurado con Baileys (no requiere credenciales de Meta):

```env
PORT=3008          # Puerto del chatbot
API_PORT=3009      # Puerto del dashboard
BUSINESS_NAME=Cocolu Ventas
```

### 3. Iniciar el Sistema

**Opción A: Solo Chatbot**
```bash
npm run dev
```

**Opción B: Chatbot + Dashboard**

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run dashboard
```

### 4. Acceder al Dashboard

```
🌐 Dashboard: http://localhost:3000
🚀 API REST: http://localhost:3009/api/health
🤖 Chatbot: Escanea el QR con WhatsApp
```

---

## 📱 Uso del Chatbot

### Comandos Disponibles

```
MENU       - Ver menú principal
1          - Ver productos
2          - Hacer pedido
3          - Seguimiento
4          - Horarios
5          - Soporte
PRODUCTOS  - Catálogo
BUSCAR     - Buscar producto
TODOS      - Ver todo el catálogo
```

### Flujo de Usuario

1. **Saludo** → Asignación automática de vendedor
2. **Explorar** → Ver productos y catálogo
3. **Comprar** → Proceso guiado de pedido
4. **Seguimiento** → Rastrear pedido
5. **Soporte** → Ayuda y contacto

---

## 👥 Sistema de Vendedores

### Vendedores Pre-configurados

| ID | Nombre | Especialidad | Max Clientes | Rating |
|----|--------|--------------|--------------|--------|
| SELLER001 | Ana García | Premium | 10 | 4.8⭐ |
| SELLER002 | Carlos Méndez | General | 10 | 4.9⭐ |
| SELLER003 | María López | Technical | 8 | 4.7⭐ |
| SELLER004 | Juan Rodríguez | General | 10 | 4.6⭐ |
| SELLER005 | Laura Martínez | VIP | 5 | 5.0⭐ |

### Rotación Round-Robin

```javascript
Cliente 1 → Ana García
Cliente 2 → Carlos Méndez
Cliente 3 → María López
Cliente 4 → Juan Rodríguez
Cliente 5 → Laura Martínez
Cliente 6 → Ana García (vuelve al inicio)
```

### Gestión desde Dashboard

- Ver carga de trabajo en tiempo real
- Cambiar estado (Disponible/Ocupado/Offline)
- Monitorear clientes asignados
- Ver métricas individuales

---

## 🎨 Dashboard Web

### Páginas Disponibles

#### 📊 Dashboard Principal
- Métricas globales (mensajes, usuarios, conversión)
- Gráfico de carga de vendedores
- Estado en tiempo real de vendedores
- Resumen ejecutivo

#### 👥 Vendedores
- Tarjetas de vendedores con métricas
- Control de estados
- Barra de progreso de capacidad
- Información de contacto

#### 📈 Analytics
- KPIs principales
- Gráfico de mensajes por hora
- Top búsquedas de productos
- Productos más vistos
- Eventos recientes

#### 🛒 Pedidos
- Tabla completa de pedidos
- Estados visuales
- Información de clientes
- Fechas y tracking

#### 📦 Productos
- Catálogo visual
- Precios y stock
- Categorías
- Disponibilidad

---

## 🔌 API REST

### Endpoints Principales

```bash
# Dashboard
GET  /api/dashboard              # Resumen completo

# Vendedores
GET  /api/sellers                # Todos los vendedores
GET  /api/sellers/:id            # Vendedor específico
POST /api/sellers                # Agregar vendedor
PATCH /api/sellers/:id/status    # Actualizar estado

# Analytics
GET  /api/analytics/metrics      # Métricas completas
GET  /api/analytics/summary      # Resumen ejecutivo
GET  /api/analytics/events       # Eventos recientes

# Pedidos
GET  /api/orders                 # Todos los pedidos
GET  /api/orders/:id             # Pedido específico

# Productos
GET  /api/products               # Catálogo completo

# Health Check
GET  /api/health                 # Estado del sistema
```

### Ejemplo de Uso

```javascript
// Obtener vendedores
const response = await fetch('http://localhost:3009/api/sellers');
const { success, data } = await response.json();

// Actualizar estado de vendedor
await fetch('http://localhost:3009/api/sellers/SELLER001/status', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'busy' })
});
```

---

## 📊 Métricas y Analytics

### Qué se Trackea

- ✅ Cada mensaje (entrante/saliente)
- ✅ Usuarios únicos y activos
- ✅ Vistas de productos
- ✅ Búsquedas realizadas
- ✅ Pedidos completados
- ✅ Carritos abandonados
- ✅ Tickets de soporte
- ✅ Conversaciones iniciadas
- ✅ Tiempo de respuesta

### Eventos en Tiempo Real

El sistema registra todos los eventos y los muestra en el dashboard:
- `message` - Nuevo mensaje
- `product_view` - Producto visto
- `product_search` - Búsqueda realizada
- `order_completed` - Pedido completado
- `cart_abandoned` - Carrito abandonado
- `support_ticket` - Ticket de soporte
- `conversation_started` - Nueva conversación

---

## ⚡ Optimizaciones

### Performance
- **Singleton Patterns** para servicios compartidos
- **Caché en memoria** para datos frecuentes
- **Actualización cada 5s** en dashboard
- **Límite de eventos** (1000 en memoria)

### Escalabilidad
- **Rotación automática** evita sobrecarga
- **Control de capacidad** por vendedor
- **API RESTful** separada del bot
- **Base de datos JSON** (migrable a MongoDB/PostgreSQL)

---

## 🔧 Configuración Avanzada

### Agregar Vendedor Dinámicamente

```javascript
import sellersManager from './src/services/sellers.service.js';

sellersManager.addSeller({
  name: 'Nuevo Vendedor',
  phone: '+57300XXXXXXX',
  email: 'vendedor@emberdrago.com',
  specialty: 'general',
  maxClients: 10
});
```

### Personalizar Rotación

Editar `src/services/sellers.service.js`:

```javascript
// Cambiar algoritmo de asignación
assignSeller(userId, specialty) {
  // Tu lógica personalizada aquí
}
```

---

## 🎓 Tecnologías Utilizadas

### Backend
- **BuilderBot** v1.1.94 - Framework de chatbot
- **Baileys Provider** - WhatsApp Web sin API keys
- **Express** 4.18.2 - API REST
- **Node.js** >= 18.0.0

### Frontend
- **React** 18.2.0 - UI Framework
- **Recharts** 2.10.3 - Gráficos
- **React Router** 6.20.0 - Navegación
- **Lucide React** - Iconos
- **Axios** - HTTP Client

### Arquitectura
- **Round-Robin** - Algoritmo de rotación
- **Singleton** - Patrón de diseño
- **RESTful** - Arquitectura de API
- **Real-time Updates** - Actualización automática

---

## 📦 Estructura de Archivos

```
chatboot-cocoluventas/
├── src/
│   ├── flows/              # Flujos de conversación
│   ├── services/
│   │   ├── sellers.service.js     # ⭐ Sistema de vendedores
│   │   ├── analytics.service.js   # ⭐ Analytics
│   │   ├── products.service.js
│   │   ├── orders.service.js
│   │   └── support.service.js
│   ├── api/
│   │   └── routes.js              # ⭐ API REST
│   ├── utils/
│   ├── config/
│   └── middlewares/
├── dashboard/                      # ⭐ Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Sellers.js
│   │   │   ├── Analytics.js
│   │   │   ├── Orders.js
│   │   │   └── Products.js
│   │   └── App.js
│   └── package.json
├── app.js                         # ⭐ Punto de entrada mejorado
└── package.json
```

---

## 🚀 Deployment

### Producción con PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar bot
pm2 start app.js --name cocolu-bot

# Iniciar dashboard (build primero)
npm run dashboard:build
pm2 start "serve -s dashboard/build -l 3000" --name cocolu-dashboard

# Guardar configuración
pm2 save
pm2 startup
```

### Docker

```bash
docker-compose up -d
```

---

## 📈 Roadmap

### v1.1 (Próximo)
- [ ] Base de datos MongoDB
- [ ] Autenticación en dashboard
- [ ] Notificaciones push
- [ ] Exportar reportes PDF

### v2.0 (Futuro)
- [ ] IA con GPT para respuestas
- [ ] Multi-idioma
- [ ] Integración con CRM
- [ ] App móvil nativa

---

## 🆘 Soporte

**Desarrollado por Ember Drago**
- 📧 Email: contacto@emberdrago.com
- 🌐 Web: www.emberdrago.com
- 💬 Discord: BuilderBot Community

---

## 📜 Licencia

MIT License - Desarrollado por Ember Drago

---

## 🙏 Créditos

- **BuilderBot** by Leifer Méndez
- **Ember Drago** - Desarrollo y personalización
- **Cocolu Ventas** - Cliente

---

**Versión**: 2.0.0 Professional Edition  
**Fecha**: 2025-11-04  
**Desarrollador**: Ember Drago - Agencia de Tecnología  

---

# 🎉 Sistema Completo y Optimizado

**¡Listo para producción con rotación de vendedores y dashboard profesional!**
