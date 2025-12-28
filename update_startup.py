# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import os

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"
PROJECT_PATH = r"C:\Users\grana\chatboot-cocoluventas"

print("Actualizando arranque del servidor...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD)

sftp = ssh.open_sftp()
local_file = os.path.join(PROJECT_PATH, 'server_start.js')
remote_file = '/var/www/cocolu-chatbot/server_start.js'
print(f"Subiendo server_start.js...")
sftp.put(local_file, remote_file)
sftp.close()

print("Reiniciando PM2 con nuevo script...")
ssh.exec_command("pm2 delete cocolu-backend 2>/dev/null || true")
stdin, stdout, stderr = ssh.exec_command("cd /var/www/cocolu-chatbot && pm2 start server_start.js --name cocolu-backend")
print(stdout.read().decode('utf-8', errors='ignore'))
ssh.exec_command("pm2 save")

print("Verificando...")
import time
time.sleep(5)
stdin, stdout, stderr = ssh.exec_command("pm2 logs cocolu-backend --lines 20 --nostream")
print(stdout.read().decode('utf-8', errors='ignore'))

# Check port 3008 again
stdin, stdout, stderr = ssh.exec_command("curl -I http://localhost:3008 2>&1")
print(stdout.read().decode('utf-8', errors='ignore'))

ssh.close()
