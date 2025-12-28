import React, { useState, useEffect } from 'react';
import { clientsService } from '../services/clientsService';
import { useToast } from '../components/common/Toast';
import DataTable from '../components/common/DataTable';
import SearchInput from '../components/common/SearchInput';
import Pagination from '../components/common/Pagination';
import CreateClientModal from '../components/CreateClientModal';
import './GestionClientes.css';

const GestionClientes = () => {
    const toast = useToast();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [meta, setMeta] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    useEffect(() => {
        loadClients();
    }, [searchQuery, page, limit]);

    const loadClients = async () => {
        setLoading(true);
        try {
            // Service now returns { success, data, meta }
            const response = await clientsService.getClients(page, limit, { search: searchQuery });
            if (response.data) {
                setClients(response.data);
                setMeta(response.meta);
            } else {
                // Fallback if data is array (backwards compat or error)
                setClients(Array.isArray(response) ? response : []);
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setShowForm(true);
    };

    const handleDelete = async (clientId) => {
        if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
        try {
            await clientsService.deleteClient(clientId);
            toast.success('Cliente eliminado exitosamente');
            loadClients();
        } catch (error) {
            console.error('Error deleting client:', error);
            toast.error('Error al eliminar el cliente');
        }
    };

    const columns = [
        {
            key: 'nombre',
            label: 'Nombre',
            sortable: true,
            render: (_, row) => `${row.nombre || ''} ${row.apellido || ''}`.trim()
        },
        {
            key: 'instagram',
            label: 'Instagram',
            sortable: true,
            render: (value) => value ? (
                <a
                    href={`https://instagram.com/${value.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#e1306c', textDecoration: 'none' }}
                >
                    @{value.replace('@', '')}
                </a>
            ) : '-'
        },
        { key: 'telefono', label: 'Teléfono', sortable: true },
        {
            key: 'total_spent',
            label: 'Total Comprado',
            sortable: true,
            render: (value) => (
                <span className="font-bold text-green-600">
                    ${value?.toFixed(2) || '0.00'}
                </span>
            )
        },
        {
            key: 'last_purchase',
            label: 'Última Compra',
            sortable: true,
            render: (value) => value ? new Date(value).toLocaleDateString() : '-'
        }
    ];

    const renderActions = (client) => (
        <div className="client-actions">
            <button onClick={() => handleEdit(client)} className="btn-action btn-edit" title="Editar">
                ✏️
            </button>
            <button onClick={() => window.location.href = `/clients/${client.id}/history`} className="btn-action btn-view" title="Ver historial">
                📋
            </button>
            <button onClick={() => handleDelete(client.id)} className="btn-action btn-delete" title="Eliminar">
                🗑️
            </button>
        </div>
    );

    return (
        <div className="gestion-clientes-page">
            <div className="page-header">
                <div>
                    <h1>👥 Gestión de Clientes</h1>
                    <p>Administra todos los clientes del sistema</p>
                </div>
                <button
                    onClick={() => {
                        setEditingClient(null);
                        setShowForm(true);
                    }}
                    className="btn-primary"
                >
                    ➕ Nuevo Cliente
                </button>
            </div>

            <CreateClientModal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onClientCreated={loadClients}
                clientToEdit={editingClient}
            />

            <div className="filters-section">
                <SearchInput
                    placeholder="Buscar por nombre, email o teléfono..."
                    onSearch={(val) => { setSearchQuery(val); setPage(1); }}
                    icon="🔍"
                />
            </div>

            <div className="clients-stats">
                <div className="stat-card">
                    <span className="stat-label">Total Clientes</span>
                    <span className="stat-value">{meta?.total || clients.length || 0}</span>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={clients}
                loading={loading}
                actions={renderActions}
                pagination={true}
                pageSize={10}
            />

            {meta && (
                <Pagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    totalItems={meta.total}
                    itemsPerPage={meta.limit}
                    onPageChange={setPage}
                    onLimitChange={(l) => { setLimit(l); setPage(1); }}
                />
            )}
        </div>
    );
};

export default GestionClientes;
