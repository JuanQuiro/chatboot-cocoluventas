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

console.log("🔥 UPLOADING ALL FIX MODULES (SFTP)...");

// --- CONTENIDO DE LOS ARCHIVOS ---

const INSTALLMENTS_CODE = `
import Database from 'better-sqlite3';
import { Router } from 'express';

const router = Router();
const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';

// Helper
function getDb() {
    return new Database(DB_PATH);
}

// GET / - Listado
router.get('/', (req, res) => {
    let db = null;
    try {
        db = getDb();
        const { status = 'all', page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM installments';
        let countQuery = 'SELECT COUNT(*) as total FROM installments';
        const params = [];

        if (status !== 'all') {
            query += ' WHERE status = ?';
            countQuery += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY due_date ASC LIMIT ? OFFSET ?';
        
        const data = db.prepare(query).all(...params, limit, offset);
        const total = db.prepare(countQuery).get(...params).total;
        
        res.json({
            data,
            meta: { total, page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        console.error('[INSTALLMENTS] Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

// GET /stats
router.get('/stats', (req, res) => {
    res.json({
        total_pending: 0,
        amount_pending: 0,
        overdue_count: 0,
        collected_month: 0
    });
});

export default router;
`;

const ACCOUNTS_CODE = `
import Database from 'better-sqlite3';
import { Router } from 'express';

const router = Router();
const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';

function getDb() { return new Database(DB_PATH); }

// GET / - Listado
router.get('/', (req, res) => {
    let db = null;
    try {
        db = getDb();
        const { search, page = 1, limit = 15 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM accounts';
        let countQuery = 'SELECT COUNT(*) as total FROM accounts';
        const params = [];

        if (search) {
            query += ' WHERE name LIKE ?';
            countQuery += ' WHERE name LIKE ?';
            params.push(\`%\${search}%\`);
        }

        query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
        
        const data = db.prepare(query).all(...params, limit, offset);
        const total = db.prepare(countQuery).get(...params).total;
        
        res.json({
            data,
            meta: { total, page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        console.error('[ACCOUNTS] Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

// GET /stats
router.get('/stats', (req, res) => {
    res.json({
        summary: {
            total_receivable: 0,
            overdue_amount: 0,
            collectable_today: 0
        },
        recent_transactions: []
    });
});

export default router;
`;

const CLIENTS_CODE = `
import Database from 'better-sqlite3';
import { Router } from 'express';

const router = Router();
const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';

function getDb() { return new Database(DB_PATH); }

// GET / - Listado
router.get('/', (req, res) => {
    let db = null;
    try {
        db = getDb();
        const { search, page = 1, limit = 50 } = req.query;
        const offset = (page > 0 ? page - 1 : 0) * (limit > 0 ? limit : 50);

        let query = 'SELECT * FROM clientes';
        let countQuery = 'SELECT COUNT(*) as total FROM clientes';
        const params = [];

        if (search) {
            query += ' WHERE nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ?';
            countQuery += ' WHERE nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ?';
            const term = \`%\${search}%\`;
            params.push(term, term, term);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        
        const safeLimit = limit > 0 ? limit : 50;
        const data = db.prepare(query).all(...params, safeLimit, offset);
        const total = db.prepare(countQuery).get(...params).total;
        
        res.json({
            data,
            meta: { total, page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        console.error('[CLIENTS] Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

// POST / - Crear
router.post('/', (req, res) => {
    console.log('📝 [FIX] Creating client:', req.body);
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
                console.log("✅ All files uploaded");
                conn.exec('pm2 restart cocolu-dashoffice && sleep 5 && pm2 list && pm2 logs cocolu-dashoffice --lines 20 --nostream', (err, stream) => {
                    stream.on('data', (d) => console.log(d.toString()));
                    stream.on('close', () => conn.end());
                });
            }
        }

        // 1. Installments
        const s1 = sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/installments-fix.routes.js');
        s1.on('close', checkDone);
        s1.end(INSTALLMENTS_CODE);

        // 2. Accounts
        const s2 = sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/accounts-fix.routes.js');
        s2.on('close', checkDone);
        s2.end(ACCOUNTS_CODE);

        // 3. Clients
        const s3 = sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/clients-fix.routes.js');
        s3.on('close', checkDone);
        s3.end(CLIENTS_CODE);
    });
}).connect(config);
