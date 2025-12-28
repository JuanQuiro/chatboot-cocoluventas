/**
 * Dependency Injection Container
 */

import { logger } from './logger.js';

class Container {
    constructor() {
        this.services = new Map();
        this.instances = new Map();
    }

    /**
     * Register a service as singleton
     */
    register(name, factory, dependencies = []) {
        this.services.set(name, {
            factory,
            dependencies,
            singleton: true
        });
        logger.debug({ service: name }, 'Service registered as singleton');
    }

    /**
     * Register a service as transient (new instance each time)
     */
    registerTransient(name, factory, dependencies = []) {
        this.services.set(name, {
            factory,
            dependencies,
            singleton: false
        });
        logger.debug({ service: name }, 'Service registered as transient');
    }

    /**
     * Resolve a service by name
     */
    resolve(name) {
        // Check if already instantiated (for singletons)
        if (this.instances.has(name)) {
            return this.instances.get(name);
        }

        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service "${name}" not registered in container`);
        }

        // Resolve dependencies
        const resolvedDeps = service.dependencies.map(dep => this.resolve(dep));

        // Create instance
        const instance = service.factory(...resolvedDeps);

        // Store if singleton
        if (service.singleton) {
            this.instances.set(name, instance);
        }

        logger.debug({ service: name }, 'Service resolved');
        return instance;
    }

    /**
     * Check if service is registered
     */
    has(name) {
        return this.services.has(name);
    }

    /**
     * Clear all instances (useful for testing)
     */
    clear() {
        this.instances.clear();
        logger.debug('Container instances cleared');
    }

    /**
     * Reset container (clear services and instances)
     */
    reset() {
        this.services.clear();
        this.instances.clear();
        logger.debug('Container reset');
    }
}

// Export singleton container
export const container = new Container();

// Helper to register all application services
export function registerServices() {
    // Import repositories
    import('../repositories/client.repository.js').then(m => {
        container.register('clientRepository', () => m.default);
    });

    import('../repositories/product.repository.js').then(m => {
        container.register('productRepository', () => m.default);
    });

    import('../repositories/order.repository.js').then(m => {
        container.register('orderRepository', () => m.default);
    });

    import('../repositories/seller.repository.js').then(m => {
        container.register('sellerRepository', () => m.default);
    });

    // Import services
    import('../services/clients.service.js').then(m => {
        container.register('clientsService', () => m.default);
    });

    import('../services/products.service.js').then(m => {
        container.register('productsService', () => m.default);
    });

    import('../services/orders.service.js').then(m => {
        container.register('ordersService', () => m.default);
    });

    import('../services/payments.service.js').then(m => {
        container.register('paymentsService', () => m.default);
    });

    import('../services/inventory.service.js').then(m => {
        container.register('inventoryService', () => m.default);
    });

    logger.info('All services registered in DI container');
}
