// API Service Layer - Clean Architecture
import axios from 'axios';
import { httpLogger } from '../utils/httpLogger';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor with HTTP logging
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('cocolu_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Log request details
        httpLogger.logRequest(config);
        return config;
    },
    (error) => {
        httpLogger.logError(error);
        return Promise.reject(error);
    }
);

// Response interceptor with HTTP logging
api.interceptors.response.use(
    (response) => {
        // Log response details
        httpLogger.logResponse(response);
        // Return response data for consistency
        return response.data;
    },
    (error) => {
        // Suprimir errores 404 de endpoints de WhatsApp que no están implementados
        const whatsappEndpoints = [
            '/connection/qr',
            '/open/pairing-code',
            '/open/messages',
            '/api/events',
            '/logs/batch'
        ];

        const is404 = error.response?.status === 404;
        const isWhatsAppEndpoint = whatsappEndpoints.some(endpoint =>
            error.config?.url?.includes(endpoint)
        );

        // Si es un 404 de endpoint de WhatsApp, retornar null silenciosamente
        if (is404 && isWhatsAppEndpoint) {
            console.log(`[API] Endpoint no disponible (esperado): ${error.config?.url}`);
            return Promise.resolve(null);
        }

        // Log otros errores normalmente
        httpLogger.logError(error);

        if (error.response?.status === 401) {
            // Remove token first
            localStorage.removeItem('cocolu_token');

            // Only redirect if we're not already on login page
            if (window.location.pathname !== '/login') {
                // Small delay to ensure token is removed
                setTimeout(() => {
                    window.location.href = '/login';
                }, 100);
            }
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
