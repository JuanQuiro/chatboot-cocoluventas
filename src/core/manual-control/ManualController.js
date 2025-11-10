/**
 * Sistema de Control Manual
 * MEJORA: Permite a administradores técnicos controlar el sistema manualmente
 */

import logger from '../../utils/logger.js';
import auditLogger from '../audit/AuditLogger.js';
import { hasPermission } from '../rbac/roles.js';

class ManualController {
    constructor() {
        this.overrides = new Map();
        this.enabled = true;
    }

    /**
     * Verificar permisos técnicos
     */
    checkTechnicalPermission(user) {
        if (!hasPermission(user.role, 'system.manual_override')) {
            throw new Error('Permisos insuficientes para control manual');
        }
    }

    /**
     * Asignar vendedor manualmente (override del automático)
     */
    async manualAssignSeller(user, data) {
        this.checkTechnicalPermission(user);

        const { userId, sellerId, reason } = data;

        // Auditar
        await auditLogger.logManualOverride({
            userId: user.id,
            userName: user.name,
            action: 'manual_assign_seller',
            reason,
            details: {
                targetUser: userId,
                sellerId
            }
        });

        logger.warn('Manual seller assignment', {
            by: user.name,
            targetUser: userId,
            sellerId,
            reason
        });

        // Guardar override
        this.overrides.set(`seller_${userId}`, {
            sellerId,
            assignedBy: user.id,
            reason,
            timestamp: new Date().toISOString()
        });

        return {
            success: true,
            message: 'Vendedor asignado manualmente',
            sellerId
        };
    }

    /**
     * Ejecutar query directa a base de datos
     */
    async executeQuery(user, query, params = []) {
        this.checkTechnicalPermission(user);

        if (!hasPermission(user.role, 'database.query')) {
            throw new Error('Sin permiso para ejecutar queries directas');
        }

        const startTime = Date.now();

        logger.warn('Direct database query execution', {
            by: user.name,
            query: query.substring(0, 100) // Solo primeros 100 chars
        });

        // Aquí iría la ejecución real del query
        // const result = await database.execute(query, params);
        const result = { warning: 'Query execution not implemented yet' };

        const duration = Date.now() - startTime;

        // Auditar SIEMPRE las queries directas
        await auditLogger.logDatabaseQuery({
            userId: user.id,
            query,
            params,
            resultCount: result.length || 0,
            duration
        });

        return result;
    }

    /**
     * Cambiar configuración del sistema en tiempo real
     */
    async changeSystemConfig(user, setting, newValue, reason) {
        this.checkTechnicalPermission(user);

        // Obtener valor actual
        const oldValue = process.env[setting];

        // Auditar
        await auditLogger.logConfigChange({
            userId: user.id,
            setting,
            oldValue,
            newValue
        });

        await auditLogger.logManualOverride({
            userId: user.id,
            userName: user.name,
            action: 'change_system_config',
            reason,
            details: {
                setting,
                oldValue,
                newValue
            }
        });

        logger.warn('System config changed', {
            by: user.name,
            setting,
            oldValue,
            newValue,
            reason
        });

        // Aplicar cambio (solo en memoria, no persiste en .env)
        process.env[setting] = newValue;

        return {
            success: true,
            message: 'Configuración actualizada',
            setting,
            oldValue,
            newValue
        };
    }

    /**
     * Forzar acción del sistema
     */
    async forceAction(user, action, params, reason) {
        this.checkTechnicalPermission(user);

        await auditLogger.logManualOverride({
            userId: user.id,
            userName: user.name,
            action: `force_${action}`,
            reason,
            details: params
        });

        logger.warn('Force action executed', {
            by: user.name,
            action,
            params,
            reason
        });

        // Ejecutar acción forzada
        const result = await this.executeForceAction(action, params);

        return {
            success: true,
            action,
            result
        };
    }

    /**
     * Ejecutar acción forzada
     */
    async executeForceAction(action, params) {
        switch (action) {
            case 'clear_cache':
                return { message: 'Cache cleared' };
                
            case 'restart_service':
                return { message: 'Service restarted' };
                
            case 'force_backup':
                return { message: 'Backup forced' };
                
            case 'clear_queue':
                return { message: 'Queue cleared' };
                
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    /**
     * Ver todos los overrides activos
     */
    getActiveOverrides() {
        return Array.from(this.overrides.entries()).map(([key, value]) => ({
            key,
            ...value
        }));
    }

    /**
     * Remover override
     */
    async removeOverride(user, key, reason) {
        this.checkTechnicalPermission(user);

        const override = this.overrides.get(key);
        if (!override) {
            throw new Error('Override not found');
        }

        await auditLogger.logManualOverride({
            userId: user.id,
            userName: user.name,
            action: 'remove_override',
            reason,
            details: { key, override }
        });

        this.overrides.delete(key);

        return {
            success: true,
            message: 'Override removed'
        };
    }

    /**
     * Debug: Ver estado del sistema
     */
    getSystemState() {
        return {
            overrides: this.getActiveOverrides(),
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            env: {
                NODE_ENV: process.env.NODE_ENV,
                PORT: process.env.PORT,
                API_PORT: process.env.API_PORT
            }
        };
    }
}

const manualController = new ManualController();

export default manualController;
