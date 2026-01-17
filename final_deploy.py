# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import os
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"
LOCAL_BUILD_DIR = r"c:\Users\grana\chatboot-cocoluventas\dashboard\build"
REMOTE_DIR = "/var/www/cocolu-frontend"

css_file_path = r"c:\Users\grana\chatboot-cocoluventas\dashboard\src\styles\Override.css"

print("🚀 STARTING FINAL DEPLOYMENT WITH UI FIXES...")

# 1. Read CSS content
print(f"Reading CSS from {css_file_path}...")
try:
    with open(css_file_path, 'r', encoding='utf-8') as f:
        css_content = f.read()
    # Minify simple
    css_content = css_content.replace('\n', ' ').replace('  ', ' ')
    print(f"CSS Read. Length: {len(css_content)} chars.")
except Exception as e:
    print(f"❌ Error reading CSS: {e}")
    sys.exit(1)

# 2. Upload Files
print(f"\n📡 Connecting to {SERVER}...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    sftp = ssh.open_sftp()
    
    # Check if local build exists
    if not os.path.exists(LOCAL_BUILD_DIR):
        print("❌ Build directory not found! implementation failed?")
        sys.exit(1)
        
    print("📤 Uploading built files (this might take a moment)...")
    
    # Recursively upload
    file_count = 0
    for root, dirs, files in os.walk(LOCAL_BUILD_DIR):
        relative_root = os.path.relpath(root, LOCAL_BUILD_DIR)
        remote_root = os.path.join(REMOTE_DIR, relative_root).replace('\\', '/')
        
        # Create remote dir if not exists
        try:
            sftp.stat(remote_root)
        except IOError:
            sftp.mkdir(remote_root)
            
        for file in files:
            local_path = os.path.join(root, file)
            remote_path = os.path.join(remote_root, file).replace('\\', '/')
            sftp.put(local_path, remote_path)
            file_count += 1
            if file_count % 10 == 0:
                print(f"Uploaded {file_count} files...", end='\r')
                
    print(f"\n✅ Uploaded {file_count} files successfully.")
    
    # 3. Inject CSS
    print("\n💉 Injecting CSS into index.html...")
    
    index_path = f"{REMOTE_DIR}/index.html"
    
    # Read remote index.html
    with sftp.open(index_path, 'r') as f:
        html_content = f.read().decode('utf-8')
        
    # Remove existing injection if any
    import re
    clean_html = re.sub(r'<style id="override-css">.*?</style>', '', html_content, flags=re.DOTALL)
    
    # Inject before </head>
    style_block = f'<style id="override-css">{css_content}</style>'
    new_html = clean_html.replace('</head>', f'{style_block}</head>')
    
    # Write back
    with sftp.open(index_path, 'w') as f:
        f.write(new_html)
        
    print("✅ CSS Injected successfully in LIVE DIRECTORY.")
    
    sftp.close()
    ssh.close()
    print("\n✨ DEPLOYMENT COMPLETE! Refresh the site.")

except Exception as e:
    print(f"\n❌ Error during deployment: {e}")
