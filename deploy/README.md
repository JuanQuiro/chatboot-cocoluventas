# 🚀 Scripts de Deployment

Scripts para desplegar Cocolu Bot en tu VPS.

## 📋 Información del VPS

- **IP**: 173.249.205.142
- **Usuario**: root
- **Contraseña**: a9psHSvLyrKock45yE2F
- **Directorio de la app**: /opt/cocolu-bot

## 🚀 Deployment Rápido

### Opción 1: Desde tu máquina local (Recomendado)

```bash
# 1. Subir archivos al servidor
./deploy/upload-to-vps.sh

# 2. Conectarse al servidor
./deploy/connect-vps.sh

# 3. En el servidor, ejecutar setup (solo la primera vez)
cd /opt/cocolu-bot
sudo ./deploy/setup-vps.sh

# 4. Configurar .env
nano .env

# 5. Hacer deployment
sudo ./deploy/deploy.sh [tu-dominio.com]
```

### Opción 2: Manual

1. **Conectarse al servidor**:
   ```bash
   ssh root@173.249.205.142
   # Contraseña: a9psHSvLyrKock45yE2F
   ```

2. **Subir archivos** (desde tu máquina local):
   ```bash
   scp -r /home/alberto/Documentos/chatboot-cocoluventas root@173.249.205.142:/opt/
   ```

3. **En el servidor, ejecutar setup**:
   ```bash
   cd /opt/chatboot-cocoluventas
   sudo ./deploy/setup-vps.sh
   ```

4. **Configurar .env**:
   ```bash
   nano .env
   ```

5. **Hacer deployment**:
   ```bash
   sudo ./deploy/deploy.sh
   ```

## 📝 Scripts Disponibles

### `setup-vps.sh`
Setup inicial del VPS. Instala todas las dependencias necesarias.
- Node.js 20.x
- PM2
- Nginx
- Certbot
- Firewall
- Fail2Ban

**Uso**: `sudo ./deploy/setup-vps.sh`

### `deploy.sh`
Deployment completo de la aplicación.
- Copia archivos
- Instala dependencias
- Configura Nginx
- Inicia con PM2

**Uso**: `sudo ./deploy/deploy.sh [dominio]`

### `upload-to-vps.sh`
Sube el proyecto al VPS desde tu máquina local.

**Uso**: `./deploy/upload-to-vps.sh`

### `connect-vps.sh`
Conecta rápidamente al VPS.

**Uso**: `./deploy/connect-vps.sh`

### `quick-deploy.sh`
Deployment rápido (cuando ya está configurado).

**Uso**: `sudo ./deploy/quick-deploy.sh`

## 🔧 Configuración Post-Deployment

### 1. Configurar Variables de Entorno

Edita `/opt/cocolu-bot/.env`:

```bash
nano /opt/cocolu-bot/.env
```

Variables importantes:
- `META_JWT_TOKEN`
- `META_NUMBER_ID`
- `META_VERIFY_TOKEN`
- `MONGODB_URI` (si usas MongoDB)

### 2. Configurar Dominio (Opcional)

Si tienes un dominio:

1. Configura DNS para apuntar a `173.249.205.142`
2. Ejecuta:
   ```bash
   certbot --nginx -d tu-dominio.com
   ```

### 3. Actualizar Webhook de Meta

Actualiza la URL del webhook en Meta Developers:
- URL: `https://tu-dominio.com/webhooks/whatsapp` (o `http://173.249.205.142/webhooks/whatsapp`)
- Verify Token: El mismo que configuraste en `.env`

## 📊 Comandos Útiles

### PM2
```bash
pm2 status              # Ver estado
pm2 logs cocolu-bot     # Ver logs
pm2 restart cocolu-bot  # Reiniciar
pm2 monit               # Monitoreo
```

### Nginx
```bash
systemctl status nginx  # Ver estado
systemctl reload nginx  # Recargar configuración
nginx -t                # Probar configuración
```

### Logs
```bash
# Logs de PM2
pm2 logs cocolu-bot

# Logs de Nginx
tail -f /var/log/nginx/cocolu-access.log
tail -f /var/log/nginx/cocolu-error.log

# Logs de la aplicación
tail -f /opt/cocolu-bot/logs/node-api.log
```

## 🔄 Actualizar la Aplicación

```bash
cd /opt/cocolu-bot
git pull                    # Si usas Git
npm install --production    # Si hay nuevas dependencias
pm2 restart cocolu-bot      # Reiniciar
```

O usa el script rápido:
```bash
sudo ./deploy/quick-deploy.sh
```

## 🌐 URLs

- **Dashboard**: http://173.249.205.142
- **API**: http://173.249.205.142/api
- **Health**: http://173.249.205.142/api/health

## 🔒 Seguridad

- Firewall (UFW) configurado
- Fail2Ban activo
- Usuario dedicado para la aplicación (`cocolu`)
- Logs en directorio separado

## 📞 Troubleshooting

Ver `DEPLOYMENT.md` para más detalles sobre troubleshooting.

