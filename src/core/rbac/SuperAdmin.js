/**
 * Super Admin System
 * Rol GOD con acceso total a todo
 */

import logger from '../../utils/logger.js';

export const SUPER_ADMIN_ROLE = 'super_admin';

export const SUPER_ADMIN_PERMISSIONS = {
    // Acceso total
    'god.mode': 'Modo Dios - Acceso total',
    'god.impersonate': 'Impersonar cualquier usuario',
    'god.view_all': 'Ver todo de todos los tenants',
    
    // Tenants
    'tenants.view_all': 'Ver todos los tenants',
    'tenants.create': 'Crear tenants',
    'tenants.edit_all': 'Editar cualquier tenant',
    'tenants.delete': 'Eliminar tenants',
    'tenants.suspend': 'Suspender tenants',
    'tenants.stats': 'Ver estadísticas globales',
    
    // Usuarios globales
    'users.view_all': 'Ver todos los usuarios',
    'users.create_any': 'Crear usuarios en cualquier tenant',
    'users.edit_any': 'Editar cualquier usuario',
    'users.delete_any': 'Eliminar cualquier usuario',
    'users.reset_password': 'Resetear cualquier password',
    
    // Base de datos
    'database.access': 'Acceso directo a DB',
    'database.backup': 'Crear backups',
    'database.restore': 'Restaurar backups',
    'database.query': 'Ejecutar queries',
    'database.export': 'Exportar toda la data',
    
    // Sistema
    'system.view_logs': 'Ver logs del sistema',
    'system.clear_cache': 'Limpiar cache',
    'system.restart': 'Reiniciar servicios',
    'system.maintenance': 'Modo mantenimiento',
    'system.config': 'Editar configuración',
    
    // Analytics global
    'analytics.global': 'Analytics de todos los tenants',
    'analytics.revenue': 'Ver ingresos totales',
    'analytics.usage': 'Ver uso de recursos',
    
    // Auditoría global
    'audit.view_all': 'Ver auditoría global',
    'audit.export_all': 'Exportar auditoría completa',
    
    // Seguridad
    'security.view_incidents': 'Ver incidentes de seguridad',
    'security.ban_users': 'Banear usuarios',
    'security.whitelist': 'Gestionar whitelist/blacklist',
};

class SuperAdminManager {
    constructor() {
        this.superAdmins = new Map();
        this.impersonations = new Map();
        this.initializeDefaultSuperAdmin();
    }

    /**
     * Inicializar super admin por defecto
     */
    initializeDefaultSuperAdmin() {
        // El usuario del desarrollador
        this.registerSuperAdmin({
            id: 'super_admin_1',
            email: 'alberto@cocoluventas.com',
            name: 'Alberto (Super Admin)',
            permissions: Object.keys(SUPER_ADMIN_PERMISSIONS),
            createdAt: new Date()
        });

        logger.info('Super Admin initialized');
    }

    /**
     * Registrar super admin
     */
    registerSuperAdmin(adminData) {
        this.superAdmins.set(adminData.id, {
            ...adminData,
            role: SUPER_ADMIN_ROLE,
            isSuperAdmin: true,
            canAccessAllTenants: true
        });

        logger.info(`Super Admin registered: ${adminData.email}`);
    }

    /**
     * Verificar si es super admin
     */
    isSuperAdmin(userId) {
        return this.superAdmins.has(userId);
    }

    /**
     * Verificar si es super admin por email
     */
    isSuperAdminEmail(email) {
        for (const admin of this.superAdmins.values()) {
            if (admin.email === email) {
                return true;
            }
        }
        return false;
    }

    /**
     * Obtener super admin
     */
    getSuperAdmin(userId) {
        return this.superAdmins.get(userId);
    }

    /**
     * Verificar permiso de super admin
     */
    hasPermission(userId, permission) {
        const admin = this.getSuperAdmin(userId);
        if (!admin) return false;

        // Super admin tiene TODOS los permisos
        return true;
    }

    /**
     * Impersonar usuario/tenant
     */
    impersonate(superAdminId, targetUserId, targetTenantId) {
        if (!this.isSuperAdmin(superAdminId)) {
            throw new Error('Only super admins can impersonate');
        }

        const impersonationId = `${superAdminId}-${Date.now()}`;
        
        this.impersonations.set(impersonationId, {
            superAdminId,
            targetUserId,
            targetTenantId,
            startedAt: new Date(),
            isActive: true
        });

        logger.warn(`Super Admin ${superAdminId} impersonating user ${targetUserId} in tenant ${targetTenantId}`);

        return impersonationId;
    }

    /**
     * Detener impersonación
     */
    stopImpersonation(impersonationId) {
        const impersonation = this.impersonations.get(impersonationId);
        
        if (impersonation) {
            impersonation.isActive = false;
            impersonation.endedAt = new Date();
            
            logger.info(`Impersonation ${impersonationId} stopped`);
        }
    }

    /**
     * Obtener estadísticas globales
     */
    getGlobalStats(tenantManager, userService) {
        const tenants = tenantManager.listTenants();
        
        return {
            totalTenants: tenants.length,
            activeTenants: tenants.filter(t => t.status === 'active').length,
            totalUsers: 0, // Se calcularía sumando usuarios de todos los tenants
            totalRevenue: 0, // Se calcularía sumando facturación
            systemUptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            timestamp: new Date()
        };
    }

    /**
     * Ejecutar acción de super admin con audit
     */
    async executeGodAction(adminId, action, params, auditLogger) {
        if (!this.isSuperAdmin(adminId)) {
            throw new Error('Unauthorized: Not a super admin');
        }

        logger.warn(`Super Admin ${adminId} executing GOD action: ${action}`, params);

        await auditLogger.logAction({
            category: 'super_admin',
            action: `god.${action}`,
            userId: adminId,
            userName: 'Super Admin',
            details: params,
            severity: 'critical'
        });

        // Ejecutar acción
        // Aquí se implementarían las acciones específicas
    }

    /**
     * Listar super admins
     */
    listSuperAdmins() {
        return Array.from(this.superAdmins.values());
    }
}

// Singleton
const superAdminManager = new SuperAdminManager();

export default superAdminManager;
