import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import './DeliveryDateModal.css';

const DeliveryDateModal = ({ isOpen, onClose, order, onSave }) => {
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('12:00');
    const [notes, setNotes] = useState('');
    const [priority, setPriority] = useState('normal');

    useEffect(() => {
        if (order?.fecha_entrega) {
            const date = new Date(order.fecha_entrega);
            setDeliveryDate(date.toISOString().split('T')[0]);
            setDeliveryTime(date.toTimeString().slice(0, 5));
        } else {
            setDeliveryDate('');
            setDeliveryTime('12:00');
        }
        setNotes(order?.delivery_notes || '');

        // Auto-calculate priority based on date
        if (order?.fecha_entrega) {
            const daysUntil = getDaysUntilDelivery(order.fecha_entrega);
            if (daysUntil <= 2) setPriority('urgent');
            else if (daysUntil <= 5) setPriority('high');
            else setPriority('normal');
        }
    }, [order]);

    const getDaysUntilDelivery = (dateString) => {
        const deliveryDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = deliveryDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!deliveryDate) {
            alert('Por favor selecciona una fecha de entrega');
            return;
        }

        const dateTime = new Date(`${deliveryDate}T${deliveryTime}`);

        onSave(order.id, {
            fecha_entrega: dateTime.toISOString(),
            delivery_notes: notes,
            priority
        });

        onClose();
    };

    if (!isOpen) return null;

    const daysUntil = deliveryDate ? getDaysUntilDelivery(deliveryDate) : null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content delivery-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📅 Fecha de Entrega</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {order && (
                        <div className="order-info">
                            <p><strong>Pedido:</strong> #{order.id}</p>
                            <p><strong>Cliente:</strong> {order.client?.name || 'Sin datos'}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>
                                <Calendar size={18} />
                                Fecha de Entrega
                            </label>
                            <input
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <Clock size={18} />
                                Hora de Entrega
                            </label>
                            <input
                                type="time"
                                value={deliveryTime}
                                onChange={(e) => setDeliveryTime(e.target.value)}
                                className="form-control"
                            />
                        </div>

                        {daysUntil !== null && (
                            <div className={`delivery-indicator ${daysUntil <= 2 ? 'urgent' : daysUntil <= 5 ? 'soon' : 'normal'}`}>
                                <AlertCircle size={18} />
                                {daysUntil < 0 && <span>⚠️ Fecha vencida ({Math.abs(daysUntil)} días atrás)</span>}
                                {daysUntil === 0 && <span>🔴 Entrega HOY</span>}
                                {daysUntil === 1 && <span>🟠 Entrega MAÑANA</span>}
                                {daysUntil > 1 && <span>Entrega en {daysUntil} días</span>}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Prioridad</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="form-control"
                            >
                                <option value="normal">Normal</option>
                                <option value="high">Alta</option>
                                <option value="urgent">Urgente</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Notas de Entrega (Opcional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Instrucciones especiales, dirección, etc..."
                                className="form-control"
                                rows="3"
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn-secondary">
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary">
                                💾 Guardar Fecha
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDateModal;
