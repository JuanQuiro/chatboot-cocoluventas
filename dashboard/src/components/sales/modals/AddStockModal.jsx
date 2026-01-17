import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import { useForm } from 'react-hook-form';
import { useToast } from '../../common/Toast';
import { PackagePlus } from 'lucide-react';
import './ManualProductModal.css'; // Reusing styles for now

const AddStockModal = ({ isOpen, onClose, product, onStockAdded }) => {
    const toast = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm();

    useEffect(() => {
        if (isOpen && product) {
            reset({
                quantityToAdd: ''
            });
            // Small delay to ensure render before focus
            setTimeout(() => setFocus('quantityToAdd'), 100);
        }
    }, [isOpen, product, reset, setFocus]);

    const onSubmit = async (data) => {
        const qty = parseInt(data.quantityToAdd, 10);
        if (!qty || qty <= 0) return;

        setIsSaving(true);
        try {
            await onStockAdded(product, qty);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar stock');
        } finally {
            setIsSaving(false);
        }
    };

    if (!product) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PackagePlus size={20} />
                    <span>Agregar Stock Rápido</span>
                </div>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="manual-product-form">
                <div className="form-group">
                    <label style={{ fontSize: '0.9rem', color: '#6b7280' }}>Producto</label>
                    <div style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        marginBottom: '16px',
                        padding: '8px 12px',
                        background: '#f3f4f6',
                        borderRadius: '6px'
                    }}>
                        {product.name}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Stock Actual</label>
                        <input
                            type="text"
                            disabled
                            value={product.stock || 0}
                            className="form-control"
                            style={{ background: '#f9fafb' }}
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Cantidad a Agregar *</label>
                        <input
                            type="number"
                            min="1"
                            className="form-control"
                            placeholder="Ej. 10"
                            {...register('quantityToAdd', { required: true, min: 1 })}
                        />
                    </div>
                </div>

                <div style={{
                    marginTop: '12px',
                    fontSize: '0.85rem',
                    color: '#6b7280',
                    fontStyle: 'italic'
                }}>
                    * Esto actualizará el inventario y agregará el producto al carrito automáticamente.
                </div>

                <div className="modal-footer" style={{ marginTop: '24px' }}>
                    <button type="button" onClick={onClose} className="btn-cancel" disabled={isSaving}>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-add"
                        disabled={isSaving}
                        style={{ background: 'var(--success-color, #10b981)' }}
                    >
                        {isSaving ? 'Actualizando...' : 'Confirmar y Agregar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddStockModal;
