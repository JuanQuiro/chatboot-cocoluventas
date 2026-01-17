# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Diagnóstico completo del CSS...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # 1. Check if CSS files exist
    print("\n1. Archivos CSS en build:")
    stdin, stdout, stderr = ssh.exec_command("find /var/www/cocolu-chatbot/dashboard/build/static/css -name '*.css' -type f | wc -l")
    count = stdout.read().decode('utf-8', errors='ignore').strip()
    print(f"   Total CSS files: {count}")
    
    # 2. Check for our specific CSS content
    print("\n2. Buscando 'crear-venta-page' en CSS:")
    stdin, stdout, stderr = ssh.exec_command("grep -r 'crear-venta-page' /var/www/cocolu-chatbot/dashboard/build/static/css/ 2>/dev/null | head -3")
    result = stdout.read().decode('utf-8', errors='ignore')
    if result.strip():
        print(f"   ✅ Encontrado:\n{result[:300]}")
    else:
        print("   ❌ NO encontrado")
    
    # 3. Check for gradient
    print("\n3. Buscando gradiente morado:")
    stdin, stdout, stderr = ssh.exec_command("grep -r '6366f1.*8b5cf6' /var/www/cocolu-chatbot/dashboard/build/static/css/ 2>/dev/null | head -2")
    result = stdout.read().decode('utf-8', errors='ignore')
    if result.strip():
        print(f"   ✅ Encontrado:\n{result[:200]}")
    else:
        print("   ❌ NO encontrado")
    
    # 4. Check main chunk CSS
    print("\n4. Verificando main chunk CSS:")
    stdin, stdout, stderr = ssh.exec_command("ls -lh /var/www/cocolu-chatbot/dashboard/build/static/css/main.*.css 2>/dev/null")
    main_css = stdout.read().decode('utf-8', errors='ignore')
    if main_css.strip():
        print(f"   {main_css}")
    else:
        print("   ⚠️ No hay main.*.css")
    
    # 5. Check index.html references
    print("\n5. CSS referenciado en index.html:")
    stdin, stdout, stderr = ssh.exec_command("grep -o 'href=\"/static/css/[^\"]*\"' /var/www/cocolu-chatbot/dashboard/build/index.html | head -5")
    refs = stdout.read().decode('utf-8', errors='ignore')
    print(f"{refs}")
    
    # 6. Add versioning to force cache bust
    print("\n6. Agregando versión a index.html...")
    version = "v" + str(int(__import__('time').time()))
    stdin, stdout, stderr = ssh.exec_command(f"sed -i 's|/static/css/|/static/css/{version}/|g' /var/www/cocolu-chatbot/dashboard/build/index.html 2>/dev/null || echo 'sed failed'")
    print(f"   Versión agregada: {version}")
    
    ssh.close()
    print("\n✅ Diagnóstico completo")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
