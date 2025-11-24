import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import './App.css';

// Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TypographyProvider } from './contexts/TypographyContext';

// Componentes base
import PrivateRoute from './components/PrivateRoute';
import { Can, RoleBadge } from './components/auth';
import ThemeSelector from './components/ThemeSelector';
import FontSelector from './components/FontSelector';
import ErrorBoundary from './components/ErrorBoundary';
import RouteLogger from './components/RouteLogger';

// Páginas - Lazy loading para code splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Sellers = lazy(() => import('./pages/Sellers'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Orders = lazy(() => import('./pages/Orders'));
const Products = lazy(() => import('./pages/Products'));
const Users = lazy(() => import('./pages/Users'));
const Roles = lazy(() => import('./pages/Roles'));
const BotsWrapper = lazy(() => import('./pages/BotsWrapper'));
const Settings = lazy(() => import('./pages/Settings'));
const SellerAvailability = lazy(() => import('./pages/SellerAvailability'));

// Nuevas páginas Meta/WhatsApp
const Messages = lazy(() => import('./pages/Messages'));
const MetaSetup = lazy(() => import('./pages/MetaSetup'));
const Connection = lazy(() => import('./pages/Connection'));
const MetaDiagnostics = lazy(() => import('./pages/MetaDiagnostics'));
const MetaBilling = lazy(() => import('./pages/MetaBilling'));
const Health = lazy(() => import('./pages/Health'));
const Adapters = lazy(() => import('./pages/Adapters'));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Cargando...</p>
    </div>
  );
}

// Layout autenticado
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
            <ThemeSelector />
            <div className="user-info">
              <span className="user-role">Hola, <strong>{user?.username || 'admin'}</strong></span>
              <RoleBadge role={user?.role || 'admin'} />
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="app-nav">
        <Link
          to="/dashboard"
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          🏠 Dashboard
        </Link>

        {/* WhatsApp Section */}
        <div className="nav-divider">WhatsApp</div>
        <Link
          to="/messages"
          className={activeTab === 'messages' ? 'active' : ''}
          onClick={() => setActiveTab('messages')}
        >
          💬 Mensajes
        </Link>
        <Link
          to="/connection"
          className={activeTab === 'connection' ? 'active' : ''}
          onClick={() => setActiveTab('connection')}
        >
          📲 Conexión
        </Link>
        <Link
          to="/adapters"
          className={activeTab === 'adapters' ? 'active' : ''}
          onClick={() => setActiveTab('adapters')}
        >
          🔌 Adaptadores
        </Link>

        {/* Meta Section */}
        <div className="nav-divider">Meta Business</div>
        <Link
          to="/meta-setup"
          className={activeTab === 'meta-setup' ? 'active' : ''}
          onClick={() => setActiveTab('meta-setup')}
        >
          🌐 Configuración
        </Link>
        <Link
          to="/meta-diagnostics"
          className={activeTab === 'meta-diagnostics' ? 'active' : ''}
          onClick={() => setActiveTab('meta-diagnostics')}
        >
          🧪 Diagnóstico
        </Link>
        <Link
          to="/meta-billing"
          className={activeTab === 'meta-billing' ? 'active' : ''}
          onClick={() => setActiveTab('meta-billing')}
        >
          💰 Facturación
        </Link>

        {/* Business Section */}
        <div className="nav-divider">Negocio</div>
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

        {/* Admin Section */}
        <Can permission="users.view">
          <div className="nav-divider">Administración</div>
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

        {/* System Section */}
        <div className="nav-divider">Sistema</div>
        <Link
          to="/health"
          className={activeTab === 'health' ? 'active' : ''}
          onClick={() => setActiveTab('health')}
        >
          ❤️ Salud
        </Link>
        <Link
          to="/settings"
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </Link>
      </nav>
    </>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TypographyProvider>
            <AuthProvider>
              <Router>
                <RouteLogger />
                <div className="app-container">
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/login" element={<Login />} />

                      {/* Protected routes */}
                      <Route
                        path="/*"
                        element={
                          <PrivateRoute>
                            <AuthenticatedLayout activeTab={activeTab} setActiveTab={setActiveTab} />
                            <main className="app-main">
                              <Routes>
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                <Route path="/dashboard" element={<Dashboard />} />

                                {/* WhatsApp routes */}
                                <Route path="/messages" element={<Messages />} />
                                <Route path="/connection" element={<Connection />} />
                                <Route path="/adapters" element={<Adapters />} />

                                {/* Meta routes */}
                                <Route path="/meta-setup" element={<MetaSetup />} />
                                <Route path="/meta-diagnostics" element={<MetaDiagnostics />} />
                                <Route path="/meta-billing" element={<MetaBilling />} />

                                {/* Business routes */}
                                <Route path="/sellers" element={<Sellers />} />
                                <Route path="/seller-availability" element={<SellerAvailability />} />
                                <Route path="/analytics" element={<Analytics />} />
                                <Route path="/orders" element={<Orders />} />
                                <Route path="/products" element={<Products />} />

                                {/* Admin routes */}
                                <Route path="/users" element={<Users />} />
                                <Route path="/roles" element={<Roles />} />
                                <Route path="/bots" element={<BotsWrapper />} />

                                {/* System routes */}
                                <Route path="/health" element={<Health />} />
                                <Route path="/settings" element={<Settings />} />
                              </Routes>
                            </main>
                          </PrivateRoute>
                        }
                      />
                    </Routes>
                  </Suspense>
                </div>

                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#4ade80',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </Router>
            </AuthProvider>
          </TypographyProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
