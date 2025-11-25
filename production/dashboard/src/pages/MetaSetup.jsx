import React from 'react';
import { useMetaConfig } from '../hooks/useApi';
import { Save, TestTube, CheckCircle, XCircle, Copy, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/MetaSetup.css';

export default function MetaSetup() {
    const { config, saveConfig, testMessage, isSaving, isTesting } = useMetaConfig();
    const [formData, setFormData] = React.useState({});

    React.useEffect(() => {
        if (config) {
            setFormData(config);
        }
    }, [config]);

    const handleSave = (e) => {
        e.preventDefault();
        saveConfig(formData);
    };

    const handleTest = () => {
        testMessage({
            to: formData.phoneNumber,
            message: '🧪 Test desde Dashboard - ' + new Date().toLocaleString()
        });
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`✅ ${label} copiado`);
    };

    if (!config) {
        return (
            <div className="meta-setup loading">
                <div className="spinner"></div>
                <p>Cargando configuración...</p>
            </div>
        );
    }

    const isConfigured = formData.jwtToken && formData.numberId && formData.businessId;

    return (
        <div className="meta-setup">
            <div className="page-header">
                <div>
                    <h1>🌐 Configuración Meta WhatsApp</h1>
                    <p className="subtitle">WhatsApp Business API Setup</p>
                </div>
                <div className="header-badge">
                    {isConfigured ? (
                        <span className="status-badge configured">
                            <CheckCircle size={16} />
                            Configurado
                        </span>
                    ) : (
                        <span className="status-badge missing">
                            <XCircle size={16} />
                            Sin configurar
                        </span>
                    )}
                </div>
            </div>

            <div className="info-section">
                <div className="info-card webhook">
                    <div className="info-label">Webhook URL para Meta (Read-Only)</div>
                    <div className="info-value-group">
                        <code className="info-value">{formData.webhookUrl}</code>
                        <button
                            onClick={() => copyToClipboard(formData.webhookUrl, 'Webhook URL')}
                            className="btn-copy"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                    <p className="info-help">Configura este URL en Meta Developers (no editable)</p>
                </div>

                <div className="info-card token">
                    <div className="info-label">Verify Token (Editable)</div>
                    <div className="info-value-group">
                        <input
                            type="text"
                            value={formData.verifyToken || ''}
                            onChange={(e) => setFormData({ ...formData, verifyToken: e.target.value })}
                            placeholder="cocolu_webhook_verify_..."
                            className="form-input"
                        />
                        <button
                            onClick={() => copyToClipboard(formData.verifyToken, 'Verify Token')}
                            className="btn-copy"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                    <p className="info-help">Token personalizado para verificar el webhook</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="config-form">
                <div className="form-section">
                    <h2>📝 Credenciales Meta</h2>

                    <div className="form-group">
                        <label>JWT Token (Access Token)</label>
                        <input
                            type="password"
                            value={formData.jwtToken || ''}
                            onChange={(e) => setFormData({ ...formData, jwtToken: e.target.value })}
                            placeholder="EAAxxxxxxxxxxxxx..."
                            className="form-input"
                        />
                        <span className="help-text">
                            Obtén tu Access Token desde Meta Developers → App Settings
                        </span>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Phone Number ID</label>
                            <input
                                type="text"
                                value={formData.numberId || ''}
                                onChange={(e) => setFormData({ ...formData, numberId: e.target.value })}
                                placeholder="123456789012345"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Business Account ID</label>
                            <input
                                type="text"
                                value={formData.businessId || ''}
                                onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                                placeholder="987654321098765"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>API Version</label>
                            <select
                                value={formData.apiVersion || 'v22.0'}
                                onChange={(e) => setFormData({ ...formData, apiVersion: e.target.value })}
                                className="form-input"
                            >
                                <option value="v18.0">v18.0</option>
                                <option value="v19.0">v19.0</option>
                                <option value="v20.0">v20.0</option>
                                <option value="v21.0">v21.0</option>
                                <option value="v22.0">v22.0 (Latest)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Número de Teléfono (para pruebas)</label>
                            <input
                                type="tel"
                                value={formData.phoneNumber || ''}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                placeholder="+1xxxxxxxxxx"
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <div className="actions-right">
                        <button
                            type="button"
                            onClick={handleTest}
                            disabled={!isConfigured || isTesting}
                            className="btn-test"
                        >
                            <TestTube size={16} />
                            {isTesting ? 'Enviando...' : 'Enviar Test'}
                        </button>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-save"
                        >
                            <Save size={16} />
                            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="instructions-section">
                <h2>📖 Instrucciones</h2>
                <ol className="instructions-list">
                    <li>Ve a <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">Meta Developers</a></li>
                    <li>Selecciona tu App de WhatsApp Business API</li>
                    <li>En "WhatsApp" → "Configuration", configura el Webhook URL y Verify Token</li>
                    <li>Copia tu Access Token desde "App Settings" → "Basic"</li>
                    <li>Obtén tu Phone Number ID y Business Account ID</li>
                    <li>Pégalos aquí y guarda la configuración</li>
                    <li>Haz una prueba enviando un mensaje de test</li>
                </ol>
            </div>
        </div>
    );
}
