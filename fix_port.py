# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import os

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("Liberando puerto 3008 y reiniciando...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD)

def exec_cmd(cmd):
    print(f"$ {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='ignore'))
    err = stderr.read().decode('utf-8', errors='ignore')
    if err: print(f"STDERR: {err}")

# 1. Identificar y matar procesos en puerto 3008
print("\n[1/4] Matando procesos en puerto 3008...")
exec_cmd("fuser -k 3008/tcp 2>/dev/null || echo 'Ningun proceso en 3008'")
exec_cmd("killall node 2>/dev/null || echo 'No node processes'")

# 2. Verificar db.json
print("\n[2/4] Verificando db.json...")
exec_cmd("cat /var/www/cocolu-chatbot/database/db.json | head -c 50")
# Asegurar que sea JSON válido (si está vacío o corrompido, reiniciar)
exec_cmd("if [ ! -s /var/www/cocolu-chatbot/database/db.json ]; then echo '{}' > /var/www/cocolu-chatbot/database/db.json; fi")

# 3. Reiniciar PM2 limpiamente
print("\n[3/4] Reiniciando PM2...")
exec_cmd("pm2 delete all")
exec_cmd("cd /var/www/cocolu-chatbot && pm2 start server_start.js --name cocolu-backend")
exec_cmd("pm2 save")

# 4. Verificar
print("\n[4/4] Verificando estado...")
import time
time.sleep(5)
exec_cmd("pm2 status")
exec_cmd("pm2 logs cocolu-backend --lines 20 --nostream")
exec_cmd("curl -I http://localhost:3008")

ssh.close()
