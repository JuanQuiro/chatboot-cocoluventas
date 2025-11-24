import React, { useState, useEffect } from 'react';
import { QrCode, Key, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { connectionApi } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/Connection.css';

export default function Connection() {
    const [qrCode, setQrCode] = useState(null);
    const [pairingCode, setPairingCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    useEffect(() => {
        fetchConnectionData();
    }, []);

    const fetchConnectionData = async () => {
        try {
            const [qrData, pairingData] = await Promise.all([
                connectionApi.getQR().catch(() => null),
                connectionApi.getPairingCode()
            ]);

            if (qrData?.qr) setQrCode(qrData.qr);
            if (pairingData?.code) setPairingCode(pairingData.code);

            // Simular detección de estado de conexión
            setConnectionStatus(pairingData?.code ? 'connected' : 'disconnected');
        } catch (error) {
            console.error('Error fetching connection data:', error);
            toast.error('Error cargando datos de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchConnectionData();
    };

    if (loading) {
        return (
            <div className="connection-page loading">
                <div className="spinner"></div>
                <p>Cargando información de conexión...</p>
            </div>
        );
    }

    return (
        <div className="connection-page">
            <div className="page-header">
                <div>
                    <h1>📲 Conexión del Bot</h1>
                    <p className="subtitle">Conecta tu bot de WhatsApp</p>
                </div>
                <div className="header-actions">
                    <div className={`status-badge ${connectionStatus}`}>
                        {connectionStatus === 'connected' ? (
                            <>
                                <CheckCircle size={16} />
                                Conectado
                            </>
                        ) : (
                            <>
                                <XCircle size={16} />
                                Desconectado
                            </>
                        )}
                    </div>
                    <button onClick={handleRefresh} className="btn-refresh">
                        <RefreshCw size={16} />
                        Actualizar
                    </button>
                </div>
            </div>

            <div className="connection-methods">
                {/* QR Code Method */}
                <div className="connection-card">
                    <div className="card-header">
                        <QrCode size={24} />
                        <h2>Conectar por Código QR</h2>
                    </div>
                    <div className="card-content">
                        {qrCode ? (
                            <div className="qr-container">
                                <img src={qrCode} alt="QR Code" className="qr-image" />
                                <p className="qr-instructions">
                                    Escanea este código QR con WhatsApp
                                </p>
                            </div>
                        ) : (
                            <div className="qr-placeholder">
                                <QrCode size={64} />
                                <p>Código QR no disponible</p>
                                <button onClick={handleRefresh} className="btn-generate">
                                    Generar QR
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="card-steps">
                        <h3>Pasos:</h3>
                        <ol>
                            <li>Abre WhatsApp en tu teléfono</li>
                            <li>Ve a Configuración → Dispositivos vinculados</li>
                            <li>Toca "Vincular un dispositivo"</li>
                            <li>Escanea este código QR</li>
                        </ol>
                    </div>
                </div>

                {/* Pairing Code Method */}
                <div className="connection-card">
                    <div className="card-header">
                        <Key size={24} />
                        <h2>Conectar por Código de Emparejamiento</h2>
                    </div>
                    <div className="card-content">
                        {pairingCode ? (
                            <div className="pairing-container">
                                <div className="pairing-code">
                                    {pairingCode}
                                </div>
                                <p className="pairing-instructions">
                                    Ingresa este código en WhatsApp
                                </p>
                            </div>
                        ) : (
                            <div className="pairing-placeholder">
                                <Key size={64} />
                                <p>Código de emparejamiento no disponible</p>
                                <button onClick={handleRefresh} className="btn-generate">
                                    Generar Código
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="card-steps">
                        <h3>Pasos:</h3>
                        <ol>
                            <li>Abre WhatsApp en tu teléfono</li>
                            <li>Ve a Configuración → Dispositivos vinculados</li>
                            <li>Toca "Vincular con número de teléfono"</li>
                            <li>Ingresa este código</li>
                        </ol>
                    </div>
                </div>
            </div>

            <div className="connection-info">
                <div className="info-card">
                    <h3>ℹ️ Información Importante</h3>
                    <ul>
                        <li>Solo puedes tener un bot conectado a la vez</li>
                        <li>La conexión permanece activa mientras el servidor esté funcionando</li>
                        <li>Si desconectas, deberás volver a escanear el QR o código</li>
                        <li>Los códigos QR expiran después de algunos minutos</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
