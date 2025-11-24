import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/Adapters.css';

export default function Adapters() {
    const [adapters, setAdapters] = useState([
        {
            id: 'baileys',
            name: 'Baileys',
            description: 'WhatsApp Web API (Multi-Device)',
            status: 'available',
            features: ['QR Code', 'Pairing Code', 'Multi-device', 'Gratis'],
            recommended: true
        },
        {
            id: 'meta',
            name: 'Meta Business API',
            description: 'WhatsApp Business Cloud API Oficial',
            status: 'available',
            features: ['Cloud', 'Webhooks', 'Límites altos', 'Pago por uso'],
            recommended: false
        },
        {
            id: 'twilio',
            name: 'Twilio',
            description: 'WhatsApp Business API vía Twilio',
            status: 'disabled',
            features: ['Cloud', 'API completa', 'Soporte 24/7', 'Pago'],
            recommended: false
        }
    ]);

    const [currentAdapter, setCurrentAdapter] = useState('baileys');

    const handleSelectAdapter = (adapterId) => {
        if (adapterId === currentAdapter) {
            toast.info('Este adaptador ya está activo');
            return;
        }

        toast.success(`Cambiando a ${adapterId}...`);
        // TODO: Implementar cambio de adaptador en backend
        setTimeout(() => {
            setCurrentAdapter(adapterId);
            toast.success(`✅ Ahora usando ${adapterId}`);
        }, 1000);
    };

    return (
        <div className="adapters-page">
            <div className="page-header">
                <div>
                    <h1>🔌 Adaptadores de WhatsApp</h1>
                    <p className="subtitle">Administra los proveedores de WhatsApp</p>
                </div>
            </div>

            <div className="current-adapter-banner">
                <div className="banner-content">
                    <Package size={24} />
                    <div>
                        <div className="banner-label">Adaptador Actual</div>
                        <div className="banner-value">{currentAdapter.toUpperCase()}</div>
                    </div>
                </div>
            </div>

            <div className="adapters-grid">
                {adapters.map(adapter => {
                    const isActive = adapter.id === currentAdapter;
                    const isAvailable = adapter.status === 'available';

                    return (
                        <div
                            key={adapter.id}
                            className={`adapter-card ${isActive ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                        >
                            {adapter.recommended && (
                                <div className="recommended-badge">Recomendado</div>
                            )}

                            <div className="adapter-header">
                                <div className="adapter-icon">
                                    <Package size={32} />
                                </div>
                                <div className="adapter-info">
                                    <h3>{adapter.name}</h3>
                                    <p className="adapter-description">{adapter.description}</p>
                                </div>
                            </div>

                            <div className="adapter-features">
                                <h4>Características:</h4>
                                <ul>
                                    {adapter.features.map((feature, idx) => (
                                        <li key={idx}>
                                            <CheckCircle size={14} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="adapter-status">
                                {isActive ? (
                                    <div className="status-active">
                                        <CheckCircle size={16} />
                                        Activo
                                    </div>
                                ) : isAvailable ? (
                                    <button
                                        onClick={() => handleSelectAdapter(adapter.id)}
                                        className="btn-select"
                                    >
                                        Seleccionar
                                    </button>
                                ) : (
                                    <div className="status-disabled">
                                        <XCircle size={16} />
                                        No Disponible
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="info-section">
                <h2>ℹ️ Información sobre Adaptadores</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <h3>🆓 Baileys (Gratis)</h3>
                        <p>
                            Usa WhatsApp Web multi-dispositivo. Ideal para proyectos pequeños y medianos.
                            Requiere mantener sesión activa escaneando QR o usando código de emparejamiento.
                        </p>
                    </div>
                    <div className="info-item">
                        <h3>☁️ Meta Business API</h3>
                        <p>
                            API oficial de WhatsApp para empresas. Requiere aprobación de Meta.
                            Ideal para volúmenes altos y uso comercial. Se paga por mensaje.
                        </p>
                    </div>
                    <div className="info-item">
                        <h3>📱 Twilio</h3>
                        <p>
                            Servicio premium vía Twilio. Incluye soporte técnico 24/7 y garantías de SLA.
                            Más costoso pero más confiable para aplicaciones críticas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
