import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, Save, UserPlus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/Sellers.css';

export default function Sellers() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        email: '',
        status: 'available'
    });

    // Fetch sellers
    const { data: sellers, isLoading } = useQuery({
        queryKey: ['sellers'],
        queryFn: async () => {
            const res = await fetch('/api/sellers');
            if (!res.ok) throw new Error('Error cargando vendedores');
            return res.json();
        }
    });

    // Create seller mutation
    const createMutation = useMutation({
        mutationFn: async (newSeller) => {
            const res = await fetch('/api/sellers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSeller)
            });
            if (!res.ok) throw new Error('Error creando vendedor');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sellers']);
            toast.success('✅ Vendedor creado exitosamente');
            closeModal();
        },
        onError: (error) => {
            toast.error(`❌ Error: ${error.message}`);
        }
    });

    // Update seller mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await fetch(`/api/sellers/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Error actualizando vendedor');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sellers']);
            toast.success('✅ Vendedor actualizado exitosamente');
            closeModal();
        },
        onError: (error) => {
            toast.error(`❌ Error: ${error.message}`);
        }
    });

    // Delete seller mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`/api/sellers/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Error eliminando vendedor');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sellers']);
            toast.success('✅ Vendedor eliminado exitosamente');
        },
        onError: (error) => {
            toast.error(`❌ Error: ${error.message}`);
        }
    });

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', whatsapp: '', email: '', status: 'available' });
        setSelectedSeller(null);
        setShowModal(true);
    };

    const openEditModal = (seller) => {
        setModalMode('edit');
        setFormData({
            name: seller.name,
            whatsapp: seller.whatsapp || '',
            email: seller.email || '',
            status: seller.status
        });
        setSelectedSeller(seller);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ name: '', whatsapp: '', email: '', status: 'available' });
        setSelectedSeller(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('El nombre es requerido');
            return;
        }

        if (modalMode === 'create') {
            createMutation.mutate(formData);
        } else {
            updateMutation.mutate({ id: selectedSeller.id, data: formData });
        }
    };

    const handleDelete = (seller) => {
        if (window.confirm(`¿Estás seguro de eliminar al vendedor "${seller.name}"?`)) {
            deleteMutation.mutate(seller.id);
        }
    };

    const filteredSellers = sellers?.filter(seller =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.whatsapp?.includes(searchTerm) ||
        seller.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="sellers-page loading">
                <div className="spinner"></div>
                <p>Cargando vendedores...</p>
            </div>
        );
    }

    return (
        <div className="sellers-page">
            <div className="page-header">
                <div>
                    <h1>👥 Vendedores</h1>
                    <p className="subtitle">Gestiona tu equipo de ventas</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <Plus size={16} />
                    Nuevo Vendedor
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, WhatsApp o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Sellers Grid */}
            {filteredSellers.length === 0 ? (
                <div className="empty-state">
                    <UserPlus size={64} />
                    <h3>No hay vendedores</h3>
                    <p>Comienza agregando tu primer vendedor</p>
                    <button onClick={openCreateModal} className="btn-primary">
                        <Plus size={16} />
                        Crear Vendedor
                    </button>
                </div>
            ) : (
                <div className="sellers-grid">
                    {filteredSellers.map(seller => (
                        <div key={seller.id} className="seller-card">
                            <div className="seller-header">
                                <div className="seller-avatar">
                                    {seller.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="seller-info">
                                    <h3>{seller.name}</h3>
                                    <span className={`status-badge ${seller.status}`}>
                                        {seller.status === 'available' ? 'Disponible' :
                                            seller.status === 'busy' ? 'Ocupado' : 'Offline'}
                                    </span>
                                </div>
                            </div>

                            <div className="seller-details">
                                {seller.whatsapp && (
                                    <div className="detail-item">
                                        <span className="label">📱 WhatsApp:</span>
                                        <span className="value">{seller.whatsapp}</span>
                                    </div>
                                )}
                                {seller.email && (
                                    <div className="detail-item">
                                        <span className="label">📧 Email:</span>
                                        <span className="value">{seller.email}</span>
                                    </div>
                                )}
                                <div className="detail-item">
                                    <span className="label">💬 Conversaciones:</span>
                                    <span className="value">{seller.activeConversations || 0}</span>
                                </div>
                            </div>

                            <div className="seller-actions">
                                <button
                                    onClick={() => openEditModal(seller)}
                                    className="btn-edit"
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(seller)}
                                    className="btn-delete"
                                    title="Eliminar"
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 size={16} />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Create/Edit */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalMode === 'create' ? '➕ Nuevo Vendedor' : '✏️ Editar Vendedor'}
                            </h2>
                            <button onClick={closeModal} className="btn-close">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Juan Pérez"
                                    required
                                    autoFocus
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>WhatsApp</label>
                                <input
                                    type="tel"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    placeholder="+57 300 123 4567"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="juan@cocoluventas.com"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Estado</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="form-input"
                                >
                                    <option value="available">Disponible</option>
                                    <option value="busy">Ocupado</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={closeModal} className="btn-cancel">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    <Save size={16} />
                                    {createMutation.isPending || updateMutation.isPending
                                        ? 'Guardando...'
                                        : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
