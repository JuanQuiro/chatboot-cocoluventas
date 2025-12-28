# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import subprocess
import os
import shutil

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🚀 Building and Deploying Enhanced Frontend...")

# Step 1: Build frontend
print("\n📦 Building React frontend...")
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
    print("✅ Frontend built successfully")
except Exception as e:
    print(f"❌ Build error: {e}")
    sys.exit(1)

# Step 2: Upload to server
print("\n📤 Uploading to server...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # Clear old build
    print("Clearing old build...")
    ssh.exec_command("rm -rf /var/www/cocolu-chatbot/dashboard/build/*")
    
    # Create tar archive locally
    print("Creating archive...")
    local_build = r"c:\Users\grana\chatboot-cocoluventas\dashboard\build"
    archive_path = r"c:\Users\grana\chatboot-cocoluventas\dashboard\build.tar.gz"
    
    subprocess.run(
        ["tar", "-czf", archive_path, "-C", local_build, "."],
        check=True,
        shell=True
    )
    
    # Upload archive
    print("Uploading archive...")
    sftp = ssh.open_sftp()
    sftp.put(archive_path, "/tmp/build.tar.gz")
    sftp.close()
    
    # Extract on server
    print("Extracting on server...")
    stdin, stdout, stderr = ssh.exec_command(
        "tar -xzf /tmp/build.tar.gz -C /var/www/cocolu-chatbot/dashboard/build && rm /tmp/build.tar.gz"
    )
    stdout.channel.recv_exit_status()
    
    # Cleanup local archive
    os.remove(archive_path)
    
    print("\n✅ Frontend deployed successfully!")
    print("\n🌐 Test URLs:")
    print("   - https://cocolu.emberdrago.com/crear-venta")
    print("   - Test client autocomplete with enhanced UI")
    
    ssh.close()

except Exception as e:
    print(f"❌ Deployment error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✅ Deployment complete!")
