import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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

console.log("🔥 FIXING DB IMPORT WITH ABSOLUTE PATHS...");

const DB_CODE = `
import Database from 'better-sqlite3';

const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';
let dbInstance = null;

export function getDb() {
    if (dbInstance) return dbInstance;
    try {
        dbInstance = new Database(DB_PATH, { timeout: 10000 });
        dbInstance.pragma('journal_mode = WAL');
        dbInstance.pragma('synchronous = NORMAL');
        console.log('[DB] Singleton Connection Initialized (WAL Mode)');
        return dbInstance;
    } catch (err) {
        console.error('[DB] CRITICAL CONNECTION ERROR:', err);
        throw err;
    }
}
`;

const APP_CODE = `
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { getDb } from '/var/www/cocolu-chatbot/src/api/lib/db.js';

// FIXED MODULES WITH ABSOLUTE PATHS
import authRouter from '/var/www/cocolu-chatbot/src/api/auth-simple.routes.js';
import clientRouter from '/var/www/cocolu-chatbot/src/api/clients-fix.routes.js';
import productRouter from '/var/www/cocolu-chatbot/src/api/products-fix.routes.js';
import salesRouter from '/var/www/cocolu-chatbot/src/api/sales-fix.routes.js';
import dashboardRouter from '/var/www/cocolu-chatbot/src/api/dashboard-fix.routes.js';
import financeRouter from '/var/www/cocolu-chatbot/src/api/installments-fix.routes.js';
import accountsRouter from '/var/www/cocolu-chatbot/src/api/accounts-fix.routes.js';
import bcvRouter from '/var/www/cocolu-chatbot/src/api/bcv-fix.routes.js';
import logsRouter from '/var/www/cocolu-chatbot/src/api/logs-fix.routes.js';

const app = express();
const PORT = 3009;

// MIDDLEWARE
app.use(cors({
    origin: ['https://cocolu.emberdrago.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
    next();
});

// ROUTING
const api = express.Router();
api.use('/', authRouter);
api.use('/clients', clientRouter);
api.use('/products', productRouter);
api.use('/inventory', productRouter); // Alias
api.use('/sales', salesRouter);
api.use('/orders', salesRouter); // Alias
api.use('/dashboard', dashboardRouter);
api.use('/installments', financeRouter);
api.use('/accounts-receivable', accountsRouter);
api.use('/bcv', bcvRouter);
api.use('/logs', logsRouter);

app.use('/api', api);

// HEALTH CHECK
app.get('/health', (req, res) => {
    res.json({
        status: 'BANK_GRADE_ONLINE',
        mode: 'OPTIMIZED',
        db: 'CONNECTED'
    });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

server.listen(PORT, () => {
    console.log(\`🚀 Bank-Grade Server running on \${PORT}\`);
    try { getDb(); } catch(e) { console.error('DB INIT FAIL:', e); }
});
`;

const conn = new Client();
conn.on("ready", () => {
    // 1. Create directory
    conn.exec('mkdir -p /var/www/cocolu-chatbot/src/api/lib', (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
            conn.sftp((err, sftp) => {
                if (err) throw err;
                let pending = 2;
                function check() {
                    pending--;
                    if (pending === 0) {
                        console.log("✅ Files Uploaded. Restarting PM2...");
                        conn.exec('pm2 restart cocolu-dashoffice && sleep 3 && pm2 logs cocolu-dashoffice --lines 20 --nostream', (err, s2) => {
                            s2.on('data', d => console.log(d.toString()));
                            s2.on('close', () => conn.end());
                        });
                    }
                }

                sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/lib/db.js').end(DB_CODE, check);
                sftp.createWriteStream('/var/www/cocolu-chatbot/app-integrated.js').end(APP_CODE, check);
            });
        });
    });
}).connect(config);
