/**
 * Roles Management Page
 * Gestión de roles y permisos
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedComponent, Can, RoleBadge } from '../components/auth';
import userService from '../services/userService';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        const [rolesResult, permissionsResult] = await Promise.all([
            userService.getRoles(),
            userService.getPermissions(),
        ]);

        if (rolesResult.success) {
            setRoles(rolesResult.roles || []);
        }
        if (permissionsResult.success) {
            setPermissions(permissionsResult.permissions || {});
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSelectRole = (role) => {
        setSelectedRole(role);
    };

    return (
        <ProtectedComponent permission="users.roles">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        🎭 Gestión de Roles y Permisos
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Administra roles y sus permisos asociados
                    </p>
                </div>

                {loading ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando roles...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Roles List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow p-4">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Roles Disponibles
                                </h2>
                                <div className="space-y-2">
                                    {roles.map((role) => (
                                        <button
                                            key={role.id}
                                            onClick={() => handleSelectRole(role)}
                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                selectedRole?.id === role.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <RoleBadge role={role.id} />
                                                {role.isSystem && (
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        Sistema
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {role.description}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {role.permissions?.length || 0} permisos
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                <Can permission="users.roles">
                                    <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors">
                                        ➕ Crear Rol Personalizado
                                    </button>
                                </Can>
                            </div>
                        </div>

                        {/* Role Details & Permissions */}
                        <div className="lg:col-span-2">
                            {selectedRole ? (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                                {selectedRole.name}
                                            </h2>
                                            <p className="text-gray-600">
                                                {selectedRole.description}
                                            </p>
                                        </div>
                                        <RoleBadge role={selectedRole.id} size="lg" />
                                    </div>

                                    {/* Permissions by Category */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Permisos ({selectedRole.permissions?.length || 0})
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            {Object.entries(permissions).map(([category, perms]) => (
                                                <div key={category} className="border border-gray-200 rounded-lg p-4">
                                                    <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                                                        📂 {category}
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {perms.map((perm) => {
                                                            const hasPermission = selectedRole.permissions?.includes(perm.key);
                                                            return (
                                                                <div
                                                                    key={perm.key}
                                                                    className={`flex items-center gap-2 p-2 rounded ${
                                                                        hasPermission
                                                                            ? 'bg-green-50 border border-green-200'
                                                                            : 'bg-gray-50'
                                                                    }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={hasPermission}
                                                                        disabled={selectedRole.isSystem}
                                                                        className="rounded"
                                                                    />
                                                                    <label className={`text-sm ${
                                                                        hasPermission ? 'text-green-900 font-medium' : 'text-gray-700'
                                                                    }`}>
                                                                        {hasPermission && '✓ '}{perm.name}
                                                                    </label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {selectedRole.isSystem && (
                                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <p className="text-sm text-yellow-800">
                                                    ⚠️ Este es un rol del sistema y no puede ser modificado. 
                                                    Puedes crear un rol personalizado basado en este.
                                                </p>
                                            </div>
                                        )}

                                        {!selectedRole.isSystem && (
                                            <div className="mt-6 flex gap-3">
                                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                                                    💾 Guardar Cambios
                                                </button>
                                                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                                                    🗑️ Eliminar Rol
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow p-12 text-center">
                                    <div className="text-gray-400 text-6xl mb-4">🎭</div>
                                    <p className="text-gray-600 text-lg">
                                        Selecciona un rol para ver sus permisos
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Permission Matrix */}
                <div className="mt-6 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        📊 Matriz de Permisos
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Vista general de permisos por rol
                    </p>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Categoría
                                    </th>
                                    {roles.slice(0, 5).map(role => (
                                        <th key={role.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                            <RoleBadge role={role.id} size="sm" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.entries(permissions).map(([category, perms]) => (
                                    <tr key={category}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                            {category}
                                        </td>
                                        {roles.slice(0, 5).map(role => {
                                            const categoryPerms = perms.map(p => p.key);
                                            const hasAny = categoryPerms.some(p => role.permissions?.includes(p));
                                            const hasAll = categoryPerms.every(p => role.permissions?.includes(p));
                                            
                                            return (
                                                <td key={role.id} className="px-6 py-4 whitespace-nowrap text-center">
                                                    {hasAll ? (
                                                        <span className="text-green-600 text-xl">✓</span>
                                                    ) : hasAny ? (
                                                        <span className="text-yellow-600 text-xl">◐</span>
                                                    ) : (
                                                        <span className="text-gray-300 text-xl">✗</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="text-green-600 text-xl">✓</span>
                            <span>Todos los permisos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-yellow-600 text-xl">◐</span>
                            <span>Algunos permisos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-300 text-xl">✗</span>
                            <span>Sin permisos</span>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedComponent>
    );
};

export default Roles;
