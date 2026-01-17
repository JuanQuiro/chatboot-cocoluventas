# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔧 SPLITTING NGINX PORTS (API -> 3009)...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # Read current config to ensure we are editing the right file
    # We look for the file containing 'api-cocolu'
    stdin, stdout, stderr = ssh.exec_command("grep -l 'api-cocolu' /etc/nginx/http.d/*.conf")
    files = stdout.read().decode('utf-8').strip().split('\n')
    
    if not files or not files[0]:
        print("❌ Could not find Nginx config for api-cocolu")
        # Try default
        files = ["/etc/nginx/http.d/cocolu.conf"]

    config_file = files[0]
    print(f"📄 Updating config file: {config_file}")

    # Use sed to replace port 3008 with 3009 ONLY for the API server block
    # This is tricky with sed. 
    # Better approach: Read, Replace in Python, Write back.
    
    sftp = ssh.open_sftp()
    with sftp.open(config_file, 'r') as f:
        content = f.read().decode('utf-8')
    
    # We confirmed api-cocolu points to 3008.
    # We want to change it to 3009.
    # BUT wait, does 'cocolu.emberdrago.com' point to 3008? No, it serves static.
    # So we can safely replace "proxy_pass http://localhost:3008" with "3009".
    # Or "http://127.0.0.1:3008".
    
    if "proxy_pass http://localhost:3008" in content:
        new_content = content.replace("proxy_pass http://localhost:3008", "proxy_pass http://127.0.0.1:3009")
    elif "proxy_pass http://127.0.0.1:3008" in content:
        new_content = content.replace("proxy_pass http://127.0.0.1:3008", "proxy_pass http://127.0.0.1:3009")
    else:
        print("⚠️ pattern not found exactly. Content snippet:")
        print(content[:500])
        new_content = content # No change

    if new_content != content:
        with sftp.open(config_file, 'w') as f:
            f.write(new_content)
        print("✅ Config updated.")
        
        # Reload Nginx
        stdin, stdout, stderr = ssh.exec_command("nginx -t && nginx -s reload")
        print(stdout.read().decode('utf-8'))
        print(stderr.read().decode('utf-8'))
        print("🔄 Nginx Reloaded.")
    else:
        print("⚠️ No changes made (already 3009?).")

    sftp.close()
    ssh.close()

except Exception as e:
    print(f"Error: {e}")
