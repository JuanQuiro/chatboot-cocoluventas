import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import './App.css';

// Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TypographyProvider } from './contexts/TypographyContext';
import { ToastProvider } from './components/common/Toast';

// Componentes base
import PrivateRoute from './components/PrivateRoute';
// FIXED: Import CrearVenta normally to include CSS in main bundle
import CrearVenta from './pages/CrearVenta';
import ErrorBoundary from './components/ErrorBoundary';
import RouteLogger from './components/RouteLogger';

// Páginas - Lazy loading
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Sellers = lazy(() => import('./pages/Sellers'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Orders = lazy(() => import('./pages/Orders'));
const Products = lazy(() => import('./pages/Products'));
const Clients = lazy(() => import('./pages/Clients'));
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

const ListaPedidos = lazy(() => import('./pages/ListaPedidos'));
const Inventario = lazy(() => import('./pages/Inventario'));
const GestionClientes = lazy(() => import('./pages/GestionClientes'));
const CuentasPorCobrar = lazy(() => import('./pages/CuentasPorCobrar'));
const ClientHistory = lazy(() => import('./pages/ClientHistory'));
const CambiarContraseña = lazy(() => import('./pages/CambiarContraseña'));
const EditarPedido = lazy(() => import('./pages/EditarPedido'));
const MovimientosInventario = lazy(() => import('./pages/MovimientosInventario'));
const GestionDeudas = lazy(() => import('./pages/GestionDeudas'));
const Ingresos = lazy(() => import('./pages/Ingresos'));
const Gastos = lazy(() => import('./pages/Gastos'));
const GestionInterna = lazy(() => import('./pages/GestionInterna')); // NEW IMPORT
const Comisiones = lazy(() => import('./pages/Comisiones'));
const Fabricantes = lazy(() => import('./pages/Fabricantes')); // Manufacturers CRUD
const Reportes = lazy(() => import('./pages/Reportes'));
const Configuracion = lazy(() => import('./pages/Configuracion'));
const TasasCambio = lazy(() => import('./pages/Configuracion/TasasCambio')); // NEW IMPORT
const GestionUsuarios = lazy(() => import('./pages/GestionUsuarios'));
const Nomina = lazy(() => import('./pages/Nomina')); // Payroll Module

// Loading fallback
function LoadingFallback() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Cargando...</p>
    </div>
  );
}

// Layout con sidebar colapsable MEJORADO
function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    principal: true,
    chatbot: true,
    ventas: true,
    gestionInterna: true,
    inventario: true,
    clientes: true,
    vendedores: true,
    meta: true,
    admin: true,
    sistema: true
  });

  useEffect(() => {
    // Cargar estado del sidebar del localStorage
    const collapsed = localStorage.getItem('cocolu_sidebar_collapsed') === '1';
    setSidebarCollapsed(collapsed);

    // Cargar secciones expandidas
    const saved = localStorage.getItem('cocolu_sidebar_sections');
    if (saved) {
      try {
        setExpandedSections(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading sidebar sections:', e);
      }
    }
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

  const toggleSection = (section) => {
    if (sidebarCollapsed) return;

    const newState = {
      ...expandedSections,
      [section]: !expandedSections[section]
    };
    setExpandedSections(newState);
    localStorage.setItem('cocolu_sidebar_sections', JSON.stringify(newState));
  };

  const toggleAllSections = () => {
    if (sidebarCollapsed) return;

    // Check if all are expanded
    const allExpanded = Object.values(expandedSections).every(v => v === true);

    // If all expanded, collapse all; otherwise expand all
    const newState = {};
    Object.keys(expandedSections).forEach(key => {
      newState[key] = !allExpanded;
    });

    setExpandedSections(newState);
    localStorage.setItem('cocolu_sidebar_sections', JSON.stringify(newState));
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
    }
  };

  // Determine if section should be expanded (always true when searching)
  const isSectionExpanded = (sectionKey) => {
    if (searchQuery) return true; // Auto-expand all when searching
    return expandedSections[sectionKey] || sidebarCollapsed;
  };

  // Check if nav item matches search query
  const searchMatches = (label) => {
    if (!searchQuery) return true;
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const SectionHeader = ({ icon, title, sectionKey, disabled = false }) => (
    <h3
      className={`${disabled ? 'section-disabled' : ''} ${!sidebarCollapsed ? 'clickable' : ''}`}
      onClick={() => !disabled && toggleSection(sectionKey)}
      style={{ cursor: sidebarCollapsed || disabled ? 'default' : 'pointer' }}
    >
      <span className="section-title">
        {icon} {title}
      </span>
      {!sidebarCollapsed && !disabled && (
        <span className={`section-chevron ${expandedSections[sectionKey] ? 'expanded' : ''}`}>
          ▼
        </span>
      )}
    </h3>
  );

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <button className="menu-toggle" onClick={toggleSidebar} title="Contraer/expandir menú">
            ☰
          </button>
          <h1>Cocolu Chatbot</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      <div className={`container ${sidebarCollapsed ? 'sidebar-collapsed' : ''} `}>
        {/* Sidebar MEJORADO */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} `}>

          {/* Sidebar Controls */}
          {!sidebarCollapsed && (
            <div className="sidebar-controls">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="sidebar-search-input"
                />
                {searchQuery && (
                  <button
                    className="search-clear"
                    onClick={() => setSearchQuery('')}
                    title="Limpiar búsqueda"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                className="toggle-all-btn"
                onClick={toggleAllSections}
                title={Object.values(expandedSections).every(v => v) ? "Contraer todo" : "Expandir todo"}
              >
                {Object.values(expandedSections).every(v => v) ? '⊟' : '⊞'}
              </button>
            </div>
          )}

          {/* Principal */}
          <SectionHeader icon="📊" title="Principal" sectionKey="principal" />
          <div className={`nav-section ${isSectionExpanded('principal') ? 'expanded' : 'collapsed'}`}>
            {searchMatches('Dashboard') && (
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Dashboard">
                <span className="nav-icon">🏠</span>
                <span className="nav-label">Dashboard</span>
              </NavLink>
            )}
          </div>

          {/* Chatbot - DISABLED */}
          {!searchQuery && (
            <>
              <SectionHeader icon="💬" title="Chatbot" sectionKey="chatbot" disabled={true} />
              <div className={`nav-section ${isSectionExpanded('chatbot') ? 'expanded' : 'collapsed'}`}>
                <NavLink to="/messages" className="nav-item disabled" onClick={(e) => e.preventDefault()} data-tooltip="Mensajes">
                  <span className="nav-icon">💬</span>
                  <span className="nav-label">Mensajes</span>
                </NavLink>
                <NavLink to="/analytics" className="nav-item disabled" onClick={(e) => e.preventDefault()} data-tooltip="Análisis">
                  <span className="nav-icon">📊</span>
                  <span className="nav-label">Análisis</span>
                </NavLink>
                <NavLink to="/connection" className="nav-item disabled" onClick={(e) => e.preventDefault()} data-tooltip="Conexión">
                  <span className="nav-icon">📲</span>
                  <span className="nav-label">Conexión</span>
                </NavLink>
              </div>
            </>
          )}

          {/* Ventas */}
          <SectionHeader icon="🛍" title="Ventas" sectionKey="ventas" />
          <div className={`nav-section ${isSectionExpanded('ventas') ? 'expanded' : 'collapsed'}`}>
            {searchMatches('Nueva Venta') && (
              <NavLink to="/crear-venta" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Nueva Venta">
                <span className="nav-icon">➕</span>
                <span className="nav-label">Nueva Venta</span>
              </NavLink>
            )}
            {searchMatches('Pedidos') && (
              <NavLink to="/lista-pedidos" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Pedidos">
                <span className="nav-icon">📋</span>
                <span className="nav-label">Pedidos</span>
              </NavLink>
            )}
            {searchMatches('Cuentas') && (
              <NavLink to="/cuentas-por-cobrar" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Cuentas x Cobrar">
                <span className="nav-icon">💰</span>
                <span className="nav-label">Cuentas x Cobrar</span>
              </NavLink>
            )}
            {searchMatches('Deudas') && (
              <NavLink to="/gestion-deudas" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Gestión Deudas">
                <span className="nav-icon">💳</span>
                <span className="nav-label">Gestión Deudas</span>
              </NavLink>
            )}
            {searchMatches('Reportes') && (
              <NavLink to="/reportes" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Reportes">
                <span className="nav-icon">📊</span>
                <span className="nav-label">Reportes</span>
              </NavLink>
            )}
            {searchMatches('Tasas') && (
              <NavLink to="/config/tasas" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Tasas de Cambio">
                <span className="nav-icon">💵</span>
                <span className="nav-label">Tasas de Cambio</span>
              </NavLink>
            )}
          </div>

          {/* Gestión Interna */}
          <SectionHeader icon="💼" title="Gestión Interna" sectionKey="gestionInterna" />
          <div className={`nav-section ${isSectionExpanded('gestionInterna') ? 'expanded' : 'collapsed'}`}>
            {searchMatches('Resumen') && (
              <NavLink to="/gestion-interna" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Resumen">
                <span className="nav-icon">📊</span>
                <span className="nav-label">Resumen</span>
              </NavLink>
            )}
            {searchMatches('Ingresos') && (
              <NavLink to="/ingresos" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Ingresos">
                <span className="nav-icon">📈</span>
                <span className="nav-label">Ingresos</span>
              </NavLink>
            )}
            {searchMatches('Gastos') && (
              <NavLink to="/gastos" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Gastos (CVP)">
                <span className="nav-icon">💸</span>
                <span className="nav-label">Gastos (CVP)</span>
              </NavLink>
            )}
            {searchMatches('Comisiones') && (
              <NavLink to="/comisiones" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Comisiones">
                <span className="nav-icon">💰</span>
                <span className="nav-label">Comisiones</span>
              </NavLink>
            )}
          </div>

          {/* Inventario */}
          <SectionHeader icon="📦" title="Inventario" sectionKey="inventario" />
          <div className={`nav-section ${isSectionExpanded('inventario') ? 'expanded' : 'collapsed'}`}>
            {searchMatches('Productos') && (
              <NavLink to="/inventario" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Productos">
                <span className="nav-icon">📦</span>
                <span className="nav-label">Productos</span>
              </NavLink>
            )}
            {searchMatches('Movimientos') && (
              <NavLink to="/movimientos-inventario" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Movimientos">
                <span className="nav-icon">📊</span>
                <span className="nav-label">Movimientos</span>
              </NavLink>
            )}
            {searchMatches('Fabricantes') && (
              <NavLink to="/fabricantes" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Fabricantes">
                <span className="nav-icon">🏭</span>
                <span className="nav-label">Fabricantes</span>
              </NavLink>
            )}
          </div>

          {/* Clientes */}
          <SectionHeader icon="👥" title="Clientes" sectionKey="clientes" />
          <div className={`nav-section ${isSectionExpanded('clientes') ? 'expanded' : 'collapsed'}`}>
            {searchMatches('Clientes') && (
              <NavLink to="/gestion-clientes" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Gestión Clientes">
                <span className="nav-icon">👥</span>
                <span className="nav-label">Gestión Clientes</span>
              </NavLink>
            )}
          </div>

          {/* Vendedores */}
          <SectionHeader icon="👥" title="Vendedores" sectionKey="vendedores" />
          <div className={`nav-section ${isSectionExpanded('vendedores') ? 'expanded' : 'collapsed'}`}>
            {searchMatches('Vendedores') && (
              <NavLink to="/sellers" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Lista Vendedores">
                <span className="nav-icon">👥</span>
                <span className="nav-label">Lista Vendedores</span>
              </NavLink>
            )}
            {searchMatches('Nómina') && (
              <NavLink to="/nomina" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Nómina">
                <span className="nav-icon">💸</span>
                <span className="nav-label">Nómina</span>
              </NavLink>
            )}
            {searchMatches('Configuración') && (
              <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Configuración">
                <span className="nav-icon">⚙️</span>
                <span className="nav-label">Configuración</span>
              </NavLink>
            )}
          </div>

          {/* Meta - DISABLED */}
          {!searchQuery && (
            <>
              <SectionHeader icon="🌐" title="Meta" sectionKey="meta" disabled={true} />
              <div className={`nav-section ${isSectionExpanded('meta') ? 'expanded' : 'collapsed'}`}>
                <NavLink to="/meta-setup" className="nav-item disabled" onClick={(e) => e.preventDefault()} data-tooltip="Config Meta">
                  <span className="nav-icon">⚙️</span>
                  <span className="nav-label">Config Meta</span>
                </NavLink>
                <NavLink to="/meta-diagnostics" className="nav-item disabled" onClick={(e) => e.preventDefault()} data-tooltip="Diagnóstico Meta">
                  <span className="nav-icon">🧪</span>
                  <span className="nav-label">Diagnóstico Meta</span>
                </NavLink>
                <NavLink to="/meta-billing" className="nav-item disabled" onClick={(e) => e.preventDefault()} data-tooltip="Facturación">
                  <span className="nav-icon">💰</span>
                  <span className="nav-label">Facturación</span>
                </NavLink>
              </div>
            </>
          )}

          {/* Admin */}
          <SectionHeader icon="👤" title="Admin" sectionKey="admin" />
          <div className={`nav-section ${isSectionExpanded('admin') ? 'expanded' : 'collapsed'}`}>
            {searchMatches('Usuarios') && (
              <NavLink to="/gestion-usuarios" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Usuarios">
                <span className="nav-icon">👥</span>
                <span className="nav-label">Usuarios</span>
              </NavLink>
            )}
            {searchMatches('Configuración') && (
              <NavLink to="/configuracion" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Configuración">
                <span className="nav-icon">⚙️</span>
                <span className="nav-label">Configuración</span>
              </NavLink>
            )}
          </div>

          {/* Sistema */}
          <SectionHeader icon="🔧" title="Sistema" sectionKey="sistema" />
          <div className={`nav-section ${isSectionExpanded('sistema') ? 'expanded' : 'collapsed'}`}>
            {searchMatches('Salud') && (
              <NavLink to="/health" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-tooltip="Salud">
                <span className="nav-icon">❤️</span>
                <span className="nav-label">Salud</span>
              </NavLink>
            )}
          </div>
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
              <Route path="/clients" element={<Clients />} />
              <Route path="/users" element={<Users />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/bots" element={<BotsWrapper />} />
              <Route path="/health" element={<Health />} />
              <Route path="/settings" element={<Settings />} />

              {/* New Sales Routes */}
              <Route path="/crear-venta" element={<CrearVenta />} />
              <Route path="/lista-pedidos" element={<ListaPedidos />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/gestion-clientes" element={<GestionClientes />} />
              <Route path="/cuentas-por-cobrar" element={<CuentasPorCobrar />} />
              <Route path="/clients/:id/history" element={<ClientHistory />} />
              <Route path="/cambiar-contraseña" element={<CambiarContraseña />} />
              <Route path="/editar-pedido/:id" element={<EditarPedido />} />
              <Route path="/movimientos-inventario" element={<MovimientosInventario />} />
              <Route path="/gestion-deudas" element={<GestionDeudas />} />
              <Route path="/ingresos" element={<Ingresos />} />
              <Route path="/gastos" element={<Gastos />} /> {/* NEW ROUTE */}
              <Route path="/gestion-interna" element={<GestionInterna />} /> {/* NEW ROUTE */}
              <Route path="/comisiones" element={<Comisiones />} /> {/* NEW ROUTE */}
              <Route path="/fabricantes" element={<Fabricantes />} /> {/* Manufacturers CRUD */}
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="/config/tasas" element={<TasasCambio />} /> {/* Moved here */}
              <Route path="/nomina" element={<Nomina />} /> {/* Payroll Module */}
              <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
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
            <ToastProvider>
              <AuthProvider>
                <Router>
                  <RouteLogger />
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    {/* New top-level routes */}
                    <Route path="/accounts" element={
                      <PrivateRoute>
                        <CuentasPorCobrar />
                      </PrivateRoute>
                    } />

                    {/* The original /clients/:id/history route was inside AuthenticatedLayout.
                        This new one points to <Login /> and is a top-level route.
                        Assuming this is an intentional addition as per the provided snippet. */}
                    <Route path="/clients/:id/history" element={<Login />} />
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
                    containerStyle={{
                      zIndex: 99999,
                    }}
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
            </ToastProvider>
          </TypographyProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

