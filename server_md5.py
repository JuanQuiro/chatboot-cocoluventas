# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Checksum check...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    stdin, stdout, stderr = ssh.exec_command("md5sum /var/www/cocolu-chatbot/dashboard/build/static/css/main.c0c3eee3.css")
    print(stdout.read().decode('utf-8'))
    
    ssh.close()

except Exception as e:
    print(f"❌ Error: {e}")
