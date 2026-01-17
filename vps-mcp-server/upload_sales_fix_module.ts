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

console.log("🛠️ CREATING SALES MODAL FIX MODULE...");

const conn = new Client();
conn.on("ready", () => {
    const fixModule = `
import { Database } from '../config/database.js'; // Adjust if needed

export const setupSalesModalFix = (app) => {
    console.log('✅ Registering Sales Modal Fix Routes (Priority)');
    
    app.get('/api/sales/by-period', async (req, res, next) => {
        try {
            console.log('⚡ INTERCEPTED Sales By Period Request:', req.query.period);
            const { period } = req.query;
            let query = "SELECT * FROM sales WHERE 1=1";
            const params = [];

            // TIMEZONE-AWARE LOGIC for "Today"
            if (period === 'daily') {
                query += " AND date(created_at, 'localtime') = date('now', 'localtime')";
            } else if (period === 'weekly') {
                query += " AND date(created_at, 'localtime') >= date('now', 'weekday 1', '-7 days', 'localtime')";
            } else if (period === 'monthly') {
                query += " AND strftime('%Y-%m', created_at, 'localtime') = strftime('%Y-%m', 'now', 'localtime')";
            } else {
                 query += " AND date(created_at, 'localtime') = date('now', 'localtime')";
            }

            query += " ORDER BY created_at DESC";

            // Use better-sqlite3 directly if Database import fails or needs specific config
            // But we can try to reuse the global database connection if exposed?
            // Safer to create new readonly connection
            const Database = await import('better-sqlite3').then(m => m.default);
            const dbPath = process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db';
            const db = new Database(dbPath, { readonly: true });
            
            const sales = db.prepare(query).all(...params);
            
            const total = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
            
            db.close();

            console.log(\`⚡ Found \${sales.length} sales for period \${period}, Total: \${total}\`);

            res.json({
                success: true,
                data: {
                    period,
                    total,
                    count: sales.length,
                    sales: sales.map(s => ({
                        ...s,
                        clientName: s.client_name || s.clientName || 'Cliente Ocasional',
                        products: typeof s.products === 'string' ? JSON.parse(s.products || '[]') : s.products
                    }))
                }
            });
        } catch (error) {
            console.error('❌ Error in Sales Modal Fix:', error);
            // Pass to next handler if we fail? No, safer to return 500
             res.status(500).json({ success: false, error: error.message });
        }
    });
};
`;
    const base64Content = Buffer.from(fixModule).toString('base64');

    const cmd = `
echo "${base64Content}" | base64 -d > /var/www/cocolu-chatbot/src/api/sales-modal-fix.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
