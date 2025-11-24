import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, AlertCircle } from 'lucide-react';
import '../styles/MetaBilling.css';

export default function MetaBilling() {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    //  NOTA: Endpoint de facturación de Meta aún no implementado en el backend
    // El usuario debe configurar esto con la Meta Business API

    return (
        <div className="billing-page">
            <div className="page-header">
                <div>
                    <h1>💰 Facturación Meta</h1>
                    <p className="subtitle">WhatsApp Business API - Costos y Métricas</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="info-banner warning">
                <AlertCircle size={24} />
                <div className="banner-content">
                    <h3>📊 Funcionalidad de Facturación</h3>
                    <p>
                        Para ver datos de facturación reales, necesitas:
                    </p>
                    <ol>
                        <li>Configurar tu cuenta de Meta Business en <strong>Meta Setup</strong></li>
                        <li>Habilitar acceso a la API de facturación de Meta</li>
                        <li>El backend integrará automáticamente los datos de costos</li>
                    </ol>
                    <p className="note">
                        Los datos de facturación se obtienen directamente desde Meta Business Manager una vez configurado.
                    </p>
                </div>
            </div>

            {/* Date Range Selector */}
            <div className="date-selector">
                <div className="date-inputs">
                    <div className="date-group">
                        <label>Desde</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="date-input"
                            disabled
                        />
                    </div>
                    <div className="date-group">
                        <label>Hasta</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="date-input"
                            disabled
                        />
                    </div>
                </div>
            </div>

            {/* Pricing Table - INFORMACIÓN REAL de Meta */}
            <div className="pricing-section">
                <h2>💵 Tarifas Oficiales de Meta WhatsApp Business API</h2>
                <div className="pricing-table-container">
                    <table className="pricing-table">
                        <thead>
                            <tr>
                                <th>Tipo de Mensaje</th>
                                <th>Categoría</th>
                                <th>Costo Base (USD)</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Marketing</strong></td>
                                <td>Promocional</td>
                                <td>$0.0385 - $0.1155</td>
                                <td>Mensajes promocionales, ofertas, anuncios</td>
                            </tr>
                            <tr>
                                <td><strong>Utility</strong></td>
                                <td>Transaccional</td>
                                <td>$0.0115 - $0.0385</td>
                                <td>Confirmaciones de pedido, actualizaciones de envío, facturas</td>
                            </tr>
                            <tr>
                                <td><strong>Authentication</strong></td>
                                <td>Verificación</td>
                                <td>$0.0095 - $0.0455</td>
                                <td>Códigos OTP, verificación de identidad</td>
                            </tr>
                            <tr>
                                <td><strong>Service</strong></td>
                                <td>Atención al Cliente</td>
                                <td><span className="highlight-free">GRATIS</span></td>
                                <td>Respuestas dentro de ventana de 24 horas desde que el usuario escribió</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="pricing-notes">
                    <p className="pricing-note">
                        <strong>Nota Importante:</strong> Los precios varían según el país de destino del mensaje.
                    </p>
                    <p className="pricing-note">
                        * Precios mostrados son el rango para América Latina (Colombia, México, Brasil, etc.)
                    </p>
                    <p className="pricing-note">
                        * <strong>Mensajes de servicio (Service):</strong> Completamente gratis si respondes dentro de 24 horas desde que el usuario te escribió.
                    </p>
                    <p className="pricing-note">
                        * Consulta los precios exactos para tu país en: <a href="https://developers.facebook.com/docs/whatsapp/pricing" target="_blank" rel="noopener noreferrer">Meta WhatsApp Pricing</a>
                    </p>
                </div>
            </div>

            {/* Guide Section */}
            <div className="guide-section">
                <h2>📖 Cómo Activar la Facturación Automática</h2>
                <div className="guide-steps">
                    <div className="guide-step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Configura Meta Business API</h3>
                            <p>Ve a <strong>Meta Setup</strong> y completa tu configuración con el JWT Token y Account ID</p>
                        </div>
                    </div>
                    <div className="guide-step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Habilita Permisos de Billing</h3>
                            <p>En Meta Developers, asegúrate de que tu app tenga permisos para leer datos de facturación</p>
                        </div>
                    </div>
                    <div className="guide-step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Espera la Sincronización</h3>
                            <p>El sistema sincronizará automáticamente los costos cada 24 horas</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
