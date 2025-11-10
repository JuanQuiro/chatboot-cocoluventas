/**
 * Advanced Rate Limiter con Token Bucket
 * RESILIENCIA: Prevenir sobrecarga del sistema
 */

import logger from '../utils/logger.js';

class TokenBucket {
    constructor(capacity, fillRate) {
        this.capacity = capacity;
        this.tokens = capacity;
        this.fillRate = fillRate; // tokens per second
        this.lastRefill = Date.now();
    }

    consume(tokens = 1) {
        this.refill();

        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return { allowed: true, remaining: this.tokens };
        }

        const waitTime = ((tokens - this.tokens) / this.fillRate) * 1000;
        return {
            allowed: false,
            remaining: this.tokens,
            retryAfter: Math.ceil(waitTime / 1000)
        };
    }

    refill() {
        const now = Date.now();
        const elapsed = (now - this.lastRefill) / 1000;
        const tokensToAdd = elapsed * this.fillRate;

        this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
        this.lastRefill = now;
    }
}

class AdvancedRateLimiter {
    constructor() {
        this.buckets = new Map();
        this.config = {
            global: { capacity: 1000, fillRate: 10 },
            api: { capacity: 100, fillRate: 2 },
            database: { capacity: 50, fillRate: 1 },
            external: { capacity: 20, fillRate: 0.5 }
        };
    }

    /**
     * Verificar y consumir tokens
     */
    async check(identifier, type = 'api', tokens = 1) {
        const config = this.config[type] || this.config.api;
        const key = `${type}:${identifier}`;

        if (!this.buckets.has(key)) {
            this.buckets.set(key, new TokenBucket(config.capacity, config.fillRate));
        }

        const bucket = this.buckets.get(key);
        const result = bucket.consume(tokens);

        if (!result.allowed) {
            logger.warn('Rate limit exceeded', {
                type,
                identifier,
                retryAfter: result.retryAfter
            });
        }

        return result;
    }

    /**
     * Adaptive rate limiting
     */
    async adaptiveCheck(identifier, systemLoad) {
        // Ajustar rate limit basado en carga del sistema
        const baseCapacity = 100;
        const adjustedCapacity = Math.floor(baseCapacity * (1 - systemLoad / 100));

        const key = `adaptive:${identifier}`;
        
        if (!this.buckets.has(key)) {
            this.buckets.set(key, new TokenBucket(adjustedCapacity, 2));
        }

        return this.buckets.get(key).consume();
    }

    /**
     * Limpiar buckets inactivos
     */
    cleanup() {
        const now = Date.now();
        const timeout = 300000; // 5 minutes

        for (const [key, bucket] of this.buckets.entries()) {
            if (now - bucket.lastRefill > timeout && bucket.tokens === bucket.capacity) {
                this.buckets.delete(key);
            }
        }

        logger.info(`Rate limiter cleanup: ${this.buckets.size} active buckets`);
    }

    /**
     * Obtener estadísticas
     */
    getStats() {
        const stats = {};
        
        for (const [key, bucket] of this.buckets.entries()) {
            const [type, identifier] = key.split(':');
            if (!stats[type]) stats[type] = [];
            
            stats[type].push({
                identifier,
                tokens: bucket.tokens,
                capacity: bucket.capacity,
                utilization: ((bucket.capacity - bucket.tokens) / bucket.capacity * 100).toFixed(2) + '%'
            });
        }

        return stats;
    }
}

export default new AdvancedRateLimiter();
