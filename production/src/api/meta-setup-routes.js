/**
 * Meta WhatsApp Setup & Testing Module
 * Configuración completa y pruebas de Meta WhatsApp
 */

import fs from 'fs';
import path from 'path';

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
<link rel="stylesheet" href="/api/components/design-system.css">
<style>
body {
    background: linear-gradient(135deg, var(--primary-600) 0%, var(--secondary-600) 100%);
    min-height: 100vh;
    padding: var(--space-6);
}

.page-header {
    background: white;
    border-radius: var(--radius-2xl);
    padding: var(--space-8);
    margin-bottom: var(--space-6);
    box-shadow: var(--shadow-xl);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-4);
}

.page-title {
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.page-title h1 {
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
    color: var(--gray-900);
    margin: 0;
}

.page-subtitle {
    color: var(--gray-600);
    font-size: var(--text-sm);
    margin-top: var(--space-1);
}

.config-status {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
}

.status-indicator.configured {
    background: var(--success-50);
    color: var(--success-700);
}

.status-indicator.missing {
    background: var(--error-50);
    color: var(--error-700);
}

.main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);
    margin-bottom: var(--space-6);
}

@media (max-width: 1024px) {
    .main-grid {
        grid-template-columns: 1fr;
    }
}

.config-section {
    background: white;
    border-radius: var(--radius-2xl);
    padding: var(--space-8);
    box-shadow: var(--shadow-lg);
}

.section-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
    padding-bottom: var(--space-4);
    border-bottom: 2px solid var(--gray-100);
}

.section-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-2xl);
}

.section-title {
    flex: 1;
}

.section-title h2 {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    color: var(--gray-900);
    margin: 0;
}

.section-title p {
    font-size: var(--text-sm);
    color: var(--gray-600);
    margin-top: var(--space-1);
}

.info-box {
    background: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
}

.info-box-label {
    font-size: var(--text-xs);
    font-weight: var(--font-bold);
    color: var(--primary-600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-2);
}

.info-box-content {
    display: flex;
    gap: var(--space-2);
}

.info-box-content input {
    flex: 1;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    padding: var(--space-3);
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-md);
    background: white;
}

.copy-button {
    padding: var(--space-3) var(--space-4);
    background: var(--primary-600);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    cursor: pointer;
    transition: all var(--transition-base);
    white-space: nowrap;
}

.copy-button:hover {
    background: var(--primary-700);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.help-text {
    font-size: var(--text-xs);
    color: var(--gray-600);
    margin-top: var(--space-2);
    line-height: 1.5;
}

.config-grid {
    display: grid;
    gap: var(--space-4);
}

.config-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    border: 1px solid var(--gray-200);
}

.config-item-info {
    flex: 1;
}

.config-item-label {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--gray-900);
}

.config-item-value {
    font-size: var(--text-xs);
    color: var(--gray-600);
    margin-top: var(--space-1);
    font-family: var(--font-mono);
}

.steps-guide {
    background: linear-gradient(135deg, var(--warning-50), var(--warning-100));
    border-left: 4px solid var(--warning-600);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    margin-top: var(--space-6);
}

.steps-guide h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--warning-900);
    margin-bottom: var(--space-4);
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.steps-guide ol {
    margin-left: var(--space-6);
    color: var(--warning-900);
    font-size: var(--text-sm);
    line-height: 1.8;
}

.steps-guide code {
    background: rgba(255, 255, 255, 0.6);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
}

.test-section {
    background: white;
    border-radius: var(--radius-2xl);
    padding: var(--space-8);
    box-shadow: var(--shadow-lg);
    grid-column: 1 / -1;
}

.test-controls {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
}

@media (max-width: 768px) {
    .test-controls {
        grid-template-columns: 1fr;
    }
}

.test-result {
    background: var(--gray-900);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--success-400);
    max-height: 400px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
}

.toast-container {
    position: fixed;
    top: var(--space-6);
    right: var(--space-6);
    z-index: var(--z-tooltip);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.toast {
    background: white;
    border-radius: var(--radius-xl);
    padding: var(--space-4) var(--space-6);
    box-shadow: var(--shadow-2xl);
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 300px;
    animation: slideIn 0.3s ease;
    border-left: 4px solid;
}

.toast.success {
    border-left-color: var(--success-600);
}

.toast.error {
    border-left-color: var(--error-600);
}

.toast-icon {
    font-size: var(--text-2xl);
}

.toast-content {
    flex: 1;
}

.toast-title {
    font-weight: var(--font-semibold);
    color: var(--gray-900);
    font-size: var(--text-sm);
}

.toast-message {
    font-size: var(--text-xs);
    color: var(--gray-600);
    margin-top: var(--space-1);
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

/* Modal Styles */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: var(--z-modal);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.modal-content {
    position: relative;
    background: white;
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-2xl);
    max-width: 500px;
    width: 90%;
    animation: modalSlideIn 0.3s ease;
}

.modal-header {
    padding: var(--space-6);
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    color: var(--gray-900);
}

.modal-close {
    background: none;
    border: none;
    font-size: var(--text-2xl);
    color: var(--gray-400);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    transition: all var(--transition-base);
}

.modal-close:hover {
    background: var(--gray-100);
    color: var(--gray-600);
}

.modal-body {
    padding: var(--space-6);
}

.modal-footer {
    padding: var(--space-6);
    border-top: 1px solid var(--gray-200);
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
}

@keyframes modalSlideIn {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>
</head>
<body>

<div class="container">
    <!-- Page Header -->
    <div class="page-header">
        <div>
            <div class="page-title">
                <span style="font-size: 2.5rem;">🌐</span>
                <div>
                    <h1>Meta WhatsApp Setup</h1>
                    <p class="page-subtitle">Configuración profesional de credenciales y pruebas de conexión</p>
                </div>
            </div>
        </div>
        <div class="config-status">
            <div class="status-indicator ${config.jwtToken ? 'configured' : 'missing'}">
                <span>${config.jwtToken ? '✓' : '✗'}</span>
                <span>JWT Token</span>
            </div>
            <div class="status-indicator ${config.numberId ? 'configured' : 'missing'}">
                <span>${config.numberId ? '✓' : '✗'}</span>
                <span>Number ID</span>
            </div>
            <div class="status-indicator ${config.businessId ? 'configured' : 'missing'}">
                <span>${config.businessId ? '✓' : '✗'}</span>
                <span>Business ID</span>
            </div>
            <a href="/dashboard" class="btn btn-secondary btn-sm">← Volver al Dashboard</a>
        </div>
    </div>

    <!-- Main Grid -->
    <div class="main-grid">
        <!-- Webhook Information -->
        <div class="config-section">
            <div class="section-header">
                <div class="section-icon">🔗</div>
                <div class="section-title">
                    <h2>Información del Webhook</h2>
                    <p>URLs y tokens para configurar en Meta Dashboard</p>
                </div>
            </div>

            <div class="info-box">
                <div class="info-box-label">URL PARA CONFIGURAR EN META DASHBOARD:</div>
                <div class="info-box-content">
                    <input type="text" value="${webhookUrl}" readonly id="webhookUrl">
                    <button class="copy-button" onclick="copyToClipboard('webhookUrl', 'Webhook URL')">
                        📋 Copiar
                    </button>
                </div>
                <p class="help-text">Esta es la URL que debes pegar en la configuración de Webhooks de Meta Business.</p>
            </div>

            <div class="info-box">
                <div class="info-box-label">TOKEN DE VERIFICACIÓN:</div>
                <div class="info-box-content">
                    <input type="text" value="${verifyToken}" readonly id="verifyToken">
                    <button class="copy-button" onclick="copyToClipboard('verifyToken', 'Verify Token')">
                        📋 Copiar
                    </button>
                </div>
                <p class="help-text">Este token se usa para verificar tu webhook con Meta.</p>
            </div>

            <div class="steps-guide">
                <h3>📚 Pasos para configurar en Meta</h3>
                <ol>
                    <li>Ve a <code>Meta Business Suite → Configuración → WhatsApp → Configuración</code></li>
                    <li>En la sección "Webhooks", haz clic en <code>Configurar webhooks</code></li>
                    <li>Pega la <strong>URL del webhook</strong> y el <strong>token de verificación</strong></li>
                    <li>Suscríbete al evento <code>messages</code></li>
                    <li>Guarda los cambios</li>
                </ol>
            </div>
        </div>

        <!-- Current Configuration -->
        <div class="config-section">
            <div class="section-header">
                <div class="section-icon">⚙️</div>
                <div class="section-title">
                    <h2>Configuración Actual</h2>
                    <p>Credenciales configuradas en el servidor</p>
                </div>
            </div>

            <div class="config-grid">
                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">JWT Token</div>
                        <div class="config-item-value">${config.jwtToken ? config.jwtToken.substring(0, 20) + '...' : 'No configurado'}</div>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="openEditModal('META_JWT_TOKEN', 'JWT Token', '${config.jwtToken}')">
                        ✏️ Editar
                    </button>
                </div>

                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">Number ID</div>
                        <div class="config-item-value">${config.numberId || 'No configurado'}</div>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="openEditModal('META_NUMBER_ID', 'Number ID', '${config.numberId}')">
                        ✏️ Editar
                    </button>
                </div>

                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">Business Account ID</div>
                        <div class="config-item-value">${config.businessId || 'No configurado'}</div>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="openEditModal('META_BUSINESS_ACCOUNT_ID', 'Business Account ID', '${config.businessId}')">
                        ✏️ Editar
                    </button>
                </div>

                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">API Version</div>
                        <div class="config-item-value">${config.apiVersion}</div>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="openEditModal('META_API_VERSION', 'API Version', '${config.apiVersion}')">
                        ✏️ Editar
                    </button>
                </div>

                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">Phone Number (Testing)</div>
                        <div class="config-item-value">${config.phoneNumber || 'No configurado'}</div>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="openEditModal('PHONE_NUMBER', 'Phone Number', '${config.phoneNumber}')">
                        ✏️ Editar
                    </button>
                </div>
            </div>
        </div>

        <!-- Test Section -->
        <div class="test-section">
            <div class="section-header">
                <div class="section-icon">🧪</div>
                <div class="section-title">
                    <h2>Probar Conexión</h2>
                    <p>Envía un mensaje de prueba para verificar que todo funciona correctamente</p>
                </div>
            </div>

            <div class="test-controls">
                <div class="form-group">
                    <label class="form-label">Número de destino</label>
                    <input type="tel" class="form-input" id="testPhone" placeholder="${config.phoneNumber || '+1234567890'}" value="${config.phoneNumber}">
                </div>
                <div class="form-group">
                    <label class="form-label">Mensaje de prueba</label>
                    <input type="text" class="form-input" id="testMessage" placeholder="Hola desde Cocolu" value="Ping de prueba desde dashboard">
                </div>
                <div class="form-group">
                    <label class="form-label" style="opacity: 0;">Action</label>
                    <button class="btn btn-primary" onclick="sendTestMessage()" id="testButton">
                        <span id="testButtonText">🚀 Enviar Prueba</span>
                    </button>
                </div>
            </div>

            <div id="testResult" class="test-result" style="display: none;">
                Esperando resultado...
            </div>
        </div>
</div>
</div>

<!-- Edit Credential Modal -->
<div id="editModal" class="modal" style="display: none;">
    <div class="modal-overlay" onclick="closeEditModal()"></div>
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="modalTitle">Editar Credencial</h3>
            <button class="modal-close" onclick="closeEditModal()">✕</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label class="form-label" id="modalLabel">Valor</label>
                <input type="text" class="form-input" id="modalInput" placeholder="Ingresa el nuevo valor">
                <p class="help-text" id="modalHelp"></p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeEditModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="saveCredential()" id="saveButton">
                <span id="saveButtonText">💾 Guardar</span>
            </button>
        </div>
    </div>
</div>

<!-- Toast Container -->
<div class="toast-container" id="toastContainer"></div>

<script>
// Auth check
if (!localStorage.getItem('cocolu_token')) {
    window.location.href = '/login';
}

// Copy to clipboard function
function copyToClipboard(elementId, label) {
    const input = document.getElementById(elementId);
    input.select();
    document.execCommand('copy');
    showToast('success', 'Copiado', \`\${label} copiado al portapapeles\`);
}

// Toast notification system
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = \`toast \${type}\`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    
    toast.innerHTML = \`
        <div class="toast-icon">\${icon}</div>
        <div class="toast-content">
            <div class="toast-title">\${title}</div>
            <div class="toast-message">\${message}</div>
        </div>
    \`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Modal state
let currentEditKey = '';
let currentEditLabel = '';

// Open edit modal
function openEditModal(key, label, currentValue) {
    currentEditKey = key;
    currentEditLabel = label;
    
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalLabel = document.getElementById('modalLabel');
    const modalInput = document.getElementById('modalInput');
    const modalHelp = document.getElementById('modalHelp');
    
    modalTitle.textContent = \`Editar \${label}\`;
    modalLabel.textContent = label;
    modalInput.value = currentValue || '';
    
    // Set help text based on credential type
    const helpTexts = {
        'META_JWT_TOKEN': 'Token de acceso permanente de Meta Business. Lo encuentras en Meta Business Suite → Configuración → Tokens de sistema.',
        'META_NUMBER_ID': 'ID del número de teléfono de WhatsApp Business. Lo encuentras en Meta Business Suite → WhatsApp → Configuración.',
        'META_BUSINESS_ACCOUNT_ID': 'ID de la cuenta de negocio de Meta. Lo encuentras en Meta Business Suite → Configuración de la empresa.',
        'META_API_VERSION': 'Versión de la API de Meta (ej: v22.0, v21.0). Recomendado: v22.0',
        'PHONE_NUMBER': 'Número de teléfono para pruebas (formato internacional con +, ej: +1234567890)'
    };
    
    modalHelp.textContent = helpTexts[key] || 'Ingresa el nuevo valor para esta credencial.';
    
    modal.style.display = 'flex';
    modalInput.focus();
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
    currentEditKey = '';
    currentEditLabel = '';
}

// Save credential
async function saveCredential() {
    const modalInput = document.getElementById('modalInput');
    const saveButton = document.getElementById('saveButton');
    const saveButtonText = document.getElementById('saveButtonText');
    const newValue = modalInput.value.trim();
    
    if (!newValue) {
        showToast('error', 'Error', 'El valor no puede estar vacío');
        return;
    }
    
    // Disable button and show loading
    saveButton.disabled = true;
    saveButtonText.innerHTML = '<div class="spinner"></div> Guardando...';
    
    try {
        const response = await fetch(\`/api/settings/\${currentEditKey}\`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value: newValue })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('success', 'Guardado', \`\${currentEditLabel} actualizado correctamente\`);
            closeEditModal();
            
            // Reload page after 1 second to show updated values
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showToast('error', 'Error', data.error || 'Error al guardar la credencial');
        }
    } catch (error) {
        showToast('error', 'Error de conexión', 'No se pudo conectar con el servidor');
    } finally {
        saveButton.disabled = false;
        saveButtonText.innerHTML = '💾 Guardar';
    }
}

// Send test message
async function sendTestMessage() {
    const phone = document.getElementById('testPhone').value;
    const message = document.getElementById('testMessage').value;
    const button = document.getElementById('testButton');
    const buttonText = document.getElementById('testButtonText');
    const resultDiv = document.getElementById('testResult');
    
    if (!phone || !message) {
        showToast('error', 'Error', 'Por favor completa todos los campos');
        return;
    }
    
    // Disable button and show loading
    button.disabled = true;
    buttonText.innerHTML = '<div class="spinner"></div> Enviando...';
    resultDiv.style.display = 'block';
    resultDiv.textContent = 'Enviando mensaje de prueba...';
    
    try {
        const response = await fetch('/api/meta/test-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ to: phone, message: message })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            resultDiv.textContent = JSON.stringify(data, null, 2);
            showToast('success', 'Éxito', 'Mensaje enviado correctamente');
        } else {
            resultDiv.textContent = JSON.stringify(data, null, 2);
            showToast('error', 'Error', data.error || 'Error al enviar mensaje');
        }
    } catch (error) {
        resultDiv.textContent = 'Error: ' + error.message;
        showToast('error', 'Error de conexión', 'No se pudo conectar con el servidor');
    } finally {
        button.disabled = false;
        buttonText.innerHTML = '🚀 Enviar Prueba';
    }
}
</script>

</body>
</html>
        `);
    });

};

export default setupMetaRoutes;
