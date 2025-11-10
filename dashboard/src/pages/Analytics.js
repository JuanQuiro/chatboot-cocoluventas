import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    // No intentar cargar si no hay token
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [metricsRes, eventsRes] = await Promise.all([
        fetch('http://localhost:3009/api/analytics/metrics'),
        fetch('http://localhost:3009/api/analytics/events?limit=20')
      ]);

      const metricsData = await metricsRes.json();
      const eventsData = await eventsRes.json();

      if (metricsData.success) setMetrics(metricsData.data);
      if (eventsData.success) setEvents(eventsData.data);
      setLoading(false);
    } catch (error) {
      // Solo loguear si hay token (estábamos autenticados)
      if (localStorage.getItem('token')) {
        console.error('Error fetching analytics:', error);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Solo cargar si hay token
    const token = localStorage.getItem('token');
    if (!token) return;
    
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  if (loading || !metrics) {
    return <div className="loading">Cargando analytics...</div>;
  }

  // Preparar datos para gráfico de mensajes por hora
  const hourlyData = metrics.messagesByHour.map((count, hour) => ({
    hour: `${hour}:00`,
    messages: count
  }));

  // Top búsquedas de productos
  const topSearches = metrics.productSearches.slice(0, 5);

  // Productos más vistos
  const topProducts = metrics.productViews.slice(0, 5);

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h2>📈 Analytics y Métricas</h2>
        <p>Monitoreo en tiempo real del chatbot</p>
      </div>

      {/* KPIs Principales */}
      <div className="kpis-grid">
        <div className="kpi-card">
          <div className="kpi-icon">💬</div>
          <div className="kpi-content">
            <div className="kpi-label">Total Mensajes</div>
            <div className="kpi-value">{metrics.totalMessages.toLocaleString()}</div>
            <div className="kpi-sub">
              ↑ {metrics.incomingMessages} recibidos · ↓ {metrics.outgoingMessages} enviados
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <div className="kpi-label">Usuarios</div>
            <div className="kpi-value">{metrics.uniqueUsers}</div>
            <div className="kpi-sub">
              🟢 {metrics.activeUsers} activos ahora
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">🛒</div>
          <div className="kpi-content">
            <div className="kpi-label">Conversión</div>
            <div className="kpi-value">{metrics.conversionRate}%</div>
            <div className="kpi-sub">
              {metrics.completedOrders} pedidos completados
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">⚡</div>
          <div className="kpi-content">
            <div className="kpi-label">Tiempo Respuesta</div>
            <div className="kpi-value">{metrics.averageResponseTime}ms</div>
            <div className="kpi-sub">
              Promedio de respuesta
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="analytics-charts">
        <div className="chart-section">
          <h3>📊 Mensajes por Hora</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="messages" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-row">
          <div className="chart-section half">
            <h3>🔍 Top Búsquedas</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topSearches} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="term" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#764ba2" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-section half">
            <h3>👁️ Productos Más Vistos</h3>
            <div className="products-list">
              {topProducts.map((product, index) => (
                <div key={product.id} className="product-item">
                  <div className="product-rank">#{index + 1}</div>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-views">{product.views} vistas</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Eventos Recientes */}
      <div className="events-section">
        <h3>📝 Eventos Recientes</h3>
        <div className="events-list">
          {events.map((event, index) => (
            <div key={index} className="event-item">
              <div className="event-type">{getEventIcon(event.type)}</div>
              <div className="event-details">
                <div className="event-title">{getEventTitle(event.type)}</div>
                <div className="event-time">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getEventIcon = (type) => {
  const icons = {
    message: '💬',
    product_view: '👁️',
    product_search: '🔍',
    order_completed: '✅',
    cart_abandoned: '🛒',
    support_ticket: '🎫',
    conversation_started: '🆕'
  };
  return icons[type] || '📌';
};

const getEventTitle = (type) => {
  const titles = {
    message: 'Nuevo mensaje',
    product_view: 'Producto visto',
    product_search: 'Búsqueda realizada',
    order_completed: 'Pedido completado',
    cart_abandoned: 'Carrito abandonado',
    support_ticket: 'Ticket de soporte',
    conversation_started: 'Nueva conversación'
  };
  return titles[type] || type;
};

export default Analytics;
