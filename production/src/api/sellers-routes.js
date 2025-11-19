/**
 * Sellers Routes - Rutas HTML para páginas de vendedores
 */

export const setupSellersRoutes = (app) => {
    console.log('✅ Sellers HTML routes cargadas');

    // GET /sellers - Página de vendedores
    app.get('/sellers', (req, res) => {
        const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Vendedores - Cocolu Chatbot</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f3f4f6; color: #111827; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.15); }
    .header h1 { font-size: 22px; }
    .logout-btn { background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 999px; cursor: pointer; font-size: 13px; }
    .container { display: grid; grid-template-columns: 250px 1fr; min-height: calc(100vh - 60px); }
    .sidebar { background: white; border-right: 1px solid #e0e0e0; padding: 20px; }
    .sidebar h3 { font-size: 11px; color: #9ca3af; text-transform: uppercase; margin-bottom: 12px; margin-top: 18px; }
    .nav-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; color: #374151; text-decoration: none; border-radius: 8px; font-size: 14px; transition: all 0.2s; margin-bottom: 4px; border-left: 3px solid transparent; }
    .nav-item:hover { background: #eef2ff; border-left-color: #818cf8; }
    .nav-item.active { background: #eef2ff; border-left-color: #4f46e5; color: #111827; font-weight: 600; }
    .main { padding: 28px; }
    .card { background: white; border-radius: 10px; padding: 24px; box-shadow: 0 10px 25px rgba(15,23,42,0.06); }
    .sellers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; margin-top: 20px; }
    .seller-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; transition: all 0.3s; }
    .seller-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .seller-name { font-weight: 600; font-size: 16px; margin-bottom: 8px; }
    .seller-info { font-size: 13px; color: #6b7280; margin: 4px 0; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-top: 8px; }
    .badge.active { background: #d1fae5; color: #065f46; }
    .badge.inactive { background: #fee2e2; color: #7f1d1d; }
  </style>
</head>
<body>
  <div class="header">
    <h1>👥 Vendedores</h1>
    <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
  </div>

  <div class="container">
    <div class="sidebar">
      <h3>📊 Principal</h3>
      <a href="/dashboard" class="nav-item">
        <span>🏠</span>
        <span>Dashboard</span>
      </a>
      
      <h3>👥 Vendedores</h3>
      <a href="/sellers" class="nav-item active">
        <span>👥</span>
        <span>Vendedores</span>
      </a>
      <a href="/seller-availability" class="nav-item">
        <span>⏰</span>
        <span>Disponibilidad</span>
      </a>
      
      <h3>🌐 Meta</h3>
      <a href="/meta-settings" class="nav-item">
        <span>⚙️</span>
        <span>Config Meta</span>
      </a>
      <a href="/meta-diagnostics" class="nav-item">
        <span>🧪</span>
        <span>Diagnóstico Meta</span>
      </a>
    </div>

    <div class="main">
      <div class="card">
        <h2>👥 Gestión de Vendedores</h2>
        <p style="color: #666; margin: 15px 0;">Aquí puedes ver y gestionar todos los vendedores del sistema.</p>
        
        <div class="sellers-grid" id="sellersList">
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #9ca3af;">
            <p>Cargando vendedores...</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
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
              <div class="seller-name">\${seller.name}</div>
              <div class="seller-info">ID: \${seller.id}</div>
              <div class="seller-info">Estado: \${seller.status}</div>
              <div class="seller-info">Clientes: \${seller.currentClients}</div>
              <div class="seller-info">Calificación: ⭐ \${seller.rating}</div>
              <span class="badge \${seller.status === 'available' ? 'active' : 'inactive'}">
                \${seller.status === 'available' ? '✅ Disponible' : '❌ No disponible'}
              </span>
            </div>
          \`).join('');
        }
      } catch (error) {
        console.error('Error cargando vendedores:', error);
        document.getElementById('sellersList').innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;"><p>Error al cargar vendedores</p></div>';
      }
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
</html>`;
        res.send(html);
    });

    // GET /seller-availability - Página de disponibilidad
    app.get('/seller-availability', (req, res) => {
        const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Disponibilidad de Vendedores - Cocolu Chatbot</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f3f4f6; color: #111827; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.15); }
    .header h1 { font-size: 22px; }
    .logout-btn { background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 999px; cursor: pointer; font-size: 13px; }
    .container { display: grid; grid-template-columns: 250px 1fr; min-height: calc(100vh - 60px); }
    .sidebar { background: white; border-right: 1px solid #e0e0e0; padding: 20px; }
    .sidebar h3 { font-size: 11px; color: #9ca3af; text-transform: uppercase; margin-bottom: 12px; margin-top: 18px; }
    .nav-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; color: #374151; text-decoration: none; border-radius: 8px; font-size: 14px; transition: all 0.2s; margin-bottom: 4px; border-left: 3px solid transparent; }
    .nav-item:hover { background: #eef2ff; border-left-color: #818cf8; }
    .nav-item.active { background: #eef2ff; border-left-color: #4f46e5; color: #111827; font-weight: 600; }
    .main { padding: 28px; }
    .card { background: white; border-radius: 10px; padding: 24px; box-shadow: 0 10px 25px rgba(15,23,42,0.06); }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin: 20px 0; }
    .summary-item { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; border-radius: 8px; text-align: center; }
    .summary-value { font-size: 24px; font-weight: 700; }
    .summary-label { font-size: 12px; opacity: 0.9; margin-top: 4px; }
    .availability-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; margin-top: 20px; }
    .availability-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; transition: all 0.3s; }
    .availability-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .seller-name { font-weight: 600; font-size: 16px; margin-bottom: 8px; }
    .seller-info { font-size: 13px; color: #6b7280; margin: 4px 0; }
    .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-top: 8px; }
    .status-working { background: #d1fae5; color: #065f46; }
    .status-available { background: #bfdbfe; color: #1e40af; }
    .status-unavailable { background: #fee2e2; color: #7f1d1d; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⏰ Disponibilidad de Vendedores</h1>
    <button class="logout-btn" onclick="logout()">Cerrar Sesión</button>
  </div>

  <div class="container">
    <div class="sidebar">
      <h3>📊 Principal</h3>
      <a href="/dashboard" class="nav-item">
        <span>🏠</span>
        <span>Dashboard</span>
      </a>
      
      <h3>👥 Vendedores</h3>
      <a href="/sellers" class="nav-item">
        <span>👥</span>
        <span>Vendedores</span>
      </a>
      <a href="/seller-availability" class="nav-item active">
        <span>⏰</span>
        <span>Disponibilidad</span>
      </a>
      
      <h3>🌐 Meta</h3>
      <a href="/meta-settings" class="nav-item">
        <span>⚙️</span>
        <span>Config Meta</span>
      </a>
      <a href="/meta-diagnostics" class="nav-item">
        <span>🧪</span>
        <span>Diagnóstico Meta</span>
      </a>
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
        
        <h3 style="margin-top: 20px; margin-bottom: 12px;">Vendedores Disponibles Ahora</h3>
        <div class="availability-grid" id="availabilityList">
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #9ca3af;">
            <p>Cargando disponibilidad...</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    async function loadAvailability() {
      try {
        const [reportRes, availRes] = await Promise.all([
          fetch('/api/sellers/availability/report'),
          fetch('/api/sellers/available')
        ]);
        
        const report = await reportRes.json();
        const available = await availRes.json();
        
        // Actualizar resumen
        if (report.report) {
          const summaryItems = document.querySelectorAll('.summary-item');
          summaryItems[0].querySelector('.summary-value').textContent = report.report.total || 0;
          summaryItems[1].querySelector('.summary-value').textContent = report.report.workingNow || 0;
          summaryItems[2].querySelector('.summary-value').textContent = report.report.available || 0;
          summaryItems[3].querySelector('.summary-value').textContent = report.report.offline || 0;
        }
        
        // Actualizar lista de disponibles
        if (available.sellers && available.sellers.length > 0) {
          const container = document.getElementById('availabilityList');
          container.innerHTML = available.sellers.map(seller => \`
            <div class="availability-card">
              <div class="seller-name">\${seller.name}</div>
              <div class="seller-info">Especialidad: \${seller.specialty}</div>
              <div class="seller-info">Estado: \${seller.status}</div>
              <div class="seller-info">Carga: \${seller.loadPercentage.toFixed(0)}%</div>
              <div class="seller-info">Calificación: ⭐ \${seller.rating.toFixed(1)}</div>
              <span class="status-badge status-available">✅ Disponible Ahora</span>
            </div>
          \`).join('');
        } else {
          document.getElementById('availabilityList').innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #9ca3af;"><p>No hay vendedores disponibles en este momento</p></div>';
        }
      } catch (error) {
        console.error('Error cargando disponibilidad:', error);
        document.getElementById('availabilityList').innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;"><p>Error al cargar disponibilidad</p></div>';
      }
    }
    
    function logout() {
      if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    loadAvailability();
    setInterval(loadAvailability, 30000);
  </script>
</body>
</html>`;
        res.send(html);
    });
};

export default setupSellersRoutes;
