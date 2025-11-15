# 🚀 DEPLOYMENT HÍBRIDO OPTIMIZADO - Máximo 700 MB

## 📊 RESUMEN

**Arquitectura Híbrida Rust + Node optimizada para ≤700 MB**

```
┌─────────────────────────────────────┐
│     Nginx (Reverse Proxy)           │
│     Puerto: 80/443                  │
└─────────────────────────────────────┘
           │
    ┌──────┴──────┬──────────────┐
    │             │              │
┌───▼───┐  ┌─────▼─────┐  ┌─────▼─────┐
│React  │  │ Rust API  │  │Node Flows │
│Dashboard│ │ 3009     │  │ 3008      │
│(Static)│ │ 5 MB RAM  │  │ 200 MB    │
└───────┘  └───────────┘  └───────────┘
```

---

## 🎯 COMPONENTES

### 1. **Rust API** (`src-rs-performance/`)
- **Tamaño código**: ~1 MB
- **Binario compilado**: 1.8 MB
- **RAM**: 3-10 MB
- **Función**: Endpoints de control, health, stats

### 2. **Node Flows** (`src/flows/`)
- **Tamaño código**: ~912 KB
- **RAM**: ~200 MB
- **Función**: 16 flujos de conversación completos

### 3. **Dashboard React** (`dashboard/build/`)
- **Tamaño compilado**: ~80 MB
- **Función**: Interfaz web estática

### 4. **Nginx**
- **Función**: Reverse proxy + servir dashboard estático

---

## 📦 OPTIMIZACIÓN PRE-DEPLOYMENT

### **Paso 1: Ejecutar Script de Optimización**

```bash
# Ejecutar script de optimización
./scripts/optimize-for-deployment.sh

# Verificar tamaño final
du -sh .
# Objetivo: ≤700 MB
```

**El script elimina:**
- ✅ Compilaciones Rust (`target/`) - ~204 MB
- ✅ Catálogo de imágenes - ~301 MB
- ✅ Carpetas de prueba - ~50 MB
- ✅ Logs y temporales - ~10 MB
- ✅ Optimiza `node_modules` (solo producción) - ~300 MB

**Ahorro total: ~865 MB**

---

## 🐳 DEPLOYMENT CON DOCKER (RECOMENDADO)

### **Opción A: Docker Compose (Todo en uno)**

```bash
# 1. Optimizar proyecto
./scripts/optimize-for-deployment.sh

# 2. Build imágenes
docker-compose -f docker-compose.hybrid.yml build

# 3. Verificar tamaño de imágenes
docker images | grep cocolu

# 4. Iniciar servicios
docker-compose -f docker-compose.hybrid.yml up -d

# 5. Ver logs
docker-compose -f docker-compose.hybrid.yml logs -f
```

**Tamaño total de imágenes: ~400-500 MB** ✅

---

### **Opción B: Dockerfile Único**

```bash
# 1. Build imagen optimizada
docker build -f Dockerfile.hybrid-optimized -t cocolu-hybrid:latest .

# 2. Verificar tamaño
docker images | grep cocolu-hybrid

# 3. Ejecutar
docker run -d \
  -p 3008:3008 \
  -p 3009:3009 \
  -p 80:80 \
  --name cocolu-bot \
  --env-file .env \
  cocolu-hybrid:latest
```

---

## 🖥️ DEPLOYMENT SIN DOCKER (Directo)

### **Paso 1: Preparar Servidor**

```bash
# En el servidor
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx nodejs npm rustc cargo
```

### **Paso 2: Subir Proyecto Optimizado**

```bash
# Desde tu PC (después de optimizar)
rsync -av --exclude='node_modules' \
  --exclude='.git' \
  --exclude='target' \
  --exclude='catalogo-noviembre' \
  ./ user@server:/opt/cocolu-bot/
```

### **Paso 3: Instalar y Compilar en Servidor**

```bash
# En el servidor
cd /opt/cocolu-bot

# 1. Instalar dependencias Node (solo producción)
npm ci --omit=dev

# 2. Compilar dashboard
cd dashboard
npm ci --omit=dev
npm run build
cd ..

# 3. Compilar Rust API
cd src-rs-performance
cargo build --release
cd ..

# 4. Verificar tamaño
du -sh .
# Debe ser ≤700 MB
```

### **Paso 4: Configurar Nginx**

```bash
# Copiar configuración
sudo cp nginx/hybrid.conf /etc/nginx/nginx.conf

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### **Paso 5: Crear Systemd Services**

**Rust API Service:**

```bash
sudo tee /etc/systemd/system/cocolu-rust-api.service > /dev/null << 'EOF'
[Unit]
Description=Cocolu Rust API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/cocolu-bot/src-rs-performance
ExecStart=/opt/cocolu-bot/src-rs-performance/target/release/cocolu_rs_perf
Restart=always
RestartSec=5
Environment="API_PORT=3009"

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable cocolu-rust-api
sudo systemctl start cocolu-rust-api
```

**Node Flows Service:**

```bash
sudo tee /etc/systemd/system/cocolu-node-flows.service > /dev/null << 'EOF'
[Unit]
Description=Cocolu Node Flows
After=network.target cocolu-rust-api.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/cocolu-bot
ExecStart=/usr/bin/node app-integrated.js
Restart=always
RestartSec=5
Environment="NODE_ENV=production"
Environment="PORT=3008"
Environment="API_PORT=3009"

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable cocolu-node-flows
sudo systemctl start cocolu-node-flows
```

### **Paso 6: Verificar**

```bash
# Ver estado de servicios
sudo systemctl status cocolu-rust-api
sudo systemctl status cocolu-node-flows
sudo systemctl status nginx

# Ver logs
sudo journalctl -u cocolu-rust-api -f
sudo journalctl -u cocolu-node-flows -f

# Probar endpoints
curl http://localhost:3009/health
curl http://localhost:3008/webhook
```

---

## 📊 MONITOREO DE RECURSOS

### **Consumo Esperado:**

| Componente | RAM | CPU | Disco |
|------------|-----|-----|--------|
| **Rust API** | 3-10 MB | <1% | 1.8 MB |
| **Node Flows** | 200-250 MB | 5-10% | ~500 MB |
| **Nginx** | 5-10 MB | <1% | ~5 MB |
| **Dashboard** | 0 MB (estático) | 0% | ~80 MB |
| **Total** | **~220 MB** | **~7%** | **~650 MB** |

**✅ Cumple objetivo de ≤700 MB en disco**

---

## 🔧 CONFIGURACIÓN

### **Variables de Entorno (.env)**

```env
# Rust API
API_PORT=3009
AUTH_TOKEN=cocolu_secret_token_2025

# Node Flows
PORT=3008
NODE_ENV=production
BOT_ADAPTER=baileys

# Meta (si usas Meta Cloud API)
META_ACCESS_TOKEN=tu_token
META_PHONE_NUMBER_ID=tu_id
META_VERIFY_TOKEN=tu_verify_token

# Opcional: MongoDB (si usas)
MONGO_URI=mongodb://localhost:27017/cocolu
```

---

## 🧪 PRUEBAS

### **1. Probar Rust API**

```bash
# Health check
curl http://localhost:3009/health

# Stats
curl http://localhost:3009/api/stats

# Con autenticación
curl -H "Authorization: Bearer cocolu_secret_token_2025" \
  http://localhost:3009/api/status
```

### **2. Probar Node Flows**

```bash
# Webhook (verificación Meta)
curl -X GET "http://localhost:3008/webhook?hub.verify_token=tu_token&hub.challenge=test"

# Health
curl http://localhost:3008/health
```

### **3. Probar Dashboard**

```bash
# Abrir en navegador
http://tu-dominio.com/

# O localmente
http://localhost/
```

---

## 🆘 TROUBLESHOOTING

### **Problema: Proyecto >700 MB**

**Solución:**
```bash
# Ejecutar script de optimización
./scripts/optimize-for-deployment.sh

# Verificar qué ocupa espacio
du -sh */ | sort -h
```

### **Problema: Rust API no inicia**

**Solución:**
```bash
# Verificar que está compilado
ls -lh src-rs-performance/target/release/cocolu_rs_perf

# Compilar si es necesario
cd src-rs-performance
cargo build --release
```

### **Problema: Node Flows no conecta con Rust API**

**Solución:**
```bash
# Verificar que Rust API está corriendo
curl http://localhost:3009/health

# Verificar variables de entorno
echo $API_PORT

# Ver logs
sudo journalctl -u cocolu-rust-api -n 50
```

### **Problema: Dashboard no carga**

**Solución:**
```bash
# Verificar que está compilado
ls -lh dashboard/build/

# Recompilar si es necesario
cd dashboard
npm run build
```

---

## 📋 CHECKLIST DE DEPLOYMENT

### Pre-deployment:
- [ ] Ejecutar script de optimización
- [ ] Verificar tamaño ≤700 MB
- [ ] Configurar `.env`
- [ ] Probar localmente

### Deployment:
- [ ] Subir proyecto al servidor
- [ ] Instalar dependencias (solo producción)
- [ ] Compilar Rust API
- [ ] Compilar Dashboard
- [ ] Configurar Nginx
- [ ] Configurar Systemd services
- [ ] Configurar webhook en Meta

### Post-deployment:
- [ ] Verificar servicios corriendo
- [ ] Probar endpoints
- [ ] Probar flujos de conversación
- [ ] Verificar dashboard
- [ ] Monitorear recursos

---

## 🎯 VENTAJAS DE ARQUITECTURA HÍBRIDA

✅ **Eficiencia**: Rust API ultra-ligero (5 MB RAM)  
✅ **Funcionalidad**: Node Flows completos (16 flujos)  
✅ **Optimización**: ≤700 MB en disco  
✅ **Escalabilidad**: Componentes independientes  
✅ **Mantenibilidad**: Separación de responsabilidades  

---

## 📚 ARCHIVOS CREADOS

- ✅ `scripts/optimize-for-deployment.sh` - Script de optimización
- ✅ `Dockerfile.hybrid-optimized` - Dockerfile multi-stage
- ✅ `docker-compose.hybrid.yml` - Orquestación de servicios
- ✅ `nginx/hybrid.conf` - Configuración Nginx
- ✅ `.dockerignore.hybrid` - Exclusiones Docker
- ✅ `OPTIMIZACION_700MB_HIBRIDO.md` - Guía de optimización
- ✅ `DEPLOYMENT_HIBRIDO_700MB.md` - Esta guía

---

**¡Listo para deployment optimizado! 🚀**

