# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Debugging Live Environment...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # 1. Curl localhost to see what index.html is actually served
    print("\n1. Contenido de index.html servido:")
    stdin, stdout, stderr = ssh.exec_command("cat /var/www/cocolu-chatbot/dashboard/build/index.html")
    content = stdout.read().decode('utf-8')
    print(content[:600]) # First 600 chars
    
    # 2. Check the end of the previous css file/chunk if readable?
    # Actually let's just grep the immediate context of "crear-venta-page" in the main css file
    print("\n2. Contexto de crear-venta-page en CSS:")
    stdin, stdout, stderr = ssh.exec_command("grep -o -b -a '.\\{20\\}crear-venta-page.\\{50\\}' /var/www/cocolu-chatbot/dashboard/build/static/css/main.*.css")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    ssh.close()

except Exception as e:
    print(f"❌ Error: {e}")
