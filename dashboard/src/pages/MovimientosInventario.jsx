import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import SearchInput from '../components/common/SearchInput';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import MovementDetailModal from '../components/inventory/MovementDetailModal';
import './MovimientosInventario.css';

const MovimientosInventario = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Modal state
    const [selectedMovement, setSelectedMovement] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [meta, setMeta] = useState(null);

    // Stats state
    const [stats, setStats] = useState({
        totalMovements: 0,
        totalEntradas: 0,
        totalSalidas: 0
    });

    useEffect(() => {
        loadMovements();
        loadStats();
    }, [searchQuery, typeFilter, dateRange, page, limit]);

    // Independent stats loading for global counts
    const loadStats = async () => {
        try {
            // Reusing getInventoryStats which now includes movement stats
            const statsData = await inventoryService.getInventoryStats();
            if (statsData && statsData.movements_stats) {
                setStats({
                    totalMovements: statsData.movements_stats.total_movimientos || 0,
                    totalEntradas: statsData.movements_stats.total_entradas || 0,
                    totalSalidas: statsData.movements_stats.total_salidas || 0
                });
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const loadMovements = async () => {
        setLoading(true);
        try {
            const filters = {
                search: searchQuery,
                type: typeFilter !== 'all' ? typeFilter : undefined,
                startDate: dateRange.start || undefined,
                endDate: dateRange.end || undefined,
                page,
                limit
            };

            const response = await inventoryService.getMovements(filters);
            if (response.data) {
                setMovements(response.data);
                setMeta(response.meta);
            } else {
                setMovements(Array.isArray(response) ? response : []);
            }
        } catch (error) {
            console.error('Error loading movements:', error);
            setMovements([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (movement) => {
        setSelectedMovement(movement);
        setShowModal(true);
    };

    const columns = [
        {
            key: 'date',
            label: 'Fecha',
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString() + ' ' + new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
            key: 'product',
            label: 'Producto',
            sortable: true,
            render: (value) => value?.name || 'N/A'
        },
        {
            key: 'type',
            label: 'Tipo',
            sortable: true,
            render: (value) => {
                const types = {
                    'entrada': '📥 Entrada',
                    'salida': '📤 Salida',
                    'ajuste': '⚙️ Ajuste',
                    'devolucion': '↩️ Devolución'
                };
                return types[value] || value;
            }
        },
        {
            key: 'quantity',
            label: 'Cantidad',
            sortable: true,
            render: (value, row) => (
                <span className={row.type === 'salida' ? 'quantity-negative' : 'quantity-positive'}>
                    {row.type === 'salida' ? '-' : '+'}{value}
                </span>
            )
        },
        {
            key: 'costo_unitario',
            label: 'Costo Unit. (USD)',
            sortable: true,
            render: (value) => value ? `$${parseFloat(value).toFixed(2)}` : '-'
        },
        {
            key: 'costo_total',
            label: 'Costo Total (USD)',
            sortable: true,
            render: (value) => value ? `$${parseFloat(value).toFixed(2)}` : '-'
        },
        {
            key: 'previousStock',
            label: 'Stock Ant.',
            sortable: true
        },
        {
            key: 'newStock',
            label: 'Stock Nuevo',
            sortable: true
        },
        {
            key: 'user',
            label: 'Usuario',
            render: (value) => value?.name || 'Sistema'
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleViewDetails(row)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Ver Detalles"
                    >
                        <Eye size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="movimientos-inventario-page">
            <div className="page-header">
                <div>
                    <h1>📊 Movimientos de Inventario</h1>
                    <p>Historial completo de movimientos de stock</p>
                </div>
            </div>

            <div className="filters-section">
                <SearchInput
                    placeholder="Buscar por producto..."
                    onSearch={(val) => { setSearchQuery(val); setPage(1); }}
                    icon="🔍"
                />

                <div className="filter-group">
                    <label>Tipo:</label>
                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                        className="filter-select"
                    >
                        <option value="all">Todos</option>
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                        <option value="ajuste">Ajuste</option>
                        <option value="devolucion">Devolución</option>
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
            </div>

            <div className="movements-stats">
                <div className="stat-card">
                    <span className="stat-label">Total Movimientos</span>
                    <span className="stat-value">{stats.totalMovements}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Entradas Totales</span>
                    <span className="stat-value success">
                        {stats.totalEntradas}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Salidas Totales</span>
                    <span className="stat-value danger">
                        {stats.totalSalidas}
                    </span>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={movements}
                loading={loading}
                pagination={true}
                pageSize={15}
            />

            {/* Total Cost Summary */}
            {movements.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200" style={{ marginTop: '1rem', padding: '1rem', background: 'linear-gradient(to right, #eef2ff, #e0e7ff)', borderRadius: '0.5rem', border: '1px solid #c7d2fe' }}>
                    <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="text-lg font-semibold text-indigo-900" style={{ fontSize: '1.125rem', fontWeight: 600, color: '#312e81' }}>Total Costo de Movimientos:</span>
                        <span className="text-2xl font-bold text-indigo-700" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4338ca' }}>
                            ${movements.reduce((sum, m) => sum + (parseFloat(m.costo_total) || 0), 0).toFixed(2)} USD
                        </span>
                    </div>
                </div>
            )}

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

            <MovementDetailModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                movement={selectedMovement}
            />
        </div>
    );
};

export default MovimientosInventario;
