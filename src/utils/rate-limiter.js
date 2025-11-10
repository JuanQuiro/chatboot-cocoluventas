/**
 * Rate Limiter para prevenir abuso
 * MEJORA: Protección contra spam y ataques
 */

class RateLimiter {
    constructor(options = {}) {
        this.maxRequests = options.maxRequests || 10;
        this.windowMs = options.windowMs || 60000; // 1 minuto por defecto
        this.requests = new Map();
        
        // Limpiar datos antiguos cada minuto
        setInterval(() => this.cleanup(), this.windowMs);
    }

    /**
     * Verificar si el usuario puede hacer una petición
     */
    check(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        
        // Filtrar peticiones dentro de la ventana de tiempo
        const recentRequests = userRequests.filter(
            timestamp => now - timestamp < this.windowMs
        );
        
        if (recentRequests.length >= this.maxRequests) {
            return {
                allowed: false,
                retryAfter: Math.ceil((recentRequests[0] + this.windowMs - now) / 1000)
            };
        }
        
        // Agregar nueva petición
        recentRequests.push(now);
        this.requests.set(userId, recentRequests);
        
        return {
            allowed: true,
            remaining: this.maxRequests - recentRequests.length
        };
    }

    /**
     * Limpiar datos antiguos
     */
    cleanup() {
        const now = Date.now();
        const toDelete = [];
        
        for (const [userId, timestamps] of this.requests.entries()) {
            const recent = timestamps.filter(ts => now - ts < this.windowMs);
            if (recent.length === 0) {
                toDelete.push(userId);
            } else {
                this.requests.set(userId, recent);
            }
        }
        
        toDelete.forEach(userId => this.requests.delete(userId));
        
        if (toDelete.length > 0) {
            console.log(`🧹 Rate limiter: limpiados ${toDelete.length} usuarios inactivos`);
        }
    }

    /**
     * Reset de un usuario específico
     */
    reset(userId) {
        this.requests.delete(userId);
    }

    /**
     * Obtener estadísticas
     */
    getStats() {
        return {
            totalUsers: this.requests.size,
            maxRequests: this.maxRequests,
            windowMs: this.windowMs
        };
    }
}

// Diferentes limiters para diferentes casos
export const messageLimiter = new RateLimiter({
    maxRequests: 20,
    windowMs: 60000 // 20 mensajes por minuto
});

export const apiLimiter = new RateLimiter({
    maxRequests: 100,
    windowMs: 60000 // 100 requests por minuto
});

export default RateLimiter;
