import React, { useState } from 'react';
import Modal from '../common/Modal';
import {
    Calendar,
    Box,
    Hash,
    ArrowRightLeft,
    TrendingUp,
    TrendingDown,
    User,
    FileText,
    Copy,
    Check
} from 'lucide-react';

const MovementDetailModal = ({ isOpen, onClose, movement }) => {
    const [copiedId, setCopiedId] = useState(null);

    if (!movement) return null;

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopiedId(type);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeConfig = (type) => {
        const configs = {
            'entrada': { label: 'Entrada de Stock', color: 'green', icon: TrendingUp },
            'salida': { label: 'Salida de Stock', color: 'red', icon: TrendingDown },
            'ajuste': { label: 'Ajuste de Inventario', color: 'blue', icon: ArrowRightLeft },
            'devolucion': { label: 'Devolución', color: 'purple', icon: ArrowRightLeft }
        };
        return configs[type] || { label: type, color: 'gray', icon: Box };
    };

    const typeConfig = getTypeConfig(movement.originalType || movement.type);
    const TypeIcon = typeConfig.icon;

    // Helper for color classes
    const getColorClasses = (color) => {
        const map = {
            green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', iconBg: 'bg-green-100' },
            red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', iconBg: 'bg-red-100' },
            blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100' },
            purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-100' },
            gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', iconBg: 'bg-gray-100' }
        };
        return map[color] || map.gray;
    };

    const colors = getColorClasses(typeConfig.color);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={null} // Custom header
            size="medium"
        >
            <div className="overflow-hidden rounded-t-xl -mx-6 -mt-6">
                {/* Premium Header */}
                <div className={`${colors.bg} px-8 py-6 border-b ${colors.border} flex items-center justify-between`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${colors.iconBg} ${colors.text} ring-4 ring-white`}>
                            <TypeIcon size={28} />
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${colors.text} tracking-tight`}>{typeConfig.label}</h2>
                            <p className={`text-xs ${colors.text} opacity-80 uppercase tracking-widest font-bold mt-0.5`}>
                                Movimiento #{movement.id}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`text-3xl font-black ${colors.text} tracking-tight`}>
                            {movement.type === 'salida' ? '-' : '+'}{movement.quantity}
                        </span>
                        <span className={`block text-xs font-bold ${colors.text} opacity-70 uppercase tracking-wider`}>Unidades</span>
                    </div>
                </div>

                <div className="p-6 space-y-6 bg-white">
                    {/* Timestamp Card */}
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                        <Calendar size={20} className="text-gray-400" />
                        <span className="font-medium text-sm capitalize">{formatDate(movement.date)}</span>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Box size={14} /> Producto
                            </h3>
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all hover:shadow-md">
                                <div className="mb-4">
                                    <span className="text-lg font-bold text-gray-900 block leading-tight">{movement.product.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-gray-600">
                                        <Hash size={12} />
                                        {movement.product.code}
                                    </div>
                                    <button
                                        onClick={() => handleCopy(movement.product.code, 'sku')}
                                        className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50"
                                        title="Copiar SKU"
                                    >
                                        {copiedId === 'sku' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stock Changes Section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <ArrowRightLeft size={14} /> Balance de Stock
                            </h3>
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                                {/* Background decoration */}
                                <div className={`absolute top-0 right-0 w-20 h-20 ${colors.bg} rounded-bl-full opacity-20 -mr-10 -mt-10 pointer-events-none`}></div>

                                <div className="text-center z-10">
                                    <span className="text-xs font-semibold text-gray-500 block mb-1 uppercase tracking-wide">Anterior</span>
                                    <span className="text-2xl font-medium text-gray-700">{movement.previousStock}</span>
                                </div>
                                <div className="text-gray-300 z-10">
                                    <ArrowRightLeft size={24} />
                                </div>
                                <div className="text-center z-10">
                                    <span className="text-xs font-semibold text-gray-500 block mb-1 uppercase tracking-wide">Nuevo</span>
                                    <span className={`text-3xl font-bold ${colors.text}`}>{movement.newStock}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 my-2"></div>

                    {/* Footer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} /> Responsable
                            </h4>
                            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white">
                                    {movement.user.name.charAt(0)}
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-800 block">{movement.user.name}</span>
                                    {movement.orderId && (
                                        <span className="text-xs text-indigo-600 font-medium">
                                            Referencia: Pedido #{movement.orderId}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText size={14} /> Notas
                            </h4>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 italic leading-relaxed min-h-[72px] flex items-center">
                                {movement.notes || 'No se registraron notas adicionales para este movimiento.'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-5 flex justify-between items-center border-t border-gray-200">
                    <span className="text-xs font-mono text-gray-400">ID_REF: {movement.id}</span>
                    <button
                        onClick={onClose}
                        className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Cerrar Detalle
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default MovementDetailModal;
