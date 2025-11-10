/**
 * Adapter: In-Memory Event Bus
 * MEJORA: Implementación del port IEventBus
 */

import { IEventBus } from '../ports/IEventBus.js';
import logger from '../../utils/logger.js';

export class InMemoryEventBus extends IEventBus {
    constructor() {
        super();
        this.handlers = new Map();
        this.eventHistory = [];
        this.maxHistory = 1000;
    }

    /**
     * Publicar evento
     */
    async publish(eventName, payload) {
        const event = {
            eventName,
            payload,
            timestamp: new Date().toISOString(),
            id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        // Guardar en historial
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistory) {
            this.eventHistory.shift();
        }

        logger.debug('Event published', { eventName, eventId: event.id });

        // Ejecutar handlers
        const handlers = this.handlers.get(eventName) || [];
        
        const results = await Promise.allSettled(
            handlers.map(handler => handler(payload, event))
        );

        // Log errores
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                logger.error('Event handler failed', {
                    eventName,
                    error: result.reason.message,
                    handlerIndex: index
                });
            }
        });
    }

    /**
     * Suscribirse a evento
     */
    subscribe(eventName, handler) {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName).push(handler);
        
        logger.debug('Event handler subscribed', { eventName });
    }

    /**
     * Desuscribirse
     */
    unsubscribe(eventName, handler) {
        const handlers = this.handlers.get(eventName);
        if (!handlers) return;

        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
            logger.debug('Event handler unsubscribed', { eventName });
        }
    }

    /**
     * Publicar batch
     */
    async publishBatch(events) {
        await Promise.all(
            events.map(({ eventName, payload }) => 
                this.publish(eventName, payload)
            )
        );
    }

    /**
     * Obtener historial de eventos
     */
    getEventHistory(eventName = null, limit = 50) {
        let history = this.eventHistory;
        
        if (eventName) {
            history = history.filter(e => e.eventName === eventName);
        }
        
        return history.slice(-limit);
    }

    /**
     * Limpiar historial
     */
    clearHistory() {
        this.eventHistory = [];
    }
}
