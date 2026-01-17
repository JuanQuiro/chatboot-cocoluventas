# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import os

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"
PROJECT_PATH = r"C:\Users\grana\chatboot-cocoluventas"

print("Transfiriendo archivos faltantes del backend...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD)

sftp = ssh.open_sftp()

# Transferir archivos .js de la raíz del proyecto
print("\n[1/3] Transfiriendo archivos raíz...")
root_files = []
for item in os.listdir(PROJECT_PATH):
    if item.endswith('.js') and os.path.isfile(os.path.join(PROJECT_PATH, item)):
        root_files.append(item)
        
for file in root_files:
    local_file = os.path.join(PROJECT_PATH, file)
    remote_file = f"/var/www/cocolu-chatbot/{file}"
    print(f"  Subiendo: {file}")
    try:
        sftp.put(local_file, remote_file)
    except Exception as e:
        print(f"  Error: {e}")

# Verificar que se subieron
print("\n[2/3] Verificando archivos...")
stdin, stdout, stderr = ssh.exec_command("ls -la /var/www/cocolu-chatbot/*.js")
print(stdout.read().decode('utf-8', errors='ignore'))

# Iniciar servidor
print("\n[3/3] Iniciando servidor...")
ssh.exec_command("pm2 delete cocolu-backend 2>/dev/null || true")
stdin, stdout, stderr = ssh.exec_command("cd /var/www/cocolu-chatbot && pm2 start iniciar-bot-profesional.js --name cocolu-backend")
print(stdout.read().decode('utf-8', errors='ignore'))

ssh.exec_command("pm2 save")

# Esperar y verificar
print("\nEsperando 5 segundos...")
import time
time.sleep(5)

stdin, stdout, stderr = ssh.exec_command("pm2 status")
print(stdout.read().decode('utf-8', errors='ignore'))

stdin, stdout, stderr = ssh.exec_command("curl -I http://localhost:3008 2>&1")
result = stdout.read().decode('utf-8', errors='ignore')
print(result)

if "200" in result or "HTTP" in result:
    print("\n✅ Backend respondiendo correctamente!")
else:
    print("\n⚠ Backend aún no responde. Verificando puerto...")
    stdin, stdout, stderr = ssh.exec_command("pm2 logs cocolu-backend --lines 20 --nostream")
    print(stdout.read().decode('utf-8', errors='ignore'))

sftp.close()
ssh.close()
