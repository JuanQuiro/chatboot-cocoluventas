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

console.log("🔧 FIX: Módulos Financieros (Installments & Accounts)...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot/src/api

# 1. Crear installments-fix.routes.js
cat > installments-fix.routes.js << 'ENDINSTALL'
import Database from 'better-sqlite3';
import { Router } from 'express';

const router = Router();
const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';

// GET /api/installments
router.get('/', (req, res) => {
    let db = null;
    try {
        db = new Database(DB_PATH);
        const { status, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        // Construir query dinámica
        let query = 'SELECT * FROM installments';
        let countQuery = 'SELECT COUNT(*) as total FROM installments';
        const params = [];
        
        if (status && status !== 'all') {
            query += ' WHERE status = ?';
            countQuery += ' WHERE status = ?';
            params.push(status);
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
        console.error('[INSTALLMENTS] Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

// GET /api/installments/stats
router.get('/stats', (req, res) => {
    let db = null;
    try {
        db = new Database(DB_PATH);
        
        const stats = db.prepare(\`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue,
                SUM(amount) as total_amount
            FROM installments
        \`).get();
        
        res.json(stats);
    } catch (error) {
        console.error('[INSTALLMENTS STATS] Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (db) try { db.close(); } catch(e) {}
    }
});

export default router;
ENDINSTALL


# 2. Crear accounts-fix.routes.js
cat > accounts-fix.routes.js << 'ENDACCOUNTS'
import Database from 'better-sqlite3';
import { Router } from 'express';

const router = Router();
const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';

// GET /api/accounts-receivable/stats
router.get('/stats', (req, res) => {
    let db = null;
    try {
        db = new Database(DB_PATH);
        
        // Calcular stats basándose en las tablas existentes
        const stats = db.prepare(\`
            SELECT 
                COUNT(*) as total_accounts,
                SUM(balance) as total_receivable
            FROM accounts
        \`).get() || { total_accounts: 0, total_receivable: 0 };
        
        // Obtener transacciones recientes (mock empty por ahora si tabla no existe)
        const recent = []; 

        res.json({
            summary: {
                total_receivable: stats.total_receivable || 0,
                overdue_amount: 0, // Implementar logica real luego
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

echo "✅ Routes creadas"

cd /var/www/cocolu-chatbot

echo "=== INTEGRAR EN APP ==="

# 1. Imports
# Insertar imports después de authSimpleRouter
LINE=\$(grep -n "import authSimpleRouter" app-integrated.js | head -1 | cut -d: -f1)
if [ -n "\$LINE" ]; then
    sed -i "\${LINE}a\\\\import installmentsFixRouter from './src/api/installments-fix.routes.js';\\\\import accountsFixRouter from './src/api/accounts-fix.routes.js';" app-integrated.js
    echo "✅ Imports agregados"
fi

# 2. Mounts
# Comentar usos anteriores de estas rutas para evitar conflictos
sed -i 's/apiApp.use.*installments/# &/' app-integrated.js
sed -i 's/apiApp.use.*accounts-receivable/# &/' app-integrated.js

# Montar nuevos routers
LINE=\$(grep -n "apiApp.use('/api/auth'" app-integrated.js | head -1 | cut -d: -f1)
if [ -n "\$LINE" ]; then
    sed -i "\${LINE}a\\\\        apiApp.use('/api/installments', installmentsFixRouter);\\\\        apiApp.use('/api/accounts-receivable', accountsFixRouter);\\\\        console.log('✅ Financial fix routes mounted');" app-integrated.js
    echo "✅ Routers montados"
fi

echo ""
echo "=== SINTAXIS CHECK ==="
node --check app-integrated.js && echo "✅ OK" || echo "❌ ERROR"

echo ""
echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 10

echo ""
echo "=== TEST ENDPOINTS ==="
echo "Installments:"
curl -s http://127.0.0.1:3009/api/installments | head -c 100
echo ""
echo "Accounts Stats:"
curl -s http://127.0.0.1:3009/api/accounts-receivable/stats | head -c 100

echo ""
echo ""
echo "🎉 FIX FINALIZADO"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Proceso completado");
            conn.end();
        });
    });
}).connect(config);
