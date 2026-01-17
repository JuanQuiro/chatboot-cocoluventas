/**
 * Cocolu Ventas - App Integrado
 * Bot inicial con perfecta integraci├│n al Dashboard
 */

import 'dotenv/config';
import bcvRoutes from './src/api/bcv.routes.js';
import { createBot, createProvider, createFlow } from '@builderbot/bot';
import { JsonFileDB as Database } from '@builderbot/database-json';
import { BaileysProvider } from '@builderbot/provider-baileys';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Importar flujos de negocio
import welcomeFlow from './src/flows/welcome.flow.js';
// FLUJOS VIEJOS COMENTADOS - Causaban confusi├│n
// import menuFlow from './src/flows/menu.flow.js';
// import productsFlow from './src/flows/products.flow.js';
// import ordersFlow, { trackOrderFlow } from './src/flows/orders.flow.js';
// import supportFlow from './src/flows/support.flow.js';
// import scheduleFlow, { shippingFlow, paymentFlow } from './src/flows/schedule.flow.js';

// NUEVO: Importar flujos premium de Cocolu
import { hablarAsesorFlow } from './src/flows/hablar-asesor.flow.js';
import { catalogoFlow } from './src/flows/catalogo.flow.js';
import { infoPedidoFlow } from './src/flows/info-pedido.flow.js';
import { horariosFlow } from './src/flows/horarios.flow.js';
import { problemaFlow } from './src/flows/problema.flow.js';
import { productoKeywordFlow } from './src/flows/producto-keyword.flow.js';
import { comandosFlow } from './src/flows/comandos.flow.js';
import { registroFlow } from './src/flows/registro.flow.js';
import { debugFlow } from './src/flows/debug.flow.js';

// Importar API routes
import { setupRoutes } from './src/api/routes.js';
import { setupDashboardRoutes } from './src/api/dashboard-routes.js';

// NUEVO: Importar bot-manager y flow-manager para integraci├│n con dashboard
import botManager from './src/services/bot-manager.service.js';
import flowManager from './src/services/flow-manager.service.js';

// NUEVO: Importar servicios premium
import alertsService from './src/services/alerts.service.js';
import timerService from './src/services/timer.service.js';
import productsKeywordsService from './src/services/products-keywords.service.js';
import sellersRoutes from './src/api/sellers.routes.js';

// Configuraci├│n
const PORT = process.env.PORT || 3008;
const API_PORT = process.env.API_PORT || 3009;
const BOT_NAME = process.env.BOT_NAME || 'Bot Principal Cocolu';
const TENANT_ID = process.env.TENANT_ID || 'cocolu';
const USE_PAIRING_CODE = process.env.USE_PAIRING_CODE === 'true';
const PHONE_NUMBER = process.env.PHONE_NUMBER || '+584244370180';
const BOT_ADAPTER = (process.env.BOT_ADAPTER || 'meta').toLowerCase();

// Logger de mensajes simple en memoria, accesible desde los flujos y la API
export const messageLog = {
    received: [],
    sent: [],
    errors: [],
    maxEntries: 500,
    addReceived(from, body) {
        this.received.push({ from, body, timestamp: new Date().toISOString() });
        if (this.received.length > this.maxEntries) this.received.shift();
    },
    addSent(to, body) {
        this.sent.push({ to, body, timestamp: new Date().toISOString() });
        if (this.sent.length > this.maxEntries) this.sent.shift();
    },
    addError(context, error) {
        const errMsg = error && (error.message || (typeof error.toString === 'function' ? error.toString() : String(error)));
        this.errors.push({ context, error: errMsg, timestamp: new Date().toISOString() });
        if (this.errors.length > this.maxEntries) this.errors.shift();
    },
    getAll() {
        return {
            received: [...this.received].reverse(),
            sent: [...this.sent].reverse(),
            errors: [...this.errors].reverse(),
        };
    },
};

// ├Ültimo c├│digo de emparejamiento generado (para el dashboard)
export let pairingCode = null;

// Variable global para el bot
let mainBot = null;
let mainProvider = null;
let qrWatchdog = null;
let connUpdateAttached = false;

const main = async () => {
    try {
        console.log('');
        console.log('­ƒñû =======================================');
        console.log('­ƒñû   COCOLU VENTAS - EMBER DRAGO');
        console.log('­ƒñû   Bot Integrado con Dashboard');
        console.log(`­ƒñû   Adaptador: ${BOT_ADAPTER.toUpperCase()}`);
        console.log('­ƒñû =======================================');
        console.log('');

        // ============================================
        // 1. CREAR SERVIDOR API PRIMERO
        // Crear servidor API REST para Dashboard
        const apiApp = express();

        // ============================================
        // BANK-GRADE SECURITY MIDDLEWARE
        // ============================================

        // 1. Helmet: Security headers (XSS, clickjacking protection)
        apiApp.use(helmet({
            crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow CORS  
            contentSecurityPolicy: false, // Disable CSP for dashboard compatibility
        }));
        console.log('Ô£à Helmet security headers enabled');

        // 2. Compression: Gzip responses (70% bandwidth reduction)
        apiApp.use(compression());
        console.log('Ô£à Response compression enabled');

        // 3. Rate Limiting: DDoS and brute-force protection
        const apiLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // Limit each IP to 1000 requests per window
            standardHeaders: true,
            legacyHeaders: false,
            message: { error: 'Too many requests, please try again later.' }
        });
        apiApp.use('/api', apiLimiter);
        console.log('Ô£à Rate limiting enabled (1000 req/15min)');

        // CORS configurado correctamente para desarrollo y producci├│n
        apiApp.use(cors({
            origin: ['http://localhost:3000', 'http://localhost:3009', 'http://127.0.0.1:3000', 'http://127.0.0.1:3009', 'https://cocolu.emberdrago.com', 'https://api.emberdrago.com'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID']
        }));

        apiApp.use(express.json());

        // Configurar rutas de la API (incluye /api/bots)
        setupRoutes(apiApp);

        // Configurar rutas del Dashboard (login, dashboard, mensajes, conexi├│n, adaptadores, logs)
        setupDashboardRoutes(apiApp);

        // ============================================
        // WEBHOOK META (WhatsApp Business API)
        // ============================================
        // GET: Verificaci├│n del webhook (Meta env├¡a challenge)
        apiApp.get('/webhooks/whatsapp', (req, res) => {
            const mode = req.query['hub.mode'];
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];

            const verifyToken = process.env.META_VERIFY_TOKEN || 'cocolu_webhook_verify_2025_secure_token_meta';

            if (mode === 'subscribe' && token === verifyToken) {
                console.log('Ô£à Webhook verificado por Meta');
                res.status(200).send(challenge);
            } else {
                console.warn('ÔÜá´©Å  Verificaci├│n de webhook fallida');
                res.sendStatus(403);
            }
        });

        // POST: Recibir mensajes de Meta
        // El provider de Meta tambi├®n escucha en /webhook, pero mantenemos /webhooks/whatsapp para compatibilidad
        apiApp.post('/webhooks/whatsapp', async (req, res) => {
            try {
                const body = req.body;

                console.log('­ƒöö Webhook recibido:', JSON.stringify(body, null, 2).substring(0, 500));

                // Si el provider de Meta est├í inicializado, intentar pasar el webhook directamente al provider
                // El provider de Meta tiene su propio m├®todo para procesar webhooks
                if (mainProvider && mainProvider.vendor && typeof mainProvider.vendor.incomingMsg === 'function') {
                    console.log('­ƒöä Pasando webhook al provider de Meta para procesamiento autom├ítico...');
                    try {
                        // El provider de Meta procesa el webhook y emite eventos 'message' autom├íticamente
                        // NO registramos el mensaje aqu├¡ porque el listener del provider lo har├í
                        await mainProvider.vendor.incomingMsg(req, res);
                        console.log('Ô£à Provider de Meta proces├│ el webhook - el mensaje ser├í registrado por el listener del provider');
                        return; // El provider ya respondi├│ y procesar├í el mensaje
                    } catch (err) {
                        console.error('ÔØî Error en incomingMsg del provider:', err.message);
                        // Continuar con el procesamiento manual como fallback
                    }
                }

                // Procesamiento manual como fallback (solo si el provider no proces├│ el webhook)
                console.log('­ƒöä Procesando webhook manualmente (fallback)...');

                // Verificar que es un webhook v├ílido de Meta
                if (body.object === 'whatsapp_business_account') {
                    const entry = body.entry?.[0];
                    console.log('­ƒôÑ Entry recibida:', entry ? 'S├¡' : 'No');

                    if (entry?.changes) {
                        const change = entry.changes[0];
                        const value = change.value;
                        console.log('­ƒôª Value recibido:', value ? 'S├¡' : 'No');
                        console.log('­ƒôª Value tiene messages:', value?.messages ? `S├¡ (${value.messages.length})` : 'No');

                        // Procesar mensajes entrantes
                        if (value.messages && value.messages[0]) {
                            const message = value.messages[0];
                            const from = message.from;
                            const messageText = message.text?.body || message.type || JSON.stringify(message);

                            console.log(`­ƒô¿ =======================================`);
                            console.log(`­ƒô¿ MENSAJE RECIBIDO DE META (procesamiento manual)`);
                            console.log(`­ƒô¿ De: ${from}`);
                            console.log(`­ƒô¿ Texto: ${messageText}`);
                            console.log(`­ƒô¿ Tipo: ${message.type || 'text'}`);
                            console.log(`­ƒô¿ =======================================`);

                            // Registrar mensaje solo en el procesamiento manual (fallback)
                            messageLog.addReceived(from, messageText);
                            console.log(`Ô£à Mensaje registrado en messageLog`);

                            // Si el bot ya est├í inicializado, pasar el mensaje al bot
                            if (mainBot && mainProvider) {
                                try {
                                    // Formato correcto para BuilderBot - el bot procesa mensajes cuando el provider emite 'message'
                                    const providerMessage = {
                                        from: from,
                                        body: messageText,
                                        key: {
                                            remoteJid: from,
                                            id: message.id || `wamid.${Date.now()}`,
                                            fromMe: false
                                        },
                                        messageTimestamp: message.timestamp || Math.floor(Date.now() / 1000),
                                        pushName: value.contacts?.[0]?.profile?.name || undefined,
                                        message: {
                                            conversation: messageText
                                        }
                                    };

                                    console.log(`­ƒöä Emitiendo mensaje al provider: ${from} - ${messageText}`);
                                    console.log(`­ƒöì Formato del mensaje:`, JSON.stringify(providerMessage, null, 2).substring(0, 200));

                                    // El bot de BuilderBot procesa mensajes cuando el provider emite el evento 'message'
                                    // Emitir al provider - esto deber├¡a activar el procesamiento del flujo
                                    if (mainProvider && typeof mainProvider.emit === 'function') {
                                        console.log(`­ƒôñ Emitiendo evento 'message' al provider...`);
                                        mainProvider.emit('message', providerMessage);
                                        console.log(`Ô£à Mensaje emitido al provider`);

                                        // Verificar si el bot est├í escuchando el evento
                                        try {
                                            if (typeof mainProvider.listenerCount === 'function') {
                                                console.log(`­ƒöì Verificando listeners del provider:`, mainProvider.listenerCount('message'));
                                            } else {
                                                console.log(`­ƒöì Provider no tiene listenerCount (no es EventEmitter est├índar)`);
                                            }
                                        } catch (err) {
                                            console.log(`­ƒöì Error verificando listeners: ${err.message}`);
                                        }

                                        // Procesar el mensaje directamente a trav├®s del bot tambi├®n
                                        // El bot de BuilderBot internamente escucha el evento 'message' del provider
                                        // pero para asegurarnos, tambi├®n procesamos directamente
                                        if (mainBot) {
                                            console.log(`­ƒöä Intentando procesar mensaje directamente a trav├®s del bot...`);
                                            try {
                                                // El bot de BuilderBot tiene un m├®todo interno para procesar mensajes
                                                // Intentamos diferentes formas de procesar el mensaje
                                                if (typeof mainBot.handleMsg === 'function') {
                                                    console.log(`­ƒöä Procesando con handleMsg...`);
                                                    await mainBot.handleMsg(providerMessage);
                                                    console.log(`Ô£à Mensaje procesado con handleMsg`);
                                                } else if (typeof mainBot.dispatch === 'function') {
                                                    console.log(`­ƒöä Procesando con dispatch...`);
                                                    await mainBot.dispatch(providerMessage);
                                                    console.log(`Ô£à Mensaje procesado con dispatch`);
                                                } else if (mainBot.flow && typeof mainBot.flow.process === 'function') {
                                                    console.log(`­ƒöä Procesando con flow.process...`);
                                                    await mainBot.flow.process(providerMessage);
                                                    console.log(`Ô£à Mensaje procesado con flow.process`);
                                                } else {
                                                    // Intentar acceder al m├®todo interno del bot
                                                    console.log(`­ƒöì Buscando m├®todo interno del bot...`);
                                                    const botKeys = Object.keys(mainBot).slice(0, 15);
                                                    console.log(`   - mainBot keys (primeros 15):`, botKeys);

                                                    // El bot de BuilderBot internamente tiene un handler para mensajes
                                                    // Intentamos llamar directamente al handler interno
                                                    if (mainBot.handler && typeof mainBot.handler === 'function') {
                                                        console.log(`­ƒöä Procesando con handler...`);
                                                        await mainBot.handler(providerMessage);
                                                        console.log(`Ô£à Mensaje procesado con handler`);
                                                    } else if (mainBot.provider && mainBot.provider.emit) {
                                                        // Intentar emitir el evento directamente al provider del bot
                                                        console.log(`­ƒöä Emitiendo evento al provider del bot...`);
                                                        mainBot.provider.emit('message', providerMessage);
                                                        console.log(`Ô£à Evento emitido al provider del bot`);
                                                    } else {
                                                        console.warn(`ÔÜá´©Å  No se encontr├│ m├®todo directo para procesar mensaje`);
                                                        console.warn(`ÔÜá´©Å  El bot deber├¡a procesar autom├íticamente cuando el provider emite 'message'`);
                                                        console.warn(`ÔÜá´©Å  Verificando estructura del bot...`);
                                                        console.warn(`   - mainBot.provider: ${!!mainBot.provider}`);
                                                        console.warn(`   - mainBot.flow: ${!!mainBot.flow}`);
                                                    }
                                                }
                                            } catch (err) {
                                                console.error(`ÔØî Error procesando mensaje directamente:`, err.message);
                                                console.error(`ÔØî Stack:`, err.stack);
                                            }
                                        }
                                    } else {
                                        console.warn('ÔÜá´©Å  mainProvider.emit no est├í disponible');
                                        console.warn(`ÔÜá´©Å  mainProvider:`, typeof mainProvider);
                                        console.warn(`ÔÜá´©Å  mainProvider.emit:`, typeof mainProvider?.emit);
                                    }
                                } catch (err) {
                                    console.error('ÔØî Error procesando mensaje:', err);
                                    console.error('ÔØî Stack:', err.stack);
                                }
                            } else {
                                console.warn('ÔÜá´©Å  Bot o provider no inicializado a├║n');
                                console.warn(`   - mainBot: ${!!mainBot}`);
                                console.warn(`   - mainProvider: ${!!mainProvider}`);
                            }
                        } else {
                            console.log('Ôä╣´©Å  No hay mensajes en este webhook');
                        }

                        // Procesar estados de mensajes
                        if (value.statuses) {
                            const status = value.statuses[0];
                            console.log(`­ƒôè Estado de mensaje: ${status.status} para ${status.recipient_id}`);
                        }
                    } else {
                        console.log('ÔÜá´©Å  Entry no tiene changes');
                    }
                } else {
                    console.log(`ÔÜá´©Å  Webhook no es de tipo whatsapp_business_account. Object: ${body.object}`);
                }

                // Siempre responder 200 OK a Meta
                res.status(200).send('OK');
            } catch (error) {
                console.error('ÔØî Error procesando webhook de Meta:', error);
                console.error('ÔØî Stack:', error.stack);
                res.status(200).send('OK'); // Responder OK para evitar reintentos
            }
        });

        // Servir archivos est├íticos del dashboard como fallback (despu├®s de las rutas HTML)
        apiApp.use(express.static('dashboard/build'));

        // Iniciar servidor API
        apiApp.use('/api/bcv', bcvRoutes);
apiApp.use('/api/sellers', sellersRoutes);
const apiServer = apiApp.listen(API_PORT, () => {
            console.log(`Ô£à API REST iniciada en puerto ${API_PORT}`);
            console.log(`­ƒîÉ Dashboard: http://localhost:${API_PORT}`);
            console.log(`­ƒôè API Health: http://localhost:${API_PORT}/api/health`);
            console.log(`­ƒñû Bots API: http://localhost:${API_PORT}/api/bots`);
            console.log('');
        });

        // ============================================
        // 2. CREAR BASE DE DATOS
        // ============================================
        const adapterDB = new Database({
            filename: `${process.env.DB_PATH || './database'}/db.json`
        });

        // ============================================
        // 3. CREAR FLUJO PRINCIPAL CON TODOS LOS FLUJOS
        // ============================================
        console.log('­ƒôØ Cargando flujos de negocio...');
        const botId = 'bot_principal_cocolu'; // Declarar aqu├¡ para usar en flujos y bot manager
        const flows = [
            // SOLO Flujos PREMIUM de Cocolu - Flujos viejos ELIMINADOS
            { flow: welcomeFlow, name: 'Welcome Premium', description: 'Bienvenida con men├║ 5 opciones', category: 'core', keywords: ['hola', 'inicio', 'empezar'], priority: 100 },
            { flow: comandosFlow, name: 'Comandos', description: 'Lista de comandos disponibles', category: 'core', keywords: ['comandos', 'ayuda', 'help'], priority: 99 },
            { flow: problemaFlow, name: 'Atenci├│n Problemas', description: 'Resoluci├│n prioritaria de problemas', category: 'support', keywords: ['problema', 'queja', 'reclamo'], priority: 98 },
            { flow: registroFlow, name: 'Registro Cliente', description: 'Historial y estado del cliente', category: 'core', keywords: ['registro', 'estado', 'historial'], priority: 97 },
            { flow: debugFlow, name: 'Debug T├®cnico', description: 'Informaci├│n t├®cnica completa (Dev)', category: 'dev', keywords: ['debug', 'tecnico', 'dev'], priority: 96 },
            { flow: hablarAsesorFlow, name: 'Hablar con Asesor', description: 'Conexi├│n directa con asesor', category: 'atencion', keywords: ['asesor', 'hablar', 'atenci├│n'], priority: 95 },
            { flow: catalogoFlow, name: 'Cat├ílogo Premium', description: 'Cat├ílogo con seguimiento autom├ítico', category: 'sales', keywords: ['catalogo', 'cat├ílogo', 'productos'], priority: 90 },
            { flow: infoPedidoFlow, name: 'Info Pedido', description: 'Informaci├│n de pedidos existentes', category: 'sales', keywords: ['pedido', 'informaci├│n', 'orden'], priority: 88 },
            { flow: horariosFlow, name: 'Horarios', description: 'Horarios de atenci├│n', category: 'info', keywords: ['horario', 'horarios', 'hora'], priority: 86 },
            { flow: productoKeywordFlow, name: 'Keywords Productos', description: 'B├║squeda por palabra clave', category: 'sales', keywords: ['relicario', 'dije', 'cadena', 'pulsera', 'anillo'], priority: 85 },
        ];

        const adapterFlow = createFlow(flows.map(f => f.flow));
        console.log(`Ô£à ${flows.length} flujos PREMIUM cargados (flujos viejos eliminados)`);

        // Registrar flujos en el flowManager
        flows.forEach((flowConfig, index) => {
            const flowId = `flow_${flowConfig.name.toLowerCase().replace(/\s/g, '_')}`;
            flowManager.registerFlow(flowId, {
                name: flowConfig.name,
                description: flowConfig.description,
                category: flowConfig.category,
                keywords: flowConfig.keywords,
                priority: flowConfig.priority,
                botId: botId,
            });
        });
        console.log(`Ô£à ${flows.length} flujos PREMIUM registrados en dashboard`);
        console.log('');

        // ============================================
        // 4. CONFIGURAR PROVIDER SEG├ÜN BOT_ADAPTER
        // ============================================
        let adapterNameForManager = 'builderbot-baileys';

        if (BOT_ADAPTER === 'meta') {
            console.log('­ƒöº Configurando provider Meta (WhatsApp Business API)...');

            const metaConfig = {
                jwtToken: process.env.META_JWT_TOKEN,
                numberId: process.env.META_NUMBER_ID,
                verifyToken: process.env.META_VERIFY_TOKEN,
                version: process.env.META_API_VERSION || 'v18.0',
            };

            if (!metaConfig.jwtToken || !metaConfig.numberId || !metaConfig.verifyToken) {
                console.warn('ÔÜá´©Å  Faltan variables META_JWT_TOKEN, META_NUMBER_ID o META_VERIFY_TOKEN.');
                console.warn('ÔÜá´©Å  Verifica tu archivo .env antes de usar el adaptador Meta.');
            }

            const { MetaProvider } = await import('@builderbot/provider-meta');
            mainProvider = createProvider(MetaProvider, metaConfig);
            adapterNameForManager = 'builderbot-meta';

            console.log('­ƒôï Configuraci├│n Meta:', {
                numberId: metaConfig.numberId,
                version: metaConfig.version,
            });
        } else {
            const metodoConexion = USE_PAIRING_CODE ? 'N├ÜMERO TELEF├ôNICO' : 'QR CODE';
            console.log(`­ƒöº Configurando provider Baileys (${metodoConexion})...`);

            // Configuraci├│n optimizada para evitar errores de sesi├│n
            const providerConfig = {
                name: 'bot_principal',
                gifPlayback: false,
                headless: true,
                markOnlineOnConnect: true,
                syncFullHistory: false,
                usePairingCode: USE_PAIRING_CODE,
                phoneNumber: USE_PAIRING_CODE ? PHONE_NUMBER : undefined,
                useBaileysStore: true,
                qrTimeout: 60000, // 60 segundos para escanear QR
                authTimeout: 60000, // 60 segundos para autenticaci├│n
                restartDelay: 2000, // 2 segundos entre reintentos
                maxRetries: 3, // M├íximo 3 reintentos
                browser: ['Bot Cocolu', 'Chrome', '120.0.0']
            };

            console.log('­ƒôï Configuraci├│n Baileys:', {
                metodo: metodoConexion,
                numero: USE_PAIRING_CODE ? PHONE_NUMBER : 'N/A',
                qrTimeout: `${providerConfig.qrTimeout / 1000}s`,
                authTimeout: `${providerConfig.authTimeout / 1000}s`,
                maxRetries: providerConfig.maxRetries,
                browser: providerConfig.browser[0]
            });

            mainProvider = createProvider(BaileysProvider, providerConfig);
        }

        // ============================================
        // 5. CREAR BOT DE BUILDERBOT
        // ============================================
        console.log('­ƒñû Creando bot principal...');
        const botInstance = await createBot({
            flow: adapterFlow,
            provider: mainProvider,
            database: adapterDB,
        });

        mainBot = botInstance;

        // Verificar que el bot est├® escuchando el evento 'message' del provider
        console.log(`­ƒöì Verificando listeners del provider despu├®s de crear bot:`);
        try {
            if (typeof mainProvider.listenerCount === 'function') {
                console.log(`   - Provider listeners 'message': ${mainProvider.listenerCount('message')}`);
            } else {
                console.log(`   - Provider listeners 'message': N/A (provider no es EventEmitter est├índar)`);
            }
            if (botInstance.listenerCount && typeof botInstance.listenerCount === 'function') {
                console.log(`   - Bot listeners 'message': ${botInstance.listenerCount('message')}`);
            } else {
                console.log(`   - Bot listeners 'message': N/A`);
            }
        } catch (err) {
            console.log(`   - Error verificando listeners: ${err.message}`);
        }

        // El bot de BuilderBot deber├¡a estar escuchando autom├íticamente el evento 'message' del provider
        // Si no lo est├í, hay un problema con la configuraci├│n

        // Configurar AlertsService con el provider
        alertsService.setProvider(mainProvider);
        console.log('Ô£à AlertsService configurado con provider');

        // Iniciar servidor HTTP del bot
        botInstance.httpServer(+PORT);
        console.log(`Ô£à Bot HTTP server en puerto ${PORT}`);
        console.log('');

        // ============================================
        // 6. REGISTRAR BOT EN EL BOT-MANAGER
        // ============================================
        console.log('­ƒÄ» Registrando bot en el dashboard...');

        // Registrar el bot
        botManager.registerBot(botId, {
            name: BOT_NAME,
            adapter: adapterNameForManager,
            phoneNumber: process.env.BOT_PHONE,
            tenantId: TENANT_ID,
            autoReconnect: true, // En Meta normalmente manejas estabilidad v├¡a API externa
            isMainBot: true, // Marcarlo como bot principal
            flows: flows.map(f => f.name || 'unnamed'),
        });

        // ============================================
        // 7. CONECTAR EVENTOS DEL BOT CON BOT-MANAGER
        // ============================================
        console.log('­ƒöù Conectando eventos con bot-manager...');

        // Listener para connection.update (Baileys moderno) -> captura QR y estados
        const onConnUpdate = (update = {}) => {
            try {
                const { connection, lastDisconnect, qr } = update;
                botManager.emit('bot:connupdate', { botId, update });
                if (qr) {
                    console.log('­ƒô▒ QR recibido (connection.update)');
                    // Reiniciar watchdog
                    if (qrWatchdog) clearTimeout(qrWatchdog);
                    qrWatchdog = setTimeout(() => {
                        console.log('ÔÅ│ QR no escaneado en 90s (connection.update). Recomendaciones:');
                        console.log('   ÔÇó Cerrar todas las sesiones en el tel├®fono');
                        console.log('   ÔÇó Usar datos m├│viles (evitar WiFi/VPN)');
                        console.log('   ÔÇó Ejecuta ./clean-restart.sh si persiste');
                    }, 90_000);
                    botManager.qrCodes.set(botId, qr);
                    botManager.updateBotStatus(botId, { state: 'qr_ready' });
                    botManager.emit('bot:qr', { botId, qr });
                }
                if (connection === 'open') {
                    // El ready handler ya marca conectado; aqu├¡ solo limpiamos QR y watchdog
                    botManager.qrCodes.delete(botId);
                    if (qrWatchdog) { clearTimeout(qrWatchdog); qrWatchdog = null; }
                }
                if (connection === 'close') {
                    botManager.updateBotStatus(botId, { state: 'disconnected', lastDisconnectReason: lastDisconnect?.error?.message || 'unknown' });
                }
            } catch (e) {
                console.error('Error procesando connection.update:', e);
            }
        };

        const attachConnUpdate = () => {
            if (connUpdateAttached) return;
            // S├│lo aplica para providers tipo Baileys
            if (BOT_ADAPTER !== 'baileys') return;
            try {
                if (typeof mainProvider?.on === 'function') {
                    mainProvider.on('connection.update', onConnUpdate);
                    connUpdateAttached = true;
                }
            } catch { }
            try {
                if (!connUpdateAttached && mainProvider?.vendor?.ev?.on) {
                    mainProvider.vendor.ev.on('connection.update', onConnUpdate);
                    connUpdateAttached = true;
                }
            } catch { }
        };

        // Intentar adjuntar connection.update ahora (solo Baileys)
        attachConnUpdate();

        // Simular que el bot se "inici├│" para el manager
        setTimeout(() => {
            botManager.updateBotStatus(botId, {
                state: 'connecting',
                startedAt: new Date(),
            });
            // Reintentar adjuntar connection.update (solo Baileys)
            attachConnUpdate();
        }, 500);

        // Cuando el provider est├® listo
        mainProvider.on('ready', () => {
            console.log('');
            console.log('Ô£à ┬íBOT CONECTADO Y LISTO!');
            console.log('');

            botManager.updateBotStatus(botId, {
                state: 'connected',
                connectedAt: new Date(),
            });

            botManager.emit('bot:connected', { botId });
        });

        // Eventos espec├¡ficos de Baileys (Meta no usa QR ni pairing code)
        if (BOT_ADAPTER === 'baileys') {
            // Evento moderno del provider: require_action -> contiene QR o pairing code
            mainProvider.on('require_action', (evt) => {
                try {
                    const qr = evt?.payload?.qr;
                    const code = evt?.payload?.code;
                    console.log('ÔÜí require_action recibido', { hasQR: !!qr, hasCode: !!code });
                    if (qr) {
                        // Refrescar watchdog
                        if (qrWatchdog) clearTimeout(qrWatchdog);
                        qrWatchdog = setTimeout(() => {
                            console.log('ÔÅ│ QR no escaneado en 90s. Sugerencias: cerrar sesiones en el tel├®fono y reintentar.');
                        }, 90_000);
                        botManager.qrCodes.set(botId, qr);
                        botManager.updateBotStatus(botId, { state: 'qr_ready' });
                        botManager.emit('bot:qr', { botId, qr });
                    }
                    if (code) {
                        botManager.updateBotStatus(botId, { state: 'pairing_code', pairingCode: code });
                        pairingCode = code;
                        console.log('­ƒöó Pairing code disponible:', code);
                    }
                } catch (e) {
                    console.error('Error en require_action:', e);
                }
            });

            // Fallo de autenticaci├│n cr├¡tico
            mainProvider.on('auth_failure', (info) => {
                try {
                    console.error('ÔÜíÔÜí AUTH FAILURE ÔÜíÔÜí', info);
                    botManager.updateBotStatus(botId, { state: 'error', lastError: Array.isArray(info) ? info.join(' | ') : String(info) });
                } catch (e) {
                    console.error('Error registrando auth_failure:', e);
                }
            });
        }

        // Evento de Pairing Code (conexi├│n por n├║mero)
        mainProvider.on('code', (code) => {
            console.log('');
            console.log('­ƒöÑ =======================================');
            console.log('­ƒöó C├ôDIGO DE VINCULACI├ôN GENERADO');
            console.log('­ƒöÑ =======================================');
            console.log('');
            console.log('­ƒô▒ Tu c├│digo de vinculaci├│n es:');
            console.log('');
            console.log('     ÔòöÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòù');
            console.log(`     Ôòæ  ${code.slice(0, 4)}-${code.slice(4)}  Ôòæ`);
            console.log('     ÔòÜÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòØ');
            console.log('');
            console.log('­ƒôØ INSTRUCCIONES:');
            console.log('');
            console.log('1´©ÅÔâú  Abre WhatsApp en tu tel├®fono');
            console.log('2´©ÅÔâú  Ve a: Ajustes ÔåÆ Dispositivos vinculados');
            console.log('3´©ÅÔâú  Toca: "Vincular un dispositivo"');
            console.log('4´©ÅÔâú  Selecciona: "Vincular con n├║mero de tel├®fono"');
            console.log(`5´©ÅÔâú  Ingresa el c├│digo: ${code.slice(0, 4)}-${code.slice(4)}`);
            console.log('');
            console.log('ÔÅ░ El c├│digo expira en 60 segundos');
            console.log('­ƒöÑ =======================================');
            console.log('');

            botManager.updateBotStatus(botId, {
                state: 'pairing_code_ready',
                pairingCode: code
            });
            botManager.emit('bot:pairing_code', { botId, code });
        });

        // Evento QR con instrucciones mejoradas
        mainProvider.on('qr', (qr) => {
            console.log('');
            console.log('­ƒöÑ =======================================');
            console.log('­ƒô▒ QR CODE GENERADO - INSTRUCCIONES:');
            console.log('­ƒöÑ =======================================');
            console.log('');
            console.log('1´©ÅÔâú En tu tel├®fono: WhatsApp ÔåÆ Ajustes ÔåÆ Dispositivos vinculados');
            console.log('2´©ÅÔâú CERRAR TODAS las sesiones activas');
            console.log('3´©ÅÔâú Tocar "Vincular un dispositivo"');
            console.log('4´©ÅÔâú Escanear el QR de arriba Ô¼å´©Å');
            console.log('5´©ÅÔâú NO cerrar esta ventana hasta ver "BOT CONECTADO"');
            console.log('');
            console.log('ÔÜá´©Å  IMPORTANTE: NO abrir WhatsApp Web en navegador');
            console.log('ÔÅ░ Tienes 60 segundos para escanear');
            console.log('');

            // Watchdog: si no escanean en 90s, avisar y regenerar QR autom├íticamente
            if (qrWatchdog) {
                clearTimeout(qrWatchdog);
            }
            qrWatchdog = setTimeout(() => {
                console.log('ÔÅ│ QR no escaneado en 90s. Si sigue fallando:');
                console.log('   ÔÇó Cierra TODAS las sesiones en el tel├®fono');
                console.log('   ÔÇó Cambia a datos m├│viles (evitar WiFi/VPN)');
                console.log('   ÔÇó Reabre WhatsApp y vuelve a intentar');
                console.log('   ÔÇó Ejecuta ./clean-restart.sh para limpieza completa');
            }, 90_000);

            botManager.qrCodes.set(botId, qr);
            botManager.updateBotStatus(botId, {
                state: 'qr_ready',
            });
            botManager.emit('bot:qr', { botId, qr });
        });

        // Mensajes recibidos
        mainProvider.on('message', async (message) => {
            console.log(`­ƒöö EVENTO 'message' RECIBIDO DEL PROVIDER:`, JSON.stringify(message, null, 2).substring(0, 300));

            // Registrar mensaje en messageLog (solo si no fue registrado ya por el webhook handler)
            try {
                const from = message.from || message.key?.remoteJid || message.remoteJid || 'unknown';
                const body = message.body || message.message?.conversation || message.message?.extendedTextMessage?.text || message.text?.body || '';
                if (body && from !== 'unknown') {
                    // Verificar si el mensaje ya fue registrado (evitar duplicados)
                    const messageId = message.key?.id || message.id || `${from}_${body}_${Date.now()}`;
                    const recentMessages = messageLog.received.slice(-10); // ├Ültimos 10 mensajes
                    const alreadyRegistered = recentMessages.some(m =>
                        m.from === from &&
                        m.body === body &&
                        (new Date() - new Date(m.timestamp)) < 2000 // Dentro de 2 segundos
                    );

                    if (!alreadyRegistered) {
                        messageLog.addReceived(from, body);
                        console.log(`­ƒô¿ Mensaje registrado desde provider: ${from} - ${body.substring(0, 50)}${body.length > 50 ? '...' : ''}`);
                    } else {
                        console.log(`Ôä╣´©Å  Mensaje ya registrado, omitiendo duplicado: ${from} - ${body.substring(0, 50)}`);
                    }
                }
            } catch (err) {
                console.error('Error registrando mensaje desde provider:', err);
            }

            const status = botManager.botStatus.get(botId);
            if (status) {
                botManager.updateBotStatus(botId, {
                    lastActivity: new Date(),
                    messagesReceived: (status.messagesReceived || 0) + 1,
                });
            }
            botManager.emit('bot:message', { botId, message });

            // El bot de BuilderBot deber├¡a procesar autom├íticamente el mensaje cuando el provider emite 'message'
            // pero verificamos que el bot est├® procesando el flujo
            console.log(`­ƒöä Bot deber├¡a procesar mensaje: ${message.from || 'unknown'} - ${message.body || message.message?.conversation || 'sin texto'}`);
            console.log(`­ƒöì Verificando si el bot tiene m├®todos de procesamiento...`);
            console.log(`   - mainBot existe: ${!!mainBot}`);
            console.log(`   - mainBot.handleMessage: ${mainBot && typeof mainBot.handleMessage === 'function' ? 'S├¡' : 'No'}`);
            console.log(`   - mainBot.processMessage: ${mainBot && typeof mainBot.processMessage === 'function' ? 'S├¡' : 'No'}`);
            console.log(`   - mainBot.flow: ${mainBot && mainBot.flow ? 'S├¡' : 'No'}`);
            console.log(`   - mainBot.handleMsg: ${mainBot && typeof mainBot.handleMsg === 'function' ? 'S├¡' : 'No'}`);
            console.log(`   - mainBot.dispatch: ${mainBot && typeof mainBot.dispatch === 'function' ? 'S├¡' : 'No'}`);

            // BuilderBot procesa autom├íticamente cuando el provider emite 'message'
            // PERO parece que no est├í funcionando, as├¡ que intentamos procesar directamente
            if (mainBot) {
                console.log(`Ô£à Bot est├í inicializado`);

                // Intentar procesar el mensaje directamente a trav├®s del bot
                // El bot de BuilderBot internamente tiene un m├®todo para procesar mensajes
                try {
                    // Verificar si el bot tiene un m├®todo para procesar mensajes
                    if (typeof mainBot.handleMsg === 'function') {
                        console.log(`­ƒöä Procesando mensaje con handleMsg...`);
                        await mainBot.handleMsg(message);
                        console.log(`Ô£à Mensaje procesado con handleMsg`);
                    } else if (typeof mainBot.dispatch === 'function') {
                        console.log(`­ƒöä Procesando mensaje con dispatch...`);
                        await mainBot.dispatch(message);
                        console.log(`Ô£à Mensaje procesado con dispatch`);
                    } else if (mainBot.flow && typeof mainBot.flow.process === 'function') {
                        console.log(`­ƒöä Procesando mensaje con flow.process...`);
                        await mainBot.flow.process(message);
                        console.log(`Ô£à Mensaje procesado con flow.process`);
                    } else {
                        console.warn(`ÔÜá´©Å  No se encontr├│ m├®todo directo para procesar mensaje`);
                        console.warn(`ÔÜá´©Å  El bot deber├¡a procesar autom├íticamente cuando el provider emite 'message'`);
                        console.warn(`ÔÜá´©Å  Verificando si el bot est├í escuchando el evento...`);
                        console.warn(`   - Provider listeners 'message': ${mainProvider.listenerCount('message')}`);
                    }
                } catch (err) {
                    console.error(`ÔØî Error procesando mensaje directamente:`, err.message);
                    console.error(`ÔØî Stack:`, err.stack);
                }
            } else {
                console.warn(`ÔÜá´©Å  Bot no est├í inicializado a├║n`);
            }
        });

        // Manejo robusto de errores y reconexi├│n
        mainProvider.on('error', (error) => {
            const errMsg = (error && (error.message || error.reason || (error.toString && error.toString()))) || 'unknown';
            const errorStack = error?.stack || '';
            const errorCode = error?.code || '';
            const errorConfig = error?.config || {};
            const errorUrl = errorConfig?.url || '';

            // Filtrar errores no cr├¡ticos de conexi├│n durante la inicializaci├│n
            // Estos errores ocurren cuando Meta intenta obtener el perfil y la conexi├│n se resetea
            // No son cr├¡ticos y no deber├¡an detener el servidor
            const isNonCriticalConnectionError = (
                (errorCode === 'ECONNRESET' || errMsg.includes('ECONNRESET')) &&
                (errorStack.includes('getProfile') ||
                    errorStack.includes('afterHttpServerInit') ||
                    errorUrl.includes('graph.facebook.com'))
            );

            if (isNonCriticalConnectionError) {
                // Solo registrar de forma silenciosa, no cambiar el estado del bot
                console.warn(`ÔÜá´©Å  Error de conexi├│n no cr├¡tico durante inicializaci├│n (se ignorar├í): ${errMsg.substring(0, 100)}`);
                console.warn(`   Esto es normal si hay problemas temporales de red con la API de Facebook`);
                console.warn(`   El bot continuar├í funcionando normalmente`);
                return; // No procesar este error como cr├¡tico
            }

            // Para otros errores, mostrar informaci├│n completa
            console.error('');
            console.error('­ƒö┤ =======================================');
            console.error('ÔØî ERROR DE CONEXI├ôN DETECTADO');
            console.error('­ƒö┤ =======================================');
            console.error('Error:', errMsg);

            // Solo mostrar detalles si no es un error de conexi├│n repetitivo
            if (!errMsg.includes('ECONNRESET') && !errMsg.includes('ETIMEDOUT')) {
                if (error && typeof error === 'object') {
                    try {
                        const errorSummary = {
                            message: error.message,
                            code: error.code,
                            syscall: error.syscall,
                            url: errorConfig?.url
                        };
                        console.error('Detalle:', JSON.stringify(errorSummary, null, 2));
                    } catch { }
                }
            }

            // Errores comunes y soluciones
            if (error.message && error.message.includes('QR')) {
                console.error('');
                console.error('­ƒöº SOLUCI├ôN: Problema con QR');
                console.error('1. Cierra TODAS las sesiones de WhatsApp Web');
                console.error('2. Espera 30 segundos');
                console.error('3. Reinicia el bot');
            } else if (error.message && (error.message.includes('session') || error.message.includes('auth'))) {
                console.error('');
                console.error('­ƒöº SOLUCI├ôN: Problema de sesi├│n');
                console.error('1. Elimina carpetas de sesi├│n');
                console.error('2. Reinicia el bot');
                console.error('3. Escanea nuevo QR');
            } else if (error.message && error.message.includes('timeout')) {
                console.error('');
                console.error('­ƒöº SOLUCI├ôN: Timeout de conexi├│n');
                console.error('1. Verifica tu conexi├│n a internet');
                console.error('2. Reinicia el bot');
            }

            console.error('­ƒö┤ =======================================');
            console.error('');

            // Registrar error en el messageLog para verlo en el dashboard (solo errores cr├¡ticos)
            try {
                messageLog.addError('provider_error', error);
            } catch { }

            const status = botManager.botStatus.get(botId);
            if (status) {
                // Solo cambiar el estado a 'error' si no es un error no cr├¡tico
                if (!isNonCriticalConnectionError) {
                    botManager.updateBotStatus(botId, {
                        errors: (status.errors || 0) + 1,
                        lastError: error.message,
                        state: 'error'
                    });
                }
            }

            // Solo emitir evento de error si es cr├¡tico
            if (!isNonCriticalConnectionError) {
                botManager.emit('bot:error', { botId, error: error.message });
            }
        });

        // Evento de desconexi├│n
        mainProvider.on('close', (reason) => {
            console.log('');
            console.log('ÔÜá´©Å  CONEXI├ôN CERRADA:', reason);
            console.log('­ƒöä El bot intentar├í reconectarse autom├íticamente...');
            console.log('');

            botManager.updateBotStatus(botId, {
                state: 'disconnected',
                disconnectedAt: new Date(),
                lastDisconnectReason: reason
            });
        });

        // Evento de reconexi├│n
        mainProvider.on('connecting', () => {
            console.log('­ƒöä Reconectando...');
            botManager.updateBotStatus(botId, {
                state: 'connecting',
                reconnectingAt: new Date()
            });
        });

        // Guardar referencia del bot en el manager
        botManager.bots.set(botId, {
            instance: mainBot,
            provider: mainProvider,
            sendMessage: async (to, text, options = {}) => {
                await mainProvider.sendMessage(to, text, options);
                try {
                    messageLog.addSent(to, text);

                    // Registrar mensaje en el servicio de facturaci├│n de Meta (solo si es adaptador Meta)
                    if (BOT_ADAPTER === 'meta') {
                        try {
                            const metaBillingService = (await import('./src/services/meta-billing.service.js')).default;
                            // Determinar tipo de mensaje
                            const messageType = options?.type || (typeof text === 'object' ? text.type || 'text' : 'text');
                            const isTemplate = options?.isTemplate || false;
                            const isService = options?.isService || false;

                            metaBillingService.recordMessage(to, messageType, isTemplate, isService);
                        } catch (err) {
                            // No fallar si el servicio de facturaci├│n no est├í disponible
                            console.warn('No se pudo registrar mensaje en facturaci├│n:', err.message);
                        }
                    }
                } catch { }
                const status = botManager.botStatus.get(botId);
                if (status) {
                    botManager.updateBotStatus(botId, {
                        messagesSent: (status.messagesSent || 0) + 1,
                    });
                }
            },
            stop: async () => {
                if (mainProvider.vendor && mainProvider.vendor.close) {
                    await mainProvider.vendor.close();
                }
                botManager.updateBotStatus(botId, {
                    state: 'stopped',
                    stoppedAt: new Date(),
                });
            },
        });

        console.log(`Ô£à Bot registrado en dashboard con ID: ${botId}`);
        console.log('');

        // ============================================
        // 8. INFORMACI├ôN FINAL
        // ============================================
        console.log('­ƒñû =======================================');
        console.log('­ƒñû   SISTEMA COMPLETAMENTE INICIALIZADO');
        console.log('­ƒñû =======================================');
        console.log(`­ƒñû Bot Principal: ${BOT_NAME}`);
        console.log(`­ƒñû Tenant: ${TENANT_ID}`);
        console.log(`­ƒñû Puerto Bot: ${PORT}`);
        console.log(`­ƒîÉ Puerto API: ${API_PORT}`);
        console.log(`­ƒñû Flujos activos: ${flows.length}`);
        console.log('­ƒñû =======================================');
        console.log('­ƒô▒ Escanea el c├│digo QR con WhatsApp');
        console.log(`­ƒîÉ Dashboard: http://localhost:${API_PORT}`);
        console.log(`­ƒÄø´©Å Control de Bots: http://localhost:${API_PORT}/bots`);
        console.log('­ƒñû =======================================');
        console.log('Ô£¿ El bot ahora es controlable desde el dashboard');
        console.log('­ƒñû =======================================');
        console.log('');

    } catch (error) {
        console.error('ÔØî Error al iniciar el sistema:', error);
        process.exit(1);
    }
};

// Manejo de se├▒ales para shutdown graceful
process.on('SIGINT', async () => {
    console.log('');
    console.log('­ƒøæ Deteniendo sistema...');

    try {
        // Detener todos los bots registrados
        await botManager.stopAll();
        console.log('Ô£à Bots detenidos');

        console.log('­ƒæï Sistema detenido correctamente');
        process.exit(0);
    } catch (error) {
        console.error('ÔØî Error al detener:', error);
        process.exit(1);
    }
});

// Manejar SIGTERM (producci├│n/PM2)
process.on('SIGTERM', async () => {
    console.log('');
    console.log('­ƒøæ Deteniendo sistema (SIGTERM)...');
    try {
        await botManager.stopAll();
        console.log('Ô£à Bots detenidos');
        process.exit(0);
    } catch (error) {
        console.error('ÔØî Error al detener (SIGTERM):', error);
        process.exit(1);
    }
});

// Capturar errores no controlados para evitar estados inconsistentes
process.on('unhandledRejection', (reason) => {
    const errorMsg = reason?.message || String(reason);
    const errorStack = reason?.stack || '';
    const errorCode = reason?.code || '';

    // Filtrar errores no cr├¡ticos de conexi├│n durante la inicializaci├│n
    const isNonCriticalConnectionError = (
        (errorCode === 'ECONNRESET' || errorMsg.includes('ECONNRESET')) &&
        (errorStack.includes('getProfile') ||
            errorStack.includes('afterHttpServerInit') ||
            errorStack.includes('graph.facebook.com'))
    );

    if (isNonCriticalConnectionError) {
        // Solo registrar de forma silenciosa
        console.warn(`ÔÜá´©Å  Promesa rechazada no cr├¡tica (se ignorar├í): ${errorMsg.substring(0, 100)}`);
        console.warn(`   Error de conexi├│n durante inicializaci├│n - el bot continuar├í funcionando`);
        return;
    }

    // Para otros errores, mostrar informaci├│n completa
    console.error('­ƒö┤ Unhandled Rejection:', reason);
    if (reason && typeof reason === 'object') {
        try {
            console.error('Detalle:', {
                message: reason.message,
                code: reason.code,
                stack: reason.stack?.substring(0, 500)
            });
        } catch { }
    }
});
process.on('uncaughtException', (err) => {
    console.error('­ƒö┤ Uncaught Exception:', err);
    // Las excepciones no capturadas son siempre cr├¡ticas
    console.error('Stack:', err.stack);
});

// Iniciar aplicaci├│n
main();

