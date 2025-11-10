/**
 * Venom-bot HTTP Bridge
 * Expone funcionalidades de Venom-bot via HTTP para consumo desde Rust
 */

import venom from 'venom-bot';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Store de sesiones activas
const sessions = new Map();

/**
 * Crear o recuperar sesión de Venom
 */
async function getOrCreateSession(sessionName) {
    if (sessions.has(sessionName)) {
        return sessions.get(sessionName);
    }

    console.log(`🕷️ Creating new Venom session: ${sessionName}`);

    let qrCode = null;
    let isReady = false;

    const client = await venom.create(
        sessionName,
        (base64Qr) => {
            qrCode = base64Qr;
            console.log(`📱 QR Code generated for ${sessionName}`);
        },
        (statusSession) => {
            console.log(`📊 Status ${sessionName}:`, statusSession);
            if (statusSession === 'isLogged' || statusSession === 'qrReadSuccess') {
                isReady = true;
            }
        },
        {
            headless: true,
            useChrome: true,
            autoClose: 60000,
            logQR: false,
            disableWelcome: true,
            updatesLog: false,
            browserArgs: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        }
    );

    // Eventos
    client.onMessage(async (message) => {
        // TODO: Webhook a Rust
        console.log('📨 New message:', message.from, message.body);
    });

    client.onStateChange((state) => {
        console.log('🔄 State changed:', state);
    });

    const sessionData = {
        client,
        qrCode,
        isReady,
        createdAt: new Date(),
        messagesSent: 0,
        messagesReceived: 0
    };

    sessions.set(sessionName, sessionData);
    return sessionData;
}

/**
 * POST /send - Enviar mensaje de texto
 */
app.post('/send', async (req, res) => {
    try {
        const { session_name, to, message, options = {} } = req.body;

        if (\!session_name || \!to || \!message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: session_name, to, message'
            });
        }

        const session = await getOrCreateSession(session_name);

        if (\!session.isReady) {
            return res.status(503).json({
                success: false,
                error: 'Session not ready. Scan QR code first.',
                qr_available: \!\!session.qrCode
            });
        }

        const chatId = to.includes('@') ? to : `${to}@c.us`;
        const result = await session.client.sendText(chatId, message);

        session.messagesSent++;

        res.json({
            success: true,
            message_id: result.id || result,
            timestamp: new Date().toISOString()
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
 * POST /send-media - Enviar imagen, video, documento
 */
app.post('/send-media', async (req, res) => {
    try {
        const { session_name, to, media_url, media_type, caption = '', filename } = req.body;

        const session = await getOrCreateSession(session_name);

        if (\!session.isReady) {
            return res.status(503).json({
                success: false,
                error: 'Session not ready'
            });
        }

        const chatId = to.includes('@') ? to : `${to}@c.us`;
        let result;

        switch (media_type) {
            case 'image':
                result = await session.client.sendImage(chatId, media_url, filename || 'image', caption);
                break;
            case 'video':
                result = await session.client.sendVideoAsGif(chatId, media_url, filename || 'video', caption);
                break;
            case 'document':
            case 'file':
                result = await session.client.sendFile(chatId, media_url, filename || 'document', caption);
                break;
            case 'audio':
                result = await session.client.sendVoice(chatId, media_url);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid media_type. Use: image, video, document, audio'
                });
        }

        session.messagesSent++;

        res.json({
            success: true,
            message_id: result.id || result,
            media_type
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
 * GET /qr/:session_name - Obtener QR Code
 */
app.get('/qr/:session_name', async (req, res) => {
    try {
        const { session_name } = req.params;
        const session = await getOrCreateSession(session_name);

        res.json({
            qr_code: session.qrCode,
            is_ready: session.isReady,
            session_name
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /status/:session_name - Estado de conexión
 */
app.get('/status/:session_name', async (req, res) => {
    try {
        const { session_name } = req.params;

        if (\!sessions.has(session_name)) {
            return res.json({
                exists: false,
                connected: false
            });
        }

        const session = sessions.get(session_name);
        const state = await session.client.getConnectionState();

        res.json({
            exists: true,
            connected: session.isReady,
            state: state,
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
 * DELETE /session/:session_name - Cerrar sesión
 */
app.delete('/session/:session_name', async (req, res) => {
    try {
        const { session_name } = req.params;

        if (\!sessions.has(session_name)) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        const session = sessions.get(session_name);
        await session.client.close();
        sessions.delete(session_name);

        res.json({
            success: true,
            message: `Session ${session_name} closed`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /sessions - Listar todas las sesiones
 */
app.get('/sessions', (req, res) => {
    const sessionsList = Array.from(sessions.entries()).map(([name, data]) => ({
        name,
        is_ready: data.isReady,
        messages_sent: data.messagesSent,
        messages_received: data.messagesReceived,
        created_at: data.createdAt
    }));

    res.json({
        total: sessions.size,
        sessions: sessionsList
    });
});

/**
 * GET /health - Health check
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'venom-bridge',
        version: '1.0.0',
        active_sessions: sessions.size,
        memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        uptime: process.uptime()
    });
});

// Limpiar sesiones inactivas cada 30 minutos
setInterval(() => {
    const now = Date.now();
    for (const [name, session] of sessions.entries()) {
        const inactive = now - session.createdAt.getTime() > 3600000; // 1 hora
        if (inactive && \!session.isReady) {
            console.log(`🧹 Cleaning inactive session: ${name}`);
            session.client.close().catch(() => {});
            sessions.delete(name);
        }
    }
}, 1800000);

const PORT = process.env.PORT || 3013;

app.listen(PORT, () => {
    console.log(`🕷️ Venom HTTP Bridge running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📱 Memory limit: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing sessions...');
    for (const [name, session] of sessions.entries()) {
        await session.client.close().catch(() => {});
    }
    process.exit(0);
});
