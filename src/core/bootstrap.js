/**
 * Bootstrap: Configuración del DI Container
 * MEJORA: Inyección de dependencias centralizada
 */

import container from './di-container.js';
import { InMemoryEventBus } from './adapters/InMemoryEventBus.js';
import { BuilderBotAdapter } from './adapters/BuilderBotAdapter.js';
import { SellerAssignmentService } from './domain/services/SellerAssignmentService.js';
import { AssignSellerHandler } from './application/commands/handlers/AssignSellerHandler.js';
import sellersManager from '../services/sellers.service.js';
import analyticsService from '../services/analytics.service.js';
import logger from '../utils/logger.js';
import persistence from '../utils/persistence.js';
import errorHandler from '../utils/error-handler.js';
import healthCheck from '../utils/health-check.js';

/**
 * Configurar todas las dependencias
 */
export async function bootstrapContainer() {
    logger.info('🔧 Bootstrapping DI Container...');

    // === INFRASTRUCTURE ===
    
    // Event Bus
    container.registerSingleton('eventBus', () => new InMemoryEventBus());
    
    // Persistence
    container.registerInstance('persistence', persistence);
    
    // Logger
    container.registerInstance('logger', logger);
    
    // Error Handler
    container.registerInstance('errorHandler', errorHandler);
    
    // Health Check
    container.registerInstance('healthCheck', healthCheck);

    // === ADAPTERS ===
    
    // BuilderBot Adapter (Anti-Corruption Layer)
    container.registerSingleton('builderBotAdapter', (c) => {
        const eventBus = c.resolve('eventBus');
        return new BuilderBotAdapter(eventBus);
    });

    // === REPOSITORIES ===
    
    // Sellers Repository (usando el manager existente temporalmente)
    container.registerInstance('sellersRepository', sellersManager);
    
    // Analytics Repository
    container.registerInstance('analyticsRepository', analyticsService);

    // === DOMAIN SERVICES ===
    
    // Seller Assignment Service
    container.registerSingleton('sellerAssignmentService', () => {
        return new SellerAssignmentService('round-robin');
    });

    // === COMMAND HANDLERS ===
    
    // Assign Seller Handler
    container.registerTransient('assignSellerHandler', (c) => {
        return new AssignSellerHandler(
            c.resolve('sellersRepository'),
            c.resolve('sellerAssignmentService'),
            c.resolve('eventBus')
        );
    });

    // === EVENT HANDLERS ===
    
    // Configurar event handlers
    const eventBus = container.resolve('eventBus');
    
    // Handler: cuando se asigna un vendedor, registrar en analytics
    eventBus.subscribe('seller.assigned', async (event) => {
        const analytics = container.resolve('analyticsRepository');
        analytics.trackConversation(event.aggregateId);
        logger.info('Analytics updated for seller assignment', {
            userId: event.aggregateId,
            sellerId: event.data.sellerId
        });
    });

    // Handler: guardar eventos importantes
    eventBus.subscribe('seller.assigned', async (event) => {
        const persist = container.resolve('persistence');
        await persist.save(`event_${event.eventId}`, event.toJSON());
    });

    logger.info('✅ DI Container bootstrapped successfully');
    
    return container;
}

/**
 * Obtener servicio del container
 */
export function getService(serviceName) {
    return container.resolve(serviceName);
}

/**
 * Crear scope para request
 */
export function createRequestScope() {
    return container.createScope();
}

export default container;
