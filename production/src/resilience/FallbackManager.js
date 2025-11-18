/**
 * Fallback Manager
 * RESILIENCIA: Graceful degradation cuando servicios fallan
 */

import logger from '../utils/logger.js';

class FallbackManager {
    constructor() {
        this.fallbacks = new Map();
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
    }

    /**
     * Registrar un fallback
     */
    register(serviceName, fallbackFn, options = {}) {
        this.fallbacks.set(serviceName, {
            fn: fallbackFn,
            cache: options.cache !== false,
            cacheTTL: options.cacheTTL || this.cacheTimeout
        });

        logger.info(`Fallback registered for: ${serviceName}`);
    }

    /**
     * Ejecutar con fallback
     */
    async executeWithFallback(serviceName, primaryFn, context = {}) {
        try {
            const result = await primaryFn();
            
            // Cache successful result for fallback
            if (this.fallbacks.has(serviceName)) {
                this.cacheResult(serviceName, result);
            }
            
            return {
                success: true,
                data: result,
                source: 'primary'
            };
        } catch (error) {
            logger.warn(`Primary service failed: ${serviceName}, using fallback`, {
                error: error.message
            });

            return this.useFallback(serviceName, error, context);
        }
    }

    /**
     * Usar fallback
     */
    async useFallback(serviceName, primaryError, context) {
        const fallback = this.fallbacks.get(serviceName);

        if (!fallback) {
            logger.error(`No fallback available for: ${serviceName}`);
            throw primaryError;
        }

        try {
            // Try cached data first
            if (fallback.cache) {
                const cached = this.getCachedResult(serviceName);
                if (cached) {
                    logger.info(`Using cached data for: ${serviceName}`);
                    return {
                        success: true,
                        data: cached,
                        source: 'cache',
                        warning: 'Using cached data due to service failure'
                    };
                }
            }

            // Execute fallback function
            const fallbackResult = await fallback.fn(context);
            
            logger.info(`Fallback executed successfully for: ${serviceName}`);
            
            return {
                success: true,
                data: fallbackResult,
                source: 'fallback',
                warning: 'Using fallback due to service failure'
            };
        } catch (fallbackError) {
            logger.error(`Fallback also failed for: ${serviceName}`, {
                primaryError: primaryError.message,
                fallbackError: fallbackError.message
            });

            // Return degraded response
            return {
                success: false,
                data: null,
                source: 'none',
                error: 'Service temporarily unavailable',
                details: {
                    primary: primaryError.message,
                    fallback: fallbackError.message
                }
            };
        }
    }

    /**
     * Cachear resultado
     */
    cacheResult(serviceName, result) {
        const fallback = this.fallbacks.get(serviceName);
        if (!fallback || !fallback.cache) return;

        this.cache.set(serviceName, {
            data: result,
            timestamp: Date.now(),
            ttl: fallback.cacheTTL
        });
    }

    /**
     * Obtener resultado cacheado
     */
    getCachedResult(serviceName) {
        const cached = this.cache.get(serviceName);
        
        if (!cached) return null;

        const age = Date.now() - cached.timestamp;
        
        if (age > cached.ttl) {
            this.cache.delete(serviceName);
            return null;
        }

        return cached.data;
    }

    /**
     * Limpiar cache
     */
    clearCache(serviceName = null) {
        if (serviceName) {
            this.cache.delete(serviceName);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Obtener estadísticas
     */
    getStats() {
        return {
            registeredFallbacks: Array.from(this.fallbacks.keys()),
            cachedServices: Array.from(this.cache.keys()),
            cacheSize: this.cache.size
        };
    }
}

// Singleton
const fallbackManager = new FallbackManager();

// Registrar fallbacks por defecto
fallbackManager.register('database', async () => {
    // Retornar datos mock o cacheados
    return { message: 'Using fallback data', data: [] };
}, { cache: true });

fallbackManager.register('external-api', async () => {
    return { message: 'External API unavailable', data: null };
}, { cache: true });

fallbackManager.register('seller-assignment', async (context) => {
    // Asignación simple sin specifications
    const sellers = context.sellers || [];
    return sellers[0] || null;
}, { cache: false });

export default fallbackManager;
