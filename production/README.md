# 🚀 COCOLU VENTAS v5.0.0

**Sistema Integrado de Chatbot WhatsApp + Dashboard Administrativo**

Desarrollado con [BuilderBot](https://builderbot.app/) + React + Express.js

---

## 🎯 Inicio Rápido

### Linux/Mac
```bash
cd production
./START.sh
```

### Windows
```cmd
cd production
START.bat
```

**Acceso:** http://localhost:5000  
**Email:** admin@cocolu.com  
**Password:** demo123

---

## ✨ Características

### Frontend (React)
- ✅ 8 páginas principales
- ✅ Dashboard con KPIs
- ✅ Gestión de vendedores
- ✅ Analytics avanzado
- ✅ Gestión de pedidos
- ✅ Catálogo de productos
- ✅ Gestión de usuarios (admin)
- ✅ Gestión de roles (admin)
- ✅ Control de bots (admin)

### Backend (Express)
- ✅ API REST funcional
- ✅ JWT Token
- ✅ RBAC (39 permisos)
- ✅ Multi-tenancy
- ✅ Validación de datos

### Bot (BuilderBot + Meta)
- ✅ 10 flujos de conversación
- ✅ Webhook integrado
- ✅ Meta API (WhatsApp)
- ✅ Automatización
- ✅ Integración con dashboard

### Seguridad
- ✅ Autenticación JWT
- ✅ Autorización RBAC
- ✅ Multi-tenancy
- ✅ Protección de rutas
- ✅ Validación de datos

---

## 📋 Configuración

### Crear archivo `.env`

```env
META_JWT_TOKEN=tu_jwt_token
META_NUMBER_ID=tu_numero_id
META_VERIFY_TOKEN=tu_verify_token
META_API_VERSION=v22.0
PORT=5001
API_PORT=5000
NODE_ENV=production
BOT_ADAPTER=meta
DB_PATH=./database
TENANT_ID=cocolu
```

---

## 📈 Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Bot | 5001 | http://localhost:5001 |
| API | 5000 | http://localhost:5000/api |
| Dashboard | 5000 | http://localhost:5000 |

---

## 🌐 Rutas Disponibles

### Públicas
- `/login` → Autenticación

### Protegidas
- `/` → Dashboard
- `/sellers` → Vendedores
- `/analytics` → Analytics
- `/orders` → Pedidos
- `/products` → Productos
- `/users` → Usuarios (admin)
- `/roles` → Roles (admin)
- `/bots` → Bots (admin)

---

## 📁 Estructura

```
production/
├── START.sh                    ← Ejecutar esto
├── START.bat                   ← O esto (Windows)
├── app-integrated.js           ← Aplicación principal
├── package.json                ← Dependencias
├── .env                        ← Configuración (crear)
├── src/                        ← Código fuente
├── dashboard/                  ← Frontend React
├── database/                   ← Base de datos JSON
└── logs/                       ← Logs del sistema
```

---

## 📚 Documentación

- **ARQUITECTURA_COMPLETA.md** - Visión general del sistema
- **FLUJO_UNICO.md** - Flujo de rutas
- **INICIO_UNIFICADO.md** - Guía de inicio
- **RESUMEN_FINAL.md** - Resumen completo
- **VERIFICACION.md** - Checklist
- **DIAGRAMA_SINERGIA.txt** - Diagrama visual

---

## 🔧 Scripts

```bash
npm start              # Iniciar en producción (Meta)
npm run dev            # Iniciar en desarrollo (Meta)
npm run debug          # Iniciar con inspector
npm run dashboard:build # Compilar dashboard
npm run install:all    # Instalar todo
```

---

## 🚀 Instalación

### Prerrequisitos

- Node.js >= 18.0.0
- npm o pnpm
- Cuenta de WhatsApp Business API
- Token de acceso de Meta

### Pasos de instalación

1. **Clonar o descargar el proyecto**

```bash
cd chatboot-cocoluventas
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Copia el archivo `.env.example` a `.env` y configura tus credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus datos:

```env
# Configuración de Meta (WhatsApp Business API)
PORT=3008
WEBHOOK_VERIFY_TOKEN=tu_token_verificacion_seguro
META_ACCESS_TOKEN=tu_token_de_acceso_meta
META_PHONE_NUMBER_ID=tu_id_numero_telefono

# Configuración del negocio
BUSINESS_NAME=Cocolu Ventas
BUSINESS_PHONE=+1234567890
BUSINESS_EMAIL=contacto@cocoluventas.com
BUSINESS_ADDRESS=Tu dirección comercial

# Horario de atención
BUSINESS_HOURS_START=09:00
BUSINESS_HOURS_END=18:00
BUSINESS_DAYS=1,2,3,4,5  # 0=Domingo, 1=Lunes, ..., 6=Sábado
```

4. **Iniciar el bot**

**Método Interactivo (Recomendado)**:
```bash
npm start
```

El CLI te permitirá elegir entre:
- 🔢 **Número telefónico** (código de 8 dígitos) - Recomendado
- 📷 **QR Code** (escanear con cámara)

**Métodos Directos**:
```bash
# Con número telefónico
npm run start:phone

# Con QR code
npm run start:qr

# Desarrollo
npm run dev
```

**📱 Para Venezuela**: Ver [`INICIO_RAPIDO_VENEZUELA.md`](INICIO_RAPIDO_VENEZUELA.md)

## 📚 Estructura del Proyecto

```
chatboot-cocoluventas/
├── src/                    # Código fuente principal
│   ├── flows/              # Flujos de conversación
│   ├── services/           # Servicios de negocio
│   ├── api/                # API REST endpoints
│   ├── models/             # Modelos de datos
│   └── utils/              # Utilidades
├── docs/                   # 📖 Documentación completa
│   ├── arquitectura/       # Documentación de arquitectura
│   ├── guias/              # Guías de uso e instalación
│   ├── implementacion/     # Detalles de implementación
│   ├── changelog/          # Historial de cambios
│   └── actualizacion/      # Documentación de actualizaciones
├── scripts/                # 📜 Scripts utilitarios
│   ├── catalogo/           # Scripts de catálogo
│   ├── deployment/         # Scripts de deployment
│   └── utils/              # Utilidades generales
├── legacy/                 # 🗄️ Código legacy (no usar)
│   ├── apps/               # Aplicaciones antiguas
│   └── python/             # Scripts Python antiguos
├── dashboard/              # Panel de administración web
├── tests/                  # Tests automatizados
├── app-integrated.js       # ⭐ Aplicación principal
├── app.js                  # Aplicación básica
├── package.json
├── .env.example
└── README.md
```

### 📖 Navegación de Documentación

Toda la documentación ha sido organizada en la carpeta `docs/`. Para encontrar lo que necesitas:

- **¿Empezando?** → Lee [`docs/guias/`](docs/guias/)
- **¿Arquitectura técnica?** → Lee [`docs/arquitectura/`](docs/arquitectura/)
- **¿Qué cambió recientemente?** → Lee [`docs/actualizacion/`](docs/actualizacion/)
- **¿Historial completo?** → Lee [`docs/changelog/`](docs/changelog/)
- **¿Cómo implementar algo?** → Lee [`docs/implementacion/`](docs/implementacion/)

📌 **Índice completo**: [`docs/README.md`](docs/README.md)

## 🎨 Flujos de Conversación

### 1. Flujo de Bienvenida
- Saludo personalizado
- Detección de horario laboral
- Guía inicial para el usuario

### 2. Menú Principal
Opciones disponibles:
1. Ver productos y catálogo
2. Hacer un pedido
3. Seguimiento de orden
4. Horarios y ubicación
5. Soporte y contacto
6. Información sobre envíos
7. Métodos de pago
8. Preguntas frecuentes

### 3. Catálogo de Productos
- Navegación por categorías
- Búsqueda de productos
- Ver todos los productos
- Enlaces a sitio web

### 4. Gestión de Pedidos
- Creación de pedidos paso a paso
- Confirmación con resumen
- Generación de ID único
- Sistema de seguimiento

### 5. Soporte
- Conexión con asesores
- Sistema de tickets
- FAQ automático
- Información de contacto

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `PORT` | Puerto del servidor | ❌ (3008) |
| `WEBHOOK_VERIFY_TOKEN` | Token de verificación webhook | ✅ |
| `META_ACCESS_TOKEN` | Token de acceso Meta | ✅ |
| `META_PHONE_NUMBER_ID` | ID número de teléfono | ✅ |
| `BUSINESS_NAME` | Nombre del negocio | ❌ |
| `BUSINESS_PHONE` | Teléfono de contacto | ❌ |
| `BUSINESS_EMAIL` | Email de contacto | ❌ |
| `BUSINESS_ADDRESS` | Dirección física | ❌ |
| `BUSINESS_HOURS_START` | Hora de apertura | ❌ (09:00) |
| `BUSINESS_HOURS_END` | Hora de cierre | ❌ (18:00) |
| `BUSINESS_DAYS` | Días de atención | ❌ (1,2,3,4,5) |
| `CATALOG_URL` | URL del catálogo | ❌ |
| `WEBSITE_URL` | URL del sitio web | ❌ |

### Configuración de WhatsApp Business API

1. Crear una aplicación en [Meta for Developers](https://developers.facebook.com/)
2. Configurar WhatsApp Business API
3. Obtener el token de acceso permanente
4. Configurar el webhook:
   - URL: `https://tu-dominio.com/webhook`
   - Verify Token: El que configuraste en `.env`
5. Suscribirse a los eventos de mensajes

## 📦 Base de Datos

El sistema utiliza `@builderbot/database-json` para persistencia. Los datos se almacenan en archivos JSON:

- **Productos**: Definidos en `src/services/products.service.js`
- **Pedidos**: Almacenados en memoria (Map)
- **Tickets**: Almacenados en memoria (Map)
- **Conversaciones**: `database/db.json` (generado automáticamente)

> ⚠️ **Nota**: Para producción, se recomienda migrar a una base de datos robusta como MongoDB o PostgreSQL.

## 🛠️ Desarrollo

### Agregar un nuevo flujo

1. Crear archivo en `src/flows/`:

```javascript
import { addKeyword } from '@builderbot/bot';

const miNuevoFlujo = addKeyword(['palabra', 'clave'])
    .addAnswer('Respuesta del bot', { delay: 500 });

export default miNuevoFlujo;
```

2. Importar en `app.js`:

```javascript
import miNuevoFlujo from './src/flows/miNuevoFlujo.js';
```

3. Agregar al createFlow:

```javascript
const adapterFlow = createFlow([
    // ... otros flujos
    miNuevoFlujo
]);
```

### Modificar productos

Edita el array `productsDatabase` en `src/services/products.service.js`:

```javascript
const productsDatabase = [
    {
        id: 'PROD001',
        name: 'Mi Producto',
        description: 'Descripción',
        price: 100.00,
        category: 'categoria',
        stock: 50,
        icon: '📦'
    },
    // ... más productos
];
```

## 🚀 Deployment

### Opción 1: Servidor Linux (PM2)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar con PM2
pm2 start app.js --name chatbot-cocolu

# Ver logs
pm2 logs chatbot-cocolu

# Reiniciar
pm2 restart chatbot-cocolu

# Configurar inicio automático
pm2 startup
pm2 save
```

### Opción 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3008
CMD ["node", "app.js"]
```

```bash
docker build -t chatbot-cocolu .
docker run -d -p 3008:3008 --env-file .env chatbot-cocolu
```

### Opción 3: Railway / Heroku

1. Conectar repositorio
2. Configurar variables de entorno
3. Desplegar automáticamente

## 📊 Monitoreo

El bot imprime logs útiles en consola:

```
🤖 =======================================
🤖 Chatbot Cocolu Ventas iniciado
🤖 =======================================
🤖 Puerto: 3008
🤖 Webhook: http://localhost:3008/webhook
🤖 =======================================
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

MIT License - Libre para uso personal y comercial

## 🙏 Agradecimientos

- [BuilderBot](https://builderbot.app/) by Leifer Méndez
- [Código en Casa](https://codigoencasa.com/)
- Comunidad de BuilderBot

## 📞 Soporte

- 📧 Email: contacto@cocoluventas.com
- 💬 Discord: [BuilderBot Community](https://link.codigoencasa.com/DISCORD)
- 🐦 Twitter: [@leifermendez](https://twitter.com/leifermendez)

## 🔗 Enlaces Útiles

- [Documentación BuilderBot](https://builderbot.app/)
- [GitHub BuilderBot](https://github.com/codigoencasa/builderbot)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Meta for Developers](https://developers.facebook.com/)

---

Desarrollado con ❤️ para Cocolu Ventas
