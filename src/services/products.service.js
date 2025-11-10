/**
 * Servicio de gestión de productos
 */

// Base de datos simulada de productos
const productsDatabase = [
    {
        id: 'PROD001',
        name: 'Producto Premium A',
        description: 'Producto de alta calidad con características excepcionales',
        price: 150.00,
        category: 'premium',
        stock: 25,
        icon: '⭐'
    },
    {
        id: 'PROD002',
        name: 'Producto Básico B',
        description: 'Excelente opción calidad-precio',
        price: 75.00,
        category: 'basico',
        stock: 50,
        icon: '📦'
    },
    {
        id: 'PROD003',
        name: 'Producto Especial C',
        description: 'Edición limitada con características únicas',
        price: 200.00,
        category: 'especial',
        stock: 10,
        icon: '✨'
    },
    {
        id: 'PROD004',
        name: 'Combo Familiar',
        description: 'Pack ideal para toda la familia',
        price: 300.00,
        category: 'combos',
        stock: 15,
        icon: '🎁'
    },
    {
        id: 'PROD005',
        name: 'Producto Eco',
        description: 'Producto ecológico y sostenible',
        price: 120.00,
        category: 'eco',
        stock: 30,
        icon: '🌱'
    }
];

const categories = [
    { name: 'Premium', icon: '⭐', key: 'premium' },
    { name: 'Básico', icon: '📦', key: 'basico' },
    { name: 'Especial', icon: '✨', key: 'especial' },
    { name: 'Combos', icon: '🎁', key: 'combos' },
    { name: 'Ecológicos', icon: '🌱', key: 'eco' }
];

/**
 * Obtener productos (con búsqueda opcional)
 * @param {string} searchTerm - Término de búsqueda opcional
 * @returns {Promise<Array>} Lista de productos
 */
export const getProducts = async (searchTerm = null) => {
    try {
        if (!searchTerm) {
            return productsDatabase;
        }
        
        const term = searchTerm.toLowerCase();
        return productsDatabase.filter(product => 
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
        );
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return [];
    }
};

/**
 * Obtener producto por ID
 * @param {string} productId - ID del producto
 * @returns {Promise<Object|null>} Producto encontrado o null
 */
export const getProductById = async (productId) => {
    try {
        return productsDatabase.find(p => p.id === productId) || null;
    } catch (error) {
        console.error('Error al obtener producto:', error);
        return null;
    }
};

/**
 * Obtener categorías de productos
 * @returns {Promise<Array>} Lista de categorías
 */
export const getProductCategories = async () => {
    try {
        return categories;
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        return [];
    }
};

/**
 * Obtener productos por categoría
 * @param {string} categoryKey - Clave de la categoría
 * @returns {Promise<Array>} Lista de productos de la categoría
 */
export const getProductsByCategory = async (categoryKey) => {
    try {
        return productsDatabase.filter(p => p.category === categoryKey);
    } catch (error) {
        console.error('Error al obtener productos por categoría:', error);
        return [];
    }
};

/**
 * Verificar disponibilidad de stock
 * @param {string} productId - ID del producto
 * @param {number} quantity - Cantidad solicitada
 * @returns {Promise<boolean>} true si hay stock suficiente
 */
export const checkStock = async (productId, quantity) => {
    try {
        const product = await getProductById(productId);
        return product && product.stock >= quantity;
    } catch (error) {
        console.error('Error al verificar stock:', error);
        return false;
    }
};
