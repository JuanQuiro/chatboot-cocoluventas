/**
 * Health Monitor
 * RESILIENCIA: Monitorear salud del sistema y auto-recuperación
 */

import logger from '../utils/logger.js';
import database from '../config/database.js';

class HealthMonitor {
    constructor() {
        this.checks = new Map();
        this.healthStatus = {
            status: 'healthy',
            checks: {},
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };
        this.monitoringInterval = null;
        this.alertThreshold = 3; // Alertar después de 3 fallos consecutivos
        this.consecutiveFailures = new Map();
    }

    /**
     * Registrar un health check
     */
    registerCheck(name, checkFn, options = {}) {
        this.checks.set(name, {
            fn: checkFn,
            critical: options.critical || false,
            timeout: options.timeout || 5000,
            interval: options.interval || 30000
        });

        logger.info(`Health check registered: ${name}`);
    }

    /**
     * Iniciar monitoreo
     */
    startMonitoring(interval = 30000) {
        if (this.monitoringInterval) {
            logger.warn('Health monitoring already started');
            return;
        }

        logger.info('Starting health monitoring');
        
        // Run immediately
        this.runAllChecks();
        
        // Then run periodically
        this.monitoringInterval = setInterval(() => {
            this.runAllChecks();
        }, interval);
    }

    /**
     * Detener monitoreo
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            logger.info('Health monitoring stopped');
        }
    }

    /**
     * Ejecutar todos los checks
     */
    async runAllChecks() {
        const checks = {};
        let overallStatus = 'healthy';

        for (const [name, check] of this.checks.entries()) {
            const result = await this.runCheck(name, check);
            checks[name] = result;

            if (!result.healthy) {
                if (check.critical) {
                    overallStatus = 'critical';
                } else if (overallStatus === 'healthy') {
                    overallStatus = 'degraded';
                }

                // Track consecutive failures
                const failures = (this.consecutiveFailures.get(name) || 0) + 1;
                this.consecutiveFailures.set(name, failures);

                if (failures >= this.alertThreshold) {
                    this.sendAlert(name, result, failures);
                }
            } else {
                // Reset failure counter on success
                this.consecutiveFailures.set(name, 0);
            }
        }

        this.healthStatus = {
            status: overallStatus,
            checks,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        };

        if (overallStatus !== 'healthy') {
            logger.warn('System health degraded', { status: overallStatus, checks });
        }
    }

    /**
     * Ejecutar un check individual
     */
    async runCheck(name, check) {
        const startTime = Date.now();
        
        try {
            const result = await Promise.race([
                check.fn(),
                this.timeout(check.timeout, name)
            ]);

            const duration = Date.now() - startTime;

            return {
                healthy: true,
                duration,
                message: result?.message || 'OK',
                details: result?.details || {}
            };
        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error(`Health check failed: ${name}`, {
                error: error.message,
                duration
            });

            return {
                healthy: false,
                duration,
                message: error.message,
                error: error.toString()
            };
        }
    }

    timeout(ms, checkName) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Health check ${checkName} timed out after ${ms}ms`));
            }, ms);
        });
    }

    /**
     * Enviar alerta
     */
    async sendAlert(checkName, result, failureCount) {
        logger.error('ALERT: Health check failing repeatedly', {
            check: checkName,
            consecutiveFailures: failureCount,
            error: result.error,
            threshold: this.alertThreshold
        });

        // Aquí puedes integrar con servicios de alerting
        // como PagerDuty, Slack, Email, etc.
        
        // Intentar auto-recuperación
        await this.attemptRecovery(checkName);
    }

    /**
     * Intentar auto-recuperación
     */
    async attemptRecovery(checkName) {
        logger.info(`Attempting auto-recovery for: ${checkName}`);

        try {
            switch (checkName) {
                case 'database':
                    await this.recoverDatabase();
                    break;
                case 'cache':
                    await this.recoverCache();
                    break;
                default:
                    logger.warn(`No recovery strategy for ${checkName}`);
            }
        } catch (error) {
            logger.error(`Recovery failed for ${checkName}`, error);
        }
    }

    async recoverDatabase() {
        logger.info('Attempting database reconnection...');
        try {
            await database.disconnect();
            await database.connect();
            logger.info('Database reconnected successfully');
        } catch (error) {
            logger.error('Database recovery failed', error);
            throw error;
        }
    }

    async recoverCache() {
        logger.info('Attempting cache recovery...');
        // Implementar lógica de recuperación de cache
    }

    /**
     * Obtener estado de salud
     */
    getHealth() {
        return this.healthStatus;
    }

    /**
     * Endpoint para health check
     */
    async healthCheck() {
        const health = this.getHealth();
        
        return {
            ...health,
            ok: health.status === 'healthy'
        };
    }
}

// Singleton
const healthMonitor = new HealthMonitor();

// Registrar checks por defecto
healthMonitor.registerCheck('memory', async () => {
    const usage = process.memoryUsage();
    const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100;
    
    if (heapUsedPercent > 90) {
        throw new Error(`Memory usage critical: ${heapUsedPercent.toFixed(2)}%`);
    }
    
    return {
        message: `Memory usage: ${heapUsedPercent.toFixed(2)}%`,
        details: usage
    };
}, { critical: true });

healthMonitor.registerCheck('database', async () => {
    const result = await database.healthCheck();
    
    if (result.status !== 'healthy') {
        throw new Error(result.message);
    }
    
    return result;
}, { critical: true });

export default healthMonitor;
