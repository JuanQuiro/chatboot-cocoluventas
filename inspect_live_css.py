# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Inspeccionando CSS en producción...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # 1. Ver qué archivos CSS existen
    print("\n1. Archivos CSS en build:")
    stdin, stdout, stderr = ssh.exec_command("ls -lh /var/www/cocolu-chatbot/dashboard/build/static/css/*.css")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # 2. Buscar crear-venta-page en TODOS los archivos CSS
    print("\n2. Buscando 'crear-venta-page' en todos los CSS:")
    stdin, stdout, stderr = ssh.exec_command("grep -l 'crear-venta-page' /var/www/cocolu-chatbot/dashboard/build/static/css/*.css 2>/dev/null")
    files = stdout.read().decode('utf-8', errors='ignore')
    print(files if files.strip() else "   ❌ NO ENCONTRADO EN NINGÚN ARCHIVO")
    
    # 3. Buscar !important en main.css
    print("\n3. Contando '!important' en main.css:")
    stdin, stdout, stderr = ssh.exec_command("grep -c '!important' /var/www/cocolu-chatbot/dashboard/build/static/css/main.*.css 2>/dev/null || echo 0")
    count = stdout.read().decode('utf-8', errors='ignore').strip()
    print(f"   Encontrado {count} veces")
    
    # 4. Ver el tamaño de main.css
    print("\n4. Tamaño de main.css:")
    stdin, stdout, stderr = ssh.exec_command("wc -c /var/www/cocolu-chatbot/dashboard/build/static/css/main.*.css")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # 5. Ver las primeras líneas de main.css para verificar contenido
    print("\n5. Primeras 50 líneas de main.css:")
    stdin, stdout, stderr = ssh.exec_command("head -50 /var/www/cocolu-chatbot/dashboard/build/static/css/main.*.css")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    ssh.close()
    print("\n✅ Inspección completa")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
