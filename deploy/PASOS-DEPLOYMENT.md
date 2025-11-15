# 🚀 Pasos Rápidos para Deployment

## ✅ Ya completado:
- ✅ Archivos subidos al servidor
- ✅ Servidor tiene Traefik y Nginx

## 📝 Pasos siguientes (en el servidor):

### 1. Conectarse al servidor
```bash
ssh root@173.249.205.142
# Contraseña: a9psHSvLyrKock45yE2F
```

### 2. Ir al directorio del proyecto
```bash
cd /opt/cocolu-bot
```

### 3. Instalar dependencias
```bash
npm install --production
```

### 4. Configurar .env
```bash
nano .env
```

Configura al menos:
- `META_JWT_TOKEN`
- `META_NUMBER_ID`
- `META_VERIFY_TOKEN`

### 5. Deployment con Traefik
```bash
chmod +x deploy/deploy-traefik.sh
sudo ./deploy/deploy-traefik.sh emberdrago.com
```

### 6. Verificar que funciona
```bash
pm2 status
pm2 logs cocolu-bot
```

### 7. Configurar DNS
En tu proveedor de DNS, agrega:
```
Tipo: A
Nombre: emberdrago
Valor: 173.249.205.142
```

### 8. Actualizar webhook de Meta
En Meta Developers:
- URL: `https://emberdrago.com/webhooks/whatsapp`
- Verify Token: (el mismo de tu .env)

## 🌐 URLs después del deployment:
- Dashboard: https://emberdrago.com
- API: https://emberdrago.com/api
- Webhooks: https://emberdrago.com/webhooks/whatsapp

## 🔧 Si Traefik no detecta automáticamente:

Puede que necesites configurar Traefik manualmente. El script crea el archivo en `/etc/traefik/dynamic/cocolu-bot.yml`, pero verifica que Traefik esté leyendo ese directorio.

Verifica la configuración de Traefik:
```bash
# Ver cómo está configurado Traefik
cat /etc/traefik/traefik.yml
# O si es Docker:
docker exec traefik cat /etc/traefik/traefik.yml
```

