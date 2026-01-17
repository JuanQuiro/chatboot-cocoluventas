# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    stdin, stdout, stderr = ssh.exec_command("cat /var/www/cocolu-chatbot/dashboard/build/index.html")
    content = stdout.read().decode('utf-8')
    print("Content reference:")
    print(content[:500]) # First 500 chars usually has the css links
    
    ssh.close()

except Exception as e:
    print(f"Error: {e}")
