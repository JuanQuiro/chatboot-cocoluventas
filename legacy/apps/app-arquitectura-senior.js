import 'dotenv/config';
import { createBot, createProvider, createFlow } from '@builderbot/bot';
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

// MEJORAS: Importar utilities
import logger from './src/utils/logger.js';
import errorHandler from './src/utils/error-handler.js';
import gracefulShutdown from './src/utils/graceful-shutdown.js';
import healthCheck from './src/utils/health-check.js';
import persistence from './src/utils/persistence.js';
import { apiLimiter } from './src/utils/rate-limiter.js';
import sellersManager from './src/services/sellers.service.js';
import analyticsService from './src/services/analytics.service.js';

// ARQUITECTURA SENIOR: Importar bootstrap y DI Container
import { bootstrapContainer, getService } from './src/core/bootstrap.js';
import { AssignSellerCommand } from './src/core/application/commands/AssignSellerCommand.js';

// Configuración
const PORT = process.env.PORT || 3008;
const API_PORT = process.env.API_PORT || 3009;

function validateEnvironment() {
    const warnings = [];
    if (!process.env.PORT) warnings.push('PORT not set, using default 3008');
    if (!process.env.API_PORT) warnings.push('API_PORT not set, using default 3009');
    
    if (warnings.length > 0) {
        logger.warn('Environment warnings:', { warnings });
    }
}

const main = async () => {
    try {
        logger.info('🚀 Iniciando Chatbot - ARQUITECTURA SENIOR');
        
        // Validar entorno
        validateEnvironment();

        // ARQUITECTURA SENIOR: Bootstrap DI Container
        logger.info('🔧 Configurando Dependency Injection...');
        await bootstrapContainer();
        logger.info('✅ DI Container configurado');

        // Inicializar persistencia
        await persistence.init();

        // Cargar estado previo
        const savedSellersState = await persistence.load('sellers-state');
        if (savedSellersState) {
            logger.info('📥 Estado de vendedores restaurado');
            sellersManager.restoreState(savedSellersState);
        }

        const savedAnalyticsState = await persistence.load('analytics-state');
        if (savedAnalyticsState) {
            logger.info('📥 Estado de analytics restaurado');
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

        // Configurar proveedor
        const adapterProvider = createProvider(Provider);

        // Crear bot
        logger.info('📱 Creando bot de WhatsApp...');
        const { httpServer } = await createBot({
            flow: adapterFlow,
            provider: adapterProvider,
            database: adapterDB,
        });

        httpServer(+PORT);
        logger.info(`🤖 Bot server: puerto ${PORT}`);

        // === API REST CON MEJORAS ===
        const apiApp = express();
        
        apiApp.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true
        }));
        apiApp.use(express.json({ limit: '10mb' }));
        apiApp.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Request logging
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

        // Rate limiting
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

        // Health check
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

        // ARQUITECTURA SENIOR: Endpoint usando Command Pattern
        apiApp.post('/api/v2/sellers/assign', async (req, res) => {
            try {
                const { userId, userName, specialty } = req.body;

                // Crear command
                const command = new AssignSellerCommand(userId, userName, specialty, {
                    correlationId: req.headers['x-correlation-id']
                });

                // Obtener handler del DI Container
                const handler = getService('assignSellerHandler');

                // Ejecutar command
                const result = await handler.handle(command);

                res.json(result);
            } catch (error) {
                errorHandler.handle(error, {
                    endpoint: '/api/v2/sellers/assign',
                    body: req.body
                });
                res.status(400).json({
                    error: error.message
                });
            }
        });

        // ARQUITECTURA SENIOR: Endpoint para ver eventos
        apiApp.get('/api/v2/events', async (req, res) => {
            try {
                const eventBus = getService('eventBus');
                const { eventName, limit = 50 } = req.query;
                
                const events = eventBus.getEventHistory(eventName, parseInt(limit));
                
                res.json({
                    count: events.length,
                    events
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        apiApp.use(express.static('dashboard/build'));
        setupRoutes(apiApp);
        
        // Error handling middleware
        apiApp.use((err, req, res, next) => {
            errorHandler.handle(err, {
                method: req.method,
                path: req.path
            });
            res.status(err.status || 500).json({
                error: err.message || 'Internal server error'
            });
        });
        
        const apiServer = apiApp.listen(API_PORT, () => {
            logger.info(`🌐 API REST: puerto ${API_PORT}`);
        });

        // Graceful shutdown
        gracefulShutdown.setupListeners();

        gracefulShutdown.register('API Server', async () => {
            return new Promise((resolve) => {
                apiServer.close(() => {
                    logger.info('API server cerrado');
                    resolve();
                });
            });
        });

        gracefulShutdown.register('Save State', async () => {
            await persistence.save('sellers-state', sellersManager.getState());
            await persistence.save('analytics-state', analyticsService.getState());
            logger.info('Estado guardado');
        });

        // Auto-save periódico
        const autoSaveInterval = setInterval(async () => {
            try {
                await persistence.save('sellers-state', sellersManager.getState());
                await persistence.save('analytics-state', analyticsService.getState());
                logger.debug('Auto-save completado');
            } catch (error) {
                logger.error('Error en auto-save:', error);
            }
        }, 300000);

        gracefulShutdown.register('Clear Intervals', async () => {
            clearInterval(autoSaveInterval);
        });

        // Memory monitoring
        setInterval(() => {
            const mem = process.memoryUsage();
            const heapUsed = Math.round(mem.heapUsed / 1024 / 1024);
            const heapTotal = Math.round(mem.heapTotal / 1024 / 1024);
            
            if (heapUsed / heapTotal > 0.9) {
                logger.warn('Alto uso de memoria', {
                    heapUsed: `${heapUsed}MB`,
                    heapTotal: `${heapTotal}MB`
                });
            }
        }, 60000);

        console.log('');
        console.log('🤖 =======================================');
        console.log('🤖   CHATBOT COCOLU - ARQUITECTURA SENIOR');
        console.log('🤖   Clean Architecture + DDD + CQRS');
        console.log('🤖 =======================================');
        console.log(`🤖 Bot: ${PORT} | API: ${API_PORT}`);
        console.log('🏗️  Hexagonal Architecture ✅');
        console.log('💉 Dependency Injection ✅');
        console.log('🎯 Domain Services ✅');
        console.log('📊 Event Sourcing ✅');
        console.log('🔍 Specifications Pattern ✅');
        console.log('🛡️  Anti-Corruption Layer ✅');
        console.log('🤖 =======================================');
        console.log(`📊 Health: http://localhost:${API_PORT}/health`);
        console.log(`🎯 API v2: http://localhost:${API_PORT}/api/v2/`);
        console.log('🤖 =======================================');
        console.log('');

        logger.info('✅ Sistema ARQUITECTURA SENIOR iniciado');

    } catch (error) {
        logger.error('❌ Error fatal:', error);
        errorHandler.handle(error, { phase: 'startup' });
        process.exit(1);
    }
};

main().catch((error) => {
    console.error('❌ Error no capturado:', error);
    process.exit(1);
});
