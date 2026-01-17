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

console.log("🔥 UPLOADING PRODUCTS FIX MODULE...");

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
        let total;

        if (!isUnlimited) {
            data = db.prepare(query).all(...params, limit, offset);
        } else {
            data = db.prepare(query).all(...params);
        }
        
        total = db.prepare(countQuery).get(...params).total;

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

// GET /low-stock - (Legacy compatibility)
router.get('/low-stock', (req, res) => {
    res.json({ success: true, data: [] });
});

router.get('/stats', (req, res) => {
    res.json({ success: true, data: { total: 0, distinct: 0, total_value: 0 } });
});


export default router;
`;

const conn = new Client();
conn.on("ready", () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        const s = sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/products-fix.routes.js');
        s.on('close', () => {
            console.log("✅ Products Module Uploaded. Updating App Integration...");

            // Add Mount Command
            const updateCmd = \`
                cd /var/www/cocolu-chatbot
                
                # Add import if missing
                if ! grep -q "products-fix.routes.js" app-integrated.js; then
                     sed -i "12i import productsFixRouter from '/var/www/cocolu-chatbot/src/api/products-fix.routes.js';" app-integrated.js
                fi
                
                # Add mount if missing
                if ! grep -q "/api/products" app-integrated.js; then
                     LINE=\$(grep -n "apiApp.use('/api/clients'" app-integrated.js | head -1 | cut -d: -f1)
                     sed -i "\${LINE}a\\\\apiApp.use('/api/products', productsFixRouter);" app-integrated.js
                fi
                
                echo "✅ App Updated. Restarting..."
                chmod 755 src/api/products-fix.routes.js
                pm2 restart cocolu-dashoffice && sleep 3 && pm2 list
            \`;
            
            conn.exec(updateCmd, (err, stream) => {
               if (err) throw err;
               stream.on('data', d => console.log(d.toString()));
               stream.on('close', () => conn.end());
            });
        });
        s.end(PRODUCTS_CODE);
    });
}).connect(config);
