#!/usr/bin/env python3
"""
Test rápido de OCR - Procesa solo 5 páginas de ejemplo
Para verificar que todo funciona antes de la extracción completa
"""

import sys
import subprocess
from pathlib import Path

print("🧪 TEST RÁPIDO DE OCR")
print("=" * 60)
print()

# Verificar que tesseract está instalado
try:
    result = subprocess.run(['tesseract', '--version'], 
                          capture_output=True, text=True)
    version = result.stdout.split('\n')[0]
    print(f"✅ Tesseract instalado: {version}")
except:
    print("❌ ERROR: Tesseract no está instalado")
    print("   Instalar: sudo apt-get install tesseract-ocr tesseract-ocr-spa")
    sys.exit(1)

# Verificar que existen las imágenes
catalog_dir = Path("catalogo-noviembre")
if not catalog_dir.exists():
    print(f"❌ ERROR: No existe {catalog_dir}")
    sys.exit(1)

images = list(catalog_dir.glob("*.png"))
if len(images) == 0:
    print(f"❌ ERROR: No hay imágenes en {catalog_dir}")
    sys.exit(1)

print(f"✅ Encontradas {len(images)} imágenes en el catálogo")
print()

# Seleccionar 5 páginas de muestra
test_pages = [1, 25, 50, 75, 100]
print(f"🔍 Probando OCR en páginas: {test_pages}")
print()

success_count = 0
failed_count = 0

for page_num in test_pages:
    img_path = catalog_dir / f"{page_num}.png"
    
    if not img_path.exists():
        print(f"[{page_num}] ⚠️  Imagen no existe")
        continue
    
    print(f"[Página {page_num}] Analizando...")
    
    try:
        # OCR con Tesseract
        result = subprocess.run(
            ['tesseract', str(img_path), 'stdout', '-l', 'spa+eng',
             '--psm', '3', '--oem', '3'],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=15
        )
        
        if result.returncode == 0:
            text = result.stdout.strip()
            
            if text and len(text) > 10:
                # Mostrar primeras 3 líneas
                lines = [l for l in text.split('\n') if l.strip()][:3]
                print(f"   ✅ Texto extraído ({len(text)} caracteres):")
                for line in lines:
                    print(f"      {line[:60]}")
                
                # Buscar precio
                import re
                prices = re.findall(r'\$\s*(\d{1,3})', text)
                if prices:
                    print(f"   💵 Precio encontrado: ${prices[0]} USD")
                
                # Buscar keywords comunes
                keywords_found = []
                keywords = ['anillo', 'dije', 'pulsera', 'collar', 'oro', 'plata', 'acero']
                for kw in keywords:
                    if kw in text.lower():
                        keywords_found.append(kw)
                
                if keywords_found:
                    print(f"   🏷️  Keywords: {', '.join(keywords_found)}")
                
                success_count += 1
            else:
                print(f"   ⚠️  Sin texto detectado (posible imagen sin texto)")
                failed_count += 1
        else:
            print(f"   ❌ Error en OCR")
            failed_count += 1
            
    except subprocess.TimeoutExpired:
        print(f"   ⏱️  Timeout (15s)")
        failed_count += 1
    except Exception as e:
        print(f"   ❌ Error: {e}")
        failed_count += 1
    
    print()

print("=" * 60)
print(f"📊 RESULTADOS DEL TEST:")
print(f"   ✅ Exitosos: {success_count}/{len(test_pages)}")
print(f"   ❌ Fallidos: {failed_count}/{len(test_pages)}")
print()

if success_count >= 3:
    print("🎉 ¡OCR funcionando correctamente!")
    print()
    print("🚀 LISTO PARA EJECUTAR EXTRACCIÓN COMPLETA:")
    print("   python3 extraer-catalogo.py")
else:
    print("⚠️  OCR tiene problemas. Verifica:")
    print("   1. Las imágenes tienen texto visible")
    print("   2. Tesseract está instalado correctamente")
    print("   3. Los idiomas spa+eng están disponibles")

print()
