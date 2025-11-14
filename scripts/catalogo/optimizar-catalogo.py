#!/usr/bin/env python3
"""
Script para optimizar PDF del catálogo para WhatsApp (<16MB)
Procesa imágenes de forma controlada sin trabar la PC
"""

import os
import gc
from PIL import Image
from pathlib import Path

def optimize_catalog_pdf():
    print("📚 Optimizando catálogo para WhatsApp (proceso lento y seguro)...")
    print("⏳ Esto tomará unos minutos para no trabar la PC...\n")
    
    catalog_dir = Path("catalogo-noviembre")
    
    # Obtener todas las imágenes PNG y ordenarlas
    images = []
    for file in catalog_dir.glob("*.png"):
        try:
            num = int(file.stem)
            images.append((num, file))
        except ValueError:
            continue
    
    images.sort(key=lambda x: x[0])
    print(f"✅ Encontradas {len(images)} páginas")
    print(f"🎯 Meta: PDF menor a 16MB para WhatsApp\n")
    
    # Procesar imágenes en lotes pequeños para no consumir mucha RAM
    BATCH_SIZE = 10
    all_processed = []
    
    for batch_num in range(0, len(images), BATCH_SIZE):
        batch = images[batch_num:batch_num + BATCH_SIZE]
        batch_images = []
        
        for i, (num, img_path) in enumerate(batch, 1):
            global_idx = batch_num + i
            print(f"📄 [{global_idx}/{len(images)}] Optimizando: {img_path.name}")
            
            # Abrir imagen
            img = Image.open(img_path)
            
            # Redimensionar si es muy grande (máximo 1200px de ancho)
            max_width = 1200
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Convertir a RGB
            if img.mode in ('RGBA', 'LA', 'P'):
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = rgb_img
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            batch_images.append(img)
        
        all_processed.extend(batch_images)
        
        # Liberar memoria después de cada lote
        gc.collect()
        print(f"✅ Lote {batch_num//BATCH_SIZE + 1}/{(len(images)-1)//BATCH_SIZE + 1} completado\n")
    
    # Crear PDF optimizado
    output_path = Path("public/catalogo-cocolu-noviembre-2025-optimizado.pdf")
    output_path.parent.mkdir(exist_ok=True)
    
    print(f"💾 Creando PDF optimizado...")
    
    if all_processed:
        # Usar calidad menor para reducir tamaño
        all_processed[0].save(
            output_path,
            save_all=True,
            append_images=all_processed[1:],
            resolution=72.0,  # Menor resolución
            quality=70,       # Calidad reducida pero aceptable
            optimize=True
        )
        
        # Obtener tamaño del archivo
        size_mb = output_path.stat().st_size / (1024 * 1024)
        print(f"\n✅ PDF optimizado creado!")
        print(f"📊 Tamaño: {size_mb:.2f} MB")
        print(f"📄 Páginas: {len(all_processed)}")
        print(f"📁 Ubicación: {output_path}")
        
        if size_mb <= 16:
            print(f"\n🎉 ¡PERFECTO! El archivo cabe en WhatsApp")
        else:
            print(f"\n⚠️  Aún es mayor a 16MB")
            print(f"   Diferencia: {size_mb - 16:.2f} MB de exceso")
            print(f"   Sugerencia: Usar Google Drive o Dropbox")
    
    # Limpiar memoria
    all_processed.clear()
    gc.collect()
    
    print("\n✅ Proceso completado sin problemas")

if __name__ == "__main__":
    optimize_catalog_pdf()
