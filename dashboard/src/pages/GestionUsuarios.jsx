// GestionUsuarios.jsx - Gestión de usuarios y roles
import React, { useState, useEffect } from 'react';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import './GestionUsuarios.css';

const GestionUsuarios = () => {
    const toast = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'vendedor',
        active: true
    });

    const roles = [
        { value: 'admin', label: 'Administrador', permissions: ['all'] },
        { value: 'vendedor', label: 'Vendedor', permissions: ['ventas', 'clientes'] },
        { value: 'almacen', label: 'Almacén', permissions: ['inventario'] },
        { value: 'contador', label: 'Contador', permissions: ['reportes', 'finanzas'] }
    ];

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            // Simular datos
            const mockUsers = [
                {
                    id: 1,
                    name: 'Juan Pérez',
                    email: 'juan@empresa.com',
                    role: 'admin',
                    active: true,
                    lastLogin: '2024-01-15'
                },
                {
                    id: 2,
                    name: 'María García',
                    email: 'maria@empresa.com',
                    role: 'vendedor',
                    active: true,
                    lastLogin: '2024-01-14'
                },
                {
                    id: 3,
                    name: 'Carlos López',
                    email: 'carlos@empresa.com',
                    role: 'almacen',
                    active: false,
                    lastLogin: '2024-01-10'
                }
            ];
            setUsers(mockUsers);
        } catch (error) {
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'vendedor',
            active: true
        });
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            active: user.active
        });
        setShowModal(true);
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            // await userService.deleteUser(selectedUser.id);
            setUsers(users.filter(u => u.id !== selectedUser.id));
            toast.success('Usuario eliminado exitosamente');
            setShowDeleteDialog(false);
        } catch (error) {
            toast.error('Error al eliminar usuario');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (selectedUser) {
                // Editar
                const updatedUsers = users.map(u =>
                    u.id === selectedUser.id
                        ? { ...u, ...formData }
                        : u
                );
                setUsers(updatedUsers);
                toast.success('Usuario actualizado exitosamente');
            } else {
                // Crear
                const newUser = {
                    id: users.length + 1,
                    ...formData,
                    lastLogin: null
                };
                setUsers([...users, newUser]);
                toast.success('Usuario creado exitosamente');
            }
            setShowModal(false);
        } catch (error) {
            toast.error('Error al guardar usuario');
        }
    };

    const getRoleBadge = (role) => {
        const roleConfig = {
            admin: { color: 'danger', label: 'Administrador' },
            vendedor: { color: 'primary', label: 'Vendedor' },
            almacen: { color: 'warning', label: 'Almacén' },
            contador: { color: 'success', label: 'Contador' }
        };
        const config = roleConfig[role] || { color: 'secondary', label: role };
        return <span className={`role-badge ${config.color}`}>{config.label}</span>;
    };

    const columns = [
        {
            key: 'name',
            label: 'Nombre',
            sortable: true
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true
        },
        {
            key: 'role',
            label: 'Rol',
            render: (user) => getRoleBadge(user.role)
        },
        {
            key: 'active',
            label: 'Estado',
            render: (user) => (
                <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                    {user.active ? 'Activo' : 'Inactivo'}
                </span>
            )
        },
        {
            key: 'lastLogin',
            label: 'Último Acceso',
            render: (user) => user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'
        }
    ];

    const actions = [
        {
            label: 'Editar',
            onClick: handleEdit,
            className: 'action-edit'
        },
        {
            label: 'Eliminar',
            onClick: handleDelete,
            className: 'action-delete'
        }
    ];

    return (
        <div className="gestion-usuarios-page">
            <div className="page-header">
                <div>
                    <h1>👥 Gestión de Usuarios</h1>
                    <p>Administra usuarios, roles y permisos del sistema</p>
                </div>
                <button onClick={handleCreate} className="btn-primary">
                    ➕ Nuevo Usuario
                </button>
            </div>

            {/* Estadísticas */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <span className="stat-label">Total Usuarios</span>
                        <span className="stat-value">{users.length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <span className="stat-label">Usuarios Activos</span>
                        <span className="stat-value">{users.filter(u => u.active).length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔐</div>
                    <div className="stat-content">
                        <span className="stat-label">Administradores</span>
                        <span className="stat-value">{users.filter(u => u.role === 'admin').length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🛒</div>
                    <div className="stat-content">
                        <span className="stat-label">Vendedores</span>
                        <span className="stat-value">{users.filter(u => u.role === 'vendedor').length}</span>
                    </div>
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="table-section">
                <DataTable
                    columns={columns}
                    data={users}
                    actions={actions}
                    loading={loading}
                    emptyMessage="No hay usuarios registrados"
                />
            </div>

            {/* Modal de crear/editar */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                size="medium"
            >
                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-group">
                        <label>Nombre Completo *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña {!selectedUser && '*'}</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="form-control"
                            required={!selectedUser}
                            placeholder={selectedUser ? 'Dejar en blanco para no cambiar' : ''}
                        />
                    </div>

                    <div className="form-group">
                        <label>Rol *</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="form-control"
                            required
                        >
                            {roles.map(role => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            />
                            <span>Usuario Activo</span>
                        </label>
                    </div>

                    {/* Permisos del rol */}
                    <div className="permissions-info">
                        <h4>Permisos del Rol:</h4>
                        <div className="permissions-list">
                            {roles.find(r => r.value === formData.role)?.permissions.map((perm, index) => (
                                <span key={index} className="permission-badge">{perm}</span>
                            ))}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            {selectedUser ? 'Actualizar' : 'Crear'} Usuario
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Diálogo de confirmación de eliminación */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="Eliminar Usuario"
                message={`¿Estás seguro de que deseas eliminar al usuario "${selectedUser?.name}"?`}
                confirmText="Eliminar"
                type="danger"
            />
        </div>
    );
};

export default GestionUsuarios;
