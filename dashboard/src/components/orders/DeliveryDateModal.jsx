import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, FileText, Flag } from 'lucide-react';
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

        // Auto-calculate priority based on date if not already set manually?
        // Logic kept similar to original but allowing manual override via state
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
                    <h2><Calendar size={20} /> Fecha de Entrega</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {order && (
                        <div className="order-info">
                            <div>
                                <p><strong>Cliente:</strong></p>
                                <p>{order.client?.name || 'Sin datos'}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p><strong>Pedido:</strong></p>
                                <p>#{order.id}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>
                                    <Calendar size={16} />
                                    Fecha
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
                                    <Clock size={16} />
                                    Hora
                                </label>
                                <input
                                    type="time"
                                    value={deliveryTime}
                                    onChange={(e) => setDeliveryTime(e.target.value)}
                                    className="form-control"
                                />
                            </div>
                        </div>

                        {daysUntil !== null && (
                            <div className={`delivery-indicator ${daysUntil <= 2 ? 'urgent' : daysUntil <= 5 ? 'soon' : 'normal'}`}>
                                <AlertCircle size={20} />
                                <div>
                                    {daysUntil < 0 && <span>Fecha vencida ({Math.abs(daysUntil)} días atrás)</span>}
                                    {daysUntil === 0 && <span>Entrega HOY</span>}
                                    {daysUntil === 1 && <span>Entrega MAÑANA</span>}
                                    {daysUntil > 1 && <span>Entrega en {daysUntil} días</span>}
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label><Flag size={16} /> Prioridad del Pedido</label>
                            <div className="priority-selector">
                                <div
                                    className={`priority-option normal ${priority === 'normal' ? 'selected' : ''}`}
                                    onClick={() => setPriority('normal')}
                                >
                                    Normal
                                </div>
                                <div
                                    className={`priority-option high ${priority === 'high' ? 'selected' : ''}`}
                                    onClick={() => setPriority('high')}
                                >
                                    Alta
                                </div>
                                <div
                                    className={`priority-option urgent ${priority === 'urgent' ? 'selected' : ''}`}
                                    onClick={() => setPriority('urgent')}
                                >
                                    Urgente
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label><FileText size={16} /> Notas de Entrega</label>
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
                                <Calendar size={18} />
                                Guardar Fecha
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDateModal;
