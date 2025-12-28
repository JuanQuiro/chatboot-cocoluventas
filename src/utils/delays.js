/**
 * Utilidades para delays y timing
 */

/**
 * Sleep/delay asíncrono
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise}
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Delays profesionales predefinidos
 */
export const DELAYS = {
    TINY: 500,      // 0.5s - Para separar mensajes cortos
    SHORT: 1000,    // 1s - Para mensajes normales
    MEDIUM: 2000,   // 2s - Para dar tiempo a leer
    LONG: 3000,     // 3s - Para procesamiento aparente
    TYPING: 1500    // 1.5s - Simular que está escribiendo
};

/**
 * Simula que el bot está "escribiendo"
 * @param {number} ms - Tiempo de escritura simulada
 */
export const simulateTyping = async (ms = DELAYS.TYPING) => {
    await sleep(ms);
};

/**
 * Delay basado en longitud del texto
 * @param {string} text - Texto que se va a enviar
 * @returns {number} Delay en ms
 */
export const calculateReadingTime = (text) => {
    // ~250 palabras por minuto = ~4 palabras por segundo
    const words = text.split(/\s+/).length;
    const readingTime = (words / 4) * 1000;
    
    // Mínimo 500ms, máximo 3000ms
    return Math.min(Math.max(readingTime, 500), 3000);
};

export default {
    sleep,
    DELAYS,
    simulateTyping,
    calculateReadingTime
};
