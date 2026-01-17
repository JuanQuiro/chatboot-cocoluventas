import axios from 'axios';

// Default base URL - adjusts if running in dev/prod
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3009/api';

export const bcvService = {
    /**
     * Get current stored rate
     */
    getRate: async () => {
        try {
            const response = await axios.get(`${API_URL}/bcv/rate`);
            return response.data;
        } catch (error) {
            console.error('Error getting BCV rate:', error);
            throw error;
        }
    },

    /**
     * Force sync with external API
     */
    syncRate: async () => {
        try {
            const response = await axios.post(`${API_URL}/bcv/sync`);
            return response.data;
        } catch (error) {
            console.error('Error syncing BCV rate:', error);
            throw error;
        }
    },

    /**
     * Get historical rates
     */
    getHistory: async () => {
        try {
            const response = await axios.get(`${API_URL}/bcv/history`);
            return response.data;
        } catch (error) {
            console.error('Error getting BCV history:', error);
            throw error;
        }
    },

    /**
     * Manually set the BCV rate (admin override)
     */
    setRate: async (newRate) => {
        try {
            const response = await axios.post(`${API_URL}/bcv/rate`, { rate: newRate });
            return response.data;
        } catch (error) {
            console.error('Error setting BCV rate:', error);
            throw error;
        }
    }
};

export default bcvService;
