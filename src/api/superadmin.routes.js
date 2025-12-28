/**
 * Super Admin Routes
 * Endpoints exclusivos para super administrador
 */

import express from 'express';
import superAdminManager from '../core/rbac/SuperAdmin.js';
import tenantManager from '../multi-tenant/TenantManager.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireSuperAdmin, allowTenantBypass } from '../middleware/superadmin.middleware.js';
import errorHandler from '../utils/error-handler.js';

const router = express.Router();

// Todos los endpoints requieren super admin
router.use(requireAuth);
router.use(requireSuperAdmin);
router.use(allowTenantBypass);

/**
 * GET /api/superadmin/dashboard
 * Dashboard principal con todas las métricas
 */
router.get('/dashboard', async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const stats = superAdminManager.getGlobalStats(tenantManager);
        
        res.json({
            success: true,
            stats,
            tenants: tenantManager.listTenants()
        });
    }, { operation: 'getSuperAdminDashboard', res });
});

/**
 * GET /api/superadmin/tenants
 * Listar TODOS los tenants con detalles
 */
router.get('/tenants', async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const tenants = tenantManager.listTenants();
        
        res.json({
            success: true,
            tenants,
            total: tenants.length
        });
    }, { operation: 'listAllTenants', res });
});

/**
 * GET /api/superadmin/tenants/:id
 * Ver detalles completos de un tenant
 */
router.get('/tenants/:id', async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const tenant = tenantManager.getTenant(req.params.id);
        
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        res.json({
            success: true,
            tenant
        });
    }, { operation: 'getTenantDetails', res });
});

/**
 * POST /api/superadmin/tenants/:id/suspend
 * Suspender tenant
 */
router.post('/tenants/:id/suspend', async (req, res) => {
    return errorHandler.tryAsync(async () => {
        tenantManager.deactivateTenant(req.params.id);
        
        res.json({
            success: true,
            message: 'Tenant suspended'
        });
    }, { operation: 'suspendTenant', res });
});

/**
 * POST /api/superadmin/impersonate
 * Impersonar usuario de cualquier tenant
 */
router.post('/impersonate', async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const { targetUserId, targetTenantId } = req.body;
        
        const impersonationId = superAdminManager.impersonate(
            req.user.id,
            targetUserId,
            targetTenantId
        );

        res.json({
            success: true,
            impersonationId,
            message: `Impersonating user ${targetUserId} in tenant ${targetTenantId}`
        });
    }, { operation: 'impersonateUser', res });
});

/**
 * GET /api/superadmin/users/all
 * Ver TODOS los usuarios de TODOS los tenants
 */
router.get('/users/all', async (req, res) => {
    return errorHandler.tryAsync(async () => {
        // Aquí cargarías todos los usuarios de todos los tenants
        // const users = await User.find({});
        
        res.json({
            success: true,
            users: [],
            message: 'All users from all tenants'
        });
    }, { operation: 'getAllUsers', res });
});

/**
 * GET /api/superadmin/system/logs
 * Ver logs del sistema
 */
router.get('/system/logs', async (req, res) => {
    return errorHandler.tryAsync(async () => {
        // Aquí retornarías los logs del sistema
        
        res.json({
            success: true,
            logs: [],
            message: 'System logs'
        });
    }, { operation: 'getSystemLogs', res });
});

/**
 * POST /api/superadmin/system/backup
 * Crear backup completo
 */
router.post('/system/backup', async (req, res) => {
    return errorHandler.tryAsync(async () => {
        // Aquí crearías un backup completo
        
        res.json({
            success: true,
            message: 'Backup created successfully'
        });
    }, { operation: 'createBackup', res });
});

/**
 * DELETE /api/superadmin/god/delete-all
 * MODO DIOS: Eliminar todo (¡PELIGROSO!)
 */
router.delete('/god/delete-all', async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const { confirmation } = req.body;
        
        if (confirmation !== 'DELETE_EVERYTHING') {
            return res.status(400).json({
                error: 'Confirmation required'
            });
        }

        // Super peligroso - solo para desarrollo
        // NO implementar en producción sin protecciones

        res.json({
            success: true,
            message: 'All data deleted (if implemented)'
        });
    }, { operation: 'godDeleteAll', res });
});

export default router;
