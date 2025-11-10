import React, { useState, useEffect, useCallback } from 'react';
import './Sellers.css';

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3009/api/sellers');
      const data = await response.json();
      if (data.success) {
        setSellers(data.data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  }, []);

  useEffect(() => {
    fetchSellers();
    const interval = setInterval(fetchSellers, 3000);
    return () => clearInterval(interval);
  }, [fetchSellers]);

  const updateSellerStatus = async (sellerId, newStatus) => {
    try {
      await fetch(`http://localhost:3009/api/sellers/${sellerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchSellers();
    } catch (error) {
      console.error('Error updating seller status:', error);
    }
  };

  if (loading) {
    return <div className="loading">Cargando vendedores...</div>;
  }

  return (
    <div className="sellers-page">
      <div className="page-header">
        <h2>👥 Gestión de Vendedores</h2>
        <p>Sistema de rotación Round-Robin automático</p>
      </div>

      <div className="sellers-grid">
        {sellers.map((seller) => (
          <div key={seller.id} className="seller-card">
            <div className="seller-header">
              <div className="seller-avatar">
                {seller.name.charAt(0)}
              </div>
              <div className="seller-title">
                <h3>{seller.name}</h3>
                <span className="seller-specialty">{seller.specialty}</span>
              </div>
              <div className={`status-badge ${seller.status}`}>
                {seller.status === 'available' ? '🟢' : seller.status === 'busy' ? '🟡' : '🔴'}
              </div>
            </div>

            <div className="seller-details">
              <div className="detail-row">
                <span>📧</span>
                <span>{seller.email}</span>
              </div>
              <div className="detail-row">
                <span>📱</span>
                <span>{seller.phone}</span>
              </div>
              <div className="detail-row">
                <span>🎯</span>
                <span>Especialidad: {seller.specialty}</span>
              </div>
            </div>

            <div className="seller-metrics">
              <div className="metric">
                <div className="metric-label">Clientes Actuales</div>
                <div className="metric-value">{seller.currentClients} / {seller.maxClients}</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${(seller.currentClients / seller.maxClients) * 100}%`}}
                  ></div>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-small">
                  <div className="metric-label">Ventas Totales</div>
                  <div className="metric-value">{seller.totalSales}</div>
                </div>
                <div className="metric-small">
                  <div className="metric-label">Rating</div>
                  <div className="metric-value">⭐ {seller.rating}</div>
                </div>
              </div>
            </div>

            <div className="seller-actions">
              <button 
                className="btn btn-success"
                onClick={() => updateSellerStatus(seller.id, 'available')}
                disabled={seller.status === 'available'}
              >
                Disponible
              </button>
              <button 
                className="btn btn-warning"
                onClick={() => updateSellerStatus(seller.id, 'busy')}
                disabled={seller.status === 'busy'}
              >
                Ocupado
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => updateSellerStatus(seller.id, 'offline')}
                disabled={seller.status === 'offline'}
              >
                Offline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sellers;
