/**
 * Dependency Injection Container
 * MEJORA CRÍTICA: IoC Container para inversión de dependencias
 */

class DIContainer {
    constructor() {
        this.services = new Map();
        this.instances = new Map();
        this.factories = new Map();
    }

    /**
     * Registrar servicio Singleton
     */
    registerSingleton(name, factory) {
        this.services.set(name, {
            lifetime: 'singleton',
            factory
        });
        return this;
    }

    /**
     * Registrar servicio Transient (nueva instancia cada vez)
     */
    registerTransient(name, factory) {
        this.services.set(name, {
            lifetime: 'transient',
            factory
        });
        return this;
    }

    /**
     * Registrar servicio Scoped (por request)
     */
    registerScoped(name, factory) {
        this.services.set(name, {
            lifetime: 'scoped',
            factory
        });
        return this;
    }

    /**
     * Registrar instancia existente
     */
    registerInstance(name, instance) {
        this.instances.set(name, instance);
        return this;
    }

    /**
     * Resolver dependencia
     */
    resolve(name, scope = null) {
        // Si es instancia directa
        if (this.instances.has(name)) {
            return this.instances.get(name);
        }

        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service not registered: ${name}`);
        }

        switch (service.lifetime) {
            case 'singleton':
                if (!this.instances.has(name)) {
                    this.instances.set(name, service.factory(this));
                }
                return this.instances.get(name);

            case 'transient':
                return service.factory(this);

            case 'scoped':
                if (!scope) {
                    throw new Error(`Scoped service ${name} requires a scope`);
                }
                if (!scope.has(name)) {
                    scope.set(name, service.factory(this));
                }
                return scope.get(name);

            default:
                throw new Error(`Unknown lifetime: ${service.lifetime}`);
        }
    }

    /**
     * Crear scope para servicios scoped
     */
    createScope() {
        return new Map();
    }

    /**
     * Verificar si servicio está registrado
     */
    has(name) {
        return this.services.has(name) || this.instances.has(name);
    }

    /**
     * Reset del container (útil para testing)
     */
    reset() {
        this.services.clear();
        this.instances.clear();
        this.factories.clear();
    }

    /**
     * Obtener todos los servicios registrados
     */
    getRegisteredServices() {
        return Array.from(this.services.keys());
    }
}

// Singleton global del container
const container = new DIContainer();

export default container;
export { DIContainer };
