/**
 * Technical Testing Module
 * Advanced testing functionality with detailed request/response display
 */

// Current active test type
let currentTestType = 'simple';

// Test execution state
let testStartTime = 0;

/**
 * Switch between test tabs
 */
function switchTestTab(type) {
    // Update tab buttons
    document.querySelectorAll('.test-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`tab-${type}`).classList.add('active');

    // Update panels
    document.querySelectorAll('.test-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    document.getElementById(`panel-${type}`).style.display = 'block';

    currentTestType = type;
}

/**
 * Switch between request/response viewer tabs
 */
function switchViewer(view) {
    // Update viewer tab buttons
    document.querySelectorAll('.viewer-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`vtab-${view}`).classList.add('active');

    // Update viewer panels
    document.querySelectorAll('.viewer-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    document.getElementById(`viewer-${view}`).style.display = 'block';
}

/**
 * Copy code to clipboard
 */
function copyCode(type) {
    const codeBlock = document.getElementById(`code-${type}`);
    const code = codeBlock.textContent;

    navigator.clipboard.writeText(code).then(() => {
        showToast('success', 'Copiado', 'Código copiado al portapapeles');
    }).catch(err => {
        showToast('error', 'Error', 'No se pudo copiar el código');
    });
}

/**
 * Format JSON with syntax highlighting
 */
function formatJSON(obj) {
    const json = JSON.stringify(obj, null, 2);
    return json
        .replace(/"([^"]+)":/g, '<span class="key">"$1":</span>')
        .replace(/: "([^"]*)"/g, ': <span class="string">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="number">$1</span>')
        .replace(/: (true|false)/g, ': <span class="boolean">$1</span>')
        .replace(/: null/g, ': <span class="null">null</span>');
}

/**
 * Display request/response in viewer
 */
function displayRequestResponse(request, response, headers, duration) {
    const viewer = document.getElementById('rrViewer');
    viewer.style.display = 'block';

    // Display request
    document.getElementById('reqMethod').textContent = request.method;
    document.getElementById('reqUrl').textContent = request.url;
    document.getElementById('reqBody').innerHTML = formatJSON(request.body);

    // Display response
    const statusElement = document.getElementById('resStatus');
    statusElement.textContent = `${response.status} ${response.statusText}`;
    statusElement.className = 'viewer-status ' + (response.ok ? 'success' : 'error');

    document.getElementById('resTime').textContent = `${duration}ms`;
    document.getElementById('resBody').innerHTML = formatJSON(response.data);

    // Display headers
    const headersHTML = Object.entries(headers)
        .map(([key, value]) => `<span class="key">${key}:</span> <span class="string">${value}</span>`)
        .join('\n');
    document.getElementById('headersContent').innerHTML = headersHTML;

    // Switch to response tab
    switchViewer('response');
}

/**
 * Run test based on type
 */
async function runTest(type) {
    testStartTime = Date.now();

    const button = document.getElementById('testButton');
    const buttonText = document.getElementById('testButtonText');

    // Disable button and show loading
    button.disabled = true;
    buttonText.innerHTML = '<div class="spinner"></div> Ejecutando...';

    try {
        let payload, url, method;

        switch (type) {
            case 'simple':
                payload = {
                    to: document.getElementById('testPhone').value,
                    message: document.getElementById('testMessage').value
                };
                url = '/api/meta/test-message';
                method = 'POST';
                break;

            case 'template':
                payload = {
                    messaging_product: "whatsapp",
                    to: document.getElementById('testPhoneTemplate').value,
                    type: "template",
                    template: {
                        name: document.getElementById('templateName').value || "hello_world",
                        language: { code: "en_US" }
                    }
                };
                url = '/api/meta/send-template';
                method = 'POST';
                break;

            case 'media':
                payload = {
                    messaging_product: "whatsapp",
                    to: document.getElementById('testPhoneMedia').value,
                    type: "image",
                    image: {
                        link: document.getElementById('mediaUrl').value
                    }
                };
                url = '/api/meta/send-media';
                method = 'POST';
                break;

            case 'interactive':
                payload = {
                    messaging_product: "whatsapp",
                    to: document.getElementById('testPhoneInteractive').value,
                    type: "interactive",
                    interactive: {
                        type: "button",
                        body: { text: "¿Deseas continuar?" },
                        action: {
                            buttons: [{
                                type: "reply",
                                reply: {
                                    id: "btn_1",
                                    title: document.getElementById('buttonText').value || "Aceptar"
                                }
                            }]
                        }
                    }
                };
                url = '/api/meta/send-interactive';
                method = 'POST';
                break;
        }

        // Make request
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const duration = Date.now() - testStartTime;
        const data = await response.json();

        // Display request/response
        displayRequestResponse(
            {
                method: method,
                url: url,
                body: payload
            },
            {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                data: data
            },
            {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Cocolu Dashboard/1.0'
            },
            duration
        );

        // Show toast
        if (response.ok && data.success) {
            showToast('success', 'Test Exitoso', `Mensaje enviado correctamente en ${duration}ms`);
        } else {
            showToast('error', 'Test Fallido', data.error || 'Error al enviar mensaje');
        }

    } catch (error) {
        const duration = Date.now() - testStartTime;

        showToast('error', 'Error de Conexión', error.message);

        // Display error in viewer
        displayRequestResponse(
            {
                method: method || 'POST',
                url: url || '/api/meta/test-message',
                body: payload || {}
            },
            {
                status: 0,
                statusText: 'Network Error',
                ok: false,
                data: {
                    error: error.message,
                    stack: error.stack
                }
            },
            {},
            duration
        );
    } finally {
        button.disabled = false;
        buttonText.innerHTML = '🚀 Ejecutar Test';
    }
}
