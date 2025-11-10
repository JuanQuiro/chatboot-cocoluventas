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
import menuFlow from './src/flows/menu.flow.js';
import productsFlow from './src/flows/products.flow.js';
import ordersFlow, { trackOrderFlow } from './src/flows/orders.flow.js';
import supportFlow from './src/flows/support.flow.js';
import scheduleFlow, { shippingFlow, paymentFlow } from './src/flows/schedule.flow.js';

// NUEVO: Importar flujos premium de Cocolu
import { hablarAsesorFlow } from './src/flows/hablar-asesor.flow.js';
import { catalogoFlow } from './src/flows/catalogo.flow.js';
import { infoPedidoFlow } from './src/flows/info-pedido.flow.js';
import { horariosFlow } from './src/flows/horarios.flow.js';
import { problemaFlow } from './src/flows/problema.flow.js';
import { productoKeywordFlow } from './src/flows/producto-keyword.flow.js';

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

// Variable global para el bot
let mainBot = null;
let mainProvider = null;

const main = async () => {
    try {
        console.log('');
        console.log('🤖 =======================================');
        console.log('🤖   COCOLU VENTAS - EMBER DRAGO');
        console.log('🤖   Bot Integrado con Dashboard');
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
            // Flujos PREMIUM de Cocolu (nuevos - prioridad alta)
            { flow: welcomeFlow, name: 'Welcome Premium', description: 'Bienvenida con menú 5 opciones', category: 'core', keywords: ['hola', 'inicio', 'empezar'], priority: 100 },
            { flow: hablarAsesorFlow, name: 'Hablar con Asesor', description: 'Conexión directa con asesor', category: 'atencion', keywords: ['asesor', 'hablar', 'atención'], priority: 95 },
            { flow: catalogoFlow, name: 'Catálogo Premium', description: 'Catálogo con seguimiento automático', category: 'sales', keywords: ['catalogo', 'catálogo', 'productos'], priority: 90 },
            { flow: infoPedidoFlow, name: 'Info Pedido', description: 'Información de pedidos existentes', category: 'sales', keywords: ['pedido', 'información', 'orden'], priority: 88 },
            { flow: horariosFlow, name: 'Horarios', description: 'Horarios de atención', category: 'info', keywords: ['horario', 'horarios', 'hora'], priority: 86 },
            { flow: problemaFlow, name: 'Atención Problemas', description: 'Resolución prioritaria de problemas', category: 'support', keywords: ['problema', 'queja', 'reclamo'], priority: 98 },
            { flow: productoKeywordFlow, name: 'Keywords Productos', description: 'Búsqueda por palabra clave', category: 'sales', keywords: ['relicario', 'dije', 'cadena', 'pulsera', 'anillo'], priority: 85 },
            
            // Flujos originales (compatibilidad)
            { flow: menuFlow, name: 'Menu', description: 'Menú principal de opciones', category: 'core', keywords: ['menu', 'opciones'], priority: 80 },
            { flow: productsFlow, name: 'Products', description: 'Catálogo de productos', category: 'sales', keywords: ['productos'], priority: 75 },
            { flow: ordersFlow, name: 'Orders', description: 'Gestión de órdenes', category: 'sales', keywords: ['orden', 'comprar'], priority: 70 },
            { flow: trackOrderFlow, name: 'Track Order', description: 'Rastrear órdenes existentes', category: 'sales', keywords: ['rastrear', 'tracking'], priority: 65 },
            { flow: supportFlow, name: 'Support', description: 'Soporte técnico', category: 'support', keywords: ['ayuda', 'soporte'], priority: 60 },
            { flow: scheduleFlow, name: 'Schedule', description: 'Agendar cita', category: 'support', keywords: ['agendar', 'cita'], priority: 55 },
            { flow: shippingFlow, name: 'Shipping', description: 'Información de envío', category: 'sales', keywords: ['envío', 'entrega'], priority: 50 },
            { flow: paymentFlow, name: 'Payment', description: 'Métodos de pago', category: 'sales', keywords: ['pago', 'pagar'], priority: 50 },
        ];
        
        const adapterFlow = createFlow(flows.map(f => f.flow));
        console.log(`✅ ${flows.length} flujos cargados`);
        
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
        console.log(`✅ ${flows.length} flujos registrados en dashboard`);
        console.log('');

        // ============================================
        // 4. CONFIGURAR PROVEEDOR BAILEYS
        // ============================================
        console.log('🔧 Configurando provider Baileys...');
        mainProvider = createProvider(Provider, {
            name: 'bot_principal',
        });

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
        
        // Simular que el bot se "inició" para el manager
        setTimeout(() => {
            botManager.updateBotStatus(botId, {
                state: 'connecting',
                startedAt: new Date(),
            });
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

        // Evento QR
        mainProvider.on('qr', (qr) => {
            console.log('📱 QR Code generado - Escanea con WhatsApp');
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

        // Errores
        mainProvider.on('error', (error) => {
            console.error('❌ Error en el bot:', error);
            const status = botManager.botStatus.get(botId);
            if (status) {
                botManager.updateBotStatus(botId, {
                    errors: (status.errors || 0) + 1,
                    lastError: error.message,
                });
            }
            botManager.emit('bot:error', { botId, error: error.message });
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

// Iniciar aplicación
main();
