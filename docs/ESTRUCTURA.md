# 📁 Estructura del Proyecto

Visualización completa de la estructura del Chatbot Cocolu Ventas.

```
chatboot-cocoluventas/
│
├── 📄 app.js                          # Punto de entrada principal
├── 📄 package.json                    # Configuración npm y dependencias
├── 📄 package-lock.json               # Lock de versiones
│
├── 📂 src/                            # Código fuente
│   ├── 📂 flows/                      # Flujos de conversación
│   │   ├── welcome.flow.js            # Flujo de bienvenida
│   │   ├── menu.flow.js               # Menú principal
│   │   ├── products.flow.js           # Catálogo y búsqueda
│   │   ├── orders.flow.js             # Gestión de pedidos
│   │   ├── support.flow.js            # Soporte y tickets
│   │   └── schedule.flow.js           # Horarios y envíos
│   │
│   ├── 📂 services/                   # Lógica de negocio
│   │   ├── products.service.js        # Gestión de productos
│   │   ├── orders.service.js          # Gestión de órdenes
│   │   └── support.service.js         # Gestión de tickets
│   │
│   ├── 📂 utils/                      # Utilidades
│   │   ├── schedule.js                # Manejo de horarios
│   │   ├── format.js                  # Formateo de datos
│   │   └── validators.js              # Validaciones
│   │
│   ├── 📂 config/                     # Configuración
│   │   └── constants.js               # Constantes globales
│   │
│   └── 📂 middlewares/                # Middlewares
│       └── logger.middleware.js       # Logger de mensajes
│
├── 📂 tests/                          # Tests (estructura ejemplo)
│   └── 📂 utils/
│       └── format.test.js             # Tests de formato
│
├── 📂 scripts/                        # Scripts de utilidad
│   ├── setup.sh                       # Script de configuración
│   ├── start.sh                       # Script de inicio
│   └── deploy.sh                      # Script de deployment
│
├── 📂 database/                       # Base de datos (generada)
│   └── db.json                        # Almacenamiento JSON
│
├── 📂 logs/                           # Logs (generados)
│   ├── out.log                        # Output logs
│   ├── err.log                        # Error logs
│   └── combined.log                   # Logs combinados
│
├── 📂 node_modules/                   # Dependencias npm
│
├── 📄 .env                            # Variables de entorno (NO SUBIR)
├── 📄 .env.example                    # Ejemplo de .env
├── 📄 .gitignore                      # Archivos ignorados por git
├── 📄 .dockerignore                   # Archivos ignorados por Docker
├── 📄 .editorconfig                   # Configuración de editor
├── 📄 .prettierrc                     # Configuración Prettier
├── 📄 .eslintrc.json                  # Configuración ESLint
├── 📄 .nvmrc                          # Versión de Node.js
│
├── 📄 Dockerfile                      # Configuración Docker
├── 📄 docker-compose.yml              # Docker Compose
├── 📄 ecosystem.config.js             # Configuración PM2
│
├── 📄 README.md                       # Documentación principal
├── 📄 GUIA_RAPIDA.md                  # Guía de inicio rápido
├── 📄 DEPLOYMENT.md                   # Guía de deployment
├── 📄 CONTRIBUTING.md                 # Guía de contribución
├── 📄 CHANGELOG.md                    # Historial de cambios
├── 📄 SECURITY.md                     # Política de seguridad
├── 📄 LICENSE                         # Licencia MIT
└── 📄 ESTRUCTURA.md                   # Este archivo
```

## 📊 Estadísticas del Proyecto

### Archivos por tipo

- **JavaScript**: 15 archivos
- **Markdown**: 8 archivos
- **Configuración**: 9 archivos
- **Scripts Shell**: 3 archivos

### Líneas de código (aprox)

- **Flujos**: ~800 líneas
- **Servicios**: ~400 líneas
- **Utilidades**: ~350 líneas
- **Configuración**: ~200 líneas
- **Total**: ~1,750 líneas

## 🎯 Módulos Principales

### 1. Flujos de Conversación (src/flows/)

Controlan la lógica de conversación con el usuario:

- **welcome.flow.js**: Primera interacción
- **menu.flow.js**: Navegación principal
- **products.flow.js**: Catálogo y búsqueda
- **orders.flow.js**: Proceso de compra
- **support.flow.js**: Sistema de ayuda
- **schedule.flow.js**: Información del negocio

### 2. Servicios (src/services/)

Capa de lógica de negocio:

- **products.service.js**: CRUD de productos
- **orders.service.js**: Gestión de pedidos
- **support.service.js**: Sistema de tickets

### 3. Utilidades (src/utils/)

Funciones auxiliares reutilizables:

- **schedule.js**: Horarios de negocio
- **format.js**: Formateo de datos
- **validators.js**: Validaciones

### 4. Configuración (src/config/)

Constantes y configuración global:

- **constants.js**: Estados, categorías, emojis, etc.

### 5. Middlewares (src/middlewares/)

Procesamiento de mensajes:

- **logger.middleware.js**: Logging centralizado

## 🔧 Archivos de Configuración

### Desarrollo

- **.env**: Variables de entorno (local)
- **.nvmrc**: Versión de Node.js
- **.editorconfig**: Estilo de código
- **.prettierrc**: Formateo automático
- **.eslintrc.json**: Linting

### Deployment

- **Dockerfile**: Containerización
- **docker-compose.yml**: Orquestación
- **ecosystem.config.js**: PM2 config
- **scripts/*.sh**: Automatización

### Control de versiones

- **.gitignore**: Archivos a ignorar
- **.dockerignore**: Exclusiones Docker

## 📦 Dependencias

### Producción

```json
{
  "@builderbot/bot": "^1.1.94",
  "@builderbot/provider-meta": "^1.1.94",
  "@builderbot/database-json": "^1.1.94",
  "dotenv": "^16.4.5"
}
```

### Desarrollo

```json
{
  "@types/node": "^20.11.0"
}
```

## 🚀 Puntos de Entrada

### Desarrollo
```bash
npm run dev      # Inicia con hot-reload
```

### Producción
```bash
npm start        # Inicia con Node.js
pm2 start        # Inicia con PM2
docker-compose up # Inicia con Docker
```

## 📝 Documentación

| Archivo | Propósito |
|---------|-----------|
| README.md | Documentación completa |
| GUIA_RAPIDA.md | Inicio rápido |
| DEPLOYMENT.md | Guías de deploy |
| CONTRIBUTING.md | Cómo contribuir |
| CHANGELOG.md | Historial de versiones |
| SECURITY.md | Política de seguridad |
| ESTRUCTURA.md | Este archivo |

## 🎨 Convenciones

### Nomenclatura de archivos

- **Flujos**: `*.flow.js`
- **Servicios**: `*.service.js`
- **Tests**: `*.test.js`
- **Utilidades**: Sin sufijo
- **Configuración**: `*.config.js`

### Estructura de código

```javascript
// 1. Imports
import { ... } from '...';

// 2. Constantes
const CONSTANT = 'value';

// 3. Funciones auxiliares
const helperFunction = () => {};

// 4. Funciones principales
export const mainFunction = async () => {};

// 5. Export por defecto
export default mainFunction;
```

## 🔄 Flujo de Datos

```
Usuario (WhatsApp)
    ↓
Meta API (Webhook)
    ↓
app.js (BuilderBot)
    ↓
flows/ (Conversación)
    ↓
services/ (Lógica)
    ↓
database/ (Persistencia)
```

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev                 # Desarrollo
npm start                   # Producción
npm install                 # Instalar deps

# Scripts
./scripts/setup.sh          # Configurar
./scripts/start.sh          # Iniciar
./scripts/deploy.sh         # Desplegar

# Docker
docker-compose up -d        # Iniciar
docker-compose logs -f      # Logs
docker-compose down         # Detener

# PM2
pm2 start ecosystem.config.js
pm2 logs
pm2 restart chatbot-cocolu
```

## 📈 Roadmap

### v1.1 (Próximo)
- [ ] Base de datos MongoDB
- [ ] Panel admin web
- [ ] Analytics

### v2.0 (Futuro)
- [ ] IA con GPT
- [ ] Multi-idioma
- [ ] Multi-canal

---

**Versión**: 1.0.0  
**Última actualización**: 2025-11-03  
**Mantenido por**: Cocolu Ventas
