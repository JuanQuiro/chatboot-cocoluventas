import glob

files = glob.glob(r'dashboard\build\static\css\main.*.css')
if not files:
    print("❌ No main css found")
else:
    path = files[0]
    print(f"Checking {path}...")
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'crear-venta-page' in content:
        print("✅ crear-venta-page FOUND")
    else:
        print("❌ crear-venta-page NOT FOUND")
        
    if '!important' in content:
        print(f"✅ !important FOUND ({content.count('!important')} times)")
    else:
        print("❌ !important NOT FOUND")
