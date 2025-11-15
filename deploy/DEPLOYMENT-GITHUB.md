# 🚀 Deployment desde GitHub

Guía para desplegar el proyecto desde GitHub en el servidor.

## 📋 Repositorio

- **URL**: https://github.com/JuanQuiro/chatboot-cocoluventas.git
- **Servidor**: 173.249.205.142 (Alpine Linux)
- **Dominio**: emberdrago.com

## 🚀 Deployment Rápido

### Paso 1: Subir cambios a GitHub (en tu máquina local)

```bash
cd /home/alberto/Documentos/chatboot-cocoluventas

# Agregar cambios
git add .

# Commit
git commit -m "Deployment setup con GitHub"

# Push
git push
```

### Paso 2: Conectarse al servidor

```bash
ssh root@173.249.205.142
# Contraseña: a9psHSvLyrKock45yE2F
```

### Paso 3: Ejecutar deployment en el servidor

**Opción A: Descargar script y ejecutar**

```bash
cd /opt
wget https://raw.githubusercontent.com/JuanQuiro/chatboot-cocoluventas/main/deploy/deploy-desde-github.sh
chmod +x deploy-desde-github.sh
bash deploy-desde-github.sh https://github.com/JuanQuiro/chatboot-cocoluventas.git
```

**Opción B: Clonar repositorio completo**

```bash
cd /opt
rm -rf cocolu-bot  # Si existe
git clone https://github.com/JuanQuiro/chatboot-cocoluventas.git cocolu-bot
cd cocolu-bot
bash deploy/deploy-desde-github.sh https://github.com/JuanQuiro/chatboot-cocoluventas.git
```

**Opción C: Si ya tienes el repo clonado**

```bash
cd /opt/cocolu-bot
git pull
bash deploy/deploy-desde-github.sh
```

## 🔄 Actualizar la Aplicación

Para actualizar después de hacer cambios:

```bash
# En el servidor
cd /opt/cocolu-bot
git pull
npm install --production
pm2 restart cocolu-bot
```

## 📝 Configuración Post-Deployment

### 1. Configurar .env

```bash
nano /opt/cocolu-bot/.env
```

Configura:
- `META_JWT_TOKEN`
- `META_NUMBER_ID`
- `META_VERIFY_TOKEN`
- Otros valores necesarios

### 2. Configurar DNS

En tu proveedor de DNS:
```
Tipo: A
Nombre: emberdrago
Valor: 173.249.205.142
TTL: 3600
```

### 3. Recargar Traefik

```bash
# Si es servicio systemd
systemctl reload traefik

# Si es Docker
docker restart traefik
```

### 4. Actualizar Webhook de Meta

En Meta Developers:
- URL: `https://emberdrago.com/webhooks/whatsapp`
- Verify Token: (el mismo de tu .env)

## 🌐 URLs

- **Dashboard**: https://emberdrago.com
- **API**: https://emberdrago.com/api
- **Webhooks**: https://emberdrago.com/webhooks/whatsapp
- **Health**: https://emberdrago.com/api/health

## 🔧 Comandos Útiles

### PM2
```bash
pm2 status              # Ver estado
pm2 logs cocolu-bot     # Ver logs
pm2 restart cocolu-bot  # Reiniciar
pm2 monit               # Monitoreo en tiempo real
pm2 stop cocolu-bot     # Detener
```

### Git
```bash
cd /opt/cocolu-bot
git status              # Ver estado
git pull                # Actualizar
git log --oneline -10   # Ver últimos commits
```

### Verificar Deployment
```bash
# Ver que la app está corriendo
pm2 list

# Ver que está escuchando en el puerto
netstat -tuln | grep 3009
# O
ss -tuln | grep 3009

# Ver logs en tiempo real
pm2 logs cocolu-bot --lines 50
```

## 🐛 Troubleshooting

### La aplicación no inicia

```bash
# Ver logs de errores
pm2 logs cocolu-bot --err

# Verificar Node.js
node --version
npm --version

# Verificar dependencias
cd /opt/cocolu-bot
npm install --production
```

### Traefik no enruta

```bash
# Verificar configuración
cat /etc/traefik/dynamic/cocolu-bot.yml

# Ver logs de Traefik
journalctl -u traefik -f
# O si es Docker
docker logs traefik -f
```

### Problemas con Git

```bash
# Si hay conflictos
cd /opt/cocolu-bot
git fetch origin
git reset --hard origin/main
# O
git reset --hard origin/master
```

## 📝 Notas

- El script detecta automáticamente Alpine Linux
- Instala Node.js, npm y PM2 si no están instalados
- Crea configuración de PM2 y Traefik automáticamente
- El archivo `.env` NO se sube a GitHub (está en .gitignore)
- Los `tokens/` tampoco se suben (están en .gitignore)

