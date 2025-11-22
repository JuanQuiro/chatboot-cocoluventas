/**
 * Rutas del Dashboard y Login
 */

export const setupDashboardRoutes = (app) => {
  console.log('✅ Dashboard routes cargadas');
  // COMENTADO: Esta ruta estática interceptaba el login del React app
  // Ahora el React Router maneja /login correctamente
  /*
  app.get('/login', (req, res) => {
    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cocolu Chatbot - Login</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .login-container { background: white; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; width: 100%; max-width: 400px; }
    .login-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .login-header h1 { font-size: 32px; margin-bottom: 10px; }
    .login-header p { font-size: 14px; opacity: 0.9; }
    .login-body { padding: 40px 30px; }
    .form-group { margin-bottom: 20px; }
    .form-label { display: block; font-size: 14px; color: #333; margin-bottom: 8px; font-weight: 600; }
    .form-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; transition: all 0.3s; }
    .form-input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
    .btn-login { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; margin-top: 10px; }
    .btn-login:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
    .error { color: #dc2626; font-size: 13px; margin-top: 5px; display: none; }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="login-header">
      <h1>🤖 Cocolu</h1>
      <p>Chatbot Management Platform</p>
    </div>
    <div class="login-body">
      <form onsubmit="handleLogin(event)">
        <div class="form-group">
          <label class="form-label">👤 Usuario</label>
          <input type="text" id="username" class="form-input" placeholder="admin" value="admin" required />
        </div>
        <div class="form-group">
          <label class="form-label">🔐 Contraseña</label>
          <input type="password" id="password" class="form-input" placeholder="••••••••" value="admin123" required />
          <div class="error" id="error"></div>
        </div>
        <button type="submit" class="btn-login">Iniciar Sesión</button>
      </form>
    </div>
  </div>

  <script>
    async function handleLogin(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorElement = document.getElementById('error');
      errorElement.style.display = 'none'; // Ocultar errores previos

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) { // Si la respuesta HTTP es exitosa (código 2xx)
          localStorage.setItem('cocolu_token', data.token); // Asumiendo que el backend devuelve { token: '...' }
          localStorage.setItem('cocolu_user', username); // O data.user si el backend lo devuelve
          window.location.href = '/dashboard';
        } else {
          // Manejar errores de la API (ej. 401 Unauthorized)
          errorElement.textContent = data.message || 'Error de autenticación'; // Asumiendo que el backend devuelve { message: '...' }
          errorElement.style.display = 'block';
        }
      } catch (error) {
        // Manejar errores de red u otras excepciones
        console.error('Login error:', error);
        errorElement.textContent = 'Error de conexión. Inténtalo de nuevo.';
        errorElement.style.display = 'block';
      }
    }
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });
  */


  // Redirect /meta-settings → /meta-setup (nueva UI premium)
  app.get('/meta-settings', (req, res) => {
    res.redirect(301, '/meta-setup');
  });


  // Página de DIAGNÓSTICO META
  app.get('/meta-diagnostics', (req, res) => {
    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Diagnóstico Meta - Cocolu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 30px; }
    .back-btn { display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .card ol { margin-left: 18px; margin-top: 10px; color: #374151; line-height: 1.5; }
    .status-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .status-ok { color: #059669; }
    .status-bad { color: #dc2626; }
    .log-box { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #111827; color: #10b981; padding: 12px; border-radius: 8px; min-height: 200px; overflow-y: auto; font-size: 12px; }
    pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #f3f4f6; padding: 12px; border-radius: 8px; font-size: 12px; white-space: pre-wrap; word-break: break-word; }
    .request-info h3 { margin-top: 16px; margin-bottom: 8px; font-size: 15px; }
    button { padding: 10px 18px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; background: #4f46e5; color: white; }
    input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #d1d5db; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧪 Diagnóstico Meta</h1>
  </div>
  <div class="container">
    <a href="/dashboard" class="back-btn">← Volver</a>
    <div class="grid">
      <div class="card">
        <h2>Checklist</h2>
        <div id="checklist"></div>
      </div>
      <div class="card">
        <h2>Enviar ping</h2>
        <p style="font-size:14px;color:#6b7280;margin-top:6px;">Envía un mensaje de prueba usando el mismo endpoint oficial de Meta.</p>
        <input id="testNumber" placeholder="Destino (por defecto: PHONE_NUMBER)" />
        <input id="testMessage" placeholder="Mensaje" value="Ping de prueba desde dashboard" />
        <button onclick="runTest()" style="margin-top:12px;">Enviar prueba</button>
        <div id="testStatus" style="margin-top:12px;font-size:13px;"></div>
        <pre id="testResult">Sin pruebas aún.</pre>
        <div class="request-info">
          <h3>Petición realizada</h3>
          <pre id="requestDetails">Aún no se ha enviado ninguna prueba.</pre>
          <h3>cURL para terminal</h3>
          <pre id="curlPreview">Pendiente de primera prueba.</pre>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:20px;">
      <h2>Instrucciones rápidas</h2>
      <ol>
        <li><strong>Actualiza credenciales</strong> en <em>Config Meta</em> con el token/Phone Number ID que te dé Meta.</li>
        <li><strong>Reinicia</strong> el backend con <code>./START.sh</code> para que el bot cargue las variables nuevas.</li>
        <li><strong>Usa "Enviar ping"</strong> para validar el endpoint oficial y revisa los errores abajo si algo falla.</li>
      </ol>
      <p style="color:#6b7280;font-size:13px;">Si el ping es exitoso, envía un WhatsApp al número configurado y monitorea el módulo <em>Mensajes</em>.</p>
    </div>

    <div class="card" style="margin-top:20px;">
      <h2>Logs recientes</h2>
      <div class="log-box" id="logBox">Cargando...</div>
    </div>

    <div class="card" style="margin-top:20px;">
      <h2>Webhooks Meta</h2>
      <p style="color:#4b5563;font-size:14px;margin-bottom:10px;">Usa estos valores en el panel de Meta (Configuración de Webhooks → Verify token):</p>
      <ul style="color:#1f2937;font-size:14px;line-height:1.6;margin-left:18px;">
        <li><strong>URL de verificación:</strong> <code>https://TU_DOMINIO/webhooks/whatsapp</code> (en local puedes usar ngrok → <code>https://TU-NGROK/webhooks/whatsapp</code>).</li>
        <li><strong>Verify Token:</strong> <code id="verifyTokenValue">cocolu_webhook_verify_2025_secure_token_meta</code></li>
        <li><strong>Evento a suscribir:</strong> <em>messages</em>.</li>
      </ul>
      <p style="color:#6b7280;font-size:13px;">Después de configurarlo, Meta enviará la verificación a <code>/webhooks/whatsapp</code> (ya implementado en este servidor).</p>
    </div>
  </div>
  <script>
    if (!localStorage.getItem('cocolu_token')) {
      window.location.href = '/login';
    }

    let metaConfigCache = {};

    async function loadChecklist() {
      const container = document.getElementById('checklist');
      container.innerHTML = 'Cargando...';
      try {
        const res = await fetch('/api/meta/config');
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Error al leer config');
        const config = json.data || {};
        metaConfigCache = config;
        const items = [
          { label: 'JWT Token', ok: !!config.META_JWT_TOKEN },
          { label: 'Number ID', ok: !!config.META_NUMBER_ID },
          { label: 'Verify Token', ok: !!config.META_VERIFY_TOKEN },
          { label: 'API Version', ok: !!config.META_API_VERSION },
          { label: 'Teléfono pruebas', ok: !!config.PHONE_NUMBER }
        ];
        container.innerHTML = items.map(function(item) {
          var statusClass = item.ok ? 'status-ok' : 'status-bad';
          var statusIcon = item.ok ? '✔' : '✖';
          return '<div class="status-row">' +
                   '<span>' + item.label + '</span>' +
                   '<span class="' + statusClass + '">' + statusIcon + '</span>' +
                 '</div>';
        }).join('');
        applyTestDefaults();
        if (config.META_VERIFY_TOKEN) {
          document.getElementById('verifyTokenValue').textContent = config.META_VERIFY_TOKEN;
        }
      } catch (err) {
        container.innerHTML = '<p class="status-bad">' + err.message + '</p>';
      }
    }

    function applyTestDefaults() {
      const testNumber = document.getElementById('testNumber');
      const testMessage = document.getElementById('testMessage');
      const savedTo = localStorage.getItem('meta_test_to');
      const savedMsg = localStorage.getItem('meta_test_message');
      if (!testNumber.value) {
        testNumber.value = savedTo || metaConfigCache.PHONE_NUMBER || '';
      }
      if (!testMessage.value) {
        testMessage.value = savedMsg || 'Ping de prueba desde dashboard';
      }
      if (!savedTo && metaConfigCache.PHONE_NUMBER) {
        testNumber.placeholder = metaConfigCache.PHONE_NUMBER;
      }
    }

    document.getElementById('testNumber').addEventListener('input', function(e) {
      localStorage.setItem('meta_test_to', e.target.value.trim());
    });

    document.getElementById('testMessage').addEventListener('input', function(e) {
      localStorage.setItem('meta_test_message', e.target.value.trim());
    });

    async function loadLogs() {
      try {
        const res = await fetch('/api/open/messages');
        const json = await res.json();
        const logBox = document.getElementById('logBox');
        if (json.success && json.data?.errors?.length) {
          logBox.innerHTML = json.data.errors
            .slice(0, 20)
            .map(function(err) {
              var line = '[' + new Date(err.timestamp).toLocaleString() + '] ' + (err.context || '') + ' -> ' + (err.error || '');
              return line;
            })
            .join('\\n');
        } else {
          logBox.textContent = 'Sin errores recientes.';
        }
      } catch (err) {
        document.getElementById('logBox').textContent = 'Error cargando logs: ' + err.message;
      }
    }

    async function runTest() {
      const to = document.getElementById('testNumber').value.trim();
      const message = document.getElementById('testMessage').value.trim();
      const statusBox = document.getElementById('testStatus');
      const output = document.getElementById('testResult');
      const requestDetails = document.getElementById('requestDetails');
      const curlPreview = document.getElementById('curlPreview');
      setTestStatus('Enviando solicitud a Meta...', '');
      output.textContent = '';
      requestDetails.textContent = 'Preparando petición...';
      curlPreview.textContent = 'Generando cURL...';

      try {
        const version = metaConfigCache.META_API_VERSION || 'v22.0';
        const numberId = metaConfigCache.META_NUMBER_ID;
        const token = metaConfigCache.META_JWT_TOKEN;

        const url = 'https://graph.facebook.com/' + version + '/' + numberId + '/messages';
        const bodyPayload = {
          messaging_product: 'whatsapp',
          to: to || metaConfigCache.PHONE_NUMBER,
          type: 'text',
          text: {
            preview_url: false,
            body: message || 'Ping de prueba desde dashboard'
          }
        };

        updateRequestDetails({ url, token, body: bodyPayload }, requestDetails, curlPreview);

        const res = await fetch('/api/meta/test-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, message })
        });
        const json = await res.json();
        const ok = res.ok && json.success && !json.data?.error;
        const errorMsg = json.data?.error?.message || json.error;
        if (ok) {
          setTestStatus('✅ Meta respondió correctamente (status ' + res.status + ').', 'ok');
        } else {
          setTestStatus('⚠️ Meta respondió con error (status ' + res.status + '). ' + (errorMsg || ''), 'error');
        }
        output.textContent = JSON.stringify(json, null, 2);
      } catch (err) {
        setTestStatus('❌ Error enviando ping: ' + err.message, 'error');
        output.textContent = '';
      }
    }

    loadChecklist();
    loadLogs();

    function setTestStatus(msg, type) {
      const box = document.getElementById('testStatus');
      box.textContent = msg;
      box.style.color = type === 'ok' ? '#059669' : (type === 'error' ? '#dc2626' : '#374151');
    }

    function updateRequestDetails(info, requestEl, curlEl) {
      const tokenPreview = info.token ? info.token : '<token_no_configurado>';
      const details = {
        method: 'POST',
        url: info.url,
        headers: {
          Authorization: 'Bearer ' + tokenPreview,
          'Content-Type': 'application/json'
        },
        body: info.body
      };
      requestEl.textContent = JSON.stringify(details, null, 2);

      const curlBody = JSON.stringify(info.body).replace(/'/g, "\\'");
      const curlLines = [
        'curl -i -X POST \\\\',
        '  "' + info.url + '" \\\\',
        '  -H "Authorization: Bearer ' + tokenPreview + '" \\\\',
        '  -H "Content-Type: application/json" \\\\',
        "  -d '\''" + curlBody + "'\\''"
      ];
      curlEl.textContent = curlLines.join('\\n');
    }
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // Página de DASHBOARD
  app.get('/dashboard', (req, res) => {
    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cocolu - Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f3f4f6; color: #111827; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.15); }
    .header h1 { font-size: 22px; }
    .logout-btn { background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 999px; cursor: pointer; font-size: 13px; }
    .container { display: grid; grid-template-columns: 250px 1fr; min-height: calc(100vh - 60px); transition: grid-template-columns 0.25s ease; }
    .container.sidebar-collapsed { grid-template-columns: 80px 1fr; }
    .sidebar { background: white; border-right: 1px solid #e0e0e0; padding: 20px; transition: padding 0.25s ease; }
    .sidebar h3 { font-size: 11px; color: #9ca3af; text-transform: uppercase; margin-bottom: 12px; margin-top: 18px; }
    .sidebar.collapsed { padding-left: 10px; padding-right: 10px; }
    .sidebar.collapsed h3 { display: none; }
    .nav-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; color: #374151; text-decoration: none; border-radius: 8px; font-size: 14px; transition: all 0.2s; margin-bottom: 4px; border-left: 3px solid transparent; }
    .nav-item:hover { background: #eef2ff; border-left-color: #818cf8; }
    .nav-item.active { background: #eef2ff; border-left-color: #4f46e5; color: #111827; font-weight: 600; }
    .nav-icon { width: 20px; text-align: center; }
    .nav-label { flex: 1; }
    .sidebar.collapsed .nav-label { display: none; }
    .header-left { display: flex; align-items: center; gap: 10px; }
    .menu-toggle { width: 32px; height: 32px; border-radius: 999px; border: none; background: rgba(15,23,42,0.2); color: #e5e7eb; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .menu-toggle:hover { background: rgba(15,23,42,0.35); }
    .main { padding: 28px; }
    .card { background: white; border-radius: 10px; padding: 24px; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(15,23,42,0.06); }
    .modules-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 18px 0 8px; }
    .metric { background: #f9fafb; border-radius: 8px; padding: 10px 12px; font-size: 13px; }
    .metric-label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
    .metric-value { font-size: 16px; font-weight: 600; margin-top: 4px; }
    .module-card { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #ec4899 100%); color: white; padding: 20px; border-radius: 12px; text-decoration: none; transition: all 0.25s; cursor: pointer; text-align: left; display: flex; flex-direction: column; gap: 4px; }
    .module-card:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(79,70,229,0.45); }
    .module-icon { font-size: 26px; }
    .module-title { font-size: 14px; font-weight: 600; }
    .module-sub { font-size: 12px; opacity: .9; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <button class="menu-toggle" onclick="toggleSidebar()" title="Contraer/expandir menú">☰</button>
      <h1>🤖 Cocolu Chatbot</h1>
    </div>
    <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
  </div>

  <div class="container">
    <div class="sidebar">
      <h3>📊 Principal</h3>
      <a href="/dashboard" class="nav-item active">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Dashboard</span>
      </a>
      
      <h3>💬 Chatbot</h3>
      <a href="/messages" class="nav-item">
        <span class="nav-icon">�</span>
        <span class="nav-label">Mensajes</span>
      </a>
      <a href="/analytics" class="nav-item">
        <span class="nav-icon">📊</span>
        <span class="nav-label">Análisis</span>
      </a>
      <a href="/connection" class="nav-item">
        <span class="nav-icon">📲</span>
        <span class="nav-label">Conexión</span>
      </a>
      
      <h3>👥 Vendedores</h3>
      <a href="/sellers" class="nav-item">
        <span class="nav-icon">👥</span>
        <span class="nav-label">Vendedores</span>
      </a>
      <a href="/seller-availability" class="nav-item">
        <span class="nav-icon">⏰</span>
        <span class="nav-label">Disponibilidad</span>
      </a>
      
      <h3>⚙️ Configuración</h3>
      <a href="/adapters" class="nav-item">
        <span class="nav-icon">🔌</span>
        <span class="nav-label">Adaptadores</span>
      </a>
      <a href="/logs" class="nav-item">
        <span class="nav-icon">📝</span>
        <span class="nav-label">Logs</span>
      </a>

      <h3>🌐 Meta</h3>
      <a href="/meta-setup" class="nav-item">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">Config Meta</span>
      </a>
      <a href="/meta-diagnostics" class="nav-item">
        <span class="nav-icon">🧪</span>
        <span class="nav-label">Diagnóstico Meta</span>
      </a>
      
      <h3>📈 Monitoreo</h3>
      <a href="/health" class="nav-item">
        <span class="nav-icon">❤️</span>
        <span class="nav-label">Salud</span>
      </a>
      <a href="/meta-billing" class="nav-item">
        <span class="nav-icon">💰</span>
        <span class="nav-label">Facturación Meta</span>
      </a>
    </div>

    <div class="main">
      <!-- Alerta de Registro Pendiente -->
      <div id="registration-alert" style="display:none; background: #fff3cd; color: #856404; padding: 16px; border-radius: 10px; margin-bottom: 24px; border: 1px solid #ffeeba; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 24px;">⚠️</span>
          <div>
            <h4 style="margin-bottom: 4px; font-size: 16px;">Acción Requerida: Registro de Número</h4>
            <p style="margin: 0; font-size: 14px;">Tu número de WhatsApp no está registrado con Meta. El bot no podrá enviar mensajes hasta que completes este paso.</p>
          </div>
          <a href="/meta-setup#registration-section" style="margin-left: auto; background: #856404; color: white; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px;">Registrar Ahora →</a>
        </div>
      </div>
      <div class="card">
        <h2>Bienvenido al Dashboard</h2>
        <p style="color: #666; margin: 15px 0;">Gestiona tu chatbot desde aquí.</p>

        <h3 style="margin-top: 15px; margin-bottom: 8px; font-size: 15px;">📊 Resumen rápido</h3>
        <div class="metrics-grid">
          <div class="metric">
            <div class="metric-label">Mensajes totales</div>
            <div class="metric-value" id="dTotalMessages">0</div>
          </div>
          <div class="metric">
            <div class="metric-label">Usuarios únicos</div>
            <div class="metric-value" id="dUniqueUsers">0</div>
          </div>
          <div class="metric">
            <div class="metric-label">Conversaciones activas</div>
            <div class="metric-value" id="dActiveConversations">0</div>
          </div>
          <div class="metric">
            <div class="metric-label">Vendedores activos</div>
            <div class="metric-value" id="dActiveSellers">0</div>
          </div>
        </div>

        <h3 style="margin-top: 25px; margin-bottom: 15px; font-size: 16px;">📦 Módulos</h3>
        <div class="modules-grid">
          <a href="/messages" class="module-card">
            <div class="module-icon">💬</div>
            <div class="module-title">Mensajes</div>
          </a>
          <a href="/analytics" class="module-card">
            <div class="module-icon">📊</div>
            <div class="module-title">Análisis</div>
          </a>
          <a href="/connection" class="module-card">
            <div class="module-icon">📲</div>
            <div class="module-title">Conexión</div>
          </a>
          <a href="/adapters" class="module-card">
            <div class="module-icon">🔌</div>
            <div class="module-title">Adaptadores</div>
          </a>
          <a href="/logs" class="module-card">
            <div class="module-icon">📝</div>
            <div class="module-title">Logs</div>
          </a>
          <a href="/health" class="module-card">
            <div class="module-icon">❤️</div>
            <div class="module-title">Salud</div>
          </a>
        </div>
      </div>
    </div>
  </div>

  <script>
    if (!localStorage.getItem('cocolu_token')) {
      window.location.href = '/login';
    }
    
    function logout() {
      localStorage.removeItem('cocolu_token');
      localStorage.removeItem('cocolu_user');
      window.location.href = '/login';
    }

    function toggleSidebar() {
      try {
        var container = document.querySelector('.container');
        var sidebar = document.querySelector('.sidebar');
        if (!container || !sidebar) return;
        var collapsed = sidebar.classList.toggle('collapsed');
        if (collapsed) {
          container.classList.add('sidebar-collapsed');
          localStorage.setItem('cocolu_sidebar_collapsed', '1');
        } else {
          container.classList.remove('sidebar-collapsed');
          localStorage.removeItem('cocolu_sidebar_collapsed');
        }
      } catch (e) {}
    }

    (function restoreSidebarState() {
      try {
        if (localStorage.getItem('cocolu_sidebar_collapsed') === '1') {
          var container = document.querySelector('.container');
          var sidebar = document.querySelector('.sidebar');
          if (container && sidebar) {
            container.classList.add('sidebar-collapsed');
            sidebar.classList.add('collapsed');
          }
        }
      } catch (e) {}
    })();

    async function loadDashboardSummary() {
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        const data = json.data || {};
        const analytics = data.analytics || {};
        const sellers = data.sellers || {};

        document.getElementById('dTotalMessages').textContent = analytics.totalMessages || 0;
        document.getElementById('dUniqueUsers').textContent = analytics.uniqueUsers || 0;
        document.getElementById('dActiveConversations').textContent = analytics.activeConversations || 0;
        document.getElementById('dActiveSellers').textContent = sellers.activeSellers || 0;
      } catch (e) {
        console.error('Error cargando resumen de dashboard', e);
      }
    }

    loadDashboardSummary();
    setInterval(loadDashboardSummary, 10000);
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // Página de MENSAJES
  app.get('/messages', (req, res) => {
    console.log('📨 GET /messages recibido');
    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mensajes - Cocolu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
    .container { max-width: 1300px; margin: 0 auto; padding: 30px; }
    .back-btn { display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px; }
    .stat-card { background: white; border-radius: 10px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; }
    .stat-value { font-size: 22px; font-weight: 600; margin-top: 6px; color: #111827; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px; }
    .card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    h2 { margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .list { max-height: 400px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; text-align: left; }
    th { background: #f9fafb; font-weight: 600; font-size: 12px; color: #6b7280; position: sticky; top: 0; z-index: 1; }
    .pill { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px; font-size: 11px; background: #e0f2fe; color: #0369a1; }
    .pill[data-type="in"] { background: #dcfce7; color: #15803d; }
    .pill[data-type="out"] { background: #dbeafe; color: #1d4ed8; }
    .pill[data-type="error"] { background: #fee2e2; color: #b91c1c; }
    .error { color: #b91c1c; font-size: 12px; }
    .raw-view { margin-top: 15px; }
    .raw-actions { display: flex; gap: 10px; margin-bottom: 10px; }
    textarea { width: 100%; min-height: 200px; border-radius: 8px; border: 1px solid #d1d5db; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
    select { padding: 6px 10px; border-radius: 6px; border: 1px solid #d1d5db; }
  </style>
</head>
<body>
  <div class="header">
    <h1>💬 Mensajes del Bot</h1>
  </div>
  <div class="container">
    <a href="/dashboard" class="back-btn">← Volver</a>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total (1h)</div>
        <div class="stat-value" id="statInHour">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Enviados (1h)</div>
        <div class="stat-value" id="statOutHour">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Errores (1h)</div>
        <div class="stat-value" id="statErrHour">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Último mensaje</div>
        <div class="stat-value" id="statLastMsg">-</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h2>📥 Recibidos <span class="pill" id="countReceived">0</span></h2>
        <div class="list">
          <table>
            <thead>
              <tr><th>Hora</th><th>Remitente</th><th>Tipo</th><th>Mensaje</th></tr>
            </thead>
            <tbody id="receivedBody"></tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <h2>📤 Enviados <span class="pill" id="countSent">0</span></h2>
        <div class="list">
          <table>
            <thead>
              <tr><th>Hora</th><th>Destino</th><th>Estado</th><th>Mensaje</th></tr>
            </thead>
            <tbody id="sentBody"></tbody>
          </table>
        </div>
      </div>
      <div class="card" style="grid-column: 1 / -1;">
        <h2>⚠️ Errores <span class="pill" id="countErrors">0</span></h2>
        <div class="list">
          <table>
            <thead>
              <tr><th>Hora</th><th>Contexto</th><th>Detalle</th></tr>
            </thead>
            <tbody id="errorsBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card raw-view">
      <h2>🔍 Mensaje seleccionado</h2>
      <div class="raw-actions">
        <select id="rawSelector">
          <option value="">Selecciona un mensaje...</option>
        </select>
        <button onclick="copyRaw()">Copiar JSON</button>
      </div>
      <textarea id="rawPayload" readonly>Selecciona un mensaje de las tablas para ver el payload completo.</textarea>
    </div>
  </div>
  <script>
    if (!localStorage.getItem('cocolu_token')) {
      window.location.href = '/login';
    }

    const rawSelector = document.getElementById('rawSelector');
    const rawPayload = document.getElementById('rawPayload');
    const state = { received: [], sent: [], errors: [] };

    function copyRaw() {
      navigator.clipboard.writeText(rawPayload.value || '');
    }

    function renderMessages(data) {
      const receivedBody = document.getElementById('receivedBody');
      const sentBody = document.getElementById('sentBody');
      const errorsBody = document.getElementById('errorsBody');

      receivedBody.innerHTML = '';
      sentBody.innerHTML = '';
      errorsBody.innerHTML = '';
      rawSelector.innerHTML = '<option value="">Selecciona un mensaje...</option>';

      document.getElementById('countReceived').textContent = data.received.length;
      document.getElementById('countSent').textContent = data.sent.length;
      document.getElementById('countErrors').textContent = data.errors.length;

      const addRawOption = function(type, item, idx) {
        const opt = document.createElement('option');
        opt.value = type + ':' + idx;
        var label = '[' + type + '] ' + (item.timestamp || '') + ' ' + (item.from || item.to || '');
        opt.textContent = label;
        rawSelector.appendChild(opt);
      };

      const lastHour = Date.now() - 3600000;
      let inHour = 0, outHour = 0, errHour = 0;
      let lastMsg = '-';

      data.received.forEach(function (m, index) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + new Date(m.timestamp).toLocaleTimeString() + '</td>' +
                       '<td>' + (m.from || '') + '</td>' +
                       '<td><span class="pill" data-type="in">Texto</span></td>' +
                       '<td>' + (m.body || '') + '</td>';
        tr.onclick = function() { showRaw('received', index); };
        receivedBody.appendChild(tr);
        addRawOption('received', m, index);
        state.received[index] = m;
        if (new Date(m.timestamp).getTime() >= lastHour) inHour++;
        if (!lastMsg) lastMsg = m.body || '-';
      });

      data.sent.forEach(function (m, index) {
        var tr = document.createElement('tr');
        var status = m.status || 'enviado';
        tr.innerHTML = '<td>' + new Date(m.timestamp).toLocaleTimeString() + '</td>' +
                       '<td>' + (m.to || '') + '</td>' +
                       '<td><span class="pill" data-type="out">' + status + '</span></td>' +
                       '<td>' + (m.body || '') + '</td>';
        tr.onclick = function() { showRaw('sent', index); };
        sentBody.appendChild(tr);
        addRawOption('sent', m, index);
        state.sent[index] = m;
        if (new Date(m.timestamp).getTime() >= lastHour) outHour++;
        lastMsg = lastMsg === '-' ? (m.body || '-') : lastMsg;
      });

      data.errors.forEach(function (e, index) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + new Date(e.timestamp).toLocaleTimeString() + '</td>' +
                       '<td>' + (e.context || '') + '</td>' +
                       '<td class="error">' + (e.error || '') + '</td>';
        tr.onclick = function() { showRaw('errors', index); };
        errorsBody.appendChild(tr);
        addRawOption('errors', e, index);
        state.errors[index] = e;
        if (new Date(e.timestamp).getTime() >= lastHour) errHour++;
      });

      document.getElementById('statInHour').textContent = inHour;
      document.getElementById('statOutHour').textContent = outHour;
      document.getElementById('statErrHour').textContent = errHour;
      document.getElementById('statLastMsg').textContent = lastMsg || '-';
    }

    function showRaw(type, index) {
      const item = state[type][index];
      if (!item) return;
      rawPayload.value = JSON.stringify(item, null, 2);
    }

    rawSelector.addEventListener('change', function() {
      const value = this.value;
      if (!value) {
        rawPayload.value = 'Selecciona un mensaje de las tablas para ver el payload completo.';
        return;
      }
      const [type, index] = value.split(':');
      showRaw(type, parseInt(index, 10));
    });

    async function loadMessagesOnce() {
      try {
        const res = await fetch('/api/open/messages');
        const json = await res.json();
        renderMessages(json.data || { received: [], sent: [], errors: [] });
      } catch (e) {
        console.error('Error cargando mensajes', e);
      }
    }

    function subscribeEvents() {
      try {
        const eventSource = new EventSource('/api/events');
        eventSource.addEventListener('messages', function(evt) {
          try {
            const data = JSON.parse(evt.data);
            renderMessages(data);
          } catch (e) {
            console.error('Error procesando evento de mensajes', e);
          }
        });
      } catch (e) {
        console.warn('SSE no disponible, usando polling', e);
        setInterval(loadMessagesOnce, 5000);
      }
    }

    loadMessagesOnce();
    subscribeEvents();

  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // Página de ADAPTADORES
  app.get('/adapters', (req, res) => {
    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Adaptadores - Cocolu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 30px; }
    .back-btn { display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
    .card { background: white; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .adapters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 20px; }
    .adapter { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; }
    .adapter-name { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .adapter-status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; background: #e0f2fe; color: #0369a1; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔌 Adaptadores</h1>
  </div>
  <div class="container">
    <a href="/dashboard" class="back-btn">← Volver</a>
    <div class="card">
      <h2>Proveedores Disponibles</h2>
      <div class="adapters-grid">
        <div class="adapter">
          <div class="adapter-name">📱 Baileys</div>
          <div class="adapter-status">Activo</div>
        </div>
        <div class="adapter">
          <div class="adapter-name">🐍 Venom</div>
          <div class="adapter-status">Disponible</div>
        </div>
        <div class="adapter">
          <div class="adapter-name">🔗 WPPConnect</div>
          <div class="adapter-status">Disponible</div>
        </div>
        <div class="adapter">
          <div class="adapter-name">🌐 Meta API</div>
          <div class="adapter-status">Disponible</div>
        </div>
      </div>
    </div>
  </div>
  <script>
    if (!localStorage.getItem('cocolu_token')) {
      window.location.href = '/login';
    }
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // Página de LOGS
  app.get('/logs', (req, res) => {
    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Logs - Cocolu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 30px; }
    .back-btn { display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
    .card { background: white; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .logs-container { background: #0b1220; border-radius: 8px; padding: 15px; font-family: monospace; font-size: 12px; color: #10b981; max-height: 500px; overflow-y: auto; }
    .log-line { padding: 4px 0; border-bottom: 1px solid #1f2937; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📝 Logs del Sistema</h1>
  </div>
  <div class="container">
    <a href="/dashboard" class="back-btn">← Volver</a>
    <div class="card">
      <h2>Registros del Sistema</h2>
      <div class="logs-container" id="logs"></div>
    </div>
  </div>
  <script>
    if (!localStorage.getItem('cocolu_token')) {
      window.location.href = '/login';
    }

    async function loadLogs() {
      try {
        const res = await fetch('/api/open/messages');
        const data = await res.json();
        const logsDiv = document.getElementById('logs');
        logsDiv.innerHTML = '';
        
        if (data.data?.errors?.length > 0) {
          data.data.errors.forEach(function (err) {
            var line = document.createElement('div');
            line.className = 'log-line';
            line.textContent = '[' + (err.timestamp || '') + '] ERROR: ' + (err.error || '');
            logsDiv.appendChild(line);
          });
        } else {
          logsDiv.innerHTML = '<div class="log-line">No hay errores registrados</div>';
        }
      } catch (e) {
        console.error('Error loading logs:', e);
      }
    }
    loadLogs();
    setInterval(loadLogs, 5000);
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // Página de ANÁLISIS
  app.get('/analytics', (req, res) => {
    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Análisis - Cocolu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 30px; }
    .back-btn { display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
    .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    h2 { margin-bottom: 10px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px; }
    .metric { background: #f9fafb; border-radius: 6px; padding: 10px 12px; font-size: 13px; }
    .metric-label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
    .metric-value { font-size: 16px; font-weight: 600; margin-top: 4px; }
    .list { max-height: 350px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px; margin-top: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; text-align: left; }
    th { background: #f9fafb; font-weight: 600; font-size: 12px; color: #6b7280; position: sticky; top: 0; z-index: 1; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Análisis del Bot</h1>
  </div>
  <div class="container">
    <a href="/dashboard" class="back-btn">← Volver</a>
    <div class="grid">
      <div class="card">
        <h2>Resumen ejecutivo</h2>
        <div class="metrics-grid">
          <div class="metric">
            <div class="metric-label">Mensajes totales</div>
            <div class="metric-value" id="mTotal">0</div>
          </div>
          <div class="metric">
            <div class="metric-label">Usuarios únicos</div>
            <div class="metric-value" id="mUsers">0</div>
          </div>
          <div class="metric">
            <div class="metric-label">Conversaciones activas</div>
            <div class="metric-value" id="mActive">0</div>
          </div>
          <div class="metric">
            <div class="metric-label">Pedidos completados</div>
            <div class="metric-value" id="mOrders">0</div>
          </div>
          <div class="metric">
            <div class="metric-label">Tasa de conversión</div>
            <div class="metric-value" id="mConversion">0%</div>
          </div>
          <div class="metric">
            <div class="metric-label">Tickets de soporte</div>
            <div class="metric-value" id="mTickets">0</div>
          </div>
          <div class="metric">
            <div class="metric-label">Tiempo resp. promedio</div>
            <div class="metric-value" id="mResponse">0 ms</div>
          </div>
        </div>
      </div>
      <div class="card">
        <h2>Eventos recientes</h2>
        <div class="list">
          <table>
            <thead>
              <tr><th>Hora</th><th>Tipo</th><th>Detalle</th></tr>
            </thead>
            <tbody id="eventsBody"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <script>
    if (!localStorage.getItem('cocolu_token')) {
      window.location.href = '/login';
    }

    async function loadAnalytics() {
      try {
        const [summaryRes, eventsRes] = await Promise.all([
          fetch('/api/analytics/summary'),
          fetch('/api/analytics/events?limit=50'),
        ]);
        const summaryJson = await summaryRes.json();
        const eventsJson = await eventsRes.json();
        const summary = summaryJson.data || {};
        const events = eventsJson.data || [];

        document.getElementById('mTotal').textContent = summary.totalMessages || 0;
        document.getElementById('mUsers').textContent = summary.uniqueUsers || 0;
        document.getElementById('mActive').textContent = summary.activeConversations || 0;
        document.getElementById('mOrders').textContent = summary.completedOrders || 0;
        document.getElementById('mConversion').textContent = (summary.conversionRate || 0) + '%';
        document.getElementById('mTickets').textContent = summary.supportTickets || 0;
        document.getElementById('mResponse').textContent = (summary.averageResponseTime || 0) + ' ms';

        const body = document.getElementById('eventsBody');
        body.innerHTML = '';
        events.forEach(function (ev) {
          var tr = document.createElement('tr');
          tr.innerHTML = '<td>' + new Date(ev.timestamp).toLocaleTimeString() + '</td>' +
                         '<td>' + (ev.type || '') + '</td>' +
                         '<td>' + (ev.data ? JSON.stringify(ev.data) : '') + '</td>';
          body.appendChild(tr);
        });
      } catch (e) {
        console.error('Error cargando analytics', e);
      }
    }

    loadAnalytics();
    setInterval(loadAnalytics, 5000);
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // Página de CONEXIÓN
  app.get('/connection', (req, res) => {
    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Conexión - Cocolu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 30px; }
    .back-btn { display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
    .card { background: white; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
    .qr-container { text-align: center; padding: 20px; }
    .qr-image { max-width: 300px; margin: 20px auto; }
    .code-display { background: #f0f0f0; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .code-value { font-size: 32px; font-weight: bold; color: #667eea; font-family: monospace; letter-spacing: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📲 Conexión del Bot</h1>
  </div>
  <div class="container">
    <a href="/dashboard" class="back-btn">← Volver</a>
    <div class="card">
      <h2>Conectar por QR</h2>
      <div class="qr-container">
        <p>Escanea este código QR con tu teléfono</p>
        <div id="qr" style="margin: 20px 0;"></div>
      </div>
    </div>
    <div class="card">
      <h2>O Conectar por Código de Emparejamiento</h2>
      <div class="code-display">
        <p>Tu código de emparejamiento:</p>
        <div class="code-value" id="pairingCode">Esperando...</div>
      </div>
    </div>
  </div>
  <script>
    if (!localStorage.getItem('cocolu_token')) {
      window.location.href = '/login';
    }

    async function loadPairingCode() {
      try {
        const res = await fetch('/api/open/pairing-code');
        const data = await res.json();
        if (data.code) {
          document.getElementById('pairingCode').textContent = data.code;
        }
      } catch (e) {}
    }
    loadPairingCode();
    setInterval(loadPairingCode, 3000);
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // Página de FACTURACIÓN META
  app.get('/meta-billing', (req, res) => {
    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Facturación Meta - Cocolu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
    .container { max-width: 1400px; margin: 0 auto; padding: 30px; }
    .back-btn { display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
    .card { background: white; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
    h2 { margin-bottom: 15px; color: #111827; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
    .metric-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; padding: 20px; }
    .metric-label { font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .metric-value { font-size: 28px; font-weight: 700; }
    .metric-sub { font-size: 14px; opacity: 0.8; margin-top: 4px; }
    .table-container { overflow-x: auto; margin-top: 15px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; color: #6b7280; font-size: 12px; position: sticky; top: 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .chart-container { margin-top: 20px; height: 300px; position: relative; }
    .loading { text-align: center; padding: 40px; color: #6b7280; }
    .filter-bar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-btn { padding: 8px 16px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .filter-btn.active { background: #667eea; color: white; border-color: #667eea; }
  </style>
</head>
<body>
  <div class="header">
    <h1>💰 Facturación Meta (WhatsApp Business API)</h1>
  </div>
  <div class="container">
    <a href="/dashboard" class="back-btn">← Volver al Dashboard</a>
    
    <!-- Resumen Principal -->
    <div class="card">
      <h2>📊 Resumen de Facturación</h2>
      <div class="metrics-grid" id="summaryMetrics">
        <div class="loading">Cargando...</div>
      </div>
    </div>
    
    <!-- Filtros de Período -->
    <div class="card">
      <h2>📅 Seleccionar Período</h2>
      <div class="filter-bar">
        <button class="filter-btn active" onclick="loadSummary('today')">Hoy</button>
        <button class="filter-btn" onclick="loadSummary('week')">Esta Semana</button>
        <button class="filter-btn" onclick="loadSummary('month')">Este Mes</button>
        <button class="filter-btn" onclick="loadSummary('year')">Este Año</button>
        <button class="filter-btn" onclick="loadSummary('all')">Todo</button>
      </div>
    </div>
    
    <!-- Desglose por Tipo -->
    <div class="card">
      <h2>📋 Desglose por Tipo de Mensaje</h2>
      <div class="table-container">
        <table id="typeBreakdown">
          <thead>
            <tr><th>Tipo</th><th>Cantidad</th><th>Costo Total</th><th>% del Total</th></tr>
          </thead>
          <tbody>
            <tr><td colspan="4" class="loading">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Desglose por Categoría -->
    <div class="card">
      <h2>📂 Desglose por Categoría</h2>
      <div class="table-container">
        <table id="categoryBreakdown">
          <thead>
            <tr><th>Categoría</th><th>Cantidad</th><th>Costo Total</th><th>% del Total</th></tr>
          </thead>
          <tbody>
            <tr><td colspan="4" class="loading">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Desglose por País -->
    <div class="card">
      <h2>🌍 Desglose por País</h2>
      <div class="table-container">
        <table id="countryBreakdown">
          <thead>
            <tr><th>País</th><th>Cantidad</th><th>Costo Total</th><th>% del Total</th><th>Tier</th><th>Precio Unitario</th></tr>
          </thead>
          <tbody>
            <tr><td colspan="6" class="loading">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Estadísticas Mensuales -->
    <div class="card">
      <h2>📈 Estadísticas Mensuales (Últimos 6 Meses)</h2>
      <div class="table-container">
        <table id="monthlyStats">
          <thead>
            <tr><th>Mes</th><th>Mensajes</th><th>Costo Total</th><th>Promedio Diario</th><th>Costo Diario</th></tr>
          </thead>
          <tbody>
            <tr><td colspan="5" class="loading">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Historial Reciente -->
    <div class="card">
      <h2>📝 Historial Reciente de Mensajes</h2>
      <div class="table-container">
        <table id="messageHistory">
          <thead>
            <tr><th>Fecha/Hora</th><th>Destinatario</th><th>País</th><th>Tipo</th><th>Categoría</th><th>Costo</th></tr>
          </thead>
          <tbody>
            <tr><td colspan="5" class="loading">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Precios Actuales por País -->
    <div class="card">
      <h2>💵 Precios Actuales de Meta por País</h2>
      <p style="color: #6b7280; font-size: 13px; margin-bottom: 15px;">
        Los precios varían según el país del destinatario. Venezuela y otros países latinoamericanos tienen precios más bajos (Tier 0).
      </p>
      <div class="table-container">
        <table id="pricingTable">
          <thead>
            <tr><th>País</th><th>Tier</th><th>Conversación (texto)</th><th>Template (texto)</th><th>Moneda</th></tr>
          </thead>
          <tbody>
            <tr><td colspan="5" class="loading">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  <script>
    if (!localStorage.getItem('cocolu_token')) {
      window.location.href = '/login';
    }
    
    let currentPeriod = 'month';
    
    function formatCurrency(amount) {
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
    }
    
    function formatDate(dateString) {
      return new Date(dateString).toLocaleString('es-ES');
    }
    
    function getPeriodDates(period) {
      const now = new Date();
      let start, end = now;
      
      switch(period) {
        case 'today':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          start = new Date(now);
          start.setDate(now.getDate() - 7);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          break;
        case 'all':
          start = null;
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      return { start, end };
    }
    
    async function loadSummary(period = 'month') {
      currentPeriod = period;
      
      // Actualizar botones activos
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      event?.target?.classList.add('active');
      
      const { start, end } = getPeriodDates(period);
      const params = new URLSearchParams();
      if (start) params.append('startDate', start.toISOString());
      if (end) params.append('endDate', end.toISOString());
      
      try {
        const res = await fetch('/api/meta/billing/summary?' + params);
        const json = await res.json();
        const data = json.data || {};
        const summary = data.summary || {};
        const breakdown = data.breakdown || {};
        
        // Actualizar métricas principales
        const metricsHtml = \`
          <div class="metric-card">
            <div class="metric-label">Total Mensajes</div>
            <div class="metric-value">\${summary.totalMessages || 0}</div>
            <div class="metric-sub">En el período seleccionado</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Costo Total</div>
            <div class="metric-value">\${formatCurrency(summary.totalCost || 0)}</div>
            <div class="metric-sub">USD</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Promedio Diario</div>
            <div class="metric-value">\${summary.avgDailyMessages?.toFixed(0) || 0}</div>
            <div class="metric-sub">mensajes/día</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Proyección Mensual</div>
            <div class="metric-value">\${formatCurrency(summary.projectedMonthlyCost || 0)}</div>
            <div class="metric-sub">basado en promedio diario</div>
          </div>
        \`;
        document.getElementById('summaryMetrics').innerHTML = metricsHtml;
        
        // Actualizar desglose por tipo
        const typeBody = document.querySelector('#typeBreakdown tbody');
        if (breakdown.byType && Object.keys(breakdown.byType).length > 0) {
          const totalCost = summary.totalCost || 1;
          typeBody.innerHTML = Object.entries(breakdown.byType)
            .map(([type, stats]) => \`
              <tr>
                <td><span class="badge badge-info">\${type}</span></td>
                <td>\${stats.count}</td>
                <td>\${formatCurrency(stats.cost)}</td>
                <td>\${((stats.cost / totalCost) * 100).toFixed(1)}%</td>
              </tr>
            \`).join('');
        } else {
          typeBody.innerHTML = '<tr><td colspan="4">No hay datos disponibles</td></tr>';
        }
        
        // Actualizar desglose por categoría
        const categoryBody = document.querySelector('#categoryBreakdown tbody');
        if (breakdown.byCategory && Object.keys(breakdown.byCategory).length > 0) {
          const totalCost = summary.totalCost || 1;
          categoryBody.innerHTML = Object.entries(breakdown.byCategory)
            .map(([category, stats]) => \`
              <tr>
                <td><span class="badge badge-success">\${category}</span></td>
                <td>\${stats.count}</td>
                <td>\${formatCurrency(stats.cost)}</td>
                <td>\${((stats.cost / totalCost) * 100).toFixed(1)}%</td>
              </tr>
            \`).join('');
        } else {
          categoryBody.innerHTML = '<tr><td colspan="4">No hay datos disponibles</td></tr>';
        }
        
        // Actualizar desglose por país
        const countryBody = document.querySelector('#countryBreakdown tbody');
        if (breakdown.byCountry && Object.keys(breakdown.byCountry).length > 0) {
          const totalCost = summary.totalCost || 1;
          const countries = Object.values(breakdown.byCountry).sort((a, b) => b.cost - a.cost);
          countryBody.innerHTML = countries
            .map(country => {
              const avgPrice = country.count > 0 ? country.cost / country.count : 0;
              const tierBadge = country.tier !== null ? \`<span class="badge badge-info">Tier \${country.tier}</span>\` : '<span class="badge badge-warning">N/A</span>';
              return \`
                <tr>
                  <td><strong>\${country.countryName}</strong> <span style="color: #6b7280; font-size: 11px;">(\${country.countryCode})</span></td>
                  <td>\${country.count}</td>
                  <td>\${formatCurrency(country.cost)}</td>
                  <td>\${((country.cost / totalCost) * 100).toFixed(1)}%</td>
                  <td>\${tierBadge}</td>
                  <td>\${formatCurrency(avgPrice)}</td>
                </tr>
              \`;
            }).join('');
        } else {
          countryBody.innerHTML = '<tr><td colspan="6">No hay datos disponibles</td></tr>';
        }
      } catch (e) {
        console.error('Error cargando resumen:', e);
        document.getElementById('summaryMetrics').innerHTML = '<div class="loading">Error al cargar datos</div>';
      }
    }
    
    async function loadMonthlyStats() {
      try {
        const res = await fetch('/api/meta/billing/monthly?months=6');
        const json = await res.json();
        const stats = json.data || [];
        
        const body = document.querySelector('#monthlyStats tbody');
        if (stats.length > 0) {
          body.innerHTML = stats.map(stat => \`
            <tr>
              <td>\${stat.monthName}</td>
              <td>\${stat.totalMessages}</td>
              <td>\${formatCurrency(stat.totalCost)}</td>
              <td>\${stat.avgDailyMessages?.toFixed(0) || 0}</td>
              <td>\${formatCurrency(stat.avgDailyCost)}</td>
            </tr>
          \`).join('');
        } else {
          body.innerHTML = '<tr><td colspan="5">No hay datos disponibles</td></tr>';
        }
      } catch (e) {
        console.error('Error cargando estadísticas mensuales:', e);
      }
    }
    
    async function loadMessageHistory() {
      try {
        const res = await fetch('/api/meta/billing/history?limit=50');
        const json = await res.json();
        const data = json.data || {};
        const messages = data.messages || [];
        
        const body = document.querySelector('#messageHistory tbody');
        if (messages.length > 0) {
          body.innerHTML = messages.map(msg => \`
            <tr>
              <td>\${formatDate(msg.timestamp)}</td>
              <td>\${msg.to}</td>
              <td><strong>\${msg.countryName || 'Desconocido'}</strong> <span style="color: #6b7280; font-size: 11px;">(\${msg.countryCode || 'N/A'})</span></td>
              <td><span class="badge badge-info">\${msg.type}</span></td>
              <td><span class="badge badge-success">\${msg.category}</span></td>
              <td>\${formatCurrency(msg.cost)}</td>
            </tr>
          \`).join('');
        } else {
          body.innerHTML = '<tr><td colspan="6">No hay mensajes registrados aún</td></tr>';
        }
      } catch (e) {
        console.error('Error cargando historial:', e);
      }
    }
    
    async function loadPricing() {
      try {
        const res = await fetch('/api/meta/billing/pricing');
        const json = await res.json();
        const pricingByCountry = json.data || {};
        
        const body = document.querySelector('#pricingTable tbody');
        const countries = Object.entries(pricingByCountry)
          .map(([countryCode, pricing]) => ({
            countryCode,
            countryName: COUNTRY_NAMES[countryCode] || countryCode,
            tier: pricing.tier,
            conversationText: pricing.conversation?.text || 0,
            templateText: pricing.template?.text || 0,
            currency: pricing.currency || 'USD',
          }))
          .sort((a, b) => {
            // Ordenar por tier primero, luego por nombre
            if (a.tier !== b.tier) {
              return (a.tier || 999) - (b.tier || 999);
            }
            return a.countryName.localeCompare(b.countryName);
          });
        
        if (countries.length > 0) {
          body.innerHTML = countries.map(country => {
            const tierBadge = country.tier !== null ? \`<span class="badge badge-info">Tier \${country.tier}</span>\` : '<span class="badge badge-warning">N/A</span>';
            return \`
              <tr>
                <td><strong>\${country.countryName}</strong> <span style="color: #6b7280; font-size: 11px;">(\${country.countryCode})</span></td>
                <td>\${tierBadge}</td>
                <td>\${formatCurrency(country.conversationText)}</td>
                <td>\${formatCurrency(country.templateText)}</td>
                <td>\${country.currency}</td>
              </tr>
            \`;
          }).join('');
        } else {
          body.innerHTML = '<tr><td colspan="5">No hay información de precios disponible</td></tr>';
        }
      } catch (e) {
        console.error('Error cargando precios:', e);
      }
    }
    
    // Nombres de países para el frontend
    const COUNTRY_NAMES = {
      VE: 'Venezuela',
      MX: 'México',
      AR: 'Argentina',
      BR: 'Brasil',
      CL: 'Chile',
      CO: 'Colombia',
      PE: 'Perú',
      EC: 'Ecuador',
      PY: 'Paraguay',
      UY: 'Uruguay',
      BO: 'Bolivia',
      CR: 'Costa Rica',
      PA: 'Panamá',
      GT: 'Guatemala',
      SV: 'El Salvador',
      HN: 'Honduras',
      NI: 'Nicaragua',
      ES: 'España',
      US: 'Estados Unidos',
    };
    
    // Verificar estado de registro Meta
    fetch('/api/meta/config')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data.PHONE_REGISTERED !== 'true') {
          const alert = document.getElementById('registration-alert');
          if (alert) alert.style.display = 'block';
        }
      })
      .catch(e => console.error('Error checking meta status:', e));

    // Cargar todo al inicio
    loadSummary('month');
    loadMonthlyStats();
    loadMessageHistory();
    loadPricing();
    
    // Actualizar cada 30 segundos
    setInterval(() => {
      loadSummary(currentPeriod);
      loadMessageHistory();
    }, 30000);
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // Página de SALUD DEL SISTEMA
  app.get('/health', (req, res) => {
    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Salud del Sistema - Cocolu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
    .container { max-width: 900px; margin: 0 auto; padding: 30px; }
    .back-btn { display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
    .card { background: white; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
    .status { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; font-size: 13px; }
    .status-ok { background: #dcfce7; color: #166534; }
    .status-bad { background: #fee2e2; color: #991b1b; }
    .metric { margin-top: 10px; font-size: 14px; }
    .label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 12px; }
    .metric-box { background: #f9fafb; border-radius: 6px; padding: 10px 12px; font-size: 13px; }
    pre { background: #0b1220; color: #e5e7eb; padding: 10px; border-radius: 6px; font-size: 11px; max-height: 260px; overflow: auto; }
  </style>
</head>
<body>
  <div class="header">
    <h1>❤️ Salud del Sistema</h1>
  </div>
  <div class="container">
    <a href="/dashboard" class="back-btn">← Volver</a>
    <div class="card">
      <h2>Estado general</h2>
      <div id="statusBadge" class="status status-bad">Cargando...</div>
      <div class="metric">
        <div class="label">Uptime</div>
        <div id="uptime">-</div>
      </div>
      <div class="metric">
        <div class="label">Última actualización</div>
        <div id="timestamp">-</div>
      </div>
      <div class="metric">
        <div class="label">Versión</div>
        <div id="version">-</div>
      </div>
    </div>
    <div class="card">
      <h2>Resumen de bots y negocio</h2>
      <div class="metrics-grid">
        <div class="metric-box">
          <div class="label">Bots totales</div>
          <div class="metric-value" id="hTotalBots">0</div>
        </div>
        <div class="metric-box">
          <div class="label">Bots conectados</div>
          <div class="metric-value" id="hConnectedBots">0</div>
        </div>
        <div class="metric-box">
          <div class="label">Mensajes (bots)</div>
          <div class="metric-value" id="hBotMessages">0</div>
        </div>
        <div class="metric-box">
          <div class="label">Errores (bots)</div>
          <div class="metric-value" id="hBotErrors">0</div>
        </div>
        <div class="metric-box">
          <div class="label">Vendedores activos</div>
          <div class="metric-value" id="hActiveSellers">0</div>
        </div>
        <div class="metric-box">
          <div class="label">Asignaciones totales</div>
          <div class="metric-value" id="hTotalAssignments">0</div>
        </div>
        <div class="metric-box">
          <div class="label">Mensajes totales</div>
          <div class="metric-value" id="hTotalMessages">0</div>
        </div>
        <div class="metric-box">
          <div class="label">Usuarios únicos</div>
          <div class="metric-value" id="hUniqueUsers">0</div>
        </div>
      </div>
    </div>
    <div class="card">
      <h2>Respuesta cruda de la API</h2>
      <pre id="raw"></pre>
    </div>
  </div>
  <script>
    if (!localStorage.getItem('cocolu_token')) {
      window.location.href = '/login';
    }

    function formatSeconds(sec) {
      sec = Math.floor(sec || 0);
      var h = Math.floor(sec / 3600);
      var m = Math.floor((sec % 3600) / 60);
      var s = sec % 60;
      return h + 'h ' + m + 'm ' + s + 's';
    }

    async function loadHealth() {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        const ok = data && data.status === 'healthy';

        var badge = document.getElementById('statusBadge');
        badge.textContent = ok ? 'Operativo' : 'Con problemas';
        badge.className = 'status ' + (ok ? 'status-ok' : 'status-bad');

        document.getElementById('uptime').textContent = formatSeconds(data.uptime);
        document.getElementById('timestamp').textContent = data.timestamp || '-';
        document.getElementById('version').textContent = data.version || '-';

        var bots = data.bots || {};
        var sellers = data.sellers || {};
        var analytics = data.analytics || {};

        document.getElementById('hTotalBots').textContent = bots.totalBots || 0;
        document.getElementById('hConnectedBots').textContent = bots.connectedBots || 0;
        document.getElementById('hBotMessages').textContent = bots.totalMessages || 0;
        document.getElementById('hBotErrors').textContent = bots.totalErrors || 0;

        document.getElementById('hActiveSellers').textContent = sellers.activeSellers || 0;
        document.getElementById('hTotalAssignments').textContent = sellers.totalAssignments || 0;

        document.getElementById('hTotalMessages').textContent = analytics.totalMessages || 0;
        document.getElementById('hUniqueUsers').textContent = analytics.uniqueUsers || 0;

        document.getElementById('raw').textContent = JSON.stringify(data, null, 2);
      } catch (e) {
        console.error('Error cargando salud', e);
      }
    }

    loadHealth();
    setInterval(loadHealth, 5000);
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });
};
