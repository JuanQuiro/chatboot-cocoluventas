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

echo [1/3] Iniciando Backend en puerto 3008...
start "Backend - Cocolu" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Iniciando Frontend en puerto 3000...
start "Frontend - Cocolu" cmd /k "cd /d %~dp0dashboard && npm start"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Sistema Iniciado Correctamente
echo ========================================
echo.
echo Backend:  http://localhost:3008
echo Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

start http://localhost:3000

echo.
echo Sistema corriendo. Cierra las ventanas de comandos para detener.
echo.
pause
