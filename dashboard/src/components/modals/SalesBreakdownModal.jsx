import React from 'react';
import { X, Calendar, DollarSign, Package, User } from 'lucide-react';

export default function SalesBreakdownModal({ isOpen, onClose, period, sales, total }) {
    if (!isOpen) return null;

    const periodLabels = {
        daily: 'Hoy',
        weekly: 'Esta Semana',
        monthly: 'Este Mes'
    };

    const formatCurrency = (amount) => `$${parseFloat(amount || 0).toFixed(2)}`;
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-VE', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <DollarSign className="text-indigo-600" size={24} />
                            Ventas - {periodLabels[period]}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Desglose detallado de {sales.length} {sales.length === 1 ? 'pedido' : 'pedidos'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Total Summary */}
                <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total del Período</p>
                            <p className="text-3xl font-bold text-green-700 mt-1">{formatCurrency(total)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Cantidad de Pedidos</p>
                            <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
                        </div>
                    </div>
                </div>

                {/* Sales List */}
                <div className="overflow-y-auto max-h-[calc(90vh-240px)] p-6 space-y-3">
                    {sales.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Package size={48} className="mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No hay ventas en este período</p>
                        </div>
                    ) : (
                        sales.map((sale) => (
                            <div
                                key={sale.id}
                                className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all hover:border-indigo-200"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900">Pedido #{sale.id}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sale.estado_entrega === 'entregado'
                                                    ? 'bg-green-100 text-green-700'
                                                    : sale.estado_entrega === 'pendiente'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {sale.estado_entrega || 'pendiente'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <User size={14} />
                                                {sale.cliente_nombre}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {formatDate(sale.fecha_pedido)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-indigo-600">
                                            {formatCurrency(sale.total_usd)}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {sale.metodo_pago || 'efectivo'}
                                        </p>
                                    </div>
                                </div>

                                {/* Products Summary */}
                                {sale.productos && sale.productos.length > 0 && (
                                    <div className="pt-3 border-t border-gray-50">
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                            Productos ({sale.productos.length})
                                        </p>
                                        <div className="space-y-1">
                                            {sale.productos.slice(0, 3).map((prod, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        {prod.cantidad}x {prod.nombre}
                                                    </span>
                                                    <span className="font-medium text-gray-900">
                                                        {formatCurrency(prod.precio_unitario * prod.cantidad)}
                                                    </span>
                                                </div>
                                            ))}
                                            {sale.productos.length > 3 && (
                                                <p className="text-xs text-indigo-600 font-medium">
                                                    +{sale.productos.length - 3} más...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
