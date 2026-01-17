# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Verificación FINAL - CSS en main bundle...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # Check if crear-venta-page is NOW in main.css
    print("\n1. ¿CSS de crear-venta-page está en main.css?")
    stdin, stdout, stderr = ssh.exec_command("grep -c 'crear-venta-page' /var/www/cocolu-chatbot/dashboard/build/static/css/main.*.css 2>/dev/null")
    count = stdout.read().decode('utf-8', errors='ignore').strip()
    if count and int(count) > 0:
        print(f"   ✅ SÍ - Encontrado {count} veces en main.css")
    else:
        print("   ❌ NO - Aún no está en main.css")
    
    # Check for gradient in main.css
    print("\n2. ¿Gradiente morado está en main.css?")
    stdin, stdout, stderr = ssh.exec_command("grep -c 'linear-gradient.*6366f1.*8b5cf6' /var/www/cocolu-chatbot/dashboard/build/static/css/main.*.css 2>/dev/null")
    count = stdout.read().decode('utf-8', errors='ignore').strip()
    if count and int(count) > 0:
        print(f"   ✅ SÍ - Encontrado {count} veces")
    else:
        print("   ❌ NO")
    
    # Show main.css size
    print("\n3. Tamaño de main.css:")
    stdin, stdout, stderr = ssh.exec_command("ls -lh /var/www/cocolu-chatbot/dashboard/build/static/css/main.*.css")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    ssh.close()
    print("\n✅ Verificación completa")

except Exception as e:
    print(f"❌ Error: {e}")
