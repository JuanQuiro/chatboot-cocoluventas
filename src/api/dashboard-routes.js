/**
 * Rutas del Dashboard y Login
 */

export const setupDashboardRoutes = (app) => {
    // Página de LOGIN
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
    function handleLogin(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('cocolu_token', 'authenticated');
        localStorage.setItem('cocolu_user', username);
        window.location.href = '/dashboard';
      } else {
        document.getElementById('error').textContent = 'Usuario o contraseña incorrectos';
        document.getElementById('error').style.display = 'block';
      }
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
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f5f5f5; color: #333; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header h1 { font-size: 24px; }
    .logout-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px; }
    .container { display: grid; grid-template-columns: 250px 1fr; min-height: calc(100vh - 70px); }
    .sidebar { background: white; border-right: 1px solid #e0e0e0; padding: 20px; }
    .sidebar h3 { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 15px; margin-top: 20px; }
    .nav-item { display: block; padding: 12px 15px; color: #333; text-decoration: none; border-radius: 6px; font-size: 14px; transition: all 0.3s; margin-bottom: 5px; border-left: 3px solid transparent; }
    .nav-item:hover { background: #f0f0f0; border-left-color: #667eea; }
    .main { padding: 30px; }
    .card { background: white; border-radius: 8px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .modules-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; }
    .module-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-decoration: none; transition: all 0.3s; cursor: pointer; text-align: center; }
    .module-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3); }
    .module-icon { font-size: 32px; margin-bottom: 10px; }
    .module-title { font-size: 14px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 Cocolu Chatbot</h1>
    <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
  </div>

  <div class="container">
    <div class="sidebar">
      <h3>📊 Principal</h3>
      <a href="/dashboard" class="nav-item">Dashboard</a>
      
      <h3>💬 Chatbot</h3>
      <a href="/messages" class="nav-item">📱 Mensajes</a>
      <a href="/analytics" class="nav-item">📊 Análisis</a>
      <a href="/qr" class="nav-item">📲 Conexión</a>
      
      <h3>⚙️ Configuración</h3>
      <a href="/adapters" class="nav-item">🔌 Adaptadores</a>
      <a href="/logs" class="nav-item">📝 Logs</a>
      
      <h3>📈 Monitoreo</h3>
      <a href="/api/health" class="nav-item">❤️ Salud</a>
    </div>

    <div class="main">
      <div class="card">
        <h2>Bienvenido al Dashboard</h2>
        <p style="color: #666; margin: 15px 0;">Gestiona tu chatbot desde aquí.</p>
        
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
          <a href="/qr" class="module-card">
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
          <a href="/api/health" class="module-card">
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
    async function loadLogs() {
      try {
        const res = await fetch('/api/open/messages');
        const data = await res.json();
        const logsDiv = document.getElementById('logs');
        logsDiv.innerHTML = '';
        
        if (data.data?.errors?.length > 0) {
          data.data.errors.forEach(err => {
            const line = document.createElement('div');
            line.className = 'log-line';
            line.textContent = \`[\${err.timestamp}] ERROR: \${err.error}\`;
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
};
