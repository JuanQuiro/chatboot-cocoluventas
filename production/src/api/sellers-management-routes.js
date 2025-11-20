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
header { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; position: relative; z-index: 1000; }
.hamburger-btn { display: flex; background: rgba(255,255,255,0.2); border: none; border-radius: 8px; padding: 10px; cursor: pointer; transition: all 0.3s; backdrop-filter: blur(10px); }
.hamburger-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.05); }
.hamburger-btn:active { transform: scale(0.95); }
.hamburger-icon { display: flex; flex-direction: column; gap: 4px; width: 24px; }
.hamburger-line { width: 100%; height: 3px; background: white; border-radius: 2px; transition: all 0.3s; }
.hamburger-btn.active .hamburger-line:nth-child(1) { transform: rotate(45deg) translateY(10px); }
.hamburger-btn.active .hamburger-line:nth-child(2) { opacity: 0; }
.hamburger-btn.active .hamburger-line:nth-child(3) { transform: rotate(-45deg) translateY(-10px); }
.container { display: grid; grid-template-columns: 250px 1fr; flex: 1; overflow: hidden; position: relative; transition: grid-template-columns 0.3s; }
.container.sidebar-collapsed { grid-template-columns: 70px 1fr; }
.sidebar { background: white; border-right: 1px solid #e0e0e0; padding: 20px; overflow-y: auto; overflow-x: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); width: 250px; }
.sidebar.collapsed { width: 70px; padding: 20px 10px; }
.sidebar.collapsed h3 { opacity: 0; height: 0; margin: 0; overflow: hidden; }
.sidebar.collapsed .nav-item span:not(.nav-icon) { opacity: 0; width: 0; overflow: hidden; }
.sidebar.collapsed .nav-item { justify-content: center; padding: 10px; }
.sidebar-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 998; backdrop-filter: blur(2px); opacity: 0; transition: opacity 0.3s; }
.sidebar-overlay.active { opacity: 1; }
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .sellers-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .container { grid-template-columns: 1fr !important; }
  .container.sidebar-collapsed { grid-template-columns: 1fr !important; }
  .sidebar { position: fixed; left: 0; top: 68px; bottom: 0; width: 280px; transform: translateX(-100%); z-index: 999; box-shadow: 4px 0 12px rgba(0,0,0,0.15); }
  .sidebar.active { transform: translateX(0); width: 280px; }
  .sidebar.collapsed { width: 280px; }
  .sidebar-overlay { display: block; }
  .main { padding: 16px; }
  header { padding: 16px; }
  header h1 { font-size: 18px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .stat-card { padding: 16px; }
  .stat-value { font-size: 24px; }
  .card { padding: 16px; }
  .sellers-grid { grid-template-columns: 1fr; }
  .modal-content { width: 95%; max-width: none; margin: 10px; padding: 16px; max-height: 90vh; overflow-y: auto; }
}
@media (max-width: 480px) {
  header h1 { font-size: 16px; }
  .stats-grid { grid-template-columns: 1fr; gap: 10px; }
  .stat-value { font-size: 20px; }
  .seller-card { padding: 16px; }
  .seller-name { font-size: 16px; }
  .btn { padding: 8px 12px; font-size: 13px; }
  .modal-content { width: 100%; margin: 0; border-radius: 0; height: 100vh; max-height: 100vh; }
  .form-section-title { font-size: 12px; }
}
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
.form-section { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0; }
.form-section-title { font-size: 14px; font-weight: 700; color: #667eea; text-transform: uppercase; margin-bottom: 16px; letter-spacing: 0.5px; }
.fab-button { position: fixed; bottom: 32px; right: 32px; width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); box-shadow: 0 8px 20px rgba(102,126,234,0.4); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; z-index: 100; border: none; color: white; font-size: 32px; }
.fab-button:hover { transform: scale(1.1) rotate(90deg); box-shadow: 0 12px 28px rgba(102,126,234,0.6); }
.fab-button:active { transform: scale(0.95); }
.search-filter-bar { background: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.search-row { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.search-input { flex: 2; min-width: 250px; padding: 12px 16px 12px 44px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: all 0.2s; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>') no-repeat 12px center; }
.search-input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
.filter-select { flex: 1; min-width: 180px; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; cursor: pointer; transition: all 0.2s; background: white; }
.filter-select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
.btn-clear-filters { padding: 12px 20px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; }
.btn-clear-filters:hover { background: #e5e7eb; }
.results-count { font-size: 14px; color: #6b7280; font-weight: 500; }
.confirm-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 2000; opacity: 0; transition: opacity 0.3s; }
.confirm-modal.active { display: flex; opacity: 1; }
.confirm-content { background: white; border-radius: 16px; padding: 32px; max-width: 450px; width: 90%; box-shadow: 0 24px 48px rgba(0,0,0,0.2); border-top: 4px solid #ef4444; animation: slideDown 0.3s ease; }
@keyframes slideDown { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.confirm-icon { width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; }
.confirm-title { font-size: 22px; font-weight: 700; color: #111827; text-align: center; margin-bottom: 12px; }
.confirm-message { font-size: 15px; color: #6b7280; text-align: center; margin-bottom: 28px; line-height: 1.6; }
.confirm-actions { display: flex; gap: 12px; }
.btn-cancel { flex: 1; padding: 12px; border: 2px solid #e5e7eb; background: white; color: #374151; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; }
.btn-cancel:hover { background: #f3f4f6; border-color: #d1d5db; }
.btn-delete { flex: 1; padding: 12px; border: none; background: #ef4444; color: white; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; }
.btn-delete:hover { background: #dc2626; }
.btn-delete:disabled { opacity: 0.6; cursor: not-allowed; }
.toast-container { position: fixed; top: 20px; right: 20px; z-index: 3000; display: flex; flex-direction: column; gap: 12px; }
.toast { background: white; padding: 16px 20px; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 12px; min-width: 280px; border-left: 4px solid #10b981; animation: slideIn 0.3s ease; }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.toast.success { border-left-color: #10b981; }
.toast.error { border-left-color: #ef4444; }
.toast.warning { border-left-color: #f59e0b; }
.toast-icon { font-size: 20px; }
.toast-message { flex: 1; font-size: 14px; font-weight: 500; color: #111827; }
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.5; }
.empty-title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 8px; }
.empty-text { font-size: 14px; color: #6b7280; }
.skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
@keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.form-error { color: #ef4444; font-size: 12px; margin-top: 4px; display: none; }
.form-error.active { display: block; }
.form-input.error { border-color: #ef4444; }
.btn-success { background: #10b981; color: white; }
.btn-success:hover { background: #059669; }
.loading-spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 768px) { .fab-button { bottom: 24px; right: 24px; width: 56px; height: 56px; font-size: 28px; } .search-row { flex-direction: column; } .search-input, .filter-select { min-width: 100%; } }
</style>
</head>
<body>
<header>
  <div style="display: flex; align-items: center; gap: 16px;">
    <button class="hamburger-btn" id="hamburgerBtn" onclick="toggleSidebar()">
      <div class="hamburger-icon">
        <div class="hamburger-line"></div>
        <div class="hamburger-line"></div>
        <div class="hamburger-line"></div>
      </div>
    </button>
    <h1>👥 Gestión de Vendedores</h1>
  </div>
  <button class="btn-logout" onclick="logout()">Cerrar Sesión</button>
</header>

<div class="container">
  <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>
  <div class="sidebar" id="sidebar">
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
      
      <!-- Barra de Búsqueda y Filtros -->
      <div class="search-filter-bar">
        <div class="search-row">
          <input type="text" id="searchInput" class="search-input" placeholder="Buscar por nombre, email o ID...">
          <select id="filterStatus" class="filter-select">
            <option value="all">Todos los estados</option>
            <option value="available">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <select id="filterSpecialty" class="filter-select">
            <option value="all">Todas las especialidades</option>
            <option value="Premium">Premium</option>
            <option value="General">General</option>
            <option value="Technical">Technical</option>
            <option value="VIP">VIP</option>
          </select>
          <button class="btn-clear-filters" onclick="clearFilters()">Limpiar Filtros</button>
        </div>
        <div class="results-count" id="resultsCount">Cargando...</div>
      </div>
      
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
    
    <div class="form-section">
      <div class="form-section-title">📋 Información Básica</div>
      <div class="form-group">
        <label class="form-label">Nombre</label>
        <input type="text" id="sellerName" class="form-input" required>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="sellerEmail" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Teléfono</label>
          <input type="tel" id="sellerPhone" class="form-input">
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">💼 Información Profesional</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="form-group">
          <label class="form-label">Especialidad</label>
          <input type="text" id="sellerSpecialty" class="form-input" placeholder="ej: Premium, General">
        </div>
        <div class="form-group">
          <label class="form-label">Máx. Clientes</label>
          <input type="number" id="maxClients" class="form-input" value="10" min="1">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Notas</label>
        <textarea id="sellerNotes" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px;min-height:60px;"></textarea>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-title">⏰ Horario</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="form-group">
          <label class="form-label">Hora Inicio</label>
          <input type="time" id="workStart" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Hora Fin</label>
          <input type="time" id="workEnd" class="form-input">
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
      <button type="button" class="btn btn-primary" onclick="saveSeller()">✅ Guardar</button>
      <button type="button" class="btn btn-danger" onclick="closeModal()">❌ Cancelar</button>
    </div>
  </div>
</div>

<!-- Modal de Confirmación Eliminación -->
<div id="confirmModal" class="confirm-modal">
  <div class="confirm-content">
    <div class="confirm-icon">⚠️</div>
    <h3 class="confirm-title">¿Eliminar Vendedor?</h3>
    <p class="confirm-message">Esta acción no se puede deshacer. El vendedor será eliminado permanentemente del sistema.</p>
    <div class="confirm-actions">
      <button class="btn-cancel" onclick="closeConfirmModal()">Cancelar</button>
      <button class="btn-delete" id="confirmDeleteBtn" onclick="confirmDelete()">Eliminar</button>
    </div>
  </div>
</div>

<!-- Botón Flotante Agregar -->
<button class="fab-button" onclick="addNewSeller()" title="Agregar nuevo vendedor">+</button>

<!-- Toast Notifications -->
<div class="toast-container" id="toastContainer"></div>

<script>
let allSellers = [];
let currentSeller = null;
let currentStatus = '';
let searchQuery = '';
let filterStatus = 'all';
let filterSpecialty = 'all';
let sellerToDelete = null;
let isCreating = false;

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
      allSellers = s; // Guardar todos los vendedores
      
      // Actualizar stats
      document.getElementById('s0').textContent = s.length;
      document.getElementById('s1').textContent = s.filter(function(x) { return x.status === 'available'; }).length;
      document.getElementById('s2').textContent = d.sellers?.totalAssignments || 0;
      document.getElementById('s3').textContent = d.sellers?.activeConversations || 0;
      
      // Aplicar filtros y renderizar
      applyFiltersAndRender();
    })
    .catch(function(e) {
      console.error(e);
      showToast('Error cargando vendedores', 'error');
    });
}

function applyFiltersAndRender() {
  let filtered = allSellers;
  
  // Aplicar búsqueda
  if (searchQuery) {
    filtered = filtered.filter(function(x) {
      return x.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (x.email && x.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
             x.id.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }
  
  // Aplicar filtro de estado
  if (filterStatus !== 'all') {
    filtered = filtered.filter(function(x) {
      return x.status === filterStatus;
    });
  }
  
  // Aplicar filtro de especialidad
  if (filterSpecialty !== 'all') {
    filtered = filtered.filter(function(x) {
      return x.specialty === filterSpecialty;
    });
  }
  
  // Actualizar contador
  document.getElementById('resultsCount').textContent = filtered.length + ' vendedor' + (filtered.length !== 1 ? 'es' : '') + ' encontrado' + (filtered.length !== 1 ? 's' : '');
  
  // Renderizar
  renderSellers(filtered);
}

function renderSellers(sellers) {
  const container = document.getElementById('sellers');
  if (sellers.length === 0) {
    container.innerHTML =  
      '<div class="empty-state">' +
        '<div class="empty-icon">📭</div>' +
        '<div class="empty-title">No se encontraron vendedores</div>' +
        '<div class="empty-text">Intenta ajustar los filtros o agregar un nuevo vendedor</div>' +
      '</div>';
    return;
  }
  
  const html = sellers.map(function(x) {
    var statusIcon = x.status === 'available' ? '&#x2705;' : '&#x274C;';
    var statusText = x.status === 'available' ? 'Activo' : 'Inactivo';
    var editIcon = '&#x270F;&#xFE0F;';
    var deleteIcon = '&#x1F5D1;&#xFE0F;';
    var deactivateIcon = '&#x1F534;';
    var activateIcon = '&#x1F7E2;';
    var starIcon = '&#x2B50;';
    
    return '<div class="seller-card">' +
      '<div class="seller-name">' + x.name + '</div>' +
      '<span class="seller-badge ' + (x.status === 'available' ? 'active' : 'inactive') + '">' +
        statusIcon + ' ' + statusText +
      '</span>' +
      '<div class="seller-info">ID: ' + x.id + '</div>' +
      '<div class="seller-info">Rating: ' + starIcon + x.rating.toFixed(1) + '</div>' +
      '<div class="seller-metrics">' +
        '<div class="metric"><div class="metric-value">' + x.currentClients + '</div>Clientes</div>' +
        '<div class="metric"><div class="metric-value">' + Math.round(x.currentClients * 20) + '%</div>Carga</div>' +
      '</div>' +
      '<div class="seller-actions">' +
        '<button class="btn btn-primary" onclick="openEdit(&apos;' + x.id + '&apos;,&apos;' + x.name + '&apos;,&apos;' + x.status + '&apos;)">' + editIcon + ' Editar</button>' +
        '<button class="btn ' + (x.status === 'available' ? 'btn-danger' : 'btn-success') + '" onclick="toggleSellerStatus(&apos;' + x.id + '&apos;,&apos;' + x.status + '&apos;)">' +
          (x.status === 'available' ? deactivateIcon + ' Desactivar' : activateIcon + ' Activar') +
        '</button>' +
        '<button class="btn btn-danger" onclick="deleteSeller(&apos;' + x.id + '&apos;,&apos;' + x.name + '&apos;)">' + deleteIcon + ' Eliminar</button>' +
      '</div>' +
    '</div>';
  }).join('');
  
  container.innerHTML = html;
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
      document.getElementById('sellerSpecialty').value = seller.specialty || '';
      document.getElementById('maxClients').value = seller.maxClients || '10';
      document.getElementById('sellerNotes').value = seller.notes || '';
      document.getElementById('workStart').value = seller.workStart || '';
      document.getElementById('workEnd').value = seller.workEnd || '';
      document.getElementById('editModal').classList.add('active');
    })
    .catch(function(e) {
      console.error(e);
      document.getElementById('sellerName').value = name;
      document.getElementById('sellerEmail').value = '';
      document.getElementById('sellerPhone').value = '';
      document.getElementById('sellerSpecialty').value = '';
      document.getElementById('maxClients').value = '10';
      document.getElementById('sellerNotes').value = '';
      document.getElementById('workStart').value = '';
      document.getElementById('workEnd').value = '';
      document.getElementById('editModal').classList.add('active');
    });
}

function closeModal() {
  document.getElementById('editModal').classList.remove('active');
}

function saveSeller() {
  const name = document.getElementById('sellerName').value.trim();
  const email = document.getElementById('sellerEmail').value.trim() || '';
  const phone = document.getElementById('sellerPhone').value.trim() || '';
  const specialty = document.getElementById('sellerSpecialty').value.trim() || 'General';
  const maxClients = parseInt(document.getElementById('maxClients').value) || 10;
  const notes = document.getElementById('sellerNotes').value.trim() || '';
  const workStart = document.getElementById('workStart').value || '';
  const workEnd = document.getElementById('workEnd').value || '';
  
  // Validación básica
  if (!name) {
    showAlert('El nombre es requerido', 'error', 'modalAlert');
    return;
  }
  
  if (isCreating) {
    // CREAR NUEVO VENDEDOR - USAR ENDPOINT REAL
    const newSeller = {
      name: name,
      email: email || '',
      phone: phone || '',
      specialty: specialty,
      maxClients: maxClients,
      notes: notes,
     workStart: workStart,
      workEnd: workEnd
    };
    
    fetch('/api/sellers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSeller)
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.success) {
        showAlert('✅ Vendedor creado correctamente', 'success', 'modalAlert');
        setTimeout(function() {
          closeModal();
          load(); // Recargar desde el servidor
          showToast('Vendedor ' + name + ' creado exitosamente', 'success');
        }, 1000);
      } else {
        showAlert('Error: ' + (d.error || 'No se pudo crear el vendedor'), 'error', 'modalAlert');
      }
    })
    .catch(function(e) {
      console.error(e);
      showAlert('Error al crear vendedor', 'error', 'modalAlert');
    });
    
  } else {
    // EDITAR VENDEDOR EXISTENTE
    const data = {
      name: name,
      email: email,
      phone: phone,
      specialty: specialty,
      maxClients: maxClients,
      notes: notes,
      workStart: workStart,
      workEnd: workEnd,
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
        showAlert('Vendedor actualizado correctamente', 'success', 'modalAlert');
        setTimeout(function() {
          closeModal();
          load();
        }, 1500);
      } else {
        showAlert('Error: ' + d.error, 'error', 'modalAlert');
      }
    })
    .catch(function(e) {
      console.error(e);
      // Actualizar en array local (fallback)
      const sellerIndex = allSellers.findIndex(function(s) { return s.id === currentSeller; });
      if (sellerIndex !== -1) {
        allSellers[sellerIndex].name = name;
        allSellers[sellerIndex].email = email || 'N/A';
        allSellers[sellerIndex].phone = phone || 'N/A';
        allSellers[sellerIndex].specialty = specialty;
        allSellers[sellerIndex].maxClients = maxClients;
        allSellers[sellerIndex].notes = notes;
        allSellers[sellerIndex].workStart = workStart;
        allSellers[sellerIndex].workEnd = workEnd;
        
        showAlert('✅ Vendedor actualizado (local)', 'success', 'modalAlert');
        setTimeout(function() {
          closeModal();
          applyFiltersAndRender();
          showToast('Vendedor actualizado correctamente', 'success');
        }, 1000);
      } else {
        showAlert('Error al guardar', 'error', 'modalAlert');
      }
    });
  }
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
    showAlert('Vendedor ' + msg, d.success ? 'success' : 'error');
    load();
  })
  .catch(function(e) {
    console.error(e);
    showAlert('Error al cambiar estado', 'error');
    load();
  });
}

// Funciones de Búsqueda y Filtros
document.getElementById('searchInput').addEventListener('input', function(e) {
  searchQuery = e.target.value;
  applyFiltersAndRender();
});

document.getElementById('filterStatus').addEventListener('change', function(e) {
  filterStatus = e.target.value;
  applyFiltersAndRender();
});

document.getElementById('filterSpecialty').addEventListener('change', function(e) {
  filterSpecialty = e.target.value;
  applyFiltersAndRender();
});

function clearFilters() {
  searchQuery = '';
  filterStatus = 'all';
  filterSpecialty = 'all';
  document.getElementById('searchInput').value = '';
  document.getElementById('filterStatus').value = 'all';
  document.getElementById('filterSpecialty').value = 'all';
  applyFiltersAndRender();
}

// Funciones CRUD
function addNewSeller() {
  isCreating = true;
  currentSeller = null;
  document.querySelector('#editModal h2').textContent = '➕ Agregar Nuevo Vendedor';
  document.getElementById('sellerName').value = '';
  document.getElementById('sellerEmail').value = '';
  document.getElementById('sellerPhone').value = '';
  document.getElementById('sellerSpecialty').value = '';
  document.getElementById('maxClients').value = '10';
  document.getElementById('sellerNotes').value = '';
  document.getElementById('workStart').value = '';
  document.getElementById('workEnd').value = '';
  document.getElementById('editModal').classList.add('active');
  setTimeout(function() { document.getElementById('sellerName').focus(); }, 100);
}

function deleteSeller(id, name) {
  sellerToDelete = id;
  document.querySelector('.confirm-message').textContent = '¿Estás seguro de eliminar a ' + name + '? Esta acción no se puede deshacer.';
  document.getElementById('confirmModal').classList.add('active');
}

function confirmDelete() {
  if (!sellerToDelete) return;
  const btn = document.getElementById('confirmDeleteBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span>Eliminando...';
  
  // USAR ENDPOINT REAL
  fetch('/api/sellers/' + sellerToDelete, {
    method: 'DELETE'
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (d.success) {
      closeConfirmModal();
      load(); // Recargar desde servidor
      showToast(d.message || 'Vendedor eliminado correctamente', 'success');
    } else {
      showToast(d.error || 'Error al eliminar vendedor', 'error');
      btn.disabled = false;
      btn.textContent = 'Eliminar';
    }
  })
  .catch(function(e) {
    console.error(e);
    showToast('Error al eliminar vendedor', 'error');
    btn.disabled = false;
    btn.textContent = 'Eliminar';
  });
}

function closeConfirmModal() {
  document.getElementById('confirmModal').classList.remove('active');
  sellerToDelete = null;
  
  // ✅ Resetear el botón de eliminar
  const btn = document.getElementById('confirmDeleteBtn');
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Eliminar';
  }
}

// Toast Notifications
function showToast(message, type) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast ' + (type || 'success');
  
  const icons = { success: '✅', error: ' ❌', warning: '⚠️' };
  toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.success) + '</span>' +
                    '<span class="toast-message">' + message + '</span>';
  
  container.appendChild(toast);
  
  setTimeout(function() {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(function() { container.removeChild(toast); }, 300);
  }, 3000);
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (document.getElementById('editModal').classList.contains('active')) {
      closeModal();
    }
    if (document.getElementById('confirmModal').classList.contains('active')) {
      closeConfirmModal();
    }
  }
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault();
    addNewSeller();
  }
  if (e.ctrlKey && e.key === 'f') {
    e.preventDefault();
    document.getElementById('searchInput').focus();
  }
});


function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburgerBtn');
  const container = document.querySelector('.container');
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // En móvil: toggle sidebar deslizable
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.classList.toggle('active');
  } else {
    // En desktop: collapse/expand sidebar
    sidebar.classList.toggle('collapsed');
    container.classList.toggle('sidebar-collapsed');
    hamburger.classList.toggle('active');
  }
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
