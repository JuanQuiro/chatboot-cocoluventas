/**
 * Flows API Routes
 * Endpoints para gestionar flujos de conversación desde el dashboard
 */

import express from 'express';
import flowManager from '../services/flow-manager.service.js';
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/flows
 * Obtener todos los flujos
 */
router.get('/', requireAuth, requirePermission('bots.view'), (req, res) => {
    try {
        const { botId } = req.query;
        const flows = flowManager.getFlows(botId);
        
        res.json({
            success: true,
            flows,
            count: flows.length,
        });
    } catch (error) {
        logger.error('Error getting flows:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/flows/stats
 * Obtener estadísticas globales de flujos
 */
router.get('/stats', requireAuth, requirePermission('bots.view'), (req, res) => {
    try {
        const { botId } = req.query;
        const stats = flowManager.getGlobalStats(botId);
        
        res.json({
            success: true,
            stats,
        });
    } catch (error) {
        logger.error('Error getting flow stats:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/flows/top
 * Obtener flujos más populares
 */
router.get('/top', requireAuth, requirePermission('bots.view'), (req, res) => {
    try {
        const { botId, limit = 10 } = req.query;
        const topFlows = flowManager.getTopFlows(parseInt(limit), botId);
        
        res.json({
            success: true,
            flows: topFlows,
        });
    } catch (error) {
        logger.error('Error getting top flows:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/flows/search
 * Buscar flujos
 */
router.get('/search', requireAuth, requirePermission('bots.view'), (req, res) => {
    try {
        const { q, botId } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter "q" is required',
            });
        }

        const flows = flowManager.searchFlows(q, botId);
        
        res.json({
            success: true,
            flows,
            count: flows.length,
        });
    } catch (error) {
        logger.error('Error searching flows:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/flows/:flowId
 * Obtener un flujo específico
 */
router.get('/:flowId', requireAuth, requirePermission('bots.view'), (req, res) => {
    try {
        const { flowId } = req.params;
        const flow = flowManager.getFlow(flowId);
        
        if (!flow) {
            return res.status(404).json({
                success: false,
                error: 'Flow not found',
            });
        }

        res.json({
            success: true,
            flow,
        });
    } catch (error) {
        logger.error('Error getting flow:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/flows/:flowId/activate
 * Activar un flujo
 */
router.post('/:flowId/activate', requireAuth, requirePermission('bots.manage'), (req, res) => {
    try {
        const { flowId } = req.params;
        const result = flowManager.activateFlow(flowId);
        
        if (!result.success) {
            return res.status(404).json(result);
        }

        logger.info(`Flow activated: ${flowId} by user ${req.user.email}`);

        res.json({
            success: true,
            message: 'Flow activated successfully',
            flowId,
        });
    } catch (error) {
        logger.error('Error activating flow:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/flows/:flowId/deactivate
 * Desactivar un flujo
 */
router.post('/:flowId/deactivate', requireAuth, requirePermission('bots.manage'), (req, res) => {
    try {
        const { flowId } = req.params;
        const result = flowManager.deactivateFlow(flowId);
        
        if (!result.success) {
            return res.status(404).json(result);
        }

        logger.info(`Flow deactivated: ${flowId} by user ${req.user.email}`);

        res.json({
            success: true,
            message: 'Flow deactivated successfully',
            flowId,
        });
    } catch (error) {
        logger.error('Error deactivating flow:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * PATCH /api/flows/:flowId
 * Actualizar configuración de un flujo
 */
router.patch('/:flowId', requireAuth, requirePermission('bots.configure'), (req, res) => {
    try {
        const { flowId } = req.params;
        const updates = req.body;

        const result = flowManager.updateFlowConfig(flowId, updates);
        
        if (!result.success) {
            return res.status(404).json(result);
        }

        logger.info(`Flow updated: ${flowId} by user ${req.user.email}`);

        res.json({
            success: true,
            message: 'Flow updated successfully',
            flow: result.config,
        });
    } catch (error) {
        logger.error('Error updating flow:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/flows/:flowId/reset-stats
 * Resetear estadísticas de un flujo
 */
router.post('/:flowId/reset-stats', requireAuth, requirePermission('bots.manage'), (req, res) => {
    try {
        const { flowId } = req.params;
        const result = flowManager.resetStats(flowId);

        logger.info(`Flow stats reset: ${flowId} by user ${req.user.email}`);

        res.json({
            success: true,
            message: 'Flow stats reset successfully',
        });
    } catch (error) {
        logger.error('Error resetting flow stats:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * DELETE /api/flows/:flowId
 * Eliminar un flujo
 */
router.delete('/:flowId', requireAuth, requirePermission('bots.delete'), (req, res) => {
    try {
        const { flowId } = req.params;
        const result = flowManager.deleteFlow(flowId);
        
        if (!result.success) {
            return res.status(404).json(result);
        }

        logger.info(`Flow deleted: ${flowId} by user ${req.user.email}`);

        res.json({
            success: true,
            message: 'Flow deleted successfully',
        });
    } catch (error) {
        logger.error('Error deleting flow:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

export default router;
