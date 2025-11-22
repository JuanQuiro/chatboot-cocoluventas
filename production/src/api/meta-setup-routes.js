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
                    <div class="status-indicator ${config.jwtToken ? 'configured' : 'missing'}">
                        ${config.jwtToken ? '✓' : '✗'}
                    </div>
                </div>

                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">Number ID</div>
                        <div class="config-item-value">${config.numberId || 'No configurado'}</div>
                    </div>
                    <div class="status-indicator ${config.numberId ? 'configured' : 'missing'}">
                        ${config.numberId ? '✓' : '✗'}
                    </div>
                </div>

                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">Business Account ID</div>
                        <div class="config-item-value">${config.businessId || 'No configurado'}</div>
                    </div>
                    <div class="status-indicator ${config.businessId ? 'configured' : 'missing'}">
                        ${config.businessId ? '✓' : '✗'}
                    </div>
                </div>

                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">API Version</div>
                        <div class="config-item-value">${config.apiVersion}</div>
                    </div>
                    <div class="status-indicator configured">✓</div>
                </div>

                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">Phone Number (Testing)</div>
                        <div class="config-item-value">${config.phoneNumber || 'No configurado'}</div>
                    </div>
                    <div class="status-indicator ${config.phoneNumber ? 'configured' : 'missing'}">
                        ${config.phoneNumber ? '✓' : '✗'}
                    </div>
                </div>
            </div>

            <div style="margin-top: var(--space-6); padding: var(--space-4); background: var(--info-50); border-left: 4px solid var(--info-600); border-radius: var(--radius-lg);">
                <div style="display: flex; align-items: center; gap: var(--space-3);">
                    <span style="font-size: var(--text-2xl);">⚙️</span>
                    <div style="flex: 1;">
                        <div style="font-weight: var(--font-semibold); color: var(--info-900); margin-bottom: var(--space-1);">¿Necesitas actualizar las credenciales?</div>
                        <div style="font-size: var(--text-sm); color: var(--info-800);">Puedes gestionar todas las credenciales desde la configuración del sistema</div>
                    </div>
                    <a href="/settings" class="btn btn-primary" style="white-space: nowrap;">
                        Ir a Configuración
                    </a>
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
