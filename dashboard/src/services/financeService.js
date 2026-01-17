
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3009/api';

const getHeaders = () => {
    const token = localStorage.getItem('cocolu_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const financeService = {
    // --- EXPENSES (Gastos/Deudas Cocolu) ---
    getExpenses: async (filters = {}) => {
        const query = new URLSearchParams(filters).toString();
        const res = await fetch(`${API_URL}/finance/expenses?${query}`, { headers: getHeaders() });
        return await res.json();
    },

    createExpense: async (data) => {
        const res = await fetch(`${API_URL}/finance/expenses`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    registerPayment: async (id, amount) => {
        const res = await fetch(`${API_URL}/finance/expenses/${id}/pay`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ amount })
        });
        return await res.json();
    },

    // --- INCOME (Ingresos) ---
    getIncomeSummary: async (start, end) => {
        const query = new URLSearchParams({ start, end }).toString();
        const res = await fetch(`${API_URL}/finance/income/summary?${query}`, { headers: getHeaders() });
        return await res.json();
    },

    getIncomes: async (filters = {}) => {
        const query = new URLSearchParams(filters).toString();
        const res = await fetch(`${API_URL}/finance/income?${query}`, { headers: getHeaders() });
        return await res.json();
    },

    createIncome: async (data) => {
        const res = await fetch(`${API_URL}/finance/income`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    // --- MANUFACTURERS (Workload) ---
    getManufacturersWorkload: async () => {
        const res = await fetch(`${API_URL}/finance/manufacturers`, { headers: getHeaders() });
        return await res.json();
    },

    // --- COMMISSIONS ---
    getSellerCommissionRate: async (sellerId) => {
        const res = await fetch(`${API_URL}/finance/commissions/seller/${sellerId}`, { headers: getHeaders() });
        return await res.json();
    },

    updateCommissionRate: async (offsetData) => {
        const res = await fetch(`${API_URL}/finance/commissions/config`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(offsetData)
        });
        return await res.json();
    }
};
