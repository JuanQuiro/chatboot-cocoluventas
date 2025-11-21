/**
 * API Service - Base configuration
 * Servicio centralizado para todas las llamadas a la API
 */

import axios from 'axios';

// Configuración base
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Crear instancia de axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token a todas las peticiones
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Agregar tenant si existe
        const tenantId = localStorage.getItem('tenantId');
        if (tenantId) {
            config.headers['X-Tenant-ID'] = tenantId;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            // Solo desloguear si hay un token (usuario estaba autenticado)
            const hadToken = localStorage.getItem('token');

            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Solo redirigir si no estamos ya en login Y teníamos un token
            if (hadToken && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
