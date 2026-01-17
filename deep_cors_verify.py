# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import time

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("Diagnostico CORS Profundo (Logs)...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD)

def exec_cmd(cmd, desc):
    print(f"\n[{desc}]")
    print(f"$ {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    if out: print(out)
    err = stderr.read().decode('utf-8', errors='ignore')
    if err: print(f"STDERR: {err}")

# 1. Trigger Request
print("Enviando request...")
ssh.exec_command('curl -v -X OPTIONS -H "Origin: https://cocolu.emberdrago.com" -H "Access-Control-Request-Method: POST" http://localhost:3008/api/logs/batch > /dev/null 2>&1')
time.sleep(2)

# 2. Check logs for new CORS messages and Requests
exec_cmd("grep 'INICIANDO APP INTEGRATED JS' /root/.pm2/logs/cocolu-backend-out.log | tail -n 20", "Check Startup Logs")
exec_cmd("grep -C 2 'REQUEST:' /root/.pm2/logs/cocolu-backend-out.log | tail -n 20", "Check Request Logs")
exec_cmd("grep -C 5 'CORS' /root/.pm2/logs/cocolu-backend-out.log | tail -n 20", "Check Transformed Logs")

ssh.close()
