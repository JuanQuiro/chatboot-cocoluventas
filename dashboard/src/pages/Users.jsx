/**
 * Users Management Page
 * Gestión completa de usuarios con roles y permisos
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedComponent, Can, RoleBadge } from '../components/auth';
import userService from '../services/userService';
import { usePermissions } from '../hooks';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [filter, setFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const { canCreate, canEdit, canDelete } = usePermissions();

    const loadUsers = useCallback(async () => {
        setLoading(true);
        const result = await userService.getUsers();
        if (result.success) {
            setUsers(result.users || []);
        }
        setLoading(false);
    }, []);

    const loadRoles = useCallback(async () => {
        const result = await userService.getRoles();
        if (result.success) {
            setRoles(result.roles || []);
        }
    }, []);

    useEffect(() => {
        loadUsers();
        loadRoles();
    }, [loadUsers, loadRoles]);

    const handleCreateUser = () => {
        setShowCreateModal(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            const result = await userService.deleteUser(userId);
            if (result.success) {
                loadUsers();
            }
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const result = await userService.toggleUserStatus(userId, newStatus);
        if (result.success) {
            loadUsers();
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(filter.toLowerCase()) ||
            user.email?.toLowerCase().includes(filter.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <ProtectedComponent permission="users.view">
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            👥 Gestión de Usuarios
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Administra usuarios, roles y permisos del sistema
                        </p>
                    </div>
                    <Can permission="users.create">
                        <button
                            onClick={handleCreateUser}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                            <span>➕</span>
                            <span>Nuevo Usuario</span>
                        </button>
                    </Can>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🔍 Buscar
                            </label>
                            <input
                                type="text"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                placeholder="Buscar por nombre o email..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🎭 Filtrar por rol
                            </label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Todos los roles</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Cargando usuarios...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-600 text-lg">No se encontraron usuarios</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rol
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Último Acceso
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id || user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                                            {user.name?.[0]?.toUpperCase() || '?'}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <RoleBadge role={user.role} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.status === 'active' ? '✓ Activo' : '✗ Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Can permission="users.edit">
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Editar"
                                                        >
                                                            ✏️
                                                        </button>
                                                    </Can>
                                                    <Can permission="users.edit">
                                                        <button
                                                            onClick={() => handleToggleStatus(user.id || user._id, user.status)}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                            title={user.status === 'active' ? 'Desactivar' : 'Activar'}
                                                        >
                                                            {user.status === 'active' ? '🔓' : '🔒'}
                                                        </button>
                                                    </Can>
                                                    <Can permission="users.delete">
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id || user._id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Eliminar"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </Can>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-sm text-gray-600">Total Usuarios</div>
                        <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-sm text-gray-600">Activos</div>
                        <div className="text-2xl font-bold text-green-600">
                            {users.filter(u => u.status === 'active').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-sm text-gray-600">Administradores</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {users.filter(u => u.role === 'admin' || u.role === 'owner').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-sm text-gray-600">Agentes</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {users.filter(u => u.role === 'agent').length}
                        </div>
                    </div>
                </div>

                {/* Modals would go here - CreateUserModal, EditUserModal */}
                {/* Por brevedad, no incluyo los modales completos aquí */}
            </div>
        </ProtectedComponent>
    );
};

export default Users;
