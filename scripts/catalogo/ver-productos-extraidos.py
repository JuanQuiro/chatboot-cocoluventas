#!/usr/bin/env python3
"""
Visualizar productos extraídos del catálogo
Muestra los productos con más información detectada
"""

import json
from pathlib import Path

catalog_file = Path("public/catalogo-data/productos.json")

if not catalog_file.exists():
    print("❌ Aún no se ha ejecutado la extracción")
    print("   Ejecuta: python3 extraer-catalogo.py")
    exit(1)

with open(catalog_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

productos = data.get('products', [])

print("📊 ESTADÍSTICAS DEL CATÁLOGO EXTRAÍDO")
print("=" * 70)
print(f"Total productos: {len(productos)}")
print()

# Estadísticas
con_precio = sum(1 for p in productos if 'price' in p)
con_keywords = sum(1 for p in productos if 'detected_keywords' in p and len(p['detected_keywords']) > 0)
con_material = sum(1 for p in productos if 'material' in p)
con_ocr = sum(1 for p in productos if p.get('ocr_text') and len(p['ocr_text']) > 10)
consultar = sum(1 for p in productos if p.get('price_status') == 'consultar')

print("📈 CALIDAD DE EXTRACCIÓN:")
print(f"   Con precio: {con_precio}/{len(productos)} ({con_precio/len(productos)*100:.1f}%)")
print(f"   Con keywords: {con_keywords}/{len(productos)} ({con_keywords/len(productos)*100:.1f}%)")
print(f"   Con material: {con_material}/{len(productos)} ({con_material/len(productos)*100:.1f}%)")
print(f"   Con texto OCR: {con_ocr}/{len(productos)} ({con_ocr/len(productos)*100:.1f}%)")
print(f"   Precio 'consultar': {consultar}")
print()

# Top productos con más información
productos_ordenados = sorted(productos, 
                            key=lambda p: (
                                1 if 'price' in p else 0,
                                len(p.get('detected_keywords', [])),
                                len(p.get('ocr_text', ''))
                            ), 
                            reverse=True)

print("🏆 TOP 10 PRODUCTOS CON MÁS INFORMACIÓN:")
print("-" * 70)

for i, p in enumerate(productos_ordenados[:10], 1):
    print(f"\n{i}. 📄 Página {p['page']}")
    
    if p.get('name') and p['name'] != f"Producto Página {p['page']}":
        print(f"   💎 {p['name']}")
    
    if 'price' in p:
        print(f"   💵 {p.get('price_text', f'${p[\"price\"]} USD')}")
    elif p.get('price_status') == 'consultar':
        print(f"   💬 Precio: Consultar")
    
    if 'material' in p:
        print(f"   ✨ {p['material'].replace('_', ' ').upper()}")
    
    if 'detected_keywords' in p and len(p['detected_keywords']) > 0:
        keywords_str = ', '.join(p['detected_keywords'][:5])
        print(f"   🏷️  {keywords_str}")
    
    if 'category' in p:
        print(f"   📦 Categoría: {p['category']}")
    
    if 'ocr_text' in p and p['ocr_text']:
        texto = p['ocr_text'][:100].replace('\n', ' ')
        print(f"   📝 OCR: {texto}...")

print()
print("=" * 70)

# Productos sin información
sin_info = [p for p in productos if not p.get('detected_keywords') and not p.get('price')]
if sin_info:
    print(f"\n⚠️  {len(sin_info)} productos sin información extraída")
    print("    (Pueden ser páginas sin texto o con formato difícil de leer)")
    
print()
print("✅ Para ver el catálogo completo:")
print("   cat public/catalogo-data/productos.json | jq '.products[0:5]'")
print()
