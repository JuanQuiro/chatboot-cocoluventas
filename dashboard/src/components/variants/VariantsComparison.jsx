import React from 'react';
import { X, Check, Minus } from 'lucide-react';
import QualityBadge from './QualityBadge';
import ProviderFlag from './ProviderFlag';

const VariantsComparison = ({ variants, onClose, onSelect }) => {
    if (!variants || variants.length === 0) return null;

    // Attributes to compare
    const attributes = [
        { label: 'Precio', key: 'precio_venta_usd', format: (v) => `$${v?.toFixed(2)}` },
        { label: 'Calidad', key: 'nivel_calidad', component: (v) => <QualityBadge quality={v} size="sm" /> },
        { label: 'Origen', key: 'proveedor_pais', component: (v, variant) => <ProviderFlag countryCode={v} name={variant.proveedor_nombre} /> },
        { label: 'Material', key: 'material' },
        { label: 'Acabado', key: 'acabado' },
        { label: 'Peso', key: 'peso_gramos', format: (v) => v ? `${v}g` : '-' },
        { label: 'Garantía', key: 'garantia_meses', format: (v) => v ? `${v} meses` : 'Sin garantía' },
        { label: 'Entrega', key: 'tiempo_entrega_promedio_dias', format: (v) => `~${v} días` },
        { label: 'Stock', key: 'stock_actual', format: (v) => v > 0 ? `${v} unid.` : 'Agotado' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Comparar Calidades</h3>
                        <p className="text-sm text-gray-500">
                            {variants[0]?.producto_base_nombre || 'Producto'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Comparison Table */}
                <div className="overflow-auto p-4">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-2 text-left text-gray-500 font-medium w-1/4">Característica</th>
                                {variants.map(variant => (
                                    <th key={variant.id} className="p-2 text-center w-1/4 bg-gray-50 min-w-[150px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-sm font-bold text-gray-700 line-clamp-1">
                                                {variant.nombre_variante}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {attributes.map((attr, idx) => (
                                <tr key={attr.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                    <td className="p-3 text-sm font-medium text-gray-600 border-b">
                                        {attr.label}
                                    </td>
                                    {variants.map(variant => {
                                        const value = variant[attr.key];
                                        return (
                                            <td key={variant.id} className="p-3 text-center border-b">
                                                <div className="flex justify-center">
                                                    {attr.component ? (
                                                        attr.component(value, variant)
                                                    ) : (
                                                        <span className="text-sm text-gray-800">
                                                            {attr.format ? attr.format(value) : (value || '-')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="p-4"></td>
                                {variants.map(variant => (
                                    <td key={variant.id} className="p-4 text-center">
                                        <button
                                            onClick={() => onSelect(variant)}
                                            className={`
                                                w-full py-2 rounded-lg text-sm font-bold transition-colors
                                                ${variant.nivel_calidad === 'luxury'
                                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                                    : variant.nivel_calidad === 'premium'
                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                        : 'bg-gray-800 hover:bg-gray-900 text-white'}
                                            `}
                                        >
                                            Seleccionar
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VariantsComparison;
