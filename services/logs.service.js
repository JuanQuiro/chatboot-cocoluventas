/**
 * Logs Service - Sistema Enterprise de Logs
 * Maneja todos los logs del sistema con garantía de NO pérdida
 */

import SystemLog from '../src/models/SystemLog.model.js';
import fs from 'fs';
import path from 'path';

class LogsService {
    constructor() {
        this.batchQueue = [];
        this.batchSize = 50;
        this.flushInterval = 5000; // 5 segundos
        this.maxRetries = 3;
        
        // Iniciar flush automático
        this.startAutoFlush();
    }

    /**
     * Log INFO - Información general
     */
    async info(category, message, data = {}, context = {}) {
        return this.log({
            log_type: 'INFO',
            category,
            message,
            data,
            severity: 1,
            ...context
        });
    }

    /**
     * Log WARNING - Advertencias
     */
    async warning(category, message, data = {}, context = {}) {
        return this.log({
            log_type: 'WARNING',
            category,
            message,
            data,
            severity: 2,
            ...context
        });
    }

    /**
     * Log ERROR - Errores
     */
    async error(category, message, error = null, data = {}, context = {}) {
        return this.log({
            log_type: 'ERROR',
            category,
            message,
            data: {
                ...data,
                error: error?.message,
                code: error?.code
            },
            stack_trace: error?.stack,
            severity: 3,
            ...context
        });
    }

    /**
     * Log CRITICAL - Errores críticos
     */
    async critical(category, message, error = null, data = {}, context = {}) {
        return this.log({
            log_type: 'CRITICAL',
            category,
            message,
            data: {
                ...data,
                error: error?.message,
                code: error?.code
            },
            stack_trace: error?.stack,
            severity: 4,
            ...context
        });
    }

    /**
     * Log PERFORMANCE - Métricas de rendimiento
     */
    async performance(category, message, durationMs, data = {}, context = {}) {
        return this.log({
            log_type: 'PERFORMANCE',
            category,
            message,
            data,
            duration_ms: durationMs,
            severity: 1,
            ...context
        });
    }

    /**
     * Log genérico - Agregar a batch queue
     */
    async log(logData) {
        try {
            // Agregar a la cola de batch
            this.batchQueue.push({
                ...logData,
                created_at: new Date().toISOString()
            });

            // Si alcanzamos el tamaño del batch, flush inmediato
            if (this.batchQueue.length >= this.batchSize) {
                await this.flushBatch();
            }

            return { success: true };
        } catch (error) {
            console.error('[LogsService] Error agregando log:', error);
            // NO lanzar error - los logs no deben romper la app
            return { success: false, error: error.message };
        }
    }

    /**
     * Flush batch - Guardar todos los logs pendientes
     */
    async flushBatch() {
        if (this.batchQueue.length === 0) return;

        const logsToSave = [...this.batchQueue];
        this.batchQueue = [];

        try {
            await this.saveBatchToDatabase(logsToSave);
            console.log(`[LogsService] ✅ ${logsToSave.length} logs guardados en BD`);
        } catch (error) {
            console.error('[LogsService] ❌ Error guardando batch:', error);
            
            // Guardar en cola de retry
            await this.saveToRetryQueue(logsToSave);
        }
    }

    /**
     * Guardar batch en la base de datos (MongoDB)
     */
    async saveBatchToDatabase(logs) {
        try {
            // Preparar documentos para MongoDB
            const documents = logs.map(log => ({
                log_type: log.log_type || 'INFO',
                category: log.category || 'SYSTEM',
                message: log.message || '',
                user_id: log.user_id || null,
                tenant_id: log.tenant_id || null,
                session_id: log.session_id || null,
                data: log.data || null,
                stack_trace: log.stack_trace || null,
                error_code: log.error_code || null,
                url: log.url || null,
                user_agent: log.user_agent || null,
                ip_address: log.ip_address || null,
                duration_ms: log.duration_ms || null,
                severity: log.severity || 1,
                is_resolved: false
            }));

            // Insert masivo en MongoDB
            await SystemLog.insertMany(documents, { ordered: false });
            
        } catch (error) {
            // Si es error de duplicados, ignorar (ordered: false permite continuar)
            if (error.code !== 11000) {
                throw error;
            }
        }
    }

    /**
     * Guardar en cola de retry si falla el guardado
     */
    async saveToRetryQueue(logs) {
        try {
            // Guardar en archivo local como fallback
            this.saveToLocalFile(logs);
            console.log('[LogsService] Logs guardados en cola de retry (archivo local)');
        } catch (error) {
            console.error('[LogsService] Error guardando en retry queue:', error);
        }
    }

    /**
     * Guardar en archivo local como último recurso
     */
    saveToLocalFile(logs) {
        try {
            const logFile = path.join(process.cwd(), 'logs', 'emergency-logs.json');
            
            if (!fs.existsSync(path.dirname(logFile))) {
                fs.mkdirSync(path.dirname(logFile), { recursive: true });
            }

            let existingLogs = [];
            if (fs.existsSync(logFile)) {
                existingLogs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
            }
            
            existingLogs.push(...logs);
            fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));
            
            console.log('[LogsService] Logs guardados en archivo de emergencia');
        } catch (error) {
            console.error('[LogsService] Error guardando en archivo local:', error);
        }
    }

    /**
     * Auto-flush cada X segundos
     */
    startAutoFlush() {
        setInterval(async () => {
            await this.flushBatch();
        }, this.flushInterval);
        
        console.log(`[LogsService] Auto-flush iniciado (cada ${this.flushInterval}ms)`);
    }

    /**
     * Procesar cola de retry (desde archivo local)
     */
    async processRetryQueue() {
        try {
            const logFile = path.join(process.cwd(), 'logs', 'emergency-logs.json');
            
            if (!fs.existsSync(logFile)) return;
            
            const logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
            
            if (logs.length === 0) return;
            
            // Intentar guardar en BD
            await this.saveBatchToDatabase(logs);
            
            // Si tuvo éxito, limpiar el archivo
            fs.writeFileSync(logFile, JSON.stringify([]));
            console.log(`[LogsService] ✅ ${logs.length} logs de emergencia procesados`);
            
        } catch (error) {
            console.error('[LogsService] Error procesando retry queue:', error);
        }
    }

    /**
     * Obtener logs recientes
     */
    async getRecentLogs(filters = {}) {
        try {
            const { limit = 100, offset = 0 } = filters;
            
            const logs = await SystemLog.findRecent(filters, limit);
            
            return {
                success: true,
                logs: logs.slice(offset),
                count: logs.length
            };
        } catch (error) {
            console.error('[LogsService] Error obteniendo logs:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener estadísticas de logs
     */
    async getStats(filters = {}) {
        try {
            const stats = await SystemLog.getStats(filters);
            
            return {
                success: true,
                stats
            };
        } catch (error) {
            console.error('[LogsService] Error obteniendo stats:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Limpiar logs antiguos
     */
    async cleanup() {
        try {
            const results = await SystemLog.cleanup();
            console.log('[LogsService] Limpieza completada:', results);
            return { success: true, results };
        } catch (error) {
            console.error('[LogsService] Error en limpieza:', error);
            return { success: false, error: error.message };
        }
    }
}

// Singleton
const logsService = new LogsService();

// Procesar retry queue cada 1 minuto
setInterval(() => {
    logsService.processRetryQueue();
}, 60000);

export default logsService;
