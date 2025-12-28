import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal'; // Using the shared Modal
import { X } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, product, onSave }) => {
    const isEdit = !!product;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: {
            name: '',
            code: '',
            category: '',
            price: 0,
            cost: 0,
            stock: 0,
            minStock: 0,
            description: ''
        }
    });

    // Reset form when product changes or modal opens
    useEffect(() => {
        if (isOpen) {
            if (product) {
                // Edit mode: populate fields
                reset({
                    name: product.name || '',
                    code: product.code || '',
                    category: product.category || '',
                    price: product.price || 0,
                    cost: product.cost || 0,
                    stock: product.stock || 0,
                    minStock: product.minStock || 0,
                    description: product.description || ''
                });
            } else {
                // Create mode: generate code and reset others
                reset({
                    name: '',
                    code: 'PRD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                    category: '',
                    price: 0,
                    cost: 0,
                    stock: 0,
                    minStock: 0,
                    description: ''
                });
            }
        }
    }, [isOpen, product, reset]);

    const onSubmit = (data) => {
        // Convert number strings to numbers
        const formattedData = {
            ...data,
            price: parseFloat(data.price),
            cost: parseFloat(data.cost),
            stock: parseInt(data.stock),
            minStock: parseInt(data.minStock)
        };
        onSave(formattedData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Editar Producto' : 'Nuevo Producto'}
            size="large" // Use large for 2 columns
        >
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">

                {/* Row 1: Code & Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="block text-sm font-medium mb-1">Código *</label>
                        <input
                            {...register('code', { required: 'El código es requerido' })}
                            className={`w-full p-2 border rounded ${errors.code ? 'border-red-500' : 'border-gray-300'} bg-gray-100 cursor-not-allowed`}
                            readOnly // Code is auto-generated or fixed on edit
                        />
                        {errors.code && <span className="text-red-500 text-xs">{errors.code.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium mb-1">Nombre *</label>
                        <input
                            {...register('name', { required: 'El nombre es requerido' })}
                            className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Ej. Detergente Liquido"
                        />
                        {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                    </div>
                </div>

                {/* Row 2: Category & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="block text-sm font-medium mb-1">Categoría</label>
                        <input
                            {...register('category')}
                            className="w-full p-2 border border-gray-300 rounded"
                            placeholder="Ej. Limpieza"
                        />
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium mb-1">Precio ($) *</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('price', {
                                required: 'El precio es requerido',
                                min: { value: 0, message: 'El precio debe ser mayor o igual a 0' }
                            })}
                            className={`w-full p-2 border rounded ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
                    </div>
                </div>

                {/* Row 3: Cost, Stock, Min Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                        <label className="block text-sm font-medium mb-1">Costo ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('cost')}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium mb-1">Stock Actual *</label>
                        <input
                            type="number"
                            {...register('stock', {
                                required: 'El stock es requerido',
                                min: { value: 0, message: 'No puede ser negativo' }
                            })}
                            className={`w-full p-2 border rounded ${errors.stock ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.stock && <span className="text-red-500 text-xs">{errors.stock.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
                        <input
                            type="number"
                            {...register('minStock', { min: 0 })}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                        {...register('description')}
                        className="w-full p-2 border border-gray-300 rounded"
                        rows="3"
                    ></textarea>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar Producto' : 'Crear Producto')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ProductModal;
