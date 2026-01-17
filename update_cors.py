# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import os
import time

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"
PROJECT_PATH = r"C:\Users\grana\chatboot-cocoluventas"

print("Actualizando CORS en el servidor...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD)

sftp = ssh.open_sftp()
local_file = os.path.join(PROJECT_PATH, 'app-integrated.js')
remote_file = '/var/www/cocolu-chatbot/app-integrated.js'

print(f"Subiendo app-integrated.js parcheado...")
sftp.put(local_file, remote_file)
sftp.close()

print("Reiniciando backend (Full Reset)...")
# Intentar borrar primero (ignorando errores)
ssh.exec_command("pm2 delete cocolu-backend")

# Iniciar limpiamente
print("Iniciando proceso...")
stdin, stdout, stderr = ssh.exec_command("cd /var/www/cocolu-chatbot && pm2 start server_start.js --name cocolu-backend")
print(stdout.read().decode('utf-8', errors='ignore'))
err = stderr.read().decode('utf-8', errors='ignore')
if err: print(f"STDERR: {err}")

print("Esperando reinicio...")
time.sleep(5)

print("Verificando estado...")
stdin, stdout, stderr = ssh.exec_command("pm2 status")
print(stdout.read().decode('utf-8', errors='ignore'))

# Opcional: Probar un OPTIONS request localmente para verheaders (dificil desde localhost sin simular origin)
print("Verificando logs de inicio...")
stdin, stdout, stderr = ssh.exec_command("pm2 logs cocolu-backend --lines 20 --nostream")
print(stdout.read().decode('utf-8', errors='ignore'))

ssh.close()
