import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersService } from '../services/salesService';
import { inventoryService } from '../services/inventoryService';
import SearchInput from '../components/common/SearchInput';
import { toast } from 'react-hot-toast';
import './EditarPedido.css';

const EditarPedido = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [cart, setCart] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [productResults, setProductResults] = useState([]);
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [taxAmount, setTaxAmount] = useState(0);

    useEffect(() => {
        loadOrder();
    }, [id]);

    useEffect(() => {
        if (productSearch.length >= 2) {
            inventoryService.searchProducts(productSearch)
                .then(results => setProductResults(results))
                .catch(err => console.error('Error searching products:', err));
        } else {
            setProductResults([]);
        }
    }, [productSearch]);

    const loadOrder = async () => {
        try {
            const data = await ordersService.getOrderById(id);
            setOrder(data);

            // Map items correctly
            const items = Array.isArray(data.items) || Array.isArray(data.detalles_pedido) ? (data.items || data.detalles_pedido) : [];

            setCart(items.map(item => ({
                productId: item.producto_id || item.productId || item.id,
                name: item.nombre || item.name || item.nombre_producto,
                price: parseFloat(item.precio_unitario || item.price || item.precio_unitario_usd || 0),
                quantity: parseInt(item.cantidad || item.quantity || 1)
            })));

            setNotes(data.comentarios_generales || data.notes || '');

            let method = data.metodo_pago || data.paymentMethod || 'Efectivo';
            if (data.es_pago_mixto || method === 'mixto') {
                method = 'Pago Mixto';
            }
            method = method.charAt(0).toUpperCase() + method.slice(1);

            setPaymentMethod(method);
            setTaxAmount(parseFloat(data.monto_iva_usd || data.impuesto_total || 0));

        } catch (error) {
            toast.error('Error al cargar el pedido');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.productId === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                price: parseFloat(product.price_usd || product.price),
                quantity: 1
            }]);
        }
        setProductSearch('');
        setProductResults([]);
        toast.success('Producto agregado');
    };

    const updateQuantity = (productId, newQty) => {
        if (newQty <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(cart.map(item =>
            item.productId === productId ? { ...item, quantity: newQty } : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateGrandTotal = () => {
        const subtotal = calculateTotal();
        return subtotal + taxAmount;
    };

    const handleSave = async () => {
        if (cart.length === 0) {
            toast.error('El pedido debe tener al menos un producto');
            return;
        }

        setSaving(true);
        try {
            await ordersService.updateOrder(id, {
                items: cart.map(item => ({
                    producto_id: item.productId,
                    cantidad: item.quantity,
                    precio_unitario: item.price
                })),
                comentarios_generales: notes,
                metodo_pago: paymentMethod,
                paymentMethod,
                notes,
                monto_iva_usd: taxAmount,
                total: calculateGrandTotal()
            });

            toast.success('Pedido actualizado exitosamente');
            setTimeout(() => navigate('/lista-pedidos'), 1000);
        } catch (error) {
            toast.error('Error al actualizar el pedido');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
    if (!order) return <div className="p-8 text-center">No se encontró el pedido</div>;

    const statusColor = {
        'completado': '#10b981',
        'entregado': '#10b981',
        'pendiente': '#f59e0b',
        'cancelado': '#ef4444',
        'en proceso': '#3b82f6'
    };

    return (
        <div className="editar-pedido-page">
            <div className="page-header">
                <div>
                    <h1>✏️ Editar Pedido #{order.id}</h1>
                    <p>Creado el {new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span
                        className="header-status-badge"
                        style={{ background: statusColor[order.status?.toLowerCase()] || '#94a3b8', color: 'white' }}
                    >
                        {order.status}
                    </span>
                    <button onClick={() => navigate('/lista-pedidos')} className="btn-cancel">
                        Volver
                    </button>
                </div>
            </div>

            <div className="edit-grid">
                {/* Left Column: Client & Products */}
                <div className="main-content">
                    {/* Client Card */}
                    <div className="card">
                        <h2>👤 Información del Cliente</h2>
                        <div className="client-info-grid">
                            <div className="info-item">
                                <label>Cliente</label>
                                <p>{order.client?.name || 'Cliente General'}</p>
                            </div>
                            <div className="info-item">
                                <label>Teléfono</label>
                                <p>{order.client?.phone || 'Sin teléfono'}</p>
                            </div>
                            <div className="info-item">
                                <label>Email</label>
                                <p>{order.client?.email || 'Sin email'}</p>
                            </div>
                            <div className="info-item">
                                <label>ID Cliente</label>
                                <p>#{order.client?.id || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Products Card */}
                    <div className="card">
                        <h2>📦 Productos</h2>

                        <div className="search-container">
                            <SearchInput
                                placeholder="🔍 Buscar producto para agregar..."
                                onSearch={setProductSearch}
                                value={productSearch}
                            />
                            {productResults.length > 0 && (
                                <div className="search-results-dropdown">
                                    {productResults.map(p => (
                                        <div
                                            key={p.code || p.id}
                                            className="search-item"
                                            onClick={() => addToCart(p)}
                                        >
                                            <div>
                                                <strong>{p.name}</strong>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>Stock: {p.stock_actual}</div>
                                            </div>
                                            <span style={{ fontWeight: '600', color: '#3b82f6' }}>${p.price_usd || p.price}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cart.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 border rounded-lg border-dashed">
                                No hay productos en la lista
                            </div>
                        ) : (
                            <div className="products-table-container">
                                <table className="products-table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Precio</th>
                                            <th>Cantidad</th>
                                            <th>Total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map(item => (
                                            <tr key={item.productId}>
                                                <td>{item.name}</td>
                                                <td>${item.price.toFixed(2)}</td>
                                                <td>
                                                    <div className="qty-control">
                                                        <button className="btn-qty" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                                                        <input
                                                            className="qty-input"
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                                                        />
                                                        <button className="btn-qty" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</td>
                                                <td>
                                                    <button onClick={() => removeFromCart(item.productId)} className="btn-delete-row">
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Summary & Actions */}
                <div className="sidebar">
                    <div className="card summary-card">
                        <h2>💳 Resumen Financiero</h2>

                        <div className="form-group-modern">
                            <label>Método de Pago</label>
                            <select
                                className="select-modern"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="Efectivo">Efectivo</option>
                                <option value="Pago Móvil">Pago Móvil</option>
                                <option value="Zelle">Zelle</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Crédito">Crédito</option>
                                <option value="Pago Mixto">Pago Mixto</option>
                            </select>
                        </div>

                        <div className="form-group-modern">
                            <label>Notas del Pedido</label>
                            <textarea
                                className="textarea-modern"
                                rows="4"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Instrucciones especiales..."
                            />
                        </div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Impuestos {taxAmount > 0 ? '' : '(0%)'}</span>
                            <span>${taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total a Pagar</span>
                            <span>${calculateGrandTotal().toFixed(2)}</span>
                        </div>

                        <div className="action-buttons">
                            <button
                                className="btn-save"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : '💾 Guardar'}
                            </button>
                        </div>
                        <button
                            className="btn-cancel"
                            style={{ width: '100%', marginTop: '12px' }}
                            onClick={() => navigate('/lista-pedidos')}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditarPedido;
