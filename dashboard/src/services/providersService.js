import axios from './axiosConfig';

export const providersService = {
    getAll: async () => {
        const response = await axios.get('/api/providers');
        return response.data;
    },

    getById: async (id) => {
        const response = await axios.get(`/api/providers/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await axios.post('/api/providers', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await axios.put(`/api/providers/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await axios.delete(`/api/providers/${id}`);
        return response.data;
    }
};
