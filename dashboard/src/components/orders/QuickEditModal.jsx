import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const QuickEditModal = ({ isOpen, onClose, order, onSave }) => {
    const [formData, setFormData] = useState({
        status: '',
        total: 0
    });

    useEffect(() => {
        if (order) {
            setFormData({
                status: order.status || order.estado_entrega || 'pendiente',
                total: parseFloat(order.total || order.total_usd || 0)
            });
        }
    }, [order]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'total' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = () => {
        onSave(order.id, formData);
    };

    if (!order) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Editar Pedido #${order.id}`}
            size="small"
        >
            <div className="quick-edit-form">
                <div className="form-group">
                    <label>Estado</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="pendiente">Pendiente</option>
                        <option value="pago confirmado">Pago Confirmado</option>
                        <option value="apartado">Apartado</option>
                        <option value="vectorizado">Vectorizado</option>
                        <option value="en proceso">En Proceso</option>
                        <option value="empaquetado">Empaquetado</option>
                        <option value="listo">Listo</option>
                        <option value="entregado">Entregado</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Monto Total ($)</label>
                    <input
                        type="number"
                        name="total"
                        step="0.01"
                        value={formData.total}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={handleSubmit} className="btn-primary">Guardar Cambios</button>
                </div>
            </div>
        </Modal>
    );
};

export default QuickEditModal;
