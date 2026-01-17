# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')  # Fix encoding issues

import paramiko
import os
from pathlib import Path
import time

# Configuracion
SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"
PROJECT_PATH = r"C:\Users\grana\chatboot-cocoluventas"

def print_step(step, message):
    print(f"\n{'='*60}")
    print(f"[{step}] {message}")
    print('='*60)

def execute_command(ssh, command, description=""):
    """Ejecuta un comando SSH y muestra la salida"""
    if description:
        print(f"\n> {description}")
    print(f"$ {command}")
    
    stdin, stdout, stderr = ssh.exec_command(command)
    exit_status = stdout.channel.recv_exit_status()
    
    output = stdout.read().decode('utf-8', errors='ignore')
    error = stderr.read().decode('utf-8', errors='ignore')
    
    if output:
        print(output)
    if error and exit_status != 0:
        print(f"ERROR: {error}")
        
    return exit_status == 0

def transfer_directory(sftp, local_path, remote_path):
    """Transfiere un directorio recursivamente"""
    try:
        sftp.stat(remote_path)
    except IOError:
        sftp.mkdir(remote_path)
    
    for item in os.listdir(local_path):
        local_item = os.path.join(local_path, item)
        remote_item = f"{remote_path}/{item}"
        
        if os.path.isfile(local_item):
            print(f"  Subiendo: {item}")
            sftp.put(local_item, remote_item)
        elif os.path.isdir(local_item):
            if item in ['node_modules', 'build', '.git', 'deploy-temp', '_archive']:
                continue
            transfer_directory(sftp, local_item, remote_item)

def main():
    print_step("INICIO", "Despliegue Automatizado - Cocolu Chatbot")
    
    # Conectar SSH
    print_step("1/11", "Conectando al servidor...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(SERVER, username=USER, password=PASSWORD, timeout=30)
        print("OK Conectado exitosamente")
    except Exception as e:
        print(f"ERROR de conexion: {e}")
        return False
    
    # Detectar sistema operativo
    print_step("2/11", "Detectando sistema operativo...")
    stdin, stdout, stderr = ssh.exec_command("cat /etc/os-release")
    os_info = stdout.read().decode('utf-8')
    print(os_info[:200])
    
    # Determinar gestor de paquetes
    is_alpine = "alpine" in os_info.lower()
    pkg_mgr = "apk" if is_alpine else "apt"
    print(f"\nSistema detectado: {'Alpine Linux' if is_alpine else 'Debian/Ubuntu'}")
    print(f"Gestor de paquetes: {pkg_mgr}")
    
    # Preparar servidor
    print_step("3/11", "Preparando servidor...")
    execute_command(ssh, "mkdir -p /var/www/cocolu-chatbot", "Crear directorio")
    
    if is_alpine:
        execute_command(ssh, "apk update", "Actualizar sistema")
        execute_command(ssh, "apk add nodejs npm nginx bash curl", "Instalar Node.js y dependencias")
    else:
        execute_command(ssh, "apt update -qq", "Actualizar sistema")
        execute_command(ssh, "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -", "Agregar repo Node.js")
        execute_command(ssh, "apt install -y nodejs nginx build-essential python3", "Instalar dependencias")
    
    # Verificar Node.js
    print_step("4/11", "Verificando Node.js...")
    execute_command(ssh, "node -v && npm -v", "Versiones")
    
    # Instalar PM2
    print_step("5/11", "Instalando PM2...")
    execute_command(ssh, "npm install -g pm2", "Instalar PM2")
    
    # Transferir archivos
    print_step("6/11", "Transfiriendo archivos...")
    sftp = ssh.open_sftp()
    
    try:
        folders = ['src', 'data', 'deployment']
        for folder in folders:
            local_folder = os.path.join(PROJECT_PATH, folder)
            if os.path.exists(local_folder):
                print(f"\nTransfiriendo: {folder}")
                transfer_directory(sftp, local_folder, f"/var/www/cocolu-chatbot/{folder}")
        
        files = ['package.json', 'package-lock.json', 'ecosystem.config.cjs', 'app-integrated.js']
        for file in files:
            local_file = os.path.join(PROJECT_PATH, file)
            if os.path.exists(local_file):
                print(f"Subiendo: {file}")
                sftp.put(local_file, f"/var/www/cocolu-chatbot/{file}")
        
        print("\nTransfiriendo dashboard...")
        for folder in ['src', 'public']:
            local_folder = os.path.join(PROJECT_PATH, 'dashboard', folder)
            if os.path.exists(local_folder):
                transfer_directory(sftp, local_folder, f"/var/www/cocolu-chatbot/dashboard/{folder}")
        
        for file in ['package.json', 'package-lock.json', '.env.production']:
            local_file = os.path.join(PROJECT_PATH, 'dashboard', file)
            if os.path.exists(local_file):
                sftp.put(local_file, f"/var/www/cocolu-chatbot/dashboard/{file}")
        
        print("OK Archivos transferidos")
    except Exception as e:
        print(f"ERROR en transferencia: {e}")
    finally:
        sftp.close()
    
    # Configurar backend
    print_step("7/11", "Configurando backend...")
    execute_command(ssh, "cd /var/www/cocolu-chatbot && npm install --production", "Instalar dependencias")
    execute_command(ssh, "cd /var/www/cocolu-chatbot && mkdir -p logs data", "Crear directorios")
    execute_command(ssh, "cd /var/www/cocolu-chatbot && node -e \"require('./src/config/database.service.js')\" || true", "Inicializar DB")
    
    # Iniciar con PM2
    print_step("8/11", "Iniciando backend con PM2...")
    execute_command(ssh, "pm2 delete cocolu-backend || true", "Limpiar PM2")
    execute_command(ssh, "cd /var/www/cocolu-chatbot && pm2 start ecosystem.config.cjs", "Iniciar backend")
    execute_command(ssh, "pm2 save", "Guardar PM2")
    execute_command(ssh, "pm2 startup || true", "Configurar autostart")
    
    # Build frontend
    print_step("9/11", "Compilando frontend...")
    execute_command(ssh, "cd /var/www/cocolu-chatbot/dashboard && npm install", "Instalar dependencias")
    execute_command(ssh, "cd /var/www/cocolu-chatbot/dashboard && npm run build", "Build React")
    
    # Desplegar frontend
    print_step("10/11", "Desplegando frontend...")
    execute_command(ssh, "mkdir -p /var/www/cocolu-frontend", "Crear directorio")
    execute_command(ssh, "cp -r /var/www/cocolu-chatbot/dashboard/build/* /var/www/cocolu-frontend/", "Copiar build")
    
    # Configurar Nginx
    print_step("11/11", "Configurando Nginx...")
    execute_command(ssh, "cp /var/www/cocolu-chatbot/deployment/nginx-cocolu.conf /etc/nginx/sites-available/cocolu || cp /var/www/cocolu-chatbot/deployment/nginx-cocolu.conf /etc/nginx/conf.d/cocolu.conf", "Copiar config")
    execute_command(ssh, "nginx -t", "Verificar config")
    execute_command(ssh, "rc-service nginx restart || systemctl restart nginx", "Reiniciar nginx")
    
    # Verificacion
    print_step("VERIFICACION", "Estado del sistema")
    execute_command(ssh, "pm2 status", "Estado PM2")
    
    ssh.close()
    
    print_step("COMPLETADO", "Despliegue exitoso!")
    print(f"\nURLs de acceso:")
    print(f"  Frontend: http://{SERVER}")
    print(f"  Backend:  http://{SERVER}:3008/api")
    print(f"\nProximos pasos:")
    print(f"  1. Configurar DNS")
    print(f"  2. Configurar SSL")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nDespliegue cancelado")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nError fatal: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
