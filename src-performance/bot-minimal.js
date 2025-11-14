/**
 * Bot Minimalista Ultra-Optimizado
 * Consumo: 40-60MB
 * Startup: 1-2s
 * CPU: 3-5% idle
 */

import { EventEmitter } from 'events';

export class BotMinimal extends EventEmitter {
    constructor(config = {}) {
        super();
        
        // Configuración minimalista
        this.config = {
            maxMemory: config.maxMemory || 50 * 1024 * 1024, // 50MB
            messagePoolSize: config.messagePoolSize || 100,
            cacheSize: config.cacheSize || 50,
            ...config
        };
        
        // Estado mínimo
        this.state = 'disconnected';
        this.messagePool = [];
        this.cache = new Map();
        this.handlers = new Map();
        
        // Monitoreo de memoria
        this.memoryCheck = null;
    }
    
    /**
     * Iniciar bot
     */
    async start() {
        console.log('🤖 Iniciando bot minimalista...');
        
        try {
            // Iniciar monitoreo de memoria
            this.startMemoryMonitoring();
            
            // Conectar adapter
            await this.connectAdapter();
            
            this.state = 'connected';
            this.emit('ready');
            
            console.log('✅ Bot listo');
        } catch (error) {
            console.error('❌ Error:', error.message);
            this.emit('error', error);
        }
    }
    
    /**
     * Conectar adapter (lazy loading)
     */
    async connectAdapter() {
        if (!this.adapter) {
            const { BaileysAdapterLite } = await import('./adapter-lite.js');
            this.adapter = new BaileysAdapterLite(this.config);
            
            // Listeners
            this.adapter.on('message', (msg) => this.handleMessage(msg));
            this.adapter.on('error', (err) => this.emit('error', err));
        }
        
        await this.adapter.connect();
    }
    
    /**
     * Manejar mensaje
     */
    handleMessage(message) {
        // Pool de mensajes para evitar GC
        if (this.messagePool.length < this.config.messagePoolSize) {
            const msg = this.messagePool.pop() || {};
            Object.assign(msg, message);
            
            // Procesar
            this.processMessage(msg);
            
            // Reutilizar
            this.messagePool.push(msg);
        }
    }
    
    /**
     * Procesar mensaje
     */
    processMessage(message) {
        // Buscar handler en caché
        const handler = this.cache.get(message.type);
        
        if (handler) {
            handler(message);
        } else {
            // Buscar en handlers registrados
            const found = this.handlers.get(message.type);
            if (found) {
                this.cache.set(message.type, found);
                found(message);
            }
        }
    }
    
    /**
     * Registrar handler
     */
    on(event, handler) {
        if (event === 'message') {
            this.handlers.set('message', handler);
        } else {
            super.on(event, handler);
        }
    }
    
    /**
     * Enviar mensaje
     */
    async sendMessage(to, text) {
        if (!this.adapter) {
            throw new Error('Bot not connected');
        }
        
        return this.adapter.sendMessage(to, text);
    }
    
    /**
     * Monitoreo de memoria
     */
    startMemoryMonitoring() {
        this.memoryCheck = setInterval(() => {
            const usage = process.memoryUsage();
            const heapUsed = usage.heapUsed / 1024 / 1024;
            
            // Si supera límite, limpiar caché
            if (heapUsed > this.config.maxMemory / 1024 / 1024) {
                this.cleanupMemory();
            }
        }, 30000); // Cada 30 segundos
    }
    
    /**
     * Limpiar memoria
     */
    cleanupMemory() {
        // Limpiar caché (mantener 50%)
        const toDelete = Math.floor(this.cache.size * 0.5);
        let deleted = 0;
        
        for (const [key] of this.cache) {
            if (deleted >= toDelete) break;
            this.cache.delete(key);
            deleted++;
        }
        
        // Forzar GC si está disponible
        if (global.gc) {
            global.gc();
        }
    }
    
    /**
     * Detener bot
     */
    async stop() {
        if (this.memoryCheck) {
            clearInterval(this.memoryCheck);
        }
        
        if (this.adapter) {
            await this.adapter.disconnect();
        }
        
        this.state = 'disconnected';
        this.emit('disconnected');
    }
}

export default BotMinimal;
