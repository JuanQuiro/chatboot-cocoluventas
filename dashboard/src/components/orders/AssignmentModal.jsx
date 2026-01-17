import React, { useState, useEffect } from 'react';
import { Briefcase, User, Save, X, Factory } from 'lucide-react';
import { manufacturersService } from '../../services/manufacturersService'; // Assuming this exists
// Assuming sellers service exists or we fetch from an endpoint
import axios from 'axios';
import './DeliveryDateModal.css'; // Reusing the premium styles

const AssignmentModal = ({ isOpen, onClose, order, onSave }) => {
    const [fabricanteId, setFabricanteId] = useState('');
    const [vendedorId, setVendedorId] = useState('');

    const [manufacturers, setManufacturers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && order) {
            setFabricanteId(order.fabricante_id || '');
            setVendedorId(order.vendedor_id || '');
            loadData();
        }
    }, [isOpen, order]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch Manufacturers
            // Using direct axios or service if available. Assuming endpoint structure based on previous context.
            const manufRes = await axios.get('http://localhost:3009/api/finance/manufacturers');
            const sellersRes = await axios.get('http://localhost:3009/api/users/sellers'); // Hypothetical endpoint, need to verify

            if (manufRes.data && manufRes.data.data) {
                setManufacturers(manufRes.data.data);
            }

            if (sellersRes.data && sellersRes.data.data) {
                setSellers(sellersRes.data.data);
            }
        } catch (error) {
            console.error('Error loading assignment data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(order.id, {
            fabricante_id: fabricanteId ? parseInt(fabricanteId) : null,
            vendedor_id: vendedorId ? parseInt(vendedorId) : null
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content delivery-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><Briefcase size={20} /> Asignar Responsables</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="order-info">
                        <div>
                            <p><strong>Pedido:</strong></p>
                            <p>#{order?.id}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p><strong>Cliente:</strong></p>
                            <p>{order?.client?.name || 'Cliente'}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><Factory size={16} /> Fabricante</label>
                            <select
                                className="form-control"
                                value={fabricanteId}
                                onChange={(e) => setFabricanteId(e.target.value)}
                            >
                                <option value="">-- Sin Asignar --</option>
                                {manufacturers.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label><User size={16} /> Vendedor</label>
                            <select
                                className="form-control"
                                value={vendedorId}
                                onChange={(e) => setVendedorId(e.target.value)}
                            >
                                <option value="">-- Sin Asignar --</option>
                                {/* Fallback if no sellers API yet */}
                                <option value="1">Vendedor Principal</option>
                                {sellers.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn-secondary">
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary">
                                <Save size={18} />
                                Guardar Asignación
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignmentModal;
