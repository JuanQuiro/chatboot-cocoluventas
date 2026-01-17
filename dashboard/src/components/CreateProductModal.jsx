import React, { useState } from 'react';
import './Modal.css'; // Reusing existing modal styles if compatible, otherwise will inline or create new

const CreateProductModal = ({ isOpen, onClose, onProductCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        price_usd: '',
        stock_current: '',
        stock_min: '5',
        category_id: '1'
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
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    sku: formData.sku,
                    description: formData.description,
                    price_usd: parseFloat(formData.price_usd),
                    stock_actual: parseInt(formData.stock_current),
                    stock_minimo: parseInt(formData.stock_min),
                    categoria_id: parseInt(formData.category_id)
                })
            });

            const data = await response.json();

            if (data.success) {
                onProductCreated();
                onClose();
                setFormData({
                    name: '',
                    sku: '',
                    description: '',
                    price_usd: '',
                    stock_current: '',
                    stock_min: '5',
                    category_id: '1'
                });
            } else {
                setError(data.error || 'Error creando producto');
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
                    <h2>📦 Nuevo Producto</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Nombre del Producto *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Ej. Collar de Oro 14k"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>SKU (Código) *</label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                required
                                placeholder="PROD-001"
                            />
                        </div>
                        <div className="form-group">
                            <label>Precio USD *</label>
                            <input
                                type="number"
                                name="price_usd"
                                value={formData.price_usd}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Detalles del producto..."
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Stock Actual</label>
                            <input
                                type="number"
                                name="stock_current"
                                value={formData.stock_current}
                                onChange={handleChange}
                                min="0"
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Stock Mínimo</label>
                            <input
                                type="number"
                                name="stock_min"
                                value={formData.stock_min}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProductModal;
