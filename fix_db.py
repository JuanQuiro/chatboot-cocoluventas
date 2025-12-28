# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import os

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("Diagnostico de Base de Datos...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD)

def exec_cmd(cmd):
    print(f"$ {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='ignore'))
    err = stderr.read().decode('utf-8', errors='ignore')
    if err: print(f"STDERR: {err}")

# 1. Ver estructura actual
print("\n[1/3] Verificando directorios...")
exec_cmd("ls -la /var/www/cocolu-chatbot/")
exec_cmd("ls -la /var/www/cocolu-chatbot/data/ 2>/dev/null")
exec_cmd("ls -la /var/www/cocolu-chatbot/database/ 2>/dev/null")

# 2. Corregir error
print("\n[2/3] Corrigiendo estructura...")
# Si existe data pero no database, crear symlink o mover
exec_cmd("mkdir -p /var/www/cocolu-chatbot/database")

# Verificar si hay un db.json en data/
exec_cmd("cp /var/www/cocolu-chatbot/data/cocolu.db /var/www/cocolu-chatbot/database/db.json 2>/dev/null || echo 'No cocolu.db found'")

# Si no existe, crear db.json vacío válido
exec_cmd("echo '{}' > /var/www/cocolu-chatbot/database/db.json")
exec_cmd("chmod 777 /var/www/cocolu-chatbot/database/db.json")

# 3. Reiniciar y verificar logs
print("\n[3/3] Reiniciando y verificando logs...")
exec_cmd("pm2 restart cocolu-backend")
import time
time.sleep(4)
exec_cmd("pm2 logs cocolu-backend --lines 20 --nostream")

ssh.close()
