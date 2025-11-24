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

  // POST /api/login - Endpoint para autenticación del dashboard HTML
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validar credenciales recibidas
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario y contraseña requeridos'
        });
      }

      // Credenciales de demostración (hardcoded por ahora)
      const validCredentials = [
        { username: 'admin@cocolu.com', password: 'Admin123!', role: 'admin' },
        { username: 'seller@cocolu.com', password: 'Seller123!', role: 'seller' }
      ];

      // Buscar credencial válida
      const credential = validCredentials.find(
        c => c.username === username && c.password === password
      );

      if (!credential) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generar token simple (en producción usar JWT real)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

      res.json({
        success: true,
        token: token,
        user: {
          username: credential.username,
          role: credential.role
        }
      });

    } catch (error) {
      console.error('Error en /api/login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  });

  // Redirect /meta-settings → /meta-setup (nueva UI premium)
  app.get('/meta-settings', (req, res) => {
    res.redirect(301, '/meta-setup');
  });


  // COMENTADO: Ruta legacy de diagnóstico. Ahora manejada por React Router.
  /*
  app.get('/meta-diagnostics', (req, res) => {
     // ... (legacy HTML code)
     res.redirect('/dashboard/meta-diagnostics');
  });
  */

  // COMENTADO: Ruta legacy de dashboard. Ahora manejada por React Router.
  /*
  app.get('/dashboard', (req, res) => {
     // ... (legacy HTML code)
     res.sendFile(path.join(__dirname, '../../dashboard/build/index.html'));
  });
  */

  // COMENTADO: Ruta legacy de mensajes. Ahora manejada por React Router.
  /*
  app.get('/messages', (req, res) => {
     // ... (legacy HTML code)
     res.redirect('/dashboard/messages');
  });

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
  tr.onclick = function () { showRaw('received', index); };
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
  tr.onclick = function () { showRaw('sent', index); };
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
  tr.onclick = function () { showRaw('errors', index); };
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

rawSelector.addEventListener('change', function () {
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
    eventSource.addEventListener('messages', function (evt) {
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

  </script >
</body >
</html > `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });
  */

  // Página de ADAPTADORES
  app.get('/adapters', (req, res) => {
    const html = `< !doctype html >
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Adaptadores - Cocolu</title>
      <style>
        * {margin: 0; padding: 0; box-sizing: border-box; }
        body {font - family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
        .header {background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
        .container {max - width: 1200px; margin: 0 auto; padding: 30px; }
        .back-btn {display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
        .card {background: white; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .adapters-grid {display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 20px; }
        .adapter {background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; }
        .adapter-name {font - size: 16px; font-weight: 600; margin-bottom: 8px; }
        .adapter-status {display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; background: #e0f2fe; color: #0369a1; }
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
    const html = `< !doctype html >
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Logs - Cocolu</title>
      <style>
        * {margin: 0; padding: 0; box-sizing: border-box; }
        body {font - family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
        .header {background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
        .container {max - width: 1200px; margin: 0 auto; padding: 30px; }
        .back-btn {display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
        .card {background: white; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .logs-container {background: #0b1220; border-radius: 8px; padding: 15px; font-family: monospace; font-size: 12px; color: #10b981; max-height: 500px; overflow-y: auto; }
        .log-line {padding: 4px 0; border-bottom: 1px solid #1f2937; }
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
    const html = `< !doctype html >
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Análisis - Cocolu</title>
      <style>
        * {margin: 0; padding: 0; box-sizing: border-box; }
        body {font - family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
        .header {background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
        .container {max - width: 1200px; margin: 0 auto; padding: 30px; }
        .back-btn {display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
        .grid {display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
        .card {background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        h2 {margin - bottom: 10px; }
        .metrics-grid {display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px; }
        .metric {background: #f9fafb; border-radius: 6px; padding: 10px 12px; font-size: 13px; }
        .metric-label {color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
        .metric-value {font - size: 16px; font-weight: 600; margin-top: 4px; }
        .list {max - height: 350px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px; margin-top: 12px; }
        table {width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td {padding: 6px 8px; border-bottom: 1px solid #f3f4f6; text-align: left; }
        th {background: #f9fafb; font-weight: 600; font-size: 12px; color: #6b7280; position: sticky; top: 0; z-index: 1; }
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
        const summary = summaryJson.data || { };
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
    const html = `< !doctype html >
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Conexión - Cocolu</title>
      <style>
        * {margin: 0; padding: 0; box-sizing: border-box; }
        body {font - family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
        .header {background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
        .container {max - width: 1200px; margin: 0 auto; padding: 30px; }
        .back-btn {display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
        .card {background: white; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
        .qr-container {text - align: center; padding: 20px; }
        .qr-image {max - width: 300px; margin: 20px auto; }
        .code-display {background: #f0f0f0; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .code-value {font - size: 32px; font-weight: bold; color: #667eea; font-family: monospace; letter-spacing: 4px; }
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
      } catch (e) { }
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
    const html = `< !doctype html >
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Facturación Meta - Cocolu</title>
      <style>
        * {margin: 0; padding: 0; box-sizing: border-box; }
        body {font - family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
        .header {background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
        .container {max - width: 1400px; margin: 0 auto; padding: 30px; }
        .back-btn {display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
        .card {background: white; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
        h2 {margin - bottom: 15px; color: #111827; }
        .metrics-grid {display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
        .metric-card {background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; padding: 20px; }
        .metric-label {font - size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .metric-value {font - size: 28px; font-weight: 700; }
        .metric-sub {font - size: 14px; opacity: 0.8; margin-top: 4px; }
        .table-container {overflow - x: auto; margin-top: 15px; }
        table {width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td {padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th {background: #f9fafb; font-weight: 600; color: #6b7280; font-size: 12px; position: sticky; top: 0; }
        .badge {display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .badge-success {background: #dcfce7; color: #166534; }
        .badge-info {background: #dbeafe; color: #1e40af; }
        .badge-warning {background: #fef3c7; color: #92400e; }
        .chart-container {margin - top: 20px; height: 300px; position: relative; }
        .loading {text - align: center; padding: 40px; color: #6b7280; }
        .filter-bar {display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .filter-btn {padding: 8px 16px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer; font-size: 13px; }
        .filter-btn.active {background: #667eea; color: white; border-color: #667eea; }
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
      return new Intl.NumberFormat('es-ES', {style: 'currency', currency: 'USD' }).format(amount);
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

        return {start, end};
    }

        async function loadSummary(period = 'month') {
          currentPeriod = period;

      // Actualizar botones activos
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event?.target?.classList.add('active');

        const {start, end} = getPeriodDates(period);
        const params = new URLSearchParams();
        if (start) params.append('startDate', start.toISOString());
        if (end) params.append('endDate', end.toISOString());

        try {
        const res = await fetch('/api/meta/billing/summary?' + params);
        const json = await res.json();
        const data = json.data || { };
        const summary = data.summary || { };
        const breakdown = data.breakdown || { };

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
        const data = json.data || { };
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
        const pricingByCountry = json.data || { };

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
            const tierBadge = country.tier !== null ?\`<span class="badge badge-info">Tier \${country.tier}</span>\` : '<span class="badge badge-warning">N/A</span>';
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
    const html = `< !doctype html >
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Salud del Sistema - Cocolu</title>
      <style>
        * {margin: 0; padding: 0; box-sizing: border-box; }
        body {font - family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; }
        .header {background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; }
        .container {max - width: 900px; margin: 0 auto; padding: 30px; }
        .back-btn {display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #667eea; color: white; border-radius: 4px; text-decoration: none; font-size: 13px; }
        .card {background: white; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
        .status {display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; font-size: 13px; }
        .status-ok {background: #dcfce7; color: #166534; }
        .status-bad {background: #fee2e2; color: #991b1b; }
        .metric {margin - top: 10px; font-size: 14px; }
        .label {color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
        .metrics-grid {display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 12px; }
        .metric-box {background: #f9fafb; border-radius: 6px; padding: 10px 12px; font-size: 13px; }
        pre {background: #0b1220; color: #e5e7eb; padding: 10px; border-radius: 6px; font-size: 11px; max-height: 260px; overflow: auto; }
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

        var bots = data.bots || { };
        var sellers = data.sellers || { };
        var analytics = data.analytics || { };

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
