import axios from 'axios';

const API_BASE_URL = 'http://localhost:3009/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

// Servicios específicos
export const botsAPI = {
  getAll: () => apiClient.get('/bots'),
  getById: (id) => apiClient.get(`/bots/${id}`),
  create: (data) => apiClient.post('/bots', data),
  update: (id, data) => apiClient.put(`/bots/${id}`, data),
  delete: (id) => apiClient.delete(`/bots/${id}`),
};

export const ordersAPI = {
  getAll: () => apiClient.get('/orders'),
  getStats: () => apiClient.get('/orders/stats'),
};

export const analyticsAPI = {
  getMetrics: () => apiClient.get('/analytics/metrics'),
  getRevenue: (period) => apiClient.get(`/analytics/revenue?period=${period}`),
};
