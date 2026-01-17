# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🕵️ TRACE DEPLOYMENT...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    print("\n--- 1. LOCATE ROUTE REGISTRATION IN app-integrated.js ---")
    # Show lines around usage
    stdin, stdout, stderr = ssh.exec_command("grep -C 5 -n 'apiApp.use.*financial' /var/www/cocolu-chatbot/app-integrated.js")
    print(stdout.read().decode('utf-8', errors='ignore'))

    print("\n--- 2. CHECK FINANCIAL ROUTES FILE ---")
    stdin, stdout, stderr = ssh.exec_command("head -n 10 /var/www/cocolu-chatbot/src/api/financial.routes.js")
    print(stdout.read().decode('utf-8', errors='ignore'))

    print("\n--- 3. CHECK PM2 LOGS FOR LOADING MESSAGE ---")
    # Search for the emoji or text
    stdin, stdout, stderr = ssh.exec_command("grep -n 'Loading Financial' /root/.pm2/logs/cocolu-backend-out.log | tail -n 5")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    print("\n--- 4. CHECK PM2 LOGS FOR STARTUP ---")
    stdin, stdout, stderr = ssh.exec_command("tail -n 30 /root/.pm2/logs/cocolu-backend-out.log")
    print(stdout.read().decode('utf-8', errors='ignore'))

    ssh.close()

except Exception as e:
    print(f"Error: {e}")
