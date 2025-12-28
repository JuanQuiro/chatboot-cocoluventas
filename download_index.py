# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Check Nginx & Download index.html...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # 1. Get Nginx site config to verify root
    print("\n1. Nginx Config (sites-enabled):")
    stdin, stdout, stderr = ssh.exec_command("grep -R 'root' /etc/nginx/sites-enabled/")
    print(stdout.read().decode('utf-8'))
    
    # 2. Download index.html
    sftp = ssh.open_sftp()
    remote_path = "/var/www/cocolu-chatbot/dashboard/build/index.html"
    local_path = "c:\\Users\\grana\\chatboot-cocoluventas\\downloaded_index.html"
    sftp.get(remote_path, local_path)
    sftp.close()
    print(f"\n✅ Downloaded {remote_path}")
    
    ssh.close()

except Exception as e:
    print(f"❌ Error: {e}")
