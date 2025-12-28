/**
 * useRole Hook
 * Hook personalizado para trabajar con roles de usuario
 */

import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para verificar y trabajar con roles
 * @returns {Object} Objeto con información y verificación de roles
 */
export const useRole = () => {
    const { user, hasRole, role } = useAuth();

    /**
     * Verificar si es Owner
     */
    const isOwner = () => {
        return hasRole('owner');
    };

    /**
     * Verificar si es Admin (incluyendo Owner)
     */
    const isAdmin = () => {
        return hasRole(['owner', 'admin']);
    };

    /**
     * Verificar si es Manager o superior
     */
    const isManager = () => {
        return hasRole(['owner', 'admin', 'manager']);
    };

    /**
     * Verificar si es Agent
     */
    const isAgent = () => {
        return hasRole('agent');
    };

    /**
     * Verificar si es Viewer (solo lectura)
     */
    const isViewer = () => {
        return hasRole('viewer');
    };

    /**
     * Obtener nombre legible del rol
     */
    const getRoleName = () => {
        const roleNames = {
            owner: 'Owner',
            admin: 'Administrador',
            manager: 'Gerente',
            agent: 'Agente',
            viewer: 'Visualizador',
        };
        return roleNames[role] || role;
    };

    /**
     * Obtener color del badge del rol
     */
    const getRoleColor = () => {
        const roleColors = {
            owner: 'purple',
            admin: 'blue',
            manager: 'green',
            agent: 'yellow',
            viewer: 'gray',
        };
        return roleColors[role] || 'gray';
    };

    /**
     * Verificar si puede gestionar usuarios
     */
    const canManageUsers = () => {
        return isAdmin();
    };

    /**
     * Verificar si puede ver todos los datos
     */
    const canViewAll = () => {
        return hasRole(['owner', 'admin', 'manager']);
    };

    /**
     * Verificar si está limitado a sus propios datos
     */
    const isLimitedToOwnData = () => {
        return hasRole(['agent', 'viewer']);
    };

    return {
        // Rol actual
        role,
        roleName: getRoleName(),
        roleColor: getRoleColor(),
        
        // Verificaciones
        hasRole,
        isOwner: isOwner(),
        isAdmin: isAdmin(),
        isManager: isManager(),
        isAgent: isAgent(),
        isViewer: isViewer(),
        
        // Capacidades
        canManageUsers: canManageUsers(),
        canViewAll: canViewAll(),
        isLimitedToOwnData: isLimitedToOwnData(),
        
        // Usuario
        user,
    };
};

export default useRole;
