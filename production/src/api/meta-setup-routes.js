/**
 * Meta WhatsApp Setup & Testing Module
 * Configuración completa y pruebas de Meta WhatsApp
 */

const setupMetaRoutes = (app) => {

    // Página principal de configuración Meta
    app.get('/meta-setup', (req, res) => {
        const webhookUrl = `https://${req.get('host')}/webhooks/whatsapp`;
        const verifyToken = process.env.META_VERIFY_TOKEN || 'cocolu_webhook_verify_2025_secure_token_meta';

        const config = {
            jwtToken: process.env.META_JWT_TOKEN || '',
            numberId: process.env.META_NUMBER_ID || '',
            businessId: process.env.META_BUSINESS_ACCOUNT_ID || '',
            verifyToken: verifyToken,
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
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
.container { max-width: 1200px; margin: 0 auto; }
.header { background: white; padding: 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
.header h1 { font-size: 28px; color: #111827; margin-bottom: 8px; }
.header p { color: #6b7280; font-size: 14px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 24px; }
.card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.card h2 { font-size: 20px; color: #111827; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.section { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb; }
.section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.info-box { background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 12px 0; }
.info-box label { font-size: 12px; font-weight: 600; color: #667eea; text-transform: uppercase; display: block; margin-bottom: 8px; }
.info-box input { width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: monospace; font-size: 13px; background: white; }
.info-box input:focus { outline: none; border-color: #667eea; }
.copy-btn { background: #667eea; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; margin-top: 8px; transition: all 0.2s; }
.copy-btn:hover { background: #5568d3; transform: translateY(-1px); }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; }
.form-group input, .form-group textarea { width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: all 0.2s; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
.btn { width: 100%; padding: 14px; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary { background: #10b981; color: white; }
.btn-primary:hover { background: #059669; transform: translateY(-1px); }
.btn-secondary { background: #667eea; color: white; margin-top: 12px; }
.btn-secondary:hover { background: #5568d3; }
.status { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.status.ok { background: #dcfce7; color: #166534; }
.status.error { background: #fee2e2; color: #991b1b; }
.steps { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-top: 16px; }
.steps h4 { font-size: 14px; color: #92400e; margin-bottom: 12px; }
.steps ol { margin-left: 20px; color: #78350f; font-size: 13px; line-height: 1.8; }
.test-area { background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 20px; text-align: center; }
.test-input { width: 100%; padding: 12px; border: 2px solid #3b82f6; border-radius: 8px; margin: 12px 0; font-size: 14px; }
.messages-log { background: #f9fafb; border-radius: 8px; padding: 16px; max-height: 300px; overflow-y: auto; font-family: monospace; font-size: 12px; margin-top: 12px; }
.message-item { padding: 8px; margin: 4px 0; border-radius: 4px; }
.message-item.received { background: #dbeafe; border-left: 3px solid #3b82f6; }
.message-item.sent { background: #dcfce7; border-left: 3px solid #10b981; }
@media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1>🌐 Meta WhatsApp - Configuración y Pruebas</h1>
        <p>Configura tus credenciales de Meta y prueba la conexión con WhatsApp Business API</p>
    </div>

    <div class="grid">
        <!-- COLUMNA 1: WEBHOOK INFO -->
        <div>
            <div class="card">
                <h2>📡 Información del Webhook</h2>
                
                <div class="section">
                    <h3 style="font-size: 16px; margin-bottom: 12px;">Webhook URL</h3>
                    <div class="info-box">
                        <label>URL para configurar en Meta Dashboard:</label>
                        <input type="text" id="webhookUrl" value="${webhookUrl}" readonly>
                        <button class="copy-btn" onclick="copyToClipboard('webhookUrl')">📋 Copiar URL</button>
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
                        <button class="copy-btn" onclick="copyToClipboard('verifyToken')">📋 Copiar Token</button>
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
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    <div>
                        <p style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">JWT Token:</p>
                        <span class="status ${config.jwtToken ? 'ok' : 'error'}">${config.jwtToken ? '✓ Configurado' : '✗ Falta'}</span>
                    </div>
                    <div>
                        <p style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Number ID:</p>
                        <span class="status ${config.numberId ? 'ok' : 'error'}">${config.numberId ? '✓ Configurado' : '✗ Falta'}</span>
                    </div>
                    <div>
                        <p style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Business ID:</p>
                        <span class="status ${config.businessId ? 'ok' : 'error'}">${config.businessId ? '✓ Configurado' : '✗ Falta'}</span>
                    </div>
                    <div>
                        <p style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Phone Number:</p>
                        <span class="status ${config.phoneNumber ? 'ok' : 'error'}">${config.phoneNumber ? '✓ Configurado' : '✗ Falta'}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- COLUMNA 2: CONFIGURACIÓN -->
        <div>
            <div class="card">
                <h2>⚙️ Configurar Credenciales Meta</h2>
                <form id="metaConfigForm" onsubmit="saveMetaConfig(event)">
                    <div class="form-group">
                        <label>Meta JWT Token *</label>
                        <textarea rows="3" name="META_JWT_TOKEN" placeholder="EAABsbCS...">${config.jwtToken}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Phone Number ID *</label>
                        <input type="text" name="META_NUMBER_ID" placeholder="123456789012345" value="${config.numberId}">
                    </div>

                    <div class="form-group">
                        <label>Business Account ID *</label>
                        <input type="text" name="META_BUSINESS_ACCOUNT_ID" placeholder="123456789012345" value="${config.businessId}">
                    </div>

                    <div class="form-group">
                        <label>Número de Teléfono WhatsApp</label>
                        <input type="text" name="PHONE_NUMBER" placeholder="+573001234567" value="${config.phoneNumber}">
                    </div>

                    <button type="submit" class="btn btn-primary">💾 Guardar Configuración</button>
                </form>
            </div>

            <!-- PANEL DE PRUEBAS -->
            <div class="card" style="margin-top: 24px;">
                <h2>🧪 Panel de Pruebas</h2>
                <div class="test-area">
                    <p style="font-size: 14px; color: #1e40af; font-weight: 600; margin-bottom: 12px;">
                        Envía un mensaje de prueba
                    </p>
                    <input type="text" class="test-input" id="testPhone" placeholder="Número destino (ej: 573001234567)">
                    <textarea class="test-input" id="testMessage" rows="3" placeholder="Escribe tu mensaje de prueba..."></textarea>
                    <button class="btn btn-secondary" onclick="sendTestMessage()">📤 Enviar Mensaje</button>
                </div>

                <div class="messages-log" id="messagesLog">
                    <p style="text-align: center; color: #9ca3af;">Sin mensajes recientes...</p>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function copyToClipboard(elementId) {
    const input = document.getElementById(elementId);
    input.select();
    document.execCommand('copy');
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copiado!';
    btn.style.background = '#10b981';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '#667eea';
    }, 2000);
}

function saveMetaConfig(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = '💾 Guardando...';
    
    fetch('/api/meta/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            alert('✅ Configuración guardada correctamente!\\n\\nREINICIA EL SERVIDOR para aplicar los cambios.');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            alert('❌ Error: ' + d.error);
        }
    })
    .catch(e => {
        alert('❌ Error al guardar: ' + e.message);
    })
    .finally(() => {
        btn.disabled = false;
        btn.textContent = '💾 Guardar Configuración';
    });
}

function sendTestMessage() {
    const phone = document.getElementById('testPhone').value.trim();
    const message = document.getElementById('testMessage').value.trim();
    
    if (!phone || !message) {
        alert('⚠️ Por favor completa el número y el mensaje');
        return;
    }
    
    addMessageToLog('Enviando a ' + phone + ': ' + message, 'sent');
    
    fetch('/api/meta/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            alert('✅ Mensaje enviado!');
            document.getElementById('testMessage').value = '';
        } else {
            alert('❌ Error: ' + d.error);
            addMessageToLog('Error: ' + d.error, 'received');
        }
    })
    .catch(e => {
        alert('❌ Error: ' + e.message);
    });
}

function addMessageToLog(text, type) {
    const log = document.getElementById('messagesLog');
    if (log.querySelector('p')) log.innerHTML = '';
    
    const item = document.createElement('div');
    item.className = 'message-item ' + type;
    item.textContent = new Date().toLocaleTimeString() + ' - ' + text;
    log.insertBefore(item, log.firstChild);
}

// Auto-refresh messages log
setInterval(() => {
    fetch('/api/meta/recent-messages')
        .then(r => r.json())
        .then(d => {
            if (d.messages && d.messages.length > 0) {
                const log = document.getElementById('messagesLog');
                log.innerHTML = '';
                d.messages.slice(0, 10).forEach(msg => {
                    addMessageToLog(msg.text, msg.type);
                });
            }
        })
        .catch(() => {});
}, 5000);
</script>

</body>
</html>
        `);
    });

    // API: Guardar configuración Meta
    app.post('/api/meta/save-config', (req, res) => {
        try {
            const fs = require('fs');
            const path = require('path');
            const envPath = path.resolve(process.cwd(), '.env');

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

            res.json({ success: true, message: 'Configuración guardada' });
        } catch (error) {
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
