import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import bcvService from '../services/bcvService';
import SalesBreakdownModal from '../components/modals/SalesBreakdownModal';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // BCV Rate State
  const [bcvRate, setBcvRate] = useState(0);
  const [editingRate, setEditingRate] = useState(false);
  const [newRate, setNewRate] = useState('');
  const [rateLoading, setRateLoading] = useState(false);

  // Sales Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPeriod, setModalPeriod] = useState('daily');
  const [modalSales, setModalSales] = useState([]);
  const [modalTotal, setModalTotal] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3008/api'}/dashboard`);
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  }, []);

  const fetchBcvRate = useCallback(async () => {
    try {
      const data = await bcvService.getRate();
      if (data && data.data) {
        setBcvRate(data.data.dollar || 0);
      } else if (data && data.dollar) {
        setBcvRate(data.dollar);
      }
    } catch (error) {
      console.error('Error fetching BCV rate:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchBcvRate();
    const interval = setInterval(fetchDashboardData, 30000); // Reduced frequency
    return () => clearInterval(interval);
  }, [fetchDashboardData, fetchBcvRate]);

  const handleSaveRate = async () => {
    if (!newRate || isNaN(parseFloat(newRate))) return;
    setRateLoading(true);
    try {
      await bcvService.setRate(parseFloat(newRate));
      setBcvRate(parseFloat(newRate));
      setEditingRate(false);
      setNewRate('');
    } catch (error) {
      console.error('Error saving rate:', error);
      alert('Error al guardar la tasa');
    } finally {
      setRateLoading(false);
    }
  };

  const handleSyncRate = async () => {
    setRateLoading(true);
    try {
      const data = await bcvService.syncRate();
      if (data && data.data) {
        setBcvRate(data.data.dollar || 0);
      }
    } catch (error) {
      console.error('Error syncing rate:', error);
      alert('Error al sincronizar la tasa');
    } finally {
      setRateLoading(false);
    }
  };

  const handleOpenSalesModal = async (period) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3008/api'}/sales/by-period?period=${period}`);
      const data = await response.json();
      if (data.success) {
        setModalSales(data.data.sales || []);
        setModalTotal(data.data.total || 0);
        setModalPeriod(period);
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      alert('Error cargando datos de ventas');
    }
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="error-message">Error cargando datos del dashboard. Por favor intente más tarde.</div>;
  }

  const { analytics, workload = [], production_workload = [] } = dashboardData;

  return (
    <div className="dashboard-page">
      <h2>Dashboard General</h2>

      {/* --- KPIs FINANCIEROS --- */}
      <div className="metrics-grid" style={{ marginBottom: '20px' }}>
        <div
          className="metric-card clickable-card"
          style={{ borderColor: '#4caf50', cursor: 'pointer' }}
          onClick={() => handleOpenSalesModal('daily')}
          title="Click para ver detalles"
        >
          <div className="metric-icon">💵</div>
          <div className="metric-content">
            <h3>Ventas Diario (USD)</h3>
            <p className="metric-value">${analytics.daily?.total?.toFixed(2) || '0.00'}</p>
            <small>{analytics.daily?.orders || 0} pedidos</small>
          </div>
        </div>
        <div
          className="metric-card clickable-card"
          style={{ borderColor: '#2196f3', cursor: 'pointer' }}
          onClick={() => handleOpenSalesModal('weekly')}
          title="Click para ver detalles"
        >
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <h3>Ventas Semanal (USD)</h3>
            <p className="metric-value">${analytics.weekly?.total?.toFixed(2) || '0.00'}</p>
            <small>Sáb - Vie</small>
          </div>
        </div>
        <div
          className="metric-card clickable-card"
          style={{ borderColor: '#9c27b0', cursor: 'pointer' }}
          onClick={() => handleOpenSalesModal('monthly')}
          title="Click para ver detalles"
        >
          <div className="metric-icon">📆</div>
          <div className="metric-content">
            <h3>Ventas Mensual (USD)</h3>
            <p className="metric-value">${analytics.monthly?.total?.toFixed(2) || '0.00'}</p>
            <small>Mes actual</small>
          </div>
        </div>
      </div>

      {/* Sales Breakdown Modal */}
      <SalesBreakdownModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        period={modalPeriod}
        sales={modalSales}
        total={modalTotal}
      />

      {/* --- TASA BCV EDITABLE --- */}
      <div className="metrics-grid" style={{ marginBottom: '20px' }}>
        <div className="metric-card" style={{ borderColor: '#ff9800', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
          <div className="metric-icon">🏦</div>
          <div className="metric-content">
            <h3>Tasa BCV Registrada</h3>
            {editingRate ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                <input
                  type="number"
                  step="0.01"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder={bcvRate.toString()}
                  style={{
                    width: '120px',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px'
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveRate}
                  disabled={rateLoading}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ✓
                </button>
                <button
                  onClick={() => { setEditingRate(false); setNewRate(''); }}
                  style={{
                    padding: '8px 16px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <p className="metric-value" style={{ color: '#ea580c', fontSize: '28px' }}>
                  {bcvRate.toFixed(2)} Bs/$
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => { setEditingRate(true); setNewRate(bcvRate.toString()); }}
                    style={{
                      padding: '6px 12px',
                      background: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={handleSyncRate}
                    disabled={rateLoading}
                    style={{
                      padding: '6px 12px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Sincronizar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Métricas Operativas */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">💬</div>
          <div className="metric-content">
            <h3>Mensajes</h3>
            <p className="metric-value">{analytics.totalMessages || 0}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Usuarios Activos</h3>
            <p className="metric-value">{analytics.activeUsers || 0}</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Carga de Fabricantes */}
        <div className="chart-card">
          <h3>🏭 Carga de Fabricantes ({production_workload.length})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={production_workload} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nombre" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="current_workload" fill="#ff9800" name="Pedidos Activos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Carga de Vendedores */}
        <div className="chart-card">
          <h3>👥 Carga de Vendedores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workload}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="currentClients" fill="#8884d8" name="Clientes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
