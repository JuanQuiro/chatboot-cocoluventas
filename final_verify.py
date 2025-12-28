# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Verificando nuevo deployment...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # Check latest CSS files
    print("\n1. Latest CSS files:")
    stdin, stdout, stderr = ssh.exec_command("ls -lt /var/www/cocolu-chatbot/dashboard/build/static/css/*.css | head -5")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # Check for CENTERED LAYOUT in any CSS
    print("\n2. Checking for updated CSS content:")
    stdin, stdout, stderr = ssh.exec_command("grep -r 'CENTERED LAYOUT' /var/www/cocolu-chatbot/dashboard/build/static/css/ 2>/dev/null | head -3")
    result = stdout.read().decode('utf-8', errors='ignore')
    if result.strip():
        print(f"✅ Found: {result}")
    else:
        print("❌ NOT found - checking for page-header gradient...")
        stdin, stdout, stderr = ssh.exec_command("grep -r 'linear-gradient.*6366f1.*8b5cf6' /var/www/cocolu-chatbot/dashboard/build/static/css/ 2>/dev/null | head -3")
        result2 = stdout.read().decode('utf-8', errors='ignore')
        if result2.strip():
            print(f"✅ Found gradient: {result2[:200]}")
        else:
            print("❌ Gradient NOT found either")
    
    # Add cache-busting headers to nginx
    print("\n3. Adding cache-busting headers...")
    nginx_config = """
# Add to nginx config for cache busting
add_header Cache-Control "no-cache, no-store, must-revalidate";
add_header Pragma "no-cache";
add_header Expires "0";
"""
    print(nginx_config)
    
    ssh.close()
    print("\n✅ Verification complete")

except Exception as e:
    print(f"❌ Error: {e}")
