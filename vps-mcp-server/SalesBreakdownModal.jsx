import React from 'react';
import { X, DollarSign, Package, User } from 'lucide-react';

export default function SalesBreakdownModal({ isOpen, onClose, period, sales, total }) {
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-slideUp border border-gray-100">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                            <DollarSign size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">
                                Ventas - {periodName}
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">
                                {hasSales ? `Desglose de ${count} pedido(s)` : 'Sin actividad registrada'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Summary Card */}
                <div className="px-6 pt-6 pb-2">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-12 h-12 bg-black/5 rounded-full blur-lg"></div>

                        <div className="relative z-10">
                            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">Total Generado</p>
                            <p className="text-3xl font-extrabold tracking-tight">${safeTotal}</p>
                        </div>
                        <div className="text-right relative z-10">
                            <div className="flex items-center justify-end gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                <Package size={16} className="text-emerald-50" />
                                <span className="text-lg font-bold">{count}</span>
                            </div>
                            <p className="text-emerald-100 text-[10px] mt-1 font-medium">Pedidos</p>
                        </div>
                    </div>
                </div>

                {/* Content / List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-gray-200">
                    {!hasSales ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <div className="p-4 bg-gray-50 rounded-full mb-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                                <Package size={32} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-400">No hay ventas en este período</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sales.map((sale, i) => (
                                <div key={i} className="group border border-gray-100 rounded-xl p-3.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm transition-all duration-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-100 p-2 rounded-full text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{sale.clientName || 'Cliente Ocasional'}</p>
                                                <p className="text-[11px] text-gray-400 font-medium fle items-center gap-1">
                                                    {new Date(sale.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    <span className="mx-1">•</span>
                                                    ID: {sale.id || `#${i + 1}`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                                            ${parseFloat(sale.total || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    {/* Products preview (optional, hidden if not in data) */}
                                    {sale.products && sale.products.length > 0 && (
                                        <div className="mt-2 pl-11">
                                            <ul className="text-[11px] text-gray-500 space-y-0.5 border-l-2 border-gray-100 pl-2">
                                                {sale.products.slice(0, 2).map((p, j) => (
                                                    <li key={j} className="flex justify-between w-full">
                                                        <span className="truncate max-w-[150px]">{p.quantity}x {p.name}</span>
                                                    </li>
                                                ))}
                                                {sale.products.length > 2 && (
                                                    <li className="text-gray-400 italic">+{sale.products.length - 2} productos más</li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm rounded-xl font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        Cerrar Detalles
                    </button>
                </div>
            </div>
        </div>
    );
}
