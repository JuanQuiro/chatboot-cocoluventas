# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 Hunting Nginx Config...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # 1. Check nginx.conf
    print("\n1. nginx.conf content:")
    stdin, stdout, stderr = ssh.exec_command("cat /etc/nginx/nginx.conf | grep include")
    print(stdout.read().decode('utf-8'))
    
    # 2. List sites-available and sites-enabled
    print("\n2. Sites Enabled:")
    stdin, stdout, stderr = ssh.exec_command("ls -la /etc/nginx/sites-enabled/")
    print(stdout.read().decode('utf-8'))
    
    # 3. List conf.d
    print("\n3. Conf.d:")
    stdin, stdout, stderr = ssh.exec_command("ls -la /etc/nginx/conf.d/")
    print(stdout.read().decode('utf-8'))
    
    # 4. Check actual running nginx process to see config file
    print("\n4. Running process:")
    stdin, stdout, stderr = ssh.exec_command("ps aux | grep nginx | head -2")
    print(stdout.read().decode('utf-8'))
    
    ssh.close()

except Exception as e:
    print(f"❌ Error: {e}")
