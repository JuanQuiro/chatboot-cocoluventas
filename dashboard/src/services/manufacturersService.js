import api from './api';

const manufacturersService = {
    // Get all manufacturers
    getAll: async () => {
        // api.js interceptor already returns response.data
        const response = await api.get('/manufacturers');
        return response; // response is already { success: true, data: [...] }
    },

    // Get manufacturer by ID
    getById: async (id) => {
        const response = await api.get(`/manufacturers/${id}`);
        return response;
    },

    // Get manufacturer statistics
    getStats: async (id) => {
        const response = await api.get(`/manufacturers/${id}/stats`);
        return response;
    },

    // Get manufacturer order history
    getOrderHistory: async (id, limit = 10) => {
        const response = await api.get(`/manufacturers/${id}/orders?limit=${limit}`);
        return response;
    },

    // Create new manufacturer
    create: async (data) => {
        const response = await api.post('/manufacturers', data);
        return response;
    },

    // Update manufacturer
    update: async (id, data) => {
        const response = await api.put(`/manufacturers/${id}`, data);
        return response;
    },

    // Delete manufacturer
    delete: async (id) => {
        const response = await api.delete(`/manufacturers/${id}`);
        return response;
    }
};

export default manufacturersService;
