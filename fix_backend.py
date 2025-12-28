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
    err = stderr.read().decode('utf-8', errors='ignore')
    if out: print(out)
    if err: print(f"STDERR: {err}")
    return out

print("Diagnosticando y arreglando backend...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SERVER, username=USER, password=PASSWORD)

# 1. Ver estructura del proyecto
print("\n[1/5] Verificando estructura del proyecto...")
exec_cmd(ssh, "find /var/www/cocolu-chatbot -maxdepth 2 -name '*.js' -type f | grep -v node_modules | grep -v dashboard")

# 2. Ver package.json para encontrar el script de inicio
print("\n[2/5] Verificando package.json...")
exec_cmd(ssh, "cat /var/www/cocolu-chatbot/package.json | grep -A5 scripts")

# 3. Detener proceso actual
print("\n[3/5] Deteniendo proceso actual...")
exec_cmd(ssh, "pm2 delete cocolu-backend")

# 4. Buscar archivo principal del servidor
print("\n[4/5] Buscando archivo del servidor...")
result = exec_cmd(ssh, "ls /var/www/cocolu-chatbot/*.js 2>/dev/null || ls /var/www/cocolu-chatbot/src/*.js 2>/dev/null || echo 'No encontrado'")

# 5. Iniciar servidor correcto
print("\n[5/5] Iniciando servidor...")

# Intentar diferentes opciones
commands = [
    "cd /var/www/cocolu-chatbot && pm2 start server.js --name cocolu-backend",
    "cd /var/www/cocolu-chatbot && pm2 start index.js --name cocolu-backend", 
    "cd /var/www/cocolu-chatbot && pm2 start src/server.js --name cocolu-backend",
    "cd /var/www/cocolu-chatbot && pm2 start src/index.js --name cocolu-backend",
    "cd /var/www/cocolu-chatbot && npm start"
]

for cmd in commands:
    result = exec_cmd(ssh, f"{cmd} 2>&1 || echo 'Failed'")
    if "Failed" not in result and "error" not in result.lower():
        print(f"Exito con: {cmd}")
        break

exec_cmd(ssh, "pm2 save")

# Verificar
print("\n[VERIFICACION]")
exec_cmd(ssh, "pm2 status")
exec_cmd(ssh, "sleep 3 && curl -I http://localhost:3008 2>&1 || echo 'Puerto 3008 no responde'")
exec_cmd(ssh, "netstat -tlnp | grep :3008 || ss -tlnp | grep :3008 || echo 'Puerto 3008 no en uso'")

ssh.close()
print("\nSi el puerto 3008 no responde, el backend puede estar usando otro puerto.")
print("Verifica los logs con: ssh root@173.249.205.142 'pm2 logs cocolu-backend'")
