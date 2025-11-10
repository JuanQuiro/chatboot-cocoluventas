# 🚀 INICIO RÁPIDO - LEVANTAR EN LOCAL

## Pasos para levantar el sistema

---

## 1️⃣ INSTALAR DEPENDENCIAS

```bash
# En la raíz del proyecto
cd /home/alberto/Documentos/chatboot-cocoluventas

# Instalar backend
npm install

# Instalar frontend
cd dashboard
npm install
cd ..
```

---

## 2️⃣ CONFIGURAR VARIABLES DE ENTORNO

```bash
# Crear archivo .env en la raíz
cp .env.example .env

# O crear manualmente:
nano .env
```

### Contenido mínimo del .env:

```env
# Servidor
PORT=3001
NODE_ENV=development

# MongoDB (asegúrate de tener MongoDB corriendo)
MONGODB_URI=mongodb://localhost:27017/cocolu-ventas-dev

# JWT
JWT_SECRET=tu-secret-key-super-segura-cambiala
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# Logs
LOG_LEVEL=debug
```

---

## 3️⃣ INICIAR MONGODB

```bash
# Opción A: Con Docker (recomendado)
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Opción B: MongoDB instalado localmente
mongod --dbpath /path/to/data
```

---

## 4️⃣ LEVANTAR BACKEND

```bash
# En la raíz del proyecto
npm run dev

# Deberías ver:
# Server running on port 3001
# MongoDB connected
# ✅ System ready
```

---

## 5️⃣ LEVANTAR FRONTEND (NUEVA TERMINAL)

```bash
# Abrir nueva terminal
cd /home/alberto/Documentos/chatboot-cocoluventas/dashboard

# Iniciar React
npm start

# Se abrirá automáticamente en:
# http://localhost:3000
```

---

## 6️⃣ ACCEDER AL SISTEMA

### Dashboard Principal
```
URL: http://localhost:3000
```

### Super Admin (TÚ)
```
Email: alberto@cocoluventas.com
Password: (crear en primer login)
```

### API Backend
```
URL: http://localhost:3001
Health: http://localhost:3001/health
API Docs: http://localhost:3001/api-docs
```

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### 1. Backend
```bash
curl http://localhost:3001/health

# Debe responder:
# {"status":"healthy","database":"connected"}
```

### 2. Frontend
```bash
# Abrir en navegador:
http://localhost:3000

# Deberías ver:
# - Login screen
# O Dashboard si ya estás logueado
```

---

## 🐛 TROUBLESHOOTING

### Error: "MongoDB no conecta"
```bash
# Verificar que MongoDB esté corriendo
docker ps  # Si usas Docker

# O
ps aux | grep mongod

# Reiniciar MongoDB
docker restart mongodb
```

### Error: "Port 3001 already in use"
```bash
# Encontrar proceso
lsof -i :3001

# Matar proceso
kill -9 <PID>

# O cambiar puerto en .env
PORT=3002
```

### Error: "Port 3000 already in use"
```bash
# Encontrar proceso
lsof -i :3000

# Matar proceso
kill -9 <PID>
```

### Error: "Module not found"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# En dashboard también
cd dashboard
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 COMANDOS ÚTILES

### Backend
```bash
npm run dev          # Desarrollo con hot reload
npm start            # Producción
npm test             # Correr tests
npm run test:watch   # Tests en watch mode
```

### Frontend
```bash
npm start            # Desarrollo
npm run build        # Build producción
npm test             # Tests
```

### Base de Datos
```bash
# Conectar a MongoDB
mongosh cocolu-ventas-dev

# Ver colecciones
show collections

# Ver usuarios
db.users.find()
```

---

## 🎯 PRIMER LOGIN

1. Ir a http://localhost:3000
2. Click en "Crear cuenta" o usar:
   - Email: alberto@cocoluventas.com
   - Password: (crear uno seguro)
3. Automáticamente tendrás rol Super Admin
4. Acceso a TODO el sistema

---

## 🚀 YA ESTÁ TODO LISTO

Sistema corriendo en:
- ✅ Backend: http://localhost:3001
- ✅ Frontend: http://localhost:3000
- ✅ MongoDB: localhost:27017

**¡A probar!** 🎉
