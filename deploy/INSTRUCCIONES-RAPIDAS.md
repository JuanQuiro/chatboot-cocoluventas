# ⚡ Instrucciones Rápidas de Deployment

## 🚀 Deployment desde GitHub

### 1️⃣ Subir cambios a GitHub (LOCAL)

```bash
cd /home/alberto/Documentos/chatboot-cocoluventas
git add .
git commit -m "Deployment setup con GitHub y Traefik"
git push
```

### 2️⃣ Conectarse al servidor

```bash
ssh root@173.249.205.142
# Contraseña: a9psHSvLyrKock45yE2F
```

### 3️⃣ Deployment en el servidor

```bash
cd /opt
git clone https://github.com/JuanQuiro/chatboot-cocoluventas.git cocolu-bot
cd cocolu-bot
bash deploy/deploy-desde-github.sh https://github.com/JuanQuiro/chatboot-cocoluventas.git
```

### 4️⃣ Configurar .env

```bash
nano /opt/cocolu-bot/.env
```

### 5️⃣ Verificar

```bash
pm2 status
pm2 logs cocolu-bot
```

## 🔄 Actualizar en el futuro

```bash
# En el servidor
cd /opt/cocolu-bot
git pull
npm install --production
pm2 restart cocolu-bot
```

## 📝 Repositorio

**URL**: https://github.com/JuanQuiro/chatboot-cocoluventas.git

