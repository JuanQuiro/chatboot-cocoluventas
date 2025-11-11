#!/usr/bin/env python3
"""
Sistema de Extracción Inteligente de Catálogo
Analiza imágenes y crea base de datos de productos
"""

import os
import json
import re
from pathlib import Path
from PIL import Image
import subprocess

class CatalogoExtractor:
    def __init__(self):
        self.catalog_dir = Path("catalogo-noviembre")
        self.output_dir = Path("public/catalogo-data")
        self.output_dir.mkdir(exist_ok=True)
        
        self.products = []
        self.categories = {}
        
    def extract_all(self):
        """Extrae información de todas las imágenes"""
        print("🔍 EXTRACCIÓN INTELIGENTE DEL CATÁLOGO")
        print("=" * 50)
        print()
        
        # Obtener todas las imágenes
        images = sorted([f for f in self.catalog_dir.glob("*.png")], 
                       key=lambda x: int(x.stem))
        
        print(f"📄 Total de páginas: {len(images)}")
        print()
        
        # Analizar cada imagen
        for i, img_path in enumerate(images, 1):
            print(f"[{i}/{len(images)}] Analizando: {img_path.name}")
            
            product_data = self.analyze_image(img_path, i)
            if product_data:
                self.products.append(product_data)
                
                # Guardar imagen individual para el producto
                self.save_product_image(img_path, i)
        
        # Guardar base de datos
        self.save_database()
        
        print()
        print("=" * 50)
        print(f"✅ Extracción completada!")
        print(f"📊 Productos encontrados: {len(self.products)}")
        
    def analyze_image(self, img_path, page_num):
        """Analiza una imagen y extrae información del producto"""
        
        try:
            img = Image.open(img_path)
            
            # Crear registro del producto
            product = {
                'id': f'prod_{page_num:03d}',
                'page': page_num,
                'image_path': f'catalogo-data/images/page_{page_num:03d}.png',
                'name': f'Producto Página {page_num}',
                'description': f'Producto del catálogo - Página {page_num}',
                'keywords': [f'pag{page_num}', f'pagina{page_num}'],
                'available': True,
                'dimensions': {
                    'width': img.width,
                    'height': img.height
                }
            }
            
            # Intentar extraer texto con tesseract si está disponible
            try:
                result = subprocess.run(
                    ['tesseract', str(img_path), 'stdout', '-l', 'spa'],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                if result.returncode == 0 and result.stdout.strip():
                    text = result.stdout.strip()
                    
                    # Extraer información del texto
                    extracted = self.extract_info_from_text(text)
                    if extracted:
                        product.update(extracted)
                    
                    # Guardar texto extraído
                    product['extracted_text'] = text[:500]  # Primeros 500 chars
                    
            except (subprocess.TimeoutExpired, FileNotFoundError):
                # Tesseract no disponible o timeout
                pass
            
            return product
            
        except Exception as e:
            print(f"   ⚠️ Error: {e}")
            return None
    
    def extract_info_from_text(self, text):
        """Extrae información estructurada del texto OCR"""
        info = {}
        
        # Buscar precios ($XX.XXX o $XXX.XXX)
        price_pattern = r'\$\s*(\d{1,3}(?:[.,]\d{3})*)'
        prices = re.findall(price_pattern, text)
        if prices:
            # Limpiar y convertir el primer precio encontrado
            price_str = prices[0].replace('.', '').replace(',', '')
            try:
                info['price'] = int(price_str)
                info['price_text'] = f'${prices[0]}'
            except:
                pass
        
        # Buscar palabras clave de productos comunes
        keywords = []
        product_words = [
            'relicario', 'dije', 'cadena', 'pulsera', 'anillo', 'collar',
            'aretes', 'brazalete', 'gargantilla', 'pendiente', 'sortija',
            'oro', 'plata', 'acero', 'cristal', 'perla', 'diamante'
        ]
        
        text_lower = text.lower()
        for word in product_words:
            if word in text_lower:
                keywords.append(word)
        
        if keywords:
            info['detected_keywords'] = keywords
            # Usar la primera keyword como nombre tentativo
            info['name'] = keywords[0].title()
        
        # Detectar si menciona "oro" o "plata"
        if 'oro' in text_lower:
            info['material'] = 'oro'
        elif 'plata' in text_lower:
            info['material'] = 'plata'
        elif 'acero' in text_lower:
            info['material'] = 'acero'
        
        return info if info else None
    
    def save_product_image(self, img_path, page_num):
        """Guarda copia de la imagen del producto"""
        output_images = self.output_dir / "images"
        output_images.mkdir(exist_ok=True)
        
        # Copiar imagen
        img = Image.open(img_path)
        output_path = output_images / f"page_{page_num:03d}.png"
        
        # Redimensionar si es muy grande (máx 800px ancho)
        max_width = 800
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        img.save(output_path, optimize=True, quality=85)
    
    def save_database(self):
        """Guarda la base de datos de productos"""
        
        # Guardar JSON completo
        db_path = self.output_dir / "productos.json"
        with open(db_path, 'w', encoding='utf-8') as f:
            json.dump({
                'total_products': len(self.products),
                'generated_at': '2025-11-11',
                'catalog_version': 'noviembre-2025',
                'products': self.products
            }, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 Base de datos guardada: {db_path}")
        
        # Crear índice de búsqueda
        self.create_search_index()
        
        # Crear archivo JavaScript para el bot
        self.create_js_database()
    
    def create_search_index(self):
        """Crea índice de búsqueda optimizado"""
        index = {}
        
        for product in self.products:
            # Indexar por página
            page_key = f"pag{product['page']}"
            index[page_key] = product['id']
            
            # Indexar por keywords detectadas
            if 'detected_keywords' in product:
                for keyword in product['detected_keywords']:
                    if keyword not in index:
                        index[keyword] = []
                    index[keyword].append(product['id'])
        
        # Guardar índice
        index_path = self.output_dir / "search_index.json"
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(index, f, ensure_ascii=False, indent=2)
        
        print(f"🔍 Índice de búsqueda: {index_path}")
    
    def create_js_database(self):
        """Crea archivo JavaScript para integrar con el bot"""
        
        js_content = f"""/**
 * Base de Datos de Productos - Catálogo Noviembre 2025
 * Generado automáticamente desde las imágenes del catálogo
 * Total de productos: {len(self.products)}
 */

export const catalogoProductos = {{
    version: 'noviembre-2025',
    totalProductos: {len(self.products)},
    generadoEn: '2025-11-11',
    
    productos: [
"""
        
        for i, product in enumerate(self.products):
            js_content += "        {\n"
            js_content += f"            id: '{product['id']}',\n"
            js_content += f"            pagina: {product['page']},\n"
            js_content += f"            nombre: '{product.get('name', 'Producto')}',\n"
            js_content += f"            descripcion: '{product.get('description', '')}',\n"
            
            if 'price' in product:
                js_content += f"            precio: {product['price']},\n"
                js_content += f"            precioTexto: '{product['price_text']}',\n"
            
            if 'material' in product:
                js_content += f"            material: '{product['material']}',\n"
            
            js_content += f"            imagenPath: '{product['image_path']}',\n"
            
            keywords = product.get('detected_keywords', product['keywords'])
            js_content += f"            keywords: {json.dumps(keywords)},\n"
            
            js_content += f"            disponible: true\n"
            js_content += "        }" + ("," if i < len(self.products) - 1 else "") + "\n"
        
        js_content += """    ],
    
    /**
     * Buscar producto por página
     */
    buscarPorPagina(pagina) {
        return this.productos.find(p => p.pagina === parseInt(pagina));
    },
    
    /**
     * Buscar productos por keyword
     */
    buscarPorKeyword(keyword) {
        const term = keyword.toLowerCase();
        return this.productos.filter(p => 
            p.keywords.some(k => k.toLowerCase().includes(term)) ||
            p.nombre.toLowerCase().includes(term)
        );
    },
    
    /**
     * Obtener producto por ID
     */
    obtenerProducto(id) {
        return this.productos.find(p => p.id === id);
    }
};

export default catalogoProductos;
"""
        
        # Guardar archivo JS
        js_path = self.output_dir / "catalogo-productos.js"
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        print(f"📦 Base de datos JavaScript: {js_path}")
        print(f"   → Importar en el bot: import catalogoProductos from './catalogo-productos.js'")

def main():
    extractor = CatalogoExtractor()
    extractor.extract_all()
    
    print()
    print("🎯 PRÓXIMOS PASOS:")
    print("1. Revisar: public/catalogo-data/productos.json")
    print("2. Importar en bot: public/catalogo-data/catalogo-productos.js")
    print("3. Actualizar flujos para usar la base de datos")
    print()
    print("💡 TIP: Si tesseract está instalado, el script extraerá texto automáticamente")
    print("   Instalar: sudo apt-get install tesseract-ocr tesseract-ocr-spa")

if __name__ == "__main__":
    main()
