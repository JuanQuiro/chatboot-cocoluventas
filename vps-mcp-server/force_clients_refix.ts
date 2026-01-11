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

console.log("🔥 RE-APLICANDO FIX CLIENTES (FORZADO)...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot/src/api

# 1. Asegurar contenido de clients-fix.routes.js
cat > clients-fix.routes.js << 'ENDCLIENTS'
import Database from 'better-sqlite3';
import { Router } from 'express';

const router = Router();
const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';

function getDb() {
    return new Database(DB_PATH);
}

// GET /api/clients
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

// POST /api/clients
router.post('/', (req, res) => {
    console.log('📝 [CLIENTS FIX] Creating client:', req.body);
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

        // Check duplicado
        const existing = db.prepare('SELECT id FROM clientes WHERE cedula = ?').get(cedula);
        if (existing) {
            return res.status(409).json({ error: 'Ya existe un cliente con esta cédula' });
        }

        // Fix Ciudad
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
ENDCLIENTS

echo "✅ Router clients-fix actualizado"

cd /var/www/cocolu-chatbot

echo "=== FORZAR INTEGRACION EN APP-INTEGRATED ==="
# Eliminar línea de import antigua por si acaso
sed -i '/clients-fix.routes.js/d' app-integrated.js

# Insertar import de nuevo (clean slate)
# Buscar imports de ruta financiera
LINE=\$(grep -n "import accountsFixRouter" app-integrated.js | head -1 | cut -d: -f1)
sed -i "\${LINE}a\\\\import clientsFixRouter from './src/api/clients-fix.routes.js';" app-integrated.js

echo "✅ Import reinfectado"

# Eliminar mount antiguo
sed -i "/apiApp.use('\/api\/clients', clientsFixRouter)/d" app-integrated.js

# Insertar mount de nuevo
LINE=\$(grep -n "apiApp.use('/api/accounts-receivable'" app-integrated.js | head -1 | cut -d: -f1)
sed -i "\${LINE}a\\\\        apiApp.use('/api/clients', clientsFixRouter);\\\\        console.log('✅ Clients fixed mounted');" app-integrated.js

echo "✅ Mount reinfectado"

echo "=== NEUTRALIZAR ENHANCED ROUTES (SOLO CLIENTES) ==="
# Es posible que enhanced-routes tenga rutas de clientes activas.
# Vamos a renombrarlas/comentarlas si existen.
sed -i 's|app.get.*api.*clients|// &|g' src/api/enhanced-routes.js
sed -i 's|app.post.*api.*clients|// &|g' src/api/enhanced-routes.js

echo "✅ Enhanced routes (clientes) neutralizadas"

echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 5

echo "✅ Listo"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Re-Fix Finalizado");
            conn.end();
        });
    });
}).connect(config);
