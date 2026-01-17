# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import json

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("Verificando Endpoints Financieros...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    endpoints = [
        "/api/income",
        "/api/direct-test",
        "/api/clients/quick"
    ]
    
    for ep in endpoints:
        print(f"\nScanning {ep}...")
        cmd = f"curl -s -o /dev/null -w '%{{http_code}}' http://localhost:3008{ep}"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        status = stdout.read().decode().strip()
        
        if status == "200":
            print(f"✅ {ep} -> 200 OK")
        else:
            print(f"❌ {ep} -> {status}")
            
    ssh.close()
    print("\nVerificación completada.")

except Exception as e:
    print(f"Error: {e}")
