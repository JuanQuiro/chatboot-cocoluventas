import os

crear_venta_path = r'dashboard\src\pages\CrearVenta.css'
app_css_path = r'dashboard\src\App.css'

def add_important(css_content):
    # Brutal approach: add !important to every declaration that ends with ;
    # unless it already has it.
    lines = css_content.split('\n')
    new_lines = []
    for line in lines:
        stripped = line.strip()
        if ':' in stripped and stripped.endswith(';') and '!important' not in stripped:
             # It's a declaration. Replace ; with !important;
             new_lines.append(line.replace(';', ' !important;'))
        else:
             new_lines.append(line)
    return '\n'.join(new_lines)

try:
    with open(crear_venta_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Ensure !important is everywhere (double check)
    if '!important' not in content:
        print("Adding !important flags programmatically...")
        content = add_important(content)
    else:
        print("Content already has !important flags.")

    with open(app_css_path, 'a', encoding='utf-8') as f:
        f.write('\n\n/* FORCED APPEND OF CREAR VENTA CSS */\n')
        f.write(content)
    
    print(f"Successfully appended {len(content)} bytes to {app_css_path}")

except Exception as e:
    print(f"Error: {e}")
