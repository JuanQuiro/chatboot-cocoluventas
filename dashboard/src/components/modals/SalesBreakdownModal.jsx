import React, { useState, useMemo } from 'react';
import { X, DollarSign, Package, User, CreditCard, TrendingUp, Clock, ShoppingBag, BarChart3 } from 'lucide-react';

export default function SalesBreakdownModal({ isOpen, onClose, period, sales, total }) {
    const [activeTab, setActiveTab] = useState('overview'); // overview | products | payments

    if (!isOpen) return null;

    const hasSales = sales && sales.length > 0;
    const safeTotal = total ? parseFloat(total).toFixed(2) : "0.00";
    const count = sales ? sales.length : 0;

    // Translation map
    const periodName = {
        'daily': 'Hoy',
        'monthly': 'Este Mes',
        'weekly': 'Esta Semana'
    }[period] || period;

    // Calculate statistics
    const stats = useMemo(() => {
        if (!hasSales) return null;

        // Average ticket
        const avgTicket = (parseFloat(total) / count).toFixed(2);

        // Products breakdown
        const productsMap = {};
        const paymentsMap = { efectivo: 0, tarjeta: 0, transferencia: 0, credito: 0, mixto: 0 };

        sales.forEach(sale => {
            // Count products
            if (sale.products && Array.isArray(sale.products)) {
                sale.products.forEach(p => {
                    if (!productsMap[p.name]) {
                        productsMap[p.name] = { quantity: 0, revenue: 0 };
                    }
                    productsMap[p.name].quantity += p.quantity || 1;
                    productsMap[p.name].revenue += (p.price || 0) * (p.quantity || 1);
                });
            }

            // Count payment methods
            const method = (sale.paymentMethod || 'efectivo').toLowerCase();
            if (paymentsMap[method] !== undefined) {
                paymentsMap[method] += parseFloat(sale.total || 0);
            }
        });

        // Top products
        const topProducts = Object.entries(productsMap)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Payment methods distribution
        const paymentsMethods = Object.entries(paymentsMap)
            .filter(([_, amount]) => amount > 0)
            .map(([method, amount]) => ({
                method: method.charAt(0).toUpperCase() + method.slice(1),
                amount,
                percentage: ((amount / parseFloat(total)) * 100).toFixed(1)
            }));

        // Hourly distribution
        const hourlyData = {};
        sales.forEach(sale => {
            const hour = new Date(sale.date || Date.now()).getHours();
            hourlyData[hour] = (hourlyData[hour] || 0) + 1;
        });

        return {
            avgTicket,
            topProducts,
            paymentsMethods,
            hourlyData,
            totalProducts: Object.values(productsMap).reduce((sum, p) => sum + p.quantity, 0)
        };
    }, [hasSales, sales, total, count]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-slideUp border border-gray-100">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
                            <BarChart3 size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">
                                Ventas - {periodName}
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">
                                {hasSales ? `${count} pedido(s) • ${stats?.totalProducts || 0} productos` : 'Sin actividad'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="px-6 pt-6 pb-4 grid grid-cols-3 gap-4">
                    {/* Total Revenue */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 rounded-xl p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <p className="text-emerald-100 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Total</p>
                            <p className="text-2xl font-extrabold tracking-tight">${safeTotal}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <DollarSign size={12} className="text-emerald-200" />
                                <span className="text-[10px] text-emerald-100">{count} ventas</span>
                            </div>
                        </div>
                    </div>

                    {/* Average Ticket */}
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/50 rounded-xl p-4 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <p className="text-blue-100 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Ticket Promedio</p>
                            <p className="text-2xl font-extrabold tracking-tight">${stats?.avgTicket || '0.00'}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <TrendingUp size={12} className="text-blue-200" />
                                <span className="text-[10px] text-blue-100">por venta</span>
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-200/50 rounded-xl p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-2 w-10 h-10 bg-white/10 rounded-full blur-lg"></div>
                        <div className="relative z-10">
                            <p className="text-violet-100 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Productos</p>
                            <p className="text-2xl font-extrabold tracking-tight">{stats?.totalProducts || 0}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Package size={12} className="text-violet-200" />
                                <span className="text-[10px] text-violet-100">vendidos</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                {hasSales && (
                    <div className="px-6 border-b border-gray-100">
                        <div className="flex gap-1">
                            {[
                                { id: 'overview', label: 'Ventas', icon: ShoppingBag },
                                { id: 'products', label: 'Productos', icon: Package },
                                { id: 'payments', label: 'Pagos', icon: CreditCard }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 ${activeTab === tab.id
                                            ? 'text-blue-600 border-blue-600'
                                            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-gray-200">
                    {!hasSales ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <div className="p-4 bg-gray-50 rounded-full mb-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                                <Package size={32} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-400">No hay ventas en este período</p>
                        </div>
                    ) : (
                        <>
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-2.5">
                                    {sales.map((sale, i) => (
                                        <div key={i} className="group border border-gray-100 rounded-xl p-3.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm transition-all duration-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gray-100 p-2 rounded-full text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{sale.clientName || 'Cliente Ocasional'}</p>
                                                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                                                            <Clock size={10} />
                                                            {new Date(sale.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            <span>•</span>
                                                            <span className="font-mono">#{sale.id || i + 1}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-lg border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                                                    ${parseFloat(sale.total || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            {/* Products preview */}
                                            {sale.products && sale.products.length > 0 && (
                                                <div className="mt-2 pl-11 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Productos</p>
                                                    <ul className="text-xs text-gray-600 space-y-1">
                                                        {sale.products.slice(0, 3).map((p, j) => (
                                                            <li key={j} className="flex justify-between items-center">
                                                                <span className="flex items-center gap-1.5">
                                                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                                                                        {p.quantity}
                                                                    </span>
                                                                    <span className="truncate max-w-[180px] font-medium">{p.name}</span>
                                                                </span>
                                                                <span className="text-gray-400 font-mono text-[10px]">${((p.price || 0) * (p.quantity || 1)).toFixed(2)}</span>
                                                            </li>
                                                        ))}
                                                        {sale.products.length > 3 && (
                                                            <li className="text-gray-400 italic text-[10px] pt-1">
                                                                +{sale.products.length - 3} productos más
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                            {/* Payment Method */}
                                            {sale.paymentMethod && (
                                                <div className="mt-2 pl-11 flex items-center gap-2">
                                                    <CreditCard size={12} className="text-gray-400" />
                                                    <span className="text-[11px] text-gray-500 font-medium capitalize">
                                                        {sale.paymentMethod}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Products Tab */}
                            {activeTab === 'products' && stats && (
                                <div className="space-y-3">
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                                        <h3 className="text-sm font-bold text-blue-900 mb-2">🏆 Top Productos</h3>
                                        <p className="text-xs text-blue-600">Productos más vendidos por ingresos</p>
                                    </div>
                                    {stats.topProducts.length > 0 ? (
                                        stats.topProducts.map((product, i) => (
                                            <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full font-bold text-xs shadow-lg">
                                                        #{i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{product.name}</p>
                                                        <p className="text-xs text-gray-500">{product.quantity} unidades vendidas</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-emerald-600 text-sm">${product.revenue.toFixed(2)}</p>
                                                    <p className="text-[10px] text-gray-400">ingresos</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-400 text-sm py-8">No hay datos de productos</p>
                                    )}
                                </div>
                            )}

                            {/* Payments Tab */}
                            {activeTab === 'payments' && stats && (
                                <div className="space-y-3">
                                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4">
                                        <h3 className="text-sm font-bold text-purple-900 mb-2">💳 Métodos de Pago</h3>
                                        <p className="text-xs text-purple-600">Distribución de pagos por método</p>
                                    </div>
                                    {stats.paymentsMethods.length > 0 ? (
                                        stats.paymentsMethods.map((payment, i) => (
                                            <div key={i} className="relative overflow-hidden rounded-xl border border-gray-100">
                                                {/* Progress bar background */}
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-100 to-blue-100 transition-all duration-500"
                                                    style={{ width: `${payment.percentage}%` }}
                                                ></div>
                                                <div className="relative z-10 flex items-center justify-between p-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                                            <CreditCard size={16} className="text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">{payment.method}</p>
                                                            <p className="text-xs text-gray-500">{payment.percentage}% del total</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-bold text-gray-900 text-sm">${payment.amount.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-400 text-sm py-8">No hay datos de pagos</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        <span className="font-semibold">Última actualización:</span> {new Date().toLocaleTimeString()}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white text-sm rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
