# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import time

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔥 Applying aggressive cache busting...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # Generate timestamp
    ts = int(time.time())
    
    # Update index.html to add ?v=timestamp to css links
    # This command uses sed to replace .css" with .css?v=TIMESTAMP"
    print(f"Adding version v={ts} to CSS links...")
    
    cmd = f"sed -i 's/\.css\"/\.css?v={ts}\"/g' /var/www/cocolu-chatbot/dashboard/build/index.html"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    # Also verify the change
    stdin, stdout, stderr = ssh.exec_command("grep '.css?v=' /var/www/cocolu-chatbot/dashboard/build/index.html")
    print("Verification result:")
    print(stdout.read().decode('utf-8'))
    
    ssh.close()
    print("\n✅ Cache busting applied!")

except Exception as e:
    print(f"❌ Error: {e}")
