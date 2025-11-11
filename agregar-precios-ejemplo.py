#!/usr/bin/env python3
"""
Script para agregar precios y datos de ejemplo al catálogo
Simula lo que haría OCR automático
"""

import json
import random
from pathlib import Path

# Rangos de precios típicos para joyería
PRECIOS = {
    'bajo': list(range(25000, 50000, 5000)),      # $25K - $50K
    'medio': list(range(50000, 100000, 10000)),   # $50K - $100K
    'alto': list(range(100000, 200000, 20000)),   # $100K - $200K
    'premium': list(range(200000, 500000, 50000)) # $200K - $500K
}

# Keywords comunes en joyería
KEYWORDS = [
    'relicario', 'dije', 'cadena', 'pulsera', 'anillo', 'collar',
    'aretes', 'brazalete', 'gargantilla', 'pendiente', 'sortija',
    'oro', 'plata', 'acero', 'cristal', 'perla', 'diamante',
    'corazon', 'cruz', 'flor', 'estrella', 'luna'
]

MATERIALES = ['oro', 'plata', 'acero', 'oro_blanco', 'oro_rosa']
CATEGORIAS = ['anillos', 'collares', 'pulseras', 'aretes', 'dijes', 'sets']

def agregar_datos():
    print("📝 Agregando datos de ejemplo al catálogo...")
    print("=" * 60)
    
    # Cargar catálogo
    catalog_path = Path("public/catalogo-data/productos.json")
    with open(catalog_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    productos = data['products']
    
    # Agregar datos a cada producto
    for i, producto in enumerate(productos, 1):
        # Determinar rango de precio según página
        if i <= 34:  # Primeras 25% páginas - productos económicos
            rango = 'bajo'
        elif i <= 68:  # Siguientes 25% - precio medio
            rango = 'medio'
        elif i <= 102:  # Siguientes 25% - precio alto
            rango = 'alto'
        else:  # Últimas 25% - premium
            rango = 'premium'
        
        # Asignar precio
        precio = random.choice(PRECIOS[rango])
        producto['price'] = precio
        producto['price_text'] = f"${precio:,}".replace(',', '.')
        producto['price_range'] = rango
        
        # Asignar material
        material = random.choice(MATERIALES)
        producto['material'] = material
        
        # Asignar categoría
        categoria = random.choice(CATEGORIAS)
        producto['category'] = categoria
        
        # Asignar keywords detectadas (2-4 keywords por producto)
        num_keywords = random.randint(2, 4)
        detected = random.sample(KEYWORDS, num_keywords)
        producto['detected_keywords'] = detected
        
        # Actualizar nombre si tiene keywords relevantes
        if detected[0] in ['relicario', 'dije', 'anillo', 'pulsera', 'collar']:
            producto['name'] = f"{detected[0].title()} de {material.replace('_', ' ').title()}"
        else:
            producto['name'] = f"{categoria.title()[:-1]} {detected[0].title()}"
        
        # Actualizar descripción
        producto['description'] = (
            f"{producto['name']} - "
            f"Material: {material.replace('_', ' ').title()} - "
            f"Precio: {producto['price_text']}"
        )
        
        if i % 20 == 0:
            print(f"✅ Procesados {i}/{len(productos)} productos...")
    
    # Guardar
    with open(catalog_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Datos agregados exitosamente!")
    print(f"📊 Total productos: {len(productos)}")
    
    # Estadísticas
    print("\n📊 ESTADÍSTICAS:")
    print(f"   • Bajo ($25K-$50K): {sum(1 for p in productos if p['price_range'] == 'bajo')}")
    print(f"   • Medio ($50K-$100K): {sum(1 for p in productos if p['price_range'] == 'medio')}")
    print(f"   • Alto ($100K-$200K): {sum(1 for p in productos if p['price_range'] == 'alto')}")
    print(f"   • Premium ($200K+): {sum(1 for p in productos if p['price_range'] == 'premium')}")
    print()
    print(f"   • Oro: {sum(1 for p in productos if 'oro' in p['material'])}")
    print(f"   • Plata: {sum(1 for p in productos if p['material'] == 'plata')}")
    print(f"   • Acero: {sum(1 for p in productos if p['material'] == 'acero')}")
    
    # Ejemplos
    print("\n📋 EJEMPLOS DE PRODUCTOS:")
    for producto in random.sample(productos, 3):
        print(f"\n   Página {producto['page']}:")
        print(f"   • {producto['name']}")
        print(f"   • {producto['price_text']}")
        print(f"   • Keywords: {', '.join(producto['detected_keywords'][:3])}")

if __name__ == "__main__":
    agregar_datos()
