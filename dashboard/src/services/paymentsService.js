import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3009/api';

// ============================================
// SERVICIO DE PAGOS MEJORADO - MULTIMONEDA
// ============================================

export const paymentsService = {
    // Registrar pago con conversión automática Bs→USD
    registerPayment: async (pagoData) => {
        const response = await axios.post(`${API_URL}/payments-improved`, pagoData);
        return response.data;
    },

    // Registrar abono libre (sin cuotas fijas)
    registerAbono: async (abonoData) => {
        const response = await axios.post(`${API_URL}/payments-improved/abono`, abonoData);
        return response.data;
    },

    // Obtener historial de pagos de una venta
    getPaymentHistory: async (ventaId) => {
        const response = await axios.get(`${API_URL}/payments-improved/venta/${ventaId}`);
        return response.data;
    }
};

// ============================================
// SERVICIO DE TASAS DE CAMBIO
// ============================================

export const tasasService = {
    // Obtener tasa vigente del día
    getCurrentRate: async () => {
        const response = await axios.get(`${API_URL}/tasas/actual`);
        return response.data;
    },

    // Crear nueva tasa
    createRate: async (tasaData) => {
        const response = await axios.post(`${API_URL}/tasas`, tasaData);
        return response.data;
    },

    // Activar tasa específica
    activateRate: async (tasaId) => {
        const response = await axios.put(`${API_URL}/tasas/${tasaId}/activar`);
        return response.data;
    },

    // Conversiones
    convertBsToUsd: (montoBs, tasa) => {
        return parseFloat((parseFloat(montoBs) / parseFloat(tasa)).toFixed(2));
    },

    convertUsd ToBs: (montoUsd, tasa) => {
        return parseFloat((parseFloat(montoUsd) * parseFloat(tasa)).toFixed(2));
    }
};

export default {
    paymentsService,
    tasasService
};
