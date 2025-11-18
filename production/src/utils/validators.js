/**
 * Utilidades para validación de datos
 */

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
export const isValidEmail = (email) => {
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    } catch (error) {
        console.error('Error al validar email:', error);
        return false;
    }
};

/**
 * Validar número de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} true si es válido
 */
export const isValidPhone = (phone) => {
    try {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 15;
    } catch (error) {
        console.error('Error al validar teléfono:', error);
        return false;
    }
};

/**
 * Validar código postal
 * @param {string} zipCode - Código postal a validar
 * @returns {boolean} true si es válido
 */
export const isValidZipCode = (zipCode) => {
    try {
        const cleaned = zipCode.replace(/\D/g, '');
        return cleaned.length >= 4 && cleaned.length <= 10;
    } catch (error) {
        console.error('Error al validar código postal:', error);
        return false;
    }
};

/**
 * Validar nombre
 * @param {string} name - Nombre a validar
 * @returns {boolean} true si es válido
 */
export const isValidName = (name) => {
    try {
        return name && name.trim().length >= 2 && name.trim().length <= 100;
    } catch (error) {
        console.error('Error al validar nombre:', error);
        return false;
    }
};

/**
 * Validar dirección
 * @param {string} address - Dirección a validar
 * @returns {boolean} true si es válida
 */
export const isValidAddress = (address) => {
    try {
        return address && address.trim().length >= 10 && address.trim().length <= 200;
    } catch (error) {
        console.error('Error al validar dirección:', error);
        return false;
    }
};

/**
 * Validar cantidad
 * @param {string|number} quantity - Cantidad a validar
 * @returns {boolean} true si es válida
 */
export const isValidQuantity = (quantity) => {
    try {
        const num = typeof quantity === 'string' ? parseInt(quantity) : quantity;
        return !isNaN(num) && num > 0 && num <= 1000;
    } catch (error) {
        console.error('Error al validar cantidad:', error);
        return false;
    }
};

/**
 * Validar precio
 * @param {string|number} price - Precio a validar
 * @returns {boolean} true si es válido
 */
export const isValidPrice = (price) => {
    try {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return !isNaN(num) && num >= 0;
    } catch (error) {
        console.error('Error al validar precio:', error);
        return false;
    }
};

/**
 * Sanitizar entrada de texto
 * @param {string} input - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export const sanitizeInput = (input) => {
    try {
        return input
            .trim()
            .replace(/[<>]/g, '')
            .substring(0, 1000);
    } catch (error) {
        console.error('Error al sanitizar entrada:', error);
        return input;
    }
};
