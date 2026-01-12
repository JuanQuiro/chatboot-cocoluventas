import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3009/api';

// ============================================
// SERVICIO DE JOYERÍA MEJORADO - COCOLU
// Integra las nuevas APIs del backend
// ============================================

export const joyeriaService = {
    // ========== TASAS DE CAMBIO ==========
    obtenerTasaActual: async () => {
        const response = await axios.get(`${API_URL}/tasas/actual`);
        return response.data;
    },

    crearTasa: async (tasaData) => {
        const response = await axios.post(`${API_URL}/tasas`, tasaData);
        return response.data;
    },

    activarTasa: async (tasaId) => {
        const response = await axios.put(`${API_URL}/tasas/${tasaId}/activar`);
        return response.data;
    },

    // ========== CLIENTES MEJORADOS (CON APELLIDO) ==========
    buscarClientes: async (query) => {
        if (!query || query.length < 2) return { success: true, data: [] };
        const response = await axios.get(`${API_URL}/clients-improved/search`, {
            params: { q: query }
        });
        return responsedata;
    },

    crearClienteMejorado: async (clienteData) => {
        // Validación del apellido
        if (!clienteData.apellido) {
            throw new Error('El apellido es obligatorio');
        }
        const response = await axios.post(`${API_URL}/clients-improved`, clienteData);
        return response.data;
    },

    // ========== VENTAS CON CÁLCULOS CORRECTOS ==========
    crearVentaMejorada: async (ventaData) => {
        const response = await axios.post(`${API_URL}/sales-improved/nueva`, ventaData);
        return response.data;
    },

    obtenerResumenVenta: async (ventaId) => {
        const response = await axios.get(`${API_URL}/sales-improved/${ventaId}/resumen`);
        return response.data;
    },

    // ========== PAGOS MULTIMONEDA (BS/USD) ==========
    registrarPago: async (pagoData) => {
        const response = await axios.post(`${API_URL}/payments-improved`, pagoData);
        return response.data;
    },

    registrarAbono: async (abonoData) => {
        const response = await axios.post(`${API_URL}/payments-improved/abono`, abonoData);
        return response.data;
    },

    obtenerPagosVenta: async (ventaId) => {
        const response = await axios.get(`${API_URL}/payments-improved/venta/${ventaId}`);
        return response.data;
    },

    // ========== UTILIDADES ==========
    calcularTotalesVenta: (productos, config = {}) => {
        const { descuento_porcentaje = 0, incluir_iva = false, delivery_monto = 0 } = config;

        const subtotal = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        const descuento_monto = subtotal * (parseFloat(descuento_porcentaje) / 100);
        const base_imponible = subtotal - descuento_monto;
        const iva_monto = incluir_iva ? base_imponible * 0.16 : 0;
        const delivery = parseFloat(delivery_monto) || 0;
        const total = base_imponible + iva_monto + delivery;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            descuento_monto: parseFloat(descuento_monto.toFixed(2)),
            base_imponible: parseFloat(base_imponible.toFixed(2)),
            iva_monto: parseFloat(iva_monto.toFixed(2)),
            delivery_monto: parseFloat(delivery),
            total: parseFloat(total.toFixed(2))
        };
    },

    convertirBsAUsd: (montoBs, tasa) => {
        return parseFloat((parseFloat(montoBs) / parseFloat(tasa)).toFixed(2));
    },

    convertirUsdABs: (montoUsd, tasa) => {
        return parseFloat((parseFloat(montoUsd) * parseFloat(tasa)).toFixed(2));
    }
};

export default joyeriaService;
