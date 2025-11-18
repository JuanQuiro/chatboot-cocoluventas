# 🚀 INICIO UNIFICADO - COCOLU VENTAS

## ⚡ Inicio Rápido (Una Sola Línea)

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

---

## 📋 ¿Qué Hace el Script?

El script `START.sh` (o `START.bat` en Windows) hace TODO automáticamente:

1. ✅ Verifica dependencias (Node.js, npm)
2. ✅ Instala dependencias del backend
3. ✅ Instala dependencias del dashboard
4. ✅ Compila el dashboard React
5. ✅ Verifica configuración (.env)
6. ✅ Inicia TODO el sistema

---

## 🎯 Configuración Simplificada

### Solo Meta (Mejor Rendimiento)

El sistema ahora usa **SOLO Meta** para mejor rendimiento:

```bash
# Antes (múltiples adaptadores)
npm start:baileys
npm start:venom
npm start:wppconnect
npm start:twilio

# Ahora (solo Meta)
npm start
```

### Scripts Disponibles

```bash
# Iniciar en producción (Meta)
npm start

# Iniciar en desarrollo (Meta)
npm dev

# Debug con inspector
npm debug

# Compilar dashboard
npm run dashboard:build

# Instalar todo
npm run install:all
```

---

## 🔧 Configuración Requerida

### Archivo `.env`

Crea un archivo `.env` en la carpeta `production/`:

```env
# Meta WhatsApp API
META_JWT_TOKEN=tu_jwt_token_aqui
META_NUMBER_ID=tu_numero_id_aqui
META_VERIFY_TOKEN=tu_verify_token_aqui
META_API_VERSION=v22.0

# Puertos
PORT=5001
API_PORT=5000

# Entorno
NODE_ENV=production
BOT_ADAPTER=meta

# Base de datos
DB_PATH=./database

# Tenant
TENANT_ID=cocolu
```

---

## 📊 Puertos Utilizados

| Servicio | Puerto | URL |
|----------|--------|-----|
| Bot HTTP | 5001 | http://localhost:5001 |
| API REST | 5000 | http://localhost:5000/api |
| Dashboard | 5000 | http://localhost:5000 |
| Webhook | 5001 | http://localhost:5001/webhook |

---

## 🌐 Acceso a la Aplicación

Una vez iniciado, accede a:

```
http://localhost:5000
```

### Credenciales Demo

```
Email: admin@cocolu.com
Password: demo123 (cualquiera en desarrollo)
```

---

## 📈 Flujo de Inicio

```
1. Ejecutar START.sh
   ↓
2. Verificar dependencias
   ↓
3. Instalar dependencias
   ↓
4. Compilar dashboard
   ↓
5. Iniciar bot (Meta)
   ↓
6. Iniciar API
   ↓
7. Servir dashboard
   ↓
8. Acceder a http://localhost:5000
```

---

## 🔍 Verificar que Todo Funciona

### 1. Dashboard Carga

```bash
curl http://localhost:5000/
# Debe retornar HTML del dashboard
```

### 2. API Responde

```bash
curl http://localhost:5000/api/health
# Debe retornar JSON con estado del sistema
```

### 3. Bot Escucha

```bash
curl http://localhost:5001/webhook
# Debe retornar respuesta del bot
```

---

## 🐛 Solucionar Problemas

### Puerto ya en uso

```bash
# Cambiar puertos
PORT=5002 API_PORT=5001 npm start
```

### Dependencias no instalan

```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Dashboard no compila

```bash
# Recompilar
cd dashboard
npm run build
cd ..
```

### Meta API no conecta

```bash
# Verificar .env
cat .env | grep META_

# Debe mostrar:
# META_JWT_TOKEN=...
# META_NUMBER_ID=...
# META_VERIFY_TOKEN=...
```

---

## 📝 Logs Importantes

### Bot iniciado correctamente

```
✅ BotControlService inicializado
✅ 10 flujos PREMIUM cargados
✅ Provider configurado en AlertsService
✅ Bot HTTP server en puerto 5001
✅ API REST iniciada en puerto 5000
🌐 Dashboard: http://localhost:5000
```

### Errores comunes

```
❌ Error: listen EADDRINUSE
   → Puerto ya en uso, cambiar puerto

❌ Error: Cannot find module
   → Ejecutar: npm install

❌ Error: UNAUTHORIZED
   → Verificar credenciales Meta en .env
```

---

## 🚀 Despliegue en VPS

### Usando Docker

```bash
cd production
podman-compose up -d
```

### Usando PM2

```bash
cd production
pm2 start npm --name "cocolu-bot" -- start
pm2 save
```

### Usando systemd

```bash
# Crear archivo /etc/systemd/system/cocolu.service
[Unit]
Description=Cocolu Ventas Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/cocolu-bot/production
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target

# Iniciar
sudo systemctl start cocolu
sudo systemctl enable cocolu
```

---

## 📊 Estructura de Carpetas

```
production/
├── START.sh                    ← Script de inicio (Linux/Mac)
├── START.bat                   ← Script de inicio (Windows)
├── app-integrated.js           ← Aplicación principal
├── package.json                ← Dependencias
├── .env                        ← Configuración (crear)
├── src/                        ← Código fuente
│   ├── flows/                  ← 10 flujos de bot
│   ├── api/                    ← Rutas REST
│   └── services/               ← Servicios
├── dashboard/                  ← Frontend React
│   ├── src/
│   ├── build/                  ← Compilado
│   └── package.json
├── database/                   ← Base de datos JSON
└── logs/                       ← Logs del sistema
```

---

## ✨ Características

- ✅ **Unificado**: Un solo script para todo
- ✅ **Simple**: Solo Meta para mejor rendimiento
- ✅ **Rápido**: Inicia en segundos
- ✅ **Automático**: Instala y compila automáticamente
- ✅ **Multiplataforma**: Linux, Mac, Windows
- ✅ **Producción**: Listo para VPS

---

## 📞 Soporte

### Verificar versiones

```bash
node -v
npm -v
```

### Ver logs

```bash
# Logs del bot
tail -f logs/bot.log

# Logs de API
tail -f logs/api.log
```

### Reiniciar

```bash
# Matar proceso
pkill -f "node app-integrated"

# Reiniciar
./START.sh
```

---

## 🎯 Próximos Pasos

1. ✅ Crear archivo `.env` con credenciales Meta
2. ✅ Ejecutar `./START.sh`
3. ✅ Acceder a `http://localhost:5000`
4. ✅ Hacer login con `admin@cocolu.com / demo123`
5. ✅ Ver dashboard funcionando
6. ✅ Probar bot con WhatsApp

---

**¡Cocolu Ventas está listo para usar!** 🚀

**Última actualización:** Nov 18, 2025
