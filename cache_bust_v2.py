# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import time

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔥 Applying aggressive cache busting v2...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    ts = int(time.time())
    
    # Check current content
    stdin, stdout, stderr = ssh.exec_command("cat /var/www/cocolu-chatbot/dashboard/build/index.html")
    content = stdout.read().decode('utf-8')
    
    if 'static/css/main.' in content:
        print("Found CSS link. Modifying...")
        # Use python on server to modify file if sed is tricky
        cmd = f"""python3 -c "c = open('/var/www/cocolu-chatbot/dashboard/build/index.html').read(); open('/var/www/cocolu-chatbot/dashboard/build/index.html', 'w').write(c.replace('.css\"', '.css?v={ts}\"'))" """
        ssh.exec_command(cmd)
        print(f"Applied version {ts}")
    else:
        print("❌ Could not find CSS link in index.html")
        
    # Verify
    stdin, stdout, stderr = ssh.exec_command("cat /var/www/cocolu-chatbot/dashboard/build/index.html")
    new_content = stdout.read().decode('utf-8')
    if f"?v={ts}" in new_content:
        print("✅ VERIFIED: Cache busting tag is present!")
    else:
        print("❌ VERIFIED: Tag NOT found.")
        
    ssh.close()

except Exception as e:
    print(f"❌ Error: {e}")
