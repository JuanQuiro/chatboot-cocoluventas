#!/usr/bin/env python3
"""
Script de Deployment Automático
Detecta el sistema operativo y despliega automáticamente
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

# Configuración
VPS_IP = "173.249.205.142"
VPS_USER = "root"
VPS_PASSWORD = "a9psHSvLyrKock45yE2F"
APP_DIR = "/opt/cocolu-bot"
DOMAIN = "emberdrago.com"
API_PORT = 3009
NODE_PORT = 3008

def run_ssh_command(command, check=True):
    """Ejecuta un comando SSH en el servidor remoto"""
    ssh_cmd = [
        "ssh",
        "-o", "StrictHostKeyChecking=accept-new",
        "-o", "ConnectTimeout=10",
        f"{VPS_USER}@{VPS_IP}",
        command
    ]
    
    print(f"🔧 Ejecutando: {command}")
    result = subprocess.run(ssh_cmd, capture_output=True, text=True)
    
    if result.returncode != 0 and check:
        print(f"❌ Error: {result.stderr}")
        return None
    
    return result.stdout.strip()

def upload_files():
    """Sube los archivos al servidor usando rsync"""
    local_dir = Path(__file__).parent.parent
    exclude_patterns = [
        '--exclude=node_modules',
        '--exclude=.git',
        '--exclude=dashboard/node_modules',
        '--exclude=dashboard/build',
        '--exclude=logs',
        '--exclude=*.log',
        '--exclude=.env',
        '--exclude=.env.*',
        '--exclude=.pm2',
        '--exclude=*.pid',
        '--exclude=tokens',
        '--exclude=src-rs-performance/target',
    ]
    
    print("📤 Subiendo archivos al servidor...")
    
    rsync_cmd = [
        "rsync",
        "-avz",
        "--progress",
        *exclude_patterns,
        f"{local_dir}/",
        f"{VPS_USER}@{VPS_IP}:{APP_DIR}/"
    ]
    
    result = subprocess.run(rsync_cmd)
    
    if result.returncode != 0:
        print("❌ Error subiendo archivos")
        return False
    
    print("✅ Archivos subidos correctamente")
    return True

def detect_os():
    """Detecta el sistema operativo del servidor"""
    print("🔍 Detectando sistema operativo...")
    result = run_ssh_command("cat /etc/os-release", check=False)
    
    if "Alpine" in result:
        return "alpine"
    elif "Ubuntu" in result or "Debian" in result:
        return "debian"
    else:
        return "unknown"

def install_dependencies_alpine():
    """Instala dependencias en Alpine Linux"""
    print("📦 Instalando dependencias en Alpine Linux...")
    
    commands = [
        "apk update",
        "apk add --no-cache nodejs npm python3 py3-pip bash curl wget git build-base",
        "npm install -g pm2",
    ]
    
    for cmd in commands:
        result = run_ssh_command(cmd, check=False)
        if result is None:
            print(f"⚠️  Advertencia en: {cmd}")
    
    print("✅ Dependencias instaladas")

def install_dependencies_debian():
    """Instala dependencias en Debian/Ubuntu"""
    print("📦 Instalando dependencias en Debian/Ubuntu...")
    
    commands = [
        "apt-get update -qq",
        "apt-get install -y -qq curl wget git build-essential",
        "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
        "apt-get install -y -qq nodejs",
        "npm install -g pm2",
    ]
    
    for cmd in commands:
        result = run_ssh_command(cmd, check=False)
        if result is None:
            print(f"⚠️  Advertencia en: {cmd}")
    
    print("✅ Dependencias instaladas")

def setup_application():
    """Configura la aplicación en el servidor"""
    print("🔧 Configurando aplicación...")
    
    commands = [
        f"cd {APP_DIR} && npm install --production",
        f"mkdir -p {APP_DIR}/logs",
        f"mkdir -p {APP_DIR}/.pm2",
    ]
    
    for cmd in commands:
        run_ssh_command(cmd, check=False)
    
    print("✅ Aplicación configurada")

def create_pm2_config():
    """Crea el archivo de configuración de PM2"""
    print("📝 Creando configuración de PM2...")
    
    pm2_config = f"""module.exports = {{
  apps: [{{
    name: 'cocolu-bot',
    script: './app-integrated.js',
    cwd: '{APP_DIR}',
    instances: 1,
    exec_mode: 'fork',
    env: {{
      NODE_ENV: 'production',
      PORT: {NODE_PORT},
      API_PORT: {API_PORT},
    }},
    error_file: '{APP_DIR}/logs/pm2-error.log',
    out_file: '{APP_DIR}/logs/pm2-out.log',
    log_file: '{APP_DIR}/logs/pm2-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    watch: false,
  }}]
}};"""
    
    # Crear archivo temporal
    temp_file = "/tmp/pm2-config.js"
    with open(temp_file, 'w') as f:
        f.write(pm2_config)
    
    # Subir al servidor
    subprocess.run([
        "scp", "-o", "StrictHostKeyChecking=accept-new",
        temp_file, f"{VPS_USER}@{VPS_IP}:{APP_DIR}/ecosystem.config.js"
    ])
    
    os.remove(temp_file)
    print("✅ Configuración de PM2 creada")

def create_traefik_config():
    """Crea la configuración de Traefik"""
    print("🌐 Creando configuración de Traefik...")
    
    traefik_config = f"""http:
  routers:
    cocolu-api:
      rule: "Host(`{DOMAIN}`) && PathPrefix(`/api`)"
      service: cocolu-api
      entryPoints:
        - web
        - websecure
      middlewares:
        - cocolu-headers
      tls:
        certResolver: letsencrypt

    cocolu-webhooks:
      rule: "Host(`{DOMAIN}`) && PathPrefix(`/webhooks`)"
      service: cocolu-api
      entryPoints:
        - web
        - websecure
      middlewares:
        - cocolu-headers
      tls:
        certResolver: letsencrypt

    cocolu-dashboard:
      rule: "Host(`{DOMAIN}`)"
      service: cocolu-api
      entryPoints:
        - web
        - websecure
      middlewares:
        - cocolu-headers
      tls:
        certResolver: letsencrypt

  services:
    cocolu-api:
      loadBalancer:
        servers:
          - url: "http://localhost:{API_PORT}"

  middlewares:
    cocolu-headers:
      headers:
        customRequestHeaders:
          X-Forwarded-Proto: "https"
        customResponseHeaders:
          X-Content-Type-Options: "nosniff"
          X-Frame-Options: "DENY"
"""
    
    # Crear directorio si no existe
    run_ssh_command("mkdir -p /etc/traefik/dynamic", check=False)
    
    # Crear archivo temporal
    temp_file = "/tmp/traefik-config.yml"
    with open(temp_file, 'w') as f:
        f.write(traefik_config)
    
    # Subir al servidor
    subprocess.run([
        "scp", "-o", "StrictHostKeyChecking=accept-new",
        temp_file, f"{VPS_USER}@{VPS_IP}:/etc/traefik/dynamic/cocolu-bot.yml"
    ])
    
    os.remove(temp_file)
    print("✅ Configuración de Traefik creada")

def start_application():
    """Inicia la aplicación con PM2"""
    print("🚀 Iniciando aplicación...")
    
    commands = [
        f"cd {APP_DIR} && pm2 stop cocolu-bot || true",
        f"cd {APP_DIR} && pm2 delete cocolu-bot || true",
        f"cd {APP_DIR} && pm2 start ecosystem.config.js",
        "pm2 save",
        "pm2 startup systemd -u root --hp /root || pm2 startup || true",
    ]
    
    for cmd in commands:
        run_ssh_command(cmd, check=False)
    
    print("✅ Aplicación iniciada")

def verify_deployment():
    """Verifica que el deployment fue exitoso"""
    print("🔍 Verificando deployment...")
    
    checks = [
        ("PM2 Status", f"pm2 list | grep cocolu-bot"),
        ("Puerto API", f"netstat -tuln | grep {API_PORT} || ss -tuln | grep {API_PORT}"),
        ("Archivos", f"ls -la {APP_DIR}/app-integrated.js"),
    ]
    
    for name, cmd in checks:
        result = run_ssh_command(cmd, check=False)
        if result:
            print(f"   ✅ {name}: OK")
        else:
            print(f"   ⚠️  {name}: No verificado")

def main():
    """Función principal"""
    print("🚀 ========================================")
    print("🚀   DEPLOYMENT AUTOMÁTICO")
    print("🚀 ========================================")
    print("")
    print(f"🌐 Servidor: {VPS_USER}@{VPS_IP}")
    print(f"📁 Directorio: {APP_DIR}")
    print(f"🌍 Dominio: {DOMAIN}")
    print("")
    
    # Paso 1: Subir archivos
    if not upload_files():
        print("❌ Error subiendo archivos. Abortando.")
        sys.exit(1)
    
    # Paso 2: Detectar OS
    os_type = detect_os()
    print(f"📋 Sistema detectado: {os_type}")
    
    # Paso 3: Instalar dependencias según el OS
    if os_type == "alpine":
        install_dependencies_alpine()
    elif os_type == "debian":
        install_dependencies_debian()
    else:
        print("⚠️  Sistema no reconocido, intentando con comandos genéricos...")
        install_dependencies_debian()
    
    # Paso 4: Configurar aplicación
    setup_application()
    
    # Paso 5: Crear configuración PM2
    create_pm2_config()
    
    # Paso 6: Crear configuración Traefik
    create_traefik_config()
    
    # Paso 7: Iniciar aplicación
    start_application()
    
    # Paso 8: Verificar
    verify_deployment()
    
    print("")
    print("✅ ========================================")
    print("✅   DEPLOYMENT COMPLETADO")
    print("✅ ========================================")
    print("")
    print("🌐 URLs:")
    print(f"   Dashboard: https://{DOMAIN}")
    print(f"   API: https://{DOMAIN}/api")
    print(f"   Webhooks: https://{DOMAIN}/webhooks/whatsapp")
    print("")
    print("📝 Próximos pasos:")
    print("   1. Configura DNS: A record emberdrago.com -> 173.249.205.142")
    print("   2. Configura .env: ssh al servidor y edita /opt/cocolu-bot/.env")
    print("   3. Verifica Traefik: Asegúrate de que lea /etc/traefik/dynamic/cocolu-bot.yml")
    print("   4. Actualiza webhook de Meta: https://emberdrago.com/webhooks/whatsapp")
    print("")

if __name__ == "__main__":
    main()

