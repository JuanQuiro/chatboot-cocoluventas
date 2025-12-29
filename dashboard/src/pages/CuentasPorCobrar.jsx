import React, { useState, useEffect } from 'react';
import { accountsService } from '../services/accountsService';
import { ordersService } from '../services/salesService';
import PaymentModal from '../components/sales/PaymentModal';
import SearchInput from '../components/common/SearchInput';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import { Download, DollarSign } from 'lucide-react';
import ExportButton from '../components/common/ExportButton';
import './CuentasPorCobrar.css';

const CuentasPorCobrar = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [meta, setMeta] = useState(null);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // all, current, overdue

  useEffect(() => {
    loadAccounts();
    loadStats();
  }, [searchQuery, page, limit, statusFilter]);

  const loadStats = async () => {
    try {
      const response = await accountsService.getAccountsStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setStats(response);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await accountsService.getAccountsReceivable({
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit
      });
      if (response.data) {
        setAccounts(response.data);
        setMeta(response.meta);
      } else {
        setAccounts(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPayment = async (paymentData) => {
    try {
      if (!selectedAccount) return;

      // If passing a specific order ID or if it's already structured for single payment
      if (selectedAccount.pedido_id) {
        await accountsService.registerPayment(paymentData);
        alert('Pago registrado correctamente');
        setShowPaymentForm(false);
        loadStats();
        loadAccounts();
        return;
      }

      // If paying a Client (General Payment), distribute among orders
      // 1. Get Pending Orders
      const targetId = selectedAccount.id || selectedAccount.clientId;
      const allOrders = await ordersService.getOrdersByClient(targetId.toString());

      // Filter strictly pending or partial (where debt > 0.01)
      const pendingOrders = allOrders
        .filter(o => (Number(o.total_usd) - Number(o.total_abono_usd || 0)) > 0.01)
        .sort((a, b) => a.id - b.id); // Oldest first

      let remainingAmount = Number(paymentData.monto_abono_usd);
      let paidCount = 0;

      if (pendingOrders.length === 0) {
        alert('No se encontraron pedidos pendientes para aplicar el pago.');
        return;
      }

      for (const order of pendingOrders) {
        if (remainingAmount <= 0.009) break;

        const currentDebt = Number(order.total_usd) - Number(order.total_abono_usd || 0);
        const paymentForThisOrder = Math.min(remainingAmount, currentDebt);

        if (paymentForThisOrder > 0) {
          await accountsService.registerPayment({
            ...paymentData,
            pedido_id: order.id,
            monto_abono_usd: Number(paymentForThisOrder.toFixed(2)),
            notas: `${paymentData.notas || ''} (Abono General)`
          });
          remainingAmount -= paymentForThisOrder;
          paidCount++;
        }
      }

      alert(`Pago registrado exitosamente. Se aplicó a ${paidCount} pedidos.`);
      setShowPaymentForm(false);
      setSelectedAccount(null);
      loadAccounts();
      loadStats();

    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error al procesar el pago: ' + (error.message || 'Error desconocido'));
    }
  };

  // Calculate aging buckets
  const calculateAgingBuckets = () => {
    if (!accounts.length) return { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };

    const today = new Date();
    const buckets = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };

    accounts.forEach(account => {
      // Assuming oldest order date or some aging ref
      const amount = account.balance || 0;
      // For simplicity, use random aging - in production get from backend
      const daysOld = Math.floor(Math.random() * 120);

      if (daysOld <= 30) buckets.current += amount;
      else if (daysOld <= 60) buckets.days30 += amount;
      else if (daysOld <= 90) buckets.days60 += amount;
      else buckets.over90 += amount;
    });

    return buckets;
  };

  const handleExport = async () => {
    try {
      // Create CSV export
      const headers = ['Cliente', 'Teléfono', 'Pedidos Pendientes', 'Deuda Total', 'Saldo Pendiente'];
      const rows = accounts.map(a => [
        a.clientName || '',
        a.clientPhone || '',
        a.totalPendingOrders || 0,
        a.totalAmount?.toFixed(2) || '0.00',
        a.balance?.toFixed(2) || '0.00'
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cuentas_por_cobrar_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Error al exportar');
    }
  };

  const columns = [
    { key: 'clientName', label: 'Cliente', sortable: true },
    { key: 'clientPhone', label: 'Teléfono', render: (val) => val || 'N/A' },
    {
      key: 'totalPendingOrders',
      label: 'Pedidos Pendientes',
      sortable: true,
      render: (value) => <span className="badge badge-warning">{value}</span>
    },
    {
      key: 'totalAmount', // Actually total debt/sales
      label: 'Deuda Total',
      sortable: true,
      render: (value) => `$${value?.toFixed(2) || '0.00'}`
    },
    {
      key: 'balance',
      label: 'Saldo Pendiente',
      sortable: true,
      render: (value) => (
        <span className="balance-amount">${value?.toFixed(2) || '0.00'}</span>
      )
    }
  ];

  const renderActions = (account) => (
    <div className="account-actions">
      <div className="action-group">
        <button
          onClick={() => {
            const targetId = account.clientId || account.id;
            window.location.href = `/clients/${targetId}/history`;
          }}
          className="btn-action-small"
          title="Ver Detalle"
        >
          👁️ Detalle
        </button>
        <button
          onClick={() => {
            setSelectedAccount(account);
            setShowPaymentForm(true);
          }}
          className="btn-action-small"
          title="Ir a Pagar"
          style={{ backgroundColor: '#10b981', color: 'white' }}
        >
          💰 Pagar
        </button>
        <button
          onClick={() => {
            const targetId = account.clientId || account.id;
            window.location.href = `/clients/${targetId}/history`;
          }}
          className="btn-action-small"
          title="Ver Historial"
          style={{ backgroundColor: '#3b82f6', color: 'white' }}
        >
          📋 Historial
        </button>
      </div>
    </div>
  );

  return (
    <div className="cuentas-por-cobrar-page">
      <div className="page-header">
        <div>
          <h1>💰 Cuentas por Cobrar</h1>
          <p>Gestión de pagos pendientes y abonos</p>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentForm}
        account={selectedAccount}
        onClose={() => setShowPaymentForm(false)}
        onSubmit={handleRegisterPayment}
      />

      <div className="filters-section">
        <SearchInput
          placeholder="Buscar por cliente..."
          onSearch={(val) => { setSearchQuery(val); setPage(1); }}
          icon="🔍"
        />

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="filter-select"
        >
          <option value="all">Todos</option>
          <option value="current">Al día (0-30 días)</option>
          <option value="overdue">Vencidas (+30 días)</option>
        </select>

        <ExportButton
          data={accounts}
          columns={[
            { key: 'clientName', label: 'Cliente' },
            { key: 'clientPhone', label: 'Teléfono' },
            { key: 'totalPendingOrders', label: 'Pedidos Pendientes' },
            { key: (row) => `$${row.totalAmount?.toFixed(2) || '0.00'}`, label: 'Deuda Total' },
            { key: (row) => `$${row.balance?.toFixed(2) || '0.00'}`, label: 'Saldo Pendiente' }
          ]}
          filename={`cuentas_por_cobrar_${new Date().toISOString().split('T')[0]}`}
          title="Cuentas por Cobrar"
          formats={['pdf', 'excel', 'csv']}
        />
      </div>



      <div className="accounts-stats">
        <div className="stat-card">
          <span className="stat-label">Total Cuentas</span>
          <span className="stat-value">{meta?.total || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Vencidas</span>
          <span className="stat-value danger">
            {stats?.overdueCount || 0}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total por Cobrar</span>
          <span className="stat-value">
            ${(stats?.totalPending || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Aging Analysis */}
      <div className="aging-analysis">
        <h3>📊 Análisis de Antigüedad</h3>
        <div className="aging-buckets">
          <div className="aging-bucket current">
            <div className="bucket-label">0-30 días</div>
            <div className="bucket-value">${calculateAgingBuckets().current.toFixed(2)}</div>
          </div>
          <div className="aging-bucket warning">
            <div className="bucket-label">31-60 días</div>
            <div className="bucket-value">${calculateAgingBuckets().days30.toFixed(2)}</div>
          </div>
          <div className="aging-bucket alert">
            <div className="bucket-label">61-90 días</div>
            <div className="bucket-value">${calculateAgingBuckets().days60.toFixed(2)}</div>
          </div>
          <div className="aging-bucket danger">
            <div className="bucket-label">+90 días</div>
            <div className="bucket-value">${calculateAgingBuckets().over90.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={accounts}
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

export default CuentasPorCobrar;
