# Script de despliegue automatizado completo
$ErrorActionPreference = "Continue"

$SERVER = "173.249.205.142"
$USER = "root"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Despliegue Automatizado - Cocolu Chatbot" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Crear paquete de despliegue
Write-Host "[1/5] Creando paquete de despliegue..." -ForegroundColor Yellow

$tempDir = ".\deploy-temp"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copiar archivos necesarios
Copy-Item -Recurse "src" "$tempDir\"
Copy-Item -Recurse "data" "$tempDir\"
Copy-Item -Recurse "deployment" "$tempDir\"
Copy-Item "package.json" "$tempDir\"
Copy-Item "package-lock.json" "$tempDir\"
if (Test-Path "ecosystem.config.js") { Copy-Item "ecosystem.config.js" "$tempDir\" }

# Copiar dashboard
New-Item -ItemType Directory -Path "$tempDir\dashboard" | Out-Null
Copy-Item -Recurse "dashboard\src" "$tempDir\dashboard\"
Copy-Item -Recurse "dashboard\public" "$tempDir\dashboard\"
Copy-Item "dashboard\package.json" "$tempDir\dashboard\"
Copy-Item "dashboard\package-lock.json" "$tempDir\dashboard\"
if (Test-Path "dashboard\.env.production") { Copy-Item "dashboard\.env.production" "$tempDir\dashboard\" }

Write-Host "OK Paquete preparado" -ForegroundColor Green

# Paso 2: Crear script de instalación remota
Write-Host "[2/5] Creando script de instalacion..." -ForegroundColor Yellow

$remoteScript = @'
#!/bin/bash
set -e

echo "Iniciando instalacion en servidor..."

apt update
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

apt install -y nginx build-essential python3 certbot python3-certbot-nginx
npm install -g pm2

cd /var/www/cocolu-chatbot
npm install --production
mkdir -p logs data

node -e "require('./src/config/database.service.js')" 2>/dev/null || true

pm2 delete cocolu-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root | grep -v "PM2" | bash || true

cd dashboard
npm install
npm run build

mkdir -p /var/www/cocolu-frontend
cp -r build/* /var/www/cocolu-frontend/
chown -R www-data:www-data /var/www/cocolu-frontend

cp /var/www/cocolu-chatbot/deployment/nginx-cocolu.conf /etc/nginx/sites-available/cocolu
ln -sf /etc/nginx/sites-available/cocolu /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable 2>/dev/null || true

chmod +x /var/www/cocolu-chatbot/deployment/*.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/cocolu-chatbot/deployment/backup.sh") | crontab - || true

echo ""
echo "Instalacion completada!"
echo "URLs: http://173.249.205.142"
pm2 status
'@

$remoteScript | Out-File -FilePath "$tempDir\install.sh" -Encoding ASCII

Write-Host "OK Script creado" -ForegroundColor Green

# Paso 3: Transferir archivos
Write-Host "[3/5] Transfiriendo archivos al servidor..." -ForegroundColor Yellow
Write-Host "Esto puede tomar varios minutos..." -ForegroundColor Gray

try {
    & scp -r -o StrictHostKeyChecking=no "$tempDir\*" "${USER}@${SERVER}:/var/www/cocolu-chatbot/"
    Write-Host "OK Archivos transferidos" -ForegroundColor Green
} catch {
    Write-Host "ERROR en transferencia SCP" -ForegroundColor Red
    Write-Host "Por favor instala OpenSSH Client desde Configuracion de Windows" -ForegroundColor Yellow
    exit 1
}

# Paso 4: Ejecutar instalación remota
Write-Host "[4/5] Ejecutando instalacion en servidor..." -ForegroundColor Yellow

try {
    & ssh -o StrictHostKeyChecking=no "${USER}@${SERVER}" "chmod +x /var/www/cocolu-chatbot/install.sh; /var/www/cocolu-chatbot/install.sh"
    Write-Host "OK Instalacion completada" -ForegroundColor Green
} catch {
    Write-Host "Verifica el estado manualmente" -ForegroundColor Yellow
}

# Paso 5: Limpiar
Write-Host "[5/5] Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $tempDir
Write-Host "OK Limpieza completada" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Despliegue Completado!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs de acceso:" -ForegroundColor White
Write-Host "  Frontend: http://173.249.205.142" -ForegroundColor Cyan
Write-Host "  Backend:  http://173.249.205.142:3008/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor White
Write-Host "1. Configurar DNS" -ForegroundColor Gray
Write-Host "2. Ejecutar certbot para SSL" -ForegroundColor Gray
Write-Host ""
