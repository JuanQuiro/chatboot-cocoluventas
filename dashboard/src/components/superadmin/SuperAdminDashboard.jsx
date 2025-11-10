import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Building2, DollarSign, Activity, TrendingUp, 
    AlertTriangle, Database, Server, Clock, Zap
} from 'lucide-react';
import StatCard from '../ui/StatCard';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({
        totalTenants: 0,
        activeTenants: 0,
        totalUsers: 0,
        totalRevenue: 0,
        systemUptime: 0,
        activeConnections: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        requestsPerMinute: 0
    });

    const [recentActivity, setRecentActivity] = useState([]);
    const [tenants, setTenants] = useState([]);

    const loadDashboardData = useCallback(async () => {
        // Cargar datos del super admin
        // const data = await api.get('/api/superadmin/dashboard');
        
        // Mock data
        setStats({
            totalTenants: 25,
            activeTenants: 23,
            totalUsers: 450,
            totalRevenue: 125000,
            systemUptime: 2592000, // 30 días en segundos
            activeConnections: 1250,
            cpuUsage: 45,
            memoryUsage: 62,
            diskUsage: 38,
            requestsPerMinute: 3400
        });

        setTenants([
            { id: 'cocoluventas', name: 'Cocolu Ventas', users: 45, status: 'active', revenue: 15000 },
            { id: 'tenant2', name: 'Empresa ABC', users: 32, status: 'active', revenue: 12000 },
            { id: 'tenant3', name: 'Negocio XYZ', users: 28, status: 'active', revenue: 10000 },
        ]);
    }, []);

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, [loadDashboardData]);

    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        return `${days}d ${hours}h`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-white mb-2">
                    👑 Super Admin Panel
                </h1>
                <p className="text-blue-200">
                    Control Total del Sistema - Acceso a TODO
                </p>
            </motion.div>

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <StatCard
                        title="Total Clientes"
                        value={stats.totalTenants}
                        change={stats.activeTenants}
                        changeLabel={`${stats.activeTenants} activos`}
                        icon={<Building2 />}
                        trend="up"
                        color="blue"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <StatCard
                        title="Total Usuarios"
                        value={stats.totalUsers}
                        icon={<Users />}
                        color="green"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <StatCard
                        title="Ingresos Totales"
                        value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`}
                        icon={<DollarSign />}
                        color="amber"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <StatCard
                        title="Conexiones Activas"
                        value={stats.activeConnections}
                        icon={<Activity />}
                        color="purple"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <StatCard
                        title="Uptime"
                        value={formatUptime(stats.systemUptime)}
                        icon={<Clock />}
                        color="red"
                    />
                </motion.div>
            </div>

            {/* Métricas del Sistema */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <MetricCard
                    title="CPU Usage"
                    value={stats.cpuUsage}
                    max={100}
                    unit="%"
                    color="bg-blue-500"
                    icon={<Server />}
                />
                <MetricCard
                    title="Memory Usage"
                    value={stats.memoryUsage}
                    max={100}
                    unit="%"
                    color="bg-green-500"
                    icon={<Database />}
                />
                <MetricCard
                    title="Disk Usage"
                    value={stats.diskUsage}
                    max={100}
                    unit="%"
                    color="bg-amber-500"
                    icon={<Database />}
                />
            </div>

            {/* Tabla de Tenants */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
                <h2 className="text-2xl font-bold text-white mb-4">
                    Todos los Clientes
                </h2>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-blue-200 border-b border-white/10">
                                <th className="pb-3">Cliente</th>
                                <th className="pb-3">Usuarios</th>
                                <th className="pb-3">Estado</th>
                                <th className="pb-3">Ingresos</th>
                                <th className="pb-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map((tenant) => (
                                <tr key={tenant.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-4 text-white font-medium">{tenant.name}</td>
                                    <td className="py-4 text-blue-200">{tenant.users}</td>
                                    <td className="py-4">
                                        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                                            {tenant.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-blue-200">${tenant.revenue.toLocaleString()}</td>
                                    <td className="py-4">
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                                            Ver Detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

const MetricCard = ({ title, value, max, unit, color, icon }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">{title}</h3>
            <div className="text-blue-300">{icon}</div>
        </div>
        
        <div className="text-3xl font-bold text-white mb-2">
            {value}{unit}
        </div>

        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
                className={`h-full ${color} transition-all duration-500`}
                style={{ width: `${(value / max) * 100}%` }}
            />
        </div>
    </div>
);

export default SuperAdminDashboard;
