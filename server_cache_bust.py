
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
# Escape dots in regex but keep string for replacement
new_content = re.sub(r'/static/css/main\.[a-z0-9]+\.css(\?v=\d+)?', new_href, content)

if new_href in new_content:
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"✅ Updated index.html to use {new_href}")
else:
    print("❌ Could not replace CSS link. Pattern mismatch?")
    # Try simpler replace if regex fails (sometimes path varies)
    if '.css' in content:
        print("Attempting simple replace...")
        # Assuming only one main css file linked
        new_content = re.sub(r'href="[^"]+\.css[^"]*"', f'href="{new_href}"', content)
        if new_href in new_content:
             with open(index_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
             print(f"✅ Updated index.html (fallback) to {new_href}")
        else:
             print("❌ Simple replace also failed.")
