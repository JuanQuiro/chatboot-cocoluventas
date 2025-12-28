# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Check http.d config...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # 1. List http.d
    print("\n1. http.d listing:")
    stdin, stdout, stderr = ssh.exec_command("ls -la /etc/nginx/http.d/")
    print(stdout.read().decode('utf-8'))
    
    # 2. Grep root in http.d
    print("\n2. Root in http.d:")
    stdin, stdout, stderr = ssh.exec_command("grep -R 'root' /etc/nginx/http.d/")
    print(stdout.read().decode('utf-8'))
    
    ssh.close()

except Exception as e:
    print(f"❌ Error: {e}")
