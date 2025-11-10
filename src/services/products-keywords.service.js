/**
 * Servicio de Keywords de Productos
 * Maneja keywords y respuestas automáticas para productos
 */

class ProductsKeywordsService {
    constructor() {
        // Base de datos de keywords de productos
        this.keywords = {
            'RELICARIO': {
                name: 'Relicario Premium',
                description: '💎 *RELICARIO PREMIUM*\n\n_"Guarda tus momentos más preciados"_\n\n💖 Relicario para fotos y recuerdos\n💎 Acero inoxidable premium\n📏 Tamaño: 3cm x 2cm\n\n💵 *$89.900*\n\n*Incluye:*\n• Grabado personalizado\n• Resistente al agua\n• Cadena elegante\n• Empaque de regalo\n• Envío GRATIS (Bogotá)\n\n💝 El regalo perfecto',
                price: 89900,
                category: 'joyeria',
                images: [],
                available: true,
                relatedProducts: ['DIJE', 'CADENA']
            },
            'DIJE': {
                name: 'Dije Personalizado',
                description: '✨ *DIJE DE PLATA*\n\n_"Diseño único y personal"_\n\n💎 Plata 925 auténtica\n🖊️ Grabado láser incluido\n📏 Tamaño: 2.5cm\n\n💵 *$69.900*\n\n*Beneficios:*\n• Plata 925 certificada\n• Hipoalergénico\n• Grabado de precisión\n• Garantía 6 meses\n• Envío nacional\n\n🌟 Personaliza con tu nombre',
                price: 69900,
                category: 'joyeria',
                images: [],
                available: true,
                relatedProducts: ['RELICARIO', 'CADENA']
            },
            'CADENA': {
                name: 'Cadena Premium',
                description: '⛓️ *CADENA PREMIUM*\n\n_"El complemento perfecto"_\n\n💎 Acero inoxidable\n📏 Tamaños: 40, 50, 60cm\n\n💵 *$49.900*\n\n*Características:*\n• Broche de seguridad\n• Anti-alérgica\n• Resistente\n• Brillo permanente\n• Envío GRATIS\n\n💝 Combina con tu dije',
                price: 49900,
                category: 'joyeria',
                images: [],
                available: true,
                relatedProducts: ['RELICARIO', 'DIJE']
            },
            'PULSERA': {
                name: 'Pulsera Elegante',
                description: '💫 *PULSERA DE PLATA*\n\n_"Elegancia diaria"_\n\n💎 Plata italiana premium\n🌟 Baño de rodio\n📏 Ajuste universal\n\n💵 *$79.900*\n\n*Beneficios:*\n• Plata italiana\n• Ajuste fácil\n• Hipoalergénica\n• Brillo duradero\n• Envío GRATIS\n\n💝 Uso diario y especial',
                price: 79900,
                category: 'joyeria',
                images: [],
                available: true,
                relatedProducts: ['DIJE', 'ANILLO']
            },
            'ANILLO': {
                name: 'Anillo Personalizado',
                description: '💍 *ANILLO PERSONALIZADO*\n\n_"Símbolo eterno de amor"_\n\n💎 Oro 18k o Plata 925\n🖊️ Grabado interno incluido\n📏 Todas las tallas\n\n💵 *Desde $129.900*\n\n*Incluye:*\n• Grabado personalizado\n• Certificado\n• Medición de talla\n• Envío asegurado\n• Estuche elegante\n\n💝 Bodas y aniversarios',
                price: 129900,
                category: 'joyeria',
                images: [],
                available: true,
                relatedProducts: ['PULSERA', 'DIJE']
            }
        };

        // Contador de búsquedas
        this.searchCount = new Map();
    }

    /**
     * Buscar producto por keyword
     * @param {string} keyword - Keyword a buscar
     * @returns {Object|null}
     */
    searchKeyword(keyword) {
        const upperKeyword = keyword.toUpperCase().trim();
        
        // Buscar exacta
        if (this.keywords[upperKeyword]) {
            this._incrementSearch(upperKeyword);
            return this.keywords[upperKeyword];
        }

        // Buscar parcial
        for (const [key, product] of Object.entries(this.keywords)) {
            if (upperKeyword.includes(key) || key.includes(upperKeyword)) {
                this._incrementSearch(key);
                return product;
            }
        }

        return null;
    }

    /**
     * Incrementar contador de búsquedas
     */
    _incrementSearch(keyword) {
        const count = this.searchCount.get(keyword) || 0;
        this.searchCount.set(keyword, count + 1);
    }

    /**
     * Agregar o actualizar keyword
     * @param {string} keyword - Keyword
     * @param {Object} productData - Datos del producto
     */
    addKeyword(keyword, productData) {
        const upperKeyword = keyword.toUpperCase().trim();
        this.keywords[upperKeyword] = {
            ...productData,
            addedAt: new Date().toISOString()
        };
        console.log(`✅ Keyword "${upperKeyword}" agregada/actualizada`);
    }

    /**
     * Eliminar keyword
     * @param {string} keyword - Keyword a eliminar
     */
    removeKeyword(keyword) {
        const upperKeyword = keyword.toUpperCase().trim();
        if (this.keywords[upperKeyword]) {
            delete this.keywords[upperKeyword];
            console.log(`✅ Keyword "${upperKeyword}" eliminada`);
            return true;
        }
        return false;
    }

    /**
     * Obtener todos los keywords
     */
    getAllKeywords() {
        return Object.keys(this.keywords);
    }

    /**
     * Obtener productos por categoría
     * @param {string} category - Categoría
     */
    getByCategory(category) {
        return Object.entries(this.keywords)
            .filter(([_, product]) => product.category === category)
            .map(([keyword, product]) => ({ keyword, ...product }));
    }

    /**
     * Obtener estadísticas de búsquedas
     */
    getSearchStats() {
        const stats = Array.from(this.searchCount.entries())
            .map(([keyword, count]) => ({ keyword, count }))
            .sort((a, b) => b.count - a.count);

        return {
            totalKeywords: Object.keys(this.keywords).length,
            totalSearches: Array.from(this.searchCount.values()).reduce((a, b) => a + b, 0),
            topSearches: stats.slice(0, 10),
            allSearches: stats
        };
    }

    /**
     * Verificar si un texto contiene alguna keyword
     * @param {string} text - Texto a analizar
     * @returns {Array} Keywords encontradas
     */
    detectKeywords(text) {
        const upperText = text.toUpperCase();
        const found = [];

        for (const keyword of Object.keys(this.keywords)) {
            if (upperText.includes(keyword)) {
                found.push({
                    keyword,
                    product: this.keywords[keyword]
                });
            }
        }

        return found;
    }

    /**
     * Generar respuesta con productos relacionados
     * @param {string} keyword - Keyword del producto
     */
    getProductWithRelated(keyword) {
        const product = this.searchKeyword(keyword);
        if (!product) return null;

        let message = product.description + '\n\n';

        if (product.relatedProducts && product.relatedProducts.length > 0) {
            message += '🔗 *También te puede interesar:*\n';
            product.relatedProducts.forEach(related => {
                const relatedProduct = this.keywords[related];
                if (relatedProduct) {
                    message += `• ${relatedProduct.name} - $${relatedProduct.price.toLocaleString()}\n`;
                }
            });
        }

        return {
            product,
            message
        };
    }
}

// Singleton
const productsKeywordsService = new ProductsKeywordsService();

export default productsKeywordsService;
