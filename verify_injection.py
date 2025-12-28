# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Verifying Injection...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    stdin, stdout, stderr = ssh.exec_command("grep '<style id=\"override-css\">' /var/www/cocolu-chatbot/dashboard/build/index.html")
    result = stdout.read().decode('utf-8')
    
    if result:
        print("✅ Style block FOUND!")
    else:
        print("❌ Style block NOT found.")
        
    ssh.close()

except Exception as e:
    print(f"❌ Error: {e}")
