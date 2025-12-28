# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import subprocess
import os

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🚀 Deploying Layout Fix...")

# Build frontend
print("\n📦 Building...")
try:
    result = subprocess.run(
        ["cmd", "/c", "npm run build"],
        cwd=r"c:\Users\grana\chatboot-cocoluventas\dashboard",
        capture_output=True,
        text=True,
        timeout=180
    )
    if result.returncode != 0:
        print("❌ Build failed:")
        print(result.stderr)
        sys.exit(1)
    print("✅ Built")
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

# Upload
print("\n📤 Uploading...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    ssh.exec_command("rm -rf /var/www/cocolu-chatbot/dashboard/build/*")
    
    archive_path = r"c:\Users\grana\chatboot-cocoluventas\dashboard\build.tar.gz"
    subprocess.run(["tar", "-czf", archive_path, "-C", r"c:\Users\grana\chatboot-cocoluventas\dashboard\build", "."], check=True, shell=True)
    
    sftp = ssh.open_sftp()
    sftp.put(archive_path, "/tmp/build.tar.gz")
    sftp.close()
    
    ssh.exec_command("tar -xzf /tmp/build.tar.gz -C /var/www/cocolu-chatbot/dashboard/build && rm /tmp/build.tar.gz")
    os.remove(archive_path)
    
    print("\n✅ Deployed!")
    print("👉 https://cocolu.emberdrago.com/crear-venta")
    
    ssh.close()
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
