/**
 * Cocolu Ventas - App Integrado
 * Bot inicial con perfecta integración al Dashboard
 */

import 'dotenv/config';
import { createBot, createProvider, createFlow } from '@builderbot/bot';
import { JsonFileDB as Database } from '@builderbot/database-json';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
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

// NUEVO: Importar bot-manager y flow-manager para integración con dashboard
import botManager from './src/services/bot-manager.service.js';
import flowManager from './src/services/flow-manager.service.js';

// NUEVO: Importar servicios premium
import alertsService from './src/services/alerts.service.js';
import timerService from './src/services/timer.service.js';
import productsKeywordsService from './src/services/products-keywords.service.js';

// Configuración
const PORT = process.env.PORT || 3008;
const API_PORT = process.env.API_PORT || 3009;
const BOT_NAME = process.env.BOT_NAME || 'Bot Principal Cocolu';
const TENANT_ID = process.env.TENANT_ID || 'cocolu';
const USE_PAIRING_CODE = process.env.USE_PAIRING_CODE === 'true';
const PHONE_NUMBER = process.env.PHONE_NUMBER || '+584244370180';
const BOT_ADAPTER = process.env.BOT_ADAPTER || 'baileys';

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
        apiApp.use(express.static('dashboard/build'));
        
        // Configurar rutas de la API (incluye /api/bots)
        setupRoutes(apiApp);
        
        // Iniciar servidor API
        const apiServer = apiApp.listen(API_PORT, () => {
            console.log(`✅ API REST iniciada en puerto ${API_PORT}`);
            console.log(`🌐 Dashboard: http://localhost:${API_PORT}`);
            console.log(`📊 API Health: http://localhost:${API_PORT}/api/health`);
            console.log(`🤖 Bots API: http://localhost:${API_PORT}/api/bots`);
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
        // 4. CONFIGURAR PROVEEDOR BAILEYS (ROBUSTO)
        // ============================================
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
        
        mainProvider = createProvider(Provider, providerConfig);

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

        // Configurar AlertsService con el provider
        alertsService.setProvider(mainProvider);
        console.log('✅ AlertsService configurado con provider');

        // Iniciar servidor HTTP del bot
        botInstance.httpServer(+PORT);
        console.log(`✅ Bot HTTP server en puerto ${PORT}`);
        console.log('');

        // ============================================
        // 6. REGISTRAR BOT EN EL BOT-MANAGER
        // ============================================
        console.log('🎯 Registrando bot en el dashboard...');
        
        // Registrar el bot
        botManager.registerBot(botId, {
            name: BOT_NAME,
            adapter: 'builderbot-baileys',
            phoneNumber: process.env.BOT_PHONE,
            tenantId: TENANT_ID,
            autoReconnect: true,
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
        
        // Intentar adjuntar connection.update ahora
        attachConnUpdate();
        
        // Simular que el bot se "inició" para el manager
        setTimeout(() => {
            botManager.updateBotStatus(botId, {
                state: 'connecting',
                startedAt: new Date(),
            });
            // Reintentar adjuntar connection.update
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
        mainProvider.on('message', (message) => {
            const status = botManager.botStatus.get(botId);
            if (status) {
                botManager.updateBotStatus(botId, {
                    lastActivity: new Date(),
                    messagesReceived: (status.messagesReceived || 0) + 1,
                });
            }
            botManager.emit('bot:message', { botId, message });
        });

        // Manejo robusto de errores y reconexión
        mainProvider.on('error', (error) => {
            console.error('');
            console.error('🔴 =======================================');
            console.error('❌ ERROR DE CONEXIÓN DETECTADO');
            console.error('🔴 =======================================');
            const errMsg = (error && (error.message || error.reason || error.toString && error.toString())) || 'unknown';
            console.error('Error:', errMsg);
            if (error && typeof error === 'object') {
                try { console.error('Detalle:', JSON.stringify(error)); } catch {}
                console.error('Objeto completo:', error);
            }
            
            // Errores comunes y soluciones
            if (error.message.includes('QR')) {
                console.error('');
                console.error('🔧 SOLUCIÓN: Problema con QR');
                console.error('1. Cierra TODAS las sesiones de WhatsApp Web');
                console.error('2. Espera 30 segundos');
                console.error('3. Reinicia el bot');
            } else if (error.message.includes('session') || error.message.includes('auth')) {
                console.error('');
                console.error('🔧 SOLUCIÓN: Problema de sesión');
                console.error('1. Elimina carpetas de sesión');
                console.error('2. Reinicia el bot');
                console.error('3. Escanea nuevo QR');
            } else if (error.message.includes('timeout')) {
                console.error('');
                console.error('🔧 SOLUCIÓN: Timeout de conexión');
                console.error('1. Verifica tu conexión a internet');
                console.error('2. Reinicia el bot');
            }
            console.error('🔴 =======================================');
            console.error('');
            
            const status = botManager.botStatus.get(botId);
            if (status) {
                botManager.updateBotStatus(botId, {
                    errors: (status.errors || 0) + 1,
                    lastError: error.message,
                    state: 'error'
                });
            }
            botManager.emit('bot:error', { botId, error: error.message });
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
            sendMessage: async (to, text) => {
                await mainProvider.sendMessage(to, text, {});
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
    console.error('🔴 Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('🔴 Uncaught Exception:', err);
});

// Iniciar aplicación
main();
