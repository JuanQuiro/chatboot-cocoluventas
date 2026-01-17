import api from './api';

export const sellersService = {
    // Get all sellers
    getAll: async () => {
        const response = await api.get('/users?role=seller'); // Assuming logic
        return response;
    },

    getById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response;
    }
};
