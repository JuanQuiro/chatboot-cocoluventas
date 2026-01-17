# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 NET LOG DIAGNOSE...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    print("\n--- 1. NETSTAT CHECK ---")
    stdin, stdout, stderr = ssh.exec_command("netstat -tulnp | grep 3008")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    print("\n--- 2. CURL 127.0.0.1 CHECK (Direct Test) ---")
    stdin, stdout, stderr = ssh.exec_command("curl -v http://127.0.0.1:3008/api/direct-test")
    print(stdout.read().decode('utf-8', errors='ignore'))
    print(stderr.read().decode('utf-8', errors='ignore'))

    print("\n--- 3. LOGS AFTER CURL ---")
    stdin, stdout, stderr = ssh.exec_command("tail -n 20 /root/.pm2/logs/cocolu-backend-out.log")
    print(stdout.read().decode('utf-8', errors='ignore'))

    ssh.close()

except Exception as e:
    print(f"Error: {e}")
