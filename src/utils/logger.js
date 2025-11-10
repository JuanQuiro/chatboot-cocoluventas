/**
 * Logger estructurado
 * MEJORA: Logging profesional con niveles
 */

class Logger {
    constructor(context = 'App') {
        this.context = context;
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            trace: 4
        };
        this.currentLevel = process.env.LOG_LEVEL || 'info';
        this.logs = [];
        this.maxLogs = 1000;
    }

    /**
     * Formatear mensaje
     */
    format(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        return {
            timestamp,
            level: level.toUpperCase(),
            context: this.context,
            message,
            ...meta
        };
    }

    /**
     * Verificar si debe loguear
     */
    shouldLog(level) {
        return this.levels[level] <= this.levels[this.currentLevel];
    }

    /**
     * Guardar log
     */
    save(logEntry) {
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }

    /**
     * Log de error
     */
    error(message, meta = {}) {
        if (!this.shouldLog('error')) return;

        const log = this.format('error', message, meta);
        this.save(log);
        console.error(`❌ [${log.timestamp}] [${this.context}] ${message}`, meta);
    }

    /**
     * Log de warning
     */
    warn(message, meta = {}) {
        if (!this.shouldLog('warn')) return;

        const log = this.format('warn', message, meta);
        this.save(log);
        console.warn(`⚠️  [${log.timestamp}] [${this.context}] ${message}`, meta);
    }

    /**
     * Log de info
     */
    info(message, meta = {}) {
        if (!this.shouldLog('info')) return;

        const log = this.format('info', message, meta);
        this.save(log);
        console.log(`ℹ️  [${log.timestamp}] [${this.context}] ${message}`, meta);
    }

    /**
     * Log de debug
     */
    debug(message, meta = {}) {
        if (!this.shouldLog('debug')) return;

        const log = this.format('debug', message, meta);
        this.save(log);
        console.log(`🐛 [${log.timestamp}] [${this.context}] ${message}`, meta);
    }

    /**
     * Log de trace
     */
    trace(message, meta = {}) {
        if (!this.shouldLog('trace')) return;

        const log = this.format('trace', message, meta);
        this.save(log);
        console.log(`🔍 [${log.timestamp}] [${this.context}] ${message}`, meta);
    }

    /**
     * Obtener logs
     */
    getLogs(level = null, limit = 100) {
        let logs = this.logs;
        
        if (level) {
            logs = logs.filter(log => log.level === level.toUpperCase());
        }
        
        return logs.slice(-limit);
    }

    /**
     * Limpiar logs
     */
    clear() {
        this.logs = [];
    }

    /**
     * Crear child logger con contexto
     */
    child(context) {
        return new Logger(`${this.context}:${context}`);
    }
}

// Logger global
const logger = new Logger('ChatBot');

export default logger;
export { Logger };
