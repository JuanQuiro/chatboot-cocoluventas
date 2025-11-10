# ⚡ OPTIMIZACIÓN PARA PRODUCCIÓN

## 🎯 Objetivo: Sistema Ultra Ligero y Eficiente

Reducir peso, mejorar velocidad, minimizar recursos en despliegue.

---

## 📊 MÉTRICAS OBJETIVO

| Métrica | Antes | Objetivo | Estrategia |
|---------|-------|----------|------------|
| **Bundle Size** | ~2MB | < 500KB | Code splitting, tree shaking |
| **First Load** | ~3s | < 1s | Lazy loading, CDN |
| **Memory (Frontend)** | ~150MB | < 50MB | Optimización React |
| **Memory (Backend)** | ~200MB | < 100MB | Clustering, caching |
| **Docker Image** | ~800MB | < 300MB | Multi-stage build |
| **API Response** | ~500ms | < 100ms | Redis, compression |

---

## 🎨 FRONTEND OPTIMIZATION

### 1. **Lazy Loading de Rutas**

```javascript
// dashboard/src/App.js
import { lazy, Suspense } from 'react';

// Lazy load de páginas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Bots = lazy(() => import('./pages/Bots'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Sellers = lazy(() => import('./pages/Sellers'));
const Products = lazy(() => import('./pages/Products'));
const Orders = lazy(() => import('./pages/Orders'));
const Roles = lazy(() => import('./pages/Roles'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Uso en Routes
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/users" element={<Users />} />
    {/* ... */}
  </Routes>
</Suspense>
```

**Ahorro: ~70% en initial bundle**

---

### 2. **Code Splitting por Rutas**

```javascript
// dashboard/package.json - agregar
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  }
}

// Analizar bundle
npm run build
npm run analyze
```

**Resultado:**
- Cada página carga solo lo necesario
- Chunks independientes
- Caché por página

---

### 3. **Tree Shaking - Imports Selectivos**

```javascript
// ❌ MAL (importa todo)
import * as Icons from 'lucide-react';

// ✅ BIEN (solo lo necesario)
import { User, Settings, LogOut } from 'lucide-react';

// ❌ MAL
import _ from 'lodash';

// ✅ BIEN
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
```

**Ahorro: ~200KB en bundle**

---

### 4. **Optimización de Fuentes**

```javascript
// dashboard/src/contexts/TypographyContext.jsx
// Agregar font-display: swap
googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'

// Preconnect en index.html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

// Cargar solo weights necesarios (no todos)
// Antes: 300;400;500;600;700;800;900
// Después: 400;600;700
```

**Ahorro: ~150KB por fuente**

---

### 5. **Memoización React**

```javascript
// Componentes costosos
import { memo } from 'react';

const BotCard = memo(({ bot, onStart, onStop }) => {
  return (
    // JSX
  );
});

// useMemo para cálculos pesados
const expensiveValue = useMemo(() => {
  return calculateComplexValue(data);
}, [data]);

// useCallback para funciones
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

**Mejora: ~30% menos re-renders**

---

### 6. **Virtual Scrolling (Listas Grandes)**

```javascript
// Para listas con 100+ items
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  )}
</FixedSizeList>
```

**Ahorro: Render solo visible items**

---

### 7. **Image Optimization**

```bash
# Comprimir imágenes
npm install --save-dev imagemin imagemin-webp

# Convertir a WebP
# Antes: logo.png (50KB)
# Después: logo.webp (15KB)
```

```jsx
// Usar WebP con fallback
<picture>
  <source srcSet="logo.webp" type="image/webp" />
  <img src="logo.png" alt="Logo" />
</picture>
```

---

### 8. **Producción Build Optimizado**

```javascript
// dashboard/.env.production
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
IMAGE_INLINE_SIZE_LIMIT=10000

// dashboard/package.json
{
  "scripts": {
    "build:prod": "GENERATE_SOURCEMAP=false INLINE_RUNTIME_CHUNK=false react-scripts build",
    "build:analyze": "npm run build:prod && source-map-explorer 'build/static/js/*.js'"
  }
}
```

---

## 🚀 BACKEND OPTIMIZATION

### 1. **Compresión Gzip/Brotli**

```javascript
// src/index.js o app.js
import compression from 'compression';

const app = express();

// Compresión para todas las responses
app.use(compression({
  level: 6, // Balance entre compresión y velocidad
  threshold: 1024, // Solo comprimir > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

**Ahorro: ~70% en tamaño de responses**

---

### 2. **Redis Cache**

```javascript
// src/utils/cache.js
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 3,
});

// Middleware de cache
export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Override res.json para cachear
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        redis.setex(key, duration, JSON.stringify(data));
        return originalJson(data);
      };

      next();
    } catch (error) {
      next();
    }
  };
};

// Uso
app.get('/api/products', cacheMiddleware(600), (req, res) => {
  // Esta response se cachea por 10 minutos
});
```

**Mejora: 95% más rápido en datos cacheados**

---

### 3. **Database Connection Pooling**

```javascript
// MongoDB con pooling
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 50, // Máximo 50 conexiones simultáneas
  minPoolSize: 10, // Mínimo 10 siempre abiertas
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  family: 4, // IPv4
});

// PostgreSQL con pooling
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // 20 conexiones max
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

### 4. **Clustering (Multi-Core)**

```javascript
// src/cluster.js
import cluster from 'cluster';
import os from 'os';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Reemplazar worker muerto
  });
} else {
  // Workers comparten el mismo puerto TCP
  require('./app.js');
  console.log(`Worker ${process.pid} started`);
}
```

**Uso:**
```bash
# Antes
node app.js

# Después
node cluster.js
```

**Mejora: 4x throughput en CPU quad-core**

---

### 5. **Minify JSON Responses**

```javascript
// Remover espacios en blanco
app.set('json spaces', 0);

// Middleware para respuestas compactas
app.use((req, res, next) => {
  res.locals.compact = true;
  next();
});
```

---

## 🐳 DOCKER OPTIMIZATION

### Multi-Stage Build Optimizado

```dockerfile
# ================================
# Stage 1: Dependencies
# ================================
FROM node:20-alpine AS deps
WORKDIR /app

# Instalar solo dependencies de producción
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# ================================
# Stage 2: Builder (Frontend)
# ================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar package files
COPY dashboard/package*.json ./dashboard/
RUN cd dashboard && npm ci

# Copiar código y build
COPY dashboard ./dashboard
RUN cd dashboard && \
    GENERATE_SOURCEMAP=false \
    INLINE_RUNTIME_CHUNK=false \
    npm run build && \
    rm -rf node_modules

# ================================
# Stage 3: Runtime
# ================================
FROM node:20-alpine AS runtime

# Instalar solo lo necesario
RUN apk add --no-cache \
    tini \
    dumb-init

WORKDIR /app

# Copiar solo lo necesario
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dashboard/build ./dashboard/build
COPY package*.json ./
COPY src ./src

# User no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3009

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3009/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar dumb-init para señales
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "app-integrated.js"]
```

**Resultado:**
- Antes: ~800MB
- Después: ~250MB
- **70% más pequeño**

---

### .dockerignore

```
# dashboard/.dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.vscode
coverage
.idea
*.md
.DS_Store
build
dist
.cache

# Backend
database
logs
*.log
.env.test
```

---

## 📦 NGINX COMO REVERSE PROXY

```nginx
# nginx.conf
worker_processes auto;

events {
    worker_connections 2048;
}

http {
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;
    gzip_comp_level 6;

    # Brotli compression (mejor que gzip)
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css application/json 
                 application/javascript text/xml application/xml;

    # Cache
    proxy_cache_path /var/cache/nginx levels=1:2 
                     keys_zone=api_cache:10m 
                     max_size=1g inactive=60m;

    upstream backend {
        least_conn;
        server app:3009 max_fails=3 fail_timeout=30s;
    }

    server {
        listen 80;
        server_name _;

        # Compresión estática
        gzip_static on;
        brotli_static on;

        # Cache de assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            root /usr/share/nginx/html;
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        # API con cache
        location /api/ {
            proxy_pass http://backend;
            proxy_cache api_cache;
            proxy_cache_valid 200 10m;
            proxy_cache_use_stale error timeout updating;
            add_header X-Cache-Status $upstream_cache_status;
            
            # Headers
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Frontend
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            
            # SPA routing
            index index.html;
            
            # Security headers
            add_header X-Frame-Options "SAMEORIGIN" always;
            add_header X-Content-Type-Options "nosniff" always;
            add_header X-XSS-Protection "1; mode=block" always;
        }
    }
}
```

---

## 🚀 PM2 CONFIGURATION

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cocolu-api',
    script: './app-integrated.js',
    instances: 'max', // Usa todos los cores disponibles
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3009,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
  }]
};
```

**Uso:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 📊 WEBPACK/VITE OPTIMIZATION

### Si usas Create React App - eject y optimizar

```javascript
// webpack.config.js (después de eject)
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remover console.logs
          },
        },
      }),
    ],
  },
};
```

---

## 🎯 CHECKLIST DE OPTIMIZACIÓN

### Frontend ✅
- [ ] Lazy loading de rutas
- [ ] Code splitting
- [ ] Tree shaking (imports selectivos)
- [ ] Memoización React (memo, useMemo, useCallback)
- [ ] Virtual scrolling para listas grandes
- [ ] Fuentes optimizadas (solo weights necesarios)
- [ ] Imágenes optimizadas (WebP)
- [ ] Remove console.logs en producción
- [ ] Source maps deshabilitados
- [ ] Bundle analyzer ejecutado

### Backend ✅
- [ ] Compresión gzip/brotli
- [ ] Redis cache implementado
- [ ] Database connection pooling
- [ ] Clustering / PM2
- [ ] JSON minificado
- [ ] Rate limiting
- [ ] Query optimization
- [ ] Indexes en DB

### DevOps ✅
- [ ] Docker multi-stage build
- [ ] .dockerignore configurado
- [ ] Nginx reverse proxy
- [ ] CDN para assets estáticos
- [ ] Health checks
- [ ] Monitoring (RAM, CPU)
- [ ] Log rotation
- [ ] Auto-scaling configurado

---

## 📈 RESULTADOS ESPERADOS

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Bundle Size | 2MB | 450KB | **-78%** |
| First Load | 3s | 0.8s | **-73%** |
| Time to Interactive | 4.5s | 1.5s | **-67%** |
| Docker Image | 800MB | 250MB | **-69%** |
| API Response (cached) | 500ms | 25ms | **-95%** |
| Memory (Backend) | 200MB | 80MB | **-60%** |
| CPU Usage | 60% | 25% | **-58%** |

---

## 🎯 IMPLEMENTACIÓN RÁPIDA

### 1. Frontend (15 min)

```bash
cd dashboard

# Lazy loading
# Editar App.js con lazy imports

# Build optimizado
npm run build:prod

# Analizar
npm run analyze
```

### 2. Backend (15 min)

```bash
# Instalar dependencias
npm install compression ioredis

# Agregar compresión en app.js
# Agregar Redis cache
```

### 3. Docker (10 min)

```bash
# Crear Dockerfile optimizado
# Crear .dockerignore

# Build
docker build -t cocolu-optimized .

# Verificar tamaño
docker images cocolu-optimized
```

---

## 💡 TIPS EXTRA

### Lighthouse Score

```bash
# Verificar performance
npm install -g lighthouse

lighthouse http://localhost:3000 --view
```

**Objetivo: Score > 90 en todas las categorías**

### Bundle Analyzer

```bash
npm install --save-dev webpack-bundle-analyzer
npm run analyze
```

### Memory Profiling

```bash
node --inspect app.js
# Chrome DevTools → Memory → Take Heap Snapshot
```

---

## 🎯 RESUMEN EJECUTIVO

**ANTES:**
- 2MB bundle
- 3s first load
- 800MB Docker image
- 500ms API
- 200MB RAM

**DESPUÉS:**
- 450KB bundle (-78%)
- 0.8s first load (-73%)
- 250MB Docker image (-69%)
- 25ms API cached (-95%)
- 80MB RAM (-60%)

**DESPLIEGUE:**
- Más rápido (imagen más pequeña)
- Menos recursos (menos RAM/CPU)
- Más barato (menos costos cloud)
- Más escalable (clusters)
- Mejor UX (carga instantánea)

---

*Optimización Completa para Producción*
*DashOffice v5.0.0 - Ultra Optimizado*
