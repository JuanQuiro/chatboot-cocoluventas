#!/usr/bin/env python3
import re

file_path = 'production/src/api/meta-setup-routes.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the large template string in res.send and escape all ${} inside it
# Split at res.send(`
parts = content.split('res.send(`', 1)
if len(parts) == 2:
    before_template = parts[0] + 'res.send(`'
    after_template_start = parts[1]
    
    # Find the closing backtick followed by );
    template_parts = after_template_start.split('`);', 1)
    if len(template_parts) == 2:
        template_content = template_parts[0]
        after_template = '`);' + template_parts[1]
        
        # Escape all ${...} in the template content
        escaped_template = re.sub(r'\$\{', r'\$\{', template_content)
        
        # Put it all back together
        new_content = before_template + escaped_template + after_template
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(' Template literals escaped successfully')
    else:
        print('Error: Could not find template end')
else:
    print('Error: Could not find template start')
