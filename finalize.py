# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

def exec_cmd(ssh, cmd):
    print(f"$ {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='ignore')
    if out: print(out)
    return out

print("Finalizando configuracion...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD)

# 1. Encontrar y iniciar backend
print("\n[1/4] Iniciando backend...")
exec_cmd(ssh, "ls -la /var/www/cocolu-chatbot/src/")
exec_cmd(ssh, "pm2 delete cocolu-backend 2>/dev/null || true")
exec_cmd(ssh, "cd /var/www/cocolu-chatbot && pm2 start src/server.js --name cocolu-backend 2>/dev/null || pm2 start src/index.js --name cocolu-backend 2>/dev/null || pm2 start server.js --name cocolu-backend 2>/dev/null || echo 'Buscando archivo principal...'")

# Si no funciona, buscar el archivo principal
result = exec_cmd(ssh, "find /var/www/cocolu-chatbot -name '*.js' -path '*/src/*' -type f | head -5")
print(f"Archivos encontrados:\n{result}")

# Intentar con el primer archivo que tenga 'server' o 'app' en el nombre
exec_cmd(ssh, "cd /var/www/cocolu-chatbot && pm2 start $(find src -name '*server*.js' -o -name '*app*.js' -o -name 'index.js' | head -1) --name cocolu-backend || echo 'Backend manual requerido'")
exec_cmd(ssh, "pm2 save")

# 2. Crear directorio nginx y copiar config
print("\n[2/4] Configurando Nginx...")
exec_cmd(ssh, "mkdir -p /etc/nginx/http.d")
nginx_config = """server {
    listen 80;
    server_name cocolu.emberdrago.com;
    root /var/www/cocolu-frontend;
    index index.html;
    location / {
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
}"""

exec_cmd(ssh, f"echo '{nginx_config}' > /etc/nginx/http.d/cocolu.conf")
exec_cmd(ssh, "nginx -t && rc-service nginx restart")

# 3. SSL con expand
print("\n[3/4] Configurando SSL...")
exec_cmd(ssh, "certbot --nginx -d cocolu.emberdrago.com -d api-cocolu.emberdrago.com --expand --non-interactive --agree-tos --email admin@emberdrago.com --redirect || echo 'SSL requiere intervencion manual'")

# 4. Verificacion
print("\n[4/4] Verificacion final...")
exec_cmd(ssh, "pm2 status")
exec_cmd(ssh, "curl -I http://localhost:3008 2>/dev/null | head -5 || echo 'Backend no responde en 3008'")

ssh.close()

print("\n" + "="*60)
print("CONFIGURACION COMPLETADA")
print("="*60)
print("\nVerifica:")
print("  https://cocolu.emberdrago.com")
print("  https://api-cocolu.emberdrago.com/api")
