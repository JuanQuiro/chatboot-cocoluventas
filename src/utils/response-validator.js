/**
 * Validador Inteligente de Respuestas de Usuario
 * Sistema robusto con regex patterns y fuzzy matching
 */

/**
 * Patrones de validación por tipo de pregunta
 */
const VALIDATION_PATTERNS = {
    // Respuestas SI/NO estándar
    yes_no: {
        yes: /\b(si|sí|s[íi]|yes|yeah|yep|ya|ok|okay|dale|claro|afirmativo|por\s*supuesto|efectivamente|exacto|correcto)\b/i,
        no: /\b(no|nop|nope|negativo|para\s*nada|ninguno|nunca|jam[áa]s|tampoco)\b/i
    },
    
    // Interés en productos
    interested: {
        yes: /\b(si|sí|me\s*gust[óo]|interesa|quiero|deseo|perfecto|genial|hermoso|lindo|bonito|precioso|me\s*encant[óa])\b/i,
        no: /\b(no|nada|ninguno|no\s*me\s*gust[óo]|no\s*me\s*interesa|no\s*quiero|paso)\b/i
    },
    
    // Atención recibida
    attended: {
        yes: /\b(si|sí|ya|fue\s*atendid[oa]|me\s*atendieron|contact[óo]|habl[óe]|resolvi[óo]|solucion[óo])\b/i,
        no: /\b(no|a[úu]n\s*no|todav[íi]a\s*no|nadie|no\s*me\s*han|sin\s*respuesta|esperando)\b/i
    },
    
    // Problema resuelto
    resolved: {
        yes: /\b(si|sí|ya|resuelto|solucionado|arreglado|listo|perfecto|todo\s*bien)\b/i,
        no: /\b(no|a[úu]n\s*no|todav[íi]a\s*no|sigue|persiste|continua|igual)\b/i
    }
};

/**
 * Valida la respuesta del usuario según el tipo esperado
 * @param {string} response - Respuesta del usuario
 * @param {string} type - Tipo de validación (yes_no, interested, attended, resolved)
 * @returns {string|null} - 'yes', 'no', o null si no se pudo determinar
 */
export const validateResponse = (response, type = 'yes_no') => {
    if (!response || typeof response !== 'string') return null;
    
    const normalized = response.toLowerCase().trim();
    
    // Si está vacío
    if (normalized.length === 0) return null;
    
    // Obtener patrones del tipo solicitado
    const patterns = VALIDATION_PATTERNS[type];
    if (!patterns) {
        console.warn(`⚠️ Tipo de validación desconocido: ${type}`);
        return null;
    }
    
    // Validar contra patrón YES
    if (patterns.yes.test(normalized)) {
        return 'yes';
    }
    
    // Validar contra patrón NO
    if (patterns.no.test(normalized)) {
        return 'no';
    }
    
    // No se pudo determinar
    return null;
};

/**
 * Valida múltiples variantes de respuesta
 * @param {string} response - Respuesta del usuario
 * @param {string[]} types - Array de tipos a validar
 * @returns {Object} - {type: string, result: 'yes'|'no'|null}
 */
export const validateMultiple = (response, types = ['yes_no', 'interested', 'attended']) => {
    for (const type of types) {
        const result = validateResponse(response, type);
        if (result !== null) {
            return { type, result };
        }
    }
    return { type: null, result: null };
};

/**
 * Verifica si la respuesta es ambigua o confusa
 * @param {string} response - Respuesta del usuario
 * @returns {boolean}
 */
export const isAmbiguous = (response) => {
    if (!response || typeof response !== 'string') return true;
    
    const normalized = response.toLowerCase().trim();
    
    // Muy corto (menos de 2 caracteres)
    if (normalized.length < 2) return true;
    
    // Solo números
    if (/^\d+$/.test(normalized)) return false; // Los números son válidos para el menú
    
    // Respuestas confusas comunes
    const ambiguousPatterns = [
        /^(eh|um|uh|hmm|mm|ah)$/i,
        /^\.+$/,  // Solo puntos
        /^[?¿]+$/,  // Solo signos de interrogación
        /^[!¡]+$/,  // Solo exclamaciones
    ];
    
    return ambiguousPatterns.some(pattern => pattern.test(normalized));
};

/**
 * Extrae números de una respuesta
 * @param {string} response - Respuesta del usuario
 * @returns {number|null} - Primer número encontrado o null
 */
export const extractNumber = (response) => {
    if (!response) return null;
    
    const match = response.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
};

/**
 * Verifica si es un número de menú válido
 * @param {string} response - Respuesta del usuario
 * @param {number} max - Número máximo válido (default: 5)
 * @returns {number|null} - Número válido o null
 */
export const validateMenuOption = (response, max = 5) => {
    const number = extractNumber(response);
    
    if (number === null) return null;
    if (number < 1 || number > max) return null;
    
    return number;
};

/**
 * Obtiene un mensaje de error personalizado según el tipo de validación
 * @param {string} type - Tipo de validación
 * @returns {string}
 */
export const getErrorMessage = (type = 'yes_no') => {
    const messages = {
        yes_no: '😊 Por favor responde *SI* o *NO*',
        interested: '💝 Por favor dime si algo te gustó: *SI* o *NO*',
        attended: '💗 ¿Ya fuiste atendid@? Responde *SI* o *NO*',
        resolved: '🔧 ¿Se resolvió el problema? Responde *SI* o *NO*',
        menu: '🔢 Por favor escribe un número del *1 al 5*'
    };
    
    return messages[type] || messages.yes_no;
};

/**
 * Estadísticas de validación (para debugging/analytics)
 */
let validationStats = {
    total: 0,
    successful: 0,
    ambiguous: 0,
    byType: {}
};

/**
 * Registra estadística de validación
 * @param {string} type - Tipo de validación
 * @param {boolean} success - Si fue exitosa
 */
export const trackValidation = (type, success) => {
    validationStats.total++;
    if (success) validationStats.successful++;
    else validationStats.ambiguous++;
    
    if (!validationStats.byType[type]) {
        validationStats.byType[type] = { total: 0, successful: 0 };
    }
    validationStats.byType[type].total++;
    if (success) validationStats.byType[type].successful++;
};

/**
 * Obtiene estadísticas de validación
 * @returns {Object}
 */
export const getValidationStats = () => {
    return {
        ...validationStats,
        successRate: validationStats.total > 0 
            ? (validationStats.successful / validationStats.total * 100).toFixed(2) + '%'
            : '0%'
    };
};

/**
 * Resetea estadísticas
 */
export const resetValidationStats = () => {
    validationStats = {
        total: 0,
        successful: 0,
        ambiguous: 0,
        byType: {}
    };
};

export default {
    validateResponse,
    validateMultiple,
    isAmbiguous,
    extractNumber,
    validateMenuOption,
    getErrorMessage,
    trackValidation,
    getValidationStats,
    resetValidationStats
};
