#!/usr/bin/env python3
"""
Script para crear PDF del catálogo desde imágenes PNG
"""

import os
from PIL import Image
from pathlib import Path

def create_catalog_pdf():
    print("📚 Creando PDF del catálogo...")
    
    # Directorio con las imágenes
    catalog_dir = Path("catalogo-noviembre")
    
    # Obtener todas las imágenes PNG y ordenarlas numéricamente
    images = []
    for file in catalog_dir.glob("*.png"):
        try:
            num = int(file.stem)
            images.append((num, file))
        except ValueError:
            print(f"⚠️  Saltando archivo: {file.name}")
    
    # Ordenar por número
    images.sort(key=lambda x: x[0])
    print(f"✅ Encontradas {len(images)} páginas")
    
    # Convertir a PIL Images
    pil_images = []
    for i, (num, img_path) in enumerate(images, 1):
        print(f"📄 Procesando página {i}/{len(images)}: {img_path.name}")
        img = Image.open(img_path)
        
        # Convertir a RGB si es necesario
        if img.mode in ('RGBA', 'LA', 'P'):
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = rgb_img
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        pil_images.append(img)
    
    # Crear PDF
    output_path = Path("public/catalogo-cocolu-noviembre-2025.pdf")
    output_path.parent.mkdir(exist_ok=True)
    
    print(f"\n💾 Guardando PDF: {output_path}")
    
    if pil_images:
        pil_images[0].save(
            output_path,
            save_all=True,
            append_images=pil_images[1:],
            resolution=100.0,
            quality=85,
            optimize=True
        )
        
        # Obtener tamaño del archivo
        size_mb = output_path.stat().st_size / (1024 * 1024)
        print(f"\n✅ PDF creado exitosamente!")
        print(f"📊 Tamaño: {size_mb:.2f} MB")
        print(f"📄 Páginas: {len(pil_images)}")
        print(f"📁 Ubicación: {output_path}")
        
        if size_mb > 16:
            print(f"\n⚠️  ADVERTENCIA: El archivo es mayor a 16MB")
            print(f"   WhatsApp tiene límite de ~16MB para documentos")
            print(f"   Considera usar un enlace externo (Google Drive/Dropbox)")
    else:
        print("❌ No se encontraron imágenes para procesar")

if __name__ == "__main__":
    create_catalog_pdf()
