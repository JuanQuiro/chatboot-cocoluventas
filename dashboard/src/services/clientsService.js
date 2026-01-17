import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3009/api';

// Clients Service
export const clientsService = {
    // Get all clients
    // Get all clients (paginated)
    getClients: async (page = 1, limit = 10, filters = {}) => {
        const response = await axios.get(`${API_URL}/clients`, {
            params: { page, limit, ...filters }
        });
        const body = response.data;
        // Robust handling for potential double-wrapping from backend
        if (body.data && body.data.data && Array.isArray(body.data.data)) {
            return body.data;
        }
        return body; // Returns { success, data, meta }
    },

    // Search clients
    // Search clients
    searchClients: async (query, page = 1, limit = 10) => {
        const response = await axios.get(`${API_URL}/clients`, {
            params: { q: query, page, limit }
        });
        return response.data; // Returns { success, data, meta }
    },

    // ========== BÚSQUEDA MEJORADA (JOYERÍA) ==========
    // Usa el nuevo endpoint que incluye apellido
    searchClientsMejorado: async (query) => {
        if (!query || query.length < 2) {
            return { success: true, data: [] };
        }
        try {
            const response = await axios.get(`${API_URL}/clients/search`, {
                params: { q: query }
            });
            return response.data.data || [];
        } catch (error) {
            console.error('Error searching clients:', error);
            throw error;
        }
    },

    // Crear cliente con apellido obligatorio
    createClientMejorado: async (clienteData) => {
        if (!clienteData.apellido) {
            throw new Error('El apellido es obligatorio');
        }
        try {
            const response = await axios.post(`${API_URL}/clients`, clienteData);
            return response.data;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    },

    // Get client by ID
    getClientById: async (id) => {
        const response = await axios.get(`${API_URL}/clients/${id}`);
        return response.data;
    },

    // Create client
    createClient: async (clientData) => {
        const response = await axios.post(`${API_URL}/clients`, clientData);
        return response.data;
    },

    // Update client
    updateClient: async (id, clientData) => {
        const response = await axios.put(`${API_URL}/clients/${id}`, clientData);
        return response.data;
    },

    // Delete client
    deleteClient: async (id) => {
        const response = await axios.delete(`${API_URL}/clients/${id}`);
        return response.data;
    },

    // Get client purchase history
    getClientHistory: async (id, filters = {}) => {
        const response = await axios.get(`${API_URL}/clients/${id}/history`, { params: filters });
        return response.data;
    },

    // Get client balance
    getClientBalance: async (id) => {
        const response = await axios.get(`${API_URL}/clients/${id}/balance`);
        return response.data;
    },

    // Quick create (minimal fields)
    // DEPRECATED: Use createClientMejorado instead
    quickCreate: async (minimalData) => {
        console.warn('⚠️ quickCreate is deprecated, use createClientMejorado instead');
        return clientsService.createClientMejorado(minimalData);
    },

    // Statistics
    getTopClients: async (limit = 10, period = 'month') => {
        const response = await axios.get(`${API_URL}/clients/top`, { params: { limit, period } });
        return response.data;
    },

    getClientDebtSummary: async (clientId) => {
        const response = await axios.get(`${API_URL}/clients/${clientId}/debt-summary`);
        return response.data;
    }
};

export default clientsService;
