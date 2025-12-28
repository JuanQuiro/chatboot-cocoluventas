# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔍 REMOTE CURL DIAGNOSE...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    print("\n--- 1. DEBUG PATH 3009 ---")
    stdin, stdout, stderr = ssh.exec_command("curl -v http://127.0.0.1:3009/api/direct-test")
    print(stdout.read().decode('utf-8', errors='ignore'))

    print("\n--- 2. INCOME 3009 ---")
    stdin, stdout, stderr = ssh.exec_command("curl -v http://127.0.0.1:3009/api/income")
    print(stdout.read().decode('utf-8', errors='ignore'))

    print("\n--- 3. CLIENTS QUICK 3009 ---")
    stdin, stdout, stderr = ssh.exec_command("curl -v http://127.0.0.1:3009/api/clients/quick")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    print("\n--- 4. PUBLIC DOMAIN CHECK ---")
    # -k to ignore SSL if self-signed or issue, but it should be valid
    stdin, stdout, stderr = ssh.exec_command("curl -v -k https://api-cocolu.emberdrago.com/api/income")
    print(stdout.read().decode('utf-8', errors='ignore'))

    ssh.close()

except Exception as e:
    print(f"Error: {e}")
