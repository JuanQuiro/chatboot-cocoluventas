/**
 * Servicio de Analytics y Métricas
 * Monitoreo en tiempo real del chatbot
 */

class AnalyticsService {
    constructor() {
        this.metrics = {
            // Métricas de conversación
            totalMessages: 0,
            incomingMessages: 0,
            outgoingMessages: 0,
            uniqueUsers: new Set(),
            
            // Métricas de tiempo
            averageResponseTime: 0,
            responseTimes: [],
            
            // Métricas de conversión
            totalConversations: 0,
            completedOrders: 0,
            abandonedCarts: 0,
            conversionRate: 0,
            
            // Métricas de soporte
            supportTickets: 0,
            resolvedTickets: 0,
            averageResolutionTime: 0,
            
            // Métricas de productos
            productViews: new Map(),
            productSearches: new Map(),
            popularProducts: [],
            
            // Métricas temporales
            hourlyMetrics: new Map(),
            dailyMetrics: new Map(),
            
            // Engagement
            messagesByHour: Array(24).fill(0),
            activeUsers: new Set(),
            
            // Revenue (si aplicable)
            totalRevenue: 0,
            averageOrderValue: 0
        };
        
        this.events = [];
        this.maxEvents = 1000; // Límite de eventos en memoria
    }

    /**
     * Registrar mensaje
     */
    trackMessage(userId, direction = 'incoming', timestamp = new Date()) {
        this.metrics.totalMessages++;
        
        if (direction === 'incoming') {
            this.metrics.incomingMessages++;
        } else {
            this.metrics.outgoingMessages++;
        }
        
        this.metrics.uniqueUsers.add(userId);
        this.metrics.activeUsers.add(userId);
        
        // Registrar por hora
        const hour = timestamp.getHours();
        this.metrics.messagesByHour[hour]++;
        
        this.logEvent('message', { userId, direction, timestamp });
    }

    /**
     * Registrar tiempo de respuesta
     */
    trackResponseTime(milliseconds) {
        this.metrics.responseTimes.push(milliseconds);
        
        // Mantener solo últimos 100 tiempos
        if (this.metrics.responseTimes.length > 100) {
            this.metrics.responseTimes.shift();
        }
        
        // Calcular promedio
        const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
        this.metrics.averageResponseTime = Math.round(sum / this.metrics.responseTimes.length);
    }

    /**
     * Registrar vista de producto
     */
    trackProductView(productId, productName) {
        const current = this.metrics.productViews.get(productId) || {
            id: productId,
            name: productName,
            views: 0
        };
        
        current.views++;
        this.metrics.productViews.set(productId, current);
        
        this.updatePopularProducts();
        this.logEvent('product_view', { productId, productName });
    }

    /**
     * Registrar búsqueda de producto
     */
    trackProductSearch(searchTerm) {
        const current = this.metrics.productSearches.get(searchTerm) || 0;
        this.metrics.productSearches.set(searchTerm, current + 1);
        
        this.logEvent('product_search', { searchTerm });
    }

    /**
     * Registrar pedido completado
     */
    trackOrderCompleted(orderId, amount, userId) {
        this.metrics.completedOrders++;
        this.metrics.totalRevenue += amount;
        
        // Calcular valor promedio de orden
        this.metrics.averageOrderValue = 
            this.metrics.totalRevenue / this.metrics.completedOrders;
        
        // Calcular tasa de conversión
        this.metrics.conversionRate = 
            (this.metrics.completedOrders / this.metrics.totalConversations * 100).toFixed(2);
        
        this.logEvent('order_completed', { orderId, amount, userId });
    }

    /**
     * Registrar carrito abandonado
     */
    trackAbandonedCart(userId) {
        this.metrics.abandonedCarts++;
        this.logEvent('cart_abandoned', { userId });
    }

    /**
     * Registrar ticket de soporte
     */
    trackSupportTicket(ticketId, status = 'created') {
        if (status === 'created') {
            this.metrics.supportTickets++;
        } else if (status === 'resolved') {
            this.metrics.resolvedTickets++;
        }
        
        this.logEvent('support_ticket', { ticketId, status });
    }

    /**
     * Registrar nueva conversación
     */
    trackConversation(userId) {
        this.metrics.totalConversations++;
        this.logEvent('conversation_started', { userId });
    }

    /**
     * Actualizar productos populares
     */
    updatePopularProducts() {
        this.metrics.popularProducts = Array.from(this.metrics.productViews.values())
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);
    }

    /**
     * Registrar evento genérico
     */
    logEvent(type, data) {
        const event = {
            type,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.events.push(event);
        
        // Limitar eventos en memoria
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }
    }

    /**
     * Obtener métricas completas
     */
    getMetrics() {
        return {
            ...this.metrics,
            uniqueUsers: this.metrics.uniqueUsers.size,
            activeUsers: this.metrics.activeUsers.size,
            productViews: Array.from(this.metrics.productViews.values()),
            productSearches: Array.from(this.metrics.productSearches.entries()).map(([term, count]) => ({
                term,
                count
            }))
        };
    }

    /**
     * Obtener resumen ejecutivo
     */
    getExecutiveSummary() {
        return {
            totalMessages: this.metrics.totalMessages,
            uniqueUsers: this.metrics.uniqueUsers.size,
            activeConversations: this.metrics.activeUsers.size,
            completedOrders: this.metrics.completedOrders,
            conversionRate: this.metrics.conversionRate,
            totalRevenue: this.metrics.totalRevenue,
            averageOrderValue: this.metrics.averageOrderValue,
            supportTickets: this.metrics.supportTickets,
            averageResponseTime: this.metrics.averageResponseTime
        };
    }

    /**
     * Obtener eventos recientes
     */
    getRecentEvents(limit = 50) {
        return this.events.slice(-limit).reverse();
    }

    /**
     * Limpiar usuarios activos (llamar periódicamente)
     */
    clearInactiveUsers() {
        this.metrics.activeUsers.clear();
    }

    /**
     * Resetear métricas (para testing o nuevo período)
     */
    reset() {
        this.metrics.totalMessages = 0;
        this.metrics.incomingMessages = 0;
        this.metrics.outgoingMessages = 0;
        this.metrics.uniqueUsers.clear();
        this.metrics.activeUsers.clear();
        this.events = [];
    }

    /**
     * MEJORA: Obtener estado completo para persistencia
     */
    getState() {
        return {
            metrics: {
                ...this.metrics,
                uniqueUsers: Array.from(this.metrics.uniqueUsers),
                activeUsers: Array.from(this.metrics.activeUsers),
                productViews: Array.from(this.metrics.productViews.entries()),
                productSearches: Array.from(this.metrics.productSearches.entries())
            },
            events: this.events,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * MEJORA: Restaurar estado desde persistencia
     */
    restoreState(state) {
        if (!state || !state.metrics) return;

        try {
            const m = state.metrics;
            
            this.metrics.totalMessages = m.totalMessages || 0;
            this.metrics.incomingMessages = m.incomingMessages || 0;
            this.metrics.outgoingMessages = m.outgoingMessages || 0;
            this.metrics.uniqueUsers = new Set(m.uniqueUsers || []);
            this.metrics.activeUsers = new Set(m.activeUsers || []);
            this.metrics.productViews = new Map(m.productViews || []);
            this.metrics.productSearches = new Map(m.productSearches || []);
            this.metrics.averageResponseTime = m.averageResponseTime || 0;
            this.metrics.responseTimes = m.responseTimes || [];
            this.metrics.totalConversations = m.totalConversations || 0;
            this.metrics.completedOrders = m.completedOrders || 0;
            this.metrics.abandonedCarts = m.abandonedCarts || 0;
            this.metrics.conversionRate = m.conversionRate || 0;
            this.metrics.supportTickets = m.supportTickets || 0;
            this.metrics.resolvedTickets = m.resolvedTickets || 0;
            this.metrics.totalRevenue = m.totalRevenue || 0;
            this.metrics.averageOrderValue = m.averageOrderValue || 0;
            this.metrics.messagesByHour = m.messagesByHour || Array(24).fill(0);
            
            this.events = state.events || [];
            
            console.log(`✅ Estado de analytics restaurado (${state.timestamp})`);
        } catch (error) {
            console.error('❌ Error restaurando estado de analytics:', error);
        }
    }
}

// Singleton
const analyticsService = new AnalyticsService();

// Limpiar usuarios activos cada hora
setInterval(() => {
    analyticsService.clearInactiveUsers();
}, 3600000);

export default analyticsService;
