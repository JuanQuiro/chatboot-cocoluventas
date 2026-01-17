import React from 'react';
import VariantCard from './VariantCard';
import { Loader } from 'lucide-react';

const VariantsList = ({ variants, loading, onSelect, selectedId, onCompare }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader className="animate-spin text-indigo-500" size={24} />
                <span className="ml-2 text-gray-500 text-sm">Cargando variantes...</span>
            </div>
        );
    }

    if (!variants || variants.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
                No se encontraron variantes disponibles para este producto.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {variants.map(variant => (
                <VariantCard
                    key={variant.id}
                    variant={variant}
                    isSelected={selectedId === variant.id}
                    onSelect={onSelect}
                    onCompare={onCompare}
                />
            ))}
        </div>
    );
};

export default VariantsList;
