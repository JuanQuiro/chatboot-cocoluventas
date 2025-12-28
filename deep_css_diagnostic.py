# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Diagnóstico profundo del problema CSS...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # 1. Extract actual CSS content for crear-venta-page
    print("\n1. Contenido REAL del CSS crear-venta-page:")
    stdin, stdout, stderr = ssh.exec_command("""
        grep -A 10 'crear-venta-page' /var/www/cocolu-chatbot/dashboard/build/static/css/*.css 2>/dev/null | head -30
    """)
    content = stdout.read().decode('utf-8', errors='ignore')
    print(content if content.strip() else "   ❌ NO ENCONTRADO")
    
    # 2. Check if CSS is minified
    print("\n2. Verificando si el CSS está minificado:")
    stdin, stdout, stderr = ssh.exec_command("""
        file /var/www/cocolu-chatbot/dashboard/build/static/css/120.*.css | head -1
    """)
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # 3. Extract page-header gradient CSS
    print("\n3. CSS del .page-header con gradiente:")
    stdin, stdout, stderr = ssh.exec_command("""
        grep -B 2 -A 8 'page-header' /var/www/cocolu-chatbot/dashboard/build/static/css/120.*.css 2>/dev/null | grep -A 5 'linear-gradient' | head -10
    """)
    content = stdout.read().decode('utf-8', errors='ignore')
    print(content if content.strip() else "   ❌ NO ENCONTRADO")
    
    # 4. Check which chunk contains CrearVenta
    print("\n4. Chunk que contiene CrearVenta:")
    stdin, stdout, stderr = ssh.exec_command("""
        grep -l 'crear-venta' /var/www/cocolu-chatbot/dashboard/build/static/css/*.css 2>/dev/null
    """)
    files = stdout.read().decode('utf-8', errors='ignore')
    print(files if files.strip() else "   ❌ NO ENCONTRADO")
    
    # 5. Check index.html for CSS references
    print("\n5. CSS referenciado en index.html:")
    stdin, stdout, stderr = ssh.exec_command("""
        grep -o '<link[^>]*href="[^"]*\\.css"[^>]*>' /var/www/cocolu-chatbot/dashboard/build/index.html
    """)
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # 6. Check if 120 chunk is referenced
    print("\n6. ¿Chunk 120 está referenciado?")
    stdin, stdout, stderr = ssh.exec_command("""
        grep '120.*\\.css' /var/www/cocolu-chatbot/dashboard/build/index.html && echo 'SÍ' || echo 'NO'
    """)
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    ssh.close()
    print("\n✅ Diagnóstico completo")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
