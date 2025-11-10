/**
 * Manejo centralizado de errores
 * MEJORA: Sistema robusto de error handling
 */

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxErrorLog = 1000;
    }

    /**
     * Manejar error con contexto
     */
    handle(error, context = {}) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            type: error.name || 'Error'
        };

        // Log error
        console.error('❌ ERROR:', errorInfo);

        // Guardar en log
        this.errorLog.push(errorInfo);
        if (this.errorLog.length > this.maxErrorLog) {
            this.errorLog.shift();
        }

        // Notificar si es crítico
        if (this.isCritical(error)) {
            this.notifyCriticalError(errorInfo);
        }

        return errorInfo;
    }

    /**
     * Determinar si el error es crítico
     */
    isCritical(error) {
        const criticalPatterns = [
            'ECONNREFUSED',
            'ETIMEDOUT',
            'Database',
            'MongoError',
            'FATAL'
        ];

        return criticalPatterns.some(pattern => 
            error.message?.includes(pattern) || error.code?.includes(pattern)
        );
    }

    /**
     * Notificar errores críticos
     */
    notifyCriticalError(errorInfo) {
        // Aquí podrías enviar a Slack, email, Sentry, etc.
        console.error('🚨 CRITICAL ERROR:', errorInfo);
    }

    /**
     * Obtener errores recientes
     */
    getRecentErrors(limit = 50) {
        return this.errorLog.slice(-limit);
    }

    /**
     * Wrapper para try-catch async
     */
    async tryAsync(fn, context = {}) {
        try {
            return await fn();
        } catch (error) {
            this.handle(error, context);
            throw error;
        }
    }

    /**
     * Wrapper para try-catch sync
     */
    try(fn, context = {}) {
        try {
            return fn();
        } catch (error) {
            this.handle(error, context);
            throw error;
        }
    }
}

const errorHandler = new ErrorHandler();

export default errorHandler;
