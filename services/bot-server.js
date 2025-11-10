/**
 * Bot Server - Solo manejo de WhatsApp
 * Separado del API para independencia
 */

import { createBot, createProvider, createFlow } from '@builderbot/bot';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import mongoose from 'mongoose';
import Redis from 'ioredis';

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    lazyConnect: true
});

// MongoDB solo para bot data
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dashoffice', {
    maxPoolSize: 3, // Pool muy pequeño
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
});

// Cargar flows
const welcomeFlow = createFlow([]);
const menuFlow = createFlow([]);
const productsFlow = createFlow([]);
const ordersFlow = createFlow([]);
const supportFlow = createFlow([]);

// Provider con configuración optimizada
const provider = createProvider(Provider, {
    name: 'bot_cocolu',
    timeRelease: 60000, // Release memory cada minuto
    // Deshabilitar features no necesarias
    printQRInTerminal: false,
    usePairingCode: false,
});

// Bot ligero
const bot = await createBot({
    flow: createFlow([
        welcomeFlow,
        menuFlow,
        productsFlow,
        ordersFlow,
        supportFlow
    ]),
    provider,
    database: null // Sin database de BuilderBot (usamos MongoDB directo)
});

// HTTP server para QR
import express from 'express';
const app = express();

app.get('/', (req, res) => {
    const qr = provider.qr || 'Conectando...';
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>WhatsApp Bot - QR</title>
            <meta http-equiv="refresh" content="30">
            <style>
                body { 
                    margin: 0; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 100vh; 
                    background: #0a0e27;
                    font-family: system-ui;
                }
                .container {
                    text-align: center;
                    background: white;
                    padding: 2rem;
                    border-radius: 1rem;
                }
                #qr { 
                    margin: 1rem 0;
                    max-width: 400px;
                }
                h1 { color: #667eea; margin: 0 0 1rem 0; }
                p { color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📱 Escanea el QR</h1>
                <img id="qr" src="${qr}" alt="QR Code" />
                <p>Refresca en 30 segundos si no aparece</p>
            </div>
        </body>
        </html>
    `);
});

app.get('/health', (req, res) => {
    res.json({ 
        status: provider.vendor ? 'connected' : 'waiting',
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
    });
});

const BOT_PORT = process.env.BOT_PORT || 3008;
app.listen(BOT_PORT, () => {
    console.log(`🤖 Bot Server running on port ${BOT_PORT}`);
    console.log(`📊 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
});

// Limpiar memoria periódicamente
setInterval(() => {
    if (global.gc) {
        global.gc();
        console.log(`🧹 GC: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    }
}, 300000); // Cada 5 minutos

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing bot...');
    await provider.vendor?.close();
    await mongoose.connection.close();
    await redis.quit();
    process.exit(0);
});
