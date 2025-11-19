export const setupSellersManagementRoutes = (app) => {
    app.get('/sellers', (req, res) => {
        res.send(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gestión de Vendedores - CocoloVentas</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6; display: flex; flex-direction: column; }
header { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.container { display: grid; grid-template-columns: 250px 1fr; flex: 1; overflow: hidden; }
.sidebar { background: white; border-right: 1px solid #e0e0e0; padding: 20px; overflow-y: auto; }
.sidebar h3 { font-size: 11px; color: #9ca3af; text-transform: uppercase; margin-bottom: 12px; margin-top: 18px; }
.sidebar h3:first-child { margin-top: 0; }
.nav-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; color: #374151; text-decoration: none; border-radius: 8px; font-size: 14px; transition: all 0.2s; margin-bottom: 4px; border-left: 3px solid transparent; }
.nav-item:hover { background: #eef2ff; border-left-color: #818cf8; }
.nav-item.active { background: #eef2ff; border-left-color: #4f46e5; color: #111827; font-weight: 600; }
.nav-icon { width: 20px; text-align: center; }
.main { padding: 28px; overflow-y: auto; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.stat-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #667eea; }
.stat-value { font-size: 28px; font-weight: 700; color: #667eea; }
.stat-label { font-size: 13px; color: #666; margin-top: 4px; }
.card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.sellers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
.seller-card { border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; transition: all 0.3s; }
.seller-card:hover { box-shadow: 0 8px 16px rgba(0,0,0,0.1); transform: translateY(-2px); }
.seller-name { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
.seller-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
.seller-badge.active { background: #dcfce7; color: #166534; }
.seller-badge.inactive { background: #fee2e2; color: #991b1b; }
.seller-info { font-size: 14px; color: #666; margin: 8px 0; }
.seller-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 16px 0; padding: 12px; background: #f8fafc; border-radius: 8px; }
.metric { text-align: center; }
.metric-value { font-size: 18px; font-weight: 700; color: #667eea; }
.seller-actions { display: flex; gap: 8px; margin-top: 16px; }
.btn { padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; flex: 1; transition: all 0.2s; }
.btn-primary { background: #667eea; color: #fff; }
.btn-primary:hover { background: #5568d3; }
.btn-danger { background: #ef4444; color: #fff; }
.btn-danger:hover { background: #dc2626; }
.btn-success { background: #10b981; color: #fff; }
.btn-success:hover { background: #059669; }
.btn-logout { background: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; }
.modal.active { display: flex; }
.modal-content { background: #fff; border-radius: 12px; padding: 24px; max-width: 550px; width: 100%; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 2px solid #f0f0f0; padding-bottom: 16px; }
.close-btn { background: none; border: none; font-size: 28px; cursor: pointer; color: #94a3b8; }
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 13px; color: #1e293b; }
.form-input { width: 100%; padding: 10px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; }
.form-input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
.alert { padding: 12px; border-radius: 6px; margin-bottom: 16px; font-weight: 600; }
.alert-success { background: #dcfce7; color: #166534; border-left: 4px solid #10b981; }
.alert-error { background: #fee2e2; color: #991b1b; border-left: 4px solid #ef4444; }
</style>
</head>
<body>
<header>
  <h1>👥 Gestión de Vendedores</h1>
  <button class="btn-logout" onclick="logout()">Cerrar Sesión</button>
</header>

<div class="container">
  <div class="sidebar">
    <h3>📊 Principal</h3>
    <a href="/dashboard" class="nav-item">
      <span class="nav-icon">🏠</span>
      <span>Dashboard</span>
    </a>
    
    <h3>💬 Chatbot</h3>
    <a href="/messages" class="nav-item">
      <span class="nav-icon">💬</span>
      <span>Mensajes</span>
    </a>
    <a href="/analytics" class="nav-item">
      <span class="nav-icon">📊</span>
      <span>Análisis</span>
    </a>
    <a href="/connection" class="nav-item">
      <span class="nav-icon">📲</span>
      <span>Conexión</span>
    </a>
    
    <h3>👥 Vendedores</h3>
    <a href="/sellers" class="nav-item active">
      <span class="nav-icon">👥</span>
      <span>Vendedores</span>
    </a>
    <a href="/seller-availability" class="nav-item">
      <span class="nav-icon">⏰</span>
      <span>Disponibilidad</span>
    </a>
    
    <h3>⚙️ Configuración</h3>
    <a href="/adapters" class="nav-item">
      <span class="nav-icon">🔌</span>
      <span>Adaptadores</span>
    </a>
    <a href="/logs" class="nav-item">
      <span class="nav-icon">📝</span>
      <span>Logs</span>
    </a>

    <h3>🌐 Meta</h3>
    <a href="/meta-settings" class="nav-item">
      <span class="nav-icon">⚙️</span>
      <span>Config Meta</span>
    </a>
    <a href="/meta-diagnostics" class="nav-item">
      <span class="nav-icon">🧪</span>
      <span>Diagnóstico Meta</span>
    </a>
    
    <h3>📈 Monitoreo</h3>
    <a href="/health" class="nav-item">
      <span class="nav-icon">❤️</span>
      <span>Salud</span>
    </a>
    <a href="/meta-billing" class="nav-item">
      <span class="nav-icon">💰</span>
      <span>Facturación Meta</span>
    </a>
  </div>

  <div class="main">
    <div id="alert"></div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value" id="s0">-</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="s1">-</div>
        <div class="stat-label">Activos</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="s2">-</div>
        <div class="stat-label">Asignaciones</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="s3">-</div>
        <div class="stat-label">Conversaciones</div>
      </div>
    </div>

    <div class="card">
      <h2>📋 Lista de Vendedores</h2>
      <div class="sellers-grid" id="sellers">
        <p>Cargando...</p>
      </div>
    </div>
  </div>
</div>

<div id="editModal" class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h2>✏️ Editar Vendedor</h2>
      <button class="close-btn" onclick="closeModal()">×</button>
    </div>
    <div id="modalAlert"></div>
    <div class="form-group">
      <label class="form-label">Nombre</label>
      <input type="text" id="sellerName" class="form-input" required>
    </div>
    <div class="form-group">
      <label class="form-label">Email</label>
      <input type="email" id="sellerEmail" class="form-input">
    </div>
    <div class="form-group">
      <label class="form-label">Teléfono</label>
      <input type="tel" id="sellerPhone" class="form-input">
    </div>
    <div style="display: flex; gap: 12px; margin-top: 24px;">
      <button type="button" class="btn btn-primary" onclick="saveSeller()">✅ Guardar</button>
      <button type="button" class="btn btn-danger" onclick="closeModal()">❌ Cancelar</button>
    </div>
  </div>
</div>

<script>
let currentSeller = null;
let currentStatus = 'active';

function showAlert(msg, type, target) {
  const alertDiv = document.getElementById(target || 'alert');
  alertDiv.innerHTML = '<div class="alert alert-' + type + '">' + msg + '</div>';
  setTimeout(function() { alertDiv.innerHTML = ''; }, 4000);
}

function load() {
  fetch('/api/health')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      const s = d.sellers?.sellersStats || [];
      document.getElementById('s0').textContent = s.length;
      document.getElementById('s1').textContent = s.filter(function(x) { return x.status === 'available'; }).length;
      document.getElementById('s2').textContent = d.sellers?.totalAssignments || 0;
      document.getElementById('s3').textContent = d.sellers?.activeConversations || 0;
      
      const html = s.map(function(x) {
        return '<div class="seller-card">' +
          '<div class="seller-name">' + x.name + '</div>' +
          '<span class="seller-badge ' + (x.status === 'available' ? 'active' : 'inactive') + '">' +
            (x.status === 'available' ? '✅ Activo' : '❌ Inactivo') +
          '</span>' +
          '<div class="seller-info">ID: ' + x.id + '</div>' +
          '<div class="seller-info">Rating: ⭐' + x.rating.toFixed(1) + '</div>' +
          '<div class="seller-metrics">' +
            '<div class="metric"><div class="metric-value">' + x.currentClients + '</div>Clientes</div>' +
            '<div class="metric"><div class="metric-value">' + Math.round(x.currentClients * 20) + '%</div>Carga</div>' +
          '</div>' +
          '<div class="seller-actions">' +
            '<button class="btn btn-primary" onclick="openEdit(\'' + x.id + '\',\'' + x.name + '\',\'' + x.status + '\')">✏️ Editar</button>' +
            '<button class="btn ' + (x.status === 'available' ? 'btn-danger' : 'btn-success') + '" onclick="toggleSellerStatus(\'' + x.id + '\',\'' + x.status + '\')">' +
              (x.status === 'available' ? '🔴 Desactivar' : '🟢 Activar') +
            '</button>' +
          '</div>' +
        '</div>';
      }).join('');
      
      document.getElementById('sellers').innerHTML = html;
    })
    .catch(function(e) {
      console.error(e);
      showAlert('Error cargando vendedores', 'error');
    });
}

function openEdit(id, name, status) {
  currentSeller = id;
  currentStatus = status === 'available' ? 'active' : 'inactive';
  
  fetch('/api/sellers/' + id)
    .then(function(r) { return r.json(); })
    .then(function(d) {
      const seller = d.data;
      document.getElementById('sellerName').value = seller.name || name;
      document.getElementById('sellerEmail').value = seller.email || '';
      document.getElementById('sellerPhone').value = seller.phone || '';
      document.getElementById('editModal').classList.add('active');
    })
    .catch(function(e) {
      console.error(e);
      document.getElementById('sellerName').value = name;
      document.getElementById('sellerEmail').value = '';
      document.getElementById('sellerPhone').value = '';
      document.getElementById('editModal').classList.add('active');
    });
}

function closeModal() {
  document.getElementById('editModal').classList.remove('active');
}

function saveSeller() {
  const name = document.getElementById('sellerName').value.trim();
  const email = document.getElementById('sellerEmail').value.trim() || 'N/A';
  const phone = document.getElementById('sellerPhone').value.trim() || 'N/A';
  
  const data = {
    name: name,
    email: email,
    phone: phone,
    status: currentStatus
  };
  
  fetch('/api/seller/' + currentSeller + '/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (d.success) {
      showAlert('✅ Vendedor actualizado correctamente', 'success', 'modalAlert');
      setTimeout(function() {
        closeModal();
        load();
      }, 1500);
    } else {
      showAlert('❌ Error: ' + d.error, 'error', 'modalAlert');
    }
  })
  .catch(function(e) {
    console.error(e);
    showAlert('Error al guardar', 'error', 'modalAlert');
  });
}

function toggleSellerStatus(id, status) {
  const newStatus = status === 'available' ? 'inactive' : 'active';
  const msg = status === 'available' ? 'DESACTIVADO' : 'ACTIVADO';
  
  fetch('/api/seller/' + id + '/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    showAlert('✅ Vendedor ' + msg, d.success ? 'success' : 'error');
    load();
  })
  .catch(function(e) {
    console.error(e);
    showAlert('Error al cambiar estado', 'error');
    load();
  });
}

function logout() {
  window.location.href = '/login';
}

load();
setInterval(load, 30000);
</script>
</body>
</html>`);
    });

    app.get('/seller-availability', (req, res) => {
        res.send(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Disponibilidad - CocoloVentas</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6; display: flex; flex-direction: column; }
header { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
.container { display: grid; grid-template-columns: 250px 1fr; flex: 1; overflow: hidden; }
.sidebar { background: white; border-right: 1px solid #e0e0e0; padding: 20px; overflow-y: auto; }
.sidebar h3 { font-size: 11px; color: #9ca3af; text-transform: uppercase; margin-bottom: 12px; margin-top: 18px; }
.sidebar h3:first-child { margin-top: 0; }
.nav-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; color: #374151; text-decoration: none; border-radius: 8px; font-size: 14px; transition: all 0.2s; margin-bottom: 4px; border-left: 3px solid transparent; }
.nav-item:hover { background: #eef2ff; border-left-color: #818cf8; }
.nav-item.active { background: #eef2ff; border-left-color: #4f46e5; color: #111827; font-weight: 600; }
.nav-icon { width: 20px; text-align: center; }
.main { padding: 28px; overflow-y: auto; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.stat-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #667eea; }
.stat-value { font-size: 28px; font-weight: 700; color: #667eea; }
.stat-label { font-size: 13px; color: #666; }
.card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.availability-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
.avail-card { border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; }
.avail-card:hover { box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
.seller-name { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
.status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
.status-badge.available { background: #dcfce7; color: #166534; }
.status-badge.busy { background: #fef3c7; color: #92400e; }
.status-badge.offline { background: #fee2e2; color: #991b1b; }
.info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
.btn-logout { background: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
</style>
</head>
<body>
<header>
  <h1>⏰ Disponibilidad en Tiempo Real</h1>
  <button class="btn-logout" onclick="logout()">Cerrar Sesión</button>
</header>

<div class="container">
  <div class="sidebar">
    <h3>📊 Principal</h3>
    <a href="/dashboard" class="nav-item">
      <span class="nav-icon">🏠</span>
      <span>Dashboard</span>
    </a>
    
    <h3>💬 Chatbot</h3>
    <a href="/messages" class="nav-item">
      <span class="nav-icon">💬</span>
      <span>Mensajes</span>
    </a>
    <a href="/analytics" class="nav-item">
      <span class="nav-icon">📊</span>
      <span>Análisis</span>
    </a>
    <a href="/connection" class="nav-item">
      <span class="nav-icon">📲</span>
      <span>Conexión</span>
    </a>
    
    <h3>👥 Vendedores</h3>
    <a href="/sellers" class="nav-item">
      <span class="nav-icon">👥</span>
      <span>Vendedores</span>
    </a>
    <a href="/seller-availability" class="nav-item active">
      <span class="nav-icon">⏰</span>
      <span>Disponibilidad</span>
    </a>
    
    <h3>⚙️ Configuración</h3>
    <a href="/adapters" class="nav-item">
      <span class="nav-icon">🔌</span>
      <span>Adaptadores</span>
    </a>
    <a href="/logs" class="nav-item">
      <span class="nav-icon">📝</span>
      <span>Logs</span>
    </a>

    <h3>🌐 Meta</h3>
    <a href="/meta-settings" class="nav-item">
      <span class="nav-icon">⚙️</span>
      <span>Config Meta</span>
    </a>
    <a href="/meta-diagnostics" class="nav-item">
      <span class="nav-icon">🧪</span>
      <span>Diagnóstico Meta</span>
    </a>
    
    <h3>📈 Monitoreo</h3>
    <a href="/health" class="nav-item">
      <span class="nav-icon">❤️</span>
      <span>Salud</span>
    </a>
    <a href="/meta-billing" class="nav-item">
      <span class="nav-icon">💰</span>
      <span>Facturación Meta</span>
    </a>
  </div>

  <div class="main">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value" id="t0">-</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="t1">-</div>
        <div class="stat-label">Disponibles</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="t2">-</div>
        <div class="stat-label">Ocupados</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="t3">-</div>
        <div class="stat-label">Offline</div>
      </div>
    </div>

    <div class="card">
      <h2>📊 Estado de Vendedores</h2>
      <div class="availability-grid" id="availability">
        <p>Cargando...</p>
      </div>
    </div>
  </div>
</div>

<script>
function load() {
  fetch('/api/health')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      const s = d.sellers?.sellersStats || [];
      const avail = s.filter(function(x) { return x.status === 'available'; }).length;
      const busy = s.filter(function(x) { return x.currentClients > 0; }).length;
      const offline = s.filter(function(x) { return x.status !== 'available'; }).length;
      
      document.getElementById('t0').textContent = s.length;
      document.getElementById('t1').textContent = avail;
      document.getElementById('t2').textContent = busy;
      document.getElementById('t3').textContent = offline;
      
      const html = s.map(function(x) {
        const st = x.status === 'available' ? 'available' : x.currentClients > 0 ? 'busy' : 'offline';
        const txt = st === 'available' ? '✅ Disponible' : st === 'busy' ? '🔴 Ocupado' : '⚫ Offline';
        
        return '<div class="avail-card">' +
          '<div class="seller-name">' + x.name + '</div>' +
          '<span class="status-badge ' + st + '">' + txt + '</span>' +
          '<div class="info-row"><span>ID</span><span>' + x.id + '</span></div>' +
          '<div class="info-row"><span>Clientes</span><span>' + x.currentClients + '</span></div>' +
          '<div class="info-row"><span>Rating</span><span>⭐' + x.rating.toFixed(1) + '</span></div>' +
          '<div class="info-row"><span>Carga</span><span>' + Math.round(x.currentClients * 20) + '%</span></div>' +
        '</div>';
      }).join('');
      
      document.getElementById('availability').innerHTML = html;
    })
    .catch(function(e) {
      console.error(e);
    });
}

function logout() {
  window.location.href = '/login';
}

load();
setInterval(load, 30000);
</script>
</body>
</html>`);
    });
};

export default setupSellersManagementRoutes;
