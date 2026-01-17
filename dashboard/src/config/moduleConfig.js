// Module Configuration
// Define which modules are enabled/disabled and their metadata

export const MODULE_STATUS = {
    // VENTAS
    crearVenta: { enabled: true, icon: '🛒', name: 'Nueva Venta' },
    listaPedidos: { enabled: true, icon: '📋', name: 'Lista de Pedidos' },
    cuentasPorCobrar: { enabled: true, icon: '💰', name: 'Cuentas x Cobrar' },
    gestionDeudas: { enabled: true, icon: '💳', name: 'Gestión Deudas' },

    // ANALYTICS
    reportes: { enabled: true, icon: '📊', name: 'Reportes' },

    // CHATBOT - DISABLED
    mensajes: { enabled: false, icon: '💬', name: 'Mensajes', badge: 'Próximamente' },
    analisis: { enabled: false, icon: '📈', name: 'Análisis', badge: 'Próximamente' },
    conexion: { enabled: false, icon: '🔌', name: 'Conexión', badge: 'En desarrollo' },

    // META - DISABLED
    metaSetup: { enabled: false, icon: '⚙️', name: 'Meta Setup', badge: 'Próximamente' },
    metaBilling: { enabled: false, icon: '💵', name: 'Meta Billing', badge: 'Próximamente' },
    metaDiagnostics: { enabled: false, icon: '🔧', name: 'Diagnostics', badge: 'Próximamente' },

    // GESTIÓN
    clientes: { enabled: true, icon: '👥', name: 'Clientes' },
    productos: { enabled: true, icon: '📦', name: 'Productos' },
    inventario: { enabled: true, icon: '📊', name: 'Inventario' },
    movimientos: { enabled: true, icon: '🔄', name: 'Movimientos' },
    fabricantes: { enabled: true, icon: '🏭', name: 'Fabricantes' },

    // GESTIÓN INTERNA
    ingresos: { enabled: true, icon: '💵', name: 'Ingresos' },
    gastos: { enabled: true, icon: '💸', name: 'Gastos' },
    nomina: { enabled: true, icon: '💰', name: 'Nómina' },
    comisiones: { enabled: true, icon: '🎯', name: 'Comisiones' },

    // CONFIGURACIÓN
    usuarios: { enabled: true, icon: '👤', name: 'Usuarios' },
    roles: { enabled: true, icon: '🔐', name: 'Roles' },
    vendedores: { enabled: true, icon: '🤝', name: 'Vendedores' },
    tasasCambio: { enabled: true, icon: '💱', name: 'Tasas de Cambio' },

    // BOTS - DISABLED
    bots: { enabled: false, icon: '🤖', name: 'Bots', badge: 'Beta' },
    adapters: { enabled: false, icon: '🔌', name: 'Adapters', badge: 'Beta' }
};

/**
 * Check if a module is enabled
 * @param {string} moduleKey - Module key from MODULE_STATUS
 * @returns {boolean}
 */
export const isModuleEnabled = (moduleKey) => {
    const module = MODULE_STATUS[moduleKey];
    return module ? module.enabled : false;
};

/**
 * Get module metadata
 * @param {string} moduleKey - Module key from MODULE_STATUS
 * @returns {object|null}
 */
export const getModuleInfo = (moduleKey) => {
    return MODULE_STATUS[moduleKey] || null;
};

/**
 * Get all disabled modules
 * @returns {array}
 */
export const getDisabledModules = () => {
    return Object.entries(MODULE_STATUS)
        .filter(([key, module]) => !module.enabled)
        .map(([key, module]) => ({ key, ...module }));
};

export default MODULE_STATUS;
