import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../common/Modal';
import { inventoryService } from '../../../services/inventoryService';
import { useToast } from '../../common/Toast';
import './ManualProductModal.css';

const productSchema = z.object({
    name: z.string()
        .min(1, 'El nombre es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre es muy largo'),
    price: z.number({ invalid_type_error: 'Precio requerido' })
        .positive('El precio debe ser mayor a 0')
        .max(10000, 'Precio excede el límite permitido'),
    quantity: z.number({ invalid_type_error: 'Cantidad requerida' })
        .int('Debe ser un número entero')
        .positive('Mínimo 1'),
    saveToInventory: z.boolean().optional(),
    code: z.string().optional()
});

const ManualProductModal = ({ isOpen, onClose, onAdd, initialName = '' }) => {
    const toast = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(productSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            price: '',
            quantity: 1,
            saveToInventory: false,
            code: ''
        }
    });

    const saveToInventory = watch('saveToInventory');

    useEffect(() => {
        if (isOpen) {
            reset({
                name: initialName || '',
                price: '',
                quantity: 1,
                saveToInventory: false,
                code: ''
            });
        }
    }, [isOpen, reset, initialName]);

    const onSubmit = async (data) => {
        try {
            if (data.saveToInventory) {
                setIsSaving(true);
                // Create in backend
                const productData = {
                    name: data.name,
                    price: data.price,
                    stock: 100, // Default initial stock for convenience
                    minStock: 5,
                    code: data.code || `MAN-${Date.now().toString().slice(-6)}`, // Auto-gen if empty
                    description: 'Creado desde Venta Manual',
                    categoryId: 1
                };

                const newProduct = await inventoryService.createProduct(productData);

                // Pass real product to parent
                onAdd({
                    ...newProduct,
                    quantity: data.quantity,
                    isManual: false
                });
                toast.success('Producto guardado en inventario y agregado');
            } else {
                // Manual (Temporary)
                onAdd({
                    ...data,
                    isManual: true
                });
            }
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Error al guardar producto: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Agregar Producto"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="manual-product-form">
                <div className="form-group">
                    <label>Nombre del Producto *</label>
                    <input
                        type="text"
                        className={`form-control ${errors.name ? 'error' : ''}`}
                        placeholder="Ej. Servicio de Delivery"
                        autoFocus
                        {...register('name')}
                    />
                    {errors.name && <span className="error-message">{errors.name.message}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Precio Unitario ($) *</label>
                        <div className="input-wrapper">
                            <span className="input-prefix">$</span>
                            <input
                                type="number"
                                step="0.01"
                                className={`form-control has-prefix ${errors.price ? 'error' : ''}`}
                                placeholder="0.00"
                                {...register('price', { valueAsNumber: true })}
                            />
                        </div>
                        {errors.price && <span className="error-message">{errors.price.message}</span>}
                    </div>

                    <div className="form-group">
                        <label>Cantidad *</label>
                        <input
                            type="number"
                            min="1"
                            className={`form-control ${errors.quantity ? 'error' : ''}`}
                            {...register('quantity', { valueAsNumber: true })}
                        />

                        {errors.quantity && <span className="error-message">{errors.quantity.message}</span>}
                    </div>
                </div>

                <div className={`option-card ${saveToInventory ? 'active' : ''}`} onClick={() => setValue('saveToInventory', !saveToInventory)}>
                    <div className="option-info">
                        <span className="option-title">Guardar en Inventario</span>
                        <span className="option-desc">Podrás buscar este producto nuevamente</span>
                    </div>
                    <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            {...register('saveToInventory')}
                        />
                        <span className="slider"></span>
                    </label>
                </div>

                {saveToInventory && (
                    <div className="form-group" style={{ marginTop: '10px', animation: 'fadeIn 0.3s' }}>
                        <label>Código / SKU (Opcional)</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Dejar vacío para generar automático"
                            {...register('code')}
                        />
                    </div>
                )}

                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn-cancel" disabled={isSaving}>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-add"
                        disabled={!isValid || isSaving}
                        style={{ opacity: isValid ? 1 : 0.7 }}
                    >
                        {isSaving ? 'Guardando...' : <span>+ Agregar Producto</span>}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ManualProductModal;
