import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersService } from '../services/salesService';
import DataTable from '../components/common/DataTable';
import SearchInput from '../components/common/SearchInput';
import ExportModal from '../components/common/ExportModal';
import QuickEditModal from '../components/orders/QuickEditModal';
import DeliveryDateModal from '../components/orders/DeliveryDateModal';
import { Download, Eye, Trash2, Pencil, Calendar } from 'lucide-react';
import Pagination from '../components/common/Pagination';
import './ListaPedidos.css';

const ListaPedidos = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [manufacturerFilter, setManufacturerFilter] = useState('all');
    const [manufacturers, setManufacturers] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [showExportModal, setShowExportModal] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [meta, setMeta] = useState(null);
    const [stats, setStats] = useState(null);

    // Quick Edit State
    const [editingOrder, setEditingOrder] = useState(null);
    const [showQuickEditModal, setShowQuickEditModal] = useState(false);

    // Delivery Date State
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [deliveryEditOrder, setDeliveryEditOrder] = useState(null);

    useEffect(() => {
        loadOrders();
        loadStats();
        loadManufacturers();
    }, [searchQuery, statusFilter, manufacturerFilter, dateRange, page, limit]);

    const loadStats = async () => {
        try {
            const response = await ordersService.getStats();
            if (response.success && response.data) {
                setStats(response.data);
            } else if (response.total !== undefined) {
                setStats(response);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const loadOrders = async () => {
        setLoading(true);
        try {
            const filters = {
                search: searchQuery,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                manufacturer: manufacturerFilter !== 'all' ? manufacturerFilter : undefined,
                startDate: dateRange.start || undefined,
                endDate: dateRange.end || undefined,
                page,
                limit
            };

            const response = await ordersService.getOrders(filters);
            let ordersData = [];
            if (response.data) {
                ordersData = response.data;
                setMeta(response.meta);
            } else {
                ordersData = Array.isArray(response) ? response : [];
            }

            // Sort by delivery date (closest first, then by order date)
            ordersData.sort((a, b) => {
                const dateA = a.fecha_entrega ? new Date(a.fecha_entrega) : new Date(a.date || a.created_at);
                const dateB = b.fecha_entrega ? new Date(b.fecha_entrega) : new Date(b.date || b.created_at);
                return dateA - dateB;
            });

            setOrders(ordersData);
        } catch (error) {
            console.error('Error loading orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const loadManufacturers = async () => {
        try {
            const response = await fetch('/api/finance/manufacturers');
            const data = await response.json();
            if (data.success) {
                setManufacturers(data.data || []);
            }
        } catch (error) {
            console.error('Error loading manufacturers:', error);
        }
    };

    const handleDelete = async (orderId) => {
        if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
            try {
                await ordersService.deleteOrder(orderId);
                loadOrders();
                loadStats();
            } catch (error) {
                console.error('Error deleting order:', error);
                alert('Error al eliminar el pedido');
            }
        }
    };

    const openExportModal = () => {
        setShowExportModal(true);
    };

    const handleConfirmedExport = async (format) => {
        try {
            const blob = await ordersService.exportOrders({
                search: searchQuery,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                startDate: dateRange.start || undefined,
                endDate: dateRange.end || undefined,
                format
            });

            if (blob.type === 'application/json') {
                const text = await blob.text();
                try {
                    const json = JSON.parse(text);
                    alert(`Error al exportar: ${json.error || 'Error desconocido'}`);
                } catch (e) { /* */ }
                return;
            }

            let extension = 'xlsx';
            if (format === 'json') extension = 'json';
            else if (format === 'csv') extension = 'csv';
            else if (format === 'pdf') extension = 'pdf';
            else if (format === 'markdown') extension = 'md';

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pedidos_${new Date().toISOString().split('T')[0]}.${extension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setShowExportModal(false);
        } catch (error) {
            console.error('Export error:', error);
            alert('Error al exportar');
        }
    };

    // Quick Edit Handlers
    const handleQuickEdit = (order) => {
        setEditingOrder(order);
        setShowQuickEditModal(true);
    };

    const handleSaveQuickEdit = async (orderId, formData) => {
        try {
            await ordersService.updateOrder(orderId, {
                estado_entrega: formData.status,
                total_usd: formData.total
            });

            setShowQuickEditModal(false);
            setEditingOrder(null);
            loadOrders();
            loadStats();
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Error al actualizar el pedido');
        }
    };

    //Delivery Date Handlers
    const handleSetDeliveryDate = (order) => {
        setDeliveryEditOrder(order);
        setShowDeliveryModal(true);
    };

    const handleSaveDeliveryDate = async (orderId, dateData) => {
        try {
            await ordersService.updateOrder(orderId, dateData);
            setShowDeliveryModal(false);
            setDeliveryEditOrder(null);
            loadOrders();
        } catch (error) {
            console.error('Error updating delivery date:', error);
            alert('Error al actualizar la fecha de entrega');
        }
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: true },
        {
            key: 'date',
            label: 'Fecha',
            sortable: true,
            render: (value) => {
                if (!value) return '-';
                const date = new Date(value);
                return isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
            }
        },
        {
            key: 'client',
            label: 'Cliente',
            render: (value) => value?.name || 'Cliente sin nombre'
        },
        {
            key: 'fecha_entrega',
            label: 'Entrega',
            sortable: true,
            render: (value, row) => {
                if (!value) return <span style={{ color: '#9ca3af' }}>Sin fecha</span>;

                const deliveryDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const daysUntil = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24));

                let className = '';
                let icon = '📅';
                if (daysUntil < 0) { className = 'overdue'; icon = '⚠️'; }
                else if (daysUntil === 0) { className = 'today'; icon = '🔴'; }
                else if (daysUntil === 1) { className = 'tomorrow'; icon = '🟠'; }
                else if (daysUntil <= 3) { className = 'soon'; icon = '🟡'; }

                return (
                    <span className={`delivery-date ${className}`}>
                        {icon} {deliveryDate.toLocaleDateString()}
                    </span>
                );
            }
        },
        {
            key: 'fabricante_nombre', // Assuming backend join/population or need to check
            label: 'Fabricante',
            render: (value, row) => row.manufacturer?.name || row.fabricante_nombre || 'No asignado'
        },
        {
            key: 'total_usd', // V2 uses total_usd
            label: 'Total (USD)',
            sortable: true,
            render: (value, row) => `$${parseFloat(row.total_usd || row.total || 0).toFixed(2)}`
        },
        {
            key: 'estado_entrega', // V2 field
            label: 'Estado',
            render: (value) => {
                const status = value || 'pendiente';
                return (
                    <span className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
            }
        }
    ];

    const renderActions = (order) => (
        <div className="table-actions">
            <button
                onClick={() => handleSetDeliveryDate(order)}
                className="btn-icon calendar"
                title="Fecha de Entrega"
            >
                <Calendar size={18} />
            </button>
            <button
                onClick={() => handleQuickEdit(order)}
                className="btn-icon edit"
                title="Edición Rápida"
            >
                <Pencil size={18} />
            </button>
            <button
                onClick={() => navigate(`/editar-pedido/${order.id}`)}
                className="btn-icon"
                title="Ver/Detalles"
            >
                <Eye size={18} />
            </button>
            <button
                onClick={() => handleDelete(order.id)}
                className="btn-icon delete"
                title="Eliminar"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );

    return (
        <div className="lista-pedidos-page">
            <div className="page-header">
                <div>
                    <h1>📋 Lista de Pedidos</h1>
                    <p>Gestiona todos los pedidos del sistema</p>
                </div>
                <button
                    onClick={() => window.location.href = '/crear-venta'}
                    className="btn-primary"
                >
                    ➕ Nueva Venta
                </button>
            </div>

            <div className="filters-section">
                <SearchInput
                    placeholder="Buscar por ID, cliente, producto..."
                    onSearch={(val) => { setSearchQuery(val); setPage(1); }}
                    icon="🔍"
                />

                <div className="filter-group">
                    <label>Estado:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="filter-select"
                    >
                        <option value="all">Todos</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="pago confirmado">Pago Confirmado</option>
                        <option value="apartado">Apartado</option>
                        <option value="vectorizado">Vectorizado</option>
                        <option value="en proceso">En Proceso</option>
                        <option value="empaquetado">Empaquetado</option>
                        <option value="listo">Listo</option>
                        <option value="entregado">Entregado</option>
                    </select>

                    {/* Manufacturer Filter */}
                    <select
                        value={manufacturerFilter}
                        onChange={(e) => setManufacturerFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                        <option value="all">Todos los Fabricantes</option>
                        {manufacturers.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Desde:</label>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => { setDateRange({ ...dateRange, start: e.target.value }); setPage(1); }}
                        className="filter-input"
                    />
                </div>

                <div className="filter-group">
                    <label>Hasta:</label>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => { setDateRange({ ...dateRange, end: e.target.value }); setPage(1); }}
                        className="filter-input"
                    />
                </div>

                <button className="export-btn" onClick={openExportModal}>
                    <Download size={20} /> Exportar
                </button>
            </div>

            <div className="orders-stats">
                <div className="stat-card">
                    <span className="stat-label">Total Pedidos</span>
                    <span className="stat-value">{stats?.total || meta?.total || 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Monto Total</span>
                    <span className="stat-value success">
                        ${(stats?.revenue || 0).toFixed(2)}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Pendientes</span>
                    <span className="stat-value warning">
                        {stats?.pending || 0}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Completados</span>
                    <span className="stat-value info">
                        {stats?.completed || 0}
                    </span>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={orders}
                loading={loading}
                actions={renderActions}
                pagination={true}
                pageSize={15}
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

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExport={handleConfirmedExport}
                entityName="Pedidos"
            />

            <QuickEditModal
                isOpen={showQuickEditModal}
                onClose={() => setShowQuickEditModal(false)}
                order={editingOrder}
                onSave={handleSaveQuickEdit}
            />

            <DeliveryDateModal
                isOpen={showDeliveryModal}
                onClose={() => setShowDeliveryModal(false)}
                order={deliveryEditOrder}
                onSave={handleSaveDeliveryDate}
            />
        </div>
    );
};

export default ListaPedidos;
