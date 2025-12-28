/**
 * Utilidades para formateo de datos
 */

/**
 * Formatear moneda
 * @param {number} amount - Monto a formatear
 * @param {string} currency - Código de moneda (por defecto USD)
 * @returns {string} Monto formateado
 */
export const formatCurrency = (amount, currency = 'USD') => {
    try {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (error) {
        console.error('Error al formatear moneda:', error);
        return `$${amount.toFixed(2)}`;
    }
};

/**
 * Formatear fecha
 * @param {string|Date} date - Fecha a formatear
 * @param {boolean} includeTime - Incluir hora
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, includeTime = false) => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return new Intl.DateTimeFormat('es-ES', options).format(dateObj);
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return date.toString();
    }
};

/**
 * Formatear número de teléfono
 * @param {string} phone - Número de teléfono
 * @returns {string} Teléfono formateado
 */
export const formatPhone = (phone) => {
    try {
        // Eliminar caracteres no numéricos
        const cleaned = phone.replace(/\D/g, '');
        
        // Formatear según la longitud
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length === 11) {
            return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        
        return phone;
    } catch (error) {
        console.error('Error al formatear teléfono:', error);
        return phone;
    }
};

/**
 * Truncar texto
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
    try {
        if (text.length <= maxLength) {
            return text;
        }
        
        return text.slice(0, maxLength - 3) + '...';
    } catch (error) {
        console.error('Error al truncar texto:', error);
        return text;
    }
};

/**
 * Capitalizar primera letra
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalize = (text) => {
    try {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    } catch (error) {
        console.error('Error al capitalizar:', error);
        return text;
    }
};

/**
 * Formatear número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado
 */
export const formatNumber = (number) => {
    try {
        return new Intl.NumberFormat('es-ES').format(number);
    } catch (error) {
        console.error('Error al formatear número:', error);
        return number.toString();
    }
};

/**
 * Limpiar y normalizar texto
 * @param {string} text - Texto a limpiar
 * @returns {string} Texto limpio
 */
export const cleanText = (text) => {
    try {
        return text
            .trim()
            .replace(/\s+/g, ' ')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    } catch (error) {
        console.error('Error al limpiar texto:', error);
        return text;
    }
};
