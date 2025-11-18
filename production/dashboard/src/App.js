import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

// Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TypographyProvider } from './contexts/TypographyContext';

// Componentes
import PrivateRoute from './components/PrivateRoute';
import { Can, RoleBadge } from './components/auth';
import ThemeSelector from './components/ThemeSelector';
import FontSelector from './components/FontSelector';
import ErrorBoundary from './components/ErrorBoundary';
import RouteLogger from './components/RouteLogger';
import LogViewer from './components/LogViewer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sellers from './pages/Sellers';
import Analytics from './pages/Analytics';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Users from './pages/Users';
import Roles from './pages/Roles';
import BotsWrapper from './pages/BotsWrapper';
import Settings from './pages/Settings';
import SellerAvailability from './pages/SellerAvailability';

// Componente de layout autenticado
function AuthenticatedLayout({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
    }
  };

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>🤖 Cocolu Ventas</h1>
            <span className="powered-by">Powered by <strong>Ember Drago</strong></span>
          </div>
          <div className="header-stats">
            <FontSelector className="mr-2" />
            <ThemeSelector className="mr-4" />
            <div className="stat-badge">
              <span className="stat-label">Estado</span>
              <span className="stat-value online">● Online</span>
            </div>
            <div className="stat-badge">
              <span className="stat-label">Usuario</span>
              <span className="stat-value">{user?.name || user?.email}</span>
            </div>
            <div className="stat-badge">
              <RoleBadge role={user?.role} size="sm" />
            </div>
            <button 
              onClick={handleLogout}
              className="logout-btn"
              style={{
                marginLeft: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="app-nav">
        <Link 
          to="/" 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </Link>
        <Link 
          to="/sellers" 
          className={activeTab === 'sellers' ? 'active' : ''}
          onClick={() => setActiveTab('sellers')}
        >
          👥 Vendedores
        </Link>
        <Link 
          to="/seller-availability" 
          className={activeTab === 'seller-availability' ? 'active' : ''}
          onClick={() => setActiveTab('seller-availability')}
        >
          ⏰ Disponibilidad
        </Link>
        <Link 
          to="/analytics" 
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </Link>
        <Link 
          to="/orders" 
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Pedidos
        </Link>
        <Link 
          to="/products" 
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          📦 Productos
        </Link>
        <Can permission="users.view">
          <Link 
            to="/users" 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 Usuarios
          </Link>
        </Can>
        <Can permission="users.roles">
          <Link 
            to="/roles" 
            className={activeTab === 'roles' ? 'active' : ''}
            onClick={() => setActiveTab('roles')}
          >
            🎭 Roles
          </Link>
        </Can>
        <Can permission="bots.view">
          <Link 
            to="/bots" 
            className={activeTab === 'bots' ? 'active' : ''}
            onClick={() => setActiveTab('bots')}
          >
            🤖 Bots
          </Link>
        </Can>
        
        <h3 style={{marginTop: '20px', marginBottom: '12px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase'}}>Meta WhatsApp</h3>
        <a 
          href="/meta-settings" 
          className={activeTab === 'meta-settings' ? 'active' : ''}
          onClick={() => setActiveTab('meta-settings')}
          target="_self"
          style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', color: '#374151', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', transition: 'all 0.2s', marginBottom: '4px', borderLeft: '3px solid transparent'}}
          onMouseOver={(e) => {e.target.style.background = '#eef2ff'; e.target.style.borderLeftColor = '#818cf8';}}
          onMouseOut={(e) => {e.target.style.background = 'transparent'; e.target.style.borderLeftColor = 'transparent';}}
        >
          ⚙️ Configurar Credenciales
        </a>
        <a 
          href="/meta-diagnostics" 
          className={activeTab === 'meta-diagnostics' ? 'active' : ''}
          onClick={() => setActiveTab('meta-diagnostics')}
          target="_self"
          style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', color: '#374151', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', transition: 'all 0.2s', marginBottom: '4px', borderLeft: '3px solid transparent'}}
          onMouseOver={(e) => {e.target.style.background = '#eef2ff'; e.target.style.borderLeftColor = '#818cf8';}}
          onMouseOut={(e) => {e.target.style.background = 'transparent'; e.target.style.borderLeftColor = 'transparent';}}
        >
          🧪 Probar Mensajes
        </a>
        
        <h3 style={{marginTop: '20px', marginBottom: '12px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase'}}>Sistema</h3>
        <Link 
          to="/settings" 
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Configuración
        </Link>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sellers" element={<Sellers />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/users" element={<Users />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/bots" element={<BotsWrapper />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/seller-availability" element={<SellerAvailability />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2025 Ember Drago - Agencia de Tecnología | Chatbot Cocolu Ventas v1.0.0</p>
      </footer>
    </>
  );
}

// Componente interno que usa useAuth
function AppRoutes({ activeTab, setActiveTab }) {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta pública - Login */}
      <Route path="/login" element={<Login />} />
      
      {/* Ruta raíz - Redirige a /dashboard */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      {/* Ruta principal del dashboard - ÚNICA RUTA DEL DASHBOARD */}
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? (
            <ErrorBoundary>
              <PrivateRoute>
                <div className="app">
                  <ErrorBoundary>
                    <AuthenticatedLayout activeTab={activeTab} setActiveTab={setActiveTab} />
                  </ErrorBoundary>
                </div>
              </PrivateRoute>
            </ErrorBoundary>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      {/* Rutas protegidas dentro del dashboard - /dashboard/* */}
      <Route 
        path="/dashboard/*" 
        element={
          isAuthenticated ? (
            <ErrorBoundary>
              <PrivateRoute>
                <div className="app">
                  <ErrorBoundary>
                    <AuthenticatedLayout activeTab={activeTab} setActiveTab={setActiveTab} />
                  </ErrorBoundary>
                </div>
              </PrivateRoute>
            </ErrorBoundary>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      {/* Catch-all - Redirige a /dashboard */}
      <Route 
        path="/*" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  console.log('🚀 [APP] Inicializando aplicación...');

  return (
    <ErrorBoundary>
      <TypographyProvider>
        <ThemeProvider>
          <AuthProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              {/* Logging de rutas */}
              <RouteLogger />
              
              {/* Componente que usa useAuth */}
              <AppRoutes activeTab={activeTab} setActiveTab={setActiveTab} />
              
              {/* Log Viewer Global - Disponible en todas las páginas */}
              <LogViewer />
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </TypographyProvider>
    </ErrorBoundary>
  );
}

export default App;
