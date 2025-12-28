/**
 * Sistema de Auditoría Avanzada
 * MEJORA: Logging completo de todas las acciones
 */

import logger from '../../utils/logger.js';
import persistence from '../../utils/persistence.js';

class AuditLogger {
    constructor() {
        this.auditLog = [];
        this.maxLogs = 10000; // 10k eventos
        this.enabled = true;
    }

    /**
     * Registrar evento de auditoría
     */
    async log(event) {
        if (!this.enabled) return;

        const auditEntry = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            ...event,
            
            // Metadata automática
            ip: event.ip || 'unknown',
            userAgent: event.userAgent || 'unknown',
            sessionId: event.sessionId || 'unknown',
        };

        // Guardar en memoria
        this.auditLog.push(auditEntry);
        if (this.auditLog.length > this.maxLogs) {
            this.auditLog.shift();
        }

        // Log estructurado
        logger.info('Audit Event', auditEntry);

        // Guardar en disco periódicamente
        if (this.auditLog.length % 100 === 0) {
            await this.persist();
        }

        return auditEntry;
    }

    /**
     * Auditar acción de usuario
     */
    async logAction(data) {
        return this.log({
            type: 'action',
            category: data.category || 'general',
            action: data.action,
            userId: data.userId,
            userName: data.userName,
            resource: data.resource,
            resourceId: data.resourceId,
            changes: data.changes || null,
            success: data.success !== false,
            error: data.error || null,
        });
    }

    /**
     * Auditar cambio en datos
     */
    async logDataChange(data) {
        return this.log({
            type: 'data_change',
            category: 'data',
            action: data.action, // create, update, delete
            userId: data.userId,
            resource: data.resource,
            resourceId: data.resourceId,
            before: data.before || null,
            after: data.after || null,
            diff: this.calculateDiff(data.before, data.after),
        });
    }

    /**
     * Auditar acceso a sistema
     */
    async logAccess(data) {
        return this.log({
            type: 'access',
            category: 'security',
            action: data.action, // login, logout, failed_login
            userId: data.userId,
            userName: data.userName,
            success: data.success,
            reason: data.reason || null,
        });
    }

    /**
     * Auditar cambio de configuración
     */
    async logConfigChange(data) {
        return this.log({
            type: 'config_change',
            category: 'system',
            action: 'update_config',
            userId: data.userId,
            setting: data.setting,
            oldValue: data.oldValue,
            newValue: data.newValue,
        });
    }

    /**
     * Auditar operación manual (override)
     */
    async logManualOverride(data) {
        return this.log({
            type: 'manual_override',
            category: 'technical',
            action: data.action,
            userId: data.userId,
            userName: data.userName,
            reason: data.reason,
            details: data.details,
            severity: 'high',
        });
    }

    /**
     * Auditar query directo a DB
     */
    async logDatabaseQuery(data) {
        return this.log({
            type: 'database_query',
            category: 'technical',
            action: 'execute_query',
            userId: data.userId,
            query: data.query,
            params: data.params,
            resultCount: data.resultCount,
            duration: data.duration,
            severity: 'critical',
        });
    }

    /**
     * Buscar en auditoría
     */
    search(filters = {}) {
        let results = [...this.auditLog];

        if (filters.userId) {
            results = results.filter(e => e.userId === filters.userId);
        }

        if (filters.type) {
            results = results.filter(e => e.type === filters.type);
        }

        if (filters.category) {
            results = results.filter(e => e.category === filters.category);
        }

        if (filters.action) {
            results = results.filter(e => e.action === filters.action);
        }

        if (filters.resource) {
            results = results.filter(e => e.resource === filters.resource);
        }

        if (filters.dateFrom) {
            results = results.filter(e => new Date(e.timestamp) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            results = results.filter(e => new Date(e.timestamp) <= new Date(filters.dateTo));
        }

        if (filters.severity) {
            results = results.filter(e => e.severity === filters.severity);
        }

        // Ordenar por fecha (más reciente primero)
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Limitar resultados
        const limit = filters.limit || 100;
        return results.slice(0, limit);
    }

    /**
     * Obtener estadísticas de auditoría
     */
    getStatistics() {
        const total = this.auditLog.length;
        const byType = {};
        const byCategory = {};
        const byUser = {};

        this.auditLog.forEach(entry => {
            byType[entry.type] = (byType[entry.type] || 0) + 1;
            byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
            byUser[entry.userId] = (byUser[entry.userId] || 0) + 1;
        });

        return {
            total,
            byType,
            byCategory,
            byUser,
            oldestEntry: this.auditLog[0]?.timestamp,
            newestEntry: this.auditLog[this.auditLog.length - 1]?.timestamp,
        };
    }

    /**
     * Exportar auditoría
     */
    export(format = 'json', filters = {}) {
        const data = this.search(filters);

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        }

        if (format === 'csv') {
            return this.toCSV(data);
        }

        return data;
    }

    /**
     * Convertir a CSV
     */
    toCSV(data) {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const rows = data.map(entry => 
            headers.map(h => JSON.stringify(entry[h] || '')).join(',')
        );

        return [headers.join(','), ...rows].join('\n');
    }

    /**
     * Calcular diferencias entre objetos
     */
    calculateDiff(before, after) {
        if (!before || !after) return null;

        const diff = {};
        const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

        allKeys.forEach(key => {
            if (before[key] !== after[key]) {
                diff[key] = {
                    before: before[key],
                    after: after[key]
                };
            }
        });

        return Object.keys(diff).length > 0 ? diff : null;
    }

    /**
     * Persistir a disco
     */
    async persist() {
        try {
            await persistence.save('audit-log', {
                logs: this.auditLog,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Error persisting audit log', error);
        }
    }

    /**
     * Cargar desde disco
     */
    async load() {
        try {
            const data = await persistence.load('audit-log');
            if (data && data.logs) {
                this.auditLog = data.logs;
                logger.info(`Audit log loaded: ${this.auditLog.length} entries`);
            }
        } catch (error) {
            logger.error('Error loading audit log', error);
        }
    }

    /**
     * Limpiar logs antiguos
     */
    cleanup(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const before = this.auditLog.length;
        this.auditLog = this.auditLog.filter(entry => 
            new Date(entry.timestamp) >= cutoffDate
        );
        const after = this.auditLog.length;

        logger.info(`Audit cleanup: removed ${before - after} old entries`);
    }
}

// Singleton
const auditLogger = new AuditLogger();

export default auditLogger;
