import React, { useState, useEffect, useCallback } from 'react';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3009/api/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (loading) {
    return <div className="loading">Cargando pedidos...</div>;
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: '⏳', label: 'Pendiente', class: 'pending' },
      confirmed: { icon: '✅', label: 'Confirmado', class: 'confirmed' },
      processing: { icon: '⚙️', label: 'Procesando', class: 'processing' },
      shipped: { icon: '🚚', label: 'Enviado', class: 'shipped' },
      delivered: { icon: '📦', label: 'Entregado', class: 'delivered' },
      cancelled: { icon: '❌', label: 'Cancelado', class: 'cancelled' }
    };
    const badge = badges[status] || badges.pending;
    return { ...badge };
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h2>🛒 Gestión de Pedidos</h2>
        <p>Total de pedidos: {orders.length}</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No hay pedidos aún</h3>
          <p>Los pedidos aparecerán aquí cuando los clientes realicen compras</p>
        </div>
      ) : (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Cantidad</th>
                <th>Dirección</th>
                <th>Pago</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusInfo = getStatusBadge(order.status);
                return (
                  <tr key={order.id}>
                    <td className="order-id">{order.id}</td>
                    <td className="customer-name">{order.customerName}</td>
                    <td className="products">{order.products}</td>
                    <td>{order.quantity}</td>
                    <td className="address">{order.deliveryAddress}</td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </td>
                    <td>{new Date(order.timestamp).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
