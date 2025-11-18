#!/usr/bin/env python3
"""
Sistema de Extracción Inteligente de Catálogo
Analiza imágenes y crea base de datos de productos
"""

import os
import json
import re
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
import subprocess
import unicodedata

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
        
    def preprocess_image_for_ocr(self, img):
        """Preprocesar imagen para mejorar OCR"""
        # Convertir a escala de grises
        img = img.convert('L')
        
        # Aumentar contraste
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(2.0)
        
        # Aumentar nitidez
        img = img.filter(ImageFilter.SHARPEN)
        
        # Aumentar brillo ligeramente
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.2)
        
        return img
    
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
            
            # Intentar extraer texto con tesseract - VERSIÓN MEJORADA
            all_text = ""
            
            try:
                # MÉTODO 1: OCR sobre imagen original
                result1 = subprocess.run(
                    ['tesseract', str(img_path), 'stdout', '-l', 'spa+eng',
                     '--psm', '3', '--oem', '3'],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.DEVNULL,
                    text=True,
                    timeout=15
                )
                
                if result1.returncode == 0:
                    all_text = result1.stdout.strip()
                
                # MÉTODO 2: OCR con imagen preprocesada (mejor para texto pequeño)
                try:
                    img_processed = self.preprocess_image_for_ocr(img)
                    temp_path = f'/tmp/temp_ocr_{page_num}.png'
                    img_processed.save(temp_path)
                    
                    result2 = subprocess.run(
                        ['tesseract', temp_path, 'stdout', '-l', 'spa+eng',
                         '--psm', '6', '--oem', '3'],
                        stdout=subprocess.PIPE,
                        stderr=subprocess.DEVNULL,
                        text=True,
                        timeout=15
                    )
                    
                    if result2.returncode == 0:
                        text2 = result2.stdout.strip()
                        # Combinar ambos resultados
                        if len(text2) > len(all_text):
                            all_text = text2
                    
                    # Limpiar archivo temporal
                    os.remove(temp_path)
                except:
                    pass
                
                # Guardar texto extraído
                product['ocr_text'] = all_text if all_text else ""
                
                # Extraer información del texto
                if all_text and len(all_text) > 5:
                    extracted = self.extract_info_from_text(all_text)
                    if extracted:
                        product.update(extracted)
                        
                        # Mostrar qué se extrajo
                        info_parts = []
                        if extracted.get('name'):
                            info_parts.append(f"Nombre: {extracted['name']}")
                        if extracted.get('price'):
                            info_parts.append(f"${extracted['price']} USD")
                        if extracted.get('detected_keywords'):
                            info_parts.append(f"{len(extracted['detected_keywords'])} keywords")
                        
                        if info_parts:
                            print(f"   ✅ {' | '.join(info_parts)}")
                    
            except (subprocess.TimeoutExpired, FileNotFoundError) as e:
                product['ocr_text'] = ""
                print(f"   ⚠️ OCR error: {e}")
            
            return product
            
        except Exception as e:
            print(f"   ⚠️ Error: {e}")
            return None
    
    def normalize_text(self, text):
        """Normalizar texto para mejor procesamiento"""
        # Remover acentos y normalizar
        text = unicodedata.normalize('NFKD', text)
        text = text.encode('ASCII', 'ignore').decode('ASCII')
        return text.lower()
    
    def extract_info_from_text(self, text):
        """Extrae información estructurada del texto OCR - VERSIÓN MEJORADA"""
        info = {}
        text_normalized = self.normalize_text(text)
        
        # ========== EXTRACCIÓN DE PRECIOS ==========
        # Múltiples patrones para capturar precios en diferentes formatos
        price_patterns = [
            # Precio directo: $30, $100, $ 50
            (r'\$\s*(\d{1,3})(?!\d)', 1),
            # Con USD: 30 USD, $30 USD, 50 dolares
            (r'(\d{1,3})\s*(?:usd|dolares?)', 1),
            # Precio con "desde": desde $30, a partir de $50
            (r'(?:desde|a partir de|por)\s*\$?\s*(\d{1,3})', 1),
            # Precio individual: precio: $30, costo: $50
            (r'(?:precio|costo|valor)s?:?\s*\$?\s*(\d{1,3})', 1),
        ]
        
        found_prices = []
        for pattern, group in price_patterns:
            matches = re.findall(pattern, text_normalized, re.IGNORECASE)
            for match in matches:
                try:
                    price_val = int(match)
                    # Filtrar precios razonables (5-500 USD)
                    if 5 <= price_val <= 500:
                        found_prices.append(price_val)
                except:
                    pass
        
        # Usar el precio más frecuente o el primero encontrado
        if found_prices:
            # Si hay múltiples precios, usar el más común
            from collections import Counter
            price = Counter(found_prices).most_common(1)[0][0]
            info['price'] = price
            info['price_text'] = f'${price} USD'
            info['price_status'] = 'disponible'
        
        # ========== EXTRACCIÓN DE PALABRAS CLAVE ==========
        keywords = []
        categories_map = {
            # Tipos de productos
            'anillo': ['anillo', 'anillos', 'sortija', 'sortijas'],
            'dije': ['dije', 'dijes', 'medalla', 'medallas'],
            'relicario': ['relicario', 'relicarios'],
            'pulsera': ['pulsera', 'pulseras', 'brazalete', 'brazaletes', 'manilla'],
            'collar': ['collar', 'collares', 'gargantilla'],
            'aretes': ['arete', 'aretes', 'pendiente', 'pendientes', 'zarcillo'],
            'cadena': ['cadena', 'cadenas'],
            'set': ['set', 'juego', 'combo'],
            
            # Materiales
            'oro': ['oro', 'dorado', 'gold', '18k', '14k', 'bano de oro'],
            'plata': ['plata', 'plateado', 'silver', '925'],
            'acero': ['acero', 'steel', 'quirurgico'],
            
            # Características
            'graduacion': ['graduacion', 'bachiller', 'universitario', 'grado'],
            'grabado': ['grabado', 'grabados', 'personalizado', 'personalizacion'],
            'cristal': ['cristal', 'cristales', 'piedra', 'zirconia'],
            'perla': ['perla', 'perlas'],
            'diamante': ['diamante', 'diamantes'],
            
            # Diseños
            'corazon': ['corazon', 'heart'],
            'cruz': ['cruz', 'cross'],
            'estrella': ['estrella', 'star'],
            'luna': ['luna', 'moon'],
            'flor': ['flor', 'flores', 'flower'],
            'infinito': ['infinito', 'infinity'],
            'mariposa': ['mariposa', 'butterfly'],
        }
        
        detected_categories = set()
        for category, variants in categories_map.items():
            for variant in variants:
                if variant in text_normalized:
                    keywords.append(category)
                    detected_categories.add(category)
                    break
        
        # Eliminar duplicados manteniendo orden
        keywords = list(dict.fromkeys(keywords))
        
        if keywords:
            info['detected_keywords'] = keywords
            
            # ========== CREAR NOMBRE INTELIGENTE ==========
            # Prioridad: Tipo > Material > Característica
            tipos = ['anillo', 'dije', 'relicario', 'pulsera', 'collar', 'aretes', 'cadena', 'set']
            materiales = ['oro', 'plata', 'acero']
            caracteristicas = ['graduacion', 'grabado', 'personalizado', 'corazon', 'cruz']
            
            tipo = next((k for k in keywords if k in tipos), None)
            material = next((k for k in keywords if k in materiales), None)
            caracteristica = next((k for k in keywords if k in caracteristicas), None)
            
            # Construir nombre
            nombre_parts = []
            
            if tipo:
                nombre_parts.append(tipo.title())
                
                if caracteristica == 'graduacion':
                    nombre_parts[0] = f"{tipo.title()} de Graduación"
                elif caracteristica:
                    nombre_parts.append(caracteristica.title())
                    
                if material:
                    nombre_parts.append(f"de {material.title()}")
            elif caracteristica:
                nombre_parts.append(caracteristica.title())
                if material:
                    nombre_parts.append(f"de {material.title()}")
            elif material:
                nombre_parts.append(f"Joya de {material.title()}")
            else:
                nombre_parts.append(keywords[0].title())
            
            info['name'] = ' '.join(nombre_parts)
            
            # Determinar categoría principal
            if tipo:
                if tipo in ['anillo', 'sortija']:
                    info['category'] = 'anillos'
                elif tipo in ['collar', 'gargantilla']:
                    info['category'] = 'collares'
                elif tipo in ['pulsera', 'brazalete']:
                    info['category'] = 'pulseras'
                elif tipo in ['aretes', 'pendiente']:
                    info['category'] = 'aretes'
                elif tipo == 'dije':
                    info['category'] = 'dijes'
                elif tipo == 'set':
                    info['category'] = 'sets'
        
        # ========== DETECTAR MATERIAL ==========
        if 'oro' in detected_categories:
            if '18k' in text_normalized or '18 k' in text_normalized:
                info['material'] = 'oro_18k'
            elif '14k' in text_normalized:
                info['material'] = 'oro_14k'
            elif 'rosa' in text_normalized:
                info['material'] = 'oro_rosa'
            elif 'blanco' in text_normalized:
                info['material'] = 'oro_blanco'
            else:
                info['material'] = 'oro'
        elif 'plata' in detected_categories:
            if '925' in text:
                info['material'] = 'plata_925'
            else:
                info['material'] = 'plata'
        elif 'acero' in detected_categories:
            if 'quirurgico' in text_normalized:
                info['material'] = 'acero_quirurgico'
            else:
                info['material'] = 'acero'
        
        # ========== EXTRAER DESCRIPCIÓN ADICIONAL ==========
        # Buscar líneas cortas que puedan ser descripciones
        lines = [l.strip() for l in text.split('\n') if 10 < len(l.strip()) < 100]
        if lines:
            # Filtrar líneas que no sean solo mayúsculas o números
            desc_lines = [l for l in lines if not l.isupper() and any(c.isalpha() for c in l)]
            if desc_lines:
                info['description'] = desc_lines[0][:200]  # Primera línea descriptiva
        
        # ========== DETECTAR DISPONIBILIDAD ==========
        # Buscar palabras que indiquen necesidad de consulta
        consultar_palabras = ['consultar', 'consulta', 'cotizar', 'cotizacion', 
                             'preguntar', 'disponibilidad', 'bajo pedido']
        
        if any(word in text_normalized for word in consultar_palabras) and 'price' not in info:
            info['price_status'] = 'consultar'
        
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
