import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3009/api';

// Sales Service
export const salesService = {
    // Create new sale
    createSale: async (saleData) => {
        const response = await axios.post(`${API_URL}/sales`, saleData);
        return response.data;
    },

    // Get all sales
    getSales: async (filters = {}) => {
        const response = await axios.get(`${API_URL}/sales`, { params: filters });
        return response.data;
    },

    // Get sale by ID
    getSaleById: async (id) => {
        const response = await axios.get(`${API_URL}/sales/${id}`);
        return response.data;
    },

    // Update sale
    updateSale: async (id, saleData) => {
        const response = await axios.put(`${API_URL}/sales/${id}`, saleData);
        return response.data;
    },

    // Delete sale
    deleteSale: async (id) => {
        const response = await axios.delete(`${API_URL}/sales/${id}`);
        return response.data;
    },

    // Get sales statistics
    getSalesStats: async (dateRange) => {
        const response = await axios.get(`${API_URL}/sales/stats`, { params: dateRange });
        return response.data;
    },

    // Installment methods
    createInstallmentPlan: async (saleId, plan) => {
        const response = await axios.post(`${API_URL}/sales/${saleId}/installments`, plan);
        return response.data;
    },

    getInstallments: async (saleId) => {
        const response = await axios.get(`${API_URL}/sales/${saleId}/installments`);
        return response.data;
    },

    recordInstallmentPayment: async (installmentId, paymentData) => {
        const response = await axios.post(`${API_URL}/installments/${installmentId}/payment`, paymentData);
        return response.data;
    },

    // Advanced statistics
    getSalesByPeriod: async (period) => {
        const response = await axios.get(`${API_URL}/sales/by-period`, { params: { period } });
        return response.data;
    },

    duplicateSale: async (saleId) => {
        const response = await axios.post(`${API_URL}/sales/${saleId}/duplicate`);
        return response.data;
    },

    // ========== VENTAS MEJORADAS (JOYERÍA) ==========
    // Usa el nuevo endpoint con cálculos correctos de IVA, delivery, descuento
    createSaleMejorada: async (ventaData) => {
        const response = await axios.post(`${API_URL}/sales-improved/nueva`, ventaData);
        return response.data;
    },

    getSaleResumen: async (ventaId) => {
        const response = await axios.get(`${API_URL}/sales-improved/${ventaId}/resumen`);
        return response.data;
    }
};

// Orders Service (Pedidos)
export const ordersService = {
    // Get all orders
    // Get all orders
    // Get all orders (paginated)
    getOrders: async (filters = {}) => {
        // Filters now include page/limit
        const response = await axios.get(`${API_URL}/orders`, { params: filters });
        // Return full response { success, data, meta }
        return response.data;
    },

    // Get order by ID
    getOrderById: async (id) => {
        const response = await axios.get(`${API_URL}/orders/${id}`);
        if (response.data && response.data.success && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    // Create order
    createOrder: async (orderData) => {
        const response = await axios.post(`${API_URL}/sales`, orderData);
        return response.data;
    },

    // Update order
    updateOrder: async (id, orderData) => {
        const response = await axios.put(`${API_URL}/orders/${id}`, orderData);
        return response.data;
    },

    // Update order status
    updateOrderStatus: async (id, status) => {
        const response = await axios.put(`${API_URL}/orders/${id}/status`, { status });
        return response.data;
    },

    // Delete order
    deleteOrder: async (id) => {
        const response = await axios.delete(`${API_URL}/orders/${id}`);
        return response.data;
    },

    // Export orders
    exportOrders: async (filters = {}) => {
        const response = await axios.get(`${API_URL}/orders/export`, {
            params: filters,
            responseType: 'blob'
        });
        return response.data;
    },

    // Get order stats
    getStats: async () => {
        const response = await axios.get(`${API_URL}/orders/stats`);
        return response.data;
    },

    // Get orders by client
    getOrdersByClient: async (clientId) => {
        const response = await axios.get(`${API_URL}/orders/client/${clientId}`);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return [];
    }
};

export default {
    salesService,
    ordersService
};
