export const setupSellersManagementRoutes = (app) => {
  app.get('/sellers', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gestión de Vendedores - CocoloVentas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --secondary: #8b5cf6;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --bg-dark: #0f172a;
  --bg-surface: #1e293b;
  --bg-surface-light: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --border-color: rgba(255,255,255,0.1);
}

html, body {
  height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg-dark);
  color: var(--text-primary);
  overflow: hidden;
}

.app-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: 100vh;
}

/* Sidebar */
.sidebar {
  background: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
}

.nav-category {
  margin-bottom: 28px;
}

.category-header {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 0 12px 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
  color: var(--primary);
  border: 1px solid rgba(99,102,241,0.3);
}

.nav-icon {
  font-size: 18px;
}

/* Main Content */
.main-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.page-header {
  background wrap var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  padding: 20px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
}

.btn-logout {
  padding: 10px 20px;
  background: rgba(255,255,255,0.1);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(255,255,255,0.15);
  transform: translateY(-

1px);
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  border-color: rgba(99,102,241,0.5);
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
}

/* Sellers Section */
.sellers-section {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 28px;
}

.section-header {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
}

.sellers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

/* Seller Cards */
.seller-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.seller-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 48px rgba(0,0,0,0.4);
  border-color: rgba(99,102,241,0.5);
}

.seller-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
}

.seller-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.seller-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.seller-badge.active {
  background: rgba(16,185,129,0.2);
  color: var(--success);
  border: 1px solid rgba(16,185,129,0.3);
}

.seller-badge.inactive {
  background: rgba(239,68,68,0.2);
  color: var(--danger);
  border: 1px solid rgba(239,68,68,0.3);
}

.seller-info {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.seller-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
}

.metric {
  text-align: center;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.metric-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.seller-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Buttons */
.btn {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99,102,241,0.4);
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239,68,68,0.4);
}

.btn-success {
  background: var(--success);
  color: white;
}

.btn-success:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16,185,129,0.4);
}

/* Modal */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.modal.active {
  display: flex;
}

.modal-content {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.close-btn:hover {
  background: rgba(255,255,255,0.1);
  color: var(--text-primary);
}

/* Form */
.form-section {
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row.full {
  grid-template-columns: 1fr;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-primary);
}

.form-label-optional {
  font-weight: 400;
  color: var(--text-muted);
  font-size: 12px;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  background: rgba(255,255,255,0.08);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 16px 0;
}

.toggle-switch {
  width: 56px;
  height: 32px;
  background: var(--success);
  border-radius: 16px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.toggle-switch.inactive {
  background: var(--danger);
}

.toggle-switch div {
  position: absolute;
  top: 4px;
  left: 28px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 12px;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-switch.inactive div {
  left: 4px;
}

.status-label {
  font-weight: 600;
  color: var(--text-primary);
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.checkbox-item:hover {
  background: rgba(255,255,255,0.05);
}

.checkbox-item input {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.checkbox-item label {
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

/* Alert */
.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-success {
  background: rgba(16,185,129,0.2);
  color: var(--success);
  border: 1px solid rgba(16,185,129,0.3);
}

.alert-error {
  background: rgba(239,68,68,0.2);
  color: var(--danger);
  border: 1px solid rgba(239,68,68,0.3);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .app-container {
    grid-template-columns: 240px 1fr;
  }
  
  .sellers-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .app-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: none;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
</head>
<body>
<div class="app-container">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">🎯 CocoloVentas</div>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-category">
        <div class="category-header">📊 Principal</div>
        <a href="/dashboard" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span>Dashboard</span>
        </a>
      </div>
      
      <div class="nav-category">
        <div class="category-header">💬 Chatbot</div>
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
      </div>
      
      <div class="nav-category">
        <div class="category-header">👥 Vendedores</div>
        <a href="/sellers" class="nav-item active">
          <span class="nav-icon">👥</span>
          <span>Vendedores</span>
        </a>
        <a href="/seller-availability" class="nav-item">
          <span class="nav-icon">⏰</span>
          <span>Disponibilidad</span>
        </a>
      </div>
      
      <div class="nav-category">
        <div class="category-header">⚙️ Configuración</div>
        <a href="/adapters" class="nav-item">
          <span class="nav-icon">🔌</span>
          <span>Adaptadores</span>
        </a>
        <a href="/logs" class="nav-item">
          <span class="nav-icon">📝</span>
          <span>Logs</span>
        </a>
      </div>

      <div class="nav-category">
        <div class="category-header">🌐 Meta</div>
        <a href="/meta-settings" class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span>Config Meta</span>
        </a>
        <a href="/meta-diagnostics" class="nav-item">
          <span class="nav-icon">🧪</span>
          <span>Diagnóstico Meta</span>
        </a>
      </div>
      
      <div class="nav-category">
        <div class="category-header">📈 Monitoreo</div>
        <a href="/health" class="nav-item">
          <span class="nav-icon">❤️</span>
          <span>Salud</span>
        </a>
        <a href="/meta-billing" class="nav-item">
          <span class="nav-icon">💰</span>
          <span>Facturación Meta</span>
        </a>
      </div>
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="main-content">
    <!-- Header -->
    <header class="page-header">
      <h1 class="page-title">👥 Gestión de Vendedores</h1>
      <button class="btn-logout" onclick="logout()">Cerrar Sesión</button>
    </header>

    <!-- Content Area -->
    <div class="content-area">
      <div id="alert"></div>
      
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value" id="s0">-</div>
          <div class="stat-label">Total Vendedores</div>
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

      <!-- Sellers Section -->
      <div class="sellers-section">
        <h2 class="section-header">📋 Lista de Vendedores</h2>
        <div class="sellers-grid" id="sellers">
          <p style="color: var(--text-muted);">Cargando vendedores...</p>
        </div>
      </div>
    </div>
  </main>
</div>

<!-- Edit Modal -->
<div id="editModal" class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-title">✏️ Editar Vendedor</h2>
      <button class="close-btn" onclick="closeModal()">×</button>
    </div>
    
    <div id="modalAlert"></div>
    
    <form onsubmit="return false;">
      <div class="form-section">
        <div class="form-section-title">📋 Información Básica</div>
        <div class="form-row full">
          <div class="form-group">
            <label class="form-label">Nombre <span class="form-label-optional">(requerido)</span></label>
            <input type="text" id="sellerName" class="form-input" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Email <span class="form-label-optional">(opcional)</span></label>
            <input type="email" id="sellerEmail" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Teléfono <span class="form-label-optional">(opcional)</span></label>
            <input type="tel" id="sellerPhone" class="form-input">
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">💼 Información Profesional</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Especialidad <span class="form-label-optional">(opcional)</span></label>
            <input type="text" id="sellerSpecialty" class="form-input" placeholder="ej: Premium, General">
          </div>
          <div class="form-group">
            <label class="form-label">Máx. Clientes <span class="form-label-optional">(opcional)</span></label>
            <input type="number" id="maxClients" class="form-input" value="10" min="1">
          </div>
        </div>
        <div class="form-row full">
          <div class="form-group">
            <label class="form-label">Notas <span class="form-label-optional">(opcional)</span></label>
            <textarea id="sellerNotes" class="form-textarea" placeholder="Notas adicionales..."></textarea>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">⏰ Horario y Disponibilidad</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Hora Inicio</label>
            <input type="time" id="workStart" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Hora Fin</label>
            <input type="time" id="workEnd" class="form-input">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Días de Descanso</label>
          <div class="checkbox-group">
            <label class="checkbox-item"><input type="checkbox" id="dayOff0"> Lunes</label>
            <label class="checkbox-item"><input type="checkbox" id="dayOff1"> Martes</label>
            <label class="checkbox-item"><input type="checkbox" id="dayOff2"> Miércoles</label>
            <label class="checkbox-item"><input type="checkbox" id="dayOff3"> Jueves</label>
            <label class="checkbox-item"><input type="checkbox" id="dayOff4"> Viernes</label>
            <label class="checkbox-item"><input type="checkbox" id="dayOff5"> Sábado</label>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">🔔 Notificaciones y Estado</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Intervalo de Notificación (min)</label>
            <input type="number" id="notificationInterval" class="form-input" value="30" min="5">
          </div>
          <div class="form-group">
            <label class="form-label">Respuesta Promedio (seg)</label>
            <input type="number" id="avgResponse" class="form-input" value="0" min="0">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Estado del Vendedor</label>
          <div class="toggle-container">
            <div id="statusToggle" class="toggle-switch" onclick="toggleStatusSwitch()">
              <div></div>
            </div>
            <span class="status-label" id="statusLabel">Activo</span>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-primary" onclick="saveSeller()">✅ Guardar</button>
        <button type="button" class="btn btn-danger" onclick="closeModal()">❌ Cancelar</button>
      </div>
    </form>
  </div>
</div>

<script>
let currentSeller=null;
let currentStatus='active';

function showAlert(msg,type,target='alert'){
  const alertDiv=document.getElementById(target);
  alertDiv.innerHTML=`< div class= "alert alert-${type}" > ${ type=== 'success' ? '✅' : '❌'} ${ msg }</div > `;
  setTimeout(()=>{alertDiv.innerHTML=''},4000);
}

function load(){
  fetch('/api/health').then(r=>r.json()).then(d=>{
    const s=d.sellers?.sellersStats||[];
    document.getElementById('s0').textContent=s.length;
    document.getElementById('s1').textContent=s.filter(x=>x.status==='available').length;
    document.getElementById('s2').textContent=d.sellers?.totalAssignments||0;
    document.getElementById('s3').textContent=d.sellers?.activeConversations||0;
    
    const html=s.map((x,i)=>`
  < div class= "seller-card" style = "animation-delay: ${i*0.1}s" >
        <div class="seller-header">
          <div class="seller-name">${x.name}</div>
          <span class="seller-badge ${x.status==='available'?'active':'inactive'}">
            ${x.status==='available'?'✅ Activo':'❌ Inactivo'}
          </span>
        </div>
        <div class="seller-info">ID: ${x.id} • Rating: ⭐${x.rating.toFixed(1)}</div>
        <div class="seller-metrics">
          <div class="metric">
            <div class="metric-value">${x.currentClients}</div>
            <div class="metric-label">Clientes</div>
          </div>
          <div class="metric">
            <div class="metric-value">${Math.round((x.currentClients/x.maxClients)*100)}%</div>
            <div class="metric-label">Carga</div>
          </div>
        </div>
        <div class="seller-actions">
          <button class="btn btn-primary" onclick="openEdit('${x.id}','${x.name}','${x.status}')">
            ✏️ Editar
          </button>
          <button class="btn ${x.status==='available'?'btn-danger':'btn-success'}" 
                  onclick="toggleSellerStatus('${x.id}','${x.status}')">
            ${x.status==='available'?'🔴 Desactivar':'🟢 Activar'}
          </button>
        </div>
      </div >
  `).join('');
    
    document.getElementById('sellers').innerHTML=html||'<p style="color: var(--text-muted);">No hay vendedores disponibles</p>';
  }).catch(e=>{
    console.error(e);
    showAlert('Error cargando vendedores','error');
  });
}

function openEdit(id,name,status){
  currentSeller=id;
  currentStatus=status==='available'?'active':'inactive';
  
  fetch(`/ api / sellers / ${ id } `).then(r=>r.json()).then(d=>{
    const seller=d.data;
    document.getElementById('sellerName').value=seller.name||name;
    document.getElementById('sellerEmail').value=seller.email||'';
    document.getElementById('sellerPhone').value=seller.phone||'';
    document.getElementById('sellerSpecialty').value=seller.specialty||'';
    document.getElementById('maxClients').value=seller.maxClients||10;
    document.getElementById('notificationInterval').value=seller.notificationInterval||30;
    document.getElementById('avgResponse').value=seller.avgResponse||0;
    document.getElementById('sellerNotes').value=seller.notes||'';
    document.getElementById('workStart').value=seller.workStart||'';
    document.getElementById('workEnd').value=seller.workEnd||'';
    
    const days=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    for(let i=0;i<6;i++){
      document.getElementById('dayOff'+i).checked=seller.daysOff?.includes(days[i])||false;
    }
    
    updateToggleUI();
    document.getElementById('editModal').classList.add('active');
  }).catch(e=>{
    console.error(e);
    showAlert('Error cargando datos del vendedor','error');
  });
}

function closeModal(){
  document.getElementById('editModal').classList.remove('active');
  document.getElementById('modalAlert').innerHTML='';
}

function toggleStatusSwitch(){
  const toggle=document.getElementById('statusToggle');
  const label=document.getElementById('statusLabel');
  if(currentStatus==='active'){
    currentStatus='inactive';
    toggle.classList.add('inactive');
    label.textContent='Inactivo';
  }else{
    currentStatus='active';
    toggle.classList.remove('inactive');
    label.textContent='Activo';
  }
}

function updateToggleUI(){
  const toggle=document.getElementById('statusToggle');
  const label=document.getElementById('statusLabel');
  if(currentStatus==='active'){
    toggle.classList.remove('inactive');
    label.textContent='Activo';
  }else{
    toggle.classList.add('inactive');
    label.textContent='Inactivo';
  }
}

function saveSeller(){
  const name=document.getElementById('sellerName').value.trim();
  if(!name){
    showAlert('El nombre es requerido','error','modalAlert');
    return;
  }
  
  const email=document.getElementById('sellerEmail').value.trim()||'N/A';
  const phone=document.getElementById('sellerPhone').value.trim()||'N/A';
  const specialty=document.getElementById('sellerSpecialty').value.trim()||'General';
  const maxClients=document.getElementById('maxClients').value||10;
  const avgResponse=document.getElementById('avgResponse').value||0;
  const notes=document.getElementById('sellerNotes').value.trim()||'Sin notas';
  const workStart=document.getElementById('workStart').value||'N/A';
  const workEnd=document.getElementById('workEnd').value||'N/A';
  const notificationInterval=document.getElementById('notificationInterval').value||30;
  
  const daysOff=[];
  const dayNames=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  for(let i=0;i<6;i++){
    if(document.getElementById('dayOff'+i).checked){
      daysOff.push(dayNames[i]);
    }
  }
  
  const data={name,email,phone,specialty,maxClients,avgResponse,notes,workStart,workEnd,notificationInterval,daysOff,status:currentStatus};
  
  fetch(`/ api / seller / ${ currentSeller }/update`,{
method: 'POST',
  headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(data)
  }).then(r => r.json()).then(d => {
  if (d.success) {
    showAlert(`Vendedor ${name} actualizado correctamente`, 'success');
    closeModal();
    setTimeout(load, 500);
  } else {
    showAlert(`Error: ${d.error || 'Desconocido'}`, 'error', 'modalAlert');
  }
}).catch(e => {
  console.error(e);
  showAlert('Error al guardar cambios', 'error', 'modalAlert');
});
}

function toggleSellerStatus(id, status) {
  const newStatus = status === 'available' ? 'inactive' : 'active';
  const msg = status === 'available' ? 'desactivado' : 'activado';

  fetch(`/api/seller/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  }).then(r => r.json()).then(d => {
    showAlert(`Vendedor ${msg} exitosamente`, d.success ? 'success' : 'error');
    setTimeout(load, 500);
  }).catch(e => {
    console.error(e);
    showAlert('Error al cambiar estado', 'error');
  });
}

function logout() {
  window.location.href = '/login';
}

load();
setInterval(load, 30000);
</script ></body ></html > `);
    });
        res.send(`< !DOCTYPE html > <html><head><meta charset="UTF-8"><title>Disponibilidad</title><style>*{margin:0;padding:0;box-sizing:border-box}html,body{height:100%}body{font - family:system-ui;background:#f8fafc;display:flex;flex-direction:column}header{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:20px;display:flex;justify-content:space-between;flex-shrink:0}.container{display:grid;grid-template-columns:260px 1fr;flex:1;overflow:hidden}.sidebar{background:#fff;border-right:1px solid #e0e0e0;padding:20px;overflow-y:auto;flex-shrink:0}.main{padding:28px;overflow-y:auto}.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}.stat-card{background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);border-left:4px solid #667eea}.stat-value{font - size:28px;font-weight:700;color:#667eea}.stat-label{font - size:13px;color:#666}.card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1)}.availability-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;margin-top:20px}.avail-card{border:1px solid #e0e0e0;border-radius:10px;padding:20px}.avail-card:hover{box - shadow:0 8px 16px rgba(0,0,0,0.1)}.seller-name{font - size:18px;font-weight:700;margin-bottom:12px}.status-badge{display:inline-block;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:12px}.status-badge.available{background:#dcfce7;color:#166534}.status-badge.busy{background:#fef3c7;color:#92400e}.status-badge.offline{background:#fee2e2;color:#991b1b}.info-row{display:flex;justify-content:space-between;padding:8px 0;font-size:14px;border-bottom:1px solid #f0f0f0}.nav-item{display:block;padding:10px;color:#475569;text-decoration:none;border-radius:6px;margin-bottom:4px}.nav-item.active{background:#eef2ff;color:#667eea;font-weight:600}</style></head><body><header><h1>⏰ Disponibilidad en Tiempo Real</h1><button onclick="logout()" style="background:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer">Cerrar Sesión</button></header><div class="container"><div class="sidebar"><h3>Menú</h3><a href="/dashboard" class="nav-item">🏠 Dashboard</a><a href="/sellers" class="nav-item">👥 Vendedores</a><a href="/seller-availability" class="nav-item active">⏰ Disponibilidad</a></div><div class="main"><div class="stats-grid"><div class="stat-card"><div class="stat-value" id="t0">-</div><div class="stat-label">Total</div></div><div class="stat-card"><div class="stat-value" id="t1">-</div><div class="stat-label">Disponibles</div></div><div class="stat-card"><div class="stat-value" id="t2">-</div><div class="stat-label">Ocupados</div></div><div class="stat-card"><div class="stat-value" id="t3">-</div><div class="stat-label">Offline</div></div></div><div class="card"><h2>📊 Estado de Vendedores</h2><div class="availability-grid" id="availability"><p>Cargando...</p></div></div></div></div><script>function load(){fetch('/api/health').then(r => r.json()).then(d => { const s = d.sellers?.sellersStats || []; const avail = s.filter(x => x.status === 'available').length; const busy = s.filter(x => x.currentClients > 0).length; const offline = s.filter(x => x.status !== 'available').length; document.getElementById('t0').textContent = s.length; document.getElementById('t1').textContent = avail; document.getElementById('t2').textContent = busy; document.getElementById('t3').textContent = offline; const html = s.map(x => { const st = x.status === 'available' ? 'available' : x.currentClients > 0 ? 'busy' : 'offline'; const txt = st === 'available' ? '✅ Disponible' : st === 'busy' ? '🔴 Ocupado' : '⚫ Offline'; return \`<div class="avail-card"><div class="seller-name">\${x.name}</div><span class="status-badge \${st}">\${txt}</span><div class="info-row"><span>ID</span><span>\${x.id}</span></div><div class="info-row"><span>Clientes</span><span>\${x.currentClients}</span></div><div class="info-row"><span>Rating</span><span>⭐\${x.rating.toFixed(1)}</span></div><div class="info-row"><span>Carga</span><span>\${Math.round(x.currentClients * 20)}%</span></div></div>\`}).join('');document.getElementById('availability').innerHTML=html}).catch(e=>console.error(e))}function logout(){window.location.href = '/login'}load();setInterval(load,30000)</script></body></html>`);
    });
};

export default setupSellersManagementRoutes;
