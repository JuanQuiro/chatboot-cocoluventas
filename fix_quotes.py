#!/usr/bin/env python3
import re

file_path = 'production/src/api/meta-setup-routes.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all value="${...}" with value='${...}'
content = re.sub(r'value="(\$\{[^}]+\})"', r"value='\1'", content)

# Replace all id="${...}" with id='${...}'
content = re.sub(r'id="(\$\{[^}]+\})"', r"id='\1'", content)

# Replace placeholder="${...}" with placeholder='${...}'
content = re.sub(r'placeholder="(\$\{[^}]+\})"', r"placeholder='\1'", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Replaced all double quotes around ${} with single quotes")
