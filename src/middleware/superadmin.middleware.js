/**
 * Super Admin Middleware
 * Verificación de acceso de super admin
 */

import superAdminManager from '../core/rbac/SuperAdmin.js';
import logger from '../utils/logger.js';

/**
 * Verificar si es super admin
 */
export function requireSuperAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }

    if (!superAdminManager.isSuperAdmin(req.user.id)) {
        logger.warn(`Unauthorized super admin access attempt by ${req.user.email}`);
        
        return res.status(403).json({
            error: 'Super Admin access required',
            message: 'You do not have super admin privileges'
        });
    }

    // Marcar request como super admin
    req.isSuperAdmin = true;
    req.canAccessAllTenants = true;

    logger.info(`Super Admin access granted: ${req.user.email}`);
    next();
}

/**
 * Permitir bypass de tenant isolation para super admin
 */
export function allowTenantBypass(req, res, next) {
    // Si es super admin y especifica un tenant, usar ese
    if (req.isSuperAdmin && req.query.targetTenant) {
        req.tenantId = req.query.targetTenant;
        req.bypassingTenant = true;
        logger.warn(`Super Admin bypassing to tenant: ${req.tenantId}`);
    }

    next();
}

/**
 * Modo impersonación
 */
export function impersonateUser(req, res, next) {
    if (!req.isSuperAdmin) {
        return res.status(403).json({
            error: 'Only super admins can impersonate'
        });
    }

    const { targetUserId, targetTenantId } = req.body;

    if (!targetUserId || !targetTenantId) {
        return res.status(400).json({
            error: 'targetUserId and targetTenantId required'
        });
    }

    const impersonationId = superAdminManager.impersonate(
        req.user.id,
        targetUserId,
        targetTenantId
    );

    req.impersonationId = impersonationId;
    req.originalUser = req.user;
    // Cambiar contexto al usuario objetivo
    req.user = { id: targetUserId };
    req.tenantId = targetTenantId;

    next();
}

export default {
    requireSuperAdmin,
    allowTenantBypass,
    impersonateUser
};
