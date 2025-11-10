import { addKeyword } from '@builderbot/bot';
import { getProducts, getProductCategories } from '../services/products.service.js';
import analyticsService from '../services/analytics.service.js';

/**
 * Flujo de productos y catálogo
 */
const productsFlow = addKeyword(['1', 'productos', 'catalogo', 'catálogo', 'tienda'])
    .addAnswer(
        '🛍️ *CATÁLOGO DE PRODUCTOS*',
        { delay: 500 }
    )
    .addAnswer(
        [
            'Te mostraré nuestros productos disponibles.',
            '',
            '¿Qué te gustaría ver?',
            '',
            '📱 Escribe *CATEGORIAS* para ver por categoría',
            '🔍 Escribe *BUSCAR* seguido del nombre del producto',
            '📦 Escribe *TODOS* para ver todo el catálogo',
            '🌐 Escribe *WEB* para visitar nuestro sitio web',
        ],
        { delay: 800 },
        async (ctx, { flowDynamic }) => {
            const catalogUrl = process.env.CATALOG_URL;
            if (catalogUrl) {
                await flowDynamic([
                    '',
                    `🌐 También puedes ver nuestro catálogo completo en:`,
                    catalogUrl
                ]);
            }
        }
    );

/**
 * Sub-flujo para mostrar categorías
 */
const categoriesFlow = addKeyword(['categorias', 'categorías', 'categoria'])
    .addAnswer(
        '📂 *CATEGORÍAS DISPONIBLES*',
        { delay: 500 },
        async (ctx, { flowDynamic }) => {
            const categories = await getProductCategories();
            
            if (categories.length > 0) {
                const categoryList = categories.map((cat, index) => 
                    `${index + 1}. ${cat.icon || '📦'} ${cat.name}`
                ).join('\n');
                
                await flowDynamic([
                    '',
                    categoryList,
                    '',
                    '💡 Escribe el nombre de la categoría que te interesa.'
                ]);
            } else {
                await flowDynamic('⚠️ No hay categorías disponibles en este momento.');
            }
        }
    );

/**
 * Sub-flujo para mostrar todos los productos
 */
const allProductsFlow = addKeyword(['todos', 'todo', 'ver todo', 'mostrar todo'])
    .addAnswer(
        '📦 *PRODUCTOS DESTACADOS*',
        { delay: 500 },
        async (ctx, { flowDynamic }) => {
            const products = await getProducts();
            
            if (products.length > 0) {
                for (const product of products.slice(0, 10)) {
                    // Registrar vista de producto
                    analyticsService.trackProductView(product.id, product.name);
                    
                    await flowDynamic([
                        `━━━━━━━━━━━━━━━━━━━━`,
                        `*${product.name}*`,
                        `💰 Precio: $${product.price}`,
                        product.description ? `📝 ${product.description}` : '',
                        product.stock > 0 ? `✅ Disponible (${product.stock} unidades)` : '❌ Sin stock',
                        `━━━━━━━━━━━━━━━━━━━━`
                    ].filter(Boolean).join('\n'));
                }
                
                if (products.length > 10) {
                    await flowDynamic([
                        '',
                        `... y ${products.length - 10} productos más.`,
                        '',
                        '💡 Escribe *MENU* para ver más opciones o el nombre del producto para más información.'
                    ]);
                }
            } else {
                await flowDynamic('⚠️ No hay productos disponibles en este momento.');
            }
        }
    );

/**
 * Sub-flujo para buscar productos
 */
const searchProductFlow = addKeyword(['buscar', 'busco'])
    .addAnswer(
        '🔍 *BÚSQUEDA DE PRODUCTOS*',
        { capture: true },
        async (ctx, { flowDynamic, fallBack }) => {
            const searchTerm = ctx.body.replace(/buscar/i, '').trim();
            
            if (searchTerm.length < 3) {
                await flowDynamic('⚠️ Por favor escribe al menos 3 caracteres para buscar.');
                return fallBack();
            }
            
            // Registrar búsqueda
            analyticsService.trackProductSearch(searchTerm);
            
            const products = await getProducts(searchTerm);
            
            if (products.length > 0) {
                await flowDynamic(`Encontré ${products.length} resultado(s):`);
                
                for (const product of products) {
                    await flowDynamic([
                        `━━━━━━━━━━━━━━━━━━━━`,
                        `*${product.name}*`,
                        `💰 Precio: $${product.price}`,
                        product.description ? `📝 ${product.description}` : '',
                        product.stock > 0 ? `✅ Disponible` : '❌ Sin stock',
                        `━━━━━━━━━━━━━━━━━━━━`
                    ].filter(Boolean).join('\n'));
                }
            } else {
                await flowDynamic([
                    '❌ No encontré productos con ese nombre.',
                    '',
                    '💡 Intenta con otro término o escribe *CATEGORIAS* para explorar.'
                ]);
            }
        }
    );

/**
 * Sub-flujo para ver el sitio web
 */
const websiteFlow = addKeyword(['web', 'website', 'sitio', 'pagina'])
    .addAnswer(
        '🌐 *SITIO WEB*',
        { delay: 500 },
        async (ctx, { flowDynamic }) => {
            const websiteUrl = process.env.WEBSITE_URL || process.env.CATALOG_URL;
            
            if (websiteUrl) {
                await flowDynamic([
                    'Visita nuestro sitio web para ver todos los productos:',
                    '',
                    websiteUrl,
                    '',
                    '💡 Allí encontrarás imágenes, descripciones detalladas y más información.'
                ]);
            } else {
                await flowDynamic('⚠️ El sitio web no está disponible en este momento.');
            }
        }
    );

// Exportar flujo principal y sub-flujos
export default productsFlow
    .addAnswer(null, null, null, [
        categoriesFlow,
        allProductsFlow,
        searchProductFlow,
        websiteFlow
    ]);
