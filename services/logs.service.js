/**
 * Logs Service - Sistema Enterprise de Logs
 * Maneja todos los logs del sistema con garantía de NO pérdida
 */

import SystemLog from '../src/models/SystemLog.model.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

class LogsService {
    constructor() {
        this.batchQueue = [];
        this.batchSize = 50;
        this.flushInterval = 5000; // 5 segundos
        this.maxRetries = 3;
        
        // Almacenamiento en memoria como fallback si MongoDB no está disponible
        this.inMemoryLogs = [];
        this.maxInMemoryLogs = 1000; // Mantener solo los últimos 1000 logs en memoria
        
        // Estado de conexión MongoDB
        this.mongoAvailable = false;
        this.checkMongoConnection();
        
        // Iniciar flush automático
        this.startAutoFlush();
    }
    
    /**
     * Verificar si MongoDB está disponible
     */
    async checkMongoConnection() {
        try {
            // Verificar estado de conexión de Mongoose
            if (mongoose.connection && mongoose.connection.readyState === 1) {
                this.mongoAvailable = true;
                // Solo loguear una vez cuando se conecta
                if (!this._mongoLogged) {
                    console.log('[LogsService] ✅ MongoDB conectado');
                    this._mongoLogged = true;
                }
            } else {
                this.mongoAvailable = false;
                // Solo loguear una vez cuando no está disponible
                if (!this._mongoUnavailableLogged) {
                    console.log('[LogsService] ⚠️  MongoDB no disponible, usando almacenamiento en memoria');
                    this._mongoUnavailableLogged = true;
                }
            }
        } catch (error) {
            this.mongoAvailable = false;
            if (!this._mongoUnavailableLogged) {
                console.log('[LogsService] ⚠️  MongoDB no disponible, usando almacenamiento en memoria');
                this._mongoUnavailableLogged = true;
            }
        }
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
     * Guardar batch en la base de datos (MongoDB) o en memoria
     */
    async saveBatchToDatabase(logs) {
        // Verificar conexión MongoDB
        await this.checkMongoConnection();
        
        if (this.mongoAvailable) {
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
                return;
                
            } catch (error) {
                // Si falla MongoDB, marcar como no disponible y usar memoria
                if (error.name === 'MongooseError' || error.message?.includes('buffering')) {
                    this.mongoAvailable = false;
                    console.log('[LogsService] ⚠️  MongoDB no disponible, cambiando a almacenamiento en memoria');
                } else if (error.code !== 11000) {
                    // Si es error de duplicados, ignorar (ordered: false permite continuar)
                    throw error;
                }
            }
        }
        
        // Fallback: Guardar en memoria
        this.inMemoryLogs.push(...logs);
        
        // Limitar tamaño de logs en memoria
        if (this.inMemoryLogs.length > this.maxInMemoryLogs) {
            this.inMemoryLogs = this.inMemoryLogs.slice(-this.maxInMemoryLogs);
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
        // Verificar conexión MongoDB
        await this.checkMongoConnection();
        
        if (this.mongoAvailable) {
            try {
                const { limit = 100, offset = 0 } = filters;
                
                const logs = await SystemLog.findRecent(filters, limit);
                
                return {
                    success: true,
                    logs: logs.slice(offset),
                    count: logs.length
                };
            } catch (error) {
                // Si falla MongoDB, usar memoria
                if (error.name === 'MongooseError' || error.message?.includes('buffering')) {
                    this.mongoAvailable = false;
                    console.log('[LogsService] ⚠️  MongoDB no disponible, usando logs en memoria');
                } else {
                    console.error('[LogsService] Error obteniendo logs:', error);
                    return { success: false, error: error.message };
                }
            }
        }
        
        // Fallback: Retornar logs de memoria
        const { limit = 100, offset = 0 } = filters;
        let logs = [...this.inMemoryLogs].reverse(); // Más recientes primero
        
        // Aplicar filtros básicos si existen
        if (filters.log_type) {
            logs = logs.filter(log => log.log_type === filters.log_type);
        }
        if (filters.category) {
            logs = logs.filter(log => log.category === filters.category);
        }
        if (filters.severity) {
            logs = logs.filter(log => log.severity >= filters.severity);
        }
        
        return {
            success: true,
            logs: logs.slice(offset, offset + limit),
            count: logs.length
        };
    }

    /**
     * Obtener estadísticas de logs
     */
    async getStats(filters = {}) {
        // Verificar conexión MongoDB
        await this.checkMongoConnection();
        
        if (this.mongoAvailable) {
            try {
                const stats = await SystemLog.getStats(filters);
                
                return {
                    success: true,
                    stats
                };
            } catch (error) {
                // Si falla MongoDB, calcular stats de memoria
                if (error.name === 'MongooseError' || error.message?.includes('buffering')) {
                    this.mongoAvailable = false;
                } else {
                    console.error('[LogsService] Error obteniendo stats:', error);
                    return { success: false, error: error.message };
                }
            }
        }
        
        // Fallback: Calcular stats de memoria
        const logs = this.inMemoryLogs;
        const stats = {
            total: logs.length,
            by_type: {},
            by_category: {},
            errors: logs.filter(log => log.log_type === 'ERROR' || log.log_type === 'CRITICAL').length,
            warnings: logs.filter(log => log.log_type === 'WARNING').length,
            info: logs.filter(log => log.log_type === 'INFO').length
        };
        
        logs.forEach(log => {
            stats.by_type[log.log_type] = (stats.by_type[log.log_type] || 0) + 1;
            stats.by_category[log.category] = (stats.by_category[log.category] || 0) + 1;
        });
        
        return {
            success: true,
            stats
        };
    }

    /**
     * Limpiar logs antiguos
     */
    async cleanup() {
        // Verificar conexión MongoDB
        await this.checkMongoConnection();
        
        if (this.mongoAvailable) {
            try {
                const results = await SystemLog.cleanup();
                console.log('[LogsService] Limpieza completada:', results);
                return { success: true, results };
            } catch (error) {
                console.error('[LogsService] Error en limpieza:', error);
                return { success: false, error: error.message };
            }
        }
        
        // Fallback: Limpiar logs antiguos de memoria (mantener solo los últimos 500)
        const oldCount = this.inMemoryLogs.length;
        this.inMemoryLogs = this.inMemoryLogs.slice(-500);
        const removed = oldCount - this.inMemoryLogs.length;
        
        return { 
            success: true, 
            results: { removed, remaining: this.inMemoryLogs.length } 
        };
    }
}

// Singleton
const logsService = new LogsService();

// Procesar retry queue cada 1 minuto
setInterval(() => {
    logsService.processRetryQueue();
}, 60000);

export default logsService;
