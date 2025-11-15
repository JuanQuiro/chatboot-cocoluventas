# 🚀 Guía de Deployment - Cocolu Bot

Esta guía te ayudará a desplegar el bot en tu VPS.

## 📋 Información del Servidor

- **IP**: 173.249.205.142
- **IPv6**: 2607:9000:700:1063::/64
- **Hostname**: Exito
- **Recursos**: 3GB RAM, 2 CPU cores, 40GB storage
- **Contraseña**: a9psHSvLyrKock45yE2F

## 🔧 Paso 1: Conectarse al Servidor

```bash
ssh root@173.249.205.142
# Contraseña: a9psHSvLyrKock45yE2F
```

## 🔧 Paso 2: Setup Inicial del VPS

Una vez conectado, ejecuta el script de setup:

```bash
# Subir el proyecto al servidor (desde tu máquina local)
scp -r /home/alberto/Documentos/chatboot-cocoluventas root@173.249.205.142:/opt/

# O clonar desde Git (si tienes repositorio)
cd /opt
git clone [TU_REPOSITORIO] cocolu-bot

# Ejecutar setup
cd /opt/cocolu-bot
chmod +x deploy/setup-vps.sh
sudo ./deploy/setup-vps.sh
```

Este script instalará:
- Node.js 20.x
- PM2 (gestor de procesos)
- Nginx (servidor web)
- Certbot (para SSL)
- Firewall (UFW)
- Fail2Ban (seguridad)

## 🔧 Paso 3: Configurar Variables de Entorno

Edita el archivo `.env` con tus credenciales:

```bash
nano /opt/cocolu-bot/.env
```

Asegúrate de configurar:
- `META_JWT_TOKEN` - Token de Meta
- `META_NUMBER_ID` - ID del número de WhatsApp
- `META_VERIFY_TOKEN` - Token de verificación del webhook
- `MONGODB_URI` - URI de MongoDB (si usas)
- Otros valores necesarios

## 🔧 Paso 4: Deployment

Ejecuta el script de deployment:

```bash
cd /opt/cocolu-bot
chmod +x deploy/deploy.sh
sudo ./deploy/deploy.sh [TU_DOMINIO]
```

Si tienes un dominio, pásalo como argumento:
```bash
sudo ./deploy/deploy.sh mi-dominio.com
```

Si no tienes dominio, se usará la IP:
```bash
sudo ./deploy/deploy.sh
```

## 🔧 Paso 5: Configurar Dominio (Opcional)

Si tienes un dominio:

1. **Configurar DNS**: Apunta tu dominio a la IP del servidor
   ```
   A     @     173.249.205.142
   A     www   173.249.205.142
   ```

2. **Obtener certificado SSL**:
   ```bash
   certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
   ```

## 🔧 Paso 6: Verificar Deployment

```bash
# Ver estado de PM2
pm2 status

# Ver logs
pm2 logs cocolu-bot

# Ver logs en tiempo real
pm2 logs cocolu-bot --lines 50

# Monitoreo
pm2 monit
```

## 📝 Comandos Útiles

### Gestión de la Aplicación

```bash
# Reiniciar aplicación
pm2 restart cocolu-bot

# Detener aplicación
pm2 stop cocolu-bot

# Iniciar aplicación
pm2 start cocolu-bot

# Ver logs
pm2 logs cocolu-bot

# Ver logs de errores
pm2 logs cocolu-bot --err

# Ver logs de salida
pm2 logs cocolu-bot --out

# Monitoreo en tiempo real
pm2 monit

# Reiniciar todos los procesos
pm2 restart all

# Guardar configuración actual
pm2 save
```

### Gestión de Nginx

```bash
# Reiniciar Nginx
systemctl restart nginx

# Recargar configuración
systemctl reload nginx

# Ver estado
systemctl status nginx

# Ver logs
tail -f /var/log/nginx/cocolu-access.log
tail -f /var/log/nginx/cocolu-error.log
```

### Gestión del Sistema

```bash
# Ver uso de recursos
htop

# Ver espacio en disco
df -h

# Ver procesos
ps aux | grep node

# Ver puertos en uso
netstat -tulpn | grep LISTEN
```

## 🔒 Seguridad

### Firewall (UFW)

```bash
# Ver estado
ufw status

# Permitir puerto
ufw allow 80/tcp
ufw allow 443/tcp

# Bloquear IP
ufw deny from [IP_ADDRESS]
```

### Fail2Ban

```bash
# Ver estado
systemctl status fail2ban

# Ver IPs bloqueadas
fail2ban-client status sshd
```

## 🔄 Actualizar la Aplicación

Para actualizar el código:

```bash
cd /opt/cocolu-bot

# Si usas Git
git pull origin main

# O subir archivos nuevos
# scp -r ./ root@173.249.205.142:/opt/cocolu-bot/

# Reinstalar dependencias (si hay cambios)
npm install --production

# Reiniciar aplicación
pm2 restart cocolu-bot
```

## 🐛 Troubleshooting

### La aplicación no inicia

```bash
# Ver logs de PM2
pm2 logs cocolu-bot --lines 100

# Verificar que el puerto esté disponible
lsof -i :3008
lsof -i :3009

# Verificar permisos
ls -la /opt/cocolu-bot
```

### Nginx no funciona

```bash
# Verificar configuración
nginx -t

# Ver logs
tail -f /var/log/nginx/error.log
```

### Problemas de memoria

```bash
# Ver uso de memoria
free -h

# Reiniciar aplicación si usa mucha memoria
pm2 restart cocolu-bot
```

## 📊 Monitoreo

### Ver métricas en tiempo real

```bash
pm2 monit
```

### Ver logs de la aplicación

```bash
# Logs de PM2
pm2 logs cocolu-bot

# Logs de la aplicación
tail -f /opt/cocolu-bot/logs/node-api.log
tail -f /opt/cocolu-bot/logs/rust-api.log
```

## 🌐 URLs de Acceso

- **Dashboard**: http://173.249.205.142 (o tu dominio)
- **API**: http://173.249.205.142/api
- **Health Check**: http://173.249.205.142/api/health

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `pm2 logs cocolu-bot`
2. Verifica el estado: `pm2 status`
3. Revisa Nginx: `systemctl status nginx`
4. Verifica firewall: `ufw status`

