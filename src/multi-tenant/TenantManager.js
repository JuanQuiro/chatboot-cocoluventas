/**
 * Tenant Manager - Multi-Tenant System
 * Gestión completa de inquilinos (clientes)
 */

import logger from '../utils/logger.js';

class TenantManager {
    constructor() {
        this.tenants = new Map();
        this.initializeDefaultTenants();
    }

    /**
     * Inicializar tenants por defecto
     */
    initializeDefaultTenants() {
        // Cocoluventas - Primer cliente
        this.registerTenant({
            id: 'cocoluventas',
            name: 'Cocolu Ventas',
            domain: 'cocoluventas.com',
            subdomain: 'cocolu',
            status: 'active',
            config: {
                theme: 'cocolu-theme',
                logo: '/assets/cocolu-logo.png',
                primaryColor: '#FF6B35',
                secondaryColor: '#004E89',
                features: ['chat', 'orders', 'analytics', 'crm'],
                adapters: {
                    whatsapp: 'baileys',
                    payment: 'stripe',
                    email: 'sendgrid'
                },
                limits: {
                    users: 100,
                    storage: '10GB',
                    apiCalls: 100000
                }
            },
            database: {
                name: 'cocoluventas_db',
                prefix: 'cocolu_'
            },
            createdAt: new Date('2024-01-01')
        });

        logger.info('Default tenants initialized');
    }

    /**
     * Registrar nuevo tenant
     */
    registerTenant(tenantData) {
        const tenant = {
            id: tenantData.id,
            name: tenantData.name,
            domain: tenantData.domain,
            subdomain: tenantData.subdomain,
            status: tenantData.status || 'active',
            config: {
                theme: tenantData.config?.theme || 'default-theme',
                logo: tenantData.config?.logo || '/assets/default-logo.png',
                primaryColor: tenantData.config?.primaryColor || '#3B82F6',
                secondaryColor: tenantData.config?.secondaryColor || '#1E40AF',
                accentColor: tenantData.config?.accentColor || '#10B981',
                features: tenantData.config?.features || ['chat', 'orders'],
                adapters: tenantData.config?.adapters || {},
                limits: tenantData.config?.limits || {},
                customCSS: tenantData.config?.customCSS || '',
                locale: tenantData.config?.locale || 'es',
                timezone: tenantData.config?.timezone || 'America/Mexico_City'
            },
            database: {
                name: tenantData.database?.name || `tenant_${tenantData.id}_db`,
                prefix: tenantData.database?.prefix || `${tenantData.id}_`
            },
            metadata: {
                createdAt: tenantData.createdAt || new Date(),
                updatedAt: new Date(),
                lastLogin: null
            }
        };

        this.tenants.set(tenant.id, tenant);
        logger.info(`Tenant registered: ${tenant.name} (${tenant.id})`);

        return tenant;
    }

    /**
     * Obtener tenant por ID
     */
    getTenant(tenantId) {
        return this.tenants.get(tenantId);
    }

    /**
     * Obtener tenant por dominio
     */
    getTenantByDomain(domain) {
        for (const tenant of this.tenants.values()) {
            if (tenant.domain === domain || `${tenant.subdomain}.cocoluventas.com` === domain) {
                return tenant;
            }
        }
        return null;
    }

    /**
     * Obtener tenant por subdominio
     */
    getTenantBySubdomain(subdomain) {
        for (const tenant of this.tenants.values()) {
            if (tenant.subdomain === subdomain) {
                return tenant;
            }
        }
        return null;
    }

    /**
     * Actualizar configuración de tenant
     */
    updateTenantConfig(tenantId, config) {
        const tenant = this.tenants.get(tenantId);
        
        if (!tenant) {
            throw new Error(`Tenant ${tenantId} not found`);
        }

        tenant.config = {
            ...tenant.config,
            ...config
        };

        tenant.metadata.updatedAt = new Date();

        logger.info(`Tenant config updated: ${tenantId}`);
        return tenant;
    }

    /**
     * Verificar feature habilitado para tenant
     */
    hasFeature(tenantId, feature) {
        const tenant = this.getTenant(tenantId);
        return tenant?.config.features?.includes(feature) || false;
    }

    /**
     * Obtener adaptador configurado
     */
    getAdapter(tenantId, adapterType) {
        const tenant = this.getTenant(tenantId);
        return tenant?.config.adapters?.[adapterType] || null;
    }

    /**
     * Verificar límites del tenant
     */
    checkLimits(tenantId, resource) {
        const tenant = this.getTenant(tenantId);
        return tenant?.config.limits?.[resource] || null;
    }

    /**
     * Listar todos los tenants
     */
    listTenants() {
        return Array.from(this.tenants.values());
    }

    /**
     * Desactivar tenant
     */
    deactivateTenant(tenantId) {
        const tenant = this.getTenant(tenantId);
        
        if (tenant) {
            tenant.status = 'inactive';
            tenant.metadata.updatedAt = new Date();
            logger.warn(`Tenant deactivated: ${tenantId}`);
        }
    }

    /**
     * Activar tenant
     */
    activateTenant(tenantId) {
        const tenant = this.getTenant(tenantId);
        
        if (tenant) {
            tenant.status = 'active';
            tenant.metadata.updatedAt = new Date();
            logger.info(`Tenant activated: ${tenantId}`);
        }
    }

    /**
     * Obtener estadísticas de tenant
     */
    getTenantStats(tenantId) {
        const tenant = this.getTenant(tenantId);
        
        if (!tenant) {
            return null;
        }

        return {
            id: tenant.id,
            name: tenant.name,
            status: tenant.status,
            features: tenant.config.features.length,
            createdAt: tenant.metadata.createdAt,
            lastLogin: tenant.metadata.lastLogin
        };
    }
}

// Singleton
const tenantManager = new TenantManager();

export default tenantManager;
