# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Verificando deployment...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # Check if files were uploaded
    print("\n1. Checking build directory...")
    stdin, stdout, stderr = ssh.exec_command("ls -lh /var/www/cocolu-chatbot/dashboard/build/static/css/ | head -20")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # Check CSS file content
    print("\n2. Checking CrearVenta.css in build...")
    stdin, stdout, stderr = ssh.exec_command("find /var/www/cocolu-chatbot/dashboard/build -name '*.css' -exec grep -l 'CENTERED LAYOUT' {} \\;")
    result = stdout.read().decode('utf-8', errors='ignore')
    if result.strip():
        print(f"✅ Found updated CSS: {result}")
    else:
        print("❌ Updated CSS NOT found in build")
    
    # Check nginx cache
    print("\n3. Checking nginx cache...")
    stdin, stdout, stderr = ssh.exec_command("ls -lh /var/cache/nginx/ 2>/dev/null || echo 'No nginx cache'")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # Clear browser cache headers
    print("\n4. Clearing nginx cache...")
    ssh.exec_command("rm -rf /var/cache/nginx/* 2>/dev/null")
    ssh.exec_command("nginx -s reload 2>/dev/null")
    
    print("\n✅ Verification complete")
    
    ssh.close()

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
