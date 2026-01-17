@echo off
echo ============================================
echo Empaquetando proyecto para despliegue...
echo ============================================

cd /d "%~dp0"

REM Crear carpeta temporal
if exist "deployment-package" rmdir /s /q "deployment-package"
mkdir deployment-package

REM Copiar archivos del backend
echo Copiando archivos del backend...
xcopy /E /I /Y src deployment-package\src >nul
xcopy /E /I /Y data deployment-package\data >nul
copy package.json deployment-package\ >nul
copy package-lock.json deployment-package\ >nul
if exist ecosystem.config.js copy ecosystem.config.js deployment-package\ >nul

REM Copiar archivos de deployment
echo Copiando archivos de configuracion...
xcopy /E /I /Y deployment deployment-package\deployment >nul

REM Copiar dashboard (sin node_modules ni build)
echo Copiando dashboard...
mkdir deployment-package\dashboard
xcopy /E /I /Y dashboard\src deployment-package\dashboard\src >nul
xcopy /E /I /Y dashboard\public deployment-package\dashboard\public >nul
copy dashboard\package.json deployment-package\dashboard\ >nul
copy dashboard\package-lock.json deployment-package\dashboard\ >nul
if exist dashboard\.env.production copy dashboard\.env.production deployment-package\dashboard\ >nul

REM Crear archivo ZIP
echo Comprimiendo proyecto...
powershell -Command "Compress-Archive -Path deployment-package\* -DestinationPath cocolu-deployment.zip -Force"

echo.
echo ============================================
echo Paquete creado: cocolu-deployment.zip
powershell -Command "Write-Host ('Tamano: ' + [math]::Round((Get-Item cocolu-deployment.zip).Length / 1MB, 2) + ' MB')"
echo ============================================
echo.
echo Siguiente paso: Ejecutar 2_transfer_to_server.bat
pause
