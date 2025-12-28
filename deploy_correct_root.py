# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔥 DEPLOYING TO CORRECT ROOT...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # 1. Backup existing frontend just in case
    print("\n1. Backing up existing frontend...")
    ssh.exec_command("mv /var/www/cocolu-frontend /var/www/cocolu-frontend.bak")
    
    # 2. Copy build to correct location
    print("\n2. Copying build to /var/www/cocolu-frontend...")
    # Make sure parent dir exists (it should)
    ssh.exec_command("mkdir -p /var/www/cocolu-frontend")
    
    # Copy content using cp -r
    cmd = "cp -r /var/www/cocolu-chatbot/dashboard/build/* /var/www/cocolu-frontend/"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    err = stderr.read().decode('utf-8')
    if err:
        print(f"Warning during copy: {err}")
    else:
        print("Copy success.")
        
    # 3. Verify index.html in NEW location has injection
    print("\n3. Verifying injection in LIVE location...")
    stdin, stdout, stderr = ssh.exec_command("grep '<style id=\"override-css\">' /var/www/cocolu-frontend/index.html")
    if stdout.read().decode('utf-8'):
        print("✅ LIVE SITE HAS INJECTION!")
    else:
        print("❌ LIVE SITE MISSING INJECTION (Copy failed?)")
        
    ssh.close()

except Exception as e:
    print(f"❌ Error: {e}")
