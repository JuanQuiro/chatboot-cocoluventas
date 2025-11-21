/**
 * Meta WhatsApp Setup & Testing Module
 * Configuración completa y pruebas de Meta WhatsApp
 */

const setupMetaRoutes = (app, metaConfigService) => {

    // Página principal de configuración Meta
    app.get('/meta-setup', (req, res) => {
        const webhookUrl = `https://${req.get('host')}/webhooks/whatsapp`;
        const verifyToken = process.env.META_VERIFY_TOKEN || 'cocolu_webhook_verify_2025_secure_token_meta';

        const config = {
            jwtToken: process.env.META_JWT_TOKEN || '',
            numberId: process.env.META_NUMBER_ID || '',
            businessId: process.env.META_BUSINESS_ACCOUNT_ID || '',
            verifyToken: verifyToken,
            apiVersion: process.env.META_API_VERSION || 'v22.0',
            phoneNumber: process.env.PHONE_NUMBER || ''
        };

        res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🌐 Meta WhatsApp Setup - Cocolu</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
    min-height: 100vh; 
    padding: 20px; 
}

/* Container */
.container { max-width: 1400px; margin: 0 auto; }

/* Header */
.header { 
    background: white; 
    padding: 32px; 
    border-radius: 16px; 
    margin-bottom: 24px; 
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.header h1 { font-size: 32px; color: #111827; margin-bottom: 4px; }
.header p { color: #6b7280; font-size: 14px; }
.btn-back {
    background: #f3f4f6;
    color: #374151;
    padding: 12px 20px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
}
.btn-back:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
}

/* Grid Layout */
.grid { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 24px; 
}

/* Cards */
.card { 
    background: white; 
    border-radius: 16px; 
    padding: 32px; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.08); 
}
.card h2 { 
    font-size: 22px; 
    color: #111827; 
    margin-bottom: 20px; 
    display: flex; 
    align-items: center; 
    gap: 8px; 
}

/* Section */
.section { 
    margin-bottom: 28px; 
    padding-bottom: 28px; 
    border-bottom: 1px solid #e5e7eb; 
}
.section:last-child { 
    border-bottom: none; 
    margin-bottom: 0; 
    padding-bottom: 0; 
}

/* Info Box */
.info-box { 
    background: #f3f4f6; 
    padding: 20px; 
    border-radius: 12px; 
    margin: 12px 0; 
}
.info-box label { 
    font-size: 12px; 
    font-weight: 700; 
    color: #667eea; 
    text-transform: uppercase; 
    letter-spacing: 0.5px;
    display: block; 
    margin-bottom: 10px; 
}
.info-box input { 
    width: 100%; 
    padding: 14px; 
    border: 2px solid #e5e7eb; 
    border-radius: 8px; 
    font-family: 'Courier New', monospace; 
    font-size: 13px; 
    background: white;
    color: #111827;
}
.info-box input:focus { 
    outline: none; 
    border-color: #667eea; 
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
.copy-btn { 
    background: #667eea; 
    color: white; 
    border: none; 
    padding: 10px 18px; 
    border-radius: 8px; 
    cursor: pointer; 
    font-size: 13px; 
    font-weight: 600; 
    margin-top: 10px; 
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
.copy-btn:hover { 
    background: #5568d3; 
    transform: translateY(-1px); 
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Form Group */
.form-group { 
    margin-bottom: 24px; 
    position: relative;
}
.form-group label { 
    display: block; 
    font-size: 14px; 
    font-weight: 600; 
    color: #374151; 
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.form-group label .required { 
    color: #ef4444; 
}
.form-group label .tooltip-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    background: #e5e7eb;
    border-radius: 50%;
    font-size: 11px;
    cursor: help;
    color: #6b7280;
}
.form-group input, 
.form-group textarea, 
.form-group select { 
    width: 100%; 
    padding: 14px; 
    border: 2px solid #e5e7eb; 
    border-radius: 8px; 
    font-size: 14px; 
    transition: all 0.2s;
    font-family: inherit;
}
.form-group textarea {
    font-family: 'Courier New', monospace;
    resize: vertical;
    min-height: 80px;
}
.form-group input:focus, 
.form-group textarea:focus,
.form-group select:focus { 
    outline: none; 
    border-color: #667eea; 
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); 
}

/* Validation States */
.form-group.valid input,
.form-group.valid textarea {
    border-color: #10b981;
}
.form-group.invalid input,
.form-group.invalid textarea {
    border-color: #ef4444;
}
.validation-message {
    font-size: 12px;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
}
.validation-message.valid {
    color: #10b981;
}
.validation-message.invalid {
    color: #ef4444;
}
.char-counter {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
}

/* Buttons */
.btn { 
    width: 100%; 
    padding: 16px; 
    border: none; 
    border-radius: 10px; 
    font-size: 15px; 
    font-weight: 600; 
    cursor: pointer; 
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}
.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.btn-primary { 
    background: #10b981; 
    color: white; 
}
.btn-primary:hover:not(:disabled) { 
    background: #059669; 
    transform: translateY(-1px); 
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}
.btn-secondary { 
    background: #667eea; 
    color: white; 
    margin-top: 12px; 
}
.btn-secondary:hover:not(:disabled) { 
    background: #5568d3; 
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Loading Spinner */
.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}
@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Status Badge */
.status { 
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px; 
    border-radius: 20px; 
    font-size: 12px; 
    font-weight: 600; 
}
.status.ok { 
    background: #dcfce7; 
    color: #166534; 
}
.status.error { 
    background: #fee2e2; 
    color: #991b1b; 
}

/* Steps Guide */
.steps { 
    background: #fef3c7; 
    border-left: 4px solid #f59e0b; 
    padding: 20px; 
    border-radius: 8px; 
    margin-top: 16px; 
}
.steps h4 { 
    font-size: 14px; 
    color: #92400e; 
    margin-bottom: 12px; 
}
.steps ol { 
    margin-left: 20px; 
    color: #78350f; 
    font-size: 13px; 
    line-height: 2; 
}
.steps code {
    background: rgba(255, 255, 255, 0.5);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
}

/* Toast Container */
.toast-container {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 9999;
    pointer-events: none;
}
.toast {
    background: white;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 12px;
    min-width: 300px;
    max-width: 400px;
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: all;
    animation: slideIn 0.3s ease;
    position: relative;
}
.toast::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 12px 0 0 12px;
}
.toast.success::before { background: #10b981; }
.toast.error::before { background: #ef4444; }
.toast.warning::before { background: #f59e0b; }
.toast.info::before { background: #3b82f6; }

.toast-icon {
    font-size: 24px;
    flex-shrink: 0;
}
.toast-content {
    flex: 1;
}
.toast-title {
    font-weight: 600;
    color: #111827;
    font-size: 14px;
    margin-bottom: 2px;
}
.toast-message {
    color: #6b7280;
    font-size: 13px;
}
.toast-close {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}
.toast-close:hover {
    background: #f3f4f6;
    color: #374151;
}

@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(400px);
        opacity: 0;
    }
}

/* Responsive */
@media (max-width: 1024px) { 
    .grid { grid-template-columns: 1fr; }
    .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
}

@media (max-width: 640px) {
    .toast-container {
        left: 16px;
        right: 16px;
        top: 16px;
    }
    .toast {
        min-width: auto;
        max-width: none;
    }
}

/* Badges */
.badge {
    padding: 6px 12px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.badge-warning {
    background: #fff7ed;
    color: #c2410c;
    border: 1px solid #ffedd5;
}

.badge-success {
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #dcfce7;
}

/* Steps Guide */
.steps-guide {
    background: #f8fafc;
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 24px;
    border: 1px solid #e2e8f0;
}

.steps-guide h3 {
    color: #334155;
    margin-bottom: 16px;
}

.steps-guide ol {
    margin: 0;
    padding-left: 20px;
}

.steps-guide li {
    margin-bottom: 10px;
    color: #475569;
}

/* Input Area Premium */
.registration-area {
    background: white;
    padding: 20px;
    border-radius: 12px;
    margin-top: 20px;
}

.input-group-premium {
    display: flex;
    gap: 16px;
    align-items: stretch;
    max-width: 600px;
}

.input-group-premium input {
    flex: 1;
    font-size: 48px;
    font-family: 'Courier New', monospace;
    letter-spacing: 8px;
    text-align: center;
    padding: 20px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.input-group-premium input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.input-group-premium button {
    flex-shrink: 0;
    min-width: 160px;
}

/* Testing Module Styles */
.testing-area {
    display: grid;
    gap: 24px;
}

.test-input-section {
    background: #f8f9fa;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
}

.technical-details {
    margin-top: 24px;
    padding: 24px;
    background: #f8fafc;
    border-radius: 12px;
    border: 2px solid #667eea;
}

.detail-section {
    margin-bottom: 24px;
}

.detail-section h4 {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.code-block {
    position: relative;
    background: #1e293b;
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
}

.code-block pre {
    margin: 0;
    color: #e2e8f0;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
}

.copy-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #667eea;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
}

.copy-btn:hover {
    background: #5568d3;
    transform: translateY(-2px);
}

.status-box {
    padding: 16px;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
}

.status-box.success {
    background: #dcfce7;
    color: #166534;
    border: 2px solid #86efac;
}

.status-box.error {
    background: #fee2e2;
    color: #991b1b;
    border: 2px solid #fca5a5;
}

.btn-register .btn-loader {
    display: none;
}

.btn-register.loading .btn-text {
    display: none;
}

.btn-register.loading .btn-loader {
    display: inline;
}

#registrationPin {
    font-size: 24px;
    letter-spacing: 8px;
    text-align: center;
    padding: 12px 20px;
    border: 2px solid #cbd5e1;
    border-radius: 12px;
    width: 200px;
    transition: all 0.2s;
    font-family: monospace;
    font-weight: 600;
}

#registrationPin:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    outline: none;
}

#registrationPin.valid {
    border-color: #10b981;
    background-color: #f0fdf4;
}

#registerPhoneBtn {
    flex: 1;
    background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}

#registerPhoneBtn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3);
}

#registerPhoneBtn:disabled {
    background: #e2e8f0;
    color: #94a3b8;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
}

@media (max-width: 640px) {
    .input-group-premium {
        flex-direction: column;
    }
    
    #registrationPin {
        width: 100%;
    }
    
    #registerPhoneBtn {
        padding: 16px;
    }
}
</style>
</head>
<body>

<!-- Toast Container -->
<div class="toast-container" id="toastContainer"></div>

<div class="container">
    <div class="header">
        <div>
            <h1>🌐 Meta WhatsApp Setup</h1>
            <p>Configuración profesional de credenciales y pruebas de conexión</p>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
            <a href="#registration-section" class="btn btn-secondary" style="text-decoration: none; font-size: 14px; padding: 8px 16px;">📞 Ir a Registro</a>
            <a href="/dashboard" class="btn-back">← Volver</a>
        </div>
    </div>

    <div class="grid">
        <!-- COLUMNA 1: WEBHOOK INFO & STATUS -->
        <div>
            <div class="card">
                <h2>📡 Información del Webhook</h2>
                
                <div class="section">
                    <h3 style="font-size: 16px; margin-bottom: 12px;">Webhook URL</h3>
                    <div class="info-box">
                        <label>URL para configurar en Meta Dashboard:</label>
                        <input type="text" id="webhookUrl" value="${webhookUrl}" readonly>
                        <button class="copy-btn" onclick="copyToClipboard('webhookUrl')">
                            <span>📋</span> Copiar URL
                        </button>
                    </div>
                    <p style="font-size: 13px; color: #6b7280; margin-top: 8px;">
                        Esta es la URL que debes pegar en la configuración de Webhooks de Meta Business.
                    </p>
                </div>

                <div class="section">
                    <h3 style="font-size: 16px; margin-bottom: 12px;">Verify Token</h3>
                    <div class="info-box">
                        <label>Token de verificación:</label>
                        <input type="text" id="verifyToken" value="${config.verifyToken}" readonly>
                        <button class="copy-btn" onclick="copyToClipboard('verifyToken')">
                            <span>📋</span> Copiar Token
                        </button>
                    </div>
                    <p style="font-size: 13px; color: #6b7280; margin-top: 8px;">
                        Este token se usa para verificar tu webhook con Meta.
                    </p>
                </div>

                <div class="steps">
                    <h4>📋 Pasos para Configurar en Meta:</h4>
                    <ol>
                        <li>Ve a <strong>Meta Business Suite</strong> → Configuración</li>
                        <li>Selecciona tu App de WhatsApp</li>
                        <li>En "Webhooks", haz click en <strong>"Configure webhooks"</strong></li>
                        <li>Pega el <strong>Webhook URL</strong> de arriba</li>
                        <li>Pega el <strong>Verify Token</strong> de arriba</li>
                        <li>Guarda y suscríbete a los eventos: <code>messages</code></li>
                    </ol>
                </div>
            </div>

            <!-- ESTADO ACTUAL -->
            <div class="card" style="margin-top: 24px;">
                <h2>✅ Estado de Configuración</h2>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <div>
                        <p style="font-size: 13px; color: #6b7280; margin-bottom: 6px;">JWT Token:</p>
                        <span class="status ${config.jwtToken ? 'ok' : 'error'}">
                            ${config.jwtToken ? '✓ Configurado' : '✗ Falta'}
                        </span>
                    </div>
                    <div>
                        <p style="font-size: 13px; color: #6b7280; margin-bottom: 6px;">Number ID:</p>
                        <span class="status ${config.numberId ? 'ok' : 'error'}">
                            ${config.numberId ? '✓ Configurado' : '✗ Falta'}
                        </span>
                    </div>
                    <div>
                        <p style="font-size: 13px; color: #6b7280; margin-bottom: 6px;">Business ID:</p>
                        <span class="status ${config.businessId ? 'ok' : 'error'}">
                            ${config.businessId ? '✓ Configurado' : '✗ Falta'}
                        </span>
                    </div>
                    <div>
                        <p style="font-size: 13px; color: #6b7280; margin-bottom: 6px;">API Version:</p>
                        <span class="status ${config.apiVersion ? 'ok' : 'error'}">
                            ${config.apiVersion ? '✓ ' + config.apiVersion : '✗ Falta'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- COLUMNA 2: CONFIGURACIÓN -->
        <div>
            <div class="card">
                <h2>⚙️ Variables críticas</h2>
                <p style="font-size: 13px; color: #6b7280; margin-bottom: 24px;">
                    Edita los valores del archivo .env sin salir del dashboard. Recuerda reiniciar el backend después de guardar.
                </p>
                
                <form id="metaConfigForm" onsubmit="saveMetaConfig(event)">
                    <div class="form-group" data-field="jwtToken">
                        <label>
                            Meta JWT Token 
                            <span class="required">*</span>
                            <span class="tooltip-icon" title="Token de acceso de Meta Business. Lo encuentras en Meta App Dashboard → Permisos del Sistema → Tokens de usuario">?</span>
                        </label>
                        <textarea 
                            rows="3" 
                            name="META_JWT_TOKEN" 
                            placeholder="EAAB..." 
                            oninput="validateField(this)"
                            required
                        >${config.jwtToken}</textarea>
                        <div class="validation-message"></div>
                        <div class="char-counter"></div>
                    </div>
                    
                    <div class="form-group" data-field="access">
                        <label>
                            Access Token largo
                            <span class="tooltip-icon" title="Token permanente de acceso (opcional). Duración: 60 días">?</span>
                            <button type="button" class="copy-btn" style="float: right; margin: 0; padding: 4px 10px; font-size: 11px;" onclick="copyFieldValue('META_ACCESS_TOKEN')">📋</button>
                        </label>
                        <textarea 
                            rows="3" 
                            name="META_ACCESS_TOKEN" 
                            placeholder="EAABsbCS..." 
                            oninput="validateField(this)"
                        ></textarea>
                        <div class="char-counter"></div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group" data-field="numberId">
                            <label>
                                Phone Number ID 
                                <span class="required">*</span>
                                <span class="tooltip-icon" title="ID del número de WhatsApp Business. Meta Business → WhatsApp → Números de teléfono">?</span>
                            </label>
                            <input 
                                type="text" 
                                name="META_NUMBER_ID" 
                                placeholder="123456789012345" 
                                value="${config.numberId}"
                                oninput="validateField(this)"
                                required
                            >
                            <div class="validation-message"></div>
                        </div>

                        <div class="form-group" data-field="businessId">
                            <label>
                                Business Account ID 
                                <span class="required">*</span>
                                <span class="tooltip-icon" title="ID de la cuenta de WhatsApp Business. Meta Business → Configuración → Detalles de la empresa">?</span>
                            </label>
                            <input 
                                type="text" 
                                name="META_BUSINESS_ACCOUNT_ID" 
                                placeholder="123456789012345" 
                                value="${config.businessId}"
                                oninput="validateField(this)"
                                required
                            >
                            <div class="validation-message"></div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group" data-field="apiVersion">
                            <label>
                                API Version 
                                <span class="required">*</span>
                                <span class="tooltip-icon" title="Versión de la API de WhatsApp Business. Recomendado: v22.0 (última estable)">?</span>
                            </label>
                            <select name="META_API_VERSION" required>
                                <option value="v22.0" ${config.apiVersion === 'v22.0' ? 'selected' : ''}>v22.0 (Recomendado)</option>
                                <option value="v21.0" ${config.apiVersion === 'v21.0' ? 'selected' : ''}>v21.0</option>
                                <option value="v20.0" ${config.apiVersion === 'v20.0' ? 'selected' : ''}>v20.0</option>
                                <option value="v19.0" ${config.apiVersion === 'v19.0' ? 'selected' : ''}>v19.0</option>
                            </select>
                            <div class="validation-message valid">✓ Última versión estable</div>
                        </div>

                        <div class="form-group" data-field="phoneNumber">
                            <label>
                                Teléfono de pruebas (PHONE_NUMBER)
                                <span class="tooltip-icon" title="Número de WhatsApp para pruebas. Formato: +573001234567">?</span>
                            </label>
                            <input 
                                type="text" 
                                name="PHONE_NUMBER" 
                                placeholder="+573001234567" 
                                value="${config.phoneNumber}"
                                oninput="validateField(this)"
                            >
                            <div class="validation-message"></div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
                        <button type="submit" class="btn btn-primary" id="saveBtn">
                            <span>💾</span> Guardar cambios
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="reloadConfig()">
                            <span>🔄</span> Recargar
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- REGISTRO DE NÚMERO TELEFÓNICO -->
        <div class="card" id="registration-section" style="grid-column: 1 / -1;">
            <div class="card-header">
                <h2>📞 Registro de Número Telefónico</h2>
                <span class="badge badge-warning" id="registration-status">No registrado</span>
            </div>
            
            <div class="alert alert-info" style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 8px; font-size: 16px;">¿Por qué registrar el número?</h4>
                <p style="margin: 0; line-height: 1.6;">Este paso <strong>activa tu número de WhatsApp</strong> con Meta y elimina el error <code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 4px;">133010</code> que impide enviar mensajes.</p>
            </div>

            <div class="steps-guide">
                <h3 style="margin-bottom: 12px; font-size: 15px; font-weight: 600;">Pasos para registrar:</h3>
                <ol style="margin-left: 20px; margin-top: 12px; line-height: 1.8;">
                    <li>Ve a <strong>WhatsApp Manager</strong> → Tu número → <strong>"Reenviar código de verificación"</strong></li>
                    <li>Recibirás un <strong>SMS con 6 dígitos</strong> en tu celular</li>
                    <li>Ingresa esos 6 dígitos aquí abajo</li>
                    <li>Haz clic en <strong>"Registrar Número"</strong></li>
                </ol>
            </div>

            <div class="registration-area">
                <label for="registrationPin" style="display: block; margin-bottom: 12px; font-weight: 600; color: #1e293b;">
                    PIN de Verificación (6 dígitos) <span style="color: #ef4444">*</span>
                </label>
                
                <div class="input-group-premium">
                    <input
                        type="tel"
                        id="registrationPin"
                        name="registrationPin"
                        placeholder="000000"
                        maxlength="6"
                        autocomplete="off"
                        pattern="[0-9]*"
                    >
                    
                    <button type="button" id="registerPhoneBtn" disabled>
                        <span class="btn-text">📱 Registrar Número</span>
                        <span class="btn-loading" style="display: none; align-items: center; gap: 8px;">
                            <span class="spinner" style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite;"></span>
                            Registrando...
                        </span>
                    </button>
                </div>
                <div class="validation-message"></div>
                <small class="help-text">
                    El PIN debe ser exactamente 6 dígitos numéricos
                </small>
            </div>
        </div>
    </div>
</div>

<!-- TESTING TÉCNICO -->
<div class="card" style="grid-column: 1 / -1; margin-top: 24px;">
    <h2 style="margin-bottom: 20px;">🧪 Testing & Debugging Técnico</h2>
    
    <div class="testing-area">
        <div class="test-input-section">
            <div class="form-group">
                <label class="form-label">📱 Número de Prueba</label>
                <input 
                    type="text" 
                    id="testPhoneNumber" 
                    class="form-input" 
                    placeholder="59178123456"
                    style="font-family: 'Courier New', monospace;"
                />
                <small class="help-text">Número completo con código de país (sin +)</small>
            </div>
            
            <div class="form-group">
                <label class="form-label">💬 Mensaje de Prueba</label>
                <textarea 
                    id="testMessage" 
                    class="form-input" 
                    rows="3"
                    placeholder="Hola, este es un mensaje de prueba desde el sistema Cocolu"
                >Hola, mensaje de prueba desde Cocolu 🤖</textarea>
            </div>
            
            <button 
                id="sendTestBtn" 
                class="btn-register"
                onclick="sendTestMessage()"
            >
                <span class="btn-text">🚀 Enviar Prueba</span>
                <span class="btn-loader" style="display: none;">⏳</span>
            </button>
        </div>
        
        <!-- DETALLES TÉCNICOS -->
        <div id="technicalDetails" class="technical-details" style="display: none;">
            <h3 style="margin-top: 24px; margin-bottom: 16px; color: #667eea;">📋 Detalles Técnicos</h3>
            
            <!-- CURL COMMAND -->
            <div class="detail-section">
                <h4>🔧 Comando cURL</h4>
                <div class="code-block">
                    <button class="copy-btn" onclick="copyToClipboard('curlCommand')">📋 Copiar</button>
                    <pre id="curlCommand"></pre>
                </div>
            </div>
            
            <!-- REQUEST DETAILS -->
            <div class="detail-section">
                <h4>📤 Request Details</h4>
                <div class="code-block">
                    <pre id="requestDetails"></pre>
                </div>
            </div>
            
            <!-- RESPONSE DETAILS -->
            <div class="detail-section">
                <h4>📥 Response Details</h4>
                <div class="code-block">
                    <button class="copy-btn" onclick="copyToClipboard('responseDetails')">📋 Copiar</button>
                    <pre id="responseDetails"></pre>
                </div>
            </div>
            
            <!-- STATUS -->
            <div class="detail-section">
                <h4>✅ Status</h4>
                <div id="statusDetails" class="status-box"></div>
            </div>
        </div>
    </div>
</div>

<script>
// ==================== TOAST SYSTEM ====================
class ToastManager {
    constructor() {
        this.container = document.getElementById('toastContainer');
        this.toasts = [];
    }

    show(message, type = 'info', title = null, duration = 4000) {
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const titles = {
            success: title || 'Éxito',
            error: title || 'Error',
            warning: title || 'Advertencia',
            info: title || 'Información'
        };

        toast.innerHTML = \`
            <div class="toast-icon">\${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">\${titles[type]}</div>
                <div class="toast-message">\${message}</div>
            </div>
            <button class="toast-close" onclick="toastManager.remove(this.parentElement)">×</button>
        \`;

        this.container.appendChild(toast);
        this.toasts.push(toast);

        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }

        return toast;
    }

    success(message, title = null) {
        return this.show(message, 'success', title);
    }

    error(message, title = null) {
        return this.show(message, 'error', title);
    }

    warning(message, title = null) {
        return this.show(message, 'warning', title);
    }

    info(message, title = null) {
        return this.show(message, 'info', title);
    }

    remove(toast) {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    clear() {
        this.toasts.forEach(t => this.remove(t));
    }
}

const toastManager = new ToastManager();

// ==================== VALIDATION ====================
function validateField(input) {
    const group = input.closest('.form-group');
    const field = group.dataset.field;
    const value = input.value.trim();
    const msgEl = group.querySelector('.validation-message');
    const counterEl = group.querySelector('.char-counter');

    // Character counter
    if (counterEl) {
        counterEl.textContent = value.length + ' caracteres';
    }

    // Validation rules
    let isValid = true;
    let message = '';

    switch(field) {
        case 'jwtToken':
            if (value.length === 0) {
                isValid = false;
                message = '✗ Este campo es requerido';
            } else if (value.length < 100) {
                isValid = false;
                message = '✗ Token muy corto (mínimo 100 caracteres)';
            } else if (!value.startsWith('EAA')) {
                isValid = false;
                message = '✗ Token debe empezar con "EAA"';
            } else {
                isValid = true;
                message = '✓ Token válido';
            }
            break;

        case 'numberId':
        case 'businessId':
            if (value.length === 0) {
                isValid = false;
                message = '✗ Este campo es requerido';
            } else if (!/^\\d{15,}$/.test(value)) {
                isValid = false;
                message = '✗ Debe ser numérico (mínimo 15 dígitos)';
            } else {
                isValid = true;
                message = '✓ ID válido';
            }
            break;

        case 'phoneNumber':
            if (value.length > 0 && !/^\\+\\d{10,}$/.test(value)) {
                isValid = false;
                message = '✗ Formato: +[código][número] (ej: +573001234567)';
            } else if (value.length > 0) {
                isValid = true;
                message = '✓ Número válido';
            }
            break;
    }

    // Update UI
    if (msgEl && message) {
        msgEl.textContent = message;
        msgEl.className = 'validation-message ' + (isValid ? 'valid' : 'invalid');
        msgEl.style.display = 'flex';
    }

    group.className = 'form-group ' + (isValid ? 'valid' : 'invalid');

    return isValid;
}

// ==================== COPY TO CLIPBOARD ====================
function copyToClipboard(elementId) {
    const input = document.getElementById(elementId);
    input.select();
    document.execCommand('copy');
    
    toastManager.success('Copiado al portapapeles', 'Copiado');
}

function copyFieldValue(fieldName) {
    const input = document.querySelector(\`[name="\${fieldName}"]\`);
    if (input && input.value) {
        input.select();
        document.execCommand('copy');
        toastManager.success('Token copiado al portapapeles', 'Copiado');
    }
}

// ==================== SAVE CONFIG ====================
function saveMetaConfig(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validate required fields
    const jwtToken = data.META_JWT_TOKEN?.trim();
    const numberId = data.META_NUMBER_ID?.trim();
    const businessId = data.META_BUSINESS_ACCOUNT_ID?.trim();

    if (!jwtToken || jwtToken.length < 100) {
        toastManager.warning('El Meta JWT Token es requerido y debe tener al menos 100 caracteres', 'Validación');
        return;
    }

    if (!numberId || !/^\\d{15,}$/.test(numberId)) {
        toastManager.warning('El Phone Number ID debe ser numérico con mínimo 15 dígitos', 'Validación');
        return;
    }

    if (!businessId || !/^\\d{15,}$/.test(businessId)) {
        toastManager.warning('El Business Account ID debe ser numérico con mínimo 15 dígitos', 'Validación');
        return;
    }
    
    const btn = document.getElementById('saveBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Guardando...';
    
    toastManager.info('Guardando configuración...', 'Procesando');
    
    fetch('/api/meta/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            toastManager.success('Configuración guardada correctamente', 'Guardado');
            
            // Auto-reload suave
            setTimeout(() => {
                toastManager.info('Recargando configuración...', 'Actualizando');
                setTimeout(() => {
                    window.location.reload();
                }, 800);
            }, 1200);
        } else {
            toastManager.error(d.error || 'Error al guardar configuración', 'Error');
            btn.disabled = false;
            btn.innerHTML = '<span>💾</span> Guardar cambios';
        }
    })
    .catch(e => {
        toastManager.error('Error de conexión: ' + e.message, 'Error');
        btn.disabled = false;
        btn.innerHTML = '<span>💾</span> Guardar cambios';
    });
}

// ==================== RELOAD CONFIG ====================
function reloadConfig() {
    toastManager.info('Recargando página...', 'Recargando');
    setTimeout(() => {
        window.location.reload();
    }, 600);
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async function() {
    // Cargar configuración desde BD
    await loadMetaConfigFromAPI();
    
    toastManager.success('Configuración cargada correctamente', 'Listo');
});

// Cargar configuración desde API
async function loadMetaConfigFromAPI() {
    try {
        const res = await fetch('/api/meta/config');
        const json = await res.json();
        
        if (json.success && json.data) {
            // Pre-llenar formulario con valores de BD
            Object.entries(json.data).forEach(([key, value]) => {
                const input = document.querySelector('[name=\"' + key + '\"]');
                if (input && value) {
                    input.value = value;
                    // Validar campo si tiene valor
                    if (value.trim()) {
                        validateField(input);
                    }
                }
            });
            console.log('✅ Configuración cargada desde BD');
        }
    } catch (error) {
        console.error('❌ Error cargando config:', error);
        toastManager.warning('No se pudo cargar configuración anterior', 'Advertencia');
    }
}

// ==================== MÓDULO REGISTRO DE NÚMERO ====================

// Cargar estado de registro al inicio
async function loadRegistrationStatus() {
    try {
        const res = await fetch('/api/meta/config');
        const json = await res.json();
        
        if (json.success && json.data.PHONE_REGISTERED === 'true') {
            const statusBadge = document.getElementById('registration-status');
            if (statusBadge) {
                statusBadge.textContent = '✅ Registrado';
                statusBadge.classList.remove('badge-warning');
                statusBadge.classList.add('badge-success');
            }
        }
    } catch (error) {
        console.error('Error al cargar estado de registro:', error);
    }
}

// Validación PIN
const pinInput = document.getElementById('registrationPin');
const registerBtn = document.getElementById('registerPhoneBtn');

if (pinInput && registerBtn) {
    pinInput.addEventListener('input', (e) => {
        const pin = e.target.value.replace(/\\D/g, ''); // Solo dígitos
        e.target.value = pin;
        
        const isValid = pin.length === 6;
        registerBtn.disabled = !isValid;
        
        if (isValid) {
            e.target.classList.add('valid');
            e.target.classList.remove('invalid');
        } else if (pin.length > 0) {
            e.target.classList.add('invalid');
            e.target.classList.remove('valid');
        } else {
            e.target.classList.remove('valid', 'invalid');
        }
    });

    // Registro de número
    registerBtn.addEventListener('click', async () => {
        const pin = pinInput.value;
        
        if (pin.length !== 6) {
            toastManager.error('El PIN debe tener exactamente 6 dígitos');
            return;
        }
        
        // UI Loading state
        registerBtn.disabled = true;
        registerBtn.querySelector('.btn-text').style.display = 'none';
        registerBtn.querySelector('.btn-loading').style.display = 'flex';
        
        try {
            const res = await fetch('/api/meta/register-phone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin })
            });
            
            const json = await res.json();
            
            if (json.success) {
                toastManager.success(
                    '✅ Número registrado exitosamente! El error 133010 debería desaparecer en unos minutos.',
                    'Registro Exitoso'
                );
                
                // Actualizar status badge
                const statusBadge = document.getElementById('registration-status');
                statusBadge.textContent = '✅ Registrado';
                statusBadge.classList.remove('badge-warning');
                statusBadge.classList.add('badge-success');
                
                // Limpiar input
                pinInput.value = '';
                pinInput.classList.remove('valid');
                
            } else {
                toastManager.error(
                    json.message || 'Error al registrar el número',
                    'Error de Registro'
                );
            }
        } catch (error) {
            console.error('Error al registrar número:', error);
            toastManager.error(
                'Error de conexión al intentar registrar el número',
                'Error'
            );
        } finally {
            // Restore button state
            registerBtn.disabled = false;
            registerBtn.querySelector('.btn-text').style.display = 'inline';
            registerBtn.querySelector('.btn-loading').style.display = 'none';
        }
    });
}

// Cargar estado de registro cuando cargue la página
loadRegistrationStatus();

// ==================== TESTING MODULE FUNCTIONS ====================

/**
 * Copiar contenido al portapapeles
 */
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        toastManager.success('Copiado al portapapeles', 'Éxito');
    }).catch(err => {
        console.error('Error al copiar:', err);
        toastManager.error('No se pudo copiar', 'Error');
    });
}

/**
 * Enviar mensaje de prueba con detalles técnicos completos
 */
async function sendTestMessage() {
    const phoneNumber = document.getElementById('testPhoneNumber').value.trim();
    const message = document.getElementById('testMessage').value.trim();
    const btn = document.getElementById('sendTestBtn');
    const technicalDetails = document.getElementById('technicalDetails');
    
    // Validaciones
    if (!phoneNumber) {
        toastManager.error('Por favor ingresa un número de teléfono', 'Validación');
        return;
    }
    
    if (!message) {
        toastManager.error('Por favor ingresa un mensaje', 'Validación');
        return;
    }
    
    // Loading state
    btn.classList.add('loading');
    btn.disabled = true;
    technicalDetails.style.display = 'none';
    
    try {
        const startTime = Date.now();
        
        // Llamar al backend
        const response = await fetch('/api/meta/send-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: phoneNumber,
                message: message
            })
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const data = await response.json();
        
        // Mostrar detalles técnicos
        displayTechnicalDetails(data, phoneNumber, message, response.status, duration);
        
        // Toast de éxito o error
        if (response.ok && data.success) {
            toastManager.success(`Mensaje enviado en ${ duration }ms`, 'Prueba Exitosa');
        } else {
            toastManager.error(data.error || 'Error al enviar mensaje', 'Error');
        }
        
    } catch (error) {
        console.error('Error en prueba:', error);
        toastManager.error(error.message || 'Error de red', 'Error');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

/**
 * Mostrar detalles técnicos en la UI
 */
function displayTechnicalDetails(data, phoneNumber, message, statusCode, duration) {
    const technicalDetails = document.getElementById('technicalDetails');
    const curlCommand = document.getElementById('curlCommand');
    const requestDetails = document.getElementById('requestDetails');
    const responseDetails = document.getElementById('responseDetails');
    const statusDetails = document.getElementById('statusDetails');
    
    // Generar curl command
    const curlCmd = data.technicalDetails?.curlCommand || generateCurlCommand(phoneNumber, message);
    curlCommand.textContent = curlCmd;
    
    // Request details
    const requestInfo = {
        method: 'POST',
        endpoint: data.technicalDetails?.endpoint || '/v21.0/[PHONE_NUMBER_ID]/messages',
        headers: data.technicalDetails?.headers || {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer [META_JWT_TOKEN]'
        },
        body: data.technicalDetails?.requestBody || {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            text: { body: message }
        },
        timestamp: new Date().toISOString()
    };
    requestDetails.textContent = JSON.stringify(requestInfo, null, 2);
    
    // Response details
    const responseInfo = {
        status: statusCode,
        success: data.success,
        duration: `${ duration }ms`,
        response: data.response || data.data,
        error: data.error,
        metaResponse: data.technicalDetails?.metaResponse,
        headers: data.technicalDetails?.responseHeaders,
        timestamp: new Date().toISOString()
    };
    responseDetails.textContent = JSON.stringify(responseInfo, null, 2);
    
    // Status box
    statusDetails.className = 'status-box ' + (data.success ? 'success' : 'error');
    statusDetails.innerHTML = `
        < div > <strong>Status Code:</strong> ${ statusCode }</div >
        <div><strong>Success:</strong> ${data.success ? '✅ Yes' : '❌ No'}</div>
        <div><strong>Duration:</strong> ${duration}ms</div>
        ${ data.messageId ? `<div><strong>Message ID:</strong> ${data.messageId}</div>` : '' }
        ${ data.error ? `<div><strong>Error:</strong> ${data.error}</div>` : '' }
            `;
    
    // Mostrar sección
    technicalDetails.style.display = 'block';
    
    // Scroll suave a detalles técnicos
    setTimeout(() => {
        technicalDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

/**
 * Generar comando curl de ejemplo
 */
function generateCurlCommand(phoneNumber, message) {
    return `curl - X POST "https://graph.facebook.com/v21.0/[PHONE_NUMBER_ID]/messages" \\
            -H "Content-Type: application/json" \\
            -H "Authorization: Bearer [META_JWT_TOKEN]" \\
            -d '{
    "messaging_product": "whatsapp",
            "to": "${phoneNumber}",
            "text": {
            "body": "${message.replace(/" / g, '\\"')
    }"
    }
  }'`;
}

</script >

</body >
</html >
    `);
    });


    // API: Obtener configuración Meta desde BD
    app.get('/api/meta/config', (req, res) => {
        try {
            // 1. Intentar leer desde BD
            let config = metaConfigService.getAllConfigs();

            // 2. Si está vacío, leer desde .env como fallback
            if (Object.keys(config).length === 0) {
                config = {
                    META_JWT_TOKEN: process.env.META_JWT_TOKEN || '',
                    META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN || '',
                    META_NUMBER_ID: process.env.META_NUMBER_ID || '',
                    META_BUSINESS_ACCOUNT_ID: process.env.META_BUSINESS_ACCOUNT_ID || '',
                    META_VERIFY_TOKEN: process.env.META_VERIFY_TOKEN || 'cocolu_webhook_verify_2025_secure_token_meta',
                    META_API_VERSION: process.env.META_API_VERSION || 'v22.0',
                    PHONE_NUMBER: process.env.PHONE_NUMBER || ''
                };

                // Guardar en BD para próxima vez (migración automática)
                metaConfigService.setConfigs(config);
                console.log('✅ Configuración migrada desde .env a BD');
            }

            res.json({ success: true, data: config });
        } catch (error) {
            console.error('❌ Error cargando config:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // API: Guardar configuración Meta
    app.post('/api/meta/save-config', (req, res) => {
        try {
            const fs = require('fs');
            const path = require('path');
            const envPath = path.resolve(process.cwd(), '.env');

            // 1. Guardar en .env (como antes)
            let content = fs.readFileSync(envPath, 'utf8');

            Object.entries(req.body).forEach(([key, value]) => {
                const regex = new RegExp(`^ ${ key }=.* $`, 'm');
                if (regex.test(content)) {
                    content = content.replace(regex, `${ key }=${ value } `);
                } else {
                    content += `\n${ key }=${ value } `;
                }
            });

            fs.writeFileSync(envPath, content, 'utf8');

            // 2. Guardar en SQLite (NUEVO)
            metaConfigService.setConfigs(req.body);

            console.log('✅ Configuración Meta guardada en .env y BD');
            res.json({ success: true, message: 'Configuración guardada' });
        } catch (error) {
            console.error('❌ Error guardando config:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // API: Enviar mensaje de prueba
    app.post('/api/meta/send-test', async (req, res) => {
        try {
            const { phone, message } = req.body;

            // Aquí se integraría con el provider real
            // Por ahora simulamos
            console.log(`📤 Mensaje de prueba a ${ phone }: ${ message } `);

            res.json({
                success: true,
                message: 'Mensaje enviado (modo prueba)',
                messageId: 'test_' + Date.now()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // API: Obtener mensajes recientes
    app.get('/api/meta/recent-messages', (req, res) => {
        // Aquí retornarías los últimos mensajes del log
        res.json({
            success: true,
            messages: []
        });
    });

    // Endpoint para registrar número telefónico (elimina error 133010)
    app.post('/api/meta/register-phone', async (req, res) => {
        try {
            const { pin } = req.body;

            // Validar PIN
            if (!pin || !/^\\d{6}$/.test(pin)) {
                return res.status(400).json({
                    success: false,
                    error: 'PIN inválido',
                    message: 'El PIN debe ser exactamente 6 dígitos numéricos'
                });
            }

            // Obtener configuración
            const allConfigs = metaConfigService.getAllConfigs();
            const numberId = allConfigs.META_NUMBER_ID || process.env.META_NUMBER_ID;
            const jwtToken = allConfigs.META_JWT_TOKEN || process.env.META_JWT_TOKEN;
            const apiVersion = allConfigs.META_API_VERSION || process.env.META_API_VERSION || 'v20.0';

            if (!numberId || !jwtToken) {
                return res.status(400).json({
                    success: false,
                    error: 'Configuración incompleta',
                    message: 'META_NUMBER_ID y META_JWT_TOKEN son requeridos. Por favor configura estos valores primero.'
                });
            }

            // Llamar a Meta API /register
            const metaUrl = `https://graph.facebook.com/${apiVersion}/${numberId}/register`;

console.log(`📞 Registrando número ${numberId} con Meta API...`);

const metaResponse = await fetch(metaUrl, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        messaging_product: 'whatsapp',
        pin: pin
    })
});

const metaData = await metaResponse.json();

console.log('Meta API Response:', metaData);

if (metaResponse.ok && metaData.success) {
    // Guardar estado de registro en SQLite
    metaConfigService.setConfigs({
        PHONE_REGISTERED: 'true',
        PHONE_REGISTERED_DATE: new Date().toISOString()
    });

    console.log('✅ Número registrado exitosamente');

    return res.json({
        success: true,
        message: 'Número registrado exitosamente. El error 133010 debería desaparecer en unos minutos.',
        data: {
            registered: true,
            timestamp: new Date().toISOString()
        }
    });
} else {
    console.error('❌ Error de Meta API:', metaData.error);

    return res.status(400).json({
        success: false,
        error: 'Error de Meta API',
        message: metaData.error?.message || metaData.error?.error_user_msg || 'Error desconocido al registrar el número',
        metaError: metaData.error
    });
}
        } catch (error) {
    console.error('❌ Error en registro de número:', error);
    return res.status(500).json({
        success: false,
        error: 'Error del servidor',
        message: error.message
    });
}
    });

// API: Enviar mensaje de prueba con detalles técnicos completos
app.post('/api/meta/send-test', async (req, res) => {
    try {
        const { to, message } = req.body;

        // Validar inputs
        if (!to || !message) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros faltantes',
                message: 'Se requiere "to" (número) y "message" (texto)'
            });
        }

        // Obtener configuración de Meta
        const config = metaConfigService.getAllConfigs();
        const jwtToken = config.META_JWT_TOKEN;
        const numberId = config.META_NUMBER_ID;
        const apiVersion = config.META_API_VERSION || 'v21.0';

        if (!jwtToken || !numberId) {
            return res.status(400).json({
                success: false,
                error: 'Configuración incompleta',
                message: 'Falta META_JWT_TOKEN o META_NUMBER_ID. Configura Meta primero.'
            });
        }

        // Preparar request para Meta API
        const endpoint = `https://graph.facebook.com/${apiVersion}/${numberId}/messages`;
        const requestBody = {
            messaging_product: 'whatsapp',
            to: to,
            text: {
                body: message
            }
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        };

        // Generar comando curl para debugging
        const curlCommand = `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${jwtToken.substring(0, 20)}...${jwtToken.substring(jwtToken.length - 20)}" \\
  -d '${JSON.stringify(requestBody, null, 2)}'`;

        // Enviar mensaje a Meta
        const startTime = Date.now();
        const metaResponse = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        const endTime = Date.now();
        const duration = endTime - startTime;

        const metaData = await metaResponse.json();
        const responseHeaders = {};
        metaResponse.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        // Preparar respuesta con detalles técnicos
        if (metaResponse.ok && metaData.messages) {
            return res.json({
                success: true,
                message: 'Mensaje enviado correctamente',
                messageId: metaData.messages[0]?.id,
                response: metaData,
                technicalDetails: {
                    endpoint: endpoint,
                    curlCommand: curlCommand,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwtToken.substring(0, 20)}...`
                    },
                    requestBody: requestBody,
                    metaResponse: metaData,
                    responseHeaders: responseHeaders,
                    duration: `${duration}ms`,
                    statusCode: metaResponse.status,
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            // Error de Meta API
            return res.status(metaResponse.status || 500).json({
                success: false,
                error: metaData.error?.message || 'Error de Meta API',
                message: metaData.error?.error_user_msg || 'No se pudo enviar el mensaje',
                response: metaData,
                technicalDetails: {
                    endpoint: endpoint,
                    curlCommand: curlCommand,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwtToken.substring(0, 20)}...`
                    },
                    requestBody: requestBody,
                    metaResponse: metaData,
                    responseHeaders: responseHeaders,
                    duration: `${duration}ms`,
                    statusCode: metaResponse.status,
                    timestamp: new Date().toISOString()
                }
            });
        }

    } catch (error) {
        console.error('❌ Error en envío de prueba:', error);
        return res.status(500).json({
            success: false,
            error: 'Error del servidor',
            message: error.message,
            technicalDetails: {
                error: error.toString(),
                stack: error.stack?.split('\n').slice(0, 5).join('\n')
            }
        });
    }
});
};

export default setupMetaRoutes;
