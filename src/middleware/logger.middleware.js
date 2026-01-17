/**
 * Middleware para logging de mensajes
 */

/**
 * Logger middleware para registrar todas las interacciones
 * @param {Object} ctx - Contexto del mensaje
 * @param {Function} next - Siguiente middleware
 */
export const loggerMiddleware = async (ctx, next) => {
    const timestamp = new Date().toISOString();
    const userId = ctx.from;
    const userName = ctx.pushName || 'Unknown';
    const message = ctx.body;

    // Log de entrada
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📨 [${timestamp}]`);
    console.log(`👤 Usuario: ${userName} (${userId})`);
    console.log(`💬 Mensaje: ${message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Continuar con el siguiente middleware o flow
    await next();
};

/**
 * Logger middleware para errores
 * @param {Error} error - Error capturado
 * @param {Object} ctx - Contexto del mensaje
 */
export const errorLoggerMiddleware = (error, ctx) => {
    const timestamp = new Date().toISOString();
    const userId = ctx.from;
    const userName = ctx.pushName || 'Unknown';

    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`❌ ERROR [${timestamp}]`);
    console.error(`👤 Usuario: ${userName} (${userId})`);
    console.error(`🔥 Error: ${error.message}`);
    console.error(`📚 Stack: ${error.stack}`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

export default {
    loggerMiddleware,
    errorLoggerMiddleware
};
