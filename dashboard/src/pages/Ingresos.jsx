import React, { useState, useEffect } from 'react';
import { financeService } from '../services/financeService';
import { useToast } from '../components/common/Toast';
import SearchInput from '../components/common/SearchInput';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal'; // Assuming Modal existed or using standard convention
import Pagination from '../components/common/Pagination';
import './Ingresos.css';

const Ingresos = () => {
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    // Stats now fetched from summary
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalMisc: 0,
        grandTotal: 0
    });
    const toast = useToast();

    // Only needed for misc income list if we keep it separate
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [meta, setMeta] = useState(null);

    const [dateRange, setDateRange] = useState({
        // Default to Previous Month Start
        start: new Date(new Date().setMonth(new Date().getMonth() - 1, 1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadIncomes();
    }, [searchQuery, dateRange]);

    const loadIncomes = async () => {
        setLoading(true);
        try {
            // Using getIncomeSummary to get aggregated data
            const response = await financeService.getIncomeSummary(dateRange.start, dateRange.end);
            if (response.success) {
                setStats(response.data);
                // For now, listing misc entries is separate or part of same response.
                // Assuming response.data.breakdown.misc contains the array
                setIncomes(response.data.breakdown?.misc || []);
            }
        } catch (error) {
            toast.error('Error cargando ingresos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async () => {
        try {
            if (editingIncome) {
                await financeService.updateIncome(editingIncome.id, formData);
                toast.success('Ingreso actualizado');
            } else {
                await financeService.createIncome(formData);
                toast.success('Ingreso registrado');
            }
            setShowModal(false);
            setEditingIncome(null);
            setFormData({
                description: '',
                amount: 0,
                category: '',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            loadIncomes();
        } catch (error) {
            toast.error('Error al guardar ingreso');
            console.error(error);
        }
    };

    const handleEdit = (income) => {
        setEditingIncome(income);
        setFormData({
            description: income.description,
            amount: income.amount,
            category: income.category,
            date: new Date(income.date).toISOString().split('T')[0],
            notes: income.notes || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este ingreso?')) {
            try {
                await financeService.deleteIncome(id);
                toast.success('Ingreso eliminado');
                loadIncomes();
            } catch (error) {
                toast.error('Error al eliminar');
                console.error(error);
            }
        }
    };

    const columns = [
        { key: 'date', label: 'Fecha', sortable: true, render: (val) => new Date(val).toLocaleDateString() },
        { key: 'description', label: 'Descripción', sortable: true },
        { key: 'category', label: 'Categoría', sortable: true },
        { key: 'amount', label: 'Monto', sortable: true, render: (val) => `$${val?.toFixed(2)}` }
    ];

    const renderActions = (income) => (
        <div className="table-actions">
            <button onClick={() => handleEdit(income)} className="btn-icon edit">✏️</button>
            <button onClick={() => handleDelete(income.id)} className="btn-icon delete">🗑️</button>
        </div>
    );

    return (
        <div className="ingresos-page">
            <div className="page-header">
                <div>
                    <h1>💰 Ingresos</h1>
                    <p>Gestión de ingresos y reportes</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    ➕ Nuevo Ingreso
                </button>
            </div>

            <div className="filters-section">
                <SearchInput placeholder="Buscar..." onSearch={(val) => { setSearchQuery(val); setPage(1); }} icon="🔍" />
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

            <div className="income-stats">
                <div className="stat-card">
                    <span className="stat-label">Ingresos por Pedidos</span>
                    <span className="stat-value text-blue-600">${stats.totalOrders?.toFixed(2) || '0.00'}</span>
                </div>
                {/* Global Stats View */}
                <div className="stat-card">
                    <span className="stat-label">Ingresos Varios</span>
                    <span className="stat-value text-purple-600">
                        ${stats.totalMisc?.toFixed(2) || '0.00'}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Global</span>
                    <span className="stat-value success font-bold text-xl">
                        ${stats.grandTotal?.toFixed(2) || '0.00'}
                    </span>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={incomes}
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

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingIncome ? 'Editar Ingreso' : 'Nuevo Ingreso'}
                size="medium"
            >
                <div className="income-form">
                    <div className="form-group">
                        <label>Descripción *</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Monto *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Fecha *</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Categoría</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="form-control"
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Ventas">Ventas</option>
                            <option value="Servicios">Servicios</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Notas</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="form-control"
                            rows="3"
                        />
                    </div>

                    <div className="modal-actions">
                        <button onClick={() => setShowModal(false)} className="btn-secondary">
                            Cancelar
                        </button>
                        <button onClick={handleSubmit} className="btn-primary">
                            {editingIncome ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Ingresos;
