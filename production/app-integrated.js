/**
 * Cocolu Ventas - App Integrado
 * Bot inicial con perfecta integración al Dashboard
 */

import 'dotenv/config';
import { createBot, createProvider, createFlow } from '@builderbot/bot';
import { JsonFileDB as Database } from '@builderbot/database-json';
import { BaileysProvider } from '@builderbot/provider-baileys';
import express from 'express';
import cors from 'cors';

// Importar flujos de negocio
import welcomeFlow from './src/flows/welcome.flow.js';
// FLUJOS VIEJOS COMENTADOS - Causaban confusión
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
import { setupSettingsRoutes } from './src/api/settings.routes.js';

// NUEVO: Importar bot-manager y flow-manager para integración con dashboard
import botManager from './src/services/bot-manager.service.js';
import flowManager from './src/services/flow-manager.service.js';

// NUEVO: Importar servicios premium
import alertsService from './src/services/alerts.service.js';
import timerService from './src/services/timer.service.js';
import productsKeywordsService from './src/services/products-keywords.service.js';

// Configuración
// IMPORTANTE: El bot (MetaProvider) levanta su propio servidor HTTP en PORT
// El API REST usa el mismo servidor del bot, por lo que API_PORT = PORT
const PORT = process.env.PORT || 3008;
const API_PORT = PORT; // El API usa el mismo puerto que el bot
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

// Último código de emparejamiento generado (para el dashboard)
export let pairingCode = null;

// Variable global para el bot
let mainBot = null;
let mainProvider = null;
let qrWatchdog = null;
let connUpdateAttached = false;

const main = async () => {
    try {
        console.log('');
        console.log('🤖 =======================================');
        console.log('🤖   COCOLU VENTAS - EMBER DRAGO');
        console.log('🤖   Bot Integrado con Dashboard');
        console.log(`🤖   Adaptador: ${BOT_ADAPTER.toUpperCase()}`);
        console.log('🤖 =======================================');
        console.log('');

        // ============================================
        // 1. CREAR SERVIDOR API PRIMERO
        // Crear servidor API REST para Dashboard
        const apiApp = express();
        
        // CORS configurado correctamente para desarrollo y producción
        apiApp.use(cors({
            origin: ['http://localhost:3000', 'http://localhost:3009', 'http://127.0.0.1:3000', 'http://127.0.0.1:3009'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID']
        }));
        
        apiApp.use(express.json());
        
        // Configurar rutas de la API (incluye /api/bots)
        setupRoutes(apiApp);
        
        // Configurar rutas del Dashboard (login, dashboard, mensajes, conexión, adaptadores, logs)
        setupDashboardRoutes(apiApp);
        
        // Configurar rutas de Settings (gestión de .env)
        setupSettingsRoutes(apiApp);
        
        // ============================================
        // WEBHOOK META (WhatsApp Business API)
        // ============================================
        // GET: Verificación del webhook (Meta envía challenge)
        apiApp.get('/webhooks/whatsapp', (req, res) => {
            const mode = req.query['hub.mode'];
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];
            
            const verifyToken = process.env.META_VERIFY_TOKEN || 'cocolu_webhook_verify_2025_secure_token_meta';
            
            if (mode === 'subscribe' && token === verifyToken) {
                console.log('✅ Webhook verificado por Meta');
                res.status(200).send(challenge);
            } else {
                console.warn('⚠️  Verificación de webhook fallida');
                res.sendStatus(403);
            }
        });
        
        // POST: Recibir mensajes de Meta
        // El provider de Meta también escucha en /webhook, pero mantenemos /webhooks/whatsapp para compatibilidad
        apiApp.post('/webhooks/whatsapp', async (req, res) => {
            try {
                const body = req.body;
                
                console.log('🔔 Webhook recibido:', JSON.stringify(body, null, 2).substring(0, 500));
                
                // Si el provider de Meta está inicializado, intentar pasar el webhook directamente al provider
                // El provider de Meta tiene su propio método para procesar webhooks
                if (mainProvider && mainProvider.vendor && typeof mainProvider.vendor.incomingMsg === 'function') {
                    console.log('🔄 Pasando webhook al provider de Meta para procesamiento automático...');
                    try {
                        // El provider de Meta procesa el webhook y emite eventos 'message' automáticamente
                        // NO registramos el mensaje aquí porque el listener del provider lo hará
                        await mainProvider.vendor.incomingMsg(req, res);
                        console.log('✅ Provider de Meta procesó el webhook - el mensaje será registrado por el listener del provider');
                        return; // El provider ya respondió y procesará el mensaje
                    } catch (err) {
                        console.error('❌ Error en incomingMsg del provider:', err.message);
                        // Continuar con el procesamiento manual como fallback
                    }
                }
                
                // Procesamiento manual como fallback (solo si el provider no procesó el webhook)
                console.log('🔄 Procesando webhook manualmente (fallback)...');
                
                // Verificar que es un webhook válido de Meta
                if (body.object === 'whatsapp_business_account') {
                    const entry = body.entry?.[0];
                    console.log('📥 Entry recibida:', entry ? 'Sí' : 'No');
                    
                    if (entry?.changes) {
                        const change = entry.changes[0];
                        const value = change.value;
                        console.log('📦 Value recibido:', value ? 'Sí' : 'No');
                        console.log('📦 Value tiene messages:', value?.messages ? `Sí (${value.messages.length})` : 'No');
                        
                        // Procesar mensajes entrantes
                        if (value.messages && value.messages[0]) {
                            const message = value.messages[0];
                            const from = message.from;
                            const messageText = message.text?.body || message.type || JSON.stringify(message);
                            
                            console.log(`📨 =======================================`);
                            console.log(`📨 MENSAJE RECIBIDO DE META (procesamiento manual)`);
                            console.log(`📨 De: ${from}`);
                            console.log(`📨 Texto: ${messageText}`);
                            console.log(`📨 Tipo: ${message.type || 'text'}`);
                            console.log(`📨 =======================================`);
                            
                            // Registrar mensaje solo en el procesamiento manual (fallback)
                            messageLog.addReceived(from, messageText);
                            console.log(`✅ Mensaje registrado en messageLog`);
                            
                            // Si el bot ya está inicializado, pasar el mensaje al bot
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
                                    
                                    console.log(`🔄 Emitiendo mensaje al provider: ${from} - ${messageText}`);
                                    console.log(`🔍 Formato del mensaje:`, JSON.stringify(providerMessage, null, 2).substring(0, 200));
                                    
                                    // El bot de BuilderBot procesa mensajes cuando el provider emite el evento 'message'
                                    // Emitir al provider - esto debería activar el procesamiento del flujo
                                    if (mainProvider && typeof mainProvider.emit === 'function') {
                                        console.log(`📤 Emitiendo evento 'message' al provider...`);
                                        mainProvider.emit('message', providerMessage);
                                        console.log(`✅ Mensaje emitido al provider`);
                                        
                                        // Verificar si el bot está escuchando el evento
                                        try {
                                            if (typeof mainProvider.listenerCount === 'function') {
                                                console.log(`🔍 Verificando listeners del provider:`, mainProvider.listenerCount('message'));
                                            } else {
                                                console.log(`🔍 Provider no tiene listenerCount (no es EventEmitter estándar)`);
                                            }
                                        } catch (err) {
                                            console.log(`🔍 Error verificando listeners: ${err.message}`);
                                        }
                                        
                                        // Procesar el mensaje directamente a través del bot también
                                        // El bot de BuilderBot internamente escucha el evento 'message' del provider
                                        // pero para asegurarnos, también procesamos directamente
                                        if (mainBot) {
                                            console.log(`🔄 Intentando procesar mensaje directamente a través del bot...`);
                                            try {
                                                // El bot de BuilderBot tiene un método interno para procesar mensajes
                                                // Intentamos diferentes formas de procesar el mensaje
                                                if (typeof mainBot.handleMsg === 'function') {
                                                    console.log(`🔄 Procesando con handleMsg...`);
                                                    await mainBot.handleMsg(providerMessage);
                                                    console.log(`✅ Mensaje procesado con handleMsg`);
                                                } else if (typeof mainBot.dispatch === 'function') {
                                                    console.log(`🔄 Procesando con dispatch...`);
                                                    await mainBot.dispatch(providerMessage);
                                                    console.log(`✅ Mensaje procesado con dispatch`);
                                                } else if (mainBot.flow && typeof mainBot.flow.process === 'function') {
                                                    console.log(`🔄 Procesando con flow.process...`);
                                                    await mainBot.flow.process(providerMessage);
                                                    console.log(`✅ Mensaje procesado con flow.process`);
                                                } else {
                                                    // Intentar acceder al método interno del bot
                                                    console.log(`🔍 Buscando método interno del bot...`);
                                                    const botKeys = Object.keys(mainBot).slice(0, 15);
                                                    console.log(`   - mainBot keys (primeros 15):`, botKeys);
                                                    
                                                    // El bot de BuilderBot internamente tiene un handler para mensajes
                                                    // Intentamos llamar directamente al handler interno
                                                    if (mainBot.handler && typeof mainBot.handler === 'function') {
                                                        console.log(`🔄 Procesando con handler...`);
                                                        await mainBot.handler(providerMessage);
                                                        console.log(`✅ Mensaje procesado con handler`);
                                                    } else if (mainBot.provider && mainBot.provider.emit) {
                                                        // Intentar emitir el evento directamente al provider del bot
                                                        console.log(`🔄 Emitiendo evento al provider del bot...`);
                                                        mainBot.provider.emit('message', providerMessage);
                                                        console.log(`✅ Evento emitido al provider del bot`);
                                                    } else {
                                                        console.warn(`⚠️  No se encontró método directo para procesar mensaje`);
                                                        console.warn(`⚠️  El bot debería procesar automáticamente cuando el provider emite 'message'`);
                                                        console.warn(`⚠️  Verificando estructura del bot...`);
                                                        console.warn(`   - mainBot.provider: ${!!mainBot.provider}`);
                                                        console.warn(`   - mainBot.flow: ${!!mainBot.flow}`);
                                                    }
                                                }
                                            } catch (err) {
                                                console.error(`❌ Error procesando mensaje directamente:`, err.message);
                                                console.error(`❌ Stack:`, err.stack);
                                            }
                                        }
                                    } else {
                                        console.warn('⚠️  mainProvider.emit no está disponible');
                                        console.warn(`⚠️  mainProvider:`, typeof mainProvider);
                                        console.warn(`⚠️  mainProvider.emit:`, typeof mainProvider?.emit);
                                    }
                                } catch (err) {
                                    console.error('❌ Error procesando mensaje:', err);
                                    console.error('❌ Stack:', err.stack);
                                }
                            } else {
                                console.warn('⚠️  Bot o provider no inicializado aún');
                                console.warn(`   - mainBot: ${!!mainBot}`);
                                console.warn(`   - mainProvider: ${!!mainProvider}`);
                            }
                        } else {
                            console.log('ℹ️  No hay mensajes en este webhook');
                        }
                        
                        // Procesar estados de mensajes
                        if (value.statuses) {
                            const status = value.statuses[0];
                            console.log(`📊 Estado de mensaje: ${status.status} para ${status.recipient_id}`);
                        }
                    } else {
                        console.log('⚠️  Entry no tiene changes');
                    }
                } else {
                    console.log(`⚠️  Webhook no es de tipo whatsapp_business_account. Object: ${body.object}`);
                }
                
                // Siempre responder 200 OK a Meta
                res.status(200).send('OK');
            } catch (error) {
                console.error('❌ Error procesando webhook de Meta:', error);
                console.error('❌ Stack:', error.stack);
                res.status(200).send('OK'); // Responder OK para evitar reintentos
            }
        });

        // Ruta raíz - redirige al login HTML del dashboard integrado
        // De esta forma, el flujo principal usa SOLO el login + dashboard HTML
        // y el dashboard React (Cocolu Ventas) deja de ser el entrypoint.
        apiApp.get('/', (req, res) => {
            res.redirect('/login');
        });
        
        // NO levantar el servidor API aquí - se levantará después del bot
        // para evitar conflicto de puerto con el servidor del bot
        let apiServer = null;

        // ============================================
        // 2. CREAR BASE DE DATOS
        // ============================================
        const adapterDB = new Database({
            filename: `${process.env.DB_PATH || './database'}/db.json`
        });

        // ============================================
        // 3. CREAR FLUJO PRINCIPAL CON TODOS LOS FLUJOS
        // ============================================
        console.log('📝 Cargando flujos de negocio...');
        const botId = 'bot_principal_cocolu'; // Declarar aquí para usar en flujos y bot manager
        const flows = [
            // SOLO Flujos PREMIUM de Cocolu - Flujos viejos ELIMINADOS
            { flow: welcomeFlow, name: 'Welcome Premium', description: 'Bienvenida con menú 5 opciones', category: 'core', keywords: ['hola', 'inicio', 'empezar'], priority: 100 },
            { flow: comandosFlow, name: 'Comandos', description: 'Lista de comandos disponibles', category: 'core', keywords: ['comandos', 'ayuda', 'help'], priority: 99 },
            { flow: problemaFlow, name: 'Atención Problemas', description: 'Resolución prioritaria de problemas', category: 'support', keywords: ['problema', 'queja', 'reclamo'], priority: 98 },
            { flow: registroFlow, name: 'Registro Cliente', description: 'Historial y estado del cliente', category: 'core', keywords: ['registro', 'estado', 'historial'], priority: 97 },
            { flow: debugFlow, name: 'Debug Técnico', description: 'Información técnica completa (Dev)', category: 'dev', keywords: ['debug', 'tecnico', 'dev'], priority: 96 },
            { flow: hablarAsesorFlow, name: 'Hablar con Asesor', description: 'Conexión directa con asesor', category: 'atencion', keywords: ['asesor', 'hablar', 'atención'], priority: 95 },
            { flow: catalogoFlow, name: 'Catálogo Premium', description: 'Catálogo con seguimiento automático', category: 'sales', keywords: ['catalogo', 'catálogo', 'productos'], priority: 90 },
            { flow: infoPedidoFlow, name: 'Info Pedido', description: 'Información de pedidos existentes', category: 'sales', keywords: ['pedido', 'información', 'orden'], priority: 88 },
            { flow: horariosFlow, name: 'Horarios', description: 'Horarios de atención', category: 'info', keywords: ['horario', 'horarios', 'hora'], priority: 86 },
            { flow: productoKeywordFlow, name: 'Keywords Productos', description: 'Búsqueda por palabra clave', category: 'sales', keywords: ['relicario', 'dije', 'cadena', 'pulsera', 'anillo'], priority: 85 },
        ];
        
        const adapterFlow = createFlow(flows.map(f => f.flow));
        console.log(`✅ ${flows.length} flujos PREMIUM cargados (flujos viejos eliminados)`);
        
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
        console.log(`✅ ${flows.length} flujos PREMIUM registrados en dashboard`);
        console.log('');

        // ============================================
        // 4. CONFIGURAR PROVIDER SEGÚN BOT_ADAPTER
        // ============================================
        let adapterNameForManager = 'builderbot-baileys';

        if (BOT_ADAPTER === 'meta') {
            console.log('🔧 Configurando provider Meta (WhatsApp Business API)...');

            const metaConfig = {
                jwtToken: process.env.META_JWT_TOKEN,
                numberId: process.env.META_NUMBER_ID,
                verifyToken: process.env.META_VERIFY_TOKEN,
                version: process.env.META_API_VERSION || 'v18.0',
            };

            if (!metaConfig.jwtToken || !metaConfig.numberId || !metaConfig.verifyToken) {
                console.warn('⚠️  Faltan variables META_JWT_TOKEN, META_NUMBER_ID o META_VERIFY_TOKEN.');
                console.warn('⚠️  Verifica tu archivo .env antes de usar el adaptador Meta.');
            }

            const { MetaProvider } = await import('@builderbot/provider-meta');
            mainProvider = createProvider(MetaProvider, metaConfig);
            adapterNameForManager = 'builderbot-meta';

            console.log('📋 Configuración Meta:', {
                numberId: metaConfig.numberId,
                version: metaConfig.version,
            });
        } else {
            const metodoConexion = USE_PAIRING_CODE ? 'NÚMERO TELEFÓNICO' : 'QR CODE';
            console.log(`🔧 Configurando provider Baileys (${metodoConexion})...`);
            
            // Configuración optimizada para evitar errores de sesión
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
                authTimeout: 60000, // 60 segundos para autenticación
                restartDelay: 2000, // 2 segundos entre reintentos
                maxRetries: 3, // Máximo 3 reintentos
                browser: ['Bot Cocolu', 'Chrome', '120.0.0']
            };
            
            console.log('📋 Configuración Baileys:', {
                metodo: metodoConexion,
                numero: USE_PAIRING_CODE ? PHONE_NUMBER : 'N/A',
                qrTimeout: `${providerConfig.qrTimeout/1000}s`,
                authTimeout: `${providerConfig.authTimeout/1000}s`,
                maxRetries: providerConfig.maxRetries,
                browser: providerConfig.browser[0]
            });
            
            mainProvider = createProvider(BaileysProvider, providerConfig);
        }

        // ============================================
        // 5. CREAR BOT DE BUILDERBOT
        // ============================================
        console.log('🤖 Creando bot principal...');
        const botInstance = await createBot({
            flow: adapterFlow,
            provider: mainProvider,
            database: adapterDB,
        });

        mainBot = botInstance;
        
        // Verificar que el bot esté escuchando el evento 'message' del provider
        console.log(`🔍 Verificando listeners del provider después de crear bot:`);
        try {
            if (typeof mainProvider.listenerCount === 'function') {
                console.log(`   - Provider listeners 'message': ${mainProvider.listenerCount('message')}`);
            } else {
                console.log(`   - Provider listeners 'message': N/A (provider no es EventEmitter estándar)`);
            }
            if (botInstance.listenerCount && typeof botInstance.listenerCount === 'function') {
                console.log(`   - Bot listeners 'message': ${botInstance.listenerCount('message')}`);
            } else {
                console.log(`   - Bot listeners 'message': N/A`);
            }
        } catch (err) {
            console.log(`   - Error verificando listeners: ${err.message}`);
        }
        
        // El bot de BuilderBot debería estar escuchando automáticamente el evento 'message' del provider
        // Si no lo está, hay un problema con la configuración

        // Configurar AlertsService con el provider
        alertsService.setProvider(mainProvider);
        console.log('✅ AlertsService configurado con provider');

        // Iniciar servidor HTTP del bot escuchando en todas las interfaces (0.0.0.0)
        // Esto permite que Nginx/Traefik accedan al bot desde otros contenedores/máquinas
        const httpServerInstance = botInstance.httpServer(+PORT);
        
        // Asegurarse de que el servidor escucha en 0.0.0.0 en lugar de solo localhost
        if (httpServerInstance && httpServerInstance.listen) {
            // El servidor ya está escuchando, pero intentamos asegurarnos de que sea en 0.0.0.0
            console.log(`✅ Bot HTTP server en puerto ${PORT}`);
        } else {
            console.log(`✅ Bot HTTP server en puerto ${PORT}`);
        }
        console.log('');

        // ============================================
        // 6. REGISTRAR BOT EN EL BOT-MANAGER
        // ============================================
        console.log('🎯 Registrando bot en el dashboard...');
        
        // Registrar el bot
        botManager.registerBot(botId, {
            name: BOT_NAME,
            adapter: adapterNameForManager,
            phoneNumber: process.env.BOT_PHONE,
            tenantId: TENANT_ID,
            autoReconnect: true, // En Meta normalmente manejas estabilidad vía API externa
            isMainBot: true, // Marcarlo como bot principal
            flows: flows.map(f => f.name || 'unnamed'),
        });

        // ============================================
        // 7. CONECTAR EVENTOS DEL BOT CON BOT-MANAGER
        // ============================================
        console.log('🔗 Conectando eventos con bot-manager...');
        
        // Listener para connection.update (Baileys moderno) -> captura QR y estados
        const onConnUpdate = (update = {}) => {
            try {
                const { connection, lastDisconnect, qr } = update;
                botManager.emit('bot:connupdate', { botId, update });
                if (qr) {
                    console.log('📱 QR recibido (connection.update)');
                    // Reiniciar watchdog
                    if (qrWatchdog) clearTimeout(qrWatchdog);
                    qrWatchdog = setTimeout(() => {
                        console.log('⏳ QR no escaneado en 90s (connection.update). Recomendaciones:');
                        console.log('   • Cerrar todas las sesiones en el teléfono');
                        console.log('   • Usar datos móviles (evitar WiFi/VPN)');
                        console.log('   • Ejecuta ./clean-restart.sh si persiste');
                    }, 90_000);
                    botManager.qrCodes.set(botId, qr);
                    botManager.updateBotStatus(botId, { state: 'qr_ready' });
                    botManager.emit('bot:qr', { botId, qr });
                }
                if (connection === 'open') {
                    // El ready handler ya marca conectado; aquí solo limpiamos QR y watchdog
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
            // Sólo aplica para providers tipo Baileys
            if (BOT_ADAPTER !== 'baileys') return;
            try {
                if (typeof mainProvider?.on === 'function') {
                    mainProvider.on('connection.update', onConnUpdate);
                    connUpdateAttached = true;
                }
            } catch {}
            try {
                if (!connUpdateAttached && mainProvider?.vendor?.ev?.on) {
                    mainProvider.vendor.ev.on('connection.update', onConnUpdate);
                    connUpdateAttached = true;
                }
            } catch {}
        };
        
        // Intentar adjuntar connection.update ahora (solo Baileys)
        attachConnUpdate();
        
        // Simular que el bot se "inició" para el manager
        setTimeout(() => {
            botManager.updateBotStatus(botId, {
                state: 'connecting',
                startedAt: new Date(),
            });
            // Reintentar adjuntar connection.update (solo Baileys)
            attachConnUpdate();
        }, 500);

        // Cuando el provider esté listo
        mainProvider.on('ready', () => {
            console.log('');
            console.log('✅ ¡BOT CONECTADO Y LISTO!');
            console.log('');
            
            botManager.updateBotStatus(botId, {
                state: 'connected',
                connectedAt: new Date(),
            });
            
            botManager.emit('bot:connected', { botId });
        });

        // Eventos específicos de Baileys (Meta no usa QR ni pairing code)
        if (BOT_ADAPTER === 'baileys') {
            // Evento moderno del provider: require_action -> contiene QR o pairing code
            mainProvider.on('require_action', (evt) => {
                try {
                    const qr = evt?.payload?.qr;
                    const code = evt?.payload?.code;
                    console.log('⚡ require_action recibido', { hasQR: !!qr, hasCode: !!code });
                    if (qr) {
                        // Refrescar watchdog
                        if (qrWatchdog) clearTimeout(qrWatchdog);
                        qrWatchdog = setTimeout(() => {
                            console.log('⏳ QR no escaneado en 90s. Sugerencias: cerrar sesiones en el teléfono y reintentar.');
                        }, 90_000);
                        botManager.qrCodes.set(botId, qr);
                        botManager.updateBotStatus(botId, { state: 'qr_ready' });
                        botManager.emit('bot:qr', { botId, qr });
                    }
                    if (code) {
                        botManager.updateBotStatus(botId, { state: 'pairing_code', pairingCode: code });
                        pairingCode = code;
                        console.log('🔢 Pairing code disponible:', code);
                    }
                } catch (e) {
                    console.error('Error en require_action:', e);
                }
            });

            // Fallo de autenticación crítico
            mainProvider.on('auth_failure', (info) => {
                try {
                    console.error('⚡⚡ AUTH FAILURE ⚡⚡', info);
                    botManager.updateBotStatus(botId, { state: 'error', lastError: Array.isArray(info) ? info.join(' | ') : String(info) });
                } catch (e) {
                    console.error('Error registrando auth_failure:', e);
                }
            });
        }

        // Evento de Pairing Code (conexión por número)
        mainProvider.on('code', (code) => {
            console.log('');
            console.log('🔥 =======================================');
            console.log('🔢 CÓDIGO DE VINCULACIÓN GENERADO');
            console.log('🔥 =======================================');
            console.log('');
            console.log('📱 Tu código de vinculación es:');
            console.log('');
            console.log('     ╔═══════════════╗');
            console.log(`     ║  ${code.slice(0, 4)}-${code.slice(4)}  ║`);
            console.log('     ╚═══════════════╝');
            console.log('');
            console.log('📝 INSTRUCCIONES:');
            console.log('');
            console.log('1️⃣  Abre WhatsApp en tu teléfono');
            console.log('2️⃣  Ve a: Ajustes → Dispositivos vinculados');
            console.log('3️⃣  Toca: "Vincular un dispositivo"');
            console.log('4️⃣  Selecciona: "Vincular con número de teléfono"');
            console.log(`5️⃣  Ingresa el código: ${code.slice(0, 4)}-${code.slice(4)}`);
            console.log('');
            console.log('⏰ El código expira en 60 segundos');
            console.log('🔥 =======================================');
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
            console.log('🔥 =======================================');
            console.log('📱 QR CODE GENERADO - INSTRUCCIONES:');
            console.log('🔥 =======================================');
            console.log('');
            console.log('1️⃣ En tu teléfono: WhatsApp → Ajustes → Dispositivos vinculados');
            console.log('2️⃣ CERRAR TODAS las sesiones activas');
            console.log('3️⃣ Tocar "Vincular un dispositivo"');
            console.log('4️⃣ Escanear el QR de arriba ⬆️');
            console.log('5️⃣ NO cerrar esta ventana hasta ver "BOT CONECTADO"');
            console.log('');
            console.log('⚠️  IMPORTANTE: NO abrir WhatsApp Web en navegador');
            console.log('⏰ Tienes 60 segundos para escanear');
            console.log('');
            
            // Watchdog: si no escanean en 90s, avisar y regenerar QR automáticamente
            if (qrWatchdog) {
                clearTimeout(qrWatchdog);
            }
            qrWatchdog = setTimeout(() => {
                console.log('⏳ QR no escaneado en 90s. Si sigue fallando:');
                console.log('   • Cierra TODAS las sesiones en el teléfono');
                console.log('   • Cambia a datos móviles (evitar WiFi/VPN)');
                console.log('   • Reabre WhatsApp y vuelve a intentar');
                console.log('   • Ejecuta ./clean-restart.sh para limpieza completa');
            }, 90_000);
            
            botManager.qrCodes.set(botId, qr);
            botManager.updateBotStatus(botId, {
                state: 'qr_ready',
            });
            botManager.emit('bot:qr', { botId, qr });
        });

        // Mensajes recibidos
        mainProvider.on('message', async (message) => {
            console.log(`🔔 EVENTO 'message' RECIBIDO DEL PROVIDER:`, JSON.stringify(message, null, 2).substring(0, 300));
            
            // Registrar mensaje en messageLog (solo si no fue registrado ya por el webhook handler)
            try {
                const from = message.from || message.key?.remoteJid || message.remoteJid || 'unknown';
                const body = message.body || message.message?.conversation || message.message?.extendedTextMessage?.text || message.text?.body || '';
                if (body && from !== 'unknown') {
                    // Verificar si el mensaje ya fue registrado (evitar duplicados)
                    const messageId = message.key?.id || message.id || `${from}_${body}_${Date.now()}`;
                    const recentMessages = messageLog.received.slice(-10); // Últimos 10 mensajes
                    const alreadyRegistered = recentMessages.some(m => 
                        m.from === from && 
                        m.body === body && 
                        (new Date() - new Date(m.timestamp)) < 2000 // Dentro de 2 segundos
                    );
                    
                    if (!alreadyRegistered) {
                        messageLog.addReceived(from, body);
                        console.log(`📨 Mensaje registrado desde provider: ${from} - ${body.substring(0, 50)}${body.length > 50 ? '...' : ''}`);
                    } else {
                        console.log(`ℹ️  Mensaje ya registrado, omitiendo duplicado: ${from} - ${body.substring(0, 50)}`);
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
            
            // El bot de BuilderBot debería procesar automáticamente el mensaje cuando el provider emite 'message'
            // pero verificamos que el bot esté procesando el flujo
            console.log(`🔄 Bot debería procesar mensaje: ${message.from || 'unknown'} - ${message.body || message.message?.conversation || 'sin texto'}`);
            console.log(`🔍 Verificando si el bot tiene métodos de procesamiento...`);
            console.log(`   - mainBot existe: ${!!mainBot}`);
            console.log(`   - mainBot.handleMessage: ${mainBot && typeof mainBot.handleMessage === 'function' ? 'Sí' : 'No'}`);
            console.log(`   - mainBot.processMessage: ${mainBot && typeof mainBot.processMessage === 'function' ? 'Sí' : 'No'}`);
            console.log(`   - mainBot.flow: ${mainBot && mainBot.flow ? 'Sí' : 'No'}`);
            console.log(`   - mainBot.handleMsg: ${mainBot && typeof mainBot.handleMsg === 'function' ? 'Sí' : 'No'}`);
            console.log(`   - mainBot.dispatch: ${mainBot && typeof mainBot.dispatch === 'function' ? 'Sí' : 'No'}`);
            
            // BuilderBot procesa automáticamente cuando el provider emite 'message'
            // PERO parece que no está funcionando, así que intentamos procesar directamente
            if (mainBot) {
                console.log(`✅ Bot está inicializado`);
                
                // Intentar procesar el mensaje directamente a través del bot
                // El bot de BuilderBot internamente tiene un método para procesar mensajes
                try {
                    // Verificar si el bot tiene un método para procesar mensajes
                    if (typeof mainBot.handleMsg === 'function') {
                        console.log(`🔄 Procesando mensaje con handleMsg...`);
                        await mainBot.handleMsg(message);
                        console.log(`✅ Mensaje procesado con handleMsg`);
                    } else if (typeof mainBot.dispatch === 'function') {
                        console.log(`🔄 Procesando mensaje con dispatch...`);
                        await mainBot.dispatch(message);
                        console.log(`✅ Mensaje procesado con dispatch`);
                    } else if (mainBot.flow && typeof mainBot.flow.process === 'function') {
                        console.log(`🔄 Procesando mensaje con flow.process...`);
                        await mainBot.flow.process(message);
                        console.log(`✅ Mensaje procesado con flow.process`);
                    } else {
                        console.warn(`⚠️  No se encontró método directo para procesar mensaje`);
                        console.warn(`⚠️  El bot debería procesar automáticamente cuando el provider emite 'message'`);
                        console.warn(`⚠️  Verificando si el bot está escuchando el evento...`);
                        console.warn(`   - Provider listeners 'message': ${mainProvider.listenerCount('message')}`);
                    }
                } catch (err) {
                    console.error(`❌ Error procesando mensaje directamente:`, err.message);
                    console.error(`❌ Stack:`, err.stack);
                }
            } else {
                console.warn(`⚠️  Bot no está inicializado aún`);
            }
        });

        // Manejo robusto de errores y reconexión
        mainProvider.on('error', (error) => {
            const errMsg = (error && (error.message || error.reason || (error.toString && error.toString()))) || 'unknown';
            const errorStack = error?.stack || '';
            const errorCode = error?.code || '';
            const errorConfig = error?.config || {};
            const errorUrl = errorConfig?.url || '';
            
            // Filtrar errores no críticos de conexión durante la inicialización
            // Estos errores ocurren cuando Meta intenta obtener el perfil y la conexión se resetea
            // No son críticos y no deberían detener el servidor
            const isNonCriticalConnectionError = (
                (errorCode === 'ECONNRESET' || errMsg.includes('ECONNRESET')) &&
                (errorStack.includes('getProfile') || 
                 errorStack.includes('afterHttpServerInit') ||
                 errorUrl.includes('graph.facebook.com'))
            );
            
            if (isNonCriticalConnectionError) {
                // Solo registrar de forma silenciosa, no cambiar el estado del bot
                console.warn(`⚠️  Error de conexión no crítico durante inicialización (se ignorará): ${errMsg.substring(0, 100)}`);
                console.warn(`   Esto es normal si hay problemas temporales de red con la API de Facebook`);
                console.warn(`   El bot continuará funcionando normalmente`);
                return; // No procesar este error como crítico
            }
            
            // Para otros errores, mostrar información completa
            console.error('');
            console.error('🔴 =======================================');
            console.error('❌ ERROR DE CONEXIÓN DETECTADO');
            console.error('🔴 =======================================');
            console.error('Error:', errMsg);
            
            // Solo mostrar detalles si no es un error de conexión repetitivo
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
                    } catch {}
                }
            }
            
            // Errores comunes y soluciones
            if (error.message && error.message.includes('QR')) {
                console.error('');
                console.error('🔧 SOLUCIÓN: Problema con QR');
                console.error('1. Cierra TODAS las sesiones de WhatsApp Web');
                console.error('2. Espera 30 segundos');
                console.error('3. Reinicia el bot');
            } else if (error.message && (error.message.includes('session') || error.message.includes('auth'))) {
                console.error('');
                console.error('🔧 SOLUCIÓN: Problema de sesión');
                console.error('1. Elimina carpetas de sesión');
                console.error('2. Reinicia el bot');
                console.error('3. Escanea nuevo QR');
            } else if (error.message && error.message.includes('timeout')) {
                console.error('');
                console.error('🔧 SOLUCIÓN: Timeout de conexión');
                console.error('1. Verifica tu conexión a internet');
                console.error('2. Reinicia el bot');
            }

            console.error('🔴 =======================================');
            console.error('');

            // Registrar error en el messageLog para verlo en el dashboard (solo errores críticos)
            try {
                messageLog.addError('provider_error', error);
            } catch {}

            const status = botManager.botStatus.get(botId);
            if (status) {
                // Solo cambiar el estado a 'error' si no es un error no crítico
                if (!isNonCriticalConnectionError) {
                    botManager.updateBotStatus(botId, {
                        errors: (status.errors || 0) + 1,
                        lastError: error.message,
                        state: 'error'
                    });
                }
            }

            // Solo emitir evento de error si es crítico
            if (!isNonCriticalConnectionError) {
                botManager.emit('bot:error', { botId, error: error.message });
            }
        });

        // Evento de desconexión
        mainProvider.on('close', (reason) => {
            console.log('');
            console.log('⚠️  CONEXIÓN CERRADA:', reason);
            console.log('🔄 El bot intentará reconectarse automáticamente...');
            console.log('');
            
            botManager.updateBotStatus(botId, {
                state: 'disconnected',
                disconnectedAt: new Date(),
                lastDisconnectReason: reason
            });
        });

        // Evento de reconexión
        mainProvider.on('connecting', () => {
            console.log('🔄 Reconectando...');
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
                    
                    // Registrar mensaje en el servicio de facturación de Meta (solo si es adaptador Meta)
                    if (BOT_ADAPTER === 'meta') {
                        try {
                            const metaBillingService = (await import('./src/services/meta-billing.service.js')).default;
                            // Determinar tipo de mensaje
                            const messageType = options?.type || (typeof text === 'object' ? text.type || 'text' : 'text');
                            const isTemplate = options?.isTemplate || false;
                            const isService = options?.isService || false;
                            
                            metaBillingService.recordMessage(to, messageType, isTemplate, isService);
                        } catch (err) {
                            // No fallar si el servicio de facturación no está disponible
                            console.warn('No se pudo registrar mensaje en facturación:', err.message);
                        }
                    }
                } catch {}
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

        console.log(`✅ Bot registrado en dashboard con ID: ${botId}`);
        console.log('');

        // ============================================
        // 7.5 LEVANTAR SERVIDOR API (después del bot)
        // ============================================
        // Ahora que el bot está levantado, levantar el API en el mismo puerto
        apiServer = apiApp.listen(API_PORT, '0.0.0.0', () => {
            console.log(`✅ API REST iniciada en puerto ${API_PORT} (0.0.0.0)`);
            console.log(`🌐 Dashboard: http://0.0.0.0:${API_PORT}`);
            console.log(`📊 API Health: http://0.0.0.0:${API_PORT}/api/health`);
            console.log(`🤖 Bots API: http://0.0.0.0:${API_PORT}/api/bots`);
            console.log('');
        });

        // ============================================
        // 8. INFORMACIÓN FINAL
        // ============================================
        console.log('🤖 =======================================');
        console.log('🤖   SISTEMA COMPLETAMENTE INICIALIZADO');
        console.log('🤖 =======================================');
        console.log(`🤖 Bot Principal: ${BOT_NAME}`);
        console.log(`🤖 Tenant: ${TENANT_ID}`);
        console.log(`🤖 Puerto Bot: ${PORT}`);
        console.log(`🌐 Puerto API: ${API_PORT}`);
        console.log(`🤖 Flujos activos: ${flows.length}`);
        console.log('🤖 =======================================');
        console.log('📱 Escanea el código QR con WhatsApp');
        console.log(`🌐 Dashboard: http://localhost:${API_PORT}`);
        console.log(`🎛️ Control de Bots: http://localhost:${API_PORT}/bots`);
        console.log('🤖 =======================================');
        console.log('✨ El bot ahora es controlable desde el dashboard');
        console.log('🤖 =======================================');
        console.log('');

    } catch (error) {
        console.error('❌ Error al iniciar el sistema:', error);
        process.exit(1);
    }
};

// Manejo de señales para shutdown graceful
process.on('SIGINT', async () => {
    console.log('');
    console.log('🛑 Deteniendo sistema...');
    
    try {
        // Detener todos los bots registrados
        await botManager.stopAll();
        console.log('✅ Bots detenidos');
        
        console.log('👋 Sistema detenido correctamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al detener:', error);
        process.exit(1);
    }
});

// Manejar SIGTERM (producción/PM2)
process.on('SIGTERM', async () => {
    console.log('');
    console.log('🛑 Deteniendo sistema (SIGTERM)...');
    try {
        await botManager.stopAll();
        console.log('✅ Bots detenidos');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al detener (SIGTERM):', error);
        process.exit(1);
    }
});

// Capturar errores no controlados para evitar estados inconsistentes
process.on('unhandledRejection', (reason) => {
    const errorMsg = reason?.message || String(reason);
    const errorStack = reason?.stack || '';
    const errorCode = reason?.code || '';
    
    // Filtrar errores no críticos de conexión durante la inicialización
    const isNonCriticalConnectionError = (
        (errorCode === 'ECONNRESET' || errorMsg.includes('ECONNRESET')) &&
        (errorStack.includes('getProfile') || 
         errorStack.includes('afterHttpServerInit') ||
         errorStack.includes('graph.facebook.com'))
    );
    
    if (isNonCriticalConnectionError) {
        // Solo registrar de forma silenciosa
        console.warn(`⚠️  Promesa rechazada no crítica (se ignorará): ${errorMsg.substring(0, 100)}`);
        console.warn(`   Error de conexión durante inicialización - el bot continuará funcionando`);
        return;
    }
    
    // Para otros errores, mostrar información completa
    console.error('🔴 Unhandled Rejection:', reason);
    if (reason && typeof reason === 'object') {
        try {
            console.error('Detalle:', {
                message: reason.message,
                code: reason.code,
                stack: reason.stack?.substring(0, 500)
            });
        } catch {}
    }
});
process.on('uncaughtException', (err) => {
    console.error('🔴 Uncaught Exception:', err);
    // Las excepciones no capturadas son siempre críticas
    console.error('Stack:', err.stack);
});

// Iniciar aplicación
main();
