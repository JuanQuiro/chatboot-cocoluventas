import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3009/api';

export const commissionsService = {
    /**
     * Get seller commission rate
     */
    getSellerRate: async (sellerId) => {
        try {
            const response = await axios.get(`${API_URL}/finance/commissions/seller/${sellerId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting seller rate:', error);
            throw error;
        }
    },

    /**
     * Update seller commission rate
     */
    updateSellerRate: async (sellerId, rate) => {
        try {
            const response = await axios.post(`${API_URL}/finance/commissions/config`, {
                entityType: 'seller',
                entityId: sellerId,
                type: 'percentage',
                value: rate
            });
            return response.data;
        } catch (error) {
            console.error('Error updating seller rate:', error);
            throw error;
        }
    },

    /**
     * Get manufacturer rates
     */
    getManufacturerRates: async () => {
        try {
            const response = await axios.get(`${API_URL}/finance/manufacturers`);
            return response.data;
        } catch (error) {
            console.error('Error getting manufacturer rates:', error);
            throw error;
        }
    },

    /**
     * Update manufacturer rate
     */
    updateManufacturerRate: async (manufacturerId, type, value) => {
        try {
            const response = await axios.post(`${API_URL}/finance/commissions/config`, {
                entityType: 'manufacturer',
                entityId: manufacturerId,
                type,
                value
            });
            return response.data;
        } catch (error) {
            console.error('Error updating manufacturer rate:', error);
            throw error;
        }
    },

    /**
     * Get sellers commission summary
     */
    getSellersSummary: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.start = startDate;
            if (endDate) params.end = endDate;

            const response = await axios.get(`${API_URL}/finance/commissions/summary/sellers`, { params });
            return response.data;
        } catch (error) {
            console.error('Error getting sellers summary:', error);
            throw error;
        }
    },

    /**
     * Get manufacturers commission summary
     */
    getManufacturersSummary: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.start = startDate;
            if (endDate) params.end = endDate;

            const response = await axios.get(`${API_URL}/finance/commissions/summary/manufacturers`, { params });
            return response.data;
        } catch (error) {
            console.error('Error getting manufacturers summary:', error);
            throw error;
        }
    }
};

export default commissionsService;
