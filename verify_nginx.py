# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("Verificando cambio Nginx...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD)

def exec_cmd(cmd):
    print(f"$ {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    if out: print(out)

# 1. Check content of config file
print("\n[1/3] Contenido actual de la configuracion:")
exec_cmd("cat /etc/nginx/http.d/cocolu.conf | grep proxy_pass")

# 2. Check for other configs
print("\n[2/3] Buscando otras configuraciones activas:")
exec_cmd("ls -la /etc/nginx/http.d/")
exec_cmd("ls -la /etc/nginx/sites-enabled/ 2>/dev/null")

# 3. Test request
print("\n[3/3] Probando request local (curl a dominio)...")
exec_cmd("curl -I https://api-cocolu.emberdrago.com/api/health")

ssh.close()
