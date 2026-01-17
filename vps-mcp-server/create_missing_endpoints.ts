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
    readyTimeout: 90000,
};

console.log("🛠️ CREANDO ENDPOINTS FALTANTES COMPLETOS...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# 1. CREAR TABLAS EN BASE DE DATOS
echo "📊 Creando tablas..."
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db << 'EOF'
-- Tabla de cuentas por cobrar
CREATE TABLE IF NOT EXISTS cuentas_por_cobrar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    client_name TEXT,
    amount REAL DEFAULT 0,
    balance REAL DEFAULT 0,
    due_date TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cuotas/installments
CREATE TABLE IF NOT EXISTS cuotas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cuenta_id INTEGER,
    client_name TEXT,
    amount REAL DEFAULT 0,
    due_date TEXT,
    status TEXT DEFAULT 'pending',
    paid_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cuenta_id) REFERENCES cuentas_por_cobrar(id)
);

-- Insertar datos de ejemplo
INSERT OR IGNORE INTO cuentas_por_cobrar (id, client_name, amount, balance, due_date, status)
VALUES (1, 'Juan Pérez', 500.00, 200.00, '2026-01-15', 'partial');

INSERT OR IGNORE INTO cuotas (id, cuenta_id, client_name, amount, due_date, status)
VALUES (1, 1, 'Juan Pérez', 100.00, '2026-01-15', 'pending');

SELECT 'Tablas creadas correctamente' as status;
EOF

# 2. CREAR RUTAS DE ACCOUNTS RECEIVABLE
echo ""
echo "📝 Creando accounts-receivable.routes.js..."
cat > /var/www/cocolu-chatbot/src/api/accounts-receivable.routes.js << 'EOF'
import express from 'express';
import Database from 'better-sqlite3';

const router = express.Router();

// GET /api/accounts-receivable - Lista de cuentas por cobrar
router.get('/', async (req, res) => {
    try {
        const { search = '', page = 1, limit = 15 } = req.query;
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
        
        let query = 'SELECT * FROM cuentas_por_cobrar WHERE 1=1';
        const params = [];
        
        if (search) {
            query += ' AND client_name LIKE ?';
            params.push(\`%\${search}%\`);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        
        const accounts = db.prepare(query).all(...params);
        const total = db.prepare('SELECT COUNT(*) as count FROM cuentas_por_cobrar').get().count;
        
        db.close();
        
        res.json({
            success: true,
            data: accounts,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error en accounts-receivable:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/accounts-receivable/stats - Estadísticas
router.get('/stats', async (req, res) => {
    try {
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
        
        const stats = {
            total_accounts: db.prepare('SELECT COUNT(*) as count FROM cuentas_por_cobrar').get().count,
            total_amount: db.prepare('SELECT SUM(amount) as sum FROM cuentas_por_cobrar').get().sum || 0,
            total_balance: db.prepare('SELECT SUM(balance) as sum FROM cuentas_por_cobrar').get().sum || 0,
            pending: db.prepare("SELECT COUNT(*) as count FROM cuentas_por_cobrar WHERE status = 'pending'").get().count,
            partial: db.prepare("SELECT COUNT(*) as count FROM cuentas_por_cobrar WHERE status = 'partial'").get().count,
            paid: db.prepare("SELECT COUNT(*) as count FROM cuentas_por_cobrar WHERE status = 'paid'").get().count
        };
        
        db.close();
        
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error en accounts-receivable/stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
EOF

# 3. CREAR RUTAS DE INSTALLMENTS
echo ""
echo "📝 Creando installments.routes.js..."
cat > /var/www/cocolu-chatbot/src/api/installments.routes.js << 'EOF'
import express from 'express';
import Database from 'better-sqlite3';

const router = express.Router();

// GET /api/installments - Lista de cuotas
router.get('/', async (req, res) => {
    try {
        const { status = 'all', start_date = '', end_date = '', page = 1, limit = 50 } = req.query;
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
        
        let query = 'SELECT * FROM cuotas WHERE 1=1';
        const params = [];
        
        if (status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }
        
        if (start_date) {
            query += ' AND date(due_date) >= date(?)';
            params.push(start_date);
        }
        
        if (end_date) {
            query += ' AND date(due_date) <= date(?)';
            params.push(end_date);
        }
        
        query += ' ORDER BY due_date DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        
        const installments = db.prepare(query).all(...params);
        const total = db.prepare('SELECT COUNT(*) as count FROM cuotas').get().count;
        
        db.close();
        
        res.json({
            success: true,
            data: installments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error en installments:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/installments/stats - Estadísticas de cuotas
router.get('/stats', async (req, res) => {
    try {
        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
        
        const stats = {
            total_installments: db.prepare('SELECT COUNT(*) as count FROM cuotas').get().count,
            total_amount: db.prepare('SELECT SUM(amount) as sum FROM cuotas').get().sum || 0,
            pending: db.prepare("SELECT COUNT(*) as count FROM cuotas WHERE status = 'pending'").get().count,
            paid: db.prepare("SELECT COUNT(*) as count FROM cuotas WHERE status = 'paid'").get().count,
            overdue: db.prepare("SELECT COUNT(*) as count FROM cuotas WHERE status = 'pending' AND date(due_date) < date('now')").get().count
        };
        
        db.close();
        
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error en installments/stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
EOF

# 4. REGISTRAR EN APP-INTEGRATED.JS
echo ""
echo "📝 Registrando rutas en app-integrated.js..."
# Buscar línea de sellersRoutes y añadir después
sed -i "/apiApp.use('\/api\/sellers', sellersRoutes);/a\\
import accountsReceivableRoutes from './src/api/accounts-receivable.routes.js';\\
import installmentsRoutes from './src/api/installments.routes.js';\\
apiApp.use('/api/accounts-receivable', accountsReceivableRoutes);\\
apiApp.use('/api/installments', installmentsRoutes);" /var/www/cocolu-chatbot/app-integrated.js

# 5. REINICIAR PM2
echo ""
echo "🔄 Reiniciando PM2..."
pm2 restart cocolu-dashoffice

sleep 5

# 6. VERIFICAR ENDPOINTS
echo ""
echo "✅ VERIFICANDO ENDPOINTS..."
echo ""
echo "1. accounts-receivable:"
curl -s http://localhost:3009/api/accounts-receivable | head -n 10

echo ""
echo "2. accounts-receivable/stats:"
curl -s http://localhost:3009/api/accounts-receivable/stats

echo ""
echo "3. installments:"
curl -s "http://localhost:3009/api/installments?status=all" | head -n 10

echo ""
echo "4. installments/stats:"
curl -s http://localhost:3009/api/installments/stats

echo ""
echo "========================================="
echo "✅ TODOS LOS ENDPOINTS CREADOS"
echo "========================================="
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
