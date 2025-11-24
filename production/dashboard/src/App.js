import React, { useState, useEffect, Suspense, lazy } from 'react';
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
import ErrorBoundary from './components/ErrorBoundary';
import RouteLogger from './components/RouteLogger';

// Páginas - Lazy loading
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
const Messages = lazy(() => import('./pages/Messages'));
const MetaSetup = lazy(() => import('./pages/MetaSetup'));
const Connection = lazy(() => import('./pages/Connection'));
const MetaDiagnostics = lazy(() => import('./pages/MetaDiagnostics'));
const MetaBilling = lazy(() => import('./pages/MetaBilling'));
const Health = lazy(() => import('./pages/Health'));
const Adapters = lazy(() => import('./pages/Adapters'));

// Loading fallback
function LoadingFallback() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Cargando...</p>
    </div>
  );
}

// Layout con sidebar colapsable (IGUAL AL VIEJO)
function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Cargar estado del sidebar del localStorage
    const collapsed = localStorage.getItem('cocolu_sidebar_collapsed') === '1';
    setSidebarCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    if (newState) {
      localStorage.setItem('cocolu_sidebar_collapsed', '1');
    } else {
      localStorage.removeItem('cocolu_sidebar_collapsed');
    }
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
    }
  };

  return (
    <>
      {/* Header - IGUAL AL VIEJO */}
      <div className="header">
        <div className="header-left">
          <button className="menu-toggle" onClick={toggleSidebar} title="Contraer/expandir menú">
            ☰
          </button>
          <h1>🤖 Cocolu Chatbot</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      <div className={`container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Sidebar - ESTRUCTURA IDÉNTICA AL VIEJO */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <h3>📊 Principal</h3>
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Dashboard</span>
          </Link>

          <h3>💬 Chatbot</h3>
          <Link to="/messages" className="nav-item">
            <span className="nav-icon">💬</span>
            <span className="nav-label">Mensajes</span>
          </Link>
          <Link to="/analytics" className="nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-label">Análisis</span>
          </Link>
          <Link to="/connection" className="nav-item">
            <span className="nav-icon">📲</span>
            <span className="nav-label">Conexión</span>
          </Link>

          <h3>👥 Vendedores</h3>
          <Link to="/sellers" className="nav-item">
            <span className="nav-icon">👥</span>
            <span className="nav-label">Vendedores</span>
          </Link>
          <Link to="/seller-availability" className="nav-item">
            <span className="nav-icon">⏰</span>
            <span className="nav-label">Disponibilidad</span>
          </Link>

          <h3>🛒 Negocio</h3>
          <Link to="/orders" className="nav-item">
            <span className="nav-icon">🛒</span>
            <span className="nav-label">Pedidos</span>
          </Link>
          <Link to="/products" className="nav-item">
            <span className="nav-icon">📦</span>
            <span className="nav-label">Productos</span>
          </Link>

          <h3>⚙️ Configuración</h3>
          <Link to="/adapters" className="nav-item">
            <span className="nav-icon">🔌</span>
            <span className="nav-label">Adaptadores</span>
          </Link>
          <Link to="/bots" className="nav-item">
            <span className="nav-icon">🤖</span>
            <span className="nav-label">Bots</span>
          </Link>
          <Link to="/settings" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </Link>

          <h3>🌐 Meta</h3>
          <Link to="/meta-setup" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Config Meta</span>
          </Link>
          <Link to="/meta-diagnostics" className="nav-item">
            <span className="nav-icon">🧪</span>
            <span className="nav-label">Diagnóstico Meta</span>
          </Link>
          <Link to="/meta-billing" className="nav-item">
            <span className="nav-icon">💰</span>
            <span className="nav-label">Facturación</span>
          </Link>

          <h3>👤 Admin</h3>
          <Link to="/users" className="nav-item">
            <span className="nav-icon">👥</span>
            <span className="nav-label">Usuarios</span>
          </Link>
          <Link to="/roles" className="nav-item">
            <span className="nav-icon">🎭</span>
            <span className="nav-label">Roles</span>
          </Link>

          <h3>🔧 Sistema</h3>
          <Link to="/health" className="nav-item">
            <span className="nav-icon">❤️</span>
            <span className="nav-label">Salud</span>
          </Link>
        </div>

        {/* Main content */}
        <main className="main">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/connection" element={<Connection />} />
              <Route path="/adapters" element={<Adapters />} />
              <Route path="/meta-setup" element={<MetaSetup />} />
              <Route path="/meta-diagnostics" element={<MetaDiagnostics />} />
              <Route path="/meta-billing" element={<MetaBilling />} />
              <Route path="/sellers" element={<Sellers />} />
              <Route path="/seller-availability" element={<SellerAvailability />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/products" element={<Products />} />
              <Route path="/users" element={<Users />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/bots" element={<BotsWrapper />} />
              <Route path="/health" element={<Health />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TypographyProvider>
            <AuthProvider>
              <Router>
                <RouteLogger />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/*"
                    element={
                      <PrivateRoute>
                        <AuthenticatedLayout />
                      </PrivateRoute>
                    }
                  />
                </Routes>

                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      iconTheme: {
                        primary: '#4ade80',
                        secondary: '#fff',
                      },
                    },
                    error: {
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
