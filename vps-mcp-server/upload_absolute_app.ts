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

console.log("🔥 UPLOADING APP WITH ABSOLUTE PATHS...");

// APP-INTEGRATED.JS CON RUTAS ABSOLUTAS
const cleanAppCode = `
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// --- ABSOLUTE IMPORTS (NO AMBIGUITY) ---
import authSimpleRouter from '/var/www/cocolu-chatbot/src/api/auth-simple.routes.js';
import installmentsFixRouter from '/var/www/cocolu-chatbot/src/api/installments-fix.routes.js';
import accountsFixRouter from '/var/www/cocolu-chatbot/src/api/accounts-fix.routes.js';
import clientsFixRouter from '/var/www/cocolu-chatbot/src/api/clients-fix.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiApp = express();
const PORT = 3009;

// --- MIDDLEWARE ---
apiApp.use(cors({
    origin: ['https://cocolu.emberdrago.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

apiApp.use(express.json());
apiApp.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
console.log('🚀 Mounting Core Routes...');

// 1. Auth
apiApp.use('/api', authSimpleRouter); 

// 2. Financial
apiApp.use('/api/installments', installmentsFixRouter);
apiApp.use('/api/accounts-receivable', accountsFixRouter);

// 3. Clients
apiApp.use('/api/clients', clientsFixRouter);

// Legacy routes disabled
// import enhancedRoutes from './src/api/enhanced-routes.js';
// try { apiApp.use('/', enhancedRoutes); } catch(e) {}

console.log('✅ Core Routes Mounted (Absolute Paths).');

// --- HEALTH CHECK ---
apiApp.get('/health', (req, res) => {
    res.json({ status: 'ok', mode: 'ABSOLUTE_PATHS', timestamp: new Date() });
});

// --- SERVER START ---
const httpServer = http.createServer(apiApp);
const io = new Server(httpServer, {
    cors: { origin: "*" }
});

httpServer.listen(PORT, () => {
    console.log(\`🚀 Server running on port \${PORT}\`);
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

            // Permissions and Restart
            conn.exec('chmod -R 755 /var/www/cocolu-chatbot/src/api && pm2 restart cocolu-dashoffice && sleep 5 && pm2 list && pm2 logs cocolu-dashoffice --lines 20 --nostream', (err, stream) => {
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
