#!/usr/bin/env node

/**
 * src-performance: Bot Ultra-Optimizado
 * 
 * Consumo: 40-60MB
 * Startup: 1-2s
 * CPU: 3-5% idle
 * 
 * Uso:
 * $ NODE_OPTIONS="--max-old-space-size=256" node src-performance/index.js
 */

import BotMinimal from './bot-minimal.js';
import { createServer } from 'http';
import { parse } from 'url';

// Configuración
const PORT = process.env.PORT || 3008;
const API_PORT = process.env.API_PORT || 3009;
const PHONE_NUMBER = process.env.PHONE_NUMBER || '+584244370180';
const USE_PAIRING_CODE = process.env.USE_PAIRING_CODE !== 'false';

// Variables globales
let bot = null;
let qrCode = null;

/**
 * Iniciar bot
 */
async function startBot() {
    console.log('');
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║                                                    ║');
    console.log('║        🚀 BOT ULTRA-OPTIMIZADO - PERFORMANCE       ║');
    console.log('║                                                    ║');
    console.log('║        Consumo: 40-60MB | Startup: 1-2s           ║');
    console.log('║                                                    ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('');
    
    try {
        // Crear bot minimalista
        bot = new BotMinimal({
            phoneNumber: PHONE_NUMBER,
            usePairingCode: USE_PAIRING_CODE,
            maxMemory: 60 * 1024 * 1024, // 60MB
            messagePoolSize: 100,
            cacheSize: 50
        });
        
        // Listeners
        bot.on('ready', () => {
            console.log('✅ Bot conectado y listo');
            qrCode = null;
        });
        
        bot.on('qr', (qr) => {
            qrCode = qr;
            console.log('📱 QR Code generado - Escanea con WhatsApp');
        });
        
        bot.on('error', (error) => {
            console.error('❌ Error:', error.message);
        });
        
        bot.on('disconnected', () => {
            console.log('⚠️ Desconectado');
        });
        
        // Listeners de mensajes
        bot.on('message', (message) => {
            console.log(`📨 Mensaje de ${message.from}: ${message.body}`);
            
            // Echo simple para testing
            if (message.body === 'hola') {
                bot.sendMessage(message.from, '¡Hola! Soy un bot ultra-optimizado 🚀');
            }
        });
        
        // Iniciar bot
        await bot.start();
        
    } catch (error) {
        console.error('❌ Error al iniciar bot:', error);
        process.exit(1);
    }
}

/**
 * Crear servidor API minimalista
 */
function createAPIServer() {
    const server = createServer(async (req, res) => {
        const { pathname, query } = parse(req.url, true);
        
        // Headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        try {
            // Health check
            if (pathname === '/health') {
                const memory = process.memoryUsage();
                res.writeHead(200);
                res.end(JSON.stringify({
                    status: 'ok',
                    uptime: process.uptime(),
                    memory: {
                        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
                        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
                        external: Math.round(memory.external / 1024 / 1024)
                    },
                    bot: {
                        state: bot?.state || 'disconnected',
                        hasQR: !!qrCode
                    }
                }));
                return;
            }
            
            // QR Code
            if (pathname === '/qr') {
                if (qrCode) {
                    res.writeHead(200);
                    res.end(JSON.stringify({ qr: qrCode }));
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'No QR disponible' }));
                }
                return;
            }
            
            // Enviar mensaje
            if (pathname === '/send' && req.method === 'POST') {
                let body = '';
                
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                
                req.on('end', async () => {
                    try {
                        const { to, text } = JSON.parse(body);
                        await bot.sendMessage(to, text);
                        
                        res.writeHead(200);
                        res.end(JSON.stringify({ success: true }));
                    } catch (error) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: error.message }));
                    }
                });
                return;
            }
            
            // 404
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not found' }));
            
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: error.message }));
        }
    });
    
    server.listen(API_PORT, () => {
        console.log(`🌐 API en puerto ${API_PORT}`);
        console.log(`   Health: http://localhost:${API_PORT}/health`);
        console.log(`   QR: http://localhost:${API_PORT}/qr`);
        console.log(`   Send: POST http://localhost:${API_PORT}/send`);
    });
}

/**
 * Monitoreo de recursos
 */
function startResourceMonitoring() {
    setInterval(() => {
        const memory = process.memoryUsage();
        const heapUsed = Math.round(memory.heapUsed / 1024 / 1024);
        const heapTotal = Math.round(memory.heapTotal / 1024 / 1024);
        
        console.log(`📊 Memoria: ${heapUsed}MB / ${heapTotal}MB`);
        
        // Alerta si supera 80MB
        if (heapUsed > 80) {
            console.warn('⚠️ Memoria alta, limpiando...');
            if (global.gc) {
                global.gc();
            }
        }
    }, 60000); // Cada minuto
}

/**
 * Manejo de señales
 */
process.on('SIGINT', async () => {
    console.log('\n🛑 Deteniendo bot...');
    
    if (bot) {
        await bot.stop();
    }
    
    process.exit(0);
});

/**
 * Iniciar todo
 */
async function main() {
    try {
        // Iniciar bot
        await startBot();
        
        // Crear API
        createAPIServer();
        
        // Monitoreo
        startResourceMonitoring();
        
        console.log('');
        console.log('✅ Sistema completamente inicializado');
        console.log('');
        
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
}

// Iniciar
main();
