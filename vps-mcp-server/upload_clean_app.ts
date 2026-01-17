import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
    readyTimeout: 60000,
};

console.log("🔥 UPLOADING CLEAN APP-INTEGRATED.JS...");

// CONTENIDO LIMPIO Y FINAL DE APP-INTEGRATED.JS
// Incluye todos los fixes: Login, CORS, Installments, Accounts, Clients
const cleanAppCode = `
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// --- NEW ROUTE IMPORTS (ROBUST MOCK-FREE) ---
// 1. Auth (Simple & Robust)
import authSimpleRouter from './src/api/auth-simple.routes.js';
// 2. Financial (Database Direct)
import installmentsFixRouter from './src/api/installments-fix.routes.js';
import accountsFixRouter from './src/api/accounts-fix.routes.js';
// 3. Clients (Schema Adaptive)
import clientsFixRouter from './src/api/clients-fix.routes.js';

// --- LEGACY IMPORTS (For other modules functionality) ---
import { setupSalesRoutes } from './src/api/sales.routes.js';
import { setupProductsRoutes } from './src/api/products.routes.js';
// import { setupDashboardRoutes } from './src/api/dashboard-routes.js'; // Might conflict if full mock
import enhancedRoutes from './src/api/enhanced-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiApp = express();
const PORT = 3009;

// --- CRITICAL MIDDLEWARE ---
// 1. CORS - Allow Frontend Access definitively
apiApp.use(cors({
    origin: ['https://cocolu.emberdrago.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 2. JSON Parser
apiApp.use(express.json());
apiApp.use(express.urlencoded({ extended: true }));

// --- STATIC FILES ---
apiApp.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- FIXED ROUTES MOUNTING (Priority High) ---
console.log('Mounting Fixed Routes...');

// 1. Auth
apiApp.use('/api', authSimpleRouter); 
// Note: authSimpleRouter handles /auth/login internally.
// We mount at /api so it becomes /api/auth/login due to router definition

// 2. Financial
apiApp.use('/api/installments', installmentsFixRouter);
apiApp.use('/api/accounts-receivable', accountsFixRouter);

// 3. Clients
apiApp.use('/api/clients', clientsFixRouter);

console.log('✅ Core Modules (Auth, Financial, Clients) Mounted.');

// --- LEGACY/OTHER ROUTES SETUP ---
// We use a try-catch block for legacy setups to prevent crashes
try {
    setupSalesRoutes(apiApp);
    console.log('✅ Sales Routes Mounted');
} catch (e) {
    console.error('⚠️ Sales Routes Error:', e.message);
}

try {
    setupProductsRoutes(apiApp);
    console.log('✅ Products Routes Mounted');
} catch (e) {
    console.error('⚠️ Products Routes Error:', e.message);
}

// Enhanced Routes (Be careful with conflicts, we neutralized clients/installments there)
try {
    apiApp.use('/', enhancedRoutes);
    console.log('✅ Enhanced Routes Mounted (Legacy Fallback)');
} catch (e) {
    console.error('⚠️ Enhanced Routes Error:', e.message);
}

// --- HEALTH CHECK ---
apiApp.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date(), version: 'FIXED-FINAL' });
});

// --- SERVER START ---
const httpServer = http.createServer(apiApp);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

httpServer.listen(PORT, () => {
    console.log(\`🚀 Server running on port \${PORT}\`);
    console.log('✅ SYSTEM FULLY OPERATIONAL');
});
`;

const conn = new Client();
conn.on("ready", () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        const remotePath = '/var/www/cocolu-chatbot/app-integrated.js';
        const writeStream = sftp.createWriteStream(remotePath);

        writeStream.on('close', () => {
            console.log("✅ File uploaded successfully");

            // Now restart PM2
            conn.exec('pm2 restart cocolu-dashoffice && sleep 5 && pm2 list && pm2 logs cocolu-dashoffice --lines 20 --nostream', (err, stream) => {
                if (err) throw err;
                stream.on('data', (d) => console.log(d.toString()));
                stream.on('close', () => {
                    console.log("✅ Server Restarted");
                    conn.end();
                });
            });
        });

        writeStream.end(cleanAppCode);
    });
}).connect(config);
