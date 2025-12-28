import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper: Map Backend -> Frontend
const toFrontend = (p) => {
    if (!p) return null;
    return {
        id: p.id,
        name: p.nombre,
        code: p.sku || '',
        category: p.categoria_nombre || 'General',
        categoryId: p.categoria_id, // Preserve category ID
        price: p.precio_usd || 0,
        cost: 0, // Backend doesn't store cost
        stock: p.stock_actual || 0,
        minStock: p.stock_minimo || 0,
        description: p.descripcion || '',
        active: Boolean(p.activo)
    };
};

// Helper: Map Frontend -> Backend
const toBackend = (p) => ({
    nombre: p.name,
    sku: p.code,
    categoria_id: p.categoryId || 1, // Default to 1 (General) if no category selected
    precio_usd: parseFloat(p.price) || 0,
    stock_actual: parseInt(p.stock) || 0,
    stock_minimo: parseInt(p.minStock) || 0,
    descripcion: p.description
});

const toFrontendMovement = (m) => ({
    id: m.id,
    date: m.fecha_movimiento,
    product: {
        name: m.producto_nombre,
        code: m.sku
    },
    // Map granular backend types to generic frontend types
    type: m.tipo_movimiento === 'venta' ? 'salida' :
        (m.tipo_movimiento === 'compra' ? 'entrada' : m.tipo_movimiento),
    originalType: m.tipo_movimiento, // Keep original for details
    quantity: m.cantidad,
    previousStock: m.stock_anterior,
    newStock: m.stock_nuevo,
    user: {
        name: m.usuario_nombre || (m.pedido_id ? `Cliente (Pedido #${m.pedido_id})` : 'Sistema')
    },
    orderId: m.pedido_id, // Add orderId for key
    notes: m.comentario
});

// Inventory Service
export const inventoryService = {
    // Get all products
    // Get all products
    getProducts: async (filters = {}) => {
        const response = await axios.get(`${API_URL}/products`, { params: filters });
        const rawBody = response.data;

        let list = [];
        let meta = { total: 0 };

        // Handle various response structures
        if (Array.isArray(rawBody.products)) {
            list = rawBody.products;
        } else if (Array.isArray(rawBody.data)) {
            list = rawBody.data;
            meta = rawBody.meta || meta;
        } else if (rawBody.data && Array.isArray(rawBody.data.data)) {
            // Double nested: { success: true, data: { success: true, data: [...] } }
            list = rawBody.data.data;
            meta = rawBody.data.meta || meta;
        }

        return {
            data: list.map(toFrontend),
            meta: meta || { total: list.length }
        };
    },

    // Search products
    searchProducts: async (query) => {
        const response = await axios.get(`${API_URL}/products`, { params: { search: query } });
        const list = Array.isArray(response.data.products) ? response.data.products : (Array.isArray(response.data.data) ? response.data.data : []);
        return list.map(toFrontend);
    },

    // Search by barcode/sku
    searchByBarcode: async (barcode) => {
        // Backend doesn't have specific barcode endpoint, utilizing search
        const response = await axios.get(`${API_URL}/products`, { params: { search: barcode } });
        const list = Array.isArray(response.data.products) ? response.data.products : (Array.isArray(response.data.data) ? response.data.data : []);
        const found = list.find(p => p.sku === barcode) || list[0];
        return toFrontend(found);
    },

    // Load more (for infinite scroll)
    loadMoreProducts: async (page = 1, limit = 20) => {
        const response = await axios.get(`${API_URL}/products`, { params: { page, limit } });
        const list = Array.isArray(response.data.products) ? response.data.products : (Array.isArray(response.data.data) ? response.data.data : []);
        return list.map(toFrontend);
    },

    // Get product by ID
    getProductById: async (id) => {
        const response = await axios.get(`${API_URL}/products/${id}`);
        return toFrontend(response.data.data || response.data.product || response.data);
    },

    // Create product
    createProduct: async (productData) => {
        const payload = toBackend(productData);
        const response = await axios.post(`${API_URL}/products`, payload);
        return toFrontend(response.data.data || response.data.product);
    },

    // Update product
    updateProduct: async (id, productData) => {
        const payload = toBackend(productData);
        const response = await axios.put(`${API_URL}/products/${id}`, payload);
        return toFrontend(response.data.data || response.data.product);
    },

    // Delete product
    deleteProduct: async (id) => {
        const response = await axios.delete(`${API_URL}/products/${id}`);
        return response.data;
    },

    // Get low stock products
    getLowStock: async () => {
        const response = await axios.get(`${API_URL}/products/low-stock`);
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        return list.map(toFrontend);
    },



    // Get inventory movements
    getMovements: async (filters = {}) => {
        try {
            const response = await axios.get(`${API_URL}/inventory/movements`, { params: filters });
            // Backend returns { success, data: [], meta }
            const rawData = response.data;
            const list = Array.isArray(rawData.data) ? rawData.data : [];
            return {
                data: list.map(toFrontendMovement),
                meta: rawData.meta || { total: list.length }
            };
        } catch (error) {
            console.error('Error fetching movements:', error);
            return { data: [], meta: { total: 0 } };
        }
    },

    // Create movement
    createMovement: async (movementData) => {
        const response = await axios.post(`${API_URL}/inventory/movements`, movementData);
        return response.data;
    },

    // Get inventory statistics
    // Get inventory statistics
    getInventoryStats: async () => {
        const response = await axios.get(`${API_URL}/inventory/stats`);
        const body = response.data;

        // Robust handling for double-wrapping
        if (body.data && body.data.data) {
            return body.data.data;
        }
        return body.data || body;
    },

    // Stock validation
    checkStock: async (productId) => {
        const response = await axios.get(`${API_URL}/inventory/${productId}/stock`);
        return response.data;
    },

    reserveStock: async (productId, quantity) => {
        const response = await axios.post(`${API_URL}/inventory/${productId}/reserve`, { quantity });
        return response.data;
    },

    releaseStock: async (productId, quantity) => {
        const response = await axios.post(`${API_URL}/inventory/${productId}/release`, { quantity });
        return response.data;
    },

    // Advanced search
    searchByBarcode: async (barcode) => {
        const response = await axios.get(`${API_URL}/inventory/search/barcode`, { params: { barcode } });
        return response.data;
    },

    searchByCategory: async (category) => {
        const response = await axios.get(`${API_URL}/inventory/search/category`, { params: { category } });
        return response.data;
    },

    // Statistics
    getTopProducts: async (limit = 10, period = 'month') => {
        const response = await axios.get(`${API_URL}/inventory/top`, { params: { limit, period } });
        return response.data;
    },

    // Get inventory statistics
    getStats: async () => {
        const response = await axios.get(`${API_URL}/products/stats`);
        return response.data;
    }
};

export default inventoryService;
