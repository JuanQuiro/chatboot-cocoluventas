/**
 * WhatsApp-Web.js HTTP Bridge
 * Bridge más popular para WhatsApp (15K+ stars GitHub)
 */

import { Client, LocalAuth } from 'whatsapp-web.js';
import express from 'express';
import cors from 'cors';
import qrcode from 'qrcode';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const sessions = new Map();

async function getOrCreateClient(sessionId) {
    if (sessions.has(sessionId)) {
        return sessions.get(sessionId);
    }

    console.log(`🌐 Creating WWebJS client: ${sessionId}`);

    const sessionData = {
        client: null,
        qr: null,
        ready: false,
        authenticated: false,
        info: null,
        messagesSent: 0,
        messagesReceived: 0,
        createdAt: new Date()
    };

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionId }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        }
    });

    client.on('qr', async (qr) => {
        try {
            sessionData.qr = await qrcode.toDataURL(qr);
            console.log(`📱 QR generated for ${sessionId}`);
        } catch (error) {
            console.error('QR generation error:', error);
        }
    });

    client.on('authenticated', () => {
        console.log(`🔐 ${sessionId} authenticated`);
        sessionData.authenticated = true;
    });

    client.on('ready', () => {
        console.log(`✅ ${sessionId} ready\!`);
        sessionData.ready = true;
        
        client.info.then(info => {
            sessionData.info = info;
            console.log(`📞 Connected as: ${info.pushname} (${info.wid.user})`);
        });
    });

    client.on('message', async (message) => {
        sessionData.messagesReceived++;
        // TODO: Webhook a Rust
        console.log(`📨 Message from ${message.from}:`, message.body.substring(0, 50));
    });

    client.on('disconnected', (reason) => {
        console.log(`❌ ${sessionId} disconnected:`, reason);
        sessionData.ready = false;
    });

    await client.initialize();

    sessionData.client = client;
    sessions.set(sessionId, sessionData);

    return sessionData;
}

/**
 * POST /send - Enviar mensaje
 */
app.post('/send', async (req, res) => {
    try {
        const { session_id, to, message } = req.body;

        if (\!session_id || \!to || \!message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const session = await getOrCreateClient(session_id);

        if (\!session.ready) {
            return res.status(503).json({
                success: false,
                error: 'Client not ready',
                qr_available: \!\!session.qr
            });
        }

        const chatId = to.includes('@') ? to : `${to}@c.us`;
        const result = await session.client.sendMessage(chatId, message);

        session.messagesSent++;

        res.json({
            success: true,
            message_id: result.id.id,
            timestamp: result.timestamp
        });

    } catch (error) {
        console.error('❌ Send error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /send-media - Enviar media
 */
app.post('/send-media', async (req, res) => {
    try {
        const { session_id, to, media_url, caption, filename } = req.body;

        const session = await getOrCreateClient(session_id);

        if (\!session.ready) {
            return res.status(503).json({
                success: false,
                error: 'Client not ready'
            });
        }

        const { MessageMedia } = await import('whatsapp-web.js');
        const media = await MessageMedia.fromUrl(media_url);

        const chatId = to.includes('@') ? to : `${to}@c.us`;
        const result = await session.client.sendMessage(chatId, media, {
            caption: caption || '',
            filename: filename
        });

        session.messagesSent++;

        res.json({
            success: true,
            message_id: result.id.id
        });

    } catch (error) {
        console.error('❌ Send media error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /qr/:session_id - Obtener QR
 */
app.get('/qr/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;
        const session = await getOrCreateClient(session_id);

        res.json({
            qr_code: session.qr,
            ready: session.ready,
            authenticated: session.authenticated
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /status/:session_id - Estado
 */
app.get('/status/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;

        if (\!sessions.has(session_id)) {
            return res.json({
                exists: false,
                ready: false
            });
        }

        const session = sessions.get(session_id);
        const state = await session.client.getState();

        res.json({
            exists: true,
            ready: session.ready,
            authenticated: session.authenticated,
            state: state,
            info: session.info,
            messages_sent: session.messagesSent,
            messages_received: session.messagesReceived,
            uptime: Date.now() - session.createdAt.getTime()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /session/:session_id - Cerrar
 */
app.delete('/session/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;

        if (\!sessions.has(session_id)) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        const session = sessions.get(session_id);
        await session.client.destroy();
        sessions.delete(session_id);

        res.json({
            success: true,
            message: `Session ${session_id} destroyed`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /sessions - Listar sesiones
 */
app.get('/sessions', (req, res) => {
    const sessionsList = Array.from(sessions.entries()).map(([id, data]) => ({
        id,
        ready: data.ready,
        authenticated: data.authenticated,
        phone: data.info?.wid?.user,
        messages_sent: data.messagesSent,
        messages_received: data.messagesReceived
    }));

    res.json({
        total: sessions.size,
        sessions: sessionsList
    });
});

/**
 * GET /health
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'wwebjs-bridge',
        version: '1.0.0',
        active_sessions: sessions.size,
        memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        uptime: process.uptime()
    });
});

const PORT = process.env.PORT || 3014;

app.listen(PORT, () => {
    console.log(`🌐 WWebJS HTTP Bridge running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received, destroying clients...');
    for (const [id, session] of sessions.entries()) {
        await session.client.destroy().catch(() => {});
    }
    process.exit(0);
});
