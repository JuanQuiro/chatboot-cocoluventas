/**
 * AuthContext - Sistema avanzado de autenticación
 * Incluye manejo de roles, permisos, y gestión completa de sesión
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState([]);

    /**
     * Inicializar autenticación desde localStorage
     */
    const initializeAuth = useCallback(() => {
        const savedUser = authService.getCurrentUser();
        const token = localStorage.getItem('cocolu_token');

        if (savedUser && token) {
            setUser(savedUser);
            setPermissions(savedUser.permissions || []);
        }

        setLoading(false);
    }, []);

    // Inicializar desde localStorage
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    /**
     * Login - Usa mock en desarrollo, backend en producción
     */
    const login = async (email, password) => {
        try {
            setLoading(true);

            // En desarrollo, usar siempre mock
            const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

            let result;

            if (isDevelopment) {
                // Modo desarrollo - usar mock directo
                result = await authService.loginMock(email, password);
            } else {
                // Modo producción - intentar backend real
                result = await authService.login(email, password);

                // Fallback a mock si falla
                if (!result.success) {
                    result = await authService.loginMock(email, password);
                }
            }

            if (result.success) {
                setUser(result.user);
                setPermissions(result.user.permissions || []);
            }

            setLoading(false);
            return result;
        } catch (error) {
            // Fallback a mock en caso de error
            const mockResult = await authService.loginMock(email, password);
            if (mockResult.success) {
                setUser(mockResult.user);
                setPermissions(mockResult.user.permissions || []);
            }
            setLoading(false);
            return mockResult;
        }
    };

    /**
     * Logout
     */
    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
        setPermissions([]);
    }, []);

    /**
     * Verificar si está autenticado
     */
    const isAuthenticated = useCallback(() => {
        return !!user && !!localStorage.getItem('cocolu_token');
    }, [user]);

    /**
     * Verificar si el usuario tiene un rol específico
     */
    const hasRole = useCallback((role) => {
        if (!user) return false;
        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
    }, [user]);

    /**
     * Verificar si el usuario tiene un permiso específico
     */
    const hasPermission = useCallback((permission) => {
        console.log(`🔐 [hasPermission] Verificando permiso: "${permission}"`);
        console.log(`👤 [hasPermission] Usuario:`, user);
        console.log(`🔑 [hasPermission] Permisos actuales:`, permissions);

        if (!user) {
            console.error('❌ [hasPermission] NO HAY USUARIO AUTENTICADO');
            return false;
        }

        // Owner siempre tiene todos los permisos
        if (user.role === 'owner') {
            console.log('✅ [hasPermission] Usuario es OWNER - acceso total');
            return true;
        }

        // Verificar en la lista de permisos
        const hasAccess = permissions.includes(permission);
        console.log(`${hasAccess ? '✅' : '❌'} [hasPermission] Resultado: ${hasAccess ? 'PERMITIDO' : 'DENEGADO'}`);

        if (!hasAccess) {
            console.error(`🚫 [hasPermission] Permiso "${permission}" NO encontrado en:`, permissions);
        }

        return hasAccess;
    }, [user, permissions]);

    /**
     * Verificar si tiene TODOS los permisos (AND)
     */
    const hasAllPermissions = useCallback((permissionList) => {
        if (!user) return false;
        if (user.role === 'owner') return true;

        return permissionList.every(p => permissions.includes(p));
    }, [user, permissions]);

    /**
     * Verificar si tiene AL MENOS UNO de los permisos (OR)
     */
    const hasAnyPermission = useCallback((permissionList) => {
        if (!user) return false;
        if (user.role === 'owner') return true;

        return permissionList.some(p => permissions.includes(p));
    }, [user, permissions]);

    /**
     * Actualizar perfil del usuario
     */
    const updateProfile = async (data) => {
        const result = await authService.updateProfile(data);
        if (result.success) {
            setUser(result.user);
            setPermissions(result.user.permissions || []);
        }
        return result;
    };

    /**
     * Refrescar datos del usuario desde el backend
     */
    const refreshUser = async () => {
        const result = await authService.getProfile();
        if (result.success) {
            setUser(result.user);
            setPermissions(result.user.permissions || []);
        }
        return result;
    };

    /**
     * Cambiar contraseña
     */
    const changePassword = async (currentPassword, newPassword) => {
        return await authService.changePassword(currentPassword, newPassword);
    };

    const value = {
        // Estado
        user,
        loading,
        permissions,

        // Autenticación
        login,
        logout,
        isAuthenticated,

        // Roles
        hasRole,
        role: user?.role,

        // Permisos
        hasPermission,
        hasAllPermissions,
        hasAnyPermission,

        // Perfil
        updateProfile,
        refreshUser,
        changePassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
