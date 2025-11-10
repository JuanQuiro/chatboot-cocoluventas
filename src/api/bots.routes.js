/**
 * Bots API Routes
 * Endpoints para gestionar chatbots desde el dashboard
 */

import express from 'express';
import botManager from '../services/bot-manager.service.js';
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/bots
 * Obtener todos los bots del tenant
 */
router.get('/', requireAuth, requirePermission('bots.view'), (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const bots = botManager.getAllBots(tenantId);
        
        res.json({
            success: true,
            bots,
            count: bots.length,
        });
    } catch (error) {
        logger.error('Error getting bots:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/bots/stats
 * Obtener estadísticas globales
 */
router.get('/stats', requireAuth, requirePermission('bots.view'), (req, res) => {
    try {
        const stats = botManager.getGlobalStats();
        res.json({
            success: true,
            stats,
        });
    } catch (error) {
        logger.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/bots/:botId
 * Obtener estado de un bot específico
 */
router.get('/:botId', requireAuth, requirePermission('bots.view'), (req, res) => {
    try {
        const { botId } = req.params;
        const tenantId = req.user.tenantId;
        
        const botStatus = botManager.getBotStatus(botId);
        
        if (!botStatus) {
            return res.status(404).json({
                success: false,
                error: 'Bot not found',
            });
        }

        // Verificar que el bot pertenece al tenant
        if (botStatus.tenantId !== tenantId && req.user.role !== 'owner') {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
            });
        }

        res.json({
            success: true,
            bot: botStatus,
        });
    } catch (error) {
        logger.error('Error getting bot status:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/bots/:botId/qr
 * Obtener QR code de un bot
 */
router.get('/:botId/qr', requireAuth, requirePermission('bots.view'), (req, res) => {
    try {
        const { botId } = req.params;
        const qr = botManager.getQRCode(botId);
        
        if (!qr) {
            return res.status(404).json({
                success: false,
                error: 'QR not available',
            });
        }

        res.json({
            success: true,
            qr,
        });
    } catch (error) {
        logger.error('Error getting QR code:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/bots
 * Crear y registrar un nuevo bot
 */
router.post('/', requireAuth, requirePermission('bots.create'), (req, res) => {
    try {
        const { name, adapter, phoneNumber, webhookUrl, autoReconnect } = req.body;
        const tenantId = req.user.tenantId;

        if (!name || !adapter) {
            return res.status(400).json({
                success: false,
                error: 'Name and adapter are required',
            });
        }

        const botId = `bot_${tenantId}_${Date.now()}`;

        const result = botManager.registerBot(botId, {
            name,
            adapter,
            phoneNumber,
            webhookUrl,
            autoReconnect,
            tenantId,
            createdBy: req.user.id,
        });

        logger.info(`Bot created: ${botId} by user ${req.user.email}`);

        res.json({
            success: true,
            botId,
            message: 'Bot registered successfully',
        });
    } catch (error) {
        logger.error('Error creating bot:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/bots/:botId/start
 * Iniciar un bot
 */
router.post('/:botId/start', requireAuth, requirePermission('bots.manage'), async (req, res) => {
    try {
        const { botId } = req.params;
        
        const result = await botManager.startBot(botId);
        
        logger.info(`Bot started: ${botId} by user ${req.user.email}`);

        res.json({
            success: true,
            message: 'Bot started successfully',
            botId,
        });
    } catch (error) {
        logger.error('Error starting bot:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/bots/:botId/stop
 * Detener un bot
 */
router.post('/:botId/stop', requireAuth, requirePermission('bots.manage'), async (req, res) => {
    try {
        const { botId } = req.params;
        
        const result = await botManager.stopBot(botId);
        
        logger.info(`Bot stopped: ${botId} by user ${req.user.email}`);

        res.json({
            success: true,
            message: 'Bot stopped successfully',
            botId,
        });
    } catch (error) {
        logger.error('Error stopping bot:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/bots/:botId/restart
 * Reiniciar un bot
 */
router.post('/:botId/restart', requireAuth, requirePermission('bots.manage'), async (req, res) => {
    try {
        const { botId } = req.params;
        
        const result = await botManager.restartBot(botId);
        
        logger.info(`Bot restarted: ${botId} by user ${req.user.email}`);

        res.json({
            success: true,
            message: 'Bot restarted successfully',
            botId,
        });
    } catch (error) {
        logger.error('Error restarting bot:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/bots/:botId/message
 * Enviar mensaje desde un bot
 */
router.post('/:botId/message', requireAuth, requirePermission('bots.send'), async (req, res) => {
    try {
        const { botId } = req.params;
        const { to, message } = req.body;

        if (!to || !message) {
            return res.status(400).json({
                success: false,
                error: 'To and message are required',
            });
        }

        const result = await botManager.sendMessage(botId, to, message);

        res.json({
            success: true,
            message: 'Message sent successfully',
        });
    } catch (error) {
        logger.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * DELETE /api/bots/:botId
 * Eliminar un bot (primero debe estar detenido)
 */
router.delete('/:botId', requireAuth, requirePermission('bots.delete'), async (req, res) => {
    try {
        const { botId } = req.params;
        
        // Primero detener si está corriendo
        const botStatus = botManager.getBotStatus(botId);
        if (botStatus && botStatus.isRunning) {
            await botManager.stopBot(botId);
        }

        // Eliminar configuración
        botManager.cleanup();

        logger.info(`Bot deleted: ${botId} by user ${req.user.email}`);

        res.json({
            success: true,
            message: 'Bot deleted successfully',
        });
    } catch (error) {
        logger.error('Error deleting bot:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

export default router;
