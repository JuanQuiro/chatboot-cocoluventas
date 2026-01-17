# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("Diagnostico Financial Routes...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    print("\n--- 1. Checking financial.routes.js content (first 50 lines) ---")
    stdin, stdout, stderr = ssh.exec_command("head -n 50 /var/www/cocolu-chatbot/src/api/financial.routes.js")
    print(stdout.read().decode('utf-8', errors='ignore'))

    print("\n--- 2. Checking app-integrated.js imports (grep financial) ---")
    stdin, stdout, stderr = ssh.exec_command("grep 'financial' /var/www/cocolu-chatbot/app-integrated.js")
    print(stdout.read().decode('utf-8', errors='ignore'))

    print("\n--- 3. Checking PM2 Error Logs (Last 50 lines) ---")
    stdin, stdout, stderr = ssh.exec_command("tail -n 50 /root/.pm2/logs/cocolu-backend-error.log")
    print(stdout.read().decode('utf-8', errors='ignore'))

    print("\n--- 4. Checking PM2 Out Logs (Last 20 lines) ---")
    stdin, stdout, stderr = ssh.exec_command("tail -n 20 /root/.pm2/logs/cocolu-backend-out.log")
    print(stdout.read().decode('utf-8', errors='ignore'))

    ssh.close()

except Exception as e:
    print(f"Error: {e}")
