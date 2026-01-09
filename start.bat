@echo off
echo ========================================
echo   COCOLU VENTAS - Sistema Completo
echo ========================================
echo.

REM Verificar que Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no está instalado
    echo Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

echo [0/4] Actualizando base de datos local...
node update-local-db.js
if %ERRORLEVEL% NEQ 0 (
    echo ADVERTENCIA: No se pudo actualizar la base de datos
    echo El sistema intentará continuar...
)

echo [1/4] Configurando sistema de autenticación...
node setup-auth.js
timeout /t 2 /nobreak >nul

echo [2/4] Iniciando Backend en puerto 3009...
start "Backend - Cocolu" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 5 /nobreak >nul

echo [3/4] Iniciando Frontend en puerto 3000...
start "Frontend - Cocolu" cmd /k "cd /d %~dp0dashboard && npm start"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Sistema Iniciado Correctamente
echo ========================================
echo.
echo Backend:  http://localhost:3009
echo API:      http://localhost:3009/api
echo Frontend: http://localhost:3000
echo.
echo CREDENCIALES DE ACCESO:
echo   Email: admin@cocolu.com
echo   Password: admin123
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

start http://localhost:3000

echo.
echo Sistema corriendo. Cierra las ventanas de comandos para detener.
echo.
pause
