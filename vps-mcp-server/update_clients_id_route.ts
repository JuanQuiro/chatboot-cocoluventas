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

console.log("🔥 UPDATING CLIENTS FIX (Adding GET /:id)...");

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
        let { search, page = 1, limit = 50 } = req.query;
        let isUnlimited = (limit === '-1' || limit === -1);
        if (isUnlimited) {
            limit = -1; page = 1;
        } else {
            limit = parseInt(limit) || 50;
            page = parseInt(page) || 1;
            if (page < 1) page = 1;
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
        res.json({ data, meta: { total, page, limit } });
    } catch (error) {
        console.error('[CLIENTS] Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

// GET /:id - Obtener Cliente por ID
router.get('/:id', (req, res) => {
    let db = null;
    try {
        db = getDb();
        const { id } = req.params;
        const client = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);

        if (!client) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        res.json(client);
    } catch (error) {
        console.error('[CLIENTS GET ONE] Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

// POST / - Crear
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
        if (db.prepare('SELECT id FROM clientes WHERE cedula = ?').get(cedula)) {
            return res.status(409).json({ error: 'Cliente existe' });
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

const conn = new Client();
conn.on("ready", () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;
        const s = sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/clients-fix.routes.js');
        s.on('close', () => {
            console.log("✅ Update Uploaded. Restarting...");
            conn.exec('pm2 restart cocolu-dashoffice && sleep 3 && pm2 list', (err, stream) => {
                stream.on('data', d => console.log(d.toString()));
                stream.on('close', () => conn.end());
            });
        });
        s.end(CLIENTS_CODE);
    });
}).connect(config);
