import React, { useState, useEffect } from 'react';
import '../styles/SellerAvailability.css';

export default function SellerAvailability() {
    const [sellers, setSellers] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [activeTab, setActiveTab] = useState('available');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Actualizar cada 30s
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [availRes, reportRes] = await Promise.all([
                fetch('/api/sellers/available'),
                fetch('/api/sellers/availability/report')
            ]);
            
            const availData = await availRes.json();
            const reportData = await reportRes.json();
            
            setSellers(availData.sellers || []);
            setReport(reportData.report);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAvailability = async (sellerId, currentActive) => {
        try {
            const response = await fetch(`/api/sellers/${sellerId}/toggle-availability`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    active: !currentActive,
                    reason: !currentActive ? null : 'Deshabilitado desde dashboard'
                })
            });
            
            if (response.ok) {
                loadData();
                alert('Estado actualizado');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleUpdateSchedule = async (sellerId, day, enabled, startTime, endTime) => {
        try {
            const response = await fetch(`/api/sellers/${sellerId}/work-schedule`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dayOfWeek: day, enabled, startTime, endTime })
            });
            
            if (response.ok) {
                loadData();
                alert('Horario actualizado');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleAddDayOff = async (sellerId, date, reason) => {
        try {
            const response = await fetch(`/api/sellers/${sellerId}/days-off`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, reason })
            });
            
            if (response.ok) {
                loadData();
                alert('Día de descanso agregado');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    return (
        <div className="seller-availability-container">
            <div className="seller-header">
                <h1>👥 Disponibilidad de Vendedores</h1>
                <button className="btn-refresh" onClick={loadData} disabled={loading}>
                    {loading ? '⏳ Cargando...' : '🔄 Actualizar'}
                </button>
            </div>

            {/* Resumen Rápido */}
            {report && (
                <div className="summary-grid">
                    <div className="summary-card">
                        <div className="summary-value">{report.total}</div>
                        <div className="summary-label">Total Vendedores</div>
                    </div>
                    <div className="summary-card active">
                        <div className="summary-value">{report.workingNow}</div>
                        <div className="summary-label">Trabajando Ahora</div>
                    </div>
                    <div className="summary-card available">
                        <div className="summary-value">{report.available}</div>
                        <div className="summary-label">Disponibles</div>
                    </div>
                    <div className="summary-card offline">
                        <div className="summary-value">{report.offline}</div>
                        <div className="summary-label">Offline</div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'available' ? 'active' : ''}`}
                    onClick={() => setActiveTab('available')}
                >
                    ✅ Disponibles Ahora ({sellers.length})
                </button>
                <button 
                    className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manage')}
                >
                    ⚙️ Gestionar
                </button>
            </div>

            {/* Tab: Disponibles */}
            {activeTab === 'available' && (
                <div className="sellers-grid">
                    {sellers.length === 0 ? (
                        <div className="empty-state">
                            <p>No hay vendedores disponibles en este momento</p>
                        </div>
                    ) : (
                        sellers.map(seller => (
                            <div key={seller.id} className="seller-card">
                                <div className="seller-header-card">
                                    <h3>{seller.name}</h3>
                                    <span className={`badge ${seller.status}`}>{seller.status}</span>
                                </div>
                                <div className="seller-info">
                                    <p><strong>Especialidad:</strong> {seller.specialty}</p>
                                    <p><strong>Calificación:</strong> ⭐ {seller.rating.toFixed(1)}</p>
                                    <div className="load-bar">
                                        <div 
                                            className="load-fill" 
                                            style={{ width: `${seller.loadPercentage}%` }}
                                        ></div>
                                    </div>
                                    <p className="load-text">{seller.loadPercentage.toFixed(0)}% ocupado</p>
                                </div>
                                <button 
                                    className="btn-select"
                                    onClick={() => setSelectedSeller(seller)}
                                >
                                    Ver Detalles
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Tab: Gestionar */}
            {activeTab === 'manage' && (
                <div className="manage-section">
                    <h2>Gestionar Vendedores</h2>
                    <ManageSellersForm onUpdate={loadData} />
                </div>
            )}

            {/* Modal de Detalles */}
            {selectedSeller && (
                <div className="modal-overlay" onClick={() => setSelectedSeller(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="btn-close" onClick={() => setSelectedSeller(null)}>✕</button>
                        <SellerDetailsModal seller={selectedSeller} onUpdate={loadData} />
                    </div>
                </div>
            )}
        </div>
    );
}

function SellerDetailsModal({ seller, onUpdate }) {
    const [showSchedule, setShowSchedule] = useState(false);
    const [showDayOff, setShowDayOff] = useState(false);
    const [dayOffDate, setDayOffDate] = useState('');
    const [dayOffReason, setDayOffReason] = useState('');

    const handleAddDayOff = async () => {
        if (!dayOffDate) {
            alert('Selecciona una fecha');
            return;
        }
        
        try {
            const response = await fetch(`/api/sellers/${seller.id}/days-off`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dayOffDate, reason: dayOffReason })
            });
            
            if (response.ok) {
                setDayOffDate('');
                setDayOffReason('');
                setShowDayOff(false);
                onUpdate();
                alert('Día de descanso agregado');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    return (
        <div className="seller-details">
            <h2>{seller.name}</h2>
            
            <div className="details-grid">
                <div className="detail-item">
                    <label>Estado</label>
                    <span className={`status-badge ${seller.status}`}>{seller.status}</span>
                </div>
                <div className="detail-item">
                    <label>Especialidad</label>
                    <span>{seller.specialty}</span>
                </div>
                <div className="detail-item">
                    <label>Calificación</label>
                    <span>⭐ {seller.rating.toFixed(1)}</span>
                </div>
                <div className="detail-item">
                    <label>Clientes Actuales</label>
                    <span>{seller.currentClients} / {seller.maxClients}</span>
                </div>
            </div>

            {/* Horarios */}
            <div className="section">
                <h3>📅 Horarios de Trabajo</h3>
                <button 
                    className="btn-toggle"
                    onClick={() => setShowSchedule(!showSchedule)}
                >
                    {showSchedule ? '▼' : '▶'} Ver Horarios
                </button>
                
                {showSchedule && seller.workSchedule && (
                    <div className="schedule-grid">
                        {Object.entries(seller.workSchedule).map(([day, schedule]) => (
                            <div key={day} className="schedule-item">
                                <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={schedule.enabled}
                                        onChange={(e) => {
                                            // Aquí iría la lógica de actualización
                                        }}
                                    />
                                    Habilitado
                                </label>
                                {schedule.enabled && (
                                    <div className="time-inputs">
                                        <input 
                                            type="time" 
                                            defaultValue={schedule.startTime}
                                            disabled
                                        />
                                        <span>-</span>
                                        <input 
                                            type="time" 
                                            defaultValue={schedule.endTime}
                                            disabled
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Días de Descanso */}
            <div className="section">
                <h3>🏖️ Días de Descanso</h3>
                <button 
                    className="btn-add"
                    onClick={() => setShowDayOff(!showDayOff)}
                >
                    + Agregar Día de Descanso
                </button>

                {showDayOff && (
                    <div className="day-off-form">
                        <input 
                            type="date" 
                            value={dayOffDate}
                            onChange={(e) => setDayOffDate(e.target.value)}
                        />
                        <input 
                            type="text" 
                            placeholder="Razón (ej: Vacaciones)"
                            value={dayOffReason}
                            onChange={(e) => setDayOffReason(e.target.value)}
                        />
                        <button className="btn-save" onClick={handleAddDayOff}>
                            Guardar
                        </button>
                    </div>
                )}

                {seller.daysOff && seller.daysOff.length > 0 && (
                    <div className="days-off-list">
                        {seller.daysOff.map((day, idx) => (
                            <div key={idx} className="day-off-item">
                                <span>{new Date(day.date).toLocaleDateString()}</span>
                                <span>{day.reason}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ManageSellersForm({ onUpdate }) {
    const [sellerId, setSellerId] = useState('');
    const [sellerData, setSellerData] = useState(null);
    const [isActive, setIsActive] = useState(true);

    const handleSearch = async () => {
        if (!sellerId) {
            alert('Ingresa un ID de vendedor');
            return;
        }

        try {
            const response = await fetch(`/api/sellers/${sellerId}/status`);
            if (response.ok) {
                const data = await response.json();
                setSellerData(data.status);
                setIsActive(data.status.active);
            } else {
                alert('Vendedor no encontrado');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleToggle = async () => {
        try {
            const response = await fetch(`/api/sellers/${sellerId}/toggle-availability`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    active: !isActive,
                    reason: !isActive ? null : 'Deshabilitado'
                })
            });

            if (response.ok) {
                setIsActive(!isActive);
                onUpdate();
                alert('Estado actualizado');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    return (
        <div className="manage-form">
            <div className="search-box">
                <input 
                    type="text" 
                    placeholder="ID del vendedor"
                    value={sellerId}
                    onChange={(e) => setSellerId(e.target.value)}
                />
                <button className="btn-search" onClick={handleSearch}>
                    🔍 Buscar
                </button>
            </div>

            {sellerData && (
                <div className="seller-manage-card">
                    <h3>{sellerData.name}</h3>
                    <div className="manage-info">
                        <p><strong>Email:</strong> {sellerData.email}</p>
                        <p><strong>Estado:</strong> {sellerData.status}</p>
                        <p><strong>Trabajando ahora:</strong> {sellerData.isWorkingNow ? '✅ Sí' : '❌ No'}</p>
                        <p><strong>Disponible:</strong> {sellerData.isAvailable ? '✅ Sí' : '❌ No'}</p>
                    </div>
                    <button 
                        className={`btn-toggle-status ${isActive ? 'active' : 'inactive'}`}
                        onClick={handleToggle}
                    >
                        {isActive ? '✅ Activo' : '❌ Inactivo'} - Cambiar
                    </button>
                </div>
            )}
        </div>
    );
}
