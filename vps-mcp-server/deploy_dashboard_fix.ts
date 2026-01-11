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

console.log("🔥 DEPLOYING DASHBOARD FIX...");

// --- DASHBOARD FIX MODULE ---
const DASHBOARD_CODE = `
import Database from 'better-sqlite3';
import { Router } from 'express';

const router = Router();
const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';

function getDb() { return new Database(DB_PATH); }

// GET / - Dashboard Stats
router.get('/', (req, res) => {
    let db = null;
    try {
        db = getDb();
        
        // 1. Total Sales (Today & Month)
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date().toISOString().slice(0, 7) + '-01';
        
        const salesToday = db.prepare('SELECT SUM(total_usd) as total FROM pedidos WHERE date(fecha_pedido) = ?').get(today).total || 0;
        const salesMonth = db.prepare('SELECT SUM(total_usd) as total FROM pedidos WHERE date(fecha_pedido) >= ?').get(monthStart).total || 0;
        
        // 2. Active Clients
        const activeClients = db.prepare('SELECT COUNT(*) as total FROM clientes').get().total || 0;
        
        // 3. Low Stock Products (Warning < 5)
        const lowStock = db.prepare('SELECT COUNT(*) as total FROM productos WHERE stock_actual < 5').get().total || 0;
        
        // 4. Products Count
        const totalProducts = db.prepare('SELECT COUNT(*) as total FROM productos').get().total || 0;
        
        // 5. Recent Orders (Last 5)
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
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

// Alias for specific stats if frontend requests them explicitly
router.get('/stats', (req, res) => {
    // Redirect logic to main handler
    res.redirect('/api/dashboard');
});

export default router;
`;

// --- MOUNT SCRIPT ---
const MOUNT_CMD = `
cd /var/www/cocolu-chatbot

# 1. Check if file exists, if not create empty
touch src/api/dashboard-fix.routes.js

# 2. Add import to app-integrated.js
if ! grep -q "dashboard-fix.routes.js" app-integrated.js; then
     sed -i "14i import dashboardFixRouter from '/var/www/cocolu-chatbot/src/api/dashboard-fix.routes.js';" app-integrated.js
fi

# 3. Mount route
if ! grep -q "/api/dashboard" app-integrated.js; then
     LINE=$(grep -n "apiApp.use('/api/sales'" app-integrated.js | head -1 | cut -d: -f1)
     sed -i "\${LINE}a\\\\apiApp.use('/api/dashboard', dashboardFixRouter);" app-integrated.js
fi

echo "✅ App Updated. Restarting..."
chmod 755 src/api/dashboard-fix.routes.js
pm2 restart cocolu-dashoffice && sleep 3 && pm2 list
`;

const conn = new Client();
conn.on("ready", () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        const s = sftp.createWriteStream('/var/www/cocolu-chatbot/src/api/dashboard-fix.routes.js');
        s.on('close', () => {
            console.log("✅ Dashboard Module Uploaded. Mounting...");
            conn.exec(MOUNT_CMD, (err, stream) => {
                if (err) throw err;
                stream.on('data', d => console.log(d.toString()));
                stream.on('close', () => conn.end());
            });
        });
        s.end(DASHBOARD_CODE);
    });
}).connect(config);
