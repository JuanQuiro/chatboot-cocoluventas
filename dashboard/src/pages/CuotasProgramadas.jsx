// CuotasProgramadas.jsx - Módulo completo de Cuotas Programadas
import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import DataTable from '../components/common/DataTable';
import SearchInput from '../components/common/SearchInput';
import ExportButton from '../components/common/ExportButton';
import { useToast } from '../components/common/Toast';
import './CuotasProgramadas.css';

const CuotasProgramadas = () => {
    const [installments, setInstallments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        start_date: '',
        end_date: ''
    });

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const [planDetails, setPlanDetails] = useState(null);

    const toast = useToast();

    useEffect(() => {
        loadInstallments();
        loadStats();
    }, [filters.status, filters.search, filters.start_date, filters.end_date]);

    const loadInstallments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                status: filters.status,
                start_date: filters.start_date || '',
                end_date: filters.end_date || '',
                page: 1,
                limit: 50
            });

            const response = await fetch(`/api/installments?${params}`);

            // Si el API no responde correctamente, usar datos vacíos
            if (!response.ok) {
                console.warn('API installments no disponible, usando datos vacíos');
                setInstallments([]);
                setLoading(false);
                return;
            }

            const data = await response.json();

            if (data.success || data.data) {
                setInstallments(data.data || []);
            } else {
                setInstallments([]);
            }
        } catch (error) {
            console.warn('Error loading installments (API no disponible):', error.message);
            // En lugar de mostrar error, simplemente mostrar tabla vacía
            setInstallments([]);
        } finally {
            setLoading(false);
        }
    };


    const loadStats = async () => {
        try {
            const response = await fetch('/api/installments/stats');

            // Si el API no responde correctamente, usar stats vacíos
            if (!response.ok) {
                console.warn('API installments/stats no disponible');
                setStats({
                    total_cuotas: 0,
                    cuotas_vencidas: 0,
                    monto_vencido: 0,
                    cuotas_proximas: 0,
                    monto_proximo: 0,
                    total_por_cobrar: 0,
                    tasa_cumplimiento: 0
                });
                return;
            }

            const data = await response.json();

            if (data.success || data.data || data.total !== undefined) {
                setStats(data.data || data);
            } else {
                setStats(null);
            }
        } catch (error) {
            console.warn('Error loading stats (API no disponible):', error.message);
            // En lugar de mostrar error, simplemente no mostrar stats
            setStats(null);
        }
    };


    const handleMarkPaid = (installment) => {
        setSelectedInstallment(installment);
        setShowPaymentModal(true);
    };

    const handleViewPlan = async (installment) => {
        try {
            const response = await fetch(`/api/installments/plan/${installment.pedido_id}`);
            const data = await response.json();

            if (data.success) {
                setPlanDetails(data.data);
                setShowPlanModal(true);
            }
        } catch (error) {
            console.error('Error loading plan:', error);
            toast.error('Error al cargar plan de cuotas');
        }
    };

    const submitPayment = async (paymentData) => {
        try {
            const response = await fetch(`/api/installments/${selectedInstallment.id}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('✅ Pago registrado exitosamente');
                setShowPaymentModal(false);
                loadInstallments();
                loadStats();
            } else {
                toast.error(data.message || 'Error al registrar pago');
            }
        } catch (error) {
            console.error('Error submitting payment:', error);
            toast.error('Error al registrar pago');
        }
    };

    const getStatusBadge = (estado, diasRestantes) => {
        if (estado === 'pagada') {
            return <span className="status-badge paid">✅ Pagada</span>;
        }
        if (estado === 'vencida' || diasRestantes < 0) {
            return <span className="status-badge overdue">🔴 Vencida</span>;
        }
        if (diasRestantes === 0) {
            return <span className="status-badge today">🔴 Hoy</span>;
        }
        if (diasRestantes <= 3) {
            return <span className="status-badge soon">🟡 Próxima</span>;
        }
        return <span className="status-badge pending">⏳ Pendiente</span>;
    };

    const columns = [
        {
            key: 'cliente_nombre',
            label: 'Cliente',
            render: (value, row) => `${value} ${row.cliente_apellido || ''}`,
            exportValue: (row) => `${row.cliente_nombre} ${row.cliente_apellido || ''}`
        },
        {
            key: 'numero_cuota',
            label: 'Cuota',
            render: (value, row) => `${value}/${row.total_cuotas}`,
            exportValue: (row) => `${row.numero_cuota}/${row.total_cuotas}`
        },
        {
            key: 'monto_cuota',
            label: 'Monto',
            sortable: true,
            render: (value) => `$${parseFloat(value).toFixed(2)}`,
            exportValue: (row) => parseFloat(row.monto_cuota).toFixed(2)
        },
        {
            key: 'fecha_vencimiento',
            label: 'Vencimiento',
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString(),
            exportValue: (row) => new Date(row.fecha_vencimiento).toLocaleDateString()
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (value, row) => getStatusBadge(value, row.dias_restantes),
            exportValue: (row) => row.estado.toUpperCase()
        },
        {
            key: 'dias_restantes',
            label: 'Días',
            render: (value, row) => {
                if (row.estado === 'pagada') return '-';
                if (value < 0) return <span className="overdue-days">-{Math.abs(value)}</span>;
                if (value === 0) return <span className="today-days">Hoy</span>;
                return <span className="pending-days">+{value}</span>;
            },
            exportValue: (row) => row.dias_restantes !== undefined ? row.dias_restantes : '-'
        }
    ];

    const renderActions = (installment) => (
        <div className="installment-actions">
            {installment.estado !== 'pagada' && (
                <button
                    onClick={() => handleMarkPaid(installment)}
                    className="btn-action btn-pay"
                    title="Registrar Pago"
                >
                    💰 Pagar
                </button>
            )}
            <button
                onClick={() => handleViewPlan(installment)}
                className="btn-action btn-view"
                title="Ver Plan Completo"
            >
                📋 Plan
            </button>
        </div>
    );

    return (
        <div className="cuotas-programadas-page">
            <div className="page-header">
                <div>
                    <h1>📅 Cuotas Programadas</h1>
                    <p>Gestión completa de planes de pago y cuotas</p>
                </div>
            </div>

            {/* Dashboard Stats */}
            {stats && (
                <div className="stats-dashboard">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <span className="stat-label">Cuotas Activas</span>
                            <span className="stat-value">{stats.total_cuotas || 0}</span>
                        </div>
                    </div>
                    <div className="stat-card danger">
                        <div className="stat-icon">🔴</div>
                        <div className="stat-content">
                            <span className="stat-label">Vencidas</span>
                            <span className="stat-value">
                                {stats.cuotas_vencidas || 0}
                                <small>${parseFloat(stats.monto_vencido || 0).toFixed(2)}</small>
                            </span>
                        </div>
                    </div>
                    <div className="stat-card warning">
                        <div className="stat-icon">🟡</div>
                        <div className="stat-content">
                            <span className="stat-label">Próximas (7 días)</span>
                            <span className="stat-value">
                                {stats.cuotas_proximas || 0}
                                <small>${parseFloat(stats.monto_proximo || 0).toFixed(2)}</small>
                            </span>
                        </div>
                    </div>
                    <div className="stat-card info">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <span className="stat-label">Total por Cobrar</span>
                            <span className="stat-value">
                                ${parseFloat(stats.total_por_cobrar || 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <div className="stat-card success">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <span className="stat-label">Cumplimiento</span>
                            <span className="stat-value">{stats.tasa_cumplimiento || 0}%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-section">
                <SearchInput
                    placeholder="Buscar por cliente..."
                    onSearch={(value) => setFilters({ ...filters, search: value })}
                    icon="🔍"
                />

                <div className="filter-group">
                    <label>Estado:</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="filter-select"
                    >
                        <option value="all">Todas</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="vencida">Vencidas</option>
                        <option value="pagada">Pagadas</option>
                        <option value="parcial">Parciales</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Desde:</label>
                    <input
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                        className="filter-input"
                    />
                </div>

                <div className="filter-group">
                    <label>Hasta:</label>
                    <input
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                        className="filter-input"
                    />
                </div>

                <ExportButton
                    data={installments}
                    columns={columns}
                    filename={`cuotas_programadas_${new Date().toISOString().split('T')[0]}`}
                    title="Cuotas Programadas"
                    formats={['pdf', 'excel', 'csv']}
                />
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={installments}
                loading={loading}
                actions={renderActions}
                pagination={true}
                pageSize={20}
            />

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    installment={selectedInstallment}
                    onClose={() => setShowPaymentModal(false)}
                    onSubmit={submitPayment}
                />
            )}

            {/* Plan Details Modal */}
            {showPlanModal && planDetails && (
                <PlanDetailsModal
                    plan={planDetails}
                    onClose={() => setShowPlanModal(false)}
                />
            )}
        </div>
    );
};

// Payment Modal Component
const PaymentModal = ({ installment, onClose, onSubmit }) => {
    const [paymentData, setPaymentData] = useState({
        fecha_pago: new Date().toISOString().split('T')[0],
        monto_pagado: installment.monto_cuota,
        metodo_pago: 'efectivo',
        referencia: '',
        notas: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(paymentData);
    };

    const difference = (parseFloat(paymentData.monto_pagado) - parseFloat(installment.monto_cuota)).toFixed(2);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>💰 Registrar Pago de Cuota</h2>
                    <button onClick={onClose} className="modal-close">×</button>
                </div>

                <div className="modal-body">
                    <div className="installment-info">
                        <p><strong>Cliente:</strong> {installment.cliente_nombre}</p>
                        <p><strong>Cuota:</strong> {installment.numero_cuota}/{installment.total_cuotas}</p>
                        <p><strong>Monto Esperado:</strong> ${parseFloat(installment.monto_cuota).toFixed(2)}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Fecha de Pago *</label>
                            <input
                                type="date"
                                value={paymentData.fecha_pago}
                                onChange={(e) => setPaymentData({ ...paymentData, fecha_pago: e.target.value })}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Monto Pagado *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={paymentData.monto_pagado}
                                onChange={(e) => setPaymentData({ ...paymentData, monto_pagado: e.target.value })}
                                className="form-control"
                                required
                            />
                            {difference != 0 && (
                                <small className={difference > 0 ? 'text-success' : 'text-warning'}>
                                    {difference > 0 ? `Excedente: $${difference}` : `Falta: $${Math.abs(difference)}`}
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Método de Pago *</label>
                            <select
                                value={paymentData.metodo_pago}
                                onChange={(e) => setPaymentData({ ...paymentData, metodo_pago: e.target.value })}
                                className="form-control"
                                required
                            >
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="zelle">Zelle</option>
                                <option value="pago_movil">Pago Móvil</option>
                                <option value="tarjeta">Tarjeta</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Referencia</label>
                            <input
                                type="text"
                                value={paymentData.referencia}
                                onChange={(e) => setPaymentData({ ...paymentData, referencia: e.target.value })}
                                className="form-control"
                                placeholder="Número de referencia..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Notas</label>
                            <textarea
                                value={paymentData.notas}
                                onChange={(e) => setPaymentData({ ...paymentData, notas: e.target.value })}
                                className="form-control"
                                rows="3"
                                placeholder="Observaciones adicionales..."
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn-secondary">
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary">
                                💾 Registrar Pago
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Plan Details Modal Component
const PlanDetailsModal = ({ plan, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content plan-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📋 Detalle del Plan de Cuotas</h2>
                    <button onClick={onClose} className="modal-close">×</button>
                </div>

                <div className="modal-body">
                    {/* Client Info */}
                    <div className="plan-section">
                        <h3>Cliente</h3>
                        <p><strong>Nombre:</strong> {plan.cliente.nombre} {plan.cliente.apellido}</p>
                        <p><strong>Teléfono:</strong> {plan.cliente.telefono}</p>
                    </div>

                    {/* Plan Summary */}
                    <div className="plan-section">
                        <h3>Resumen del Plan</h3>
                        <div className="plan-stats">
                            <div><strong>Total:</strong> ${parseFloat(plan.resumen.monto_total).toFixed(2)}</div>
                            <div><strong>Cuotas:</strong> {plan.resumen.total_cuotas}</div>
                            <div><strong>Pagadas:</strong> {plan.resumen.cuotas_pagadas}</div>
                            <div><strong>Restante:</strong> ${parseFloat(plan.resumen.monto_restante).toFixed(2)}</div>
                        </div>

                        {/* Progress Bar */}
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${plan.resumen.progreso}%` }}>
                                {plan.resumen.progreso}%
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="plan-section">
                        <h3>Timeline de Cuotas</h3>
                        <div className="installments-timeline">
                            {plan.cuotas.map((cuota, i) => (
                                <div key={i} className={`timeline-item ${cuota.estado}`}>
                                    <div className="timeline-marker">
                                        {cuota.estado === 'pagada' ? '✅' :
                                            cuota.estado === 'vencida' ? '🔴' : '⏳'}
                                    </div>
                                    <div className="timeline-content">
                                        <p className="timeline-title">
                                            Cuota {cuota.numero_cuota}: ${parseFloat(cuota.monto_cuota).toFixed(2)}
                                        </p>
                                        <p className="timeline-date">
                                            Venc: {new Date(cuota.fecha_vencimiento).toLocaleDateString()}
                                        </p>
                                        {cuota.fecha_pago && (
                                            <p className="timeline-paid">
                                                ✅ Pagada: {new Date(cuota.fecha_pago).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn-primary">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CuotasProgramadas;
