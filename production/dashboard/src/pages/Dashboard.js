import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3009/api/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  const { analytics, sellers, workload } = dashboardData;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="dashboard-page">
      <h2>Dashboard General</h2>

      {/* Métricas Principales */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">💬</div>
          <div className="metric-content">
            <h3>Mensajes Totales</h3>
            <p className="metric-value">{analytics.totalMessages}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Usuarios Únicos</h3>
            <p className="metric-value">{analytics.uniqueUsers}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🛒</div>
          <div className="metric-content">
            <h3>Pedidos Completados</h3>
            <p className="metric-value">{analytics.completedOrders}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Tasa de Conversión</h3>
            <p className="metric-value">{analytics.conversionRate}%</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <h3>Tiempo Respuesta</h3>
            <p className="metric-value">{analytics.averageResponseTime}ms</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <h3>Conversaciones Activas</h3>
            <p className="metric-value">{analytics.activeConversations}</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Distribución de Vendedores */}
        <div className="chart-card">
          <h3>Carga de Trabajo por Vendedor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workload}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="currentClients" fill="#8884d8" name="Clientes Actuales" />
              <Bar dataKey="maxClients" fill="#82ca9d" name="Capacidad Máxima" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de Vendedores */}
        <div className="chart-card">
          <h3>Estado de Vendedores</h3>
          <div className="sellers-status">
            {sellers.sellersStats.map((seller, index) => (
              <div key={seller.id} className="seller-status-item">
                <div className="seller-info">
                  <span className="seller-name">{seller.name}</span>
                  <span className={`seller-status ${seller.status}`}>
                    {seller.status === 'available' ? '🟢' : seller.status === 'busy' ? '🟡' : '🔴'}
                    {seller.status}
                  </span>
                </div>
                <div className="seller-clients">
                  {seller.currentClients} clientes • ⭐ {seller.rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estadísticas de Vendedores */}
      <div className="stats-summary">
        <div className="stats-card">
          <h3>Resumen de Vendedores</h3>
          <div className="stats-content">
            <div className="stat-row">
              <span>Total de Vendedores:</span>
              <strong>{sellers.totalSellers}</strong>
            </div>
            <div className="stat-row">
              <span>Vendedores Activos:</span>
              <strong>{sellers.activeSellers}</strong>
            </div>
            <div className="stat-row">
              <span>Asignaciones Totales:</span>
              <strong>{sellers.totalAssignments}</strong>
            </div>
            <div className="stat-row">
              <span>Conversaciones Activas:</span>
              <strong>{sellers.activeConversations}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
