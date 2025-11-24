import React, { useState, useEffect } from 'react';
import { useMetaBilling } from '../hooks/useApi';
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/MetaBilling.css';

const COLORS = ['#667eea', '#4ade80', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function MetaBilling() {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const { data: billing, isLoading } = useMetaBilling(dateRange);

    const mockData = {
        summary: {
            totalMessages: 15420,
            totalCost: 2314.50,
            averageCostPerMessage: 0.15
        },
        messageTypes: [
            { name: 'Marketing', count: 8420, cost: 1263.00 },
            { name: 'Utility', count: 5200, cost: 780.00 },
            { name: 'Authentication', count: 1800, cost: 271.50 }
        ],
        categories: [
            { name: 'Texto', count: 12000, cost: 1800.00 },
            { name: 'Imagen', count: 2420, cost: 363.00 },
            { name: 'Documento', count: 800, cost: 120.00 },
            { name: 'Video', count: 200, cost: 31.50 }
        ],
        monthly: [
            { month: 'Nov', messages: 15420, cost: 2314.50 },
            { month: 'Oct', messages: 14280, cost: 2142.00 },
            { month: 'Sep', messages: 13890, cost: 2083.50 },
            { month: 'Ago', messages: 16200, cost: 2430.00 },
            { month: 'Jul', messages: 14950, cost: 2242.50 },
            { month: 'Jun', messages: 15680, cost: 2352.00 }
        ]
    };

    const data = billing?.data || mockData;

    if (isLoading) {
        return (
            <div className="billing-page loading">
                <div className="spinner"></div>
                <p>Cargando datos de facturación...</p>
            </div>
        );
    }

    return (
        <div className="billing-page">
            <div className="page-header">
                <div>
                    <h1>💰 Facturación Meta</h1>
                    <p className="subtitle">WhatsApp Business API - Costos y Métricas</p>
                </div>
                <button className="btn-export">
                    <Download size={16} />
                    Exportar Reporte
                </button>
            </div>

            {/* Date Range Selector */}
            <div className="date-selector">
                <div className="date-inputs">
                    <div className="date-group">
                        <label>Desde</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="date-input"
                        />
                    </div>
                    <div className="date-group">
                        <label>Hasta</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="date-input"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="card-icon messages">
                        <TrendingUp size={24} />
                    </div>
                    <div className="card-content">
                        <div className="card-label">Total Mensajes</div>
                        <div className="card-value">{data.summary.totalMessages.toLocaleString()}</div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon cost">
                        <DollarSign size={24} />
                    </div>
                    <div className="card-content">
                        <div className="card-label">Costo Total</div>
                        <div className="card-value">${data.summary.totalCost.toFixed(2)}</div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon average">
                        <Calendar size={24} />
                    </div>
                    <div className="card-content">
                        <div className="card-label">Promedio por Mensaje</div>
                        <div className="card-value">${data.summary.averageCostPerMessage.toFixed(4)}</div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Message Types Pie Chart */}
                <div className="chart-card">
                    <h3>📊 Por Tipo de Mensaje</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.messageTypes}
                                dataKey="cost"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={(entry) => `$${entry.cost.toFixed(0)}`}
                            >
                                {data.messageTypes.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Categories Bar Chart */}
                <div className="chart-card">
                    <h3>📂 Por Categoría</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.categories}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            <Legend />
                            <Bar dataKey="cost" fill="#667eea" name="Costo ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Trend Line Chart */}
                <div className="chart-card full-width">
                    <h3>📈 Tendencia Mensual</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.monthly}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="messages"
                                stroke="#4ade80"
                                name="Mensajes"
                                strokeWidth={2}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="cost"
                                stroke="#667eea"
                                name="Costo ($)"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pricing Table */}
            <div className="pricing-section">
                <h2>💵 Tarifas Actuales de Meta</h2>
                <div className="pricing-table-container">
                    <table className="pricing-table">
                        <thead>
                            <tr>
                                <th>Tipo de Mensaje</th>
                                <th>Categoría</th>
                                <th>Costo (USD)</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Marketing</td>
                                <td>Promocional</td>
                                <td>$0.15</td>
                                <td>Mensajes promocionales y ofertas</td>
                            </tr>
                            <tr>
                                <td>Utility</td>
                                <td>Transaccional</td>
                                <td>$0.15</td>
                                <td>Confirmaciones, actualizaciones</td>
                            </tr>
                            <tr>
                                <td>Authentication</td>
                                <td>OTP</td>
                                <td>$0.15</td>
                                <td>Códigos de verificación</td>
                            </tr>
                            <tr>
                                <td>Service</td>
                                <td>Atención</td>
                                <td>$0.00</td>
                                <td>Respuestas dentro de 24h (gratis)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="pricing-note">
                    * Precios para región América Latina. Pueden variar según país.
                </p>
            </div>
        </div>
    );
}
