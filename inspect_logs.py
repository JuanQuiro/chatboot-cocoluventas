# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 INSPECTING LOGS...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # Check startup logs for router type
    print("\n--- 1. ROUTER TYPE CHECK ---")
    stdin, stdout, stderr = ssh.exec_command("grep -C 2 'INSPECTING ROUTER' /root/.pm2/logs/cocolu-backend-out.log | tail -n 10")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # Check if endpoint was hit
    print("\n--- 2. ENDPOINT HIT CHECK ---")
    stdin, stdout, stderr = ssh.exec_command("grep 'endpoint hit' /root/.pm2/logs/cocolu-backend-out.log | tail -n 10")
    res = stdout.read().decode('utf-8', errors='ignore')
    print(res if res.strip() else "NO HITS FOUND")

    # Check for direct test hit (would be 200)
    # curl output is not logged unless morgan is on
    
    ssh.close()

except Exception as e:
    print(f"Error: {e}")
