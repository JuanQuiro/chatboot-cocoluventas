/**
 * Bot Manager Service
 * Orquesta y gestiona el ciclo de vida de todos los chatbots
 */

import logger from '../utils/logger.js';
import { EventEmitter } from 'events';

class BotManager extends EventEmitter {
    constructor() {
        super();
        this.bots = new Map(); // botId -> botInstance
        this.botConfigs = new Map(); // botId -> config
        this.botStatus = new Map(); // botId -> status
        this.qrCodes = new Map(); // botId -> qrData
        this.reconnectAttempts = new Map(); // botId -> attempts
        this.maxReconnectAttempts = 5;
    }

    /**
     * Registrar un bot
     */
    registerBot(botId, config) {
        logger.info(`Registering bot: ${botId}`, config);

        this.botConfigs.set(botId, {
            ...config,
            botId,
            createdAt: new Date(),
            tenantId: config.tenantId,
            adapter: config.adapter || 'baileys', // baileys, venom, etc.
            name: config.name || `Bot ${botId}`,
            phoneNumber: config.phoneNumber,
            webhookUrl: config.webhookUrl,
            autoReconnect: config.autoReconnect !== false,
        });

        this.botStatus.set(botId, {
            state: 'registered',
            connectedAt: null,
            lastActivity: null,
            messagesReceived: 0,
            messagesSent: 0,
            errors: 0,
            uptime: 0,
        });

        this.emit('bot:registered', { botId, config });
        return { success: true, botId };
    }

    /**
     * Iniciar un bot
     */
    async startBot(botId) {
        try {
            const config = this.botConfigs.get(botId);
            if (!config) {
                throw new Error(`Bot ${botId} not found`);
            }

            const currentStatus = this.botStatus.get(botId);
            if (currentStatus.state === 'connected') {
                return { success: true, message: 'Bot already connected' };
            }

            logger.info(`Starting bot: ${botId} with adapter: ${config.adapter}`);

            // Actualizar estado
            this.updateBotStatus(botId, { state: 'starting' });
            this.emit('bot:starting', { botId });

            // Cargar el adaptador apropiado
            const adapter = await this.loadAdapter(config.adapter);
            
            // Inicializar bot con el adaptador
            const botInstance = await adapter.createBot(config);

            // Configurar event handlers del bot
            this.setupBotHandlers(botId, botInstance);

            // Guardar instancia
            this.bots.set(botId, botInstance);

            // Iniciar el bot
            await botInstance.start();

            // Actualizar estado
            this.updateBotStatus(botId, {
                state: 'connecting',
                startedAt: new Date(),
            });

            logger.info(`Bot ${botId} started successfully`);
            return { success: true, botId };

        } catch (error) {
            logger.error(`Error starting bot ${botId}:`, error);
            this.updateBotStatus(botId, {
                state: 'error',
                error: error.message,
            });
            this.emit('bot:error', { botId, error: error.message });
            throw error;
        }
    }

    /**
     * Detener un bot
     */
    async stopBot(botId) {
        try {
            const bot = this.bots.get(botId);
            if (!bot) {
                throw new Error(`Bot ${botId} not running`);
            }

            logger.info(`Stopping bot: ${botId}`);
            this.emit('bot:stopping', { botId });

            await bot.stop();
            this.bots.delete(botId);
            this.qrCodes.delete(botId);

            this.updateBotStatus(botId, {
                state: 'stopped',
                stoppedAt: new Date(),
            });

            this.emit('bot:stopped', { botId });
            logger.info(`Bot ${botId} stopped successfully`);

            return { success: true, botId };
        } catch (error) {
            logger.error(`Error stopping bot ${botId}:`, error);
            throw error;
        }
    }

    /**
     * Reiniciar un bot
     */
    async restartBot(botId) {
        logger.info(`Restarting bot: ${botId}`);
        await this.stopBot(botId);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s
        return await this.startBot(botId);
    }

    /**
     * Obtener estado de un bot
     */
    getBotStatus(botId) {
        const config = this.botConfigs.get(botId);
        const status = this.botStatus.get(botId);
        const qr = this.qrCodes.get(botId);
        const isRunning = this.bots.has(botId);

        if (!config || !status) {
            return null;
        }

        return {
            botId,
            name: config.name,
            adapter: config.adapter,
            phoneNumber: config.phoneNumber,
            tenantId: config.tenantId,
            status: status.state,
            isRunning,
            qrCode: qr,
            stats: {
                connectedAt: status.connectedAt,
                lastActivity: status.lastActivity,
                messagesReceived: status.messagesReceived,
                messagesSent: status.messagesSent,
                errors: status.errors,
                uptime: status.connectedAt 
                    ? Date.now() - status.connectedAt.getTime()
                    : 0,
            },
        };
    }

    /**
     * Obtener todos los bots
     */
    getAllBots(tenantId = null) {
        const bots = [];
        
        for (const [botId, config] of this.botConfigs.entries()) {
            if (tenantId && config.tenantId !== tenantId) {
                continue;
            }
            bots.push(this.getBotStatus(botId));
        }

        return bots;
    }

    /**
     * Obtener QR code de un bot
     */
    getQRCode(botId) {
        return this.qrCodes.get(botId) || null;
    }

    /**
     * Actualizar estado de un bot
     */
    updateBotStatus(botId, updates) {
        const current = this.botStatus.get(botId) || {};
        this.botStatus.set(botId, {
            ...current,
            ...updates,
            updatedAt: new Date(),
        });
        
        this.emit('bot:status:updated', { botId, status: this.botStatus.get(botId) });
    }

    /**
     * Configurar event handlers para el bot
     */
    setupBotHandlers(botId, botInstance) {
        // QR Code generado
        botInstance.on('qr', (qr) => {
            logger.info(`QR Code generated for bot ${botId}`);
            this.qrCodes.set(botId, qr);
            this.updateBotStatus(botId, { state: 'qr_ready' });
            this.emit('bot:qr', { botId, qr });
        });

        // Bot conectado
        botInstance.on('ready', () => {
            logger.info(`Bot ${botId} connected`);
            this.qrCodes.delete(botId); // Limpiar QR
            this.updateBotStatus(botId, {
                state: 'connected',
                connectedAt: new Date(),
            });
            this.reconnectAttempts.delete(botId);
            this.emit('bot:connected', { botId });
        });

        // Bot desconectado
        botInstance.on('disconnected', async (reason) => {
            logger.warn(`Bot ${botId} disconnected:`, reason);
            this.updateBotStatus(botId, { state: 'disconnected' });
            this.emit('bot:disconnected', { botId, reason });

            // Auto-reconexión
            const config = this.botConfigs.get(botId);
            if (config.autoReconnect) {
                await this.handleReconnect(botId);
            }
        });

        // Mensaje recibido
        botInstance.on('message', (message) => {
            const status = this.botStatus.get(botId);
            this.updateBotStatus(botId, {
                lastActivity: new Date(),
                messagesReceived: status.messagesReceived + 1,
            });
            this.emit('bot:message', { botId, message });
        });

        // Mensaje enviado
        botInstance.on('message:sent', () => {
            const status = this.botStatus.get(botId);
            this.updateBotStatus(botId, {
                messagesSent: status.messagesSent + 1,
            });
        });

        // Error
        botInstance.on('error', (error) => {
            logger.error(`Bot ${botId} error:`, error);
            const status = this.botStatus.get(botId);
            this.updateBotStatus(botId, {
                errors: status.errors + 1,
                lastError: error.message,
            });
            this.emit('bot:error', { botId, error: error.message });
        });
    }

    /**
     * Manejar reconexión automática
     */
    async handleReconnect(botId) {
        const attempts = this.reconnectAttempts.get(botId) || 0;
        
        if (attempts >= this.maxReconnectAttempts) {
            logger.error(`Max reconnect attempts reached for bot ${botId}`);
            this.updateBotStatus(botId, {
                state: 'failed',
                error: 'Max reconnect attempts reached',
            });
            return;
        }

        this.reconnectAttempts.set(botId, attempts + 1);
        const delay = Math.min(1000 * Math.pow(2, attempts), 30000); // Exponential backoff

        logger.info(`Reconnecting bot ${botId} in ${delay}ms (attempt ${attempts + 1})`);
        
        setTimeout(async () => {
            try {
                await this.restartBot(botId);
            } catch (error) {
                logger.error(`Reconnect failed for bot ${botId}:`, error);
            }
        }, delay);
    }

    /**
     * Cargar adaptador apropiado
     */
    async loadAdapter(adapterType) {
        // Usar el adaptador universal de BuilderBot para todos los providers
        const supportedProviders = ['baileys', 'venom', 'wppconnect', 'meta', 'twilio'];
        
        if (supportedProviders.includes(adapterType.toLowerCase())) {
            const { BuilderBotUniversalAdapter } = await import('../core/adapters/BuilderBotUniversalAdapter.js');
            return new BuilderBotUniversalAdapter();
        }
        
        // Fallback a adaptadores legacy
        switch (adapterType.toLowerCase()) {
            case 'baileys-legacy':
                const { BaileysAdapter } = await import('../core/adapters/BaileysAdapter.js');
                return new BaileysAdapter();
                
            case 'venom-legacy':
                const { VenomAdapter } = await import('../core/adapters/VenomAdapter.js');
                return new VenomAdapter();
                
            default:
                throw new Error(`Unknown adapter type: ${adapterType}`);
        }
    }

    /**
     * Enviar mensaje desde un bot
     */
    async sendMessage(botId, to, message) {
        const bot = this.bots.get(botId);
        if (!bot) {
            throw new Error(`Bot ${botId} not running`);
        }

        return await bot.sendMessage(to, message);
    }

    /**
     * Obtener estadísticas globales
     */
    getGlobalStats() {
        const stats = {
            totalBots: this.botConfigs.size,
            runningBots: this.bots.size,
            connectedBots: 0,
            disconnectedBots: 0,
            errorBots: 0,
            totalMessages: 0,
            totalErrors: 0,
        };

        for (const status of this.botStatus.values()) {
            if (status.state === 'connected') stats.connectedBots++;
            if (status.state === 'disconnected') stats.disconnectedBots++;
            if (status.state === 'error' || status.state === 'failed') stats.errorBots++;
            stats.totalMessages += status.messagesReceived + status.messagesSent;
            stats.totalErrors += status.errors;
        }

        return stats;
    }

    /**
     * Limpiar bots detenidos
     */
    cleanup() {
        for (const [botId, status] of this.botStatus.entries()) {
            if (status.state === 'stopped' && !this.bots.has(botId)) {
                this.botConfigs.delete(botId);
                this.botStatus.delete(botId);
                this.qrCodes.delete(botId);
                this.reconnectAttempts.delete(botId);
                logger.info(`Cleaned up bot ${botId}`);
            }
        }
    }

    /**
     * Detener todos los bots
     */
    async stopAll() {
        logger.info('Stopping all bots...');
        const promises = [];
        
        for (const botId of this.bots.keys()) {
            promises.push(this.stopBot(botId).catch(err => {
                logger.error(`Error stopping bot ${botId}:`, err);
            }));
        }

        await Promise.all(promises);
        logger.info('All bots stopped');
    }
}

// Singleton
const botManager = new BotManager();

export default botManager;
