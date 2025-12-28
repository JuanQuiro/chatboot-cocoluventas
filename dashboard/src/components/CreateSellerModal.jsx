import React, { useState } from 'react';
import './Modal.css';

const CreateSellerModal = ({ isOpen, onClose, onSellerCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialty: 'general',
        max_clients: '50'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/sellers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    specialty: formData.specialty,
                    max_clients: parseInt(formData.max_clients)
                })
            });

            const data = await response.json();

            if (data.success) {
                onSellerCreated();
                onClose();
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    specialty: 'general',
                    max_clients: '50'
                });
            } else {
                setError(data.error || 'Error creando vendedor');
            }
        } catch (err) {
            setError('Error de conexión');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>👥 Nuevo Vendedor</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Nombre Completo *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Juan Pérez"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="juan@ejemplo.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Teléfono (WhatsApp) *</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="58412..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Especialidad</label>
                            <select name="specialty" value={formData.specialty} onChange={handleChange}>
                                <option value="general">General</option>
                                <option value="ventas">Ventas</option>
                                <option value="soporte">Soporte</option>
                                <option value="vip">VIP</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Máx. Clientes</label>
                            <input
                                type="number"
                                name="max_clients"
                                value={formData.max_clients}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Vendedor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSellerModal;
