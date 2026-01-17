@echo off
echo ============================================
echo Transfiriendo archivos al servidor...
echo ============================================

set SERVER=173.249.205.142
set USER=root
set DEST=/root/

echo.
echo NOTA: Se te pedira la contrasena del servidor
echo Contrasena: a9psHSvLyrKock45yE2F
echo.

scp cocolu-deployment.zip %USER%@%SERVER%:%DEST%

if %errorlevel% == 0 (
    echo.
    echo ============================================
    echo Transferencia completada exitosamente
    echo ============================================
    echo.
    echo Siguiente paso: Ejecutar 3_deploy_remote.bat
) else (
    echo.
    echo ============================================
    echo Error en la transferencia
    echo ============================================
    echo.
    echo Alternativa manual:
    echo 1. Abre WinSCP o FileZilla
    echo 2. Conecta a %SERVER% como %USER%
    echo 3. Sube cocolu-deployment.zip a /root/
)

pause
