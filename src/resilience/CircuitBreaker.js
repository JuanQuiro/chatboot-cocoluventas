/**
 * Circuit Breaker Pattern
 * RESILIENCIA: Prevenir cascadas de fallos
 */

import logger from '../utils/logger.js';

const STATES = {
    CLOSED: 'CLOSED',     // Normal operation
    OPEN: 'OPEN',         // Circuit open, reject requests
    HALF_OPEN: 'HALF_OPEN' // Testing if service recovered
};

class CircuitBreaker {
    constructor(options = {}) {
        this.name = options.name || 'circuit-breaker';
        this.failureThreshold = options.failureThreshold || 5;
        this.successThreshold = options.successThreshold || 2;
        this.timeout = options.timeout || 60000; // 1 minute
        this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
        
        this.state = STATES.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            rejectedRequests: 0,
            lastFailure: null,
            lastSuccess: null
        };
    }

    async execute(fn, fallback = null) {
        this.stats.totalRequests++;

        if (this.state === STATES.OPEN) {
            if (Date.now() < this.nextAttempt) {
                this.stats.rejectedRequests++;
                logger.warn(`Circuit breaker ${this.name} is OPEN, rejecting request`);
                
                if (fallback) {
                    return fallback();
                }
                
                throw new Error(`Circuit breaker ${this.name} is OPEN`);
            } else {
                // Try half-open
                this.state = STATES.HALF_OPEN;
                logger.info(`Circuit breaker ${this.name} entering HALF_OPEN state`);
            }
        }

        try {
            const result = await Promise.race([
                fn(),
                this.timeoutPromise()
            ]);

            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure(error);
            
            if (fallback) {
                return fallback();
            }
            
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;
        this.stats.successfulRequests++;
        this.stats.lastSuccess = new Date().toISOString();

        if (this.state === STATES.HALF_OPEN) {
            this.successCount++;
            
            if (this.successCount >= this.successThreshold) {
                this.state = STATES.CLOSED;
                this.successCount = 0;
                logger.info(`Circuit breaker ${this.name} is now CLOSED`);
            }
        }
    }

    onFailure(error) {
        this.failureCount++;
        this.stats.failedRequests++;
        this.stats.lastFailure = new Date().toISOString();

        logger.error(`Circuit breaker ${this.name} recorded failure`, {
            error: error.message,
            failureCount: this.failureCount,
            threshold: this.failureThreshold
        });

        if (this.failureCount >= this.failureThreshold) {
            this.state = STATES.OPEN;
            this.nextAttempt = Date.now() + this.resetTimeout;
            
            logger.error(`Circuit breaker ${this.name} is now OPEN`, {
                nextAttempt: new Date(this.nextAttempt).toISOString()
            });
        }
    }

    timeoutPromise() {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Operation timed out after ${this.timeout}ms`));
            }, this.timeout);
        });
    }

    getState() {
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            stats: this.stats,
            nextAttempt: this.state === STATES.OPEN 
                ? new Date(this.nextAttempt).toISOString() 
                : null
        };
    }

    reset() {
        this.state = STATES.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        logger.info(`Circuit breaker ${this.name} manually reset`);
    }
}

export default CircuitBreaker;
