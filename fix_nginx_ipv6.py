# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import os

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("Arreglando Nginx IPv6/IPv4...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD)

def exec_cmd(cmd):
    print(f"$ {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='ignore'))
    err = stderr.read().decode('utf-8', errors='ignore')
    if err: print(f"STDERR: {err}")

# Update Nginx config to use 127.0.0.1 instead of localhost
nginx_config = """server {
    server_name cocolu.emberdrago.com;
    root /var/www/cocolu-frontend;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/cocolu.emberdrago.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/cocolu.emberdrago.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    server_name api-cocolu.emberdrago.com;
    location / {
        # FORCE IPV4 HERE
        proxy_pass http://127.0.0.1:3008;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/cocolu.emberdrago.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/cocolu.emberdrago.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = api-cocolu.emberdrago.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = cocolu.emberdrago.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name cocolu.emberdrago.com;
    return 404; # managed by Certbot
}
"""

print("\nAplicando nueva configuracion Nginx...")
exec_cmd(f"echo '{nginx_config}' > /etc/nginx/http.d/cocolu.conf")
exec_cmd("nginx -t")
exec_cmd("rc-service nginx reload")

print("\nVerificando logs despues del cambio...")
exec_cmd("tail -n 10 /var/log/nginx/error.log")

ssh.close()
