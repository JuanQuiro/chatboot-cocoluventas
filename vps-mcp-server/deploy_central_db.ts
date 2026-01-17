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

console.log("🔥 DEPLOYING CENTRAL DB SINGLETON...");

const DB_LIB_CODE = `
import Database from 'better-sqlite3';

const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';
let dbInstance = null;

/**
 * Returns a singleton database connection.
 * Enables WAL mode for high concurrency performance.
 */
export function getDb() {
    if (dbInstance) return dbInstance;
    
    try {
        dbInstance = new Database(DB_PATH, { timeout: 10000 }); // 10s wait for locks
        dbInstance.pragma('journal_mode = WAL'); // Write-Ahead Logging for concurrency
        dbInstance.pragma('synchronous = NORMAL'); // Balance between safety and speed
        console.log('[DB] Connection initialized (WAL Mode Activated)');
        return dbInstance;
    } catch (err) {
        console.error('[DB] CRITICAL: Connection Failed:', err);
        throw err;
    }
}
`;

// We also need to refactor dashboard-fix to use this new lib to test it.
const DASHBOARD_REFACTORED = `
import { Router } from 'express';
// Import from the new singleton
import { getDb } from './lib/db.js';

const router = Router();

// GET / - Dashboard Stats 
router.get('/', (req, res) => {
    try {
        // Use singleton DB (no try/catch closing needed for connection, only logic)
        const db = getDb();
        
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date().toISOString().slice(0, 7) + '-01';
        
        const salesToday = db.prepare('SELECT SUM(total_usd) as total FROM pedidos WHERE date(fecha_pedido) = ?').get(today).total || 0;
        const salesMonth = db.prepare('SELECT SUM(total_usd) as total FROM pedidos WHERE date(fecha_pedido) >= ?').get(monthStart).total || 0;
        const activeClients = db.prepare('SELECT COUNT(*) as total FROM clientes').get().total || 0;
        const lowStock = db.prepare('SELECT COUNT(*) as total FROM productos WHERE stock_actual < 5').get().total || 0;
        const totalProducts = db.prepare('SELECT COUNT(*) as total FROM productos').get().total || 0;
        const recentOrders = db.prepare('SELECT id, cliente_nombre, total_usd, estado_entrega, created_at FROM pedidos ORDER BY created_at DESC LIMIT 5').all();

        res.json({
            success: true,
            data: {
                sales_today: salesToday,
                sales_month: salesMonth,
                active_clients: activeClients,
                products_total: totalProducts,
                low_stock: lowStock,
                recent_orders: recentOrders
            }
        });

    } catch (error) {
        console.error('[DASHBOARD] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/stats', (req, res) => res.redirect('/api/dashboard'));

export default router;
`;

const conn = new Client();
conn.on("ready", () => {
    conn.exec('mkdir -p /var/www/cocolu-chatbot/src/api/lib', (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
            conn.sftp((err, sftp) => {
                if (err) throw err;
                let pending = 2;
                function check() {
                    pending--;
                    if (pending === 0) {
                        console.log("✅ DB Lib & Dashboard Refactor Uploaded. Restarting...");
                        // Need valid verify command
                        conn.exec('pm2 restart cocolu-dashoffice && sleep 3 && pm2 list', (err, stream) => {
                            stream.on('data', d => console.log(d.toString()));
                            stream.on('close', () => conn.end());
                        });
                    }
                }

                sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/lib/db.js').end(DB_LIB_CODE, check);
                sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/dashboard-fix.routes.js').end(DASHBOARD_REFACTORED, check);
            });
        });
    });
}).connect(config);
