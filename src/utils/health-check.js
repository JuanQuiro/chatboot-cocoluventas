/**
 * Health Check System
 * MEJORA: Monitoreo de salud del sistema
 */

class HealthCheck {
    constructor() {
        this.checks = new Map();
        this.status = 'unknown';
        this.lastCheck = null;
    }

    /**
     * Registrar un check
     */
    register(name, checkFn) {
        this.checks.set(name, checkFn);
    }

    /**
     * Ejecutar todos los checks
     */
    async runAll() {
        const results = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            checks: {},
            uptime: process.uptime(),
            memory: process.memoryUsage()
        };

        for (const [name, checkFn] of this.checks.entries()) {
            try {
                const result = await this.runCheck(checkFn);
                results.checks[name] = {
                    status: 'healthy',
                    ...result
                };
            } catch (error) {
                results.checks[name] = {
                    status: 'unhealthy',
                    error: error.message
                };
                results.status = 'unhealthy';
            }
        }

        this.status = results.status;
        this.lastCheck = results.timestamp;

        return results;
    }

    /**
     * Ejecutar un check individual
     */
    async runCheck(checkFn) {
        const start = Date.now();
        const result = await checkFn();
        const duration = Date.now() - start;

        return {
            duration: `${duration}ms`,
            ...result
        };
    }

    /**
     * Check de memoria
     */
    static checkMemory() {
        const used = process.memoryUsage();
        const heapUsedPercent = (used.heapUsed / used.heapTotal) * 100;

        return {
            heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
            heapUsedPercent: `${heapUsedPercent.toFixed(2)}%`,
            status: heapUsedPercent > 90 ? 'warning' : 'healthy'
        };
    }

    /**
     * Check de CPU
     */
    static async checkCPU() {
        const usage = process.cpuUsage();
        return {
            user: usage.user,
            system: usage.system,
            status: 'healthy'
        };
    }

    /**
     * Check básico
     */
    static checkBasic() {
        return {
            uptime: `${Math.floor(process.uptime())}s`,
            pid: process.pid,
            nodeVersion: process.version,
            platform: process.platform
        };
    }
}

// Instancia global
const healthCheck = new HealthCheck();

// Registrar checks básicos
healthCheck.register('basic', HealthCheck.checkBasic);
healthCheck.register('memory', HealthCheck.checkMemory);
healthCheck.register('cpu', HealthCheck.checkCPU);

export default healthCheck;
