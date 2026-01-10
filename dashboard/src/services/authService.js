/**
 * Authentication Service
 * Maneja toda la lógica de autenticación con el backend
 */

import apiClient from './api';

class AuthService {
    /**
     * Login
     */
    async login(email, password) {
        try {
            // apiClient interceptor ya retorna response.data, así que response ES el data
            const response = await apiClient.post('/login', {
                email,
                password,
            });

            // response ya es el objeto { success, token, user }
            const { token, refreshToken, user } = response;

            // Guardar en localStorage
            if (token) {
                localStorage.setItem('cocolu_token', token);
            }
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
                if (user.tenantId) {
                    localStorage.setItem('tenantId', user.tenantId);
                }
            }

            return {
                success: true,
                user,
                token,
            };
        } catch (error) {
            console.error('❌ [authService] Login error:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Error al iniciar sesión',
            };
        }
    }

    /**
     * Login mock para desarrollo
     */
    async loginMock(email, password) {
        // Simulación de delay de red
        await new Promise(resolve => setTimeout(resolve, 500));

        if (email && password) {
            const mockUser = {
                id: '1',
                email: email,
                name: email.split('@')[0],
                role: email.includes('admin') ? 'admin' : 'agent',
                tenantId: 'cocolu',
                permissions: this.getMockPermissions(email),
                avatar: null,
                status: 'active',
            };

            const mockToken = 'mock-jwt-token-' + Date.now();

            localStorage.setItem('user', JSON.stringify(mockUser));
            localStorage.setItem('cocolu_token', mockToken);
            localStorage.setItem('tenantId', mockUser.tenantId);

            return { success: true, user: mockUser, token: mockToken };
        }

        return { success: false, error: 'Credenciales inválidas' };
    }

    /**
     * Obtener permisos mock según el email
     */
    getMockPermissions(email) {
        // En desarrollo, TODOS tienen permisos completos de admin
        // Esto evita problemas de acceso mientras se prueba el sistema
        const fullPermissions = [
            'dashboard.view', 'dashboard.export',
            'users.view', 'users.create', 'users.edit', 'users.delete', 'users.invite', 'users.roles',
            'sellers.view', 'sellers.create', 'sellers.edit', 'sellers.delete', 'sellers.assign', 'sellers.stats',
            'products.view', 'products.create', 'products.edit', 'products.delete',
            'orders.view', 'orders.create', 'orders.edit', 'orders.cancel',
            'conversations.view', 'conversations.reply', 'conversations.assign',
            'analytics.view', 'analytics.advanced',
            'settings.view', 'settings.edit',
            'bots.view', 'bots.create', 'bots.manage', 'bots.delete', 'bots.send', 'bots.configure',
            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
        ];

        // En desarrollo, todos son admin para facilitar testing
        return fullPermissions;

        /* Para producción, descomentar esto:
        if (email.includes('admin')) {
            return fullPermissions;
        }
        
        if (email.includes('manager')) {
            return [
                'dashboard.view',
                'sellers.view', 'sellers.edit', 'sellers.assign',
                'products.view', 'products.edit',
                'orders.view', 'orders.create', 'orders.edit',
                'conversations.view', 'conversations.reply',
                'analytics.view',
                'bots.view', 'bots.manage', 'bots.send',
            ];
        }

        // Agent por defecto
        return [
            'dashboard.view',
            'products.view',
            'orders.view', 'orders.create',
            'conversations.view', 'conversations.reply',
        ];
        */
    }

    /**
     * Logout
     */
    async logout() {
        try {
            // Llamar al backend para invalidar el token
            await apiClient.post('/logout');
        } catch (error) {
            // No importa si falla, limpiamos localStorage de todos modos
        } finally {
            this.clearLocalStorage();
        }
    }

    /**
     * Limpiar localStorage
     */
    clearLocalStorage() {
        localStorage.removeItem('cocolu_token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tenantId');
    }

    /**
     * Refresh token
     */
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token');
            }

            const response = await apiClient.post('/auth/refresh', {
                refreshToken,
            });

            const { token, user } = response.data;

            localStorage.setItem('cocolu_token', token);
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }

            return { success: true, token, user };
        } catch (error) {
            this.clearLocalStorage();
            return { success: false, error: 'Session expired' };
        }
    }

    /**
     * Obtener usuario actual
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    /**
     * Verificar si está autenticado
     */
    isAuthenticated() {
        const token = localStorage.getItem('cocolu_token');
        const user = this.getCurrentUser();
        return !!(token && user);
    }

    /**
     * Obtener perfil actualizado
     */
    async getProfile() {
        try {
            const response = await apiClient.get('/auth/profile');
            const user = response.data;

            // Actualizar localStorage
            localStorage.setItem('user', JSON.stringify(user));

            return { success: true, user };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener perfil',
            };
        }
    }

    /**
     * Actualizar perfil
     */
    async updateProfile(data) {
        try {
            const response = await apiClient.put('/auth/profile', data);
            const user = response.data;

            // Actualizar localStorage
            localStorage.setItem('user', JSON.stringify(user));

            return { success: true, user };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al actualizar perfil',
            };
        }
    }

    /**
     * Cambiar contraseña
     */
    async changePassword(currentPassword, newPassword) {
        try {
            await apiClient.post('/auth/change-password', {
                currentPassword,
                newPassword,
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al cambiar contraseña',
            };
        }
    }
}

// Singleton
const authService = new AuthService();

export default authService;
