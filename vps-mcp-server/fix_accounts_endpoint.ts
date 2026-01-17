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

console.log("🔧 FIX: Agregando ruta raíz a accounts-fix.routes.js...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot/src/api

# Sobrescribir accounts-fix.routes.js con la ruta raíz agregada
cat > accounts-fix.routes.js << 'ENDACCOUNTS'
import Database from 'better-sqlite3';
import { Router } from 'express';

const router = Router();
const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';

// GET /api/accounts-receivable (LISTADO)
router.get('/', (req, res) => {
    let db = null;
    try {
        db = new Database(DB_PATH);
        const { search, page = 1, limit = 15 } = req.query;
        const offset = (page - 1) * limit;

        // Query base
        let query = 'SELECT * FROM accounts';
        let countQuery = 'SELECT COUNT(*) as total FROM accounts';
        const params = [];

        // Filtro de búsqueda (si aplica)
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
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('[ACCOUNTS LIST] Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

// GET /api/accounts-receivable/stats
router.get('/stats', (req, res) => {
    let db = null;
    try {
        db = new Database(DB_PATH);
        
        const stats = db.prepare(\`
            SELECT 
                COUNT(*) as total_accounts,
                SUM(balance) as total_receivable
            FROM accounts
        \`).get() || { total_accounts: 0, total_receivable: 0 };
        
        const recent = []; 

        res.json({
            summary: {
                total_receivable: stats.total_receivable || 0,
                overdue_amount: 0,
                collectable_today: 0
            },
            recent_transactions: recent
        });
    } catch (error) {
        console.error('[ACCOUNTS STATS] Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

export default router;
ENDACCOUNTS

echo "✅ Archivo actualizado"

echo ""
echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 5

echo ""
echo "=== VERIFICAR ENDPOINT ==="
curl -s http://127.0.0.1:3009/api/accounts-receivable | head -c 200
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Fix completado");
            conn.end();
        });
    });
}).connect(config);
