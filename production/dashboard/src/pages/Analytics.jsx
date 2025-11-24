import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, MessageSquare, Clock, BarChart3 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Analytics.css';

const COLORS = ['#667eea', '#4ade80', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['analytics'],
        queryFn: async () => {
            const res = await fetch('/api/analytics/metrics');
            if (!res.ok) throw new Error('Error cargando analytics');
            return res.json();
        }
    });

    // Sellers workload
    const { data: workload } = useQuery({
        queryKey: ['sellers-workload'],
        queryFn: async () => {
            const res = await fetch('/api/sellers/workload');
            if (!res.ok) throw new Error('Error cargando workload');
            const data = await res.json();
            return data.data || data || [];
        }
    });

    if (isLoading) {
        return (
            <div className="analytics-page loading">
                <div className="spinner"></div>
                <p>Cargando analytics...</p>
            </div>
        );
    }

    const metrics = analytics?.data || analytics || {};
    const sellersData = workload || [];

    return (
        <div className="analytics-page">
            <div className="page-header">
                <div>
                    <h1>📊 Analytics</h1>
                    <p className="subtitle">Métricas y estadísticas del chatbot</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon messages">
                        <MessageSquare size={24} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-label">Total Mensajes</div>
                        <div className="metric-value">{metrics.totalMessages || 0}</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon users">
                        <Users size={24} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-label">Conversaciones Activas</div>
                        <div className="metric-value">{metrics.activeConversations || 0}</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon rate">
                        <TrendingUp size={24} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-label">Tasa de Respuesta</div>
                        <div className="metric-value">{metrics.responseRate || 0}%</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon time">
                        <Clock size={24} />
                    </div>
                    <div className="metric-content">
                        <div className="metric-label">Tiempo Promedio</div>
                        <div className="metric-value">{metrics.avgResponseTime || 0}s</div>
                    </div>
                </div>
            </div>

            {/* Sellers Workload Table */}
            <div className="chart-section">
                <h2>
                    <BarChart3 size={20} />
                    Carga de Trabajo por Vendedor
                </h2>
                {sellersData.length > 0 ? (
                    <div className="workload-table-container">
                        <table className="workload-table">
                            <thead>
                                <tr>
                                    <th>Vendedor</th>
                                    <th>Clientes Actuales</th>
                                    <th>Capacidad Máxima</th>
                                    <th>Carga (%)</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellersData.map(seller => {
                                    const loadPercent = parseFloat(seller.load) || 0;
                                    return (
                                        <tr key={seller.id}>
                                            <td className="seller-name">{seller.name}</td>
                                            <td className="text-center">{seller.currentClients || 0}</td>
                                            <td className="text-center">{seller.maxClients || 10}</td>
                                            <td>
                                                <div className="load-bar-container">
                                                    <div
                                                        className="load-bar"
                                                        style={{
                                                            width: `${Math.min(loadPercent, 100)}%`,
                                                            backgroundColor: loadPercent >= 80 ? '#ef4444' : loadPercent >= 50 ? '#f59e0b' : '#4ade80'
                                                        }}
                                                    ></div>
                                                    <span className="load-text">{loadPercent.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${seller.status}`}>
                                                    {seller.status === 'available' ? 'Disponible' :
                                                        seller.status === 'busy' ? 'Ocupado' : 'Offline'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-chart">
                        <p>No hay datos de carga de trabajo disponibles</p>
                    </div>
                )}
            </div>

            {/* Charts if data available */}
            {metrics.hourlyDistribution && (
                <div className="chart-section">
                    <h2>📈 Distribución por Hora</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={metrics.hourlyDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="messages" stroke="#667eea" name="Mensajes" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {metrics.categoryDistribution && (
                <div className="chart-section">
                    <h2>🗂️ Por Categoría</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={metrics.categoryDistribution}
                                dataKey="count"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {metrics.categoryDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
