# 🚀 COCOLU BOT - LISTO PARA PRODUCCIÓN

**Estado**: ✅ **COMPLETAMENTE FUNCIONAL**  
**Adaptador**: Meta (WhatsApp Cloud API)  
**Consumo RAM**: ~200–350 MB  
**Tiempo de despliegue**: ~30 minutos  

---

## 📋 CHECKLIST RÁPIDO

- [x] Bot con Meta validado y funcionando.
- [x] Webhooks probados (Status 200).
- [x] 10 flujos activos y sin errores críticos.
- [x] Dashboard compilable.
- [x] Keys Meta verificadas.
- [x] Cloudflare Tunnel expuesto.
- [ ] **PRÓXIMO**: Desplegar en VPS.

---

## 🎯 PASO 1: CONTRATAR VPS (5 minutos)

### Opciones recomendadas

| Proveedor | Specs | Precio | Link |
|-----------|-------|--------|------|
| **Vultr** | 1 vCPU, 1 GB RAM, 25 GB SSD | $3.50/mes | vultr.com |
| **DigitalOcean** | 1 vCPU, 1 GB RAM, 25 GB SSD | $5/mes | digitalocean.com |
| **Linode** | 1 vCPU, 1 GB RAM, 25 GB SSD | $5/mes | linode.com |
| **Hetzner** | 1 vCPU, 2 GB RAM, 40 GB SSD | €3/mes | hetzner.com |

**Recomendación**: Vultr o Hetzner (más barato).

### Al crear el VPS

- **SO**: Debian 12 o Ubuntu 22.04 LTS.
- **Región**: La más cercana a ti (o a tus usuarios).
- **Copia la IP pública** que te dan.

---

## 🔧 PASO 2: CONECTAR AL VPS (2 minutos)

```bash
# En tu PC, conecta por SSH
ssh root@TU_IP_VPS

# O si tienes clave privada
ssh -i /ruta/a/clave.pem root@TU_IP_VPS
```

---

## 📥 PASO 3: PREPARAR EL VPS (5 minutos)

Copia y pega esto en la terminal del VPS:

```bash
#!/bin/bash

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 global
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Instalar Git
sudo apt install -y git

# Crear usuario para el bot (opcional pero recomendado)
sudo useradd -m -s /bin/bash cocolu || true

echo "✅ VPS preparado"
```

---

## 📥 PASO 4: CLONAR PROYECTO (3 minutos)

```bash
# Ir a home del usuario
cd /home/cocolu  # o /root si usas root

# Clonar tu repositorio
git clone https://github.com/TU_USUARIO/cocolu-bot.git
cd cocolu-bot

# Instalar dependencias (sin dev, para ahorrar espacio)
npm install --omit=dev

# Compilar dashboard
cd dashboard
npm install --omit=dev
npm run build
cd ..

echo "✅ Proyecto listo"
```

**Tiempo**: ~3–5 minutos (depende de velocidad de internet).

---

## 🗄️ PASO 5: CONFIGURAR MONGODB ATLAS (3 minutos)

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea cuenta gratuita.
3. Crea cluster M0 (gratuito, 512 MB).
4. Obtén URI de conexión (algo como):
   ```
   mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/cocolu?retryWrites=true&w=majority
   ```

---

## 📝 PASO 6: CONFIGURAR `.env` (2 minutos)

En el VPS, edita `/home/cocolu/cocolu-bot/.env`:

```bash
nano .env
```

Pega esto (reemplaza con tus valores):

```env
# Bot
BOT_ADAPTER=meta
NODE_ENV=production

# Meta (tus keys)
META_JWT_TOKEN=EAAL3ftfa2LoBP0UXm4HGKq8e8ioAc9itOzxhbRtyBMVuvoZCXDjWOieX6XFL9NbIHjZA4GysMzpuddlNyZAoedoclYBYZCTQKSkEdm51DEI1zNshDd5dQoP4QMIigbWUxL5fBUmWTy0VT6gP4eM5yREwGgdUKmwHfmUhGGce3JlA1y7hIJHHqkKNgA4sMQZDZD
META_NUMBER_ID=947370758449911
META_VERIFY_TOKEN=cocolu_meta_verify_123

# Puertos
PORT=3008
API_PORT=3009

# MongoDB (de Atlas)
MONGO_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/cocolu

# Limitar memoria
NODE_OPTIONS="--max-old-space-size=384"
```

Guarda: `Ctrl+O` → Enter → `Ctrl+X`

---

## 🎯 PASO 7: CREAR ECOSYSTEM.CONFIG.JS (2 minutos)

En `/home/cocolu/cocolu-bot/ecosystem.config.js`:

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'cocolu-bot',
      script: 'app-integrated.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        BOT_ADAPTER: 'meta',
      },
      max_memory_restart: '400M',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
EOF

mkdir -p logs
```

---

## 🌐 PASO 8: CONFIGURAR NGINX (3 minutos)

```bash
sudo tee /etc/nginx/sites-available/cocolu-bot > /dev/null << 'EOF'
upstream bot_api {
    server 127.0.0.1:3009;
}

upstream bot_webhook {
    server 127.0.0.1:3008;
}

server {
    listen 80;
    server_name tu-dominio.com;

    # Dashboard estático
    location / {
        root /home/cocolu/cocolu-bot/dashboard/build;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://bot_api/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Webhook de Meta
    location /webhook {
        proxy_pass http://bot_webhook/webhook;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Activar
sudo ln -s /etc/nginx/sites-available/cocolu-bot /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "✅ Nginx configurado"
```

---

## 🔐 PASO 9: HTTPS CON LET'S ENCRYPT (2 minutos)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com

# Renovación automática
sudo systemctl enable certbot.timer
```

---

## ▶️ PASO 10: INICIAR BOT CON PM2 (1 minuto)

```bash
cd /home/cocolu/cocolu-bot

# Iniciar
pm2 start ecosystem.config.js

# Guardar para que arranque al reiniciar
pm2 startup
pm2 save

# Ver estado
pm2 status

# Ver logs
pm2 logs cocolu-bot
```

---

## 🔗 PASO 11: CONFIGURAR WEBHOOK EN META (2 minutos)

En **Meta Developers Console**:

1. Ve a tu app de WhatsApp.
2. **WhatsApp** → **Configuración** → **Webhook**.
3. **Callback URL**: `https://tu-dominio.com/webhook`
4. **Verify token**: `cocolu_meta_verify_123`
5. Haz clic en **Verify and Save**.

Si sale ✅ verde, está listo.

---

## 📊 PASO 12: VERIFICAR QUE TODO FUNCIONA (2 minutos)

```bash
# Ver consumo de RAM
pm2 monit

# Ver logs en tiempo real
pm2 logs cocolu-bot

# Probar API
curl https://tu-dominio.com/api/health

# Probar webhook
curl -X POST https://tu-dominio.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"object":"whatsapp_business_account"}'
```

---

## 🎉 ¡LISTO!

Tu bot está en producción:

- 🌐 **Dashboard**: https://tu-dominio.com
- 📱 **API**: https://tu-dominio.com/api
- 🔗 **Webhook**: https://tu-dominio.com/webhook

---

## 📈 MONITOREO CONTINUO

```bash
# Ver estado cada 5 segundos
watch -n 5 'pm2 status'

# Ver logs con filtro
pm2 logs cocolu-bot | grep "ERROR\|WARN"

# Reiniciar si hay problema
pm2 restart cocolu-bot

# Ver métricas
pm2 monit
```

---

## 🆘 TROUBLESHOOTING

### El bot se reinicia constantemente

```bash
# Ver logs detallados
pm2 logs cocolu-bot --lines 100

# Aumentar memoria si es necesario
# En ecosystem.config.js: max_memory_restart: '450M'
pm2 restart cocolu-bot
```

### MongoDB no conecta

```bash
# Verificar URI en .env
# Probar conexión
node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('✅')).catch(e => console.error('❌', e))"
```

### Webhook no llega

```bash
# Ver si Nginx está corriendo
sudo systemctl status nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar que Meta tiene la URL correcta
curl -v https://tu-dominio.com/webhook
```

---

## 📋 RESUMEN DE TIEMPOS

| Paso | Tiempo |
|------|--------|
| 1. Contratar VPS | 5 min |
| 2. Conectar SSH | 2 min |
| 3. Preparar VPS | 5 min |
| 4. Clonar proyecto | 5 min |
| 5. MongoDB Atlas | 3 min |
| 6. `.env` | 2 min |
| 7. ecosystem.config.js | 2 min |
| 8. Nginx | 3 min |
| 9. HTTPS | 2 min |
| 10. PM2 | 1 min |
| 11. Meta webhook | 2 min |
| 12. Verificar | 2 min |
| **TOTAL** | **~35 min** |

---

## 🎯 PRÓXIMOS PASOS (Opcional)

- **Monitoreo**: Uptime Robot para alertas.
- **Backups**: Configurar backups automáticos de MongoDB Atlas.
- **CDN**: Cloudflare para acelerar dashboard.
- **Logs**: Integrar con Sentry o similar.
- **Escalado**: Si crece, usar Redis para caché.

---

## 📞 SOPORTE

Si algo falla:

1. Revisa los logs: `pm2 logs cocolu-bot`
2. Verifica `.env` tiene valores correctos.
3. Comprueba que MongoDB Atlas está accesible.
4. Asegúrate de que el dominio apunta a la IP del VPS.

---

**¡Éxito en el despliegue! 🚀**

