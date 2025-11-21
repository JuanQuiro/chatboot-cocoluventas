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
        <a href="/" class="btn-back">← Volver</a>
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
                const input = document.querySelector(`[name = "${key}"]`);
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
</script>

</body>
</html>
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
                const regex = new RegExp(`^${key}=.*$`, 'm');
                if (regex.test(content)) {
                    content = content.replace(regex, `${key}=${value}`);
                } else {
                    content += `\n${key}=${value}`;
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
            console.log(`📤 Mensaje de prueba a ${phone}: ${message}`);

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
};

export default setupMetaRoutes;
