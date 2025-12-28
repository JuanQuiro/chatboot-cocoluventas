import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Accounts Receivable Service
export const accountsService = {
    // Get accounts receivable
    getAccountsReceivable: async (filters = {}) => {
        const response = await axios.get(`${API_URL}/accounts-receivable`, { params: filters });
        // Backend returns { success, data, meta }
        return response.data;
    },

    // Register payment
    registerPayment: async (paymentData) => {
        const response = await axios.post(`${API_URL}/payments`, paymentData);
        return response.data;
    },

    // Get account history/details
    getAccountHistory: async (clientId, filters = {}) => {
        const response = await axios.get(`${API_URL}/accounts-receivable/${clientId}/history`, { params: filters });
        return response.data;
    },

    // Get stats
    getAccountsStats: async () => {
        const response = await axios.get(`${API_URL}/accounts-receivable/stats`);
        return response.data;
    },

    // Get debts (Outflow/Expenses)
    getDebts: async (filters = {}) => {
        const response = await axios.get(`${API_URL}/debts`, { params: filters });
        return response.data;
    },

    // Create Payment Plan
    createPaymentPlan: async (planData) => {
        const response = await axios.post(`${API_URL}/debts/plan`, planData);
        return response.data;
    }
};

// Income Service
export const incomeService = {
    // Get income records
    getIncome: async (filters = {}) => {
        const response = await axios.get(`${API_URL}/income`, { params: filters });
        // Backend returns { success, data, meta }
        return response.data;
    },

    // Create income record
    createIncome: async (incomeData) => {
        const response = await axios.post(`${API_URL}/income`, incomeData);
        return response.data;
    },

    // Update income record
    updateIncome: async (id, incomeData) => {
        const response = await axios.put(`${API_URL}/income/${id}`, incomeData);
        return response.data;
    },

    // Delete income record
    deleteIncome: async (id) => {
        const response = await axios.delete(`${API_URL}/income/${id}`);
        return response.data;
    },

    // Get income statistics
    getIncomeStats: async (dateRange) => {
        const response = await axios.get(`${API_URL}/income/stats`, { params: dateRange });
        return response.data;
    }
};

export default {
    accountsService,
    incomeService
};
