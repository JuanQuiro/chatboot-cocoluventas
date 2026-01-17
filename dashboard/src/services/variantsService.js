import axios from './api';

export const variantsService = {
    // Base Products
    getAllBaseProducts: async () => {
        const response = await axios.get('/api/variants/base');
        return response.data;
    },

    searchBaseProducts: async (query) => {
        const response = await axios.get('/api/variants/base/search', { params: { q: query } });
        return response.data;
    },

    createBaseProduct: async (data) => {
        const response = await axios.post('/api/variants/base', data);
        return response.data;
    },

    getBaseProductById: async (id) => {
        const response = await axios.get(`/api/variants/base/${id}`);
        return response.data;
    },

    // Variants
    getVariantsByBaseId: async (baseId) => {
        const response = await axios.get(`/api/variants/base/${baseId}/variants`);
        return response.data;
    },

    getVariantById: async (id) => {
        const response = await axios.get(`/api/variants/${id}`);
        return response.data;
    },

    createVariant: async (data) => {
        const response = await axios.post('/api/variants', data);
        return response.data;
    },

    searchVariants: async (query) => {
        const response = await axios.get('/api/variants/search', { params: { q: query } });
        return response.data;
    },

    compareVariants: async (ids) => {
        const response = await axios.get('/api/variants/compare', { params: { ids: ids.join(',') } });
        return response.data;
    }
};
