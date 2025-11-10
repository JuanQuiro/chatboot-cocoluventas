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

// Configuración
const PORT = process.env.PORT || 3008;
const API_PORT = process.env.API_PORT || 3009;

const main = async () => {
    try {
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
        const { httpServer } = await createBot({
            flow: adapterFlow,
            provider: adapterProvider,
            database: adapterDB,
        });

        // Iniciar servidor HTTP del bot
        httpServer(+PORT);

        // Crear servidor API REST para Dashboard
        const apiApp = express();
        apiApp.use(cors());
        apiApp.use(express.json());
        apiApp.use(express.static('dashboard/build'));
        
        // Configurar rutas de la API
        setupRoutes(apiApp);
        
        // Iniciar servidor API
        apiApp.listen(API_PORT, () => {
            console.log(`🌐 API REST iniciada en puerto ${API_PORT}`);
        });

        console.log('');
        console.log('🤖 =======================================');
        console.log('🤖   CHATBOT COCOLU VENTAS - EMBER DRAGO');
        console.log('🤖 =======================================');
        console.log(`🤖 Puerto Bot: ${PORT}`);
        console.log(`🌐 Puerto API: ${API_PORT}`);
        console.log('🤖 Proveedor: Baileys (WhatsApp Web)');
        console.log('🤖 =======================================');
        console.log('📱 Escanea el código QR con WhatsApp');
        console.log(`🌐 Dashboard: http://localhost:${API_PORT}/dashboard`);
        console.log(`📊 API Docs: http://localhost:${API_PORT}/api/health`);
        console.log('🤖 =======================================');
        console.log('🤖 Presiona Ctrl+C para detener');
        console.log('🤖 =======================================');
        console.log('');

    } catch (error) {
        console.error('❌ Error al iniciar el bot:', error);
        process.exit(1);
    }
};

main();
