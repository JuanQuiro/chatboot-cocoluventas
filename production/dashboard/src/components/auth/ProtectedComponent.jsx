/**
 * ProtectedComponent
 * Envoltorio para proteger componentes completos basado en permisos
 * 
 * Uso:
 * <ProtectedComponent permission="users.view">
 *   <UsersTable />
 * </ProtectedComponent>
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedComponent = ({ 
    permission,
    permissions = [],
    role,
    roles = [],
    requireAll = false,
    fallback = null,
    unauthorizedMessage = 'No tienes permisos para ver este contenido',
    children 
}) => {
    console.log('🔒 [ProtectedComponent] Verificando permisos:', { permission, permissions, role, roles });
    
    const { 
        hasPermission, 
        hasAllPermissions, 
        hasAnyPermission, 
        hasRole,
        user 
    } = useAuth();
    
    console.log('👤 [ProtectedComponent] Usuario actual:', user);
    console.log('🔑 [ProtectedComponent] Permisos del usuario:', user?.permissions);

    // Verificar rol
    if (role || roles.length > 0) {
        const rolesToCheck = role ? [role] : roles;
        const hasRequiredRole = rolesToCheck.some(r => hasRole(r));
        
        if (!hasRequiredRole) {
            return fallback || (
                <div className="flex items-center justify-center p-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Acceso Restringido
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>{unauthorizedMessage}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // Verificar permiso único
    if (permission) {
        const hasAccess = hasPermission(permission);
        console.log(`🔐 [ProtectedComponent] Verificando permiso único "${permission}": ${hasAccess ? '✅ PERMITIDO' : '❌ DENEGADO'}`);
        
        if (!hasAccess) {
            console.error(`🚫 [ProtectedComponent] ACCESO DENEGADO - Permiso requerido: ${permission}`);
            return fallback || (
            <div className="flex items-center justify-center p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Sin Permisos
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{unauthorizedMessage}</p>
                                <p className="mt-1 text-xs">Permiso requerido: <code className="bg-red-100 px-1 rounded">{permission}</code></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            );
        }
    }

    // Verificar múltiples permisos
    if (permissions.length > 0) {
        const hasRequiredPermissions = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);

        if (!hasRequiredPermissions) {
            return fallback || (
                <div className="flex items-center justify-center p-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Permisos Insuficientes
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{unauthorizedMessage}</p>
                                    <p className="mt-1 text-xs">
                                        Se requiere{requireAll ? 'n todos' : ' al menos uno de'} los permisos
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    console.log('✅ [ProtectedComponent] Acceso permitido - Renderizando children');
    return <>{children}</>;
};

export default ProtectedComponent;
