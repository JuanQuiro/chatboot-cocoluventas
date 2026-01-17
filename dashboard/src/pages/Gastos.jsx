
import React, { useState, useEffect } from 'react';
import { financeService } from '../services/financeService';
import { useToast } from '../components/common/Toast';
import SearchInput from '../components/common/SearchInput';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import './CuotasProgramadas.css'; // Reutilizamos estilos

const Gastos = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [payAmount, setPayAmount] = useState(0);

    const [formData, setFormData] = useState({
        description: '',
        monto_total_usd: 0,
        proveedor: '',
        fecha_limite: '',
        categoria: '',
        metodo_pago: 'transferencia'
    });

    const [stats, setStats] = useState({ total_pending: 0, total_paid: 0 });
    const toast = useToast();

    useEffect(() => {
        loadExpenses();
    }, [searchQuery]);

    const loadExpenses = async () => {
        setLoading(true);
        try {
            const response = await financeService.getExpenses({ search: searchQuery });
            if (response.success) {
                setExpenses(response.data);
                // Calculate basic stats on client side for now as API might not return them directly in this endpoint
                // Or if my API returns { data: [], stats: {} } check structure.
                // Based on API implementation: res.json({ success: true, data: expenses });
                // I will add stats calculation here
                const total = response.data.reduce((acc, curr) => acc + (curr.monto_total_usd || 0), 0);
                const paid = response.data.reduce((acc, curr) => acc + (curr.monto_pagado_usd || 0), 0);
                setStats({ total_pending: total - paid, total_paid: paid });
            }
        } catch (error) {
            console.error('Error loading expenses:', error);
            toast.error('Error cargando gastos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            await financeService.createExpense(formData);
            toast.success('Gasto registrado');
            setShowModal(false);
            setFormData({
                description: '',
                monto_total_usd: 0,
                proveedor: '',
                fecha_limite: '',
                categoria: '',
                metodo_pago: 'transferencia'
            });
            loadExpenses();
        } catch (error) {
            toast.error('Error registrando gasto');
        }
    };

    const handlePayment = async () => {
        if (!selectedExpense || !payAmount) return;
        try {
            await financeService.registerPayment(selectedExpense.id, parseFloat(payAmount));
            toast.success('Pago registrado');
            setShowPayModal(false);
            setPayAmount(0);
            loadExpenses();
        } catch (error) {
            toast.error('Error registrando pago');
        }
    };

    const columns = [
        { key: 'description', label: 'Descripción', sortable: true },
        { key: 'proveedor', label: 'Proveedor', sortable: true },
        {
            key: 'monto_total_usd',
            label: 'Total (USD)',
            sortable: true,
            render: (val) => `$${val?.toFixed(2)}`
        },
        {
            key: 'monto_pagado_usd',
            label: 'Pagado',
            render: (val) => <span className="text-success">${val?.toFixed(2)}</span>
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (val) => <StatusBadge status={val === 'pagado' ? 'paid' : val === 'parcial' ? 'warning' : 'pending'} label={val} />
        },
        {
            key: 'fecha_limite',
            label: 'Vence',
            render: (val) => val ? new Date(val).toLocaleDateString() : '-'
        }
    ];

    const renderActions = (item) => (
        <div className="table-actions">
            {item.estado !== 'pagado' && (
                <button
                    onClick={() => { setSelectedExpense(item); setShowPayModal(true); }}
                    className="btn-action btn-pay"
                    title="Registrar Pago"
                >
                    💰
                </button>
            )}
        </div>
    );

    return (
        <div className="gastos-page">
            <div className="page-header">
                <div>
                    <h1>📉 Gastos y Cuentas por Pagar</h1>
                    <p>Gestiona los gastos operativos y deudas con proveedores (Cocolu)</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    ➕ Registrar Gasto
                </button>
            </div>

            <div className="filters-section">
                <SearchInput placeholder="Buscar gasto..." onSearch={setSearchQuery} icon="🔍" />
            </div>

            <div className="expense-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div className="stat-card">
                    <span className="stat-label">Por Pagar (Deuda)</span>
                    <span className="stat-value danger">${stats.total_pending.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Pagado</span>
                    <span className="stat-value success">${stats.total_paid.toFixed(2)}</span>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={expenses}
                loading={loading}
                actions={renderActions}
                pagination={true}
                pageSize={10}
            />

            {/* Modal Crear Gasto */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Registrar Nuevo Gasto"
                size="medium"
            >
                <div className="form-group">
                    <label>Descripción</label>
                    <input className="form-control" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Proveedor</label>
                    <input className="form-control" value={formData.proveedor} onChange={e => setFormData({ ...formData, proveedor: e.target.value })} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Monto Total (USD)</label>
                        <input type="number" className="form-control" value={formData.monto_total_usd} onChange={e => setFormData({ ...formData, monto_total_usd: parseFloat(e.target.value) })} />
                    </div>
                    <div className="form-group">
                        <label>Fecha Límite</label>
                        <input type="date" className="form-control" value={formData.fecha_limite} onChange={e => setFormData({ ...formData, fecha_limite: e.target.value })} />
                    </div>
                </div>
                <div className="modal-actions">
                    <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                    <button onClick={handleSubmit} className="btn-primary">Guardar</button>
                </div>
            </Modal>

            {/* Modal Pagar */}
            <Modal
                isOpen={showPayModal}
                onClose={() => setShowPayModal(false)}
                title={`Pagar: ${selectedExpense?.description}`}
                size="small"
            >
                <div className="form-group">
                    <label>Monto a Pagar (USD)</label>
                    <input
                        type="number"
                        className="form-control"
                        value={payAmount}
                        onChange={e => setPayAmount(e.target.value)}
                    />
                    <small>Restante: ${(selectedExpense?.monto_total_usd - selectedExpense?.monto_pagado_usd).toFixed(2)}</small>
                </div>
                <div className="modal-actions">
                    <button onClick={() => setShowPayModal(false)} className="btn-secondary">Cancelar</button>
                    <button onClick={handlePayment} className="btn-primary">Registrar Pago</button>
                </div>
            </Modal>
        </div>
    );
};

export default Gastos;
