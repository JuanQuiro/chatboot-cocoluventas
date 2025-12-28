@echo off
echo ===========================================
echo   REINICIANDO SISTEMA COMPLETO (Local)
echo ===========================================

echo [1/4] Deteniendo procesos Node.js actuales...
taskkill /F /IM node.exe /T 2>nul
echo Procesos detenidos.

echo [2/4] Esperando limpieza de puertos...
timeout /t 2 /nobreak >nul

echo [3/4] Iniciando Backend (Puerto 3009)...
start "Backend API (3009)" cmd /k "cd /d %~dp0 && node iniciar-bot-profesional.js"

echo [4/4] Iniciando Dashboard (Puerto 3000)...
start "Dashboard Layout (3000)" cmd /k "cd /d %~dp0dashboard && npm start"

echo.
echo ===========================================
echo   SISTEMA REINICIADO
echo ===========================================
echo Backend corriendo en: http://localhost:3009
echo Frontend corriendo en: http://localhost:3000
echo.
echo NOTA: Si el navegador no abre, ve a http://localhost:3000
echo.
pause
