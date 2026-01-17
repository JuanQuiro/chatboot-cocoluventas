import React, { useState, useMemo } from 'react';
import { X, DollarSign, User, CreditCard, TrendingUp, Clock, ShoppingBag, CheckCircle, AlertCircle, Package } from 'lucide-react';

export default function SalesBreakdownModal({ isOpen, onClose, period, sales, total }) {
    const [activeTab, setActiveTab] = useState('overview'); // overview | payments | status

    const hasSales = sales && sales.length > 0;
    const safeTotal = total ? parseFloat(total).toFixed(2) : "0.00";
    const count = sales ? sales.length : 0;

    // Translation map
    const periodName = {
        'daily': 'Hoy',
        'monthly': 'Este Mes',
        'weekly': 'Esta Semana'
    }[period] || period;

    // Calculate statistics with REAL data structure
    const stats = useMemo(() => {
        if (!hasSales) return null;

        const avgTicket = (parseFloat(total) / count).toFixed(2);

        // Payment methods
        const paymentsMap = {};
        let totalPaid = 0;
        let totalPending = 0;
        let withIVA = 0;
        let withDiscount = 0;
        let withDelivery = 0;

        sales.forEach(sale => {
            const method = sale.metodo_pago || 'Efectivo';
            const normalizedMethod = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
            paymentsMap[normalizedMethod] = (paymentsMap[normalizedMethod] || 0) + parseFloat(sale.total_usd || 0);

            const abonado = parseFloat(sale.total_abono_usd || 0);
            const totalSale = parseFloat(sale.total_usd || 0);
            if (abonado >= totalSale) {
                totalPaid += totalSale;
            } else {
                totalPending += (totalSale - abonado);
            }

            if (parseFloat(sale.monto_iva_usd || 0) > 0) withIVA++;
            if (parseFloat(sale.monto_descuento_usd || 0) > 0) withDiscount++;
            if (parseFloat(sale.monto_delivery_usd || 0) > 0) withDelivery++;
        });

        const paymentsMethods = Object.entries(paymentsMap)
            .filter(([_, amount]) => amount > 0)
            .map(([method, amount]) => ({
                method,
                amount,
                percentage: ((amount / parseFloat(total)) * 100).toFixed(1)
            }))
            .sort((a, b) => b.amount - a.amount);

        // Status distribution
        const statusMap = {};
        sales.forEach(sale => {
            const status = sale.estado_entrega || 'pendiente';
            statusMap[status] = (statusMap[status] || 0) + 1;
        });

        return {
            avgTicket,
            paymentsMethods,
            totalPaid,
            totalPending,
            withIVA,
            withDiscount,
            withDelivery,
            statusMap
        };
    }, [hasSales, sales, total, count]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-slideUp border border-gray-100">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
                            <ShoppingBag size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">
                                Ventas - {periodName}
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">
                                {hasSales ? `${count} pedido(s) registrados` : 'Sin actividad'}
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

                    {/* Payment Status */}
                    <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-200/50 rounded-xl p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-2 w-10 h-10 bg-white/10 rounded-full blur-lg"></div>
                        <div className="relative z-10">
                            <p className="text-violet-100 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Cobrado</p>
                            <p className="text-2xl font-extrabold tracking-tight">${stats?.totalPaid.toFixed(2) || '0.00'}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <CheckCircle size={12} className="text-violet-200" />
                                <span className="text-[10px] text-violet-100">pagado</span>
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
                                { id: 'payments', label: 'Métodos de Pago', icon: CreditCard },
                                { id: 'status', label: 'Estado', icon: Package }
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
                                    {sales.map((sale, i) => {
                                        const clientName = `${sale.cliente_nombre || ''} ${sale.cliente_apellido || ''}`.trim() || 'Cliente Ocasional';
                                        const isPaid = parseFloat(sale.total_abono_usd || 0) >= parseFloat(sale.total_usd || 0);
                                        const hasFinancialDetails = sale.monto_iva_usd > 0 || sale.monto_descuento_usd > 0 || sale.monto_delivery_usd > 0;

                                        return (
                                            <div key={i} className="group border border-gray-100 rounded-xl p-3.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm transition-all duration-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-gray-100 p-2 rounded-full text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                            <User size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">{clientName}</p>
                                                            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                                                                <Clock size={10} />
                                                                {new Date(sale.fecha_pedido || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                <span>•</span>
                                                                <span className="font-mono">#{sale.id}</span>
                                                                {sale.metodo_pago && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="capitalize">{sale.metodo_pago}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-3 py-1.5 ${isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'} text-sm font-bold rounded-lg border group-hover:bg-emerald-100 transition-colors`}>
                                                            ${parseFloat(sale.total_usd || 0).toFixed(2)}
                                                        </span>
                                                        {!isPaid && (
                                                            <p className="text-[10px] text-amber-600 mt-0.5 font-medium">
                                                                Pend: ${(parseFloat(sale.total_usd || 0) - parseFloat(sale.total_abono_usd || 0)).toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Financial Details */}
                                                {hasFinancialDetails && (
                                                    <div className="mt-2 pl-11 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Desglose</p>
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Subtotal:</span>
                                                                <span className="font-mono text-gray-800">${parseFloat(sale.subtotal_usd || 0).toFixed(2)}</span>
                                                            </div>
                                                            {sale.monto_descuento_usd > 0 && (
                                                                <div className="flex justify-between text-red-600">
                                                                    <span>Descuento:</span>
                                                                    <span className="font-mono">-${parseFloat(sale.monto_descuento_usd).toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                            {sale.monto_iva_usd > 0 && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">IVA:</span>
                                                                    <span className="font-mono text-gray-800">${parseFloat(sale.monto_iva_usd).toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                            {sale.monto_delivery_usd > 0 && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Delivery:</span>
                                                                    <span className="font-mono text-gray-800">${parseFloat(sale.monto_delivery_usd).toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Payment Status Badge */}
                                                <div className="mt-2 pl-11 flex items-center gap-2">
                                                    {isPaid ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold border border-emerald-200">
                                                            <CheckCircle size={10} />
                                                            Pagado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-semibold border border-amber-200">
                                                            <AlertCircle size={10} />
                                                            Pendiente
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-gray-500 capitalize">{sale.estado_entrega}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Payments Tab */}
                            {activeTab === 'payments' && stats && (
                                <div className="space-y-3">
                                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4">
                                        <h3 className="text-sm font-bold text-purple-900 mb-2">💳 Métodos de Pago</h3>
                                        <p className="text-xs text-purple-600">Distribución de ingresos por método</p>
                                    </div>
                                    {stats.paymentsMethods.length > 0 ? (
                                        stats.paymentsMethods.map((payment, i) => (
                                            <div key={i} className="relative overflow-hidden rounded-xl border border-gray-100">
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

                            {/* Status Tab */}
                            {activeTab === 'status' && stats && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                                        <h3 className="text-sm font-bold text-blue-900 mb-2">📦 Estado de Pedidos</h3>
                                        <p className="text-xs text-blue-600">Distribución por estado de entrega</p>
                                    </div>

                                    {/* Financial Summary */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                            <p className="text-emerald-600 text-xs font-semibold mb-1">✓ Cobrado</p>
                                            <p className="text-2xl font-bold text-emerald-700">${stats.totalPaid.toFixed(2)}</p>
                                        </div>
                                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                            <p className="text-amber-600 text-xs font-semibold mb-1">⏳ Pendiente</p>
                                            <p className="text-2xl font-bold text-amber-700">${stats.totalPending.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Features Usage */}
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-gray-700 text-xs font-semibold mb-3">Características Aplicadas</p>
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div>
                                                <p className="text-2xl font-bold text-gray-800">{stats.withIVA}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">con IVA</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-800">{stats.withDiscount}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">con Descuento</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-800">{stats.withDelivery}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">con Delivery</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Distribution */}
                                    {Object.keys(stats.statusMap).length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-700">Estados de Entrega:</p>
                                            {Object.entries(stats.statusMap).map(([status, count]) => (
                                                <div key={status} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                                                    <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                                                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        <span className="font-semibold">Actualizado:</span> {new Date().toLocaleTimeString()}
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
