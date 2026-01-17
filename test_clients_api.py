# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🧪 Testing /api/clients endpoint...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    print("\n--- 1. GET /api/clients (List all) ---")
    stdin, stdout, stderr = ssh.exec_command("curl -s http://127.0.0.1:3009/api/clients")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    print("\n--- 2. GET /api/clients?q=test (Search) ---")
    stdin, stdout, stderr = ssh.exec_command("curl -s 'http://127.0.0.1:3009/api/clients?q=test'")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    print("\n--- 3. Check logs for clientsRouter mount ---")
    stdin, stdout, stderr = ssh.exec_command("tail -n 50 /root/.pm2/logs/cocolu-backend-out.log | grep -i 'client'")
    print(stdout.read().decode('utf-8', errors='ignore'))

    ssh.close()

except Exception as e:
    print(f"Error: {e}")
