/**
 * usePermissions Hook
 * Hook personalizado para verificar permisos de manera declarativa
 */

import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para verificar permisos
 * @returns {Object} Objeto con funciones de verificación de permisos
 */
export const usePermissions = () => {
    const { 
        hasPermission, 
        hasAllPermissions, 
        hasAnyPermission,
        permissions,
        user 
    } = useAuth();

    /**
     * Verificar si puede ver
     */
    const canView = (resource) => {
        return hasPermission(`${resource}.view`);
    };

    /**
     * Verificar si puede crear
     */
    const canCreate = (resource) => {
        return hasPermission(`${resource}.create`);
    };

    /**
     * Verificar si puede editar
     */
    const canEdit = (resource) => {
        return hasPermission(`${resource}.edit`);
    };

    /**
     * Verificar si puede eliminar
     */
    const canDelete = (resource) => {
        return hasPermission(`${resource}.delete`);
    };

    /**
     * Verificar múltiples acciones en un recurso
     */
    const canAccess = (resource, actions = []) => {
        if (actions.length === 0) {
            return canView(resource);
        }

        const permissionsToCheck = actions.map(action => `${resource}.${action}`);
        return hasAnyPermission(permissionsToCheck);
    };

    /**
     * Verificar si tiene acceso completo a un recurso
     */
    const hasFullAccess = (resource) => {
        const fullPermissions = [
            `${resource}.view`,
            `${resource}.create`,
            `${resource}.edit`,
            `${resource}.delete`,
        ];
        return hasAllPermissions(fullPermissions);
    };

    return {
        // Permisos individuales
        hasPermission,
        hasAllPermissions,
        hasAnyPermission,
        
        // Helpers por recurso
        canView,
        canCreate,
        canEdit,
        canDelete,
        canAccess,
        hasFullAccess,
        
        // Estado
        permissions,
        isOwner: user?.role === 'owner',
        isAdmin: user?.role === 'admin' || user?.role === 'owner',
    };
};

export default usePermissions;
