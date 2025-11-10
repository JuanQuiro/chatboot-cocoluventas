/**
 * User Service
 * Gestión de usuarios y roles
 */

import apiClient from './api';

class UserService {
    /**
     * Obtener todos los usuarios del tenant
     */
    async getUsers(filters = {}) {
        try {
            const response = await apiClient.get('/users', { params: filters });
            return {
                success: true,
                users: response.data.users || response.data,
                total: response.data.total,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener usuarios',
            };
        }
    }

    /**
     * Obtener usuario por ID
     */
    async getUser(userId) {
        try {
            const response = await apiClient.get(`/users/${userId}`);
            return {
                success: true,
                user: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener usuario',
            };
        }
    }

    /**
     * Crear usuario
     */
    async createUser(userData) {
        try {
            const response = await apiClient.post('/users', userData);
            return {
                success: true,
                user: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al crear usuario',
            };
        }
    }

    /**
     * Actualizar usuario
     */
    async updateUser(userId, userData) {
        try {
            const response = await apiClient.put(`/users/${userId}`, userData);
            return {
                success: true,
                user: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al actualizar usuario',
            };
        }
    }

    /**
     * Eliminar usuario
     */
    async deleteUser(userId) {
        try {
            await apiClient.delete(`/users/${userId}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al eliminar usuario',
            };
        }
    }

    /**
     * Invitar usuario
     */
    async inviteUser(inviteData) {
        try {
            const response = await apiClient.post('/users/invite', inviteData);
            return {
                success: true,
                user: response.data.user,
                invitationLink: response.data.invitationLink,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al invitar usuario',
            };
        }
    }

    /**
     * Cambiar rol de usuario
     */
    async changeUserRole(userId, newRole) {
        try {
            const response = await apiClient.patch(`/users/${userId}/role`, {
                role: newRole,
            });
            return {
                success: true,
                user: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al cambiar rol',
            };
        }
    }

    /**
     * Actualizar permisos personalizados
     */
    async updateUserPermissions(userId, permissions) {
        try {
            const response = await apiClient.patch(`/users/${userId}/permissions`, {
                permissions,
            });
            return {
                success: true,
                user: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al actualizar permisos',
            };
        }
    }

    /**
     * Suspender/Activar usuario
     */
    async toggleUserStatus(userId, status) {
        try {
            const response = await apiClient.patch(`/users/${userId}/status`, {
                status,
            });
            return {
                success: true,
                user: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al cambiar estado',
            };
        }
    }

    /**
     * Obtener roles disponibles
     */
    async getRoles() {
        try {
            const response = await apiClient.get('/users/roles');
            return {
                success: true,
                roles: response.data.roles || response.data,
            };
        } catch (error) {
            // Si falla, devolver roles por defecto
            return {
                success: true,
                roles: this.getDefaultRoles(),
            };
        }
    }

    /**
     * Roles por defecto (fallback)
     */
    getDefaultRoles() {
        return [
            {
                id: 'owner',
                name: 'Owner',
                description: 'Dueño del negocio - Acceso total',
                isSystem: true,
                permissions: [],
            },
            {
                id: 'admin',
                name: 'Administrador',
                description: 'Administrador con casi todos los permisos',
                isSystem: true,
                permissions: [],
            },
            {
                id: 'manager',
                name: 'Gerente',
                description: 'Gerente de operaciones',
                isSystem: true,
                permissions: [],
            },
            {
                id: 'agent',
                name: 'Agente',
                description: 'Agente de ventas',
                isSystem: true,
                permissions: [],
            },
            {
                id: 'viewer',
                name: 'Visualizador',
                description: 'Solo lectura',
                isSystem: true,
                permissions: [],
            },
        ];
    }

    /**
     * Obtener todos los permisos disponibles
     */
    async getPermissions() {
        try {
            const response = await apiClient.get('/users/permissions');
            return {
                success: true,
                permissions: response.data.permissions || response.data,
            };
        } catch (error) {
            return {
                success: true,
                permissions: this.getDefaultPermissions(),
            };
        }
    }

    /**
     * Permisos por defecto (fallback)
     */
    getDefaultPermissions() {
        return {
            dashboard: [
                { key: 'dashboard.view', name: 'Ver dashboard' },
                { key: 'dashboard.export', name: 'Exportar reportes' },
            ],
            users: [
                { key: 'users.view', name: 'Ver usuarios' },
                { key: 'users.create', name: 'Crear usuarios' },
                { key: 'users.edit', name: 'Editar usuarios' },
                { key: 'users.delete', name: 'Eliminar usuarios' },
                { key: 'users.invite', name: 'Invitar usuarios' },
                { key: 'users.roles', name: 'Gestionar roles' },
            ],
            sellers: [
                { key: 'sellers.view', name: 'Ver vendedores' },
                { key: 'sellers.create', name: 'Crear vendedores' },
                { key: 'sellers.edit', name: 'Editar vendedores' },
                { key: 'sellers.delete', name: 'Eliminar vendedores' },
                { key: 'sellers.assign', name: 'Asignar clientes' },
                { key: 'sellers.stats', name: 'Ver estadísticas' },
            ],
            products: [
                { key: 'products.view', name: 'Ver productos' },
                { key: 'products.create', name: 'Crear productos' },
                { key: 'products.edit', name: 'Editar productos' },
                { key: 'products.delete', name: 'Eliminar productos' },
            ],
            orders: [
                { key: 'orders.view', name: 'Ver órdenes' },
                { key: 'orders.create', name: 'Crear órdenes' },
                { key: 'orders.edit', name: 'Editar órdenes' },
                { key: 'orders.cancel', name: 'Cancelar órdenes' },
            ],
            conversations: [
                { key: 'conversations.view', name: 'Ver conversaciones' },
                { key: 'conversations.reply', name: 'Responder conversaciones' },
                { key: 'conversations.assign', name: 'Asignar conversaciones' },
            ],
            analytics: [
                { key: 'analytics.view', name: 'Ver analytics' },
                { key: 'analytics.advanced', name: 'Analytics avanzado' },
            ],
            settings: [
                { key: 'settings.view', name: 'Ver configuración' },
                { key: 'settings.edit', name: 'Editar configuración' },
            ],
        };
    }

    /**
     * Crear rol personalizado
     */
    async createRole(roleData) {
        try {
            const response = await apiClient.post('/users/roles', roleData);
            return {
                success: true,
                role: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al crear rol',
            };
        }
    }

    /**
     * Actualizar rol
     */
    async updateRole(roleId, roleData) {
        try {
            const response = await apiClient.put(`/users/roles/${roleId}`, roleData);
            return {
                success: true,
                role: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al actualizar rol',
            };
        }
    }

    /**
     * Eliminar rol
     */
    async deleteRole(roleId) {
        try {
            await apiClient.delete(`/users/roles/${roleId}`);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Error al eliminar rol',
            };
        }
    }
}

// Singleton
const userService = new UserService();

export default userService;
