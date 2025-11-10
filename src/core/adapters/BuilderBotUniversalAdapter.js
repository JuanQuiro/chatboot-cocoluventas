/**
 * BuilderBot Universal Adapter
 * Adaptador que soporta TODOS los providers de BuilderBot:
 * - Baileys (WhatsApp Web Multi-Device) - GRATIS con QR
 * - Venom (Puppeteer WhatsApp Web) - GRATIS con QR
 * - WPPConnect (WhatsApp Web) - GRATIS con QR
 * - Meta (WhatsApp Business API) - PAGO, oficial
 * - Twilio (Twilio WhatsApp) - PAGO
 */

import { EventEmitter } from 'events';
import { createBot, createProvider, createFlow } from '@builderbot/bot';
import logger from '../../utils/logger.js';

export class BuilderBotUniversalAdapter {
    constructor() {
        this.name = 'builderbot-universal';
        this.supportedProviders = ['baileys', 'venom', 'wppconnect', 'meta', 'twilio'];
    }

    /**
     * Crear instancia de bot con BuilderBot
     */
    async createBot(config) {
        return new BuilderBotInstance(config);
    }

    /**
     * Verificar si un provider está soportado
     */
    isProviderSupported(providerName) {
        return this.supportedProviders.includes(providerName.toLowerCase());
    }

    /**
     * Obtener información de un provider
     */
    getProviderInfo(providerName) {
        const providers = {
            baileys: {
                name: 'Baileys',
                type: 'free',
                requiresQR: true,
                package: '@builderbot/provider-baileys',
                description: 'WhatsApp Web Multi-Device (Gratis)',
                official: false,
            },
            venom: {
                name: 'Venom',
                type: 'free',
                requiresQR: true,
                package: '@builderbot/provider-venom',
                description: 'Puppeteer-based WhatsApp (Gratis)',
                official: false,
            },
            wppconnect: {
                name: 'WPPConnect',
                type: 'free',
                requiresQR: true,
                package: '@builderbot/provider-wppconnect',
                description: 'WPPConnect WhatsApp Web (Gratis)',
                official: false,
            },
            meta: {
                name: 'Meta',
                type: 'paid',
                requiresQR: false,
                package: '@builderbot/provider-meta',
                description: 'WhatsApp Business API Oficial (Pago)',
                official: true,
            },
            twilio: {
                name: 'Twilio',
                type: 'paid',
                requiresQR: false,
                package: '@builderbot/provider-twilio',
                description: 'Twilio WhatsApp (Pago)',
                official: true,
            },
        };

        return providers[providerName.toLowerCase()];
    }
}

class BuilderBotInstance extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.botId = config.botId;
        this.providerType = config.adapter || 'baileys';
        this.bot = null;
        this.provider = null;
        this.state = 'disconnected';
        this.qr = null;
    }

    /**
     * Iniciar bot
     */
    async start() {
        try {
            logger.info(`Starting BuilderBot ${this.botId} with provider: ${this.providerType}`);

            // Cargar provider específico
            const ProviderClass = await this.loadProvider(this.providerType);
            
            if (!ProviderClass) {
                // Si no está instalado, usar modo mock
                return await this.startMockMode();
            }

            // Crear provider con configuración
            this.provider = createProvider(ProviderClass, this.getProviderConfig());

            // Configurar event handlers del provider
            this.setupProviderHandlers();

            // Crear flujo vacío (el bot manager manejará los flows)
            const flow = createFlow([]);

            // Crear bot de BuilderBot
            this.bot = await createBot({
                flow,
                provider: this.provider,
                database: null, // Opcional
            });

            logger.info(`BuilderBot ${this.botId} initialized successfully`);
            return this;

        } catch (error) {
            logger.error(`Error starting BuilderBot ${this.botId}:`, error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Detener bot
     */
    async stop() {
        try {
            if (this.bot) {
                // BuilderBot no tiene método stop directo, cerramos el provider
                if (this.provider && this.provider.vendor) {
                    if (this.provider.vendor.close) {
                        await this.provider.vendor.close();
                    } else if (this.provider.vendor.logout) {
                        await this.provider.vendor.logout();
                    }
                }
                this.bot = null;
                this.provider = null;
            }
            this.state = 'stopped';
            logger.info(`BuilderBot ${this.botId} stopped`);
        } catch (error) {
            logger.error(`Error stopping BuilderBot ${this.botId}:`, error);
            throw error;
        }
    }

    /**
     * Enviar mensaje
     */
    async sendMessage(to, message) {
        if (!this.provider || this.state !== 'connected') {
            throw new Error('Bot not connected');
        }

        try {
            // BuilderBot usa sendMessage del provider
            await this.provider.sendMessage(to, message, {});
            this.emit('message:sent', { to, message });
            return { success: true };
        } catch (error) {
            logger.error(`Error sending message from ${this.botId}:`, error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Cargar provider específico
     */
    async loadProvider(providerType) {
        const providers = {
            baileys: '@builderbot/provider-baileys',
            venom: '@builderbot/provider-venom',
            wppconnect: '@builderbot/provider-wppconnect',
            meta: '@builderbot/provider-meta',
            twilio: '@builderbot/provider-twilio',
        };

        const packageName = providers[providerType.toLowerCase()];
        if (!packageName) {
            throw new Error(`Unknown provider: ${providerType}`);
        }

        try {
            const providerModule = await import(packageName);
            // Cada provider exporta un Provider diferente
            const providerNames = {
                baileys: 'BaileysProvider',
                venom: 'VenomProvider',
                wppconnect: 'WPPConnectProvider',
                meta: 'MetaProvider',
                twilio: 'TwilioProvider',
            };
            const providerName = providerNames[providerType.toLowerCase()];
            return providerModule[providerName];
        } catch (error) {
            logger.warn(`Provider ${providerType} not installed:`, error.message);
            return null;
        }
    }

    /**
     * Obtener configuración del provider
     */
    getProviderConfig() {
        const config = {};

        switch (this.providerType.toLowerCase()) {
            case 'baileys':
            case 'venom':
            case 'wppconnect':
                // Providers gratuitos con QR - no requieren config especial
                config.name = this.botId;
                break;

            case 'meta':
                // Meta requires: jwtToken, numberId, verifyToken, version
                config.jwtToken = this.config.metaJwtToken || process.env.META_JWT_TOKEN;
                config.numberId = this.config.metaNumberId || process.env.META_NUMBER_ID;
                config.verifyToken = this.config.metaVerifyToken || process.env.META_VERIFY_TOKEN;
                config.version = this.config.metaVersion || 'v18.0';
                break;

            case 'twilio':
                // Twilio requires: accountSid, authToken, vendorNumber
                config.accountSid = this.config.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
                config.authToken = this.config.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;
                config.vendorNumber = this.config.twilioVendorNumber || process.env.TWILIO_VENDOR_NUMBER;
                config.publicUrl = this.config.twilioPublicUrl || process.env.TWILIO_PUBLIC_URL;
                break;
        }

        return config;
    }

    /**
     * Configurar event handlers del provider
     */
    setupProviderHandlers() {
        if (!this.provider || !this.provider.vendor) {
            return;
        }

        const vendor = this.provider.vendor;

        // QR Code (solo para providers gratuitos)
        if (vendor.on && ['baileys', 'venom', 'wppconnect'].includes(this.providerType.toLowerCase())) {
            vendor.on('qr', (qr) => {
                this.qr = qr;
                this.emit('qr', qr);
                logger.info(`QR Code generated for ${this.botId}`);
            });
        }

        // Ready/Connected
        if (vendor.on) {
            vendor.on('ready', () => {
                this.state = 'connected';
                this.qr = null;
                this.emit('ready');
                logger.info(`BuilderBot ${this.botId} connected`);
            });
        }

        // Messages
        if (this.provider.on) {
            this.provider.on('message', (message) => {
                this.emit('message', {
                    from: message.from,
                    body: message.body,
                    messageId: message.key?.id || message.id,
                    timestamp: message.messageTimestamp || Date.now(),
                    pushName: message.pushName,
                    isGroup: message.key?.remoteJid?.includes('@g.us') || false,
                });
            });
        }

        // Error
        if (vendor.on) {
            vendor.on('error', (error) => {
                logger.error(`BuilderBot ${this.botId} error:`, error);
                this.emit('error', error);
            });
        }
    }

    /**
     * Modo mock para desarrollo
     */
    async startMockMode() {
        logger.info(`Starting BuilderBot ${this.botId} in MOCK mode (${this.providerType})`);
        
        this.state = 'starting';

        // Simular QR solo para providers gratuitos
        if (['baileys', 'venom', 'wppconnect'].includes(this.providerType.toLowerCase())) {
            setTimeout(() => {
                this.qr = `MOCK_QR_${this.providerType}_${this.botId}_${Date.now()}`;
                this.emit('qr', this.qr);
                logger.info(`Mock QR generated for ${this.botId} (${this.providerType})`);
            }, 1000);

            // Simular conexión después de 3s
            setTimeout(() => {
                this.state = 'connected';
                this.qr = null;
                this.emit('ready');
                logger.info(`Mock bot ${this.botId} connected (${this.providerType})`);
            }, 3000);
        } else {
            // Providers de pago se conectan "inmediatamente" en mock
            setTimeout(() => {
                this.state = 'connected';
                this.emit('ready');
                logger.info(`Mock bot ${this.botId} connected (${this.providerType} - paid)`);
            }, 1500);
        }

        return this;
    }
}
