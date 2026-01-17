@echo off
echo ===================================================
echo 🚀 INICIANDO DESPLIEGUE ROBUSTO -> VPS
echo ===================================================
echo.
echo Detectamos que la carpeta podria no existir.
echo Este script verificara y clonara si es necesario.
echo.
echo Comandos a ejecutar en remoto:
echo 1. Verificar/Clonar repositorio
echo 2. git pull
echo 3. Instalacion de dependencias (front y back)
echo 4. Build
echo 5. Reinicio PM2
echo.
echo Conectando... (Pass: a9psHSvLyrKock45yE2F)
echo.

ssh root@173.249.205.142 "cd /root && if [ -d 'chatboot-cocoluventas' ]; then echo '📂 Carpeta encontrada. Entrando...'; cd chatboot-cocoluventas && git pull origin master; else echo '⚠️ Carpeta NO encontrada. Clonando...'; git clone https://github.com/JuanQuiro/chatboot-cocoluventas.git && cd chatboot-cocoluventas; fi && echo '📦 Backend Install...' && npm install && echo '🎨 Dashboard Install...' && cd dashboard && npm install && echo '🏗️ Dashboard Build...' && npm run build && cd .. && echo '🔄 Restarting PM2...' && pm2 restart all || pm2 start src/index.js --name 'cocolu-bot' && pm2 status"

echo.
echo ===================================================
echo ✅ PROCESO COMPLETADO
echo ===================================================
pause
