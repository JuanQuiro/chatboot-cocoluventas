# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import paramiko

SERVER = "173.249.205.142"
USER = "root"
PASSWORD = "a9psHSvLyrKock45yE2F"

print("🔥 ULTRA CACHE BUSTING...")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(SERVER, username=USER, password=PASSWORD)
    
    # Python script to run on SERVER
    server_script = """
import os
import glob
import time
import re

build_dir = '/var/www/cocolu-chatbot/dashboard/build'
index_path = os.path.join(build_dir, 'index.html')
css_dir = os.path.join(build_dir, 'static/css')

# Find actual CSS file
css_files = glob.glob(os.path.join(css_dir, 'main.*.css'))
if not css_files:
    print("❌ Critical: No compiled CSS file found on server")
    exit(1)

css_filename = os.path.basename(css_files[0])
print(f"Found CSS: {css_filename}")

# Read index.html
with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Timestamp
ts = int(time.time())

# Regex replacement to ensure we point to the RIGHT file and add version
# Pattern: href="/static/css/main\.[a-z0-9]+\.css(\?v=\d+)?"
new_href = f'/static/css/{css_filename}?v={ts}'
new_content = re.sub(r'/static/css/main\.[a-z0-9]+\.css(\?v=\d+)?', new_href, content)

if new_href in new_content:
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"✅ Updated index.html to use {new_href}")
else:
    print("❌ Could not replace CSS link. Pattern mismatch?")
    print("Content prelude:", content[:300])

"""
    
    stdin, stdout, stderr = ssh.exec_command(f"python3 -c \"{server_script}\"")
    print(stdout.read().decode('utf-8'))
    print(stderr.read().decode('utf-8'))
    
    ssh.close()

except Exception as e:
    print(f"❌ Error: {e}")
