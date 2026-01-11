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

console.log("🔥 REDEPLOYING PRODUCTS FIX (GRAND UNIFICATION V2)...");

// --- PRODUCTS FIX MODULE ---
const PRODUCTS_CODE = `
import Database from 'better-sqlite3';
import { Router } from 'express';

const router = Router();
const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';

function getDb() { return new Database(DB_PATH); }

// GET / - List Products
router.get('/', (req, res) => {
    let db = null;
    try {
        db = getDb();
        let { search, page = 1, limit = 50 } = req.query;
        let isUnlimited = (limit === '-1' || limit === -1);
        
        if (isUnlimited) {
            limit = -1; page = 1;
        } else {
            limit = parseInt(limit) || 50;
            const p = parseInt(page) || 1;
            page = p < 1 ? 1 : p;
        }
        
        const offset = isUnlimited ? 0 : (page - 1) * limit;

        let query = 'SELECT * FROM productos WHERE activo = 1';
        let countQuery = 'SELECT COUNT(*) as total FROM productos WHERE activo = 1';
        const params = [];

        if (search) {
            query += ' AND (nombre LIKE ? OR sku LIKE ?)';
            countQuery += ' AND (nombre LIKE ? OR sku LIKE ?)';
            const term = \`%\${search}%\`;
            params.push(term, term);
        }

        query += ' ORDER BY created_at DESC';
        if (!isUnlimited) {
            query += ' LIMIT ? OFFSET ?';
        }

        let data;
        if (!isUnlimited) {
            data = db.prepare(query).all(...params, limit, offset);
        } else {
            data = db.prepare(query).all(...params);
        }
        
        const total = db.prepare(countQuery).get(...params).total;

        res.json({
            success: true,
            data,
            meta: { total, page, limit }
        });
    } catch (error) {
        console.error('[PRODUCTS] Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

// POST / - Create Product
router.post('/', (req, res) => {
    console.log('[PRODUCTS] Create request:', req.body);
    let db = null;
    try {
        db = getDb();
        // Support Spanish/English/Legacy mapping
        const nombre = req.body.nombre || req.body.name;
        const precio = req.body.precio_usd || req.body.costo || req.body.price || 0;
        const stock = req.body.stock_actual || req.body.cantidad || req.body.stock || 0;
        const sku = req.body.sku || req.body.codigo || null;
        const categoria_id = req.body.categoria_id || 1;

        if (!nombre) {
            return res.status(400).json({ error: 'Nombre del producto es requerido' });
        }

        // Generate SKU if missing
        let finalSku = sku;
        if (!finalSku) {
            const random = Math.floor(Math.random() * 90000) + 10000;
            finalSku = \`SKU-\${random}\`;
        }

        const stmt = db.prepare(\`
            INSERT INTO productos (
                sku, nombre, precio_usd, stock_actual, categoria_id, activo
            ) VALUES (?, ?, ?, ?, ?, 1)
        \`);
        
        const info = stmt.run(finalSku, nombre, precio, stock, categoria_id);

        res.status(201).json({
            success: true,
            id: info.lastInsertRowid,
            message: 'Producto creado exitosamente',
            data: { 
                id: info.lastInsertRowid,
                sku: finalSku,
                nombre,
                precio_usd: precio,
                stock_actual: stock
            }
        });

    } catch (error) {
        console.error('[PRODUCTS CREATE] Error:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'El SKU o Nombre ya existe' });
        }
        res.status(500).json({ error: 'Error interno: ' + error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

// Legacy /low-stock
router.get('/low-stock', (req, res) => {
    res.json({ success: true, data: [] });
});

router.get('/stats', (req, res) => {
    res.json({ success: true, data: { total: 0, distinct: 0, total_value: 0 } });
});

export default router;
`;

// --- UPDATED APP INTEGRATED ---
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
import productsFixRouter from '/var/www/cocolu-chatbot/src/api/products-fix.routes.js';

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
console.log('🚀 Mounting All Routes (Included Products)...');

apiApp.use('/api', authSimpleRouter); 
apiApp.use('/api/installments', installmentsFixRouter);
apiApp.use('/api/accounts-receivable', accountsFixRouter);
apiApp.use('/api/clients', clientsFixRouter);
apiApp.use('/api/bcv', bcvFixRouter);
apiApp.use('/api/logs', logsFixRouter);
apiApp.use('/api/products', productsFixRouter);

// Fallback for inventory alias (just in case)
apiApp.use('/api/inventory', productsFixRouter);

console.log('✅ Routes Mounted.');

// --- HEALTH CHECK ---
apiApp.get('/health', (req, res) => {
    res.json({ status: 'ok', mode: 'PRODUCTS_ADDED', timestamp: new Date() });
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

        let pending = 2;
        function check() {
            pending--;
            if (pending === 0) {
                console.log("✅ Files Uploaded. Restarting...");
                conn.exec('chmod -R 755 /var/www/cocolu-chatbot/src/api && pm2 restart cocolu-dashoffice && sleep 3 && pm2 list && pm2 logs cocolu-dashoffice --lines 20 --nostream', (err, stream) => {
                    stream.on('data', d => console.log(d.toString()));
                    stream.on('close', () => conn.end());
                });
            }
        }

        sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/products-fix.routes.js').end(PRODUCTS_CODE, check);
        sftp.createWriteStream('/var/www/cocolu-chatbot/app-integrated.js').end(APP_CODE, check);
    });
}).connect(config);
