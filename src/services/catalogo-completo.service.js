/**
 * Servicio de Catálogo Completo - DATOS REALES
 * Usa información extraída por OCR del catálogo real
 * 136 productos con datos verificados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CatalogoCompletoService {
    constructor() {
        this.productos = [];
        this.searchIndex = {};
        this.loaded = false;
        this.loadCatalog();
    }

    /**
     * Cargar catálogo desde JSON
     */
    loadCatalog() {
        try {
            const catalogPath = path.join(__dirname, '../../public/catalogo-data/productos.json');
            const indexPath = path.join(__dirname, '../../public/catalogo-data/search_index.json');

            if (fs.existsSync(catalogPath)) {
                try {
                    const data = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
                    this.productos = data.products || [];
                    this.loaded = true;
                    console.log(`✅ Catálogo cargado: ${this.productos.length} productos`);
                } catch (e) { console.error('Error parsing catalog', e); }
            }

            if (fs.existsSync(indexPath)) {
                try {
                    this.searchIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
                    console.log(`✅ Índice de búsqueda cargado`);
                } catch (e) { console.error('Error parsing index', e); }
            }
        } catch (error) {
            console.error('❌ Error cargando catálogo:', error);
        }
    }

    /**
     * Buscar producto por página
     */
    buscarPorPagina(pagina) {
        const num = parseInt(pagina);
        return this.productos.find(p => p.page === num);
    }

    /**
     * Buscar productos por keyword
     */
    buscarPorKeyword(keyword) {
        const term = keyword.toLowerCase().trim();

        // Buscar en índice primero
        if (this.searchIndex[term]) {
            const productIds = Array.isArray(this.searchIndex[term])
                ? this.searchIndex[term]
                : [this.searchIndex[term]];
            return productIds.map(id => this.productos.find(p => p.id === id)).filter(Boolean);
        }

        // Búsqueda manual
        return this.productos.filter(p =>
            p.keywords.some(k => k.toLowerCase().includes(term)) ||
            (p.name && p.name.toLowerCase().includes(term)) ||
            (p.detected_keywords && p.detected_keywords.some(k => k.toLowerCase().includes(term)))
        );
    }

    /**
     * Obtener rango de productos (para paginación)
     */
    obtenerRango(inicio, cantidad = 10) {
        return this.productos.slice(inicio - 1, inicio - 1 + cantidad);
    }

    /**
     * Obtener imagen de producto
     */
    obtenerImagenPath(producto) {
        if (!producto) return null;
        return path.join(__dirname, '../../public', producto.image_path);
    }

    /**
     * Verificar si imagen existe
     */
    imagenExiste(producto) {
        const imgPath = this.obtenerImagenPath(producto);
        return imgPath && fs.existsSync(imgPath);
    }

    /**
     * Obtener total de productos
     */
    getTotalProductos() {
        return this.productos.length;
    }

    /**
     * Obtener estadísticas del catálogo
     */
    getEstadisticas() {
        const conPrecio = this.productos.filter(p => p.price).length;
        const conKeywords = this.productos.filter(p => p.detected_keywords?.length > 0).length;
        const materiales = {};

        this.productos.forEach(p => {
            if (p.material) {
                materiales[p.material] = (materiales[p.material] || 0) + 1;
            }
        });

        return {
            total: this.productos.length,
            conPrecio,
            conKeywords,
            materiales,
            porcentajeConInfo: Math.round((conKeywords / this.productos.length) * 100)
        };
    }

    /**
     * Formatear producto para mensaje WhatsApp (Venezuela - USD)
     * Incluye descripción profesional generada
     */
    formatearProducto(producto) {
        if (!producto) return null;

        let mensaje = `📄 *Página ${producto.page}*\n\n`;

        if (producto.name && producto.name !== `Producto Página ${producto.page}`) {
            mensaje += `💎 *${producto.name}*\n\n`;
        }

        // Descripción/Copy profesional
        if (producto.copy || producto.description) {
            const desc = producto.copy || producto.description;
            // Limpiar descripción si es muy técnica del OCR
            if (!desc.startsWith('Producto del catálogo') && desc.length > 20) {
                mensaje += `📝 ${desc}\n\n`;
            }
        }

        // PRECIO EN USD o Consultar
        if (producto.price) {
            mensaje += `💵 *Precio: ${producto.price_text}*\n\n`;
        } else {
            mensaje += `💬 *Precio: Consultar disponibilidad*\n\n`;
        }

        if (producto.material) {
            const materialText = producto.material.replace('_', ' ').toUpperCase();
            mensaje += `✨ Material: ${materialText}\n\n`;
        }

        if (producto.detected_keywords && producto.detected_keywords.length > 0) {
            const keywords = producto.detected_keywords.slice(0, 5).map(k => `#${k}`).join(' ');
            mensaje += `🏷️ ${keywords}\n\n`;
        }

        mensaje += `📖 Catálogo página ${producto.page}\n`;
        mensaje += `💬 Escribe "pag${producto.page}" para ver la imagen`;

        return mensaje;
    }

    /**
     * Buscar productos similares
     */
    buscarSimilares(producto, limite = 3) {
        if (!producto || !producto.detected_keywords) return [];

        const similares = [];

        for (const keyword of producto.detected_keywords) {
            const encontrados = this.buscarPorKeyword(keyword)
                .filter(p => p.id !== producto.id)
                .slice(0, limite);
            similares.push(...encontrados);
        }

        // Eliminar duplicados
        return [...new Map(similares.map(p => [p.id, p])).values()].slice(0, limite);
    }
}

// Singleton
const catalogoCompletoService = new CatalogoCompletoService();
export default catalogoCompletoService;
