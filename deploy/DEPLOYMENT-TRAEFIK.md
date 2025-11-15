# 🚀 Deployment con Traefik - emberdrago.com

Guía específica para deployment en servidor con Traefik ya configurado.

## 📋 Información

- **IP**: 173.249.205.142
- **Subdominio**: emberdrago.com
- **Puerto API**: 3009
- **Traefik**: Ya configurado en el servidor

## 🚀 Deployment Rápido

### Paso 1: Conectarse al servidor

```bash
ssh root@173.249.205.142
# Contraseña: a9psHSvLyrKock45yE2F
```

### Paso 2: Ir al directorio del proyecto

```bash
cd /opt/cocolu-bot
```

### Paso 3: Instalar dependencias (si es necesario)

```bash
npm install --production
```

### Paso 4: Configurar .env

```bash
nano .env
```

Asegúrate de tener:
- `META_JWT_TOKEN`
- `META_NUMBER_ID`
- `META_VERIFY_TOKEN`
- Otros valores necesarios

### Paso 5: Deployment con Traefik

```bash
chmod +x deploy/deploy-traefik.sh
sudo ./deploy/deploy-traefik.sh emberdrago.com
```

Este script:
- Instala dependencias
- Inicia la aplicación con PM2
- Crea configuración para Traefik
- No interfiere con Nginx existente

## 🌐 Configuración de Traefik

El script crea un archivo de configuración en `/etc/traefik/dynamic/cocolu-bot.yml`.

### Si Traefik usa archivos de configuración:

1. Verifica que Traefik esté leyendo el directorio `/etc/traefik/dynamic/`
2. El archivo se crea automáticamente en el deployment
3. Recarga Traefik: `systemctl reload traefik` o reinicia el contenedor

### Si Traefik usa Docker:

Necesitarás agregar labels a un contenedor o usar un servicio externo. El script crea el archivo de ejemplo, pero puedes necesitar adaptarlo.

### Configuración manual de Traefik:

Si prefieres configurar manualmente, edita tu configuración de Traefik y agrega:

```yaml
http:
  routers:
    cocolu:
      rule: "Host(`emberdrago.com`)"
      service: cocolu-api
      entryPoints:
        - websecure
      tls:
        certResolver: letsencrypt

  services:
    cocolu-api:
      loadBalancer:
        servers:
          - url: "http://localhost:3009"
```

## 🔧 Configuración de DNS

Configura en tu proveedor de DNS:

```
Tipo: A
Nombre: emberdrago (o @ si es dominio raíz)
Valor: 173.249.205.142
TTL: 3600 (o automático)
```

## 🔄 Verificar Deployment

```bash
# Ver estado de PM2
pm2 status

# Ver logs
pm2 logs cocolu-bot

# Verificar que la app esté escuchando
netstat -tuln | grep 3009

# Verificar Traefik
systemctl status traefik
# O si es Docker:
docker ps | grep traefik
```

## 🌐 URLs de Acceso

Una vez configurado:

- **Dashboard**: https://emberdrago.com
- **API**: https://emberdrago.com/api
- **Webhooks Meta**: https://emberdrago.com/webhooks/whatsapp
- **Health**: https://emberdrago.com/api/health

## 🔧 Actualizar Webhook de Meta

En Meta Developers, actualiza el webhook:

1. URL: `https://emberdrago.com/webhooks/whatsapp`
2. Verify Token: El mismo que configuraste en `.env`
3. Campos suscritos: `messages`, `messaging_postbacks`

## 📝 Comandos Útiles

### PM2
```bash
pm2 status              # Ver estado
pm2 logs cocolu-bot     # Ver logs
pm2 restart cocolu-bot  # Reiniciar
pm2 monit               # Monitoreo
```

### Traefik
```bash
# Si es servicio systemd
systemctl status traefik
systemctl reload traefik

# Si es Docker
docker ps | grep traefik
docker logs traefik
docker restart traefik
```

### Verificar configuración
```bash
./deploy/verificar-traefik.sh emberdrago.com
```

## 🔄 Actualizar la Aplicación

```bash
cd /opt/cocolu-bot
git pull                    # Si usas Git
npm install --production    # Si hay nuevas dependencias
pm2 restart cocolu-bot      # Reiniciar
```

## 🐛 Troubleshooting

### La aplicación no responde

```bash
# Verificar que esté corriendo
pm2 status

# Ver logs de errores
pm2 logs cocolu-bot --err

# Verificar puerto
netstat -tuln | grep 3009
```

### Traefik no enruta correctamente

```bash
# Verificar configuración de Traefik
cat /etc/traefik/dynamic/cocolu-bot.yml

# Ver logs de Traefik
journalctl -u traefik -f
# O si es Docker:
docker logs traefik -f

# Verificar que Traefik esté leyendo el archivo
# Revisa tu traefik.yml principal
```

### Problemas de SSL

```bash
# Verificar certificado
certbot certificates

# Renovar certificado
certbot renew
```

## 📞 Notas Importantes

1. **Traefik debe tener acceso al puerto 3009**: Asegúrate de que Traefik pueda acceder a `localhost:3009`

2. **Firewall**: Si tienes firewall, permite los puertos 80 y 443

3. **DNS**: Puede tardar hasta 24 horas en propagarse, pero normalmente es más rápido

4. **SSL**: Traefik debería obtener automáticamente el certificado SSL con Let's Encrypt

