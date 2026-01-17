# -*- coding: utf-8 -*-
import sys
import paramiko
import os

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"
LOCAL_FILE = r"c:\Users\grana\chatboot-cocoluventas\app-integrated.js"
REMOTE_FILE = "/var/www/cocolu-chatbot/app-integrated.js"

print("DEBUG UPDATE...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # 1. Check BEFORE
    print("\n--- CONTENIDO REMOTO ANTES (Grep Financial) ---")
    stdin, stdout, stderr = ssh.exec_command(f"grep 'financial' {REMOTE_FILE}")
    print(stdout.read().decode('utf-8', errors='ignore'))

    # 2. Upload
    print(f"\nSubiendo archivo {LOCAL_FILE}...")
    sftp = ssh.open_sftp()
    sftp.put(LOCAL_FILE, REMOTE_FILE)
    sftp.close()
    
    # 3. Check AFTER
    print("\n--- CONTENIDO REMOTO DESPUES (Grep Financial) ---")
    stdin, stdout, stderr = ssh.exec_command(f"grep 'financial' {REMOTE_FILE}")
    res = stdout.read().decode('utf-8', errors='ignore')
    print(res)

    if "routes.js" in res:
        print("OK - Archivo actualizado correctamente.")
        # Restart Process
        ssh.exec_command("pm2 restart cocolu-backend")
    else:
        print("FAIL - FALLO LA ACTUALIZACION")

    ssh.close()

except Exception as e:
    print(f"Error: {e}")
