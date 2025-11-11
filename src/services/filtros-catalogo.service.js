/**
 * Servicio de Filtros Avanzados para Catálogo
 * Permite búsquedas complejas: por precio, material, categoría, keywords
 */

import catalogoCompletoService from './catalogo-completo.service.js';

class FiltrosCatalogoService {
    constructor() {
        console.log('🔍 FiltrosCatalogoService inicializado');
    }

    /**
     * Parsear consulta en lenguaje natural
     * Ejemplos:
     * - "mayor de 30 dolares"
     * - "oro menor de 100 mil"
     * - "plata entre 50 y 100 mil"
     * - "anillos de oro"
     * - "relicarios baratos"
     */
    parseConsulta(texto) {
        const filtros = {
            precioMin: null,
            precioMax: null,
            material: null,
            categoria: null,
            keywords: [],
            ordenar: 'precio_asc' // precio_asc, precio_desc, relevancia
        };

        const textoNorm = texto.toLowerCase().trim();

        // DETECTAR PRECIO
        // "mayor de X", "más de X", "superior a X"
        const mayorDe = textoNorm.match(/(?:mayor|mas|superior|arriba)\s*(?:de|a)?\s*(\d+)/);
        if (mayorDe) {
            filtros.precioMin = this.convertirPrecio(mayorDe[1], textoNorm);
        }

        // "menor de X", "menos de X", "inferior a X", "debajo de X"
        const menorDe = textoNorm.match(/(?:menor|menos|inferior|debajo|hasta)\s*(?:de|a)?\s*(\d+)/);
        if (menorDe) {
            filtros.precioMax = this.convertirPrecio(menorDe[1], textoNorm);
        }

        // "entre X y Y"
        const entre = textoNorm.match(/entre\s*(\d+)\s*y\s*(\d+)/);
        if (entre) {
            filtros.precioMin = this.convertirPrecio(entre[1], textoNorm);
            filtros.precioMax = this.convertirPrecio(entre[2], textoNorm);
        }

        // "alrededor de X", "cerca de X"
        const alrededor = textoNorm.match(/(?:alrededor|cerca)\s*(?:de)?\s*(\d+)/);
        if (alrededor) {
            const precio = this.convertirPrecio(alrededor[1], textoNorm);
            filtros.precioMin = precio * 0.8; // -20%
            filtros.precioMax = precio * 1.2; // +20%
        }

        // DETECTAR MATERIAL
        if (textoNorm.includes('oro') || textoNorm.includes('dorado')) {
            filtros.material = 'oro';
        } else if (textoNorm.includes('plata') || textoNorm.includes('plateado')) {
            filtros.material = 'plata';
        } else if (textoNorm.includes('acero')) {
            filtros.material = 'acero';
        }

        // DETECTAR CATEGORÍA
        if (textoNorm.includes('anillo') || textoNorm.includes('sortija')) {
            filtros.categoria = 'anillos';
            filtros.keywords.push('anillo', 'sortija');
        } else if (textoNorm.includes('collar') || textoNorm.includes('gargantilla')) {
            filtros.categoria = 'collares';
            filtros.keywords.push('collar', 'gargantilla');
        } else if (textoNorm.includes('pulsera') || textoNorm.includes('brazalete')) {
            filtros.categoria = 'pulseras';
            filtros.keywords.push('pulsera', 'brazalete');
        } else if (textoNorm.includes('arete') || textoNorm.includes('pendiente')) {
            filtros.categoria = 'aretes';
            filtros.keywords.push('arete', 'pendiente', 'aretes');
        } else if (textoNorm.includes('dije')) {
            filtros.categoria = 'dijes';
            filtros.keywords.push('dije');
        } else if (textoNorm.includes('relicario')) {
            filtros.keywords.push('relicario');
        }

        // DETECTAR TÉRMINOS DE PRECIO RELATIVOS
        if (textoNorm.includes('barato') || textoNorm.includes('economico') || textoNorm.includes('accesible')) {
            filtros.precioMax = 50000; // Máximo 50mil
        } else if (textoNorm.includes('caro') || textoNorm.includes('premium') || textoNorm.includes('exclusivo')) {
            filtros.precioMin = 150000; // Mínimo 150mil
        } else if (textoNorm.includes('medio') || textoNorm.includes('moderado')) {
            filtros.precioMin = 50000;
            filtros.precioMax = 150000;
        }

        // DETECTAR ORDENAMIENTO
        if (textoNorm.includes('mas caro') || textoNorm.includes('mas costoso')) {
            filtros.ordenar = 'precio_desc';
        } else if (textoNorm.includes('mas barato') || textoNorm.includes('menor precio')) {
            filtros.ordenar = 'precio_asc';
        }

        return filtros;
    }

    /**
     * Convertir número a precio en pesos
     */
    convertirPrecio(numero, contexto) {
        let valor = parseInt(numero);

        // Detectar si menciona "mil" o "k"
        if (contexto.includes('mil') || contexto.includes('k')) {
            valor = valor * 1000;
        }

        // Detectar si menciona "dólares" o "usd"
        if (contexto.includes('dolar') || contexto.includes('usd') || contexto.includes('$')) {
            valor = valor * 4000; // Aproximado
        }

        return valor;
    }

    /**
     * Aplicar filtros a los productos
     */
    filtrarProductos(filtros) {
        let productos = catalogoCompletoService.productos;

        console.log(`🔍 Filtrando con:`, {
            precioMin: filtros.precioMin ? `$${filtros.precioMin:,}` : 'N/A',
            precioMax: filtros.precioMax ? `$${filtros.precioMax:,}` : 'N/A',
            material: filtros.material || 'Todos',
            categoria: filtros.categoria || 'Todas',
            keywords: filtros.keywords.join(', ') || 'Ninguna'
        });

        // Filtrar por precio
        if (filtros.precioMin !== null) {
            productos = productos.filter(p => p.price && p.price >= filtros.precioMin);
        }
        if (filtros.precioMax !== null) {
            productos = productos.filter(p => p.price && p.price <= filtros.precioMax);
        }

        // Filtrar por material
        if (filtros.material) {
            productos = productos.filter(p => 
                p.material && p.material.includes(filtros.material)
            );
        }

        // Filtrar por categoría
        if (filtros.categoria) {
            productos = productos.filter(p => p.category === filtros.categoria);
        }

        // Filtrar por keywords
        if (filtros.keywords.length > 0) {
            productos = productos.filter(p => {
                if (!p.detected_keywords) return false;
                return filtros.keywords.some(kw => 
                    p.detected_keywords.some(pk => 
                        pk.toLowerCase().includes(kw) || kw.includes(pk.toLowerCase())
                    )
                );
            });
        }

        // Ordenar
        if (filtros.ordenar === 'precio_asc') {
            productos.sort((a, b) => (a.price || 999999) - (b.price || 999999));
        } else if (filtros.ordenar === 'precio_desc') {
            productos.sort((a, b) => (b.price || 0) - (a.price || 0));
        }

        return productos;
    }

    /**
     * Búsqueda inteligente combinando filtros y lenguaje natural
     */
    buscarConFiltros(consulta) {
        const filtros = this.parseConsulta(consulta);
        const resultados = this.filtrarProductos(filtros);

        return {
            consulta,
            filtros,
            resultados,
            total: resultados.length
        };
    }

    /**
     * Generar descripción de los filtros aplicados
     */
    describirFiltros(filtros) {
        const partes = [];

        if (filtros.precioMin && filtros.precioMax) {
            partes.push(`entre $${filtros.precioMin.toLocaleString('es-CO')} y $${filtros.precioMax.toLocaleString('es-CO')}`);
        } else if (filtros.precioMin) {
            partes.push(`mayor de $${filtros.precioMin.toLocaleString('es-CO')}`);
        } else if (filtros.precioMax) {
            partes.push(`menor de $${filtros.precioMax.toLocaleString('es-CO')}`);
        }

        if (filtros.material) {
            partes.push(`de ${filtros.material}`);
        }

        if (filtros.categoria) {
            partes.push(`en categoría ${filtros.categoria}`);
        }

        if (filtros.keywords.length > 0) {
            partes.push(`tipo: ${filtros.keywords.join(', ')}`);
        }

        return partes.length > 0 ? partes.join(' • ') : 'Sin filtros';
    }

    /**
     * Formatear resultados para WhatsApp
     */
    formatearResultados(busqueda, limite = 5) {
        const { consulta, filtros, resultados, total } = busqueda;

        if (total === 0) {
            return `❌ No encontré productos con esos criterios.\n\n` +
                   `Filtros aplicados:\n${this.describirFiltros(filtros)}\n\n` +
                   `💡 Intenta con otros términos o rangos de precio.`;
        }

        let mensaje = `🔍 *Búsqueda: "${consulta}"*\n\n`;
        mensaje += `✅ Encontrados: *${total} productos*\n`;
        mensaje += `📋 Filtros: ${this.describirFiltros(filtros)}\n\n`;

        if (total > limite) {
            mensaje += `📄 Mostrando los primeros ${limite} resultados:\n\n`;
        }

        // Mostrar productos
        for (const prod of resultados.slice(0, limite)) {
            mensaje += `📄 *Página ${prod.page}*\n`;
            mensaje += `   💎 ${prod.name}\n`;
            mensaje += `   💰 ${prod.price_text}\n`;
            if (prod.material) {
                mensaje += `   ✨ ${prod.material.replace('_', ' ').toUpperCase()}\n`;
            }
            mensaje += `\n`;
        }

        if (total > limite) {
            mensaje += `\n📚 Hay ${total - limite} producto(s) más.\n`;
            mensaje += `💬 Escribe "pag[número]" para ver uno específico`;
        }

        return mensaje;
    }
}

// Singleton
const filtrosCatalogoService = new FiltrosCatalogoService();
export default filtrosCatalogoService;
