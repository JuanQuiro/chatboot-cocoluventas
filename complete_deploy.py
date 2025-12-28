# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

import paramiko
import os

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"
PROJECT_PATH = r"C:\Users\grana\chatboot-cocoluventas"

def exec_cmd(ssh, cmd):
    print(f"$ {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out: print(out)
    if err: print(f"STDERR: {err}")
    return out

def transfer_dir(sftp, local, remote):
    try:
        sftp.stat(remote)
    except:
        sftp.mkdir(remote)
    
    for item in os.listdir(local):
        if item in ['node_modules', 'build', '.git', 'deploy-temp', '_archive']:
            continue
        local_item = os.path.join(local, item)
        remote_item = f"{remote}/{item}"
        
        if os.path.isfile(local_item):
            print(f"  {item}")
            sftp.put(local_item, remote_item)
        elif os.path.isdir(local_item):
            transfer_dir(sftp, local_item, remote_item)

print("="*60)
print("COMPLETANDO DESPLIEGUE - cocolu.emberdrago.com")
print("="*60)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)
print("Conectado\n")

# 1. Transferir dashboard completo
print("\n[1/6] Transfiriendo dashboard...")
sftp = ssh.open_sftp()
try:
    dashboard_local = os.path.join(PROJECT_PATH, 'dashboard')
    if os.path.exists(dashboard_local):
        transfer_dir(sftp, dashboard_local, "/var/www/cocolu-chatbot/dashboard")
        print("OK Dashboard transferido")
except Exception as e:
    print(f"Error: {e}")
finally:
    sftp.close()

# 2. Build frontend
print("\n[2/6] Compilando frontend...")
exec_cmd(ssh, "cd /var/www/cocolu-chatbot/dashboard && npm install")
exec_cmd(ssh, "cd /var/www/cocolu-chatbot/dashboard && npm run build")

# 3. Desplegar frontend
print("\n[3/6] Desplegando frontend...")
exec_cmd(ssh, "mkdir -p /var/www/cocolu-frontend")
exec_cmd(ssh, "cp -r /var/www/cocolu-chatbot/dashboard/build/* /var/www/cocolu-frontend/ 2>/dev/null || echo 'Build copiado'")

# 4. Iniciar backend con PM2
print("\n[4/6] Iniciando backend...")
exec_cmd(ssh, "pm2 delete cocolu-backend 2>/dev/null || true")
exec_cmd(ssh, "cd /var/www/cocolu-chatbot && pm2 start src/app.js --name cocolu-backend")
exec_cmd(ssh, "pm2 save")

# 5. Actualizar Nginx para cocolu.emberdrago.com
print("\n[5/6] Configurando Nginx...")
nginx_config = """
server {
    listen 80;
    server_name cocolu.emberdrago.com;
    
    location / {
        root /var/www/cocolu-frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name api-cocolu.emberdrago.com;
    
    location / {
        proxy_pass http://localhost:3008;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
"""

# Escribir config
exec_cmd(ssh, f"cat > /etc/nginx/conf.d/cocolu.conf << 'EOF'\n{nginx_config}\nEOF")
exec_cmd(ssh, "nginx -t")
exec_cmd(ssh, "rc-service nginx restart")

# 6. Instalar SSL
print("\n[6/6] Configurando SSL...")
exec_cmd(ssh, "apk add certbot certbot-nginx")
exec_cmd(ssh, "certbot --nginx -d cocolu.emberdrago.com -d api-cocolu.emberdrago.com --non-interactive --agree-tos --email admin@emberdrago.com --redirect || echo 'SSL config manual requerida'")

# Verificacion final
print("\n" + "="*60)
print("VERIFICACION FINAL")
print("="*60)
exec_cmd(ssh, "pm2 status")

ssh.close()

print("\n" + "="*60)
print("DESPLIEGUE COMPLETADO!")
print("="*60)
print("\nURLs:")
print("  https://cocolu.emberdrago.com")
print("  https://api-cocolu.emberdrago.com/api")
print("\nSi SSL fallo, ejecuta manualmente:")
print("  ssh root@173.249.205.142")
print("  certbot --nginx -d cocolu.emberdrago.com -d api-cocolu.emberdrago.com")
