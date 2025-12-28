/**
 * Tenant Routes
 * API para gestión de tenants
 */

import express from 'express';
import tenantManager from '../multi-tenant/TenantManager.js';
import themeManager from '../multi-tenant/ThemeManager.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import errorHandler from '../utils/error-handler.js';

const router = express.Router();

/**
 * GET /api/tenant/current
 * Obtener información del tenant actual
 */
router.get('/current', (req, res) => {
    if (!req.tenant) {
        return res.status(400).json({
            error: 'Tenant not identified'
        });
    }

    res.json({
        success: true,
        tenant: {
            id: req.tenant.id,
            name: req.tenant.name,
            logo: req.tenant.config.logo,
            features: req.tenant.config.features,
            theme: req.tenant.config.theme
        }
    });
});

/**
 * GET /api/tenant/theme
 * Obtener tema del tenant actual
 */
router.get('/theme', (req, res) => {
    if (!req.tenant) {
        return res.status(400).json({
            error: 'Tenant not identified'
        });
    }

    const themeId = req.tenant.config.theme;
    const theme = themeManager.generateThemeObject(themeId);

    res.json({
        success: true,
        theme: {
            ...theme,
            logo: req.tenant.config.logo,
            name: req.tenant.name
        }
    });
});

/**
 * GET /api/tenant/theme/css
 * Obtener CSS del tema
 */
router.get('/theme/css', (req, res) => {
    if (!req.tenant) {
        return res.status(400).json({
            error: 'Tenant not identified'
        });
    }

    const themeId = req.tenant.config.theme;
    const css = themeManager.generateCSSVariables(themeId);

    res.setHeader('Content-Type', 'text/css');
    res.send(css);
});

/**
 * GET /api/tenant/config
 * Obtener configuración completa del tenant
 */
router.get('/config', requireAuth, (req, res) => {
    if (!req.tenant) {
        return res.status(400).json({
            error: 'Tenant not identified'
        });
    }

    res.json({
        success: true,
        config: req.tenant.config
    });
});

/**
 * PUT /api/tenant/config
 * Actualizar configuración del tenant (solo admin)
 */
router.put('/config', requireAuth, requireRole('admin'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        if (!req.tenant) {
            return res.status(400).json({
                error: 'Tenant not identified'
            });
        }

        const updatedTenant = tenantManager.updateTenantConfig(
            req.tenantId,
            req.body
        );

        res.json({
            success: true,
            tenant: updatedTenant
        });
    }, { operation: 'updateTenantConfig', res });
});

/**
 * GET /api/tenant/stats
 * Obtener estadísticas del tenant
 */
router.get('/stats', requireAuth, requireRole('admin'), (req, res) => {
    if (!req.tenant) {
        return res.status(400).json({
            error: 'Tenant not identified'
        });
    }

    const stats = tenantManager.getTenantStats(req.tenantId);

    res.json({
        success: true,
        stats
    });
});

/**
 * POST /api/tenant/create
 * Crear nuevo tenant (super admin only)
 */
router.post('/create', requireAuth, requireRole('admin'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const tenant = tenantManager.registerTenant(req.body);

        res.status(201).json({
            success: true,
            tenant
        });
    }, { operation: 'createTenant', res });
});

/**
 * GET /api/tenant/list
 * Listar todos los tenants (super admin only)
 */
router.get('/list', requireAuth, requireRole('admin'), (req, res) => {
    const tenants = tenantManager.listTenants();

    res.json({
        success: true,
        tenants: tenants.map(t => ({
            id: t.id,
            name: t.name,
            status: t.status,
            createdAt: t.metadata.createdAt
        }))
    });
});

export default router;
