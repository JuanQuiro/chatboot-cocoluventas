/**
 * Tenant Middleware
 * Identificación y contexto de tenant en cada request
 */

import tenantManager from './TenantManager.js';
import logger from '../utils/logger.js';

/**
 * Identificar tenant por dominio/subdominio
 */
export function identifyTenant(req, res, next) {
    try {
        // 1. Intentar obtener de header custom
        let tenantId = req.headers['x-tenant-id'];
        
        // 2. Intentar obtener de subdominio
        if (!tenantId) {
            const host = req.hostname || req.headers.host;
            const subdomain = host.split('.')[0];
            
            // Si no es localhost, buscar por subdominio
            if (subdomain !== 'localhost' && subdomain !== '127') {
                const tenant = tenantManager.getTenantBySubdomain(subdomain);
                if (tenant) {
                    tenantId = tenant.id;
                }
            }
        }

        // 3. Intentar obtener de query param (para testing)
        if (!tenantId && req.query.tenant) {
            tenantId = req.query.tenant;
        }

        // 4. Default a cocoluventas si no se encuentra
        if (!tenantId) {
            tenantId = 'cocoluventas';
        }

        // Obtener tenant
        const tenant = tenantManager.getTenant(tenantId);

        if (!tenant) {
            return res.status(404).json({
                error: 'Tenant not found',
                tenantId
            });
        }

        // Verificar que esté activo
        if (tenant.status !== 'active') {
            return res.status(403).json({
                error: 'Tenant is not active',
                tenantId
            });
        }

        // Adjuntar tenant al request
        req.tenant = tenant;
        req.tenantId = tenant.id;

        // Agregar header de respuesta
        res.setHeader('X-Tenant-Id', tenant.id);

        logger.debug(`Request from tenant: ${tenant.name} (${tenant.id})`);

        next();
    } catch (error) {
        logger.error('Error identifying tenant', error);
        res.status(500).json({
            error: 'Failed to identify tenant'
        });
    }
}

/**
 * Verificar feature habilitado para tenant
 */
export function requireFeature(feature) {
    return (req, res, next) => {
        if (!req.tenant) {
            return res.status(400).json({
                error: 'Tenant not identified'
            });
        }

        if (!tenantManager.hasFeature(req.tenantId, feature)) {
            return res.status(403).json({
                error: `Feature '${feature}' not enabled for this tenant`,
                tenant: req.tenant.name
            });
        }

        next();
    };
}

/**
 * Aislamiento de base de datos
 */
export function isolateDatabase(req, res, next) {
    if (!req.tenant) {
        return res.status(400).json({
            error: 'Tenant not identified'
        });
    }

    // Configurar prefijo de tabla para queries
    req.dbPrefix = req.tenant.database.prefix;
    req.dbName = req.tenant.database.name;

    next();
}

/**
 * Aplicar límites del tenant
 */
export function checkTenantLimits(resource) {
    return async (req, res, next) => {
        if (!req.tenant) {
            return res.status(400).json({
                error: 'Tenant not identified'
            });
        }

        const limit = tenantManager.checkLimits(req.tenantId, resource);
        
        if (!limit) {
            return next();
        }

        // Aquí implementarías la lógica de verificación de límites
        // Por ejemplo, contar usuarios, storage usado, etc.

        next();
    };
}

export default {
    identifyTenant,
    requireFeature,
    isolateDatabase,
    checkTenantLimits
};
