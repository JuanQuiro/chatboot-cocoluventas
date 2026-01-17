# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import time

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("Forzando reinicio limpio...")
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

# 1. Stop PM2
exec_cmd("pm2 stop cocolu-backend", "Stop PM2")

# 2. Kill everything on port 3008
exec_cmd("fuser -k 3008/tcp", "Kill Port 3008")
exec_cmd("killall node", "Kill All Node") # A little aggressive but necessary

# 3. Start PM2
exec_cmd("pm2 start cocolu-backend", "Start PM2")
time.sleep(5)

# 4. Check Logs for EADDRINUSE
exec_cmd("tail -n 20 /root/.pm2/logs/cocolu-backend-error.log", "Check Error Log")
exec_cmd("tail -n 20 /root/.pm2/logs/cocolu-backend-out.log", "Check Out Log")

ssh.close()
