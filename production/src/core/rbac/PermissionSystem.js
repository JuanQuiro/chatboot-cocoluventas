/**
 * Advanced Permission System
 * Sistema de permisos granular por tenant
 */

import logger from '../../utils/logger.js';

// Definición completa de permisos
export const PERMISSIONS = {
    // Dashboard
    'dashboard.view': { name: 'Ver dashboard', category: 'dashboard' },
    'dashboard.export': { name: 'Exportar reportes', category: 'dashboard' },
    
    // Usuarios
    'users.view': { name: 'Ver usuarios', category: 'users' },
    'users.create': { name: 'Crear usuarios', category: 'users' },
    'users.edit': { name: 'Editar usuarios', category: 'users' },
    'users.delete': { name: 'Eliminar usuarios', category: 'users' },
    'users.invite': { name: 'Invitar usuarios', category: 'users' },
    'users.roles': { name: 'Gestionar roles', category: 'users' },
    
    // Vendedores
    'sellers.view': { name: 'Ver vendedores', category: 'sellers' },
    'sellers.create': { name: 'Crear vendedores', category: 'sellers' },
    'sellers.edit': { name: 'Editar vendedores', category: 'sellers' },
    'sellers.delete': { name: 'Eliminar vendedores', category: 'sellers' },
    'sellers.assign': { name: 'Asignar clientes', category: 'sellers' },
    'sellers.stats': { name: 'Ver estadísticas', category: 'sellers' },
    
    // Productos
    'products.view': { name: 'Ver productos', category: 'products' },
    'products.create': { name: 'Crear productos', category: 'products' },
    'products.edit': { name: 'Editar productos', category: 'products' },
    'products.delete': { name: 'Eliminar productos', category: 'products' },
    'products.import': { name: 'Importar productos', category: 'products' },
    'products.export': { name: 'Exportar productos', category: 'products' },
    
    // Órdenes
    'orders.view': { name: 'Ver órdenes', category: 'orders' },
    'orders.create': { name: 'Crear órdenes', category: 'orders' },
    'orders.edit': { name: 'Editar órdenes', category: 'orders' },
    'orders.delete': { name: 'Eliminar órdenes', category: 'orders' },
    'orders.cancel': { name: 'Cancelar órdenes', category: 'orders' },
    'orders.refund': { name: 'Reembolsar órdenes', category: 'orders' },
    'orders.export': { name: 'Exportar órdenes', category: 'orders' },
    
    // Conversaciones
    'conversations.view': { name: 'Ver conversaciones', category: 'conversations' },
    'conversations.reply': { name: 'Responder conversaciones', category: 'conversations' },
    'conversations.assign': { name: 'Asignar conversaciones', category: 'conversations' },
    'conversations.close': { name: 'Cerrar conversaciones', category: 'conversations' },
    'conversations.export': { name: 'Exportar conversaciones', category: 'conversations' },
    
    // Analytics
    'analytics.view': { name: 'Ver analytics', category: 'analytics' },
    'analytics.advanced': { name: 'Analytics avanzado', category: 'analytics' },
    'analytics.export': { name: 'Exportar reportes', category: 'analytics' },
    
    // Configuración
    'settings.view': { name: 'Ver configuración', category: 'settings' },
    'settings.edit': { name: 'Editar configuración', category: 'settings' },
    'settings.billing': { name: 'Gestionar facturación', category: 'settings' },
    'settings.integrations': { name: 'Gestionar integraciones', category: 'settings' },
    
    // Auditoría
    'audit.view': { name: 'Ver auditoría', category: 'audit' },
    'audit.export': { name: 'Exportar auditoría', category: 'audit' },
    'audit.advanced': { name: 'Auditoría avanzada', category: 'audit' },
    
    // Sistema
    'system.debug': { name: 'Modo debug', category: 'system' },
    'system.maintenance': { name: 'Modo mantenimiento', category: 'system' },
    'system.logs': { name: 'Ver logs del sistema', category: 'system' },
    'system.backup': { name: 'Crear backups', category: 'system' },
    
    // Bots (Chatbots)
    'bots.view': { name: 'Ver bots', category: 'bots' },
    'bots.create': { name: 'Crear bots', category: 'bots' },
    'bots.manage': { name: 'Iniciar/Detener bots', category: 'bots' },
    'bots.delete': { name: 'Eliminar bots', category: 'bots' },
    'bots.send': { name: 'Enviar mensajes', category: 'bots' },
    'bots.configure': { name: 'Configurar bots', category: 'bots' },
};

// Roles predefinidos por tenant
export const DEFAULT_ROLES = {
    owner: {
        name: 'Owner',
        description: 'Dueño del negocio - Acceso total',
        permissions: Object.keys(PERMISSIONS),
        isSystem: true,
        canBeDeleted: false
    },
    admin: {
        name: 'Administrador',
        description: 'Administrador con casi todos los permisos',
        permissions: [
            'dashboard.view', 'dashboard.export',
            'users.view', 'users.create', 'users.edit', 'users.invite',
            'sellers.view', 'sellers.create', 'sellers.edit', 'sellers.assign', 'sellers.stats',
            'products.view', 'products.create', 'products.edit', 'products.import', 'products.export',
            'orders.view', 'orders.create', 'orders.edit', 'orders.cancel',
            'conversations.view', 'conversations.reply', 'conversations.assign',
            'analytics.view', 'analytics.advanced',
            'settings.view', 'settings.edit',
            'audit.view',
            'bots.view', 'bots.create', 'bots.manage', 'bots.send', 'bots.configure'
        ],
        isSystem: true,
        canBeDeleted: false
    },
    manager: {
        name: 'Gerente',
        description: 'Gerente de operaciones',
        permissions: [
            'dashboard.view',
            'users.view',
            'sellers.view', 'sellers.edit', 'sellers.assign', 'sellers.stats',
            'products.view', 'products.edit',
            'orders.view', 'orders.create', 'orders.edit',
            'conversations.view', 'conversations.reply', 'conversations.assign',
            'analytics.view',
            'bots.view', 'bots.manage', 'bots.send'
        ],
        isSystem: true,
        canBeDeleted: false
    },
    agent: {
        name: 'Agente',
        description: 'Agente de ventas',
        permissions: [
            'dashboard.view',
            'sellers.view',
            'products.view',
            'orders.view', 'orders.create',
            'conversations.view', 'conversations.reply'
        ],
        isSystem: true,
        canBeDeleted: false
    },
    viewer: {
        name: 'Visualizador',
        description: 'Solo lectura',
        permissions: [
            'dashboard.view',
            'sellers.view',
            'products.view',
            'orders.view',
            'conversations.view',
            'analytics.view'
        ],
        isSystem: true,
        canBeDeleted: false
    }
};

class PermissionSystem {
    constructor() {
        this.tenantRoles = new Map(); // tenant -> roles
        this.tenantPermissions = new Map(); // tenant -> custom permissions
    }

    /**
     * Inicializar roles para un tenant
     */
    initializeTenant(tenantId) {
        if (!this.tenantRoles.has(tenantId)) {
            this.tenantRoles.set(tenantId, new Map(Object.entries(DEFAULT_ROLES)));
            logger.info(`Roles initialized for tenant: ${tenantId}`);
        }
    }

    /**
     * Crear rol personalizado
     */
    createRole(tenantId, roleData) {
        this.initializeTenant(tenantId);
        
        const roles = this.tenantRoles.get(tenantId);
        
        if (roles.has(roleData.id)) {
            throw new Error('Role already exists');
        }

        const role = {
            id: roleData.id,
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions || [],
            isSystem: false,
            canBeDeleted: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        roles.set(roleData.id, role);
        
        logger.info(`Role created: ${roleData.name} for tenant ${tenantId}`);
        return role;
    }

    /**
     * Actualizar rol
     */
    updateRole(tenantId, roleId, updates) {
        this.initializeTenant(tenantId);
        
        const roles = this.tenantRoles.get(tenantId);
        const role = roles.get(roleId);

        if (!role) {
            throw new Error('Role not found');
        }

        if (role.isSystem) {
            throw new Error('Cannot modify system role');
        }

        Object.assign(role, {
            ...updates,
            updatedAt: new Date()
        });

        logger.info(`Role updated: ${roleId} for tenant ${tenantId}`);
        return role;
    }

    /**
     * Eliminar rol
     */
    deleteRole(tenantId, roleId) {
        this.initializeTenant(tenantId);
        
        const roles = this.tenantRoles.get(tenantId);
        const role = roles.get(roleId);

        if (!role) {
            throw new Error('Role not found');
        }

        if (!role.canBeDeleted) {
            throw new Error('Cannot delete this role');
        }

        roles.delete(roleId);
        logger.info(`Role deleted: ${roleId} for tenant ${tenantId}`);
    }

    /**
     * Obtener rol
     */
    getRole(tenantId, roleId) {
        this.initializeTenant(tenantId);
        return this.tenantRoles.get(tenantId)?.get(roleId);
    }

    /**
     * Listar roles del tenant
     */
    listRoles(tenantId) {
        this.initializeTenant(tenantId);
        return Array.from(this.tenantRoles.get(tenantId).values());
    }

    /**
     * Verificar permiso
     */
    hasPermission(tenantId, roleId, permission) {
        const role = this.getRole(tenantId, roleId);
        return role?.permissions?.includes(permission) || false;
    }

    /**
     * Verificar múltiples permisos (AND)
     */
    hasAllPermissions(tenantId, roleId, permissions) {
        return permissions.every(p => this.hasPermission(tenantId, roleId, p));
    }

    /**
     * Verificar múltiples permisos (OR)
     */
    hasAnyPermission(tenantId, roleId, permissions) {
        return permissions.some(p => this.hasPermission(tenantId, roleId, p));
    }

    /**
     * Obtener permisos de un rol
     */
    getRolePermissions(tenantId, roleId) {
        const role = this.getRole(tenantId, roleId);
        return role?.permissions || [];
    }

    /**
     * Agregar permiso a rol
     */
    addPermissionToRole(tenantId, roleId, permission) {
        const role = this.getRole(tenantId, roleId);
        
        if (!role) {
            throw new Error('Role not found');
        }

        if (role.isSystem) {
            throw new Error('Cannot modify system role');
        }

        if (!role.permissions.includes(permission)) {
            role.permissions.push(permission);
            role.updatedAt = new Date();
        }

        return role;
    }

    /**
     * Remover permiso de rol
     */
    removePermissionFromRole(tenantId, roleId, permission) {
        const role = this.getRole(tenantId, roleId);
        
        if (!role) {
            throw new Error('Role not found');
        }

        if (role.isSystem) {
            throw new Error('Cannot modify system role');
        }

        role.permissions = role.permissions.filter(p => p !== permission);
        role.updatedAt = new Date();

        return role;
    }

    /**
     * Obtener permisos agrupados por categoría
     */
    getPermissionsByCategory() {
        const grouped = {};
        
        Object.entries(PERMISSIONS).forEach(([key, value]) => {
            if (!grouped[value.category]) {
                grouped[value.category] = [];
            }
            grouped[value.category].push({
                key,
                name: value.name
            });
        });

        return grouped;
    }
}

// Singleton
const permissionSystem = new PermissionSystem();

export default permissionSystem;
