/**
 * RBAC - Sistema de Roles y Permisos
 * MEJORA: Control granular de acceso
 */

export const ROLES = {
    ADMIN: 'admin',           // Acceso total + modo técnico
    MANAGER: 'manager',       // Gestión + algunas opciones técnicas
    USER: 'user',            // Solo modo simple
    AUDITOR: 'auditor',      // Solo lectura + auditoría avanzada
    TECHNICAL: 'technical'   // Modo técnico completo
};

export const PERMISSIONS = {
    // BÁSICAS (Todos)
    'dashboard.view': 'Ver dashboard',
    'orders.view': 'Ver órdenes',
    'products.view': 'Ver productos',
    
    // GESTIÓN (Manager+)
    'orders.create': 'Crear órdenes',
    'orders.edit': 'Editar órdenes',
    'sellers.assign': 'Asignar vendedores',
    
    // AVANZADAS (Admin+)
    'sellers.create': 'Crear vendedores',
    'sellers.delete': 'Eliminar vendedores',
    'settings.edit': 'Editar configuración',
    
    // TÉCNICAS (Admin + Technical)
    'system.debug': 'Modo debug',
    'system.logs': 'Ver logs del sistema',
    'system.metrics': 'Ver métricas técnicas',
    'system.manual_override': 'Control manual del sistema',
    'api.direct_access': 'Acceso directo a API',
    'database.query': 'Ejecutar queries',
    
    // AUDITORÍA (Auditor + Admin)
    'audit.view': 'Ver auditoría',
    'audit.export': 'Exportar auditoría',
    'audit.advanced': 'Auditoría avanzada',
};

export const ROLE_PERMISSIONS = {
    [ROLES.USER]: [
        'dashboard.view',
        'orders.view',
        'products.view',
    ],
    
    [ROLES.MANAGER]: [
        'dashboard.view',
        'orders.view',
        'orders.create',
        'orders.edit',
        'products.view',
        'sellers.assign',
    ],
    
    [ROLES.AUDITOR]: [
        'dashboard.view',
        'orders.view',
        'products.view',
        'audit.view',
        'audit.export',
        'audit.advanced',
        'system.logs',
    ],
    
    [ROLES.TECHNICAL]: [
        'dashboard.view',
        'orders.view',
        'products.view',
        'system.debug',
        'system.logs',
        'system.metrics',
        'system.manual_override',
        'api.direct_access',
        'database.query',
    ],
    
    [ROLES.ADMIN]: Object.keys(PERMISSIONS), // Todos los permisos
};

/**
 * Verificar si un rol tiene un permiso
 */
export function hasPermission(role, permission) {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    return rolePermissions.includes(permission);
}

/**
 * Obtener todos los permisos de un rol
 */
export function getRolePermissions(role) {
    return ROLE_PERMISSIONS[role] || [];
}

/**
 * Verificar si es un rol técnico
 */
export function isTechnicalRole(role) {
    return [ROLES.ADMIN, ROLES.TECHNICAL].includes(role);
}

/**
 * Verificar si puede ver auditoría avanzada
 */
export function canViewAdvancedAudit(role) {
    return hasPermission(role, 'audit.advanced');
}
