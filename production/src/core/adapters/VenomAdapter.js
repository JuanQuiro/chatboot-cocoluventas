/**
 * Venom WhatsApp Adapter
 * Adaptador para Venom Bot
 */

import { EventEmitter } from 'events';
import logger from '../../utils/logger.js';

export class VenomAdapter {
    constructor() {
        this.name = 'venom';
    }

    /**
     * Crear instancia de bot con Venom
     */
    async createBot(config) {
        return new VenomBot(config);
    }
}

class VenomBot extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.botId = config.botId;
        this.client = null;
        this.qr = null;
        this.state = 'disconnected';
    }

    /**
     * Iniciar bot
     */
    async start() {
        try {
            logger.info(`Starting Venom bot: ${this.botId}`);

            // Importar Venom dinámicamente
            const venom = await this.importVenom();
            
            if (!venom) {
                // Si Venom no está instalado, usar modo mock
                return await this.startMockMode();
            }

            const { create } = venom;

            // Crear cliente Venom
            this.client = await create({
                session: this.botId,
                multidevice: true,
                headless: true,
                useChrome: false,
                logQR: false, // Lo manejamos nosotros
                disableWelcome: true,
                updatesLog: false,
                autoClose: 60000,
                createPathFileToken: true,
                waitForLogin: true,
            },
            // Callbacks
            (base64Qr, asciiQR) => {
                // QR generado
                this.qr = base64Qr;
                this.emit('qr', base64Qr);
                logger.info(`QR Code generated for ${this.botId}`);
            },
            (statusSession, session) => {
                // Estado de sesión
                logger.info(`Venom session status: ${statusSession}`);
            },
            (info) => {
                // Info de conexión
                logger.info(`Venom info:`, info);
            });

            // Event: Cliente conectado
            this.client.onStateChange((state) => {
                logger.info(`Venom state changed to: ${state}`);
                
                if (state === 'CONNECTED') {
                    this.state = 'connected';
                    this.qr = null;
                    this.emit('ready');
                    logger.info(`Venom bot ${this.botId} connected`);
                } else if (state === 'DISCONNECTED' || state === 'TIMEOUT') {
                    this.state = 'disconnected';
                    this.emit('disconnected', { reason: state });
                }
            });

            // Event: Mensajes
            this.client.onMessage(async (message) => {
                if (message.isGroupMsg && !this.config.acceptGroupMessages) {
                    return; // Ignorar grupos si no está habilitado
                }

                if (message.fromMe) return; // Ignorar mensajes propios

                this.emit('message', {
                    from: message.from,
                    body: message.body,
                    messageId: message.id,
                    timestamp: message.timestamp,
                    pushName: message.sender?.pushname || message.notifyName,
                    isGroup: message.isGroupMsg,
                });
            });

            // Event: Errores
            this.client.onIncomingCall(async (call) => {
                logger.info(`Incoming call from ${call.peerJid}`);
                // Rechazar llamadas automáticamente
                await this.client.rejectCall(call.id);
            });

            logger.info(`Venom bot ${this.botId} initialized`);
            return this;

        } catch (error) {
            logger.error(`Error starting Venom bot ${this.botId}:`, error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Detener bot
     */
    async stop() {
        try {
            if (this.client) {
                await this.client.close();
                this.client = null;
            }
            this.state = 'stopped';
            logger.info(`Venom bot ${this.botId} stopped`);
        } catch (error) {
            logger.error(`Error stopping Venom bot ${this.botId}:`, error);
            throw error;
        }
    }

    /**
     * Enviar mensaje
     */
    async sendMessage(to, message) {
        if (!this.client || this.state !== 'connected') {
            throw new Error('Bot not connected');
        }

        try {
            await this.client.sendText(to, message);
            this.emit('message:sent', { to, message });
            return { success: true };
        } catch (error) {
            logger.error(`Error sending message from ${this.botId}:`, error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Importar Venom (maneja si no está instalado)
     */
    async importVenom() {
        try {
            const venom = await import('venom-bot');
            return venom;
        } catch (error) {
            logger.warn('Venom not installed, using mock mode');
            return null;
        }
    }

    /**
     * Modo mock para desarrollo
     */
    async startMockMode() {
        logger.info(`Starting Venom bot ${this.botId} in MOCK mode`);
        
        // Simular generación de QR después de 1s
        setTimeout(() => {
            this.qr = `data:image/png;base64,MOCK_QR_${this.botId}`;
            this.emit('qr', this.qr);
            logger.info(`Mock QR generated for ${this.botId}`);
        }, 1000);

        // Simular conexión después de 3s
        setTimeout(() => {
            this.state = 'connected';
            this.qr = null;
            this.emit('ready');
            logger.info(`Mock bot ${this.botId} connected`);
        }, 3000);

        return this;
    }
}
