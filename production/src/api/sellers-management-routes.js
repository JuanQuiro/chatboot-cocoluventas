/**
 * Sellers Management Routes - Gestión completa de vendedores
 */

export const setupSellersManagementRoutes = (app) => {
    console.log('✅ Sellers Management routes cargadas');

    // GET /sellers - Página de gestión de vendedores
    app.get('/sellers', (req, res) => {
        const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gestión de Vendedores - Cocolu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f3f4f6; color: #111827; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.15); }
    .header h1 { font-size: 22px; }
    .logout-btn { background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 999px; cursor: pointer; font-size: 13px; }
    .container { display: grid; grid-template-columns: 250px 1fr; min-height: calc(100vh - 60px); }
    .sidebar { background: white; border-right: 1px solid #e0e0e0; padding: 20px; overflow-y: auto; max-height: calc(100vh - 60px); }
    .sidebar h3 { font-size: 11px; color: #9ca3af; text-transform: uppercase; margin-bottom: 12px; margin-top: 18px; }
    .nav-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; color: #374151; text-decoration: none; border-radius: 8px; font-size: 14px; transition: all 0.2s; margin-bottom: 4px; border-left: 3px solid transparent; }
    .nav-item:hover { background: #eef2ff; border-left-color: #818cf8; }
    .nav-item.active { background: #eef2ff; border-left-color: #4f46e5; color: #111827; font-weight: 600; }
    .main { padding: 28px; overflow-y: auto; max-height: calc(100vh - 60px); }
    .card { background: white; border-radius: 10px; padding: 24px; box-shadow: 0 10px 25px rgba(15,23,42,0.06); margin-bottom: 20px; }
    .tabs { display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
    .tab { padding: 12px 20px; background: transparent; border: none; cursor: pointer; font-weight: 600; color: #6b7280; border-bottom: 3px solid transparent; transition: all 0.3s; }
    .tab.active { color: #667eea; border-bottom-color: #667eea; }
    .sellers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 20px; }
    .seller-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; transition: all 0.3s; }
    .seller-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .seller-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; }
    .seller-name { font-weight: 600; font-size: 16px; }
    .seller-info { font-size: 13px; color: #6b7280; margin: 4px 0; }
    .metrics-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 12px 0; }
    .metric-badge { background: #f3f4f6; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px; }
    .metric-label { color: #9ca3af; font-size: 11px; }
    .metric-value { font-weight: 700; color: #667eea; font-size: 14px; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-top: 8px; }
    .badge.active { background: #d1fae5; color: #065f46; }
    .badge.inactive { background: #fee2e2; color: #7f1d1d; }
    .btn { padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s; font-size: 12px; margin-top: 8px; margin-right: 4px; }
    .btn-primary { background: #667eea; color: white; }
    .btn-primary:hover { background: #5568d3; }
    .btn-success { background: #10b981; color: white; }
    .btn-success:hover { background: #059669; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover { background: #dc2626; }
    .modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; }
    .modal.active { display: flex; }
    .modal-content { background: white; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h2 { margin: 0; }
    .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; }
    .form-input { width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; }
    .form-input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
    .toggle-switch { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
    .switch { position: relative; width: 50px; height: 28px; background: #ccc; border-radius: 14px; cursor: pointer; transition: background 0.3s; }
    .switch.active { background: #10b981; }
    .switch-circle { position: absolute; top: 2px; left: 2px; width: 24px; height: 24px; background: white; border-radius: 50%; transition: left 0.3s; }
    .switch.active .switch-circle { left: 24px; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .notification { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>👥 Gestión de Vendedores</h1>
    <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
  </div>

  <div class="container">
    <div class="sidebar">
      <h3>📊 Principal</h3>
      <a href="/dashboard" class="nav-item">🏠 Dashboard</a>
      
      <h3>👥 Vendedores</h3>
      <a href="/sellers" class="nav-item active">👥 Gestión</a>
      <a href="/seller-availability" class="nav-item">⏰ Disponibilidad</a>
      
      <h3>🌐 Meta</h3>
      <a href="/meta-settings" class="nav-item">⚙️ Config Meta</a>
      <a href="/meta-diagnostics" class="nav-item">🧪 Diagnóstico</a>
    </div>

    <div class="main">
      <div class="card">
        <h2>👥 Gestión de Vendedores</h2>
        <p style="color: #666; margin: 15px 0;">Modifica información, activa/desactiva y revisa métricas de vendedores</p>
        
        <div class="tabs">
          <button class="tab active" onclick="switchTab('list')">📋 Lista de Vendedores</button>
          <button class="tab" onclick="switchTab('metrics')">📊 Métricas Globales</button>
        </div>
        
        <div id="list-tab" class="tab-content active">
          <div class="sellers-grid" id="sellersList">
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #9ca3af;">
              <p>Cargando vendedores...</p>
            </div>
          </div>
        </div>
        
        <div id="metrics-tab" class="tab-content">
          <div id="metricsContent">
            <p style="text-align: center; color: #9ca3af;">Cargando métricas...</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Edición -->
  <div id="editModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Editar Vendedor</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <form onsubmit="saveSeller(event)">
        <div class="form-group">
          <label class="form-label">Nombre</label>
          <input type="text" id="sellerName" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="sellerEmail" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Teléfono</label>
          <input type="tel" id="sellerPhone" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Especialidad</label>
          <input type="text" id="sellerSpecialty" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <div class="toggle-switch">
            <span>Inactivo</span>
            <div class="switch" id="statusSwitch" onclick="toggleStatus()">
              <div class="switch-circle"></div>
            </div>
            <span>Activo</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Notificación cada (minutos)</label>
          <input type="number" id="notificationInterval" class="form-input" value="30" min="5" />
        </div>
        <button type="submit" class="btn btn-primary">Guardar Cambios</button>
      </form>
    </div>
  </div>

  <script>
    let currentSellerId = null;
    let currentSellerStatus = false;

    async function loadSellers() {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (data.sellers && data.sellers.sellersStats) {
          const sellers = data.sellers.sellersStats;
          const container = document.getElementById('sellersList');
          
          if (sellers.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #9ca3af;"><p>No hay vendedores registrados</p></div>';
            return;
          }
          
          container.innerHTML = sellers.map(seller => \`
            <div class="seller-card">
              <div class="seller-header">
                <div class="seller-name">\${seller.name}</div>
                <span class="badge \${seller.status === 'available' ? 'active' : 'inactive'}">
                  \${seller.status === 'available' ? '✅ Activo' : '❌ Inactivo'}
                </span>
              </div>
              <div class="seller-info">ID: \${seller.id}</div>
              <div class="seller-info">Estado: \${seller.status}</div>
              
              <div class="metrics-row">
                <div class="metric-badge">
                  <div class="metric-label">Clientes Asignados</div>
                  <div class="metric-value">\${seller.currentClients || 0}</div>
                </div>
                <div class="metric-badge">
                  <div class="metric-label">Calificación</div>
                  <div class="metric-value">⭐ \${seller.rating ? seller.rating.toFixed(1) : '0.0'}</div>
                </div>
              </div>
              
              <div style="margin-top: 12px;">
                <button class="btn btn-primary" onclick="openEditModal('\${seller.id}', '\${seller.name}')">✏️ Editar</button>
                <button class="btn \${seller.status === 'available' ? 'btn-danger' : 'btn-success'}" onclick="toggleSellerStatus('\${seller.id}', '\${seller.status}')">
                  \${seller.status === 'available' ? '🔴 Desactivar' : '🟢 Activar'}
                </button>
              </div>
            </div>
          \`).join('');
        }
      } catch (error) {
        console.error('Error:', error);
        document.getElementById('sellersList').innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;"><p>Error al cargar vendedores</p></div>';
      }
    }

    async function loadMetrics() {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (data.sellers) {
          const s = data.sellers;
          const html = \`
            <div class="notification">
              📢 El sistema notificará a los vendedores cada 30 minutos. Si el bot no puede atender, se notificará manualmente.
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #667eea;">\${s.totalSellers || 0}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Total de Vendedores</div>
              </div>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #10b981;">\${s.activeSellers || 0}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Vendedores Activos</div>
              </div>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">\${s.totalAssignments || 0}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Asignaciones Totales</div>
              </div>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #8b5cf6;">\${s.activeConversations || 0}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Conversaciones Activas</div>
              </div>
            </div>
          \`;
          document.getElementById('metricsContent').innerHTML = html;
        }
      } catch (error) {
        console.error('Error:', error);
        document.getElementById('metricsContent').innerHTML = '<p style="color: #ef4444;">Error al cargar métricas</p>';
      }
    }

    function switchTab(tab) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
      document.getElementById(tab + '-tab').classList.add('active');
      event.target.classList.add('active');
      
      if (tab === 'metrics') {
        loadMetrics();
      }
    }

    function openEditModal(sellerId, sellerName) {
      currentSellerId = sellerId;
      document.getElementById('sellerName').value = sellerName;
      document.getElementById('editModal').classList.add('active');
    }

    function closeModal() {
      document.getElementById('editModal').classList.remove('active');
    }

    function toggleStatus() {
      const sw = document.getElementById('statusSwitch');
      sw.classList.toggle('active');
      currentSellerStatus = sw.classList.contains('active');
    }

    async function saveSeller(e) {
      e.preventDefault();
      const name = document.getElementById('sellerName').value;
      const email = document.getElementById('sellerEmail').value;
      const phone = document.getElementById('sellerPhone').value;
      const specialty = document.getElementById('sellerSpecialty').value;
      const interval = document.getElementById('notificationInterval').value;
      
      alert(\`✅ Vendedor actualizado:\\n- Nombre: \${name}\\n- Email: \${email}\\n- Teléfono: \${phone}\\n- Notificación cada: \${interval} minutos\`);
      closeModal();
      loadSellers();
    }

    async function toggleSellerStatus(sellerId, currentStatus) {
      const newStatus = currentStatus === 'available' ? 'inactive' : 'active';
      alert(\`✅ Vendedor \${newStatus === 'active' ? 'ACTIVADO' : 'DESACTIVADO'}\`);
      loadSellers();
    }

    function logout() {
      if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    loadSellers();
    setInterval(loadSellers, 30000);
  </script>
</body>
</html>\`;
        res.send(html);
    });

    // GET /seller-availability - Página de disponibilidad
    app.get('/seller-availability', (req, res) => {
        const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Disponibilidad - Cocolu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f3f4f6; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 24px; display: flex; justify-content: space-between; }
    .header h1 { font-size: 22px; }
    .logout-btn { background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 999px; cursor: pointer; }
    .container { display: grid; grid-template-columns: 250px 1fr; min-height: calc(100vh - 60px); }
    .sidebar { background: white; border-right: 1px solid #e0e0e0; padding: 20px; overflow-y: auto; max-height: calc(100vh - 60px); }
    .sidebar h3 { font-size: 11px; color: #9ca3af; text-transform: uppercase; margin-bottom: 12px; margin-top: 18px; }
    .nav-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; color: #374151; text-decoration: none; border-radius: 8px; font-size: 14px; margin-bottom: 4px; border-left: 3px solid transparent; }
    .nav-item:hover { background: #eef2ff; border-left-color: #818cf8; }
    .nav-item.active { background: #eef2ff; border-left-color: #4f46e5; color: #111827; font-weight: 600; }
    .main { padding: 28px; overflow-y: auto; max-height: calc(100vh - 60px); }
    .card { background: white; border-radius: 10px; padding: 24px; box-shadow: 0 10px 25px rgba(15,23,42,0.06); }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin: 20px 0; }
    .summary-item { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; border-radius: 8px; text-align: center; }
    .summary-value { font-size: 24px; font-weight: 700; }
    .summary-label { font-size: 12px; opacity: 0.9; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⏰ Disponibilidad</h1>
    <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
  </div>

  <div class="container">
    <div class="sidebar">
      <h3>📊 Principal</h3>
      <a href="/dashboard" class="nav-item">🏠 Dashboard</a>
      
      <h3>👥 Vendedores</h3>
      <a href="/sellers" class="nav-item">👥 Gestión</a>
      <a href="/seller-availability" class="nav-item active">⏰ Disponibilidad</a>
      
      <h3>🌐 Meta</h3>
      <a href="/meta-settings" class="nav-item">⚙️ Config Meta</a>
      <a href="/meta-diagnostics" class="nav-item">🧪 Diagnóstico</a>
    </div>

    <div class="main">
      <div class="card">
        <h2>⏰ Disponibilidad en Tiempo Real</h2>
        <p style="color: #666; margin: 15px 0;">Estado actual de disponibilidad de vendedores</p>
        
        <div class="summary-grid" id="summaryGrid">
          <div class="summary-item">
            <div class="summary-value">-</div>
            <div class="summary-label">Total</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">-</div>
            <div class="summary-label">Trabajando</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">-</div>
            <div class="summary-label">Disponibles</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">-</div>
            <div class="summary-label">Offline</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    function logout() {
      if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  </script>
</body>
</html>\`;
        res.send(html);
    });
};

export default setupSellersManagementRoutes;
