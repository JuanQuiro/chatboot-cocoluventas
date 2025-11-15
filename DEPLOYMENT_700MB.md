# 🚀 Despliegue Cocolu Bot en VPS de 700 MB RAM

## 📊 Resumen de Consumo Esperado

Con optimizaciones:

- **Node.js + app-integrated.js (Meta)**: ~200–280 MB
- **MongoDB Atlas (remoto)**: 0 MB (no local)
- **Dashboard (estático)**: ~5–10 MB
- **Sistema operativo + otros**: ~150–200 MB
- **Buffer de seguridad**: ~50 MB

**Total estimado: ~600–700 MB** ✅

---

## 🔧 Paso 1: Preparar el VPS (Debian/Ubuntu)

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2

# Instalar Nginx (proxy + estático)
sudo apt install -y nginx

# Verificar versiones
node -v    # v22.x
npm -v     # 9.x+
```

---

## 📥 Paso 2: Clonar y Preparar el Proyecto

```bash
# En el VPS, en /home/usuario/
cd ~
git clone <tu-repo> cocolu-bot
cd cocolu-bot

# Instalar solo dependencias de producción (sin dev)
npm install --omit=dev

# Compilar dashboard (una sola vez)
cd dashboard
npm install --omit=dev
npm run build
cd ..

# Resultado: dashboard/build/ contiene los archivos estáticos
```

**Tamaño después:**
- `node_modules`: ~600 MB
- `dashboard/build`: ~80 MB
- Código fuente: ~50 MB
- **Total: ~730 MB** (cabe en 1 GB de disco)

---

## 🗄️ Paso 3: Configurar MongoDB Atlas (Remoto)

En lugar de MongoDB local (que consume ~200 MB):

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita.
3. Crea un cluster gratuito (M0, 512 MB).
4. Obtén la URI de conexión:
   ```
   mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/cocolu?retryWrites=true&w=majority
   ```

5. En tu `.env` del VPS:
   ```env
   MONGO_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/cocolu
   ```

**Ventaja:** 0 MB de RAM local, todo en la nube.

---

## 📝 Paso 4: Configurar `.env` para Producción

En `/home/usuario/cocolu-bot/.env`:

```env
# Bot
BOT_ADAPTER=meta
NODE_ENV=production

# Meta
META_JWT_TOKEN=EAAL3ftfa2LoBP0UXm4HGKq8e8ioAc9itOzxhbRtyBMVuvoZCXDjWOieX6XFL9NbIHjZA4GysMzpuddlNyZAoedoclYBYZCTQKSkEdm51DEI1zNshDd5dQoP4QMIigbWUxL5fBUmWTy0VT6gP4eM5yREwGgdUKmwHfmUhGGce3JlA1y7hIJHHqkKNgA4sMQZDZD
META_NUMBER_ID=947370758449911
META_VERIFY_TOKEN=cocolu_meta_verify_123

# Puertos
PORT=3008
API_PORT=3009

# MongoDB (remoto)
MONGO_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/cocolu

# Limitar memoria Node
NODE_OPTIONS="--max-old-space-size=384"
```

---

## 🎯 Paso 5: Crear Script de Inicio (PM2)

Archivo: `/home/usuario/cocolu-bot/ecosystem.config.js`

```javascript
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
        NODE_OPTIONS: '--max-old-space-size=384',
      },
      max_memory_restart: '400M',  // Reinicia si supera 400 MB
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
```

Crear carpeta de logs:

```bash
mkdir -p logs
```

---

## 🚀 Paso 6: Configurar Nginx (Proxy + Dashboard Estático)

Archivo: `/etc/nginx/sites-available/cocolu-bot`

```nginx
upstream bot_api {
    server 127.0.0.1:3009;
}

upstream bot_webhook {
    server 127.0.0.1:3008;
}

server {
    listen 80;
    server_name tu-dominio.com;

    # Redirigir HTTP a HTTPS (opcional, si tienes certificado)
    # return 301 https://$server_name$request_uri;

    # Dashboard estático
    location / {
        root /home/usuario/cocolu-bot/dashboard/build;
        try_files $uri $uri/ /index.html;
    }

    # API del bot
    location /api/ {
        proxy_pass http://bot_api/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
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
```

Activar:

```bash
sudo ln -s /etc/nginx/sites-available/cocolu-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔐 Paso 7: HTTPS con Let's Encrypt (Opcional pero Recomendado)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

Nginx se configura automáticamente con HTTPS.

---

## ▶️ Paso 8: Iniciar el Bot con PM2

```bash
cd /home/usuario/cocolu-bot

# Iniciar
pm2 start ecosystem.config.js

# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs cocolu-bot

# Configurar para que arranque al reiniciar VPS
pm2 startup
pm2 save
```

---

## 📊 Monitorear Consumo de RAM

```bash
# Ver consumo en tiempo real
pm2 monit

# O con ps
ps aux | grep "app-integrated.js"

# O con top
top -p $(pgrep -f "app-integrated.js")
```

Esperado: **200–350 MB** para el proceso Node.

---

## 🔗 Configurar Webhook en Meta

En Meta Developers:

- **Callback URL**: `https://tu-dominio.com/webhook`
- **Verify token**: `cocolu_meta_verify_123`

Meta ahora enviará webhooks a tu servidor en producción.

---

## 📋 Checklist Final

- [ ] VPS con 700 MB RAM (o 1 GB para comodidad).
- [ ] Node.js 22.x instalado.
- [ ] Proyecto clonado y `npm install --omit=dev` ejecutado.
- [ ] Dashboard compilado (`npm run build`).
- [ ] MongoDB Atlas configurado (remoto).
- [ ] `.env` con credenciales Meta y MongoDB.
- [ ] PM2 configurado con `ecosystem.config.js`.
- [ ] Nginx corriendo como proxy.
- [ ] Webhook de Meta apuntando a tu dominio.
- [ ] Logs monitoreados con `pm2 logs`.

---

## 🆘 Troubleshooting

### El bot se reinicia constantemente

Probable causa: supera 400 MB de RAM.

Solución:
```bash
# Aumentar límite en ecosystem.config.js
max_memory_restart: '450M'

# O reducir Node heap
NODE_OPTIONS="--max-old-space-size=300"
```

### MongoDB no conecta

Verificar:
```bash
# Probar conexión
node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('✅ OK')).catch(e => console.error('❌', e))"
```

### Webhook no llega

Verificar:
```bash
# Ver logs del bot
pm2 logs cocolu-bot

# Verificar que Nginx está corriendo
sudo systemctl status nginx

# Probar URL
curl https://tu-dominio.com/webhook
```

---

## 📈 Próximos Pasos (Opcional)

- **Redis**: Si necesitas caché, usa Redis Cloud (gratuito).
- **CDN**: Cloudflare para acelerar dashboard estático.
- **Monitoreo**: Uptime Robot para alertas si el bot cae.
- **Backups**: Configurar backups automáticos de MongoDB Atlas.

---

**Resumen:**  
Con esta configuración, tu bot corre en ~700 MB de RAM sin problemas, con Meta Cloud API, dashboard estático, y MongoDB remoto. Todo escalable y sin Rust (por ahora).

