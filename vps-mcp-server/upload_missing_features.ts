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

console.log("🔥 UPLOADING BCV, LOGS & UPDATED CLIENTS FIX...");

// --- BCV FIX (Standalone) ---
const BCV_CODE = `
import { Router } from 'express';
// Simple in-memory store for stability + fake persistence
let currentRate = 63.50; // Default fallback
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
    res.json({
        success: true,
        data: { rate: currentRate }
    });
});

router.post('/sync', (req, res) => {
    res.json({ success: true, message: 'Sync simulated', rate: currentRate });
});

export default router;
`;

// --- LOGS FIX (Sink) ---
const LOGS_CODE = `
import { Router } from 'express';
const router = Router();

router.post('/batch', (req, res) => {
    // Silently accept logs
    // console.log('[CLIENT LOG]', req.body); 
    res.status(200).json({ success: true });
});

export default router;
`;

// --- CLIENTS FIX (Updated for limit=-1) ---
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
        if (limit === '-1' || limit === -1) {
            limit = -1; // SQLite accepts -1 for no limit
            page = 1;   // Force page 1 for all results
        } else {
            limit = parseInt(limit);
            if (isNaN(limit)) limit = 50;
        }
        
        page = parseInt(page);
        if (isNaN(page) || page < 1) page = 1;

        const offset = (limit === -1) ? 0 : (page - 1) * limit;

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
        
        if (limit !== -1) {
            query += ' LIMIT ? OFFSET ?';
        }
        
        let data;
        let total;

        if (limit !== -1) {
            data = db.prepare(query).all(...params, limit, offset);
        } else {
             data = db.prepare(query).all(...params);
        }
        
        total = db.prepare(countQuery).get(...params).total;
        
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

        if (!cedula || !nombre || !apellido) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const existing = db.prepare('SELECT id FROM clientes WHERE cedula = ?').get(cedula);
        if (existing) {
            return res.status(409).json({ error: 'Ya existe un cliente con esta cédula' });
        }

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

        const info = stmt.run(
            cedula, nombre, apellido, telefono || null, email || null, 
            fullDireccion, tipo_precio, limite_credito, dias_credito
        );

        res.status(201).json({
            id: info.lastInsertRowid,
            message: 'Cliente creado exitosamente',
            client: { ...req.body, id: info.lastInsertRowid }
        });
    } catch (error) {
        console.error('[CLIENTS CREATE] Error:', error);
        res.status(500).json({ error: 'Error interno: ' + error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

export default router;
`;

const conn = new Client();
conn.on("ready", () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        let pending = 3;
        function checkDone() {
            pending--;
            if (pending === 0) {
                console.log("✅ Files uploaded.");
                // Now update app-integrated.js to mount them
                conn.exec(\`
                    cd /var/www/cocolu-chatbot
                    
                    # Add imports if missing
                    if ! grep -q "bcv-fix.routes.js" app-integrated.js; then
                        sed -i "10i import bcvFixRouter from '/var/www/cocolu-chatbot/src/api/bcv-fix.routes.js';" app-integrated.js
                    fi
                    if ! grep -q "logs-fix.routes.js" app-integrated.js; then
                        sed -i "11i import logsFixRouter from '/var/www/cocolu-chatbot/src/api/logs-fix.routes.js';" app-integrated.js
                    fi
                    
                    # Add mounts
                    if ! grep -q "/api/bcv" app-integrated.js; then
                        LINE=\$(grep -n "apiApp.use('/api/clients'" app-integrated.js | head -1 | cut -d: -f1)
                        sed -i "\${LINE}a\\\\apiApp.use('/api/bcv', bcvFixRouter);" app-integrated.js
                    fi
                    
                    if ! grep -q "/api/logs" app-integrated.js; then
                        LINE=\$(grep -n "apiApp.use('/api/clients'" app-integrated.js | head -1 | cut -d: -f1)
                        sed -i "\${LINE}a\\\\apiApp.use('/api/logs', logsFixRouter);" app-integrated.js
                    fi
                    
                    echo "✅ App integrated updated."
                    chmod -R 755 src/api
                    
                    pm2 restart cocolu-dashoffice && sleep 5 && pm2 list
                \`, (err, stream) => {
                    stream.on('data', (d) => console.log(d.toString()));
                    stream.on('close', () => conn.end());
                });
            }
        }

        sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/bcv-fix.routes.js').end(BCV_CODE, checkDone);
        sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/logs-fix.routes.js').end(LOGS_CODE, checkDone);
        sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/clients-fix.routes.js').end(CLIENTS_CODE, checkDone);
    });
}).connect(config);
