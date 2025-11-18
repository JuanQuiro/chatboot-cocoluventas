/**
 * Port (Interface) para Event Bus
 * MEJORA: Hexagonal Architecture - Event Bus port
 */

export class IEventBus {
    /**
     * Publicar evento
     * @param {string} eventName
     * @param {Object} payload
     * @returns {Promise<void>}
     */
    async publish(eventName, payload) {
        throw new Error('Method not implemented: publish');
    }

    /**
     * Suscribirse a evento
     * @param {string} eventName
     * @param {Function} handler
     * @returns {void}
     */
    subscribe(eventName, handler) {
        throw new Error('Method not implemented: subscribe');
    }

    /**
     * Desuscribirse de evento
     * @param {string} eventName
     * @param {Function} handler
     * @returns {void}
     */
    unsubscribe(eventName, handler) {
        throw new Error('Method not implemented: unsubscribe');
    }

    /**
     * Publicar múltiples eventos
     * @param {Array<{eventName: string, payload: Object}>} events
     * @returns {Promise<void>}
     */
    async publishBatch(events) {
        throw new Error('Method not implemented: publishBatch');
    }
}
