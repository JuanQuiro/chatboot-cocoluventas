# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import os

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔥 Uploading and running ULTRA CACHE BUSTING script...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    sftp = ssh.open_sftp()
    
    local_path = r"c:\Users\grana\chatboot-cocoluventas\server_cache_bust.py"
    remote_path = "/tmp/server_cache_bust.py"
    
    sftp.put(local_path, remote_path)
    sftp.close()
    
    stdin, stdout, stderr = ssh.exec_command(f"python3 {remote_path}")
    print(stdout.read().decode('utf-8'))
    print(stderr.read().decode('utf-8'))
    
    ssh.close()

except Exception as e:
    print(f"❌ Error: {e}")
