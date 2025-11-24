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
<style>
/* CSS Variables */
:root {
    /* Colors */
    --primary-50: #eef2ff;
    --primary-600: #4f46e5;
    --primary-700: #4338ca;
    --secondary-600: #7c3aed;
    --success-50: #f0fdf4;
    --success-400: #4ade80;
    --success-600: #16a34a;
    --success-700: #15803d;
    --error-50: #fef2f2;
    --error-600: #dc2626;
    --error-700: #b91c1c;
    --warning-50: #fffbeb;
    --warning-100: #fef3c7;
    --warning-600: #d97706;
    --warning-900: #78350f;
    --gray-50: #f9fafb;
    --gray-200: #e5e7eb;
    --gray-600: #4b5563;
    --gray-900: #111827;
    
    /* Spacing */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    
    /* Typography */
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;
    --font-semibold: 600;
    --font-bold: 700;
    --font-mono: 'Courier New', monospace;
    
    /* Borders */
    --radius-sm: 0.125rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-2xl: 1rem;
    --radius-full: 9999px;
    
    /* Shadows */
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    
    /* Z-index */
    --z-tooltip: 1000;
    --z-modal: 2000;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    background: linear-gradient(135deg, var(--primary-600) 0%, var(--secondary-600) 100%);
    min-height: 100vh;
    padding: var(--space-6);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
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

/* Button Styles */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    border-radius: var(--radius-lg);
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    line-height: 1.5;
}

.btn:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.btn:active {
    transform: translateY(0);
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
    color: white;
}

.btn-primary:hover {
    background: linear-gradient(135deg, var(--primary-700), var(--primary-600));
}

.btn-secondary {
    background: var(--secondary-600);
    color: white;
}

.btn-secondary:hover {
    background: var(--secondary-700);
}

.btn-sm {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-xs);
}

/* Form Input Styles */
.form-input {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-sm);
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-lg);
    background: white;
    transition: all 0.2s ease;
    font-family: inherit;
}

.form-input:focus {
    outline: none;
    border-color: var(--primary-600);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-input::placeholder {
    color: var(--gray-400);
}

/* Edit Button Styles */
.config-item button {
    padding: var(--space-2) var(--space-3);
    background: var(--secondary-600);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    cursor: pointer;
    transition: all 0.2s ease;
}

.config-item button:hover {
    background: var(--secondary-700);
    transform: scale(1.05);
}

/* Test Tabs */
.test-tabs {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
    border-bottom: 2px solid var(--gray-200);
}

.test-tab {
    padding: var(--space-3) var(--space-6);
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--gray-600);
    cursor: pointer;
    transition: all 0.2s ease;
}

.test-tab:hover {
    color: var(--primary-600);
    background: var(--gray-50);
}

.test-tab.active {
    color: var(--primary-600);
    border-bottom-color: var(--primary-600);
}

/* Viewer Tabs */
.viewer-tabs {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
}

.viewer-tab {
    padding: var(--space-2) var(--space-4);
    background: var(--gray-100);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: var(--gray-600);
    cursor: pointer;
    transition: all 0.2s ease;
}

.viewer-tab:hover {
    background: var(--gray-200);
}

.viewer-tab.active {
    background: var(--primary-600);
    color: white;
}

/* Test Content Sections */
.test-content {
    display: none;
}

.test-content.active {
    display: block;
}

.viewer-content {
    display: none;
}

.viewer-content.active {
    display: block;
}

/* Code Display */
.code-display {
    background: var(--gray-900);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    overflow-x: auto;
}

.code-display pre {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--success-400);
    line-height: 1.6;
}

/* Form Group */
.form-group {
    margin-bottom: var(--space-4);
}

.form-label {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--gray-900);
    margin-bottom: var(--space-2);
}

/* Alert Box */
.alert {
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-4);
    border-left: 4px solid;
}

.alert-info {
    background: var(--primary-50);
    border-left-color: var(--primary-600);
    color: var(--primary-900);
}

.alert-warning {
    background: var(--warning-50);
    border-left-color: var(--warning-600);
    color: var(--warning-900);
}

/* Container */
.container {
    max-width: 1400px;
    margin: 0 auto;
}

/* Utility Classes */
.hidden {
    display: none !important;
}

.text-center {
    text-align: center;
}

.mt-4 {
    margin-top: var(--space-4);
}

.mb-4 {
    margin-bottom: var(--space-4);
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
                    <button class="copy-button" onclick="openEditModal('META_VERIFY_TOKEN', 'Token de Verificación', '')" style="background: var(--secondary-600); margin-left: 8px;">
                        ✏️ Editar
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
                    <button class="btn btn-sm btn-secondary" onclick="openEditModal('META_JWT_TOKEN', 'JWT Token', '')">
                        ✏️ Editar
                    </button>
                </div>

                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">Number ID</div>
                        <div class="config-item-value">${config.numberId || 'No configurado'}</div>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="openEditModal('META_NUMBER_ID', 'Number ID', '')">
                        ✏️ Editar
                    </button>
                </div>

                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">Business Account ID</div>
                        <div class="config-item-value">${config.businessId || 'No configurado'}</div>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="openEditModal('META_BUSINESS_ACCOUNT_ID', 'Business Account ID', '')">
                        ✏️ Editar
                    </button>
                </div>

                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">API Version</div>
                        <div class="config-item-value">${config.apiVersion}</div>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="openEditModal('META_API_VERSION', 'API Version', '')">
                        ✏️ Editar
                    </button>
                </div>

                <div class="config-item">
                    <div class="config-item-info">
                        <div class="config-item-label">Phone Number (Testing)</div>
                        <div class="config-item-value">${config.phoneNumber || 'No configurado'}</div>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="openEditModal('PHONE_NUMBER', 'Phone Number', '')">
                        ✏️ Editar
                    </button>
                </div>
            </div>
        </div>

        <!-- Advanced Technical Testing Section -->
        <div class="test-section">
            <div class="section-header">
                <div class="section-icon">🧪</div>
                <div class="section-title">
                    <h2>Testing & Debugging Técnico</h2>
                    <p>Pruebas avanzadas con detalles completos de request/response y código ejecutado</p>
                </div>
            </div>

            <!-- Test Type Tabs -->
            <div class="test-tabs">
                <button class="test-tab active" onclick="switchTestTab('simple')" id="tab-simple">
                    📤 Mensaje Simple
                </button>
                <button class="test-tab" onclick="switchTestTab('template')" id="tab-template">
                    📋 Template Message
                </button>
                <button class="test-tab" onclick="switchTestTab('media')" id="tab-media">
                    🖼️ Media Message
                </button>
                <button class="test-tab" onclick="switchTestTab('interactive')" id="tab-interactive">
                    🔘 Interactive Button
                </button>
            </div>

            <!-- Simple Message Test -->
            <div class="test-panel" id="panel-simple">
                <div class="test-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Número de destino</label>
                            <input type="tel" class="form-input" id="testPhone" placeholder="+1234567890" value="">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Mensaje</label>
                            <input type="text" class="form-input" id="testMessage" placeholder="Mensaje de prueba" value="Ping desde dashboard">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="opacity: 0;">Action</label>
                            <button class="btn btn-primary" onclick="runTest('simple')" id="testButton">
                                <span id="testButtonText">🚀 Ejecutar Test</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Code Display -->
                <div class="code-display">
                    <div class="code-header">
                        <span>📝 Código que se ejecutará:</span>
                        <button class="btn btn-sm btn-secondary" onclick="copyCode('simple')">📋 Copiar</button>
                    </div>
                    <pre class="code-block" id="code-simple"><code class="language-javascript">// POST /api/meta/test-message
const payload = {
  to: "+1234567890",
  message: "Ping desde dashboard"
};

const response = await fetch('/api/meta/test-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});</code></pre>
                </div>
            </div>

            <!-- Template Message Test -->
            <div class="test-panel" id="panel-template" style="display: none;">
                <div class="test-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Número de destino</label>
                            <input type="tel" class="form-input" id="testPhoneTemplate" placeholder="+1234567890" value="">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Template Name</label>
                            <input type="text" class="form-input" id="templateName" placeholder="hello_world">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="opacity: 0;">Action</label>
                            <button class="btn btn-primary" onclick="runTest('template')">
                                🚀 Ejecutar Test
                            </button>
                        </div>
                    </div>
                </div>

                <div class="code-display">
                    <div class="code-header">
                        <span>📝 Código que se ejecutará:</span>
                        <button class="btn btn-sm btn-secondary" onclick="copyCode('template')">📋 Copiar</button>
                    </div>
                    <pre class="code-block" id="code-template"><code class="language-javascript">// Simple Text Message via Meta API
const payload = {
  messaging_product: "whatsapp",
  to: "+1234567890",
  type: "text",
  text: { body: "Ping desde dashboard" }
};</code></pre>
                </div>
            </div>

            <!-- Media Message Test -->
            <div class="test-panel" id="panel-media" style="display: none;">
                <div class="test-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Número de destino</label>
                            <input type="tel" class="form-input" id="testPhoneMedia" placeholder="+1234567890" value="">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Media URL</label>
                            <input type="url" class="form-input" id="mediaUrl" placeholder="https://example.com/image.jpg">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="opacity: 0;">Action</label>
                            <button class="btn btn-primary" onclick="runTest('media')">
                                🚀 Ejecutar Test
                            </button>
                        </div>
                    </div>
                </div>

                <div class="code-display">
                    <div class="code-header">
                        <span>📝 Código que se ejecutará:</span>
                        <button class="btn btn-sm btn-secondary" onclick="copyCode('media')">📋 Copiar</button>
                    </div>
                    <pre class="code-block" id="code-media"><code class="language-javascript">// Media Message via Meta API
const payload = {
  messaging_product: "whatsapp",
  to: "+1234567890",
  type: "image",
  image: {
    link: "https://example.com/image.jpg"
  }
};</code></pre>
                </div>
            </div>

            <!-- Interactive Button Test -->
            <div class="test-panel" id="panel-interactive" style="display: none;">
                <div class="test-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Número de destino</label>
                            <input type="tel" class="form-input" id="testPhoneInteractive" placeholder="+1234567890" value="">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Texto del botón</label>
                            <input type="text" class="form-input" id="buttonText" placeholder="Confirmar" value="Aceptar">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="opacity: 0;">Action</label>
                            <button class="btn btn-primary" onclick="runTest('interactive')">
                                🚀 Ejecutar Test
                            </button>
                        </div>
                    </div>
                </div>

                <div class="code-display">
                    <div class="code-header">
                        <span>📝 Código que se ejecutará:</span>
                        <button class="btn btn-sm btn-secondary" onclick="copyCode('interactive')">📋 Copiar</button>
                    </div>
                    <pre class="code-block" id="code-interactive"><code class="language-javascript">// Interactive Button via Meta API
const payload = {
  messaging_product: "whatsapp",
  to: "+1234567890",
  type: "interactive",
  interactive: {
    type: "button",
    body: { text: "¿Deseas continuar?" },
    action: {
      buttons: [{ type: "reply", reply: { id: "btn_1", title: "Aceptar" } }]
    }
  }
};</code></pre>
                </div>
            </div>

            <!-- Request/Response Viewer -->
            <div class="request-response-viewer" id="rrViewer" style="display: none;">
                <div class="viewer-tabs">
                    <button class="viewer-tab active" onclick="switchViewer('request')" id="vtab-request">
                        📤 Request
                    </button>
                    <button class="viewer-tab" onclick="switchViewer('response')" id="vtab-response">
                        📥 Response
                    </button>
                    <button class="viewer-tab" onclick="switchViewer('headers')" id="vtab-headers">
                        📋 Headers
                    </button>
                </div>

                <div class="viewer-content">
                    <div class="viewer-panel active" id="viewer-request">
                        <div class="viewer-header">
                            <span class="viewer-method" id="reqMethod">POST</span>
                            <span class="viewer-url" id="reqUrl">/api/meta/test-message</span>
                            <span class="viewer-status" id="reqStatus"></span>
                        </div>
                        <pre class="viewer-code" id="reqBody"></pre>
                    </div>

                    <div class="viewer-panel" id="viewer-response" style="display: none;">
                        <div class="viewer-header">
                            <span class="viewer-label">Status:</span>
                            <span class="viewer-status" id="resStatus"></span>
                            <span class="viewer-label">Time:</span>
                            <span class="viewer-time" id="resTime"></span>
                        </div>
                        <pre class="viewer-code" id="resBody"></pre>
                    </div>

                    <div class="viewer-panel" id="viewer-headers" style="display: none;">
                        <pre class="viewer-code" id="headersContent"></pre>
                    </div>
                </div>
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
        'META_VERIFY_TOKEN': 'Token secreto para verificar tu webhook con Meta. Usa un valor único y seguro (mínimo 20 caracteres).',
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

// Switch between test tabs
function switchTestTab(tabName) {
    // Hide all panels
    const panels = ['simple', 'template', 'media', 'interactive'];
    panels.forEach(panel => {
        const panelEl = document.getElementById(`panel - ${ panel }`);
        const tabEl = document.getElementById(`tab - ${ panel }`);
        if (panelEl) panelEl.style.display = 'none';
        if (tabEl) tabEl.classList.remove('active');
    });
    
    // Show selected panel
    const selectedPanel = document.getElementById(`panel - ${ tabName }`);
    const selectedTab = document.getElementById(`tab - ${ tabName }`);
    if (selectedPanel) selectedPanel.style.display = 'block';
    if (selectedTab) selectedTab.classList.add('active');
}

// Run test based on type
async function runTest(type) {
    let phone, payload, endpoint;
    
    // Get form values based on test type
    switch(type) {
        case 'simple':
            phone = document.getElementById('testPhone').value;
            const message = document.getElementById('testMessage').value;
            if (!phone || !message) {
                showToast('error', 'Error', 'Completa todos los campos');
                return;
            }
            payload = {
                messaging_product: "whatsapp",
                to: phone,
                type: "text",
                text: { body: message }
            };
            endpoint = '/api/meta/test-message';
            break;
            
        case 'template':
            phone = document.getElementById('testPhoneTemplate').value;
            const templateName = document.getElementById('templateName').value;
            if (!phone || !templateName) {
                showToast('error', 'Error', 'Completa todos los campos');
                return;
            }
            payload = {
                messaging_product: "whatsapp",
                to: phone,
                type: "template",
                template: {
                    name: templateName,
                    language: { code: "en_US" }
                }
            };
            endpoint = '/api/meta/test-message';
            break;
            
        case 'media':
            phone = document.getElementById('testPhoneMedia').value;
            const mediaUrl = document.getElementById('mediaUrl').value;
            if (!phone || !mediaUrl) {
                showToast('error', 'Error', 'Completa todos los campos');
                return;
            }
            payload = {
                messaging_product: "whatsapp",
                to: phone,
                type: "image",
                image: { link: mediaUrl }
            };
            endpoint = '/api/meta/test-message';
            break;
            
        case 'interactive':
            phone = document.getElementById('testPhoneInteractive').value;
            const buttonText = document.getElementById('buttonText').value;
            if (!phone || !buttonText) {
                showToast('error', 'Error', 'Completa todos los campos');
                return;
            }
            payload = {
                messaging_product: "whatsapp",
                to: phone,
                type: "interactive",
                interactive: {
                    type: "button",
                    body: { text: "¿Deseas continuar?" },
                    action: {
                        buttons: [{ type: "reply", reply: { id: "btn_1", title: buttonText } }]
                    }
                }
            };
            endpoint = '/api/meta/test-message';
            break;
            
        default:
            showToast('error', 'Error', 'Tipo de test no reconocido');
            return;
    }
    
    // Show viewer and set loading state
    const viewer = document.getElementById('rrViewer');
    viewer.style.display = 'block';
    
    const requestViewer = document.getElementById('viewer-request');
    const responseViewer = document.getElementById('viewer-response');
    const headersViewer = document.getElementById('viewer-headers');
    
    // Show request
    requestViewer.textContent = JSON.stringify(payload, null, 2);
    responseViewer.textContent = 'Esperando respuesta...';
    headersViewer.textContent = 'Enviando request...';
    
    // Switch to request tab
    switchViewer('request');
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        // Show response
        responseViewer.textContent = JSON.stringify(data, null, 2);
        
        // Show headers
        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });
        headersViewer.textContent = JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            headers: headers
        }, null, 2);
        
        // Switch to response tab
        switchViewer('response');
        
        if (response.ok && data.success) {
            showToast('success', 'Éxito', 'Test ejecutado correctamente');
        } else {
            showToast('error', 'Error', data.error || 'Error en la ejecución');
        }
    } catch (error) {
        responseViewer.textContent = 'Error: ' + error.message;
        headersViewer.textContent = 'Error de conexión';
        showToast('error', 'Error de conexión', 'No se pudo conectar con el servidor');
    }
}

// Switch between request/response/headers viewers
function switchViewer(viewerType) {
    // Hide all viewer contents
    const viewers = ['request', 'response', 'headers'];
    viewers.forEach(v => {
        const contentEl = document.getElementById(`viewer - ${ v }`);
        const tabEl = document.getElementById(`vtab - ${ v }`);
        if (contentEl) contentEl.style.display = 'none';
        if (tabEl) tabEl.classList.remove('active');
    });
    
    // Show selected viewer
    const selectedContent = document.getElementById(`viewer - ${ viewerType }`);
    const selectedTab = document.getElementById(`vtab - ${ viewerType }`);
    if (selectedContent) selectedContent.style.display = 'block';
    if (selectedTab) selectedTab.classList.add('active');
}

// Copy code to clipboard
function copyCode(type) {
    const codeEl = document.getElementById(`code - ${ type }`);
    if (!codeEl) return;
    
    const code = codeEl.textContent;
    const textArea = document.createElement('textarea');
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    showToast('success', 'Copiado', 'Código copiado al portapapeles');
}
</script>

</body>
</html>
        `);
    });

};

export default setupMetaRoutes;
