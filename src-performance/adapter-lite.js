/**
 * Adapter Baileys Ligero
 * Wrapper minimalista de Baileys
 * Consumo: 20-30MB
 */

import { EventEmitter } from 'events';

export class BaileysAdapterLite extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            phoneNumber: config.phoneNumber || '+584244370180',
            usePairingCode: config.usePairingCode !== false,
            ...config
        };
        
        this.sock = null;
        this.state = 'disconnected';
    }
    
    /**
     * Conectar a WhatsApp
     */
    async connect() {
        try {
            console.log('🔗 Conectando a WhatsApp...');
            
            // Lazy load Baileys
            const baileys = await this.importBaileys();
            
            if (!baileys) {
                throw new Error('Baileys no instalado');
            }
            
            const { default: makeWASocket, useMultiFileAuthState } = baileys;
            
            // Auth state minimalista
            const { state, saveCreds } = await useMultiFileAuthState('./sessions-lite');
            
            // Crear socket con configuración minimalista
            this.sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                browser: ['Cocolu', 'Chrome', '5.0'],
                logger: {
                    level: 'silent',
                    fatal: () => {},
                    error: () => {},
                    warn: () => {},
                    info: () => {},
                    debug: () => {},
                    trace: () => {}
                },
                // Optimizaciones
                syncFullHistory: false,
                markOnlineOnConnect: false,
                shouldSyncHistoryMessage: () => false,
                shouldIgnoreJid: () => false,
                retryRequestDelayMs: 100,
                maxMsgsInMemory: 50, // CRÍTICO: Reducir a 50
                messageRetryMap: new Map(),
                fetchMessagesFromWA: false,
                downloadHistory: false
            });
            
            // Event: Conexión actualizada
            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                
                if (qr) {
                    this.emit('qr', qr);
                }
                
                if (connection === 'open') {
                    this.state = 'connected';
                    this.emit('ready');
                }
                
                if (connection === 'close') {
                    this.state = 'disconnected';
                    this.emit('disconnected');
                }
            });
            
            // Event: Guardar credenciales
            this.sock.ev.on('creds.update', saveCreds);
            
            // Event: Mensajes (MINIMALISTA)
            this.sock.ev.on('messages.upsert', ({ messages, type }) => {
                if (type !== 'notify') return;
                
                for (const message of messages) {
                    if (message.key.fromMe) continue;
                    
                    // Extraer solo lo necesario
                    const msg = {
                        from: message.key.remoteJid,
                        body: this.extractText(message),
                        id: message.key.id,
                        timestamp: message.messageTimestamp,
                        type: 'message'
                    };
                    
                    this.emit('message', msg);
                }
            });
            
            console.log('✅ Conectado a WhatsApp');
            
        } catch (error) {
            console.error('❌ Error de conexión:', error.message);
            this.emit('error', error);
        }
    }
    
    /**
     * Extraer texto del mensaje (minimalista)
     */
    extractText(message) {
        const msg = message.message;
        
        if (!msg) return '';
        
        // Solo texto
        if (msg.conversation) return msg.conversation;
        if (msg.extendedTextMessage) return msg.extendedTextMessage.text || '';
        
        return '';
    }
    
    /**
     * Enviar mensaje
     */
    async sendMessage(to, text) {
        if (!this.sock || this.state !== 'connected') {
            throw new Error('No conectado');
        }
        
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        
        try {
            await this.sock.sendMessage(jid, { text });
            return { success: true };
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * Importar Baileys (lazy loading)
     */
    async importBaileys() {
        try {
            return await import('@whiskeysockets/baileys');
        } catch (error) {
            console.warn('⚠️ Baileys no disponible');
            return null;
        }
    }
    
    /**
     * Desconectar
     */
    async disconnect() {
        if (this.sock) {
            try {
                await this.sock.logout();
            } catch (error) {
                console.warn('⚠️ Error al desconectar:', error.message);
            }
            this.sock = null;
        }
        
        this.state = 'disconnected';
    }
}

export default BaileysAdapterLite;
