// Clients API Service
import api from './api';

export const clientsApi = {
    /**
     * Search clients by query
     * @param {string} query - Search term (name, phone, email)
     * @returns {Promise<Array>} List of matching clients
     */
    search: (query) => api.get('/clients', { params: { q: query } }),

    /**
     * Get all clients
     * @returns {Promise<Array>} List of all clients
     */
    getAll: () => api.get('/clients'),

    /**
     * Get client by ID
     * @param {string|number} id - Client ID
     * @returns {Promise<Object>} Client data
     */
    getById: (id) => api.get(`/clients/${id}`),

    /**
     * Create new client
     * @param {Object} data - Client data (nombre, apellido, cedula, telefono, email, etc.)
     * @returns {Promise<Object>} Created client
     */
    create: (data) => api.post('/clients', data),

    /**
     * Update existing client
     * @param {string|number} id - Client ID
     * @param {Object} data - Updated client data
     * @returns {Promise<Object>} Updated client
     */
    update: (id, data) => api.put(`/clients/${id}`, data),

    /**
     * Delete client (soft delete)
     * @param {string|number} id - Client ID
     * @returns {Promise<Object>} Deletion result
     */
    delete: (id) => api.delete(`/clients/${id}`),

    /**
     * Get client statistics
     * @returns {Promise<Object>} Stats (total, activos, etc.)
     */
    getStats: () => api.get('/clients/stats')
};

export default clientsApi;
