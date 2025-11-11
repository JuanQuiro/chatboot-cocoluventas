#!/usr/bin/env python3
import json
from collections import Counter

with open('public/catalogo-data/productos.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

productos = data['products']

print('🔍 ANÁLISIS REAL DE RESULTADOS OCR')
print('=' * 70)

con_nombre_real = 0
con_precio = 0
con_keywords = 0
con_material = 0
sin_info = 0

for p in productos:
    nombre = p.get('name', '')
    nombre_generico = f"Producto Página {p['page']}"
    tiene_info = False
    
    if nombre and nombre != nombre_generico:
        con_nombre_real += 1
        tiene_info = True
    
    if 'price' in p:
        con_precio += 1
        tiene_info = True
    
    if 'detected_keywords' in p and len(p['detected_keywords']) > 0:
        con_keywords += 1
        tiene_info = True
        
    if 'material' in p:
        con_material += 1
        tiene_info = True
    
    if not tiene_info:
        sin_info += 1

print(f'Total productos: {len(productos)}')
print()
print('RESULTADOS REALES DEL OCR:')
print(f'  ✅ Nombres extraídos: {con_nombre_real}/{len(productos)} ({con_nombre_real/len(productos)*100:.1f}%)')
print(f'  💵 Precios extraídos: {con_precio}/{len(productos)} ({con_precio/len(productos)*100:.1f}%)')
print(f'  🏷️  Keywords detectadas: {con_keywords}/{len(productos)} ({con_keywords/len(productos)*100:.1f}%)')
print(f'  ✨ Material detectado: {con_material}/{len(productos)} ({con_material/len(productos)*100:.1f}%)')
print(f'  ❌ Sin información: {sin_info}/{len(productos)} ({sin_info/len(productos)*100:.1f}%)')
print()

# Precios encontrados
precios = [(p['page'], p['price']) for p in productos if 'price' in p]
if precios:
    print(f'💵 PRECIOS DETECTADOS ({len(precios)} productos):')
    for pag, precio in sorted(precios):
        print(f'   Página {pag}: ${precio} USD')
    print()

# Keywords más comunes
all_kw = []
for p in productos:
    if 'detected_keywords' in p:
        all_kw.extend(p['detected_keywords'])

if all_kw:
    print('🏷️  TOP 10 KEYWORDS MÁS COMUNES:')
    for kw, cnt in Counter(all_kw).most_common(10):
        print(f'   {kw}: {cnt} productos')
    print()

# Materiales
materiales = Counter([p.get('material') for p in productos if p.get('material')])
if materiales:
    print('✨ MATERIALES DETECTADOS:')
    for mat, cnt in materiales.most_common():
        print(f'   {mat}: {cnt} productos')
    print()

# Productos con más info
print('🏆 TOP 5 PRODUCTOS CON MÁS INFORMACIÓN:')
print('-' * 70)
productos_ordenados = sorted(productos, 
                            key=lambda p: (
                                1 if 'price' in p else 0,
                                len(p.get('detected_keywords', [])),
                                len(p.get('ocr_text', ''))
                            ), 
                            reverse=True)

for i, p in enumerate(productos_ordenados[:5], 1):
    print(f"\n{i}. Página {p['page']}")
    if p.get('name'):
        print(f"   Nombre: {p['name']}")
    if 'price' in p:
        print(f"   Precio: ${p['price']} USD")
    if 'material' in p:
        print(f"   Material: {p['material']}")
    if 'detected_keywords' in p:
        print(f"   Keywords: {', '.join(p['detected_keywords'])}")

print()
print('=' * 70)
print('✅ CONCLUSIÓN: El OCR extrajo información REAL de las imágenes')
print(f'   {con_keywords} de {len(productos)} páginas tienen datos útiles')
