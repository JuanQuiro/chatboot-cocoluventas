# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko
import subprocess
import os

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🚀 Deploying Frontend with Client API Fix...")

# Step 1: Build frontend locally
print("\n📦 Building React frontend...")
try:
    result = subprocess.run(
        ["cmd", "/c", "cd dashboard && npm run build"],
        cwd=r"c:\Users\grana\chatboot-cocoluventas",
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
print("\n📤 Uploading frontend to server...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    sftp = ssh.open_sftp()
    
    # Create remote directory if needed
    try:
        sftp.stat('/var/www/cocolu-chatbot/dashboard/build')
    except:
        print("Creating build directory...")
        ssh.exec_command("mkdir -p /var/www/cocolu-chatbot/dashboard/build")
    
    # Upload build directory
    local_build = r"c:\Users\grana\chatboot-cocoluventas\dashboard\build"
    remote_build = "/var/www/cocolu-chatbot/dashboard/build"
    
    print("Uploading files...")
    # Remove old build
    ssh.exec_command(f"rm -rf {remote_build}/*")
    
    # Upload new build (using tar for efficiency)
    print("Creating archive...")
    subprocess.run(
        ["cmd", "/c", f"cd {local_build} && tar -czf ../build.tar.gz *"],
        check=True
    )
    
    print("Uploading archive...")
    sftp.put(
        r"c:\Users\grana\chatboot-cocoluventas\dashboard\build.tar.gz",
        "/tmp/build.tar.gz"
    )
    
    print("Extracting on server...")
    ssh.exec_command(f"tar -xzf /tmp/build.tar.gz -C {remote_build}")
    ssh.exec_command("rm /tmp/build.tar.gz")
    
    # Cleanup local archive
    os.remove(r"c:\Users\grana\chatboot-cocoluventas\dashboard\build.tar.gz")
    
    sftp.close()
    
    print("\n✅ Frontend deployed successfully!")
    print("\n🌐 Test URLs:")
    print("   - https://cocolu.emberdrago.com")
    print("   - https://cocolu.emberdrago.com/crear-venta (Test client autocomplete)")
    
    ssh.close()

except Exception as e:
    print(f"❌ Deployment error: {e}")
    sys.exit(1)

print("\n✅ Deployment complete!")
