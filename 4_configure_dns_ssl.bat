@echo off
echo ============================================
echo Configuracion de DNS y SSL
echo ============================================
echo.
echo PASO 1: CONFIGURAR DNS
echo ========================
echo.
echo En tu proveedor de DNS (ej: Cloudflare, GoDaddy):
echo.
echo Crear estos registros A:
echo.
echo   Tipo: A
echo   Nombre: cocolu
echo   Valor:  173.249.205.142
echo   TTL: Automatico
echo   Proxy: OFF (importante!)
echo.
echo   Tipo: A
echo   Nombre: api-cocolu
echo   Valor:  173.249.205.142
echo   TTL: Automatico
echo   Proxy: OFF (importante!)
echo.
echo Esperar 5-10 minutos para propagacion DNS
echo.
echo Mientras esperas, puedes verificar con:
echo   nslookup cocolu.emberdrago.com
echo   nslookup api-cocolu.emberdrago.com
echo.
pause

echo.
echo Verificando DNS...
nslookup cocolu.emberdrago.com
nslookup api-cocolu.emberdrago.com
echo.
echo Si ves "173.249.205.142" en las respuestas, el DNS esta listo!
echo.
pause

echo.
echo PASO 2: CONFIGURAR SSL
echo ======================
echo.
echo Conectando al servidor para instalar certificados SSL...
echo.

set SERVER=173.249.205.142
set USER=root

ssh %USER%@%SERVER% "bash -s" << 'ENDSSH'
#!/bin/bash

echo "Solicitando certificados SSL de Let's Encrypt..."
certbot --nginx -d cocolu.emberdrago.com -d api-cocolu.emberdrago.com --non-interactive --agree-tos --email admin@emberdrago.com --redirect

echo ""
echo "Verificando renovacion automatica..."
certbot renew --dry-run

echo ""
echo "============================================"
echo "SSL configurado exitosamente!"
echo "============================================"
echo ""
echo "URLs finales (HTTPS):"
echo "  https://cocolu.emberdrago.com"
echo "  https://api-cocolu.emberdrago.com/api"
echo ""
echo "Certificados se renovaran automaticamente cada 90 dias"
echo ""

ENDSSH

echo.
echo ============================================
echo Despliegue 100%% completado!
echo ============================================
echo.
echo Accede a tu aplicacion en:
echo   https://cocolu.emberdrago.com
echo.
pause
