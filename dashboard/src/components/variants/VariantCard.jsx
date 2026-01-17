import React from 'react';
import { Package, Clock, Info, CheckCircle } from 'lucide-react';
import QualityBadge from './QualityBadge';
import ProviderFlag from './ProviderFlag';

const VariantCard = ({ variant, onSelect, isSelected, onCompare }) => {
    const {
        nombre_variante,
        proveedor_nombre,
        proveedor_pais,
        nivel_calidad,
        precio_venta_usd,
        stock_actual,
        material,
        acabado,
        garantia_meses,
        tiempo_entrega_promedio_dias
    } = variant;

    return (
        <div
            className={`
                relative flex flex-col p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md
                ${isSelected
                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                    : 'border-gray-200 bg-white hover:border-indigo-300'}
            `}
            onClick={() => onSelect && onSelect(variant)}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-1">
                    <QualityBadge quality={nivel_calidad} size="sm" />
                    <h4 className="font-semibold text-gray-800 text-sm line-clamp-2" title={nombre_variante}>
                        {nombre_variante}
                    </h4>
                </div>
                <ProviderFlag countryCode={proveedor_pais} name={proveedor_nombre} minimal />
            </div>

            {/* Specs */}
            <div className="flex-1 space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Material:</span>
                    <span className="font-medium text-gray-900">{material || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Acabado:</span>
                    <span className="font-medium text-gray-900">{acabado || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Garantía:</span>
                    <span className={`font-medium ${garantia_meses > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {garantia_meses > 0 ? `${garantia_meses} meses` : 'Sin garantía'}
                    </span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-gray-100">
                    <span className="text-gray-500 flex items-center gap-1">
                        <Clock size={12} /> Entrega:
                    </span>
                    <span className="font-medium text-blue-600">
                        ~{tiempo_entrega_promedio_dias || 7} días
                    </span>
                </div>
            </div>

            {/* Price & Action */}
            <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Precio unitario</span>
                    <span className="text-lg font-bold text-gray-900">
                        ${precio_venta_usd?.toFixed(2)}
                    </span>
                </div>

                <div className="flex gap-2">
                    {onCompare && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onCompare(variant); }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Comparar"
                        >
                            <Info size={16} />
                        </button>
                    )}
                    <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full 
                        ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}
                    `}>
                        {isSelected ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                    </div>
                </div>
            </div>

            {/* Stock Badge */}
            <div className="absolute top-2 right-2">
                {stock_actual > 0 ? (
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Package size={10} /> {stock_actual}
                    </span>
                ) : (
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full">
                        Agotado
                    </span>
                )}
            </div>
        </div>
    );
};

export default VariantCard;
