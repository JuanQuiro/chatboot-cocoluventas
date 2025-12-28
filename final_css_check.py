# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Verificación FINAL del CSS...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # Check for crear-venta-page in NEW build
    print("\n1. Verificando 'crear-venta-page' en nuevo build:")
    stdin, stdout, stderr = ssh.exec_command("grep -r 'crear-venta-page' /var/www/cocolu-chatbot/dashboard/build/static/css/ 2>/dev/null | head -3")
    result = stdout.read().decode('utf-8', errors='ignore')
    if result.strip():
        print(f"   ✅ ENCONTRADO:\n{result[:400]}")
    else:
        print("   ❌ AÚN NO ENCONTRADO")
    
    # Check for gradient
    print("\n2. Verificando gradiente morado (6366f1...8b5cf6):")
    stdin, stdout, stderr = ssh.exec_command("grep -r 'linear-gradient.*6366f1.*8b5cf6' /var/www/cocolu-chatbot/dashboard/build/static/css/ 2>/dev/null | head -2")
    result = stdout.read().decode('utf-8', errors='ignore')
    if result.strip():
        print(f"   ✅ ENCONTRADO:\n{result[:300]}")
    else:
        print("   ❌ NO ENCONTRADO")
    
    # Check timestamp of CSS files
    print("\n3. Timestamp de archivos CSS (deben ser recientes):")
    stdin, stdout, stderr = ssh.exec_command("ls -lt /var/www/cocolu-chatbot/dashboard/build/static/css/*.css | head -5")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    ssh.close()
    print("\n✅ Verificación completa")

except Exception as e:
    print(f"❌ Error: {e}")
