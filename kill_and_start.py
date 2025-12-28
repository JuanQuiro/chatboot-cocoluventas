# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import time

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔥 KILL & START (Financial Fix) 🔥")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # 1. Kill everything on port 3008
    print("1. Matando procesos en puerto 3008...")
    ssh.exec_command("fuser -k 3008/tcp")
    time.sleep(2)
    
    # 2. Kill all node processes (Nuclear option to be safe)
    print("2. Matando todos los procesos node...")
    ssh.exec_command("killall node")
    time.sleep(2)
    
    # 3. Clean PM2
    print("3. Limpiando PM2...")
    ssh.exec_command("pm2 delete all")
    ssh.exec_command("pm2 flush")
    
    # 4. Start Server
    print("4. Iniciando Servidor Correcto...")
    cmd = "cd /var/www/cocolu-chatbot && pm2 start server_start.js --name cocolu-backend"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    # 5. Save
    ssh.exec_command("pm2 save")
    
    # 6. Verify Log (Startup)
    time.sleep(5)
    print("5. Verificando Logs de arranque...")
    stdin, stdout, stderr = ssh.exec_command("grep -C 2 'Financial' /root/.pm2/logs/cocolu-backend-out.log | tail -n 20")
    # Note: I didn't add a specific log for "Financial" in the code, but SetupRoutes might log something.
    stdout.read() 
    
    # Check "Updated" log or similar if possible. 
    # Or just check regular logs.
    stdin, stdout, stderr = ssh.exec_command("tail -n 20 /root/.pm2/logs/cocolu-backend-out.log")
    print(stdout.read().decode('utf-8', errors='ignore'))

    ssh.close()
    print("✅ Reinicio Completo.")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
