# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import time

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("Iniciando Backend FINAL...")
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

# 1. Start PM2 (force)
exec_cmd("cd /var/www/cocolu-chatbot && pm2 start server_start.js --name cocolu-backend", "Start PM2")
time.sleep(5)

# 2. Save PM2 list
exec_cmd("pm2 save", "Save PM2")

# 3. Check Status
exec_cmd("pm2 status", "Check Status")

# 4. Check Logs (ensure no immediate crash)
exec_cmd("tail -n 20 /root/.pm2/logs/cocolu-backend-out.log", "Check Out Log")
exec_cmd("tail -n 20 /root/.pm2/logs/cocolu-backend-error.log", "Check Error Log")

ssh.close()
