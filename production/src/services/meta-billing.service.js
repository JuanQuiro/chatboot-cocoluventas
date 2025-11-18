/**
 * Servicio de Facturación de Meta (WhatsApp Business API)
 * Rastrea mensajes enviados y calcula costos por país
 */

// Mapeo de códigos de país a códigos ISO
const COUNTRY_CODES = {
    // Venezuela
    '58': 'VE',
    // Otros países latinoamericanos comunes
    '1': 'US', // USA/Canadá (se detectará mejor con código de área)
    '52': 'MX', // México
    '54': 'AR', // Argentina
    '55': 'BR', // Brasil
    '56': 'CL', // Chile
    '57': 'CO', // Colombia
    '51': 'PE', // Perú
    '593': 'EC', // Ecuador
    '595': 'PY', // Paraguay
    '598': 'UY', // Uruguay
    '591': 'BO', // Bolivia
    '506': 'CR', // Costa Rica
    '507': 'PA', // Panamá
    '502': 'GT', // Guatemala
    '503': 'SV', // El Salvador
    '504': 'HN', // Honduras
    '505': 'NI', // Nicaragua
    '34': 'ES', // España
};

// Precios por país/región (en USD)
// Meta agrupa países en "tiers" de precios
// Tier 0: Países con precios más bajos (generalmente países en desarrollo)
// Tier 1: Países con precios estándar
// Tier 2: Países con precios más altos (generalmente países desarrollados)
const PRICING_BY_COUNTRY = {
    // Tier 0 - Países con precios más bajos (incluye Venezuela y muchos países latinoamericanos)
    VE: { // Venezuela
        conversation: {
            text: 0.0025,      // $0.0025 por mensaje de texto
            image: 0.0025,     // $0.0025 por imagen
            video: 0.0025,     // $0.0025 por video
            audio: 0.0025,     // $0.0025 por audio
            document: 0.0025,  // $0.0025 por documento
            location: 0.0025,  // $0.0025 por ubicación
            contacts: 0.0025, // $0.0025 por contactos
            sticker: 0.0025,   // $0.0025 por sticker
            interactive: 0.0025, // $0.0025 por mensaje interactivo
            template: 0.0,     // Los templates son gratuitos dentro de conversación
        },
        template: {
            text: 0.0025,
            image: 0.0025,
            video: 0.0025,
            document: 0.0025,
            interactive: 0.0025,
        },
        service: {
            default: 0.0,
        },
        tier: 0,
        currency: 'USD',
    },
    // Otros países Tier 0 (mismos precios que Venezuela)
    MX: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    AR: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    BR: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    CL: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    CO: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    PE: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    EC: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    PY: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    UY: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    BO: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    CR: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    PA: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    GT: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    SV: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    HN: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    NI: { conversation: { text: 0.0025, image: 0.0025, video: 0.0025, audio: 0.0025, document: 0.0025, location: 0.0025, contacts: 0.0025, sticker: 0.0025, interactive: 0.0025, template: 0.0 }, template: { text: 0.0025, image: 0.0025, video: 0.0025, document: 0.0025, interactive: 0.0025 }, service: { default: 0.0 }, tier: 0, currency: 'USD' },
    
    // Tier 1 - Precios estándar (España y otros países europeos)
    ES: {
        conversation: {
            text: 0.005,
            image: 0.005,
            video: 0.005,
            audio: 0.005,
            document: 0.005,
            location: 0.005,
            contacts: 0.005,
            sticker: 0.005,
            interactive: 0.005,
            template: 0.0,
        },
        template: {
            text: 0.005,
            image: 0.005,
            video: 0.005,
            document: 0.005,
            interactive: 0.005,
        },
        service: {
            default: 0.0,
        },
        tier: 1,
        currency: 'USD',
    },
    
    // Tier 2 - Precios más altos (USA, Canadá, etc.)
    US: {
        conversation: {
            text: 0.0095,
            image: 0.0095,
            video: 0.0095,
            audio: 0.0095,
            document: 0.0095,
            location: 0.0095,
            contacts: 0.0095,
            sticker: 0.0095,
            interactive: 0.0095,
            template: 0.0,
        },
        template: {
            text: 0.0095,
            image: 0.0095,
            video: 0.0095,
            document: 0.0095,
            interactive: 0.0095,
        },
        service: {
            default: 0.0,
        },
        tier: 2,
        currency: 'USD',
    },
};

// Precios por defecto (si no se detecta el país)
const DEFAULT_PRICING = {
    conversation: {
        text: 0.005,
        image: 0.005,
        video: 0.005,
        audio: 0.005,
        document: 0.005,
        location: 0.005,
        contacts: 0.005,
        sticker: 0.005,
        interactive: 0.005,
        template: 0.0,
    },
    template: {
        text: 0.005,
        image: 0.005,
        video: 0.005,
        document: 0.005,
        interactive: 0.005,
    },
    service: {
        default: 0.0,
    },
};

// Nombres de países
const COUNTRY_NAMES = {
    VE: 'Venezuela',
    MX: 'México',
    AR: 'Argentina',
    BR: 'Brasil',
    CL: 'Chile',
    CO: 'Colombia',
    PE: 'Perú',
    EC: 'Ecuador',
    PY: 'Paraguay',
    UY: 'Uruguay',
    BO: 'Bolivia',
    CR: 'Costa Rica',
    PA: 'Panamá',
    GT: 'Guatemala',
    SV: 'El Salvador',
    HN: 'Honduras',
    NI: 'Nicaragua',
    ES: 'España',
    US: 'Estados Unidos',
};

// Almacenamiento en memoria de mensajes enviados
// En producción, esto debería estar en una base de datos
const messageHistory = {
    sent: [], // Array de { timestamp, to, type, cost, currency }
    maxEntries: 10000, // Mantener últimos 10,000 mensajes
};

/**
 * Detecta el país basado en el número telefónico
 * @param {string} phoneNumber - Número de teléfono (puede incluir +, espacios, guiones)
 * @returns {string} - Código ISO del país (ej: 'VE', 'MX', 'US') o 'UNKNOWN'
 */
function detectCountry(phoneNumber) {
    if (!phoneNumber) return 'UNKNOWN';
    
    // Limpiar el número: remover espacios, guiones, paréntesis, y el signo +
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
    
    // Intentar detectar el código de país
    // Probar códigos de 3 dígitos primero (Ecuador, Paraguay, etc.)
    for (const [code, country] of Object.entries(COUNTRY_CODES)) {
        if (code.length === 3 && cleanNumber.startsWith(code)) {
            return country;
        }
    }
    
    // Luego probar códigos de 2 dígitos
    for (const [code, country] of Object.entries(COUNTRY_CODES)) {
        if (code.length === 2 && cleanNumber.startsWith(code)) {
            return country;
        }
    }
    
    // Si el número empieza con 1, podría ser USA/Canadá
    if (cleanNumber.startsWith('1') && cleanNumber.length >= 11) {
        return 'US'; // Por defecto USA, aunque podría ser Canadá
    }
    
    return 'UNKNOWN';
}

/**
 * Obtiene los precios para un país específico
 * @param {string} countryCode - Código ISO del país
 * @returns {Object} - Objeto con precios para ese país
 */
function getPricingForCountry(countryCode) {
    if (PRICING_BY_COUNTRY[countryCode]) {
        return PRICING_BY_COUNTRY[countryCode];
    }
    return {
        conversation: DEFAULT_PRICING.conversation,
        template: DEFAULT_PRICING.template,
        service: DEFAULT_PRICING.service,
        tier: null,
        currency: 'USD',
    };
}

/**
 * Registra un mensaje enviado y calcula su costo según el país
 * @param {string} to - Número de teléfono destinatario
 * @param {string} type - Tipo de mensaje (text, image, video, etc.)
 * @param {boolean} isTemplate - Si es un mensaje template (fuera de ventana de 24h)
 * @param {boolean} isService - Si es un mensaje de servicio
 * @returns {Object} - Información del mensaje registrado con costo
 */
export function recordMessage(to, type = 'text', isTemplate = false, isService = false) {
    const timestamp = new Date();
    const messageType = type.toLowerCase();
    
    // Detectar el país del destinatario
    const countryCode = detectCountry(to);
    const countryName = COUNTRY_NAMES[countryCode] || 'Desconocido';
    const countryPricing = getPricingForCountry(countryCode);
    
    // Determinar el costo según el tipo de mensaje y país
    let cost = 0;
    let category = 'conversation';
    
    if (isService) {
        category = 'service';
        cost = countryPricing.service.default || 0;
    } else if (isTemplate) {
        category = 'template';
        cost = countryPricing.template[messageType] || countryPricing.template.text || 0;
    } else {
        category = 'conversation';
        cost = countryPricing.conversation[messageType] || countryPricing.conversation.text || 0;
    }
    
    const messageRecord = {
        timestamp: timestamp.toISOString(),
        to,
        countryCode,
        countryName,
        type: messageType,
        category,
        cost,
        currency: countryPricing.currency || 'USD',
        tier: countryPricing.tier,
        isTemplate,
        isService,
    };
    
    // Agregar al historial
    messageHistory.sent.push(messageRecord);
    
    // Limitar el tamaño del historial
    if (messageHistory.sent.length > messageHistory.maxEntries) {
        messageHistory.sent.shift();
    }
    
    return messageRecord;
}

/**
 * Obtiene el resumen de facturación para un período
 * @param {Date} startDate - Fecha de inicio (opcional, por defecto inicio del mes actual)
 * @param {Date} endDate - Fecha de fin (opcional, por defecto ahora)
 * @returns {Object} - Resumen de facturación
 */
export function getBillingSummary(startDate = null, endDate = null) {
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || now;
    
    // Filtrar mensajes en el período
    const messagesInPeriod = messageHistory.sent.filter(msg => {
        const msgDate = new Date(msg.timestamp);
        return msgDate >= start && msgDate <= end;
    });
    
    // Calcular estadísticas
    const totalMessages = messagesInPeriod.length;
    const totalCost = messagesInPeriod.reduce((sum, msg) => sum + msg.cost, 0);
    
    // Agrupar por tipo
    const byType = {};
    messagesInPeriod.forEach(msg => {
        if (!byType[msg.type]) {
            byType[msg.type] = { count: 0, cost: 0 };
        }
        byType[msg.type].count++;
        byType[msg.type].cost += msg.cost;
    });
    
    // Agrupar por categoría
    const byCategory = {};
    messagesInPeriod.forEach(msg => {
        if (!byCategory[msg.category]) {
            byCategory[msg.category] = { count: 0, cost: 0 };
        }
        byCategory[msg.category].count++;
        byCategory[msg.category].cost += msg.cost;
    });
    
    // Agrupar por día
    const byDay = {};
    messagesInPeriod.forEach(msg => {
        const date = new Date(msg.timestamp).toISOString().split('T')[0];
        if (!byDay[date]) {
            byDay[date] = { count: 0, cost: 0 };
        }
        byDay[date].count++;
        byDay[date].cost += msg.cost;
    });
    
    // Agrupar por país
    const byCountry = {};
    messagesInPeriod.forEach(msg => {
        const countryCode = msg.countryCode || 'UNKNOWN';
        const countryName = msg.countryName || 'Desconocido';
        if (!byCountry[countryCode]) {
            byCountry[countryCode] = { 
                countryCode,
                countryName,
                count: 0, 
                cost: 0,
                tier: msg.tier || null,
            };
        }
        byCountry[countryCode].count++;
        byCountry[countryCode].cost += msg.cost;
    });
    
    // Calcular promedio diario
    const daysInPeriod = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const avgDailyMessages = daysInPeriod > 0 ? totalMessages / daysInPeriod : 0;
    const avgDailyCost = daysInPeriod > 0 ? totalCost / daysInPeriod : 0;
    
    // Proyección mensual (basada en el promedio diario)
    const avgDaysPerMonth = 30;
    const projectedMonthlyMessages = avgDailyMessages * avgDaysPerMonth;
    const projectedMonthlyCost = avgDailyCost * avgDaysPerMonth;
    
    return {
        period: {
            start: start.toISOString(),
            end: end.toISOString(),
            days: daysInPeriod,
        },
        summary: {
            totalMessages,
            totalCost: parseFloat(totalCost.toFixed(4)),
            currency: 'USD',
            avgDailyMessages: parseFloat(avgDailyMessages.toFixed(2)),
            avgDailyCost: parseFloat(avgDailyCost.toFixed(4)),
            projectedMonthlyMessages: parseFloat(projectedMonthlyMessages.toFixed(0)),
            projectedMonthlyCost: parseFloat(projectedMonthlyCost.toFixed(2)),
        },
        breakdown: {
            byType,
            byCategory,
            byDay,
            byCountry,
        },
        pricing: PRICING_BY_COUNTRY, // Incluir precios por país
    };
}

/**
 * Obtiene el historial de mensajes enviados
 * @param {number} limit - Límite de mensajes a retornar (por defecto 100)
 * @param {number} offset - Offset para paginación (por defecto 0)
 * @returns {Object} - Historial paginado
 */
export function getMessageHistory(limit = 100, offset = 0) {
    const total = messageHistory.sent.length;
    const messages = messageHistory.sent
        .slice()
        .reverse() // Más recientes primero
        .slice(offset, offset + limit);
    
    return {
        total,
        limit,
        offset,
        messages,
    };
}

/**
 * Obtiene estadísticas de facturación por mes
 * @param {number} months - Número de meses a retornar (por defecto 6)
 * @returns {Array} - Array de estadísticas mensuales
 */
export function getMonthlyStats(months = 6) {
    const stats = [];
    const now = new Date();
    
    for (let i = 0; i < months; i++) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        
        const summary = getBillingSummary(monthStart, monthEnd);
        
        stats.push({
            month: monthStart.toISOString().substring(0, 7), // YYYY-MM
            monthName: monthStart.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
            ...summary.summary,
        });
    }
    
    return stats.reverse(); // Más antiguo primero
}

/**
 * Actualiza los precios para un país específico
 * @param {string} countryCode - Código ISO del país
 * @param {Object} newPricing - Nuevos precios para ese país
 */
export function updatePricingForCountry(countryCode, newPricing) {
    if (PRICING_BY_COUNTRY[countryCode]) {
        Object.assign(PRICING_BY_COUNTRY[countryCode], newPricing);
    } else {
        PRICING_BY_COUNTRY[countryCode] = newPricing;
    }
}

/**
 * Obtiene los precios actuales por país
 * @returns {Object} - Precios actuales por país
 */
export function getPricing() {
    return PRICING_BY_COUNTRY;
}

/**
 * Obtiene los precios para un país específico
 * @param {string} countryCode - Código ISO del país
 * @returns {Object} - Precios para ese país o precios por defecto
 */
export function getPricingForCountryCode(countryCode) {
    return getPricingForCountry(countryCode);
}

export default {
    recordMessage,
    getBillingSummary,
    getMessageHistory,
    getMonthlyStats,
    updatePricingForCountry,
    getPricing,
    getPricingForCountryCode,
};

