/**
 * Can Component
 * Componente declarativo para mostrar contenido basado en permisos
 * 
 * Uso:
 * <Can permission="users.create">
 *   <button>Crear Usuario</button>
 * </Can>
 * 
 * <Can permissions={['users.edit', 'users.delete']} requireAll>
 *   <button>Editar y Eliminar</button>
 * </Can>
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Can = ({ 
    permission,
    permissions = [],
    role,
    roles = [],
    requireAll = false,
    fallback = null,
    children 
}) => {
    const { hasPermission, hasAllPermissions, hasAnyPermission, hasRole } = useAuth();

    // Verificar rol si se especifica
    if (role || roles.length > 0) {
        const rolesToCheck = role ? [role] : roles;
        const hasRequiredRole = rolesToCheck.some(r => hasRole(r));
        
        if (!hasRequiredRole) {
            return fallback;
        }
    }

    // Verificar permiso único
    if (permission) {
        if (!hasPermission(permission)) {
            return fallback;
        }
        return <>{children}</>;
    }

    // Verificar múltiples permisos
    if (permissions.length > 0) {
        const hasRequiredPermissions = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);

        if (!hasRequiredPermissions) {
            return fallback;
        }
    }

    return <>{children}</>;
};

export default Can;
