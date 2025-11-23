/**
 * Global Error Monitor
 * Captura TODOS los errores y warnings del sistema
 * NO PERMITE ERRORES SILENCIOSOS
 */

class ErrorMonitor {
    constructor() {
        // Limpiar logs viejos si no hay token (evita mostrar errores de sesiones anteriores)
        if (!localStorage.getItem('token')) {
            localStorage.removeItem('dashoffice_errors');
            localStorage.removeItem('dashoffice_warnings');
            localStorage.removeItem('dashoffice_logs');
        }

        // Arrays para almacenar errores, warnings y logs
        this.errors = this.loadFromStorage('dashoffice_errors') || [];
        this.warnings = this.loadFromStorage('dashoffice_warnings') || [];
        this.logs = this.loadFromStorage('dashoffice_logs') || [];

        this.isInitialized = false;
        this.maxErrors = 100; // Límite de errores a guardar más historia
        this.maxLogs = 500;
        this.isInitialized = false;

        // Cola para envío a backend
        this.backendQueue = [];
        this.batchSize = 20;
        this.flushInterval = 5000; // 5 segundos
        this.isOnline = navigator.onLine;

        // Listeners de conectividad
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processBackendQueue();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Auto-flush cada 5 segundos
        setInterval(() => this.flushToBackend(), this.flushInterval);
    }

    /**
     * Cargar desde localStorage
     */
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return null;
        }
    }

    /**
     * Guardar en localStorage
     */
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
        }
    }

    /**
     * Limpiar logs antiguos
     */
    clearLogs() {
        this.errors = [];
        this.warnings = [];
        this.logs = [];
        localStorage.removeItem('dashoffice_errors');
        localStorage.removeItem('dashoffice_warnings');
        localStorage.removeItem('dashoffice_logs');
        console.log('🗑️ [ErrorMonitor] Logs limpiados');
    }

    /**
     * Inicializar monitores globales
     */
    init() {
        if (this.isInitialized) {
            return; // Silenciosamente retornar si ya está inicializado
        }

        console.log('🚨 [ErrorMonitor] Inicializando monitores globales...');

        // 1. Capturar errores globales de JavaScript
        this.setupGlobalErrorHandler();

        // 2. Capturar promesas rechazadas no manejadas
        this.setupUnhandledRejectionHandler();

        // 3. Capturar errores de consola
        this.setupConsoleMonitor();

        // 4. Capturar errores de red
        this.setupNetworkMonitor();

        // 5. Monitor de performance
        this.setupPerformanceMonitor();

        this.isInitialized = true;
        console.log('✅ [ErrorMonitor] Sistema de monitoreo activo');
    }

    /**
     * 1. Handler global de errores de JavaScript
     */
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            console.error('🔴 [GLOBAL ERROR] Error no capturado:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                timestamp: new Date().toISOString()
            });

            this.logError({
                type: 'GLOBAL_ERROR',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                col: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });

            // Mostrar alerta visual
            this.showErrorAlert('Error Global', event.message);

            // NO prevenir el comportamiento por defecto
            // para que también se registre en consola
            return false;
        });

        console.log('✅ [ErrorMonitor] Global error handler configurado');
    }

    /**
     * 2. Handler de promesas rechazadas no manejadas
     */
    setupUnhandledRejectionHandler() {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🔴 [UNHANDLED PROMISE] Promesa rechazada no capturada:', {
                reason: event.reason,
                promise: event.promise,
                timestamp: new Date().toISOString()
            });

            this.logError({
                type: 'UNHANDLED_PROMISE',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });

            // Mostrar alerta visual
            this.showErrorAlert('Promesa Rechazada', event.reason?.message || String(event.reason));

            // Prevenir el comportamiento por defecto
            event.preventDefault();
        });

        console.log('✅ [ErrorMonitor] Unhandled rejection handler configurado');
    }

    /**
     * 3. Monitor de console.error y console.warn
     */
    setupConsoleMonitor() {
        // Guardar referencias originales
        const originalError = console.error;
        const originalWarn = console.warn;

        // Override console.error
        console.error = (...args) => {
            this.logError({
                type: 'CONSOLE_ERROR',
                message: args.map(arg => String(arg)).join(' '),
                args: args,
                timestamp: new Date().toISOString()
            });

            // Llamar al original
            originalError.apply(console, args);
        };

        // Override console.warn
        console.warn = (...args) => {
            this.logWarning({
                type: 'CONSOLE_WARN',
                message: args.map(arg => String(arg)).join(' '),
                args: args,
                timestamp: new Date().toISOString()
            });

            // Llamar al original
            originalWarn.apply(console, args);
        };

        console.log('✅ [ErrorMonitor] Console monitor configurado');
    }

    /**
     * 4. Monitor de errores de red
     */
    setupNetworkMonitor() {
        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            const startTime = performance.now();
            const url = args[0];

            try {
                const response = await originalFetch(...args);
                const duration = performance.now() - startTime;

                // Alertar si la llamada tardó más de 3 segundos
                if (duration > 3000) {
                    console.warn(`⚠️ [PERFORMANCE] Llamada lenta: ${url} (${Math.round(duration)}ms)`);
                }

                // Si hay error HTTP (pero NO logs batch sin token)
                if (!response.ok) {
                    // Ignorar errores de /api/logs/batch cuando no hay token
                    if (url.includes('/api/logs/batch') && !localStorage.getItem('token')) {
                        return response;
                    }

                    const errorData = {
                        type: 'NETWORK_ERROR',
                        message: `HTTP ${response.status}: ${url}`,
                        status: response.status,
                        url: url,
                        timestamp: new Date().toISOString()
                    };

                    this.logError(errorData);
                    console.error('🔴 [NETWORK ERROR]', errorData);
                }

                return response;
            } catch (error) {
                // Ignorar COMPLETAMENTE errores de API cuando no hay token
                const noToken = !localStorage.getItem('token');
                const isApiCall = url.includes('/api/');

                if (noToken && isApiCall) {
                    // No registrar nada, solo lanzar el error
                    throw error;
                }

                const errorData = {
                    type: 'NETWORK_EXCEPTION',
                    message: `Fetch exception: ${url}`,
                    error: error.message,
                    url: url,
                    timestamp: new Date().toISOString()
                };

                this.logError(errorData);
                // NO loguear en consola para evitar spam

                throw error;
            }
        };
    }

    /**
     * 5. Monitor de performance
     */
    setupPerformanceMonitor() {
        // Monitor de renders lentos (opcional)
        if (typeof PerformanceObserver !== 'undefined') {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 1000) {
                            console.warn(`⚠️ [PERFORMANCE] Operación lenta detectada: ${entry.name} (${entry.duration}ms)`);

                            this.logWarning({
                                type: 'PERFORMANCE',
                                message: `Operación lenta: ${entry.name}`,
                                duration: entry.duration,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                });

                observer.observe({ entryTypes: ['measure', 'navigation'] });
                console.log('✅ [ErrorMonitor] Performance monitor configurado');
            } catch (error) {
                console.warn('⚠️ [ErrorMonitor] No se pudo configurar performance monitor:', error);
            }
        }
    }

    /**
     * Registrar log general (para debug)
     */
    log(message, data = {}) {
        const logEntry = {
            message,
            data,
            timestamp: new Date().toISOString(),
            type: 'LOG'
        };

        this.logs.push(logEntry);

        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        this.saveToStorage('dashoffice_logs', this.logs);

        // Enviar a backend de forma asíncrona
        this.sendToBackend({
            log_type: 'INFO',
            category: 'FRONTEND',
            message,
            data,
            severity: 1
        });
    }

    /**
     * Registrar error
     */
    logError(errorData) {
        this.errors.push(errorData);

        // Mantener solo los últimos N errores
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Guardar en localStorage
        this.saveToStorage('dashoffice_errors', this.errors);

        // Enviar a backend
        this.sendToBackend({
            log_type: errorData.type === 'CRITICAL' ? 'CRITICAL' : 'ERROR',
            category: errorData.category || 'FRONTEND',
            message: errorData.message,
            data: errorData,
            stack_trace: errorData.stack,
            severity: errorData.type === 'CRITICAL' ? 4 : 3
        });
    }

    /**
     * Registrar warning
     */
    logWarning(warningData) {
        this.warnings.push(warningData);

        if (this.warnings.length > this.maxErrors) {
            this.warnings.shift();
        }

        // Guardar en localStorage
        this.saveToStorage('dashoffice_warnings', this.warnings);

        // Enviar a backend
        this.sendToBackend({
            log_type: 'WARNING',
            category: warningData.category || 'FRONTEND',
            message: warningData.message,
            data: warningData,
            severity: 2
        });
    }

    /**
     * Mostrar alerta visual de error
     */
    showErrorAlert(title, message) {
        // Solo en desarrollo
        if (process.env.NODE_ENV !== 'development') return;

        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee2e2;
            border: 2px solid #dc2626;
            border-radius: 8px;
            padding: 16px;
            max-width: 400px;
            z-index: 99999;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
        `;

        alertDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <div style="font-weight: bold; color: #991b1b; margin-bottom: 4px;">
                        🔴 ${title}
                    </div>
                    <div style="color: #7f1d1d; font-size: 13px;">
                        ${message.substring(0, 200)}
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; cursor: pointer; font-size: 20px; color: #991b1b;">
                    ×
                </button>
            </div>
        `;

        document.body.appendChild(alertDiv);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }

    /**
     * Obtener todos los errores
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Obtener todos los warnings
     */
    getWarnings() {
        return this.warnings;
    }

    /**
     * Limpiar logs
     */
    clear() {
        this.errors = [];
        this.warnings = [];
        localStorage.removeItem('errorLog');
        console.log('🧹 [ErrorMonitor] Logs limpiados');
    }

    /**
     * Obtener resumen
     */
    getSummary() {
        return {
            totalErrors: this.errors.length,
            totalWarnings: this.warnings.length,
            lastError: this.errors[this.errors.length - 1],
            lastWarning: this.warnings[this.warnings.length - 1]
        };
    }

    /**
     * Enviar log a backend (agregar a cola)
     */
    sendToBackend(logData) {
        // Agregar contexto del usuario si existe
        const user = this.getCurrentUser();

        const enrichedLog = {
            ...logData,
            user_id: user?.id,
            tenant_id: user?.tenantId,
            url: window.location.href,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        // Agregar a la cola
        this.backendQueue.push(enrichedLog);

        // Guardar cola en localStorage por si se cierra el navegador
        this.saveToStorage('dashoffice_backend_queue', this.backendQueue);

        // Si alcanzamos el tamaño del batch, flush inmediato
        if (this.backendQueue.length >= this.batchSize) {
            this.flushToBackend();
        }
    }

    /**
     * Flush de logs al backend
     */
    async flushToBackend() {
        if (this.backendQueue.length === 0 || !this.isOnline) return;

        // Truncar logs antes de enviar para evitar HTTP 413
        const logsToSend = [...this.backendQueue].map(log => ({
            ...log,
            message: this.truncateString(log.message, 500),
            stack_trace: this.truncateString(log.stack_trace, 1000),
            data: this.truncateData(log.data)
        }));

        this.backendQueue = [];
        this.saveToStorage('dashoffice_backend_queue', []);

        try {
            const token = localStorage.getItem('cocolu_token') || localStorage.getItem('token');

            // Solo enviar si hay usuario logueado
            if (!token) {
                return; // Silenciosamente no enviar si no hay token
            }

            const response = await fetch('/api/logs/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ logs: logsToSend })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log(`[ErrorMonitor] ✅ ${logsToSend.length} logs enviados a BD`);

        } catch (error) {
            // Silenciosamente guardar para reintentar, sin mostrar error
            this.backendQueue.push(...logsToSend);
            this.saveToStorage('dashoffice_backend_queue', this.backendQueue);
        }
    }

    /**
     * Procesar cola de backend (cuando vuelve la conexión)
     */
    async processBackendQueue() {
        console.log('[ErrorMonitor] Procesando cola de backend...');

        // Cargar cola guardada
        const savedQueue = this.loadFromStorage('dashoffice_backend_queue') || [];
        if (savedQueue.length > 0) {
            this.backendQueue.push(...savedQueue);
        }

        await this.flushToBackend();
    }

    /**
     * Obtener usuario actual del localStorage
     */
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Truncar string a máximo de caracteres
     */
    truncateString(str, maxLength) {
        if (!str || typeof str !== 'string') return str;
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '... [truncated]';
    }

    /**
     * Truncar objetos grandes para evitar payloads enormes
     */
    truncateData(data) {
        try {
            const str = JSON.stringify(data);
            if (str.length > 5000) {
                return {
                    _truncated: true,
                    preview: str.substring(0, 5000) + '...',
                    originalSize: str.length
                };
            }
            return data;
        } catch (error) {
            return { _error: 'Failed to serialize data' };
        }
    }
}

// Instancia singleton
const errorMonitor = new ErrorMonitor();

// Auto-inicializar
if (typeof window !== 'undefined') {
    errorMonitor.init();
}

export default errorMonitor;
