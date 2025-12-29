# Deployment Automatizado al VPS
$password = "a9psHSvLyrKock45yE2F"
$server = "173.249.205.142"
$user = "root"

Write-Host "🚀 Iniciando deployment automatizado..." -ForegroundColor Green

# Crear archivo temporal con comandos
$commands = @"
cd /root/chatboot-cocoluventas
git pull origin master
npm install
cd dashboard
npm install
npm run build
cd ..
pm2 restart all
pm2 status
"@

$commands | Out-File -FilePath "deploy_commands.sh" -Encoding ASCII

Write-Host "`n📋 Comandos a ejecutar:" -ForegroundColor Cyan
Write-Host $commands

Write-Host "`n⚠️  EJECUTA ESTOS COMANDOS MANUALMENTE:" -ForegroundColor Yellow
Write-Host "1. Abre otra terminal/PowerShell" -ForegroundColor White
Write-Host "2. Ejecuta: ssh root@$server" -ForegroundColor White
Write-Host "3. Password: $password" -ForegroundColor White
Write-Host "4. Copia y pega los comandos de arriba`n" -ForegroundColor White

Write-Host "O usa este comando único:" -ForegroundColor Cyan
Write-Host "ssh root@$server" -ForegroundColor Yellow

Write-Host "`nDentro del VPS ejecuta:" -ForegroundColor Cyan
Write-Host "cd /root/chatboot-cocoluventas && git pull && npm install && cd dashboard && npm install && npm run build && cd .. && pm2 restart all" -ForegroundColor Green
