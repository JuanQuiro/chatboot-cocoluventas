/**
 * Circuit Breaker Pattern
 * MEJORA: Protección contra fallos en cascada
 */

class CircuitBreaker {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 60000; // 1 minuto
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failures = 0;
        this.nextAttempt = Date.now();
        this.successCount = 0;
    }

    /**
     * Ejecutar función con circuit breaker
     */
    async execute(fn) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new Error('Circuit breaker is OPEN');
            }
            // Intentar cambiar a HALF_OPEN
            this.state = 'HALF_OPEN';
            console.log('🔄 Circuit breaker: HALF_OPEN');
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    /**
     * Manejar éxito
     */
    onSuccess() {
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= 2) {
                this.state = 'CLOSED';
                this.failures = 0;
                this.successCount = 0;
                console.log('✅ Circuit breaker: CLOSED');
            }
        } else {
            this.failures = 0;
        }
    }

    /**
     * Manejar fallo
     */
    onFailure() {
        this.failures++;
        this.successCount = 0;

        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.resetTimeout;
            console.error(`❌ Circuit breaker: OPEN (${this.failures} failures)`);
        }
    }

    /**
     * Reset manual
     */
    reset() {
        this.state = 'CLOSED';
        this.failures = 0;
        this.successCount = 0;
        console.log('🔄 Circuit breaker: RESET');
    }

    /**
     * Estado actual
     */
    getState() {
        return {
            state: this.state,
            failures: this.failures,
            threshold: this.failureThreshold,
            nextAttempt: this.state === 'OPEN' 
                ? new Date(this.nextAttempt).toISOString() 
                : null
        };
    }
}

export default CircuitBreaker;
