// API Service Layer - Clean Architecture
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('cocolu_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('cocolu_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Meta API
export const metaApi = {
    getConfig: () => api.get('/meta/config'),
    saveConfig: (data) => api.post('/meta/config', data),
    testMessage: (data) => api.post('/meta/test-message', data),
    getBilling: (params) => api.get('/meta/billing/summary', { params }),
    getBillingHistory: (params) => api.get('/meta/billing/history', { params }),
    getMonthlyStats: (months = 6) => api.get(`/meta/billing/monthly?months=${months}`)
};

// Messages API
export const messagesApi = {
    getAll: () => api.get('/open/messages'),
    getEvents: () => new EventSource('/api/events')
};

// Dashboard API
export const dashboardApi = {
    getSummary: () => api.get('/dashboard'),
    getHealth: () => api.get('/health')
};

// Analytics API
export const analyticsApi = {
    getMetrics: () => api.get('/analytics/metrics'),
    getSummary: () => api.get('/analytics/summary')
    // getEvents removed - was being blocked by adblockers
};

// Logs API
export const logsApi = {
    getRecent: (params) => api.get('/logs/recent', { params }),
    sendBatch: (logs) => api.post('/logs/batch', { logs })
};

// Connection API
export const connectionApi = {
    getPairingCode: () => api.get('/open/pairing-code'),
    getQR: () => api.get('/connection/qr')
};

export default api;
