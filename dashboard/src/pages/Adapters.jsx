import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/Adapters.css';

export default function Adapters() {
    const [loading, setLoading] = useState(true);
    const [currentProvider, setCurrentProvider] = useState('baileys'); // Default

    useEffect(() => {
        // Leer el provider actual del backend
        fetchCurrentProvider();
    }, []);

    const fetchCurrentProvider = async () => {
        try {
            // El provider actual está en las variables de entorno o configuración del sistema
            const res = await fetch('/api/health');
            const data = await res.json();

            // Determinar provider basado en la configuración
            // Si hay META_JWT_TOKEN configurado, probablemente esté usando Meta
            // De lo contrario, usa Baileys por defecto
            setCurrentProvider(data.provider || 'baileys');
        } catch (error) {
            console.error('Error fetching provider:', error);
            setCurrentProvider('baileys'); // Default to Baileys
        } finally {
            setLoading(false);
        }
    };

    const adaptersInfo = [
        {
            id: 'baileys',
            name: 'Baileys',
            description: 'WhatsApp Web API (Multi-Device)',
            features: ['QR Code', 'Pairing Code', 'Multi-device', 'Gratis', 'Fácil setup'],
            recommended: true,
            pros: [
                'Completamente gratis',
                'No requiere aprobación de Meta',
                'Setup en minutos',
                'Ideal para volumen bajo-medio'
            ],
            cons: [
                'Requiere mantener sesión activa',
                'Puede ser bloqueado si envías spam',
                'Límites de ~1000 mensajes/día'
            ]
        },
        {
            id: 'meta',
            name: 'Meta Business API',
            description: 'WhatsApp Business Cloud API Oficial',
            features: ['Cloud-based', 'Webhooks', 'Límites altos', 'Pago por uso', 'Soporte oficial'],
            recommended: false,
            pros: [
                'API oficial de WhatsApp',
                'Sin límites de mensajes',
                'SLA garantizado',
                'Ideal para producción empresarial'
            ],
            cons: [
                'Se paga por mensaje (~$0.01-$0.15 USD)',
                'Requiere verificación de negocio',
                'Setup más complejo'
            ]
        }
    ];

    const handleRefresh = () => {
        setLoading(true);
        fetchCurrentProvider();
    };

    if (loading) {
        return (
            <div className="adapters-page loading">
                <div className="spinner"></div>
                <p>Cargando información de adaptadores...</p>
            </div>
        );
    }

    return (
        <div className="adapters-page">
            <div className="page-header">
                <div>
                    <h1>🔌 Adaptadores de WhatsApp</h1>
                    <p className="subtitle">Configuración actual del proveedor de WhatsApp</p>
                </div>
                <button onClick={handleRefresh} className="btn-refresh">
                    <RefreshCw size={16} />
                    Actualizar
                </button>
            </div>

            <div className="current-adapter-banner">
                <div className="banner-content">
                    <Package size={24} />
                    <div>
                        <div className="banner-label">Proveedor Activo Actualmente</div>
                        <div className="banner-value">{currentProvider.toUpperCase()}</div>
                    </div>
                </div>
            </div>

            <div className="adapters-grid">
                {adaptersInfo.map(adapter => {
                    const isActive = adapter.id === currentProvider;

                    return (
                        <div
                            key={adapter.id}
                            className={`adapter-card ${isActive ? 'active' : ''}`}
                        >
                            {adapter.recommended && (
                                <div className="recommended-badge">Recomendado para empezar</div>
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

                            <div className="adapter-pros-cons">
                                <div className="pros">
                                    <h4>✅ Ventajas</h4>
                                    <ul>
                                        {adapter.pros.map((pro, idx) => (
                                            <li key={idx}>{pro}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="cons">
                                    <h4>⚠️ Limitaciones</h4>
                                    <ul>
                                        {adapter.cons.map((con, idx) => (
                                            <li key={idx}>{con}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="adapter-status">
                                {isActive ? (
                                    <div className="status-active">
                                        <CheckCircle size={16} />
                                        En Uso Actualmente
                                    </div>
                                ) : (
                                    <div className="status-info">
                                        Para cambiar de proveedor, contacta al administrador del sistema
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="info-section">
                <h2>ℹ️ Cómo Funciona Cada Proveedor</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <h3>🆓 Baileys (Actual - Recomendado)</h3>
                        <p>
                            <strong>Baileys</strong> es una biblioteca de código abierto que se conecta a WhatsApp Web usando el protocolo multi-dispositivo.
                            Es perfecta para proyectos pequeños a medianos donde no necesitas enviar miles de mensajes por día.
                        </p>
                        <p>
                            <strong>Cuándo usarlo:</strong> Proyectos personales, startups, negocios pequeños, prototipos.
                        </p>
                        <p>
                            <strong>Configuración:</strong> Ve a <strong>Conexión</strong> para escanear el código QR o usar el código de emparejamiento.
                        </p>
                    </div>
                    <div className="info-item">
                        <h3>☁️ Meta Business API (Enterprise)</h3>
                        <p>
                            La <strong>Meta Business API</strong> es la solución oficial de WhatsApp para empresas.
                            Ofrece escalabilidad ilimitada, webhooks en tiempo real, y está alojada en la nube de Meta.
                        </p>
                        <p>
                            <strong>Cuándo usarlo:</strong> Empresas establecidas, alto volumen de mensajes (+10k/día), necesitas SLA garantizado.
                        </p>
                        <p>
                            <strong>Configuración:</strong> Requiere verificación de negocio en Meta. Ve a <strong>Meta Setup</strong> para configurar tus credenciales.
                        </p>
                    </div>
                </div>
            </div>

            <div className="migration-notice">
                <h3>🔄 Migrar Entre Proveedores</h3>
                <p>
                    Para cambiar de proveedor, necesitarás modificar las variables de entorno del servidor y reiniciar la aplicación.
                    El cambio de Baileys a Meta (o viceversa) requiere configuración adicional:
                </p>
                <ul>
                    <li><strong>Baileys → Meta:</strong> Configura credenciales en Meta Setup, actualiza las variables de entorno</li>
                    <li><strong>Meta → Baileys:</strong> Desconecta Meta API, escanea QR code en Conexión</li>
                </ul>
                <p className="warning-text">
                    ⚠️ <strong>Importante:</strong> No puedes usar ambos proveedores simultáneamente con el mismo número de teléfono.
                </p>
            </div>
        </div>
    );
}
