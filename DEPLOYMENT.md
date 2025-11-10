# 🚀 Guía de Deployment

Guía completa para desplegar el Chatbot Cocolu Ventas en diferentes plataformas.

## 📋 Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Variables de Entorno](#variables-de-entorno)
- [Opciones de Deployment](#opciones-de-deployment)
  - [Railway](#1-railway-recomendado)
  - [Heroku](#2-heroku)
  - [VPS Linux](#3-vps-linux-ubuntu)
  - [Docker](#4-docker)
  - [AWS EC2](#5-aws-ec2)
  - [DigitalOcean](#6-digitalocean)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Prerrequisitos

Antes de desplegar, asegúrate de tener:

- ✅ Cuenta de WhatsApp Business API
- ✅ Token de acceso de Meta configurado
- ✅ Webhook verify token generado
- ✅ Dominio o URL pública (para webhook)
- ✅ Certificado SSL/TLS (HTTPS requerido)

## Variables de Entorno

Configura estas variables en tu plataforma de deployment:

```env
# Requeridas
META_ACCESS_TOKEN=EAAxxxxxxxxxxxx
META_PHONE_NUMBER_ID=123456789
WEBHOOK_VERIFY_TOKEN=tu_token_seguro_123
PORT=3008

# Opcionales pero recomendadas
BUSINESS_NAME=Cocolu Ventas
BUSINESS_EMAIL=contacto@cocoluventas.com
BUSINESS_PHONE=+1234567890
BUSINESS_ADDRESS=Tu dirección
BUSINESS_HOURS_START=09:00
BUSINESS_HOURS_END=18:00
BUSINESS_DAYS=1,2,3,4,5
NODE_ENV=production
```

## Opciones de Deployment

### 1. Railway (Recomendado)

**Ventajas**: Fácil, gratis para empezar, auto-deploy desde GitHub.

#### Pasos:

1. **Crear cuenta en [Railway](https://railway.app/)**

2. **Conectar repositorio**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Autoriza y selecciona tu repositorio

3. **Configurar variables de entorno**
   - Ve a tu proyecto → Variables
   - Agrega todas las variables del `.env`

4. **Deploy automático**
   - Railway detecta `package.json` automáticamente
   - El deploy inicia solo
   - Obtén tu URL: `https://tu-proyecto.up.railway.app`

5. **Configurar webhook en Meta**
   - URL: `https://tu-proyecto.up.railway.app/webhook`
   - Verify Token: El que configuraste

#### Comandos útiles:
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy manual
railway up
```

---

### 2. Heroku

**Ventajas**: Popular, fácil de usar, CI/CD integrado.

#### Pasos:

1. **Instalar Heroku CLI**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Login**
```bash
heroku login
```

3. **Crear app**
```bash
heroku create chatbot-cocolu
```

4. **Configurar variables**
```bash
heroku config:set META_ACCESS_TOKEN=xxx
heroku config:set META_PHONE_NUMBER_ID=xxx
heroku config:set WEBHOOK_VERIFY_TOKEN=xxx
heroku config:set PORT=3008
# ... más variables
```

5. **Deploy**
```bash
git push heroku main
```

6. **Ver logs**
```bash
heroku logs --tail
```

#### Archivo `Procfile` (ya incluido):
```
web: node app.js
```

---

### 3. VPS Linux (Ubuntu)

**Ventajas**: Control total, económico para larga duración.

#### Pasos:

1. **Conectar al servidor**
```bash
ssh usuario@tu-servidor.com
```

2. **Instalar Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Instalar PM2**
```bash
sudo npm install -g pm2
```

4. **Clonar proyecto**
```bash
cd /var/www
git clone https://github.com/tu-usuario/chatbot-cocolu.git
cd chatbot-cocolu
```

5. **Configurar**
```bash
npm install
cp .env.example .env
nano .env  # Editar credenciales
```

6. **Iniciar con PM2**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

7. **Configurar Nginx (opcional)**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3008;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. **SSL con Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

### 4. Docker

**Ventajas**: Portable, aislado, fácil de escalar.

#### Opción A: Docker simple

```bash
# Build
docker build -t chatbot-cocolu .

# Run
docker run -d \
  --name chatbot \
  -p 3008:3008 \
  --env-file .env \
  -v $(pwd)/database:/app/database \
  chatbot-cocolu
```

#### Opción B: Docker Compose

```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

#### Comandos útiles:
```bash
# Ver logs
docker logs -f chatbot

# Reiniciar
docker restart chatbot

# Entrar al container
docker exec -it chatbot sh
```

---

### 5. AWS EC2

**Ventajas**: Escalable, robusto, integración con AWS.

#### Pasos:

1. **Lanzar instancia EC2**
   - Amazon Linux 2 o Ubuntu
   - t2.micro para empezar (Free Tier)
   - Security Group: Puerto 80, 443, 22

2. **Conectar**
```bash
ssh -i tu-key.pem ec2-user@ec2-xx-xx-xx-xx.compute.amazonaws.com
```

3. **Instalar dependencias**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
sudo yum install git -y
```

4. **Seguir pasos de VPS Linux** (pasos 4-8)

5. **Configurar Elastic IP** (opcional pero recomendado)

---

### 6. DigitalOcean

**Ventajas**: Simple, buen precio, excelente documentación.

#### Pasos:

1. **Crear Droplet**
   - Ubuntu 22.04 LTS
   - Plan básico ($6/mes)
   - Selecciona región cercana

2. **Acceder**
```bash
ssh root@tu-droplet-ip
```

3. **Setup inicial**
```bash
apt update && apt upgrade -y
```

4. **Seguir pasos de VPS Linux** (pasos 2-8)

#### App Platform (alternativa PaaS):

1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Deploy automático

---

## Post-Deployment

### 1. Configurar Webhook en Meta

1. Ve a [Meta for Developers](https://developers.facebook.com/apps)
2. Tu App → WhatsApp → Configuration
3. Webhook:
   - **Callback URL**: `https://tu-dominio.com/webhook`
   - **Verify Token**: Tu WEBHOOK_VERIFY_TOKEN
   - Click "Verify and Save"
4. Subscribe to: `messages`

### 2. Verificar funcionamiento

```bash
# Test webhook
curl -X GET "https://tu-dominio.com/webhook?hub.mode=subscribe&hub.challenge=test&hub.verify_token=TU_TOKEN"

# Debe responder: test
```

### 3. Monitoreo

**Logs en Railway:**
```bash
railway logs
```

**Logs en Heroku:**
```bash
heroku logs --tail
```

**Logs con PM2:**
```bash
pm2 logs chatbot-cocolu
```

**Logs en Docker:**
```bash
docker logs -f chatbot
```

### 4. Backups

**Base de datos:**
```bash
# Backup
tar -czf backup-$(date +%Y%m%d).tar.gz database/

# Restore
tar -xzf backup-20250103.tar.gz
```

## Troubleshooting

### Webhook no funciona

✅ Verifica que la URL sea HTTPS  
✅ Verifica que el verify token coincida  
✅ Revisa logs del servidor  
✅ Test con curl  

### Bot no responde

✅ Verifica que el servidor esté corriendo  
✅ Revisa logs de errores  
✅ Verifica META_ACCESS_TOKEN  
✅ Verifica META_PHONE_NUMBER_ID  

### Error de base de datos

✅ Verifica permisos de escritura en carpeta `database/`  
✅ Crea la carpeta manualmente si no existe  

### Token expirado

✅ Genera un token permanente en Meta  
✅ Actualiza META_ACCESS_TOKEN  
✅ Reinicia el servidor  

### Alto uso de memoria

✅ Limita instancias de PM2  
✅ Considera upgrade de servidor  
✅ Implementa limpieza de base de datos  

## Checklist Final

Antes de considerar el deployment completo:

- [ ] Servidor corriendo sin errores
- [ ] Webhook verificado en Meta
- [ ] Variables de entorno configuradas
- [ ] HTTPS funcionando
- [ ] Bot responde a mensajes
- [ ] Logs siendo monitoreados
- [ ] Backups configurados
- [ ] Documentación actualizada

## Soporte

¿Problemas con el deployment?

- 📧 Email: contacto@cocoluventas.com
- 💬 Discord: BuilderBot Community
- 📖 Docs: README.md

---

¡Deployment exitoso! 🎉 Tu chatbot está listo para vender 24/7.
