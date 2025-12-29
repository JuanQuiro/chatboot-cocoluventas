import React, { useState, useEffect } from 'react';
import { accountsService } from '../services/accountsService';
import DataTable from '../components/common/DataTable';
import SearchInput from '../components/common/SearchInput';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import ExportButton from '../components/common/ExportButton';
import './GestionDeudas.css';

const GestionDeudas = () => {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [planData, setPlanData] = useState({
        installments: 3,
        frequency: 'monthly',
        startDate: '',
        notes: ''
    });
    const toast = useToast();

    useEffect(() => {
        loadDebts();
    }, [searchQuery]);

    const loadDebts = async () => {
        setLoading(true);
        try {
            const data = await accountsService.getDebts({ search: searchQuery });
            setDebts(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Error al cargar deudas');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async () => {
        if (!selectedDebt) return;

        try {
            await accountsService.createPaymentPlan({
                debtId: selectedDebt.id,
                ...planData
            });
            toast.success('Plan de pago creado exitosamente');
            setShowPlanModal(false);
            loadDebts();
        } catch (error) {
            toast.error('Error al crear plan de pago');
            console.error(error);
        }
    };

    const getDaysOverdue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const columns = [
        {
            key: 'clientName',
            label: 'Cliente',
            sortable: true
        },
        {
            key: 'totalDebt',
            label: 'Deuda Total',
            sortable: true,
            render: (value) => `$${value?.toFixed(2) || '0.00'}`
        },
        {
            key: 'dueDate',
            label: 'Vencimiento',
            sortable: true,
            render: (value) => {
                const daysOverdue = getDaysOverdue(value);
                return (
                    <div className={daysOverdue > 0 ? 'overdue' : ''}>
                        {new Date(value).toLocaleDateString()}
                        {daysOverdue > 0 && (
                            <span className="overdue-badge">{daysOverdue} días</span>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'status',
            label: 'Estado',
            render: (value, row) => {
                const daysOverdue = getDaysOverdue(row.dueDate);
                const status = daysOverdue > 30 ? 'Moroso' : daysOverdue > 0 ? 'Vencido' : 'Pendiente';
                return <StatusBadge status={status} />;
            }
        },
        {
            key: 'hasPlan',
            label: 'Plan de Pago',
            render: (value) => value ? '✅ Sí' : '❌ No'
        }
    ];

    const renderActions = (debt) => (
        <div className="debt-actions">
            <button
                onClick={() => {
                    setSelectedDebt(debt);
                    setShowPlanModal(true);
                }}
                className="btn-action btn-plan"
                title="Crear plan de pago"
            >
                📅
            </button>
            <button
                onClick={() => window.location.href = `/clients/${debt.clientId}`}
                className="btn-action btn-view"
                title="Ver cliente"
            >
                👁️
            </button>
        </div>
    );

    return (
        <div className="gestion-deudas-page">
            <div className="page-header">
                <div>
                    <h1>💳 Gestión de Deudas</h1>
                    <p>Administra deudas y planes de pago</p>
                </div>
            </div>

            <div className="filters-section">
                <SearchInput
                    placeholder="Buscar por cliente..."
                    onSearch={setSearchQuery}
                    icon="🔍"
                />
                <ExportButton
                    data={debts}
                    columns={[
                        { key: 'clientName', label: 'Cliente' },
                        { key: (row) => `$${row.totalDebt?.toFixed(2) || '0.00'}`, label: 'Deuda Total' },
                        { key: (row) => new Date(row.dueDate).toLocaleDateString(), label: 'Vencimiento' },
                        { key: (row) => getDaysOverdue(row.dueDate) > 30 ? 'Moroso' : getDaysOverdue(row.dueDate) > 0 ? 'Vencido' : 'Pendiente', label: 'Estado' },
                        { key: (row) => row.hasPlan ? 'Sí' : 'No', label: 'Plan de Pago' }
                    ]}
                    filename={`gestion_deudas_${new Date().toISOString().split('T')[0]}`}
                    title="Gestión de Deudas"
                    formats={['pdf', 'excel', 'csv']}
                />
            </div>

            <div className="debts-stats">
                <div className="stat-card">
                    <span className="stat-label">Total Deudas</span>
                    <span className="stat-value">{debts.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Morosos (+30 días)</span>
                    <span className="stat-value danger">
                        {debts.filter(d => getDaysOverdue(d.dueDate) > 30).length}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Monto Total</span>
                    <span className="stat-value">
                        ${debts.reduce((sum, d) => sum + (d.totalDebt || 0), 0).toFixed(2)}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Con Plan de Pago</span>
                    <span className="stat-value success">
                        {debts.filter(d => d.hasPlan).length}
                    </span>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={debts}
                loading={loading}
                actions={renderActions}
                pagination={true}
                pageSize={15}
            />

            {/* Payment Plan Modal */}
            <Modal
                isOpen={showPlanModal}
                onClose={() => setShowPlanModal(false)}
                title="Crear Plan de Pago"
                size="medium"
            >
                <div className="plan-form">
                    <div className="form-group">
                        <label>Número de Cuotas</label>
                        <input
                            type="number"
                            value={planData.installments}
                            onChange={(e) => setPlanData({ ...planData, installments: parseInt(e.target.value) })}
                            className="form-control"
                            min="2"
                            max="12"
                        />
                    </div>

                    <div className="form-group">
                        <label>Frecuencia</label>
                        <select
                            value={planData.frequency}
                            onChange={(e) => setPlanData({ ...planData, frequency: e.target.value })}
                            className="form-control"
                        >
                            <option value="weekly">Semanal</option>
                            <option value="biweekly">Quincenal</option>
                            <option value="monthly">Mensual</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Fecha de Inicio</label>
                        <input
                            type="date"
                            value={planData.startDate}
                            onChange={(e) => setPlanData({ ...planData, startDate: e.target.value })}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Notas</label>
                        <textarea
                            value={planData.notes}
                            onChange={(e) => setPlanData({ ...planData, notes: e.target.value })}
                            className="form-control"
                            rows="3"
                        />
                    </div>

                    <div className="modal-actions">
                        <button onClick={() => setShowPlanModal(false)} className="btn-secondary">
                            Cancelar
                        </button>
                        <button onClick={handleCreatePlan} className="btn-primary">
                            Crear Plan
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GestionDeudas;
