import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PaymentModal from '../components/sales/PaymentModal';

import { accountsService } from '../services/accountsService';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import './ClientHistory.css';

const ClientHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clientData, setClientData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        loadHistory();
    }, [id]);

    const loadHistory = async () => {
        try {
            const response = await accountsService.getAccountHistory(id);
            if (response.success && response.data) {
                setClientData(response.data.client);
                setHistory(response.data.history || []);
            } else if (response.client) {
                setClientData(response.client);
                setHistory(response.history || []);
            }
        } catch (error) {
            console.error("Error loading history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterPayment = async (data) => {
        try {
            await accountsService.registerPayment(data);
            setShowPaymentModal(false);
            loadHistory(); // Refresh to show new payment
            // Optional: Toast success
        } catch (error) {
            console.error('Error registering payment:', error);
            // Optional: Toast error
        }
    };

    const totalSpent = React.useMemo(() => {
        return history
            .filter(item => item.type === 'order')
            .reduce((sum, item) => sum + Math.abs(item.amount), 0);
    }, [history]);

    const balanceColor = clientData?.balance <= 0 ? 'text-green-600' : 'text-red-600';
    const balanceLabel = clientData?.balance < 0 ? 'Saldo a Favor' : 'Deuda Pendiente';
    const balanceValue = Math.abs(clientData?.balance || 0);

    const columns = [
        {
            key: 'date',
            label: 'Fecha',
            render: (val) => new Date(val).toLocaleDateString()
        },
        {
            key: 'type',
            label: 'Tipo',
            render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${val === 'order' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {val === 'order' ? '📦 Pedido' : '💰 Pago'}
                </span>
            )
        },
        { key: 'reference', label: 'Referencia' },
        {
            key: 'amount',
            label: 'Monto',
            render: (val, row) => (
                <span className={`font-bold ${row.type === 'payment' ? 'text-green-600' : 'text-red-500'}`}>
                    ${Math.abs(val).toFixed(2)}
                </span>
            )
        },
        {
            key: 'balance_after',
            label: 'Saldo',
            render: (val) => (
                <span className={val <= 0 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                    ${Math.abs(val).toFixed(2)}
                </span>
            )
        },
        { key: 'notes', label: 'Notas' },
    ];

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!clientData) return <div className="p-8 text-center text-gray-500">Cliente no encontrado</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 text-gray-500 hover:text-indigo-600 flex items-center gap-2 transition-colors font-medium"
                >
                    ← Volver a Clientes
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{clientData.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                            <span className="flex items-center gap-1"><span className="text-indigo-500">🆔</span> {clientData.cedula || 'Sin Cédula'}</span>
                            <span className="flex items-center gap-1"><span className="text-indigo-500">📞</span> {clientData.phone || 'Sin Teléfono'}</span>
                            <span className="flex items-center gap-1"><span className="text-indigo-500">✉️</span> {clientData.email || 'Sin Email'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">{balanceLabel}</span>
                    <span className={`text-4xl font-extrabold ${balanceColor}`}>
                        ${balanceValue.toFixed(2)}
                    </span>
                    {clientData.balance < 0 && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mt-2">Saldo a Favor</span>}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Comprado</span>
                    <span className="text-4xl font-extrabold text-blue-600">
                        ${totalSpent.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400 mt-2">Histórico Global</span>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Pedidos Realizados</span>
                    <span className="text-4xl font-extrabold text-purple-600">
                        {history.filter(h => h.type === 'order').length}
                    </span>
                    <span className="text-xs text-gray-400 mt-2">Transacciones</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Historial de Transacciones</h2>
                </div>
                <DataTable
                    columns={columns}
                    data={history}
                    pagination={true}
                    pageSize={15}
                />
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                account={selectedOrder}
                onClose={() => setShowPaymentModal(false)}
                onSubmit={handleRegisterPayment}
            />
        </div>
    );
};

export default ClientHistory;
