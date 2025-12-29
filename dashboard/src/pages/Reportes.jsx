// Reportes.jsx - Dashboard Avanzado
import React, { useState, useEffect } from 'react';
import { salesService } from '../services/salesService';
import { inventoryService } from '../services/inventoryService';
import { clientsService } from '../services/clientsService';
import { useToast } from '../components/common/Toast';
import ExportButton from '../components/common/ExportButton';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './Reportes.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Reportes = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const [topProducts, setTopProducts] = useState([]);
    const [topClients, setTopClients] = useState([]);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalRevenue: 0,
        totalOrders: 0,
        averageTicket: 0
    });

    useEffect(() => {
        loadReports();
    }, [dateRange]);

    const loadReports = async () => {
        setLoading(true);
        try {
            // 1. Load Sales Stats (Ingresos, Ventas, Pedidos)
            // Backend returns { success: true, data: { totalIngresos, count, ... } }
            const salesResponse = await salesService.getSalesStats();
            const salesStats = salesResponse.data || {};

            setStats({
                totalSales: salesStats.count || 0,
                // Map totalIngresos to totalRevenue. If undefined, check keys.
                totalRevenue: salesStats.totalIngresos || salesStats.revenue || 0,
                totalOrders: salesStats.count || 0,
                averageTicket: (salesStats.count > 0 && salesStats.totalIngresos)
                    ? (salesStats.totalIngresos / salesStats.count)
                    : 0
            });

            // 2. Load Top Products
            // Backend returns { success: true, data: { topProducts: [...] } }
            const inventoryResponse = await inventoryService.getStats();
            const productData = inventoryResponse.data || {};

            if (productData.topProducts) {
                setTopProducts(productData.topProducts);
            } else if (Array.isArray(productData)) {
                // Fallback if it returns array directly
                setTopProducts(productData);
            }

            // 3. Load Top Clients
            const clientsResponse = await clientsService.getTopClients(5);
            // clientsResponse might be { success: true, data: [...] } or just array
            const clientsList = Array.isArray(clientsResponse)
                ? clientsResponse
                : (Array.isArray(clientsResponse.data) ? clientsResponse.data : []);

            setTopClients(clientsList);

        } catch (error) {
            console.error('Error loading reports:', error);
            toast.error('Error al cargar reportes');
        } finally {
            setLoading(false);
        }
    };

    // Prepare data for exports
    const salesData = [
        { metric: 'Ingresos Totales', value: `$${stats.totalRevenue.toFixed(2)}` },
        { metric: 'Ventas Realizadas', value: stats.totalSales },
        { metric: 'Promedio por Venta', value: `$${stats.averageTicket.toFixed(2)}` }
    ];

    const salesColumns = [
        { key: 'metric', label: 'Métrica' },
        { key: 'value', label: 'Valor' }
    ];

    const productColumns = [
        { key: 'name', label: 'Producto' },
        { key: 'quantitySold', label: 'Vendidos' },
        { key: (row) => `$${row.revenue?.toFixed(2) || '0.00'}`, label: 'Ingresos' }
    ];

    const clientColumns = [
        { key: (row) => `${row.nombre || row.name} ${row.apellido || ''}`, label: 'Cliente' },
        { key: (row) => row.compras_count || row.purchaseCount || '-', label: 'Compras' },
        { key: (row) => `$${(row.total_compras || row.totalSpent || 0).toFixed(2)}`, label: 'Total Gastado' }
    ];

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Top Productos Vendidos' },
        },
    };

    const productChartData = {
        labels: topProducts.map(p => p.name),
        datasets: [
            {
                label: 'Unidades Vendidas',
                data: topProducts.map(p => p.quantitySold),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    const clientChartData = {
        labels: topClients.map(c => c.nombre || c.name),
        datasets: [
            {
                label: 'Total Comprado ($)',
                data: topClients.map(c => c.total_compras || c.totalSpent),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div><p>Cargando datos reales...</p></div>;

    return (
        <div className="reportes-page">
            <div className="page-header">
                <div>
                    <h1>📊 Reportes y Analytics</h1>
                    <p>Visión general del negocio en tiempo real</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <ExportButton
                        data={salesData}
                        columns={salesColumns}
                        filename={`ventas_resumen_${new Date().toISOString().split('T')[0]}`}
                        title="Resumen de Ventas"
                        formats={['pdf', 'excel', 'csv']}
                    />
                </div>
            </div>

            {/* Estadísticas Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <span className="stat-label">Ingresos Totales</span>
                        <span className="stat-value">${stats.totalRevenue.toFixed(2)}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🛒</div>
                    <div className="stat-content">
                        <span className="stat-label">Ventas Realizadas</span>
                        <span className="stat-value">{stats.totalSales}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <span className="stat-label">Promedio por Venta</span>
                        <span className="stat-value">${stats.averageTicket.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            {/* Gráficos */}
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '2rem' }}>
                <div className="chart-container" style={{ background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>🔥 Productos Más Vendidos</h3>
                    {topProducts.length > 0 ? (
                        <Bar options={chartOptions} data={productChartData} />
                    ) : (
                        <div className="empty-state">
                            <span className="empty-state-icon">📊</span>
                            <p className="empty-state-text">Sin datos de productos</p>
                            <span className="empty-state-subtext">Realiza ventas para ver el análisis</span>
                        </div>
                    )}
                </div>
                <div className="chart-container" style={{ background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>👑 Mejores Clientes</h3>
                    {topClients.length > 0 ? (
                        <Bar options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Top Clientes por Compra' } } }} data={clientChartData} />
                    ) : (
                        <div className="empty-state">
                            <span className="empty-state-icon">👥</span>
                            <p className="empty-state-text">Sin datos de clientes</p>
                            <span className="empty-state-subtext">Tus clientes destacadados aparecerán aquí</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tablas Detalladas */}
            <div className="tables-grid">
                <div className="table-card">
                    <h3>Detalle de Productos Top</h3>
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Vendidos</th>
                                <th>Ingresos Generados</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.map((p, index) => (
                                <tr key={index}>
                                    <td>{p.name}</td>
                                    <td>{p.quantitySold}</td>
                                    <td>${p.revenue?.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="table-card">
                    <h3>Detalle de Clientes Top</h3>
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Compras</th>
                                <th>Total Gastado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topClients.map((c, index) => (
                                <tr key={index}>
                                    <td>{c.nombre || c.name} {c.apellido}</td>
                                    <td>{c.compras_count || c.purchaseCount || '-'}</td>
                                    <td>${(c.total_compras || c.totalSpent || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reportes;
