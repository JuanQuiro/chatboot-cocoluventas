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

console.log("🚀 FAST FIX: Creating sellers route using direct SQL...");

const conn = new Client();
conn.on("ready", () => {
    // Create a simple sellers route that uses direct SQL like other working endpoints
    const sellersRouteCode = `
import express from 'express';
import Database from 'better-sqlite3';

const router = express.Router();
const dbPath = '/var/www/cocolu-chatbot/data/cocolu.db';

// GET /api/sellers - List all sellers
router.get('/', async (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        
        const { active, status, specialty } = req.query;
        let query = 'SELECT * FROM sellers WHERE 1=1';
        const params = [];
        
        if (active !== undefined) {
            query += ' AND active = ?';
            params.push(parseInt(active));
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        if (specialty) {
            query += ' AND specialty = ?';
            params.push(specialty);
        }
        
        query += ' ORDER BY name ASC';
        
        const sellers = db.prepare(query).all(...params);
        db.close();
        
        res.json({ success: true, data: sellers });
    } catch (error) {
        console.error('Error fetching sellers:', error);
        res.status(500).json({ success: false, error: 'Error fetching sellers', message: error.message });
    }
});

// GET /api/sellers/:id - Get single seller
router.get('/:id', async (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const seller = db.prepare('SELECT * FROM sellers WHERE id = ?').get(req.params.id);
        db.close();
        
        if (!seller) {
            return res.status(404).json({ success: false, error: 'Seller not found' });
        }
        
        res.json({ success: true, data: seller });
    } catch (error) {
        console.error('Error fetching seller:', error);
        res.status(500).json({ success: false, error: 'Error fetching seller', message: error.message });
    }
});

export default router;
`;

    const base64Route = Buffer.from(sellersRouteCode.trim()).toString('base64');

    const cmd = `
echo "📝 Creating sellers route..."
echo "${base64Route}" | base64 -d > /var/www/cocolu-chatbot/src/api/sellers.routes.js

echo "🔧 Checking if route is already registered..."
if grep -q "sellers.routes" /var/www/cocolu-chatbot/app-integrated.js; then
    echo "✅ Route already registered"
else
    echo "📝 Registering route..."
    # Find the last apiApp.use line and add sellers after it
    sed -i "/apiApp\\.use.*routes/a apiApp.use('/api/sellers', (await import('./src/api/sellers.routes.js')).default);" /var/www/cocolu-chatbot/app-integrated.js
    echo "✅ Route registered"
fi

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

sleep 3

echo ""
echo "🧪 Testing endpoint..."
curl -s http://localhost:3009/api/sellers | jq '.success, (.data | length)'
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
