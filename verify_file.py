# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("Verificando Archivos Remotos...")
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

# 1. Check app-integrated.js for console.log
exec_cmd("grep 'console.log' /var/www/cocolu-chatbot/app-integrated.js | grep 'CORS'", "Check app-integrated.js")

# 2. Check server_start.js content
exec_cmd("cat /var/www/cocolu-chatbot/server_start.js", "Check server_start.js")

# 3. Check PM2 process details
exec_cmd("pm2 describe cocolu-backend", "PM2 Describe")

# 4. Check pm2 logs again (maybe just stdout?)
exec_cmd("tail -n 20 /root/.pm2/logs/cocolu-backend-out.log", "PM2 Stdout")

ssh.close()
