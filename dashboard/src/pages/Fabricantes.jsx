import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Eye, Package, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import manufacturersService from '../services/manufacturersService';
import DataTable from '../components/common/DataTable';
import SearchInput from '../components/common/SearchInput';
import './Fabricantes.css';

export default function Fabricantes() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedManufacturer, setSelectedManufacturer] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        especialidad: 'general',
        tarifa_base: 0,
        capacidad_maxima: 10,
        tiempo_entrega_dias: 7,
        contacto_telefono: '',
        contacto_email: '',
        notas: '',
        activo: 1
    });

    // Fetch manufacturers
    const { data: manufacturersData, isLoading } = useQuery({
        queryKey: ['manufacturers'],
        queryFn: manufacturersService.getAll
    });

    const manufacturers = manufacturersData?.data || [];

    // Filter manufacturers
    const filteredManufacturers = manufacturers.filter(m =>
        m.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Create mutation
    const createMutation = useMutation({
        mutationFn: manufacturersService.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['manufacturers']);
            toast.success('Fabricante creado exitosamente');
            setShowModal(false);
            resetForm();
        },
        onError: (error) => {
            toast.error('Error al crear fabricante');
            console.error(error);
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => manufacturersService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['manufacturers']);
            toast.success('Fabricante actualizado exitosamente');
            setShowModal(false);
            resetForm();
        },
        onError: (error) => {
            toast.error('Error al actualizar fabricante');
            console.error(error);
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: manufacturersService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['manufacturers']);
            toast.success('Fabricante eliminado');
        },
        onError: (error) => {
            toast.error('Error al eliminar fabricante');
            console.error(error);
        }
    });

    const resetForm = () => {
        setFormData({
            nombre: '',
            especialidad: 'general',
            tarifa_base: 0,
            capacidad_maxima: 10,
            tiempo_entrega_dias: 7,
            contacto_telefono: '',
            contacto_email: '',
            notas: '',
            activo: 1
        });
        setSelectedManufacturer(null);
    };

    const handleCreate = () => {
        setModalMode('create');
        resetForm();
        setShowModal(true);
    };

    const handleEdit = (manufacturer) => {
        setModalMode('edit');
        setSelectedManufacturer(manufacturer);
        setFormData({
            nombre: manufacturer.nombre,
            especialidad: manufacturer.especialidad,
            tarifa_base: manufacturer.tarifa_base || 0,
            capacidad_maxima: manufacturer.capacidad_maxima || 10,
            tiempo_entrega_dias: manufacturer.tiempo_entrega_dias || 7,
            contacto_telefono: manufacturer.contacto_telefono || '',
            contacto_email: manufacturer.contacto_email || '',
            notas: manufacturer.notas || '',
            activo: manufacturer.activo
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este fabricante? Será desactivado, no eliminado permanentemente.')) {
            deleteMutation.mutate(id);
        }
    };

    const handleViewDetail = (manufacturer) => {
        setSelectedManufacturer(manufacturer);
        setShowDetailModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.nombre.trim()) {
            toast.error('El nombre es requerido');
            return;
        }

        if (modalMode === 'create') {
            createMutation.mutate(formData);
        } else {
            updateMutation.mutate({ id: selectedManufacturer.id, data: formData });
        }
    };

    const columns = [
        {
            key: 'id',
            label: 'ID',
            sortable: true
        },
        {
            key: 'nombre',
            label: 'Nombre',
            sortable: true
        },
        {
            key: 'especialidad',
            label: 'Especialidad',
            sortable: true,
            render: (value) => {
                const especialidades = {
                    general: '🔧 General',
                    sublimacion: '🎨 Sublimación',
                    bordado: '🧵 Bordado',
                    serigrafia: '🖨️ Serigrafía'
                };
                return especialidades[value] || value;
            }
        },
        {
            key: 'carga_actual',
            label: 'Carga Actual',
            sortable: true,
            render: (value) => `${value || 0} pedidos`
        },
        {
            key: 'tarifa_base',
            label: 'Tarifa/Pieza',
            sortable: true,
            render: (value) => `$${parseFloat(value || 0).toFixed(2)}`
        },
        {
            key: 'pedidos_completados',
            label: 'Completados',
            sortable: true
        }
    ];

    const renderActions = (manufacturer) => (
        <div className="action-buttons">
            <button
                onClick={() => handleViewDetail(manufacturer)}
                className="btn-icon btn-view"
                title="Ver detalles"
            >
                <Eye size={16} />
            </button>
            <button
                onClick={() => handleEdit(manufacturer)}
                className="btn-icon btn-edit"
                title="Editar"
            >
                <Edit2 size={16} />
            </button>
            <button
                onClick={() => handleDelete(manufacturer.id)}
                className="btn-icon btn-delete"
                title="Eliminar"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );

    return (
        <div className="fabricantes-page">
            <div className="page-header">
                <div>
                    <h1>Gestión de Fabricantes</h1>
                    <p>Administra los fabricantes y sus tarifas</p>
                </div>
                <button onClick={handleCreate} className="btn-primary">
                    <Plus size={20} />
                    Nuevo Fabricante
                </button>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#e0f2fe' }}>
                        <Package style={{ color: '#0284c7' }} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Total Fabricantes</p>
                        <p className="stat-value">{manufacturers.length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef3c7' }}>
                        <TrendingUp style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Carga Total</p>
                        <p className="stat-value">
                            {manufacturers.reduce((sum, m) => sum + (m.carga_actual || 0), 0)} pedidos
                        </p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <SearchInput
                placeholder="Buscar fabricante..."
                onSearch={setSearchQuery}
                icon="🔍"
            />

            {/* Table */}
            <DataTable
                columns={columns}
                data={filteredManufacturers}
                loading={isLoading}
                actions={renderActions}
                pagination={true}
                pageSize={10}
            />

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'create' ? 'Nuevo Fabricante' : 'Editar Fabricante'}</h2>
                            <button onClick={() => setShowModal(false)} className="modal-close">×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Especialidad</label>
                                    <select
                                        value={formData.especialidad}
                                        onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                                    >
                                        <option value="general">General</option>
                                        <option value="sublimacion">Sublimación</option>
                                        <option value="bordado">Bordado</option>
                                        <option value="serigrafia">Serigrafía</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Tarifa por Pieza (USD)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.tarifa_base}
                                        onChange={(e) => setFormData({ ...formData, tarifa_base: parseFloat(e.target.value) })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Capacidad Máxima (pedidos)</label>
                                    <input
                                        type="number"
                                        value={formData.capacidad_maxima}
                                        onChange={(e) => setFormData({ ...formData, capacidad_maxima: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Tiempo de Entrega (días)</label>
                                    <input
                                        type="number"
                                        value={formData.tiempo_entrega_dias}
                                        onChange={(e) => setFormData({ ...formData, tiempo_entrega_dias: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.contacto_telefono}
                                        onChange={(e) => setFormData({ ...formData, contacto_telefono: e.target.value })}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.contacto_email}
                                        onChange={(e) => setFormData({ ...formData, contacto_email: e.target.value })}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Notas</label>
                                    <textarea
                                        value={formData.notas}
                                        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {modalMode === 'create' ? 'Crear' : 'Actualizar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal - Simple version */}
            {showDetailModal && selectedManufacturer && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedManufacturer.nombre}</h2>
                            <button onClick={() => setShowDetailModal(false)} className="modal-close">×</button>
                        </div>

                        <div className="detail-content">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <strong>Especialidad:</strong>
                                    <span>{selectedManufacturer.especialidad}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Tarifa por Pieza:</strong>
                                    <span>${parseFloat(selectedManufacturer.tarifa_base || 0).toFixed(2)}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Carga Actual:</strong>
                                    <span>{selectedManufacturer.carga_actual || 0} pedidos</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Pedidos Completados:</strong>
                                    <span>{selectedManufacturer.pedidos_completados || 0}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Capacidad Máxima:</strong>
                                    <span>{selectedManufacturer.capacidad_maxima || 10} pedidos</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Tiempo de Entrega:</strong>
                                    <span>{selectedManufacturer.tiempo_entrega_dias || 7} días</span>
                                </div>
                                {selectedManufacturer.contacto_telefono && (
                                    <div className="detail-item">
                                        <strong>Teléfono:</strong>
                                        <span>{selectedManufacturer.contacto_telefono}</span>
                                    </div>
                                )}
                                {selectedManufacturer.contacto_email && (
                                    <div className="detail-item">
                                        <strong>Email:</strong>
                                        <span>{selectedManufacturer.contacto_email}</span>
                                    </div>
                                )}
                            </div>

                            {selectedManufacturer.notas && (
                                <div className="detail-notes">
                                    <strong>Notas:</strong>
                                    <p>{selectedManufacturer.notas}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
