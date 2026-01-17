# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Verificando qué CSS se está cargando...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # Check which CSS chunk contains CrearVenta styles
    print("\n1. Buscando en qué chunk está el CSS de CrearVenta:")
    stdin, stdout, stderr = ssh.exec_command("grep -l 'crear-venta-page' /var/www/cocolu-chatbot/dashboard/build/static/css/*.css 2>/dev/null")
    files = stdout.read().decode('utf-8', errors='ignore').strip().split('\n')
    for f in files:
        if f:
            print(f"   📄 {f}")
            # Check if this file is referenced in index.html
            filename = f.split('/')[-1]
            stdin2, stdout2, stderr2 = ssh.exec_command(f"grep -q '{filename}' /var/www/cocolu-chatbot/dashboard/build/index.html && echo 'REFERENCED' || echo 'NOT REFERENCED'")
            status = stdout2.read().decode('utf-8', errors='ignore').strip()
            print(f"      Status: {status}")
    
    # Check actual CSS content for crear-venta-page
    print("\n2. Contenido CSS de crear-venta-page:")
    stdin, stdout, stderr = ssh.exec_command("grep -A 5 'crear-venta-page' /var/www/cocolu-chatbot/dashboard/build/static/css/*.css 2>/dev/null | head -20")
    content = stdout.read().decode('utf-8', errors='ignore')
    print(content)
    
    # Check if there's a main CSS that might be overriding
    print("\n3. Verificando main.css:")
    stdin, stdout, stderr = ssh.exec_command("ls -lh /var/www/cocolu-chatbot/dashboard/build/static/css/main.*.css")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # Check for any .page-header styles
    print("\n4. Estilos de .page-header:")
    stdin, stdout, stderr = ssh.exec_command("grep -h 'page-header' /var/www/cocolu-chatbot/dashboard/build/static/css/*.css 2>/dev/null | head -10")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    ssh.close()
    print("\n✅ Verificación completa")

except Exception as e:
    print(f"❌ Error: {e}")
