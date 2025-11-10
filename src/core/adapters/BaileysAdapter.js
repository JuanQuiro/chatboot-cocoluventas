/**
 * Baileys WhatsApp Adapter
 * Adaptador para Baileys (WhatsApp Web Multi-Device)
 */

import { EventEmitter } from 'events';
import logger from '../../utils/logger.js';

export class BaileysAdapter {
    constructor() {
        this.name = 'baileys';
    }

    /**
     * Crear instancia de bot con Baileys
     */
    async createBot(config) {
        return new BaileysBot(config);
    }
}

class BaileysBot extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.botId = config.botId;
        this.sock = null;
        this.qr = null;
        this.state = 'disconnected';
        this.authState = null;
    }

    /**
     * Iniciar bot
     */
    async start() {
        try {
            logger.info(`Starting Baileys bot: ${this.botId}`);

            // Importar Baileys dinámicamente
            const baileys = await this.importBaileys();
            
            if (!baileys) {
                // Si Baileys no está instalado, usar modo mock
                return await this.startMockMode();
            }

            const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys;

            // Cargar auth state
            const authFolder = `./sessions/${this.botId}`;
            const { state, saveCreds } = await useMultiFileAuthState(authFolder);
            this.authState = state;

            // Crear conexión
            this.sock = makeWASocket({
                auth: state,
                printQRInTerminal: false, // Lo manejamos nosotros
                logger: {
                    level: 'silent', // Silenciar logs internos
                    fatal: () => {},
                    error: () => {},
                    warn: () => {},
                    info: () => {},
                    debug: () => {},
                    trace: () => {},
                },
            });

            // Event: Actualización de conexión
            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.qr = qr;
                    this.emit('qr', qr);
                    logger.info(`QR Code generated for ${this.botId}`);
                }

                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                    
                    logger.warn(`Connection closed for ${this.botId}, statusCode: ${statusCode}`);
                    
                    this.state = 'disconnected';
                    this.emit('disconnected', { 
                        reason: lastDisconnect?.error?.message || 'Connection closed',
                        shouldReconnect,
                    });
                }

                if (connection === 'open') {
                    this.state = 'connected';
                    this.qr = null;
                    this.emit('ready');
                    logger.info(`Bot ${this.botId} connected successfully`);
                }
            });

            // Event: Guardar credenciales
            this.sock.ev.on('creds.update', saveCreds);

            // Event: Mensajes
            this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
                if (type !== 'notify') return;

                for (const message of messages) {
                    if (message.key.fromMe) continue; // Ignorar mensajes propios

                    this.emit('message', {
                        from: message.key.remoteJid,
                        body: message.message?.conversation || 
                              message.message?.extendedTextMessage?.text || '',
                        messageId: message.key.id,
                        timestamp: message.messageTimestamp,
                        pushName: message.pushName,
                        isGroup: message.key.remoteJid.includes('@g.us'),
                    });
                }
            });

            logger.info(`Baileys bot ${this.botId} initialized`);
            return this;

        } catch (error) {
            logger.error(`Error starting Baileys bot ${this.botId}:`, error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Detener bot
     */
    async stop() {
        try {
            if (this.sock) {
                await this.sock.logout();
                this.sock = null;
            }
            this.state = 'stopped';
            logger.info(`Baileys bot ${this.botId} stopped`);
        } catch (error) {
            logger.error(`Error stopping Baileys bot ${this.botId}:`, error);
            throw error;
        }
    }

    /**
     * Enviar mensaje
     */
    async sendMessage(to, message) {
        if (!this.sock || this.state !== 'connected') {
            throw new Error('Bot not connected');
        }

        try {
            const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
            await this.sock.sendMessage(jid, { text: message });
            this.emit('message:sent', { to, message });
            return { success: true };
        } catch (error) {
            logger.error(`Error sending message from ${this.botId}:`, error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Importar Baileys (maneja si no está instalado)
     */
    async importBaileys() {
        try {
            const baileys = await import('@whiskeysockets/baileys');
            return baileys;
        } catch (error) {
            logger.warn('Baileys not installed, using mock mode');
            return null;
        }
    }

    /**
     * Modo mock para desarrollo
     */
    async startMockMode() {
        logger.info(`Starting Baileys bot ${this.botId} in MOCK mode`);
        
        // Simular generación de QR después de 1s
        setTimeout(() => {
            this.qr = `MOCK_QR_${this.botId}_${Date.now()}`;
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
