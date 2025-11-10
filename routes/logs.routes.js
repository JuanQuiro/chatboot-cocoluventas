/**
 * Logs Routes - API REST para sistema de logs
 */

import express from 'express';
import logsService from '../services/logs.service.js';

const router = express.Router();

/**
 * POST /api/logs - Crear nuevo log
 * Body: { log_type, category, message, data, context }
 */
router.post('/', async (req, res) => {
    try {
        const { log_type, category, message, data, context, severity, stack_trace } = req.body;

        // Agregar contexto de la request
        const enrichedContext = {
            ...context,
            url: req.headers.referer || req.originalUrl,
            user_agent: req.headers['user-agent'],
            ip_address: req.ip || req.connection.remoteAddress,
            user_id: req.user?.id || context?.user_id,
            tenant_id: req.user?.tenantId || context?.tenant_id,
            session_id: req.sessionID || context?.session_id
        };

        const result = await logsService.log({
            log_type: log_type || 'INFO',
            category: category || 'FRONTEND',
            message,
            data,
            severity: severity || 1,
            stack_trace,
            ...enrichedContext
        });

        res.json(result);
    } catch (error) {
        console.error('[LogsAPI] Error creando log:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/logs/batch - Crear múltiples logs (batch)
 * Body: { logs: [...] }
 */
router.post('/batch', async (req, res) => {
    try {
        const { logs } = req.body;

        if (!Array.isArray(logs)) {
            return res.status(400).json({ 
                success: false, 
                error: 'logs debe ser un array' 
            });
        }

        // Procesar cada log
        const results = await Promise.all(
            logs.map(log => logsService.log({
                ...log,
                url: req.headers.referer || req.originalUrl,
                user_agent: req.headers['user-agent'],
                ip_address: req.ip || req.connection.remoteAddress,
                user_id: req.user?.id || log.user_id,
                tenant_id: req.user?.tenantId || log.tenant_id
            }))
        );

        res.json({ 
            success: true, 
            saved: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
        });
    } catch (error) {
        console.error('[LogsAPI] Error en batch:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/logs - Obtener logs con filtros
 * Query: limit, offset, log_type, category, severity, tenant_id, user_id, from_date, to_date
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
            limit: parseInt(req.query.limit) || 100,
            offset: parseInt(req.query.offset) || 0,
            log_type: req.query.log_type,
            category: req.query.category,
            severity: req.query.severity ? parseInt(req.query.severity) : undefined,
            tenant_id: req.query.tenant_id || req.user?.tenantId,
            user_id: req.query.user_id,
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };

        const result = await logsService.getRecentLogs(filters);
        res.json(result);
    } catch (error) {
        console.error('[LogsAPI] Error obteniendo logs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/logs/stats - Obtener estadísticas de logs
 * Query: tenant_id, hours
 */
router.get('/stats', async (req, res) => {
    try {
        const filters = {
            tenant_id: req.query.tenant_id || req.user?.tenantId,
            hours: parseInt(req.query.hours) || 24
        };

        const result = await logsService.getStats(filters);
        res.json(result);
    } catch (error) {
        console.error('[LogsAPI] Error obteniendo stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/logs/errors - Obtener solo errores sin resolver
 */
router.get('/errors', async (req, res) => {
    try {
        const result = await logsService.getRecentLogs({
            log_type: 'ERROR',
            limit: parseInt(req.query.limit) || 50,
            tenant_id: req.query.tenant_id || req.user?.tenantId
        });
        res.json(result);
    } catch (error) {
        console.error('[LogsAPI] Error obteniendo errores:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/logs/cleanup - Limpiar logs antiguos (admin only)
 */
router.post('/cleanup', async (req, res) => {
    try {
        // TODO: Agregar verificación de permisos admin
        const result = await logsService.cleanup();
        res.json(result);
    } catch (error) {
        console.error('[LogsAPI] Error en cleanup:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/logs/:id/resolve - Marcar error como resuelto
 */
router.post('/:id/resolve', async (req, res) => {
    try {
        const { id } = req.params;
        
        const SystemLog = (await import('../src/models/SystemLog.model.js')).default;
        const log = await SystemLog.findById(id);
        
        if (!log) {
            return res.status(404).json({ success: false, error: 'Log no encontrado' });
        }
        
        await log.resolve();
        
        res.json({ success: true, message: 'Error marcado como resuelto' });
    } catch (error) {
        console.error('[LogsAPI] Error resolviendo error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/logs/health - Health check del sistema de logs
 */
router.get('/health', async (req, res) => {
    try {
        // Verificar que podemos escribir en la BD
        const testResult = await logsService.info(
            'HEALTH_CHECK',
            'Health check del sistema de logs',
            { test: true }
        );

        res.json({ 
            success: true, 
            status: 'healthy',
            can_write: testResult.success,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            status: 'unhealthy',
            error: error.message 
        });
    }
});

export default router;
