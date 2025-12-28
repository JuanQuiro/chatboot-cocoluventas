import glob

files = glob.glob(r'dashboard\build\static\css\main.*.css')
if not files:
    print("NO main css found")
else:
    path = files[0]
    print(f"Checking {path}...")
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'crear-venta-page' in content:
        print("YES - crear-venta-page FOUND")
    else:
        print("NO - crear-venta-page NOT FOUND")
        
    if '!important' in content:
        print(f"YES - !important FOUND ({content.count('!important')} times)")
    else:
        print("NO - !important NOT FOUND")
