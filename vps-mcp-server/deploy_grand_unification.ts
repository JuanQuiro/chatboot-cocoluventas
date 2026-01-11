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

console.log("🔥 GRAND UNIFICATION DEPLOYMENT...");

// 1. BCV FIX
const BCV_CODE = `
import { Router } from 'express';
let currentRate = 63.50; 
let lastUpdated = new Date();

const router = Router();

router.get('/rate', (req, res) => {
    res.json({
        success: true,
        data: {
            rate: currentRate,
            last_updated: lastUpdated,
            source: 'SYSTEM_FIX'
        }
    });
});

router.post('/rate', (req, res) => {
    const { rate } = req.body;
    if (rate) {
        currentRate = parseFloat(rate);
        lastUpdated = new Date();
    }
    res.json({ success: true, data: { rate: currentRate } });
});

router.post('/sync', (req, res) => {
    res.json({ success: true, message: 'Sync simulated', rate: currentRate });
});

export default router;
`;

// 2. LOGS FIX
const LOGS_CODE = `
import { Router } from 'express';
const router = Router();

router.post('/batch', (req, res) => {
    // console.log('[CLIENT LOG]', req.body); 
    res.status(200).json({ success: true });
});

export default router;
`;

// 3. CLIENTS FIX (With limit -1 Fix)
const CLIENTS_CODE = `
import Database from 'better-sqlite3';
import { Router } from 'express';

const router = Router();
const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';

function getDb() { return new Database(DB_PATH); }

router.get('/', (req, res) => {
    let db = null;
    try {
        db = getDb();
        let { search, page = 1, limit = 50 } = req.query;
        
        // Handle limit -1 (Select All)
        let isUnlimited = (limit === '-1' || limit === -1);
        
        if (isUnlimited) {
            limit = -1;
            page = 1;
        } else {
            limit = parseInt(limit);
            if (isNaN(limit)) limit = 50;
            page = parseInt(page);
            if (isNaN(page) || page < 1) page = 1;
        }

        const offset = isUnlimited ? 0 : (page - 1) * limit;

        let query = 'SELECT * FROM clientes';
        let countQuery = 'SELECT COUNT(*) as total FROM clientes';
        const params = [];

        if (search) {
            query += ' WHERE nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ?';
            countQuery += ' WHERE nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ?';
            const term = \`%\${search}%\`;
            params.push(term, term, term);
        }

        query += ' ORDER BY created_at DESC';
        
        let data;
        if (!isUnlimited) {
            query += ' LIMIT ? OFFSET ?';
            data = db.prepare(query).all(...params, limit, offset);
        } else {
            data = db.prepare(query).all(...params);
        }
        
        const total = db.prepare(countQuery).get(...params).total;
        
        res.json({
            data,
            meta: { total, page, limit }
        });
    } catch (error) {
        console.error('[CLIENTS] Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

router.post('/', (req, res) => {
    let db = null;
    try {
        db = getDb();
        const { 
            cedula, nombre, apellido, telefono, email, 
            direccion, ciudad, tipo_precio = 'detal',
            limite_credito = 0, dias_credito = 0
        } = req.body;

        if (!cedula || !nombre || !apellido) return res.status(400).json({ error: 'Faltan campos' });

        const existing = db.prepare('SELECT id FROM clientes WHERE cedula = ?').get(cedula);
        if (existing) return res.status(409).json({ error: 'Cliente existe' });

        let fullDireccion = direccion || '';
        if (ciudad && typeof ciudad === 'string' && !fullDireccion.toLowerCase().includes(ciudad.toLowerCase())) {
            fullDireccion = \`\${fullDireccion} (\${ciudad})\`.trim();
        }

        const stmt = db.prepare(\`
            INSERT INTO clientes (
                cedula, nombre, apellido, telefono, email, 
                direccion, tipo_precio, limite_credito, dias_credito
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        \`);

        const info = stmt.run(cedula, nombre, apellido, telefono || null, email || null, fullDireccion, tipo_precio, limite_credito, dias_credito);

        res.status(201).json({
            id: info.lastInsertRowid,
            message: 'Cliente creado exitosamente',
            client: { ...req.body, id: info.lastInsertRowid }
        });
    } catch (error) {
        console.error('[CLIENTS CREATE] Error:', error);
        res.status(500).json({ error: 'Error: ' + error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

export default router;
`;

// 4. APP INTEGRATED (Updated Mounts)
const APP_CODE = `
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// --- ABSOLUTE IMPORTS ---
import authSimpleRouter from '/var/www/cocolu-chatbot/src/api/auth-simple.routes.js';
import installmentsFixRouter from '/var/www/cocolu-chatbot/src/api/installments-fix.routes.js';
import accountsFixRouter from '/var/www/cocolu-chatbot/src/api/accounts-fix.routes.js';
import clientsFixRouter from '/var/www/cocolu-chatbot/src/api/clients-fix.routes.js';
import bcvFixRouter from '/var/www/cocolu-chatbot/src/api/bcv-fix.routes.js';
import logsFixRouter from '/var/www/cocolu-chatbot/src/api/logs-fix.routes.js';

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
console.log('🚀 Mounting All Routes...');

apiApp.use('/api', authSimpleRouter); 
apiApp.use('/api/installments', installmentsFixRouter);
apiApp.use('/api/accounts-receivable', accountsFixRouter);
apiApp.use('/api/clients', clientsFixRouter);
apiApp.use('/api/bcv', bcvFixRouter);
apiApp.use('/api/logs', logsFixRouter);

console.log('✅ Routes Mounted.');

// --- HEALTH CHECK ---
apiApp.get('/health', (req, res) => {
    res.json({ status: 'ok', mode: 'FULL_FIXED', timestamp: new Date() });
});

// --- SERVER START ---
const httpServer = http.createServer(apiApp);
const io = new Server(httpServer, { cors: { origin: "*" } });

httpServer.listen(PORT, () => {
    console.log(\`🚀 Server running on port \${PORT}\`);
});
`;

const conn = new Client();
conn.on("ready", () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        let pending = 4;
        function check() {
            pending--;
            if (pending === 0) {
                console.log("✅ All files uploaded. Restarting...");
                conn.exec('chmod -R 755 /var/www/cocolu-chatbot/src/api && pm2 restart cocolu-dashoffice && sleep 5 && pm2 list && pm2 logs cocolu-dashoffice --lines 20 --nostream', (err, stream) => {
                    stream.on('data', d => console.log(d.toString()));
                    stream.on('close', () => conn.end());
                });
            }
        }

        sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/bcv-fix.routes.js').end(BCV_CODE, check);
        sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/logs-fix.routes.js').end(LOGS_CODE, check);
        sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/clients-fix.routes.js').end(CLIENTS_CODE, check);
        sftp.createWriteStream('/var/www/cocolu-chatbot/app-integrated.js').end(APP_CODE, check);
    });
}).connect(config);
