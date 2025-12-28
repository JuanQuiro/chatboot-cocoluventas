@echo off
echo ============================================
echo Ejecutando despliegue en servidor...
echo ============================================

set SERVER=173.249.205.142
set USER=root

echo.
echo NOTA: Se te pedira la contrasena del servidor varias veces
echo Contrasena: a9psHSvLyrKock45yE2F
echo.
pause

ssh %USER%@%SERVER% "bash -s" << 'ENDSSH'
#!/bin/bash
set -e

echo "============================================"
echo "Iniciando despliegue automatico..."
echo "============================================"

echo "1/12 Descomprimiendo proyecto..."
cd /root
unzip -o cocolu-deployment.zip -d /var/www/cocolu-chatbot

echo "2/12 Actualizando sistema..."
apt update

echo "3/12 Instalando Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

echo "4/12 Instalando dependencias del sistema..."
apt install -y nginx build-essential python3 certbot python3-certbot-nginx unzip

echo "5/12 Instalando PM2..."
npm install -g pm2

echo "6/12 Instalando dependencias del backend..."
cd /var/www/cocolu-chatbot
npm install --production

echo "7/12 Creando directorios necesarios..."
mkdir -p logs data

echo "8/12 Inicializando base de datos..."
node -e "require('./src/config/database.service.js')" 2>/dev/null || echo "DB ya existe"

echo "9/12 Iniciando backend con PM2..."
pm2 delete cocolu-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root | grep -v "PM2" | bash || true

echo "10/12 Building frontend..."
cd dashboard
npm install
npm run build

echo "11/12 Desplegando frontend..."
mkdir -p /var/www/cocolu-frontend
cp -r build/* /var/www/cocolu-frontend/
chown -R www-data:www-data /var/www/cocolu-frontend

echo "12/12 Configurando nginx..."
cp /var/www/cocolu-chatbot/deployment/nginx-cocolu.conf /etc/nginx/sites-available/cocolu
ln -sf /etc/nginx/sites-available/cocolu /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "Configurando firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable 2>/dev/null || true

echo "Configurando backup automatico..."
chmod +x /var/www/cocolu-chatbot/deployment/backup.sh
chmod +x /var/www/cocolu-chatbot/deployment/deploy.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/cocolu-chatboot/deployment/backup.sh") | crontab -

echo ""
echo "============================================"
echo "Despliegue completado exitosamente!"
echo "============================================"
echo ""
echo "URLs temporales (HTTP):"
echo "  http://173.249.205.142 (Frontend)"
echo "  http://173.249.205.142:3008/api (Backend)"
echo ""
echo "Estado de servicios:"
pm2 status
echo ""
echo "Siguiente paso: Configurar DNS y luego ejecutar 4_configure_dns_ssl.bat"
echo ""

ENDSSH

pause
