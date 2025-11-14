import 'dotenv/config';
import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot';
import { JsonFileDB as Database } from '@builderbot/database-json';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import express from 'express';
import cors from 'cors';

// Importar flujos
import welcomeFlow from './src/flows/welcome.flow.js';
import menuFlow from './src/flows/menu.flow.js';
import productsFlow from './src/flows/products.flow.js';
import ordersFlow, { trackOrderFlow } from './src/flows/orders.flow.js';
import supportFlow from './src/flows/support.flow.js';
import scheduleFlow, { shippingFlow, paymentFlow } from './src/flows/schedule.flow.js';

// Importar API routes
import { setupRoutes } from './src/api/routes.js';

// MEJORAS: Importar utilidades profesionales
import logger from './src/utils/logger.js';
import errorHandler from './src/utils/error-handler.js';
import gracefulShutdown from './src/utils/graceful-shutdown.js';
import healthCheck from './src/utils/health-check.js';
import persistence from './src/utils/persistence.js';
import { apiLimiter } from './src/utils/rate-limiter.js';
import sellersManager from './src/services/sellers.service.js';
import analyticsService from './src/services/analytics.service.js';

// Configuración
const PORT = process.env.PORT || 3008;
const API_PORT = process.env.API_PORT || 3009;

// MEJORA: Validar variables de entorno críticas
function validateEnvironment() {
    const required = [];
    const warnings = [];

    if (!process.env.PORT) warnings.push('PORT not set, using default 3008');
    if (!process.env.API_PORT) warnings.push('API_PORT not set, using default 3009');

    if (warnings.length > 0) {
        logger.warn('Environment warnings:', { warnings });
    }

    if (required.length > 0) {
        logger.error('Missing required environment variables:', { required });
        throw new Error(`Missing env vars: ${required.join(', ')}`);
    }
}

const main = async () => {
    try {
        logger.info('🚀 Iniciando Chatbot Cocolu Ventas - Ember Drago Edition');
        
        // MEJORA: Validar entorno
        validateEnvironment();

        // MEJORA: Inicializar persistencia
        await persistence.init();

        // MEJORA: Cargar estado previo de sellers y analytics
        const savedSellersState = await persistence.load('sellers-state');
        if (savedSellersState) {
            logger.info('📥 Estado de vendedores cargado desde disco');
            sellersManager.restoreState(savedSellersState);
        }

        const savedAnalyticsState = await persistence.load('analytics-state');
        if (savedAnalyticsState) {
            logger.info('📥 Estado de analytics cargado desde disco');
            analyticsService.restoreState(savedAnalyticsState);
        }

        // Crear base de datos
        const adapterDB = new Database({
            filename: `${process.env.DB_PATH || './database'}/db.json`
        });

        // Crear flujo principal
        const adapterFlow = createFlow([
            welcomeFlow,
            menuFlow,
            productsFlow,
            ordersFlow,
            trackOrderFlow,
            supportFlow,
            scheduleFlow,
            shippingFlow,
            paymentFlow
        ]);

        // Configurar proveedor Baileys (WhatsApp Web - QR Code)
        const adapterProvider = createProvider(Provider);

        // Crear bot
        logger.info('📱 Creando bot de WhatsApp...');
        const { httpServer } = await createBot({
            flow: adapterFlow,
            provider: adapterProvider,
            database: adapterDB,
        });

        // Iniciar servidor HTTP del bot
        httpServer(+PORT);
        logger.info(`🤖 Bot HTTP server iniciado en puerto ${PORT}`);

        // MEJORA: Crear servidor API REST con mejoras
        const apiApp = express();
        
        // MEJORA: Middleware de seguridad y logging
        apiApp.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true
        }));
        apiApp.use(express.json({ limit: '10mb' }));
        apiApp.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // MEJORA: Request logging
        apiApp.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                logger.info('API Request', {
                    method: req.method,
                    path: req.path,
                    status: res.statusCode,
                    duration: `${duration}ms`
                });
            });
            next();
        });

        // MEJORA: Rate limiting
        apiApp.use((req, res, next) => {
            const userId = req.ip;
            const check = apiLimiter.check(userId);
            
            if (!check.allowed) {
                return res.status(429).json({
                    error: 'Too many requests',
                    retryAfter: check.retryAfter
                });
            }
            
            res.setHeader('X-RateLimit-Remaining', check.remaining);
            next();
        });

        // MEJORA: Health check endpoint
        apiApp.get('/health', async (req, res) => {
            try {
                const health = await healthCheck.runAll();
                res.status(health.status === 'healthy' ? 200 : 503).json(health);
            } catch (error) {
                res.status(503).json({
                    status: 'unhealthy',
                    error: error.message
                });
            }
        });

        // Static files
        apiApp.use(express.static('dashboard/build'));
        
        // Configurar rutas de la API
        setupRoutes(apiApp);
        
        // MEJORA: Error handling middleware
        apiApp.use((err, req, res, next) => {
            errorHandler.handle(err, {
                method: req.method,
                path: req.path,
                body: req.body
            });

            res.status(err.status || 500).json({
                error: err.message || 'Internal server error',
                timestamp: new Date().toISOString()
            });
        });
        
        // Iniciar servidor API
        const apiServer = apiApp.listen(API_PORT, () => {
            logger.info(`🌐 API REST iniciada en puerto ${API_PORT}`);
        });

        // MEJORA: Configurar graceful shutdown
        gracefulShutdown.setupListeners();

        // MEJORA: Registrar handlers de cleanup
        gracefulShutdown.register('API Server', async () => {
            return new Promise((resolve) => {
                apiServer.close(() => {
                    logger.info('API server cerrado');
                    resolve();
                });
            });
        });

        gracefulShutdown.register('Bot Server', async () => {
            logger.info('Bot server detenido');
        });

        gracefulShutdown.register('Save State', async () => {
            // MEJORA: Guardar estado antes de cerrar
            await persistence.save('sellers-state', sellersManager.getState());
            await persistence.save('analytics-state', analyticsService.getState());
            logger.info('Estado guardado en disco');
        });

        // MEJORA: Auto-save periódico (cada 5 minutos)
        const autoSaveInterval = setInterval(async () => {
            try {
                await persistence.save('sellers-state', sellersManager.getState());
                await persistence.save('analytics-state', analyticsService.getState());
                logger.debug('Auto-save completado');
            } catch (error) {
                logger.error('Error en auto-save:', error);
            }
        }, 300000); // 5 minutos

        gracefulShutdown.register('Clear Intervals', async () => {
            clearInterval(autoSaveInterval);
        });

        // MEJORA: Monitoreo de memoria
        setInterval(() => {
            const mem = process.memoryUsage();
            const heapUsed = Math.round(mem.heapUsed / 1024 / 1024);
            const heapTotal = Math.round(mem.heapTotal / 1024 / 1024);
            
            if (heapUsed / heapTotal > 0.9) {
                logger.warn('Alto uso de memoria', {
                    heapUsed: `${heapUsed}MB`,
                    heapTotal: `${heapTotal}MB`,
                    percentage: `${((heapUsed / heapTotal) * 100).toFixed(2)}%`
                });
            }
        }, 60000); // Cada minuto

        // Banner de inicio
        console.log('');
        console.log('🤖 =======================================');
        console.log('🤖   CHATBOT COCOLU VENTAS - EMBER DRAGO');
        console.log('🤖   VERSIÓN MEJORADA CON PROTECCIONES');
        console.log('🤖 =======================================');
        console.log(`🤖 Puerto Bot: ${PORT}`);
        console.log(`🌐 Puerto API: ${API_PORT}`);
        console.log('🤖 Proveedor: Baileys (WhatsApp Web)');
        console.log('🤖 =======================================');
        console.log('📱 Escanea el código QR con WhatsApp');
        console.log(`🌐 Dashboard: http://localhost:${API_PORT}/dashboard`);
        console.log(`📊 Health: http://localhost:${API_PORT}/health`);
        console.log('🤖 =======================================');
        console.log('✅ Sistema iniciado correctamente');
        console.log('🤖 =======================================');
        console.log('');

        logger.info('✅ Sistema completamente inicializado');

    } catch (error) {
        logger.error('❌ Error fatal al iniciar el bot:', error);
        errorHandler.handle(error, { phase: 'startup' });
        process.exit(1);
    }
};

main().catch((error) => {
    console.error('❌ Error no capturado:', error);
    process.exit(1);
});
