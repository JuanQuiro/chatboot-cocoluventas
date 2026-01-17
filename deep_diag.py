# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import os

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("Diagnostico Profundo...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD)

def exec_cmd(cmd, name):
    print(f"\n[{name}]")
    print(f"$ {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out: print(out[:1000]) # Limit output
    if err: print(f"STDERR: {err}")

# 1. Check Nginx Config
exec_cmd("cat /etc/nginx/http.d/cocolu.conf", "Nginx Config")

# 2. Check Nginx Logs for 502/500 errors
exec_cmd("tail -n 20 /var/log/nginx/error.log", "Nginx Error Log")
exec_cmd("tail -n 20 /var/log/nginx/access.log | grep '/api/'", "Nginx Access Log (API)")

# 3. Check Backend Logs for errors
exec_cmd("pm2 logs cocolu-backend --lines 50 --nostream", "Backend Logs")

# 4. Check Frontend Static Files for API URL
# Try to find the API URL in the built JS files
exec_cmd("grep -r 'api-cocolu.emberdrago.com' /var/www/cocolu-frontend/static/js/ || grep -r 'localhost:3008' /var/www/cocolu-frontend/static/js/ || echo 'API URL NOT FOUND IN BUILD'", "Frontend API URL Check")

# 5. Check if backend is actually listening on localhost ipv4 vs ipv6
exec_cmd("netstat -tlnp", "Netstat")

ssh.close()
