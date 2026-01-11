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

console.log("🚑 RE-CREANDO CLIENTS-FIX.ROUTES.JS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot/src/api

# Re-crear el archivo porque parece que no existe o se borró
cat > clients-fix.routes.js << 'EOF'
import Database from 'better-sqlite3';
import { Router } from 'express';

const router = Router();
const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';

function getDb() {
    return new Database(DB_PATH);
}

// GET /api/clients - Búsqueda y Listado
router.get('/', (req, res) => {
    let db = null;
    try {
        db = getDb();
        const { search, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

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
        
        const data = db.prepare(query).all(...params, limit, offset);
        const total = db.prepare(countQuery).get(...params).total;
        
        res.json({
            data,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('[CLIENTS LIST] Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

// POST /api/clients - Crear Cliente (Robust)
router.post('/', (req, res) => {
    console.log('📝 [FIX] Creating client:', req.body);
    let db = null;
    try {
        db = getDb();
        const { 
            cedula, 
            nombre, 
            apellido, 
            telefono, 
            email, 
            direccion,
            ciudad, 
            tipo_precio = 'detal',
            limite_credito = 0,
            dias_credito = 0
        } = req.body;

        if (!cedula || !nombre || !apellido) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const existing = db.prepare('SELECT id FROM clientes WHERE cedula = ?').get(cedula);
        if (existing) {
            return res.status(409).json({ error: 'Ya existe un cliente con esta cédula' });
        }

        // Merge ciudad into direccion logic
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
            cedula, 
            nombre, 
            apellido, 
            telefono || null, 
            email || null, 
            fullDireccion, 
            tipo_precio, 
            limite_credito, 
            dias_credito
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
EOF

echo "✅ Archivo clients-fix.routes.js asegurado"

echo ""
echo "=== VERIFICAR ARCHIVO ==="
ls -l clients-fix.routes.js

echo ""
echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 8

echo ""
echo "=== STATUS CHECK ==="
pm2 list
pm2 logs cocolu-dashoffice --lines 15 --nostream
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Fix aplicado");
            conn.end();
        });
    });
}).connect(config);
