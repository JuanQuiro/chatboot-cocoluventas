# -*- coding: utf-8 -*-
import sys
import paramiko
import os
import time

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"
REMOTE_DIR = "/var/www/cocolu-chatbot"
SRC_API_DIR = "/var/www/cocolu-chatbot/src/api"

print("Actualizando Rutas Financieras...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    sftp = ssh.open_sftp()
    
    # Upload financial.routes.js
    local_routes = r"c:\Users\grana\chatboot-cocoluventas\src\api\financial.routes.js"
    remote_routes = f"{SRC_API_DIR}/financial.routes.js"
    print(f"Subiendo {local_routes} -> {remote_routes}")
    sftp.put(local_routes, remote_routes)
    
    # Upload app-integrated.js
    local_app = r"c:\Users\grana\chatboot-cocoluventas\app-integrated.js"
    remote_app = f"{REMOTE_DIR}/app-integrated.js"
    print(f"Subiendo {local_app} -> {remote_app}")
    sftp.put(local_app, remote_app)
    
    sftp.close()

    # Restart Backend
    print("Reiniciando backend...")
    stdin, stdout, stderr = ssh.exec_command("pm2 restart cocolu-backend")
    print(stdout.read().decode('utf-8', errors='ignore'))
    err = stderr.read().decode('utf-8', errors='ignore')
    if err: print(f"STDERR: {err}")
    
    # Verify Restart
    time.sleep(5)
    print("Verificando estado...")
    stdin, stdout, stderr = ssh.exec_command("pm2 status cocolu-backend")
    print(stdout.read().decode('utf-8', errors='ignore'))

    ssh.close()
    print("✅ Actualización completada.")

except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
