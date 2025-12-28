# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔥 ATOMIC OPTION: Injecting Inline CSS...")

# 1. Read local Override.css
try:
    with open(r'dashboard\src\styles\Override.css', 'r', encoding='utf-8') as f:
        css_content = f.read()
        # Minify slightly to be safe
        css_content = css_content.replace('\n', ' ').replace('  ', ' ')
except Exception as e:
    print(f"❌ Failed to read local CSS: {e}")
    exit(1)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # Python script to run ON SERVER
    server_script = f"""
import os
import re

index_path = '/var/www/cocolu-chatbot/dashboard/build/index.html'
css_to_inject = \"\"\"{css_content}\"\"\"

with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove any previous injected style block if exists (simple heuristic)
html = re.sub(r'<style id="override-css">.*?</style>', '', html, flags=re.DOTALL)

# Inject new style block before </head>
style_block = f'<style id="override-css">{{css_to_inject}}</style>'
new_html = html.replace('</head>', style_block + '</head>')

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(new_html)

print("✅ INJECTED INLINE CSS SUCCESSFULLY")
"""
    
    # We need to escape the python script carefully for passing via command line
    # Actually, better to upload the runner script
    with open('inject_runner.py', 'w', encoding='utf-8') as f:
        f.write(server_script)
        
    sftp = ssh.open_sftp()
    sftp.put('inject_runner.py', '/tmp/inject_runner.py')
    sftp.close()
    
    stdin, stdout, stderr = ssh.exec_command("python3 /tmp/inject_runner.py")
    print(stdout.read().decode('utf-8'))
    print(stderr.read().decode('utf-8'))
    
    ssh.close()

except Exception as e:
    print(f"❌ Error: {e}")
