# 🎯 OPTIMIZACIÓN HÍBRIDA RUST + NODE - Máximo 700 MB

## 📊 ANÁLISIS ACTUAL

**Tamaño actual del proyecto: 1.8 GB**

| Componente | Tamaño | Acción |
|------------|--------|--------|
| `node_modules/` | 803 MB | ⚠️ Optimizar (solo producción) |
| `catalogo-noviembre/` | 301 MB | ⚠️ Eliminar o comprimir |
| `src-rs-performance/target/` | 204 MB | ✅ Eliminar (compilar en servidor) |
| `public/` | 110 MB | ⚠️ Optimizar |
| `dashoffice-rust/` | 1.4 MB | ✅ Mantener (código fuente) |
| `dashboard/` | 1.5 MB | ✅ Mantener (código fuente) |
| `src/` | 912 KB | ✅ Mantener (flujos) |
| Otros | ~80 MB | ⚠️ Limpiar |

**Objetivo: ≤ 700 MB**

---

## 🎯 ESTRATEGIA DE OPTIMIZACIÓN

### **FASE 1: Limpieza Inmediata** (-500 MB)

1. **Eliminar compilaciones Rust** (-204 MB)
   ```bash
   rm -rf src-rs-performance/target/
   ```

2. **Eliminar catálogo de imágenes** (-301 MB)
   ```bash
   # Opción A: Eliminar completamente
   rm -rf catalogo-noviembre/
   
   # Opción B: Mover a CDN/externo
   # (recomendado si necesitas las imágenes)
   ```

3. **Eliminar carpetas innecesarias** (-50 MB)
   ```bash
   rm -rf primera-prueba-flujo-chatboot/
   rm -rf segunda-prueba-flujo/
   rm -rf presupuiestos/
   rm -rf bot_principal_sessions/
   rm -rf tokens/
   ```

4. **Limpiar logs y temporales** (-10 MB)
   ```bash
   find . -name "*.log" -delete
   find . -name "*.tmp" -delete
   rm -rf logs/
   ```

**Ahorro estimado: ~565 MB**

---

### **FASE 2: Optimizar node_modules** (-300 MB)

**Estrategia: Solo dependencias de producción**

```bash
# 1. Eliminar node_modules actual
rm -rf node_modules/

# 2. Instalar solo producción
npm ci --omit=dev

# 3. Resultado esperado: ~500 MB (vs 803 MB)
```

**Ahorro estimado: ~300 MB**

---

### **FASE 3: Optimizar dashboard** (-20 MB)

```bash
cd dashboard
# Eliminar node_modules de desarrollo
rm -rf node_modules/
npm ci --omit=dev

# Compilar para producción
npm run build

# Eliminar node_modules después de compilar
rm -rf node_modules/
cd ..
```

**Ahorro estimado: ~20 MB**

---

### **FASE 4: Estructura Final Optimizada**

```
chatboot-cocoluventas/          (~650 MB)
├── src/                        (912 KB) ✅ Flujos Node
├── src-rs-performance/         (1 MB) ✅ Código Rust
│   ├── src/
│   ├── Cargo.toml
│   └── bridge/
├── dashboard/                  (1.5 MB) ✅ Código React
│   └── build/                  (~80 MB) ✅ Compilado
├── app-integrated.js           ✅ Punto de entrada
├── package.json
├── node_modules/               (~500 MB) ✅ Solo producción
└── .env.example
```

**Tamaño estimado final: ~650 MB** ✅

---

## 🚀 ARQUITECTURA HÍBRIDA OPTIMIZADA

### **Componentes:**

1. **Rust API** (`src-rs-performance/`)
   - Tamaño código: ~1 MB
   - Binario compilado: 1.8 MB (se genera en servidor)
   - RAM: 3-10 MB

2. **Node Flows** (`src/flows/`)
   - Tamaño código: ~912 KB
   - RAM: ~200 MB (solo flujos, sin dashboard)

3. **Dashboard React** (`dashboard/build/`)
   - Tamaño compilado: ~80 MB
   - Servido estático por Nginx

4. **Dependencias Node** (`node_modules/`)
   - Solo producción: ~500 MB

---

## 📋 SCRIPT DE OPTIMIZACIÓN

Crear `scripts/optimize-for-deployment.sh`:

```bash
#!/bin/bash
# Optimización para deployment híbrido Rust + Node

echo "🧹 Limpiando proyecto para deployment..."

# 1. Eliminar compilaciones Rust
echo "📦 Eliminando target Rust..."
rm -rf src-rs-performance/target/
rm -rf dashoffice-rust/*/target/

# 2. Eliminar catálogo (opcional - comentar si necesitas)
echo "🖼️  Eliminando catálogo de imágenes..."
rm -rf catalogo-noviembre/

# 3. Eliminar carpetas innecesarias
echo "🗑️  Eliminando carpetas de prueba..."
rm -rf primera-prueba-flujo-chatboot/
rm -rf segunda-prueba-flujo/
rm -rf presupuiestos/
rm -rf bot_principal_sessions/
rm -rf tokens/

# 4. Limpiar logs
echo "📝 Limpiando logs..."
find . -name "*.log" -delete
rm -rf logs/

# 5. Optimizar node_modules (solo producción)
echo "📦 Optimizando node_modules..."
rm -rf node_modules/
npm ci --omit=dev

# 6. Optimizar dashboard
echo "🎨 Compilando dashboard..."
cd dashboard
rm -rf node_modules/
npm ci --omit=dev
npm run build
rm -rf node_modules/  # Eliminar después de compilar
cd ..

# 7. Verificar tamaño
echo "📊 Tamaño final:"
du -sh .

echo "✅ Optimización completada!"
```

---

## 🐳 DOCKERFILE OPTIMIZADO

```dockerfile
# Multi-stage build para optimizar tamaño

# Stage 1: Build Rust
FROM rust:1.75 as rust-builder
WORKDIR /app
COPY src-rs-performance/ ./src-rs-performance/
RUN cd src-rs-performance && \
    cargo build --release && \
    strip target/release/cocolu_rs_perf

# Stage 2: Build Node (solo producción)
FROM node:20-alpine as node-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
COPY app-integrated.js ./

# Stage 3: Build Dashboard
COPY dashboard/ ./dashboard/
RUN cd dashboard && \
    npm ci --omit=dev && \
    npm run build && \
    rm -rf node_modules/

# Stage 4: Runtime final
FROM node:20-alpine
WORKDIR /app

# Copiar binario Rust
COPY --from=rust-builder /app/src-rs-performance/target/release/cocolu_rs_perf /usr/local/bin/

# Copiar Node (solo producción)
COPY --from=node-builder /app/node_modules ./node_modules
COPY --from=node-builder /app/src ./src
COPY --from=node-builder /app/app-integrated.js ./
COPY --from=node-builder /app/package*.json ./

# Copiar dashboard compilado
COPY --from=node-builder /app/dashboard/build ./dashboard/build

# Exponer puertos
EXPOSE 3008 3009

# Iniciar ambos servicios
CMD ["sh", "-c", "cocolu_rs_perf & node app-integrated.js"]
```

**Tamaño imagen Docker: ~400-500 MB** ✅

---

## 📦 .DOCKERIGNORE

```
# Rust builds
**/target/
*.rlib
*.rmeta

# Node
node_modules/
**/node_modules/

# Desarrollo
.git/
.vscode/
.idea/

# Logs
*.log
logs/

# Catálogos
catalogo-noviembre/
presupuiestos/

# Pruebas
primera-prueba-flujo-chatboot/
segunda-prueba-flujo/

# Sessions
*_sessions/
tokens/
bot_principal_sessions/

# Builds
dashboard/node_modules/
dashboard/.next/
```

---

## 🚀 DEPLOYMENT OPTIMIZADO

### **Opción A: Sin Docker (Directo)**

```bash
# 1. Ejecutar script de optimización
./scripts/optimize-for-deployment.sh

# 2. Subir al servidor (solo archivos necesarios)
rsync -av --exclude='node_modules' \
  --exclude='.git' \
  --exclude='target' \
  ./ user@server:/opt/cocolu-bot/

# 3. En el servidor
cd /opt/cocolu-bot
npm ci --omit=dev
cd dashboard && npm ci --omit=dev && npm run build && cd ..
cd src-rs-performance && cargo build --release && cd ..

# 4. Tamaño final en servidor: ~650 MB
```

### **Opción B: Con Docker**

```bash
# 1. Build imagen optimizada
docker build -f Dockerfile.optimized -t cocolu-hybrid:latest .

# 2. Tamaño imagen: ~400-500 MB
docker images | grep cocolu-hybrid

# 3. Deploy
docker run -d \
  -p 3008:3008 \
  -p 3009:3009 \
  --name cocolu-bot \
  --env-file .env \
  cocolu-hybrid:latest
```

---

## 📊 RESUMEN DE OPTIMIZACIÓN

| Componente | Antes | Después | Ahorro |
|-------------|-------|---------|--------|
| **Total proyecto** | 1.8 GB | ~650 MB | **-1.15 GB** |
| `node_modules/` | 803 MB | ~500 MB | -303 MB |
| `target/` (Rust) | 204 MB | 0 MB | -204 MB |
| `catalogo-noviembre/` | 301 MB | 0 MB | -301 MB |
| Carpetas innecesarias | ~50 MB | 0 MB | -50 MB |
| Logs/temporales | ~10 MB | 0 MB | -10 MB |

**✅ Objetivo cumplido: ≤ 700 MB**

---

## 🎯 ESTRUCTURA FINAL

```
chatboot-cocoluventas/          (650 MB)
├── src/                        ✅ Flujos Node (912 KB)
│   ├── flows/                  (16 flujos)
│   ├── services/              (23 servicios)
│   └── api/                    (API routes)
│
├── src-rs-performance/         ✅ API Rust (1 MB)
│   ├── src/
│   ├── bridge/                 (Baileys bridge)
│   └── Cargo.toml
│
├── dashboard/                   ✅ Dashboard React (1.5 MB código)
│   ├── src/
│   └── build/                  (80 MB compilado)
│
├── app-integrated.js           ✅ Punto de entrada
├── package.json
├── node_modules/               (500 MB - solo producción)
└── .env.example
```

---

## ✅ CHECKLIST DE OPTIMIZACIÓN

- [ ] Ejecutar script de optimización
- [ ] Verificar tamaño final (`du -sh .`)
- [ ] Probar compilación Rust
- [ ] Probar flujos Node
- [ ] Probar dashboard
- [ ] Verificar que todo funciona
- [ ] Crear .dockerignore
- [ ] Crear Dockerfile optimizado
- [ ] Documentar estructura final

---

**Próximo paso**: Ejecutar el script de optimización y verificar que todo funciona.

