#!/usr/bin/env python3
"""
Genera descripciones profesionales para cada producto
Basado en la información real extraída del OCR
"""

import json

# Templates de descripciones por tipo de producto
DESCRIPCIONES = {
    'anillo': {
        'oro': 'Elegante anillo en oro que combina estilo y distinción. Perfecto para cualquier ocasión.',
        'plata': 'Fino anillo en plata de alta calidad. Diseño versátil y duradero.',
        'acero': 'Moderno anillo en acero quirúrgico. Resistente y elegante.',
        'default': 'Hermoso anillo de diseño único que realzará tu estilo personal.'
    },
    'anillo_graduacion': {
        'oro': 'Anillo de graduación en oro, símbolo de tu logro académico. Personalizable con tu nombre y fecha.',
        'plata': 'Anillo conmemorativo de graduación en plata. Incluye personalización.',
        'acero': 'Anillo de graduación en acero quirúrgico con baño de oro. Personalizable.',
        'default': 'Anillo de graduación personalizable. Celebra tu éxito con estilo.'
    },
    'pulsera': {
        'oro': 'Elegante pulsera en oro que combina tradición y modernidad. Ideal para regalar.',
        'plata': 'Delicada pulsera en plata. Diseño atemporal y sofisticado.',
        'acero': 'Pulsera moderna en acero de alta calidad. Resistente al agua.',
        'default': 'Hermosa pulsera que complementa cualquier look con elegancia.'
    },
    'dije': {
        'oro': 'Precioso dije en oro, perfecto para personalizar tu cadena favorita.',
        'plata': 'Dije en plata con acabado impecable. Ideal para ocasiones especiales.',
        'default': 'Dije de diseño único que expresa tu personalidad.'
    },
    'relicario': {
        'oro': 'Relicario en oro para guardar tus recuerdos más preciados. Diseño clásico.',
        'plata': 'Elegante relicario en plata. Espacio para fotografías.',
        'default': 'Relicario especial para conservar momentos inolvidables.'
    },
    'collar': {
        'oro': 'Collar en oro de diseño exclusivo. Elegancia que perdura.',
        'plata': 'Collar en plata fina. Complemento perfecto para cualquier ocasión.',
        'default': 'Hermoso collar que realza tu belleza natural.'
    },
    'aretes': {
        'oro': 'Aretes en oro que aportan brillo y distinción a tu rostro.',
        'plata': 'Aretes en plata con acabado brillante. Diseño versátil.',
        'default': 'Aretes elegantes que complementan tu estilo único.'
    },
    'grabado': {
        'default': 'Servicio de grabado personalizado. Convierte tus joyas en piezas únicas con tu mensaje especial.'
    },
    'default': {
        'oro': 'Joya en oro de alta calidad. Elegancia y distinción en cada detalle.',
        'plata': 'Pieza en plata fina con acabado profesional. Diseño atemporal.',
        'acero': 'Joya moderna en acero quirúrgico. Calidad y durabilidad garantizadas.',
        'default': 'Hermosa joya que refleja tu estilo personal. Calidad garantizada.'
    }
}

def generar_descripcion(producto):
    """Genera descripción profesional basada en keywords detectadas"""
    
    keywords = producto.get('detected_keywords', [])
    material = producto.get('material', '')
    precio = producto.get('price')
    
    # Determinar tipo de producto
    tipo = None
    if 'anillo' in keywords:
        if 'graduacion' in keywords:
            tipo = 'anillo_graduacion'
        else:
            tipo = 'anillo'
    elif 'pulsera' in keywords:
        tipo = 'pulsera'
    elif 'dije' in keywords:
        tipo = 'dije'
    elif 'relicario' in keywords:
        tipo = 'relicario'
    elif 'collar' in keywords:
        tipo = 'collar'
    elif 'aretes' in keywords:
        tipo = 'aretes'
    elif 'grabado' in keywords:
        tipo = 'grabado'
    else:
        tipo = 'default'
    
    # Determinar material principal
    mat = None
    if 'oro' in keywords or 'oro' in material:
        mat = 'oro'
    elif 'plata' in keywords or 'plata' in material:
        mat = 'plata'
    elif 'acero' in keywords or 'acero' in material:
        mat = 'acero'
    else:
        mat = 'default'
    
    # Obtener descripción base
    desc_templates = DESCRIPCIONES.get(tipo, DESCRIPCIONES['default'])
    descripcion = desc_templates.get(mat, desc_templates.get('default', ''))
    
    # Agregar características especiales
    detalles = []
    
    if 'corazon' in keywords:
        detalles.append('Diseño de corazón.')
    if 'cruz' in keywords:
        detalles.append('Con cruz.')
    if 'infinito' in keywords:
        detalles.append('Símbolo de infinito.')
    if 'estrella' in keywords:
        detalles.append('Detalle de estrella.')
    if 'flor' in keywords:
        detalles.append('Motivo floral.')
    if 'cristal' in keywords:
        detalles.append('Con cristales.')
    if 'perla' in keywords:
        detalles.append('Con perlas.')
    if 'personalizado' in keywords or 'grabado' in keywords:
        detalles.append('Personalizable.')
    
    if detalles:
        descripcion += ' ' + ' '.join(detalles)
    
    # Agregar información de precio
    if precio:
        descripcion += f' Precio: ${precio} USD.'
    else:
        descripcion += ' Consulta disponibilidad y precio.'
    
    return descripcion.strip()

def mejorar_nombre(producto):
    """Mejora el nombre del producto si es muy genérico"""
    nombre = producto.get('name', '')
    keywords = producto.get('detected_keywords', [])
    
    # Si el nombre ya es bueno, dejarlo
    if nombre and nombre != f"Producto Página {producto['page']}":
        if len(nombre.split()) >= 2:  # Nombre con al menos 2 palabras
            return nombre
    
    # Generar nombre mejorado
    if not keywords:
        return f"Joya Catálogo Página {producto['page']}"
    
    # Usar keywords para crear nombre
    if 'anillo' in keywords:
        if 'graduacion' in keywords:
            if 'oro' in keywords:
                return 'Anillo de Graduación en Oro'
            elif 'plata' in keywords:
                return 'Anillo de Graduación en Plata'
            else:
                return 'Anillo de Graduación'
        elif 'corazon' in keywords:
            return 'Anillo Corazón'
        elif 'oro' in keywords:
            return 'Anillo en Oro'
        elif 'plata' in keywords:
            return 'Anillo en Plata'
        else:
            return 'Anillo'
    
    elif 'pulsera' in keywords:
        if 'oro' in keywords:
            return 'Pulsera en Oro'
        elif 'plata' in keywords:
            return 'Pulsera en Plata'
        else:
            return 'Pulsera'
    
    elif 'relicario' in keywords:
        if 'corazon' in keywords:
            return 'Relicario Corazón'
        else:
            return 'Relicario'
    
    elif 'dije' in keywords:
        return 'Dije'
    
    elif 'collar' in keywords:
        return 'Collar'
    
    elif 'grabado' in keywords:
        return 'Servicio de Grabado'
    
    return nombre if nombre else f"Joya Página {producto['page']}"

def main():
    print("🎨 GENERANDO DESCRIPCIONES PROFESIONALES")
    print("=" * 60)
    
    # Cargar catálogo
    with open('public/catalogo-data/productos.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    productos = data['products']
    mejorados = 0
    
    for producto in productos:
        # Generar descripción
        desc_original = producto.get('description', '')
        desc_nueva = generar_descripcion(producto)
        
        # Mejorar nombre si es necesario
        nombre_original = producto.get('name', '')
        nombre_nuevo = mejorar_nombre(producto)
        
        # Actualizar
        producto['description'] = desc_nueva
        producto['name'] = nombre_nuevo
        
        # Agregar copy marketing
        producto['copy'] = desc_nueva
        
        if nombre_nuevo != nombre_original or desc_nueva != desc_original:
            mejorados += 1
    
    # Guardar catálogo mejorado
    with open('public/catalogo-data/productos.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ {mejorados} productos mejorados")
    print(f"📊 Total productos: {len(productos)}")
    print()
    
    # Mostrar ejemplos
    print("📝 EJEMPLOS DE DESCRIPCIONES GENERADAS:")
    print("-" * 60)
    
    ejemplos = [p for p in productos if 'detected_keywords' in p][:5]
    for i, p in enumerate(ejemplos, 1):
        print(f"\n{i}. Página {p['page']}")
        print(f"   📛 {p['name']}")
        print(f"   📝 {p['description']}")
    
    print()
    print("=" * 60)
    print("✅ ¡Catálogo mejorado y guardado!")

if __name__ == '__main__':
    main()
