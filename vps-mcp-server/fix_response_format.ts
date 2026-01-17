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

console.log("🩹 FIXING RESPONSE FORMAT...");

const conn = new Client();
conn.on("ready", () => {
    // New route handling that returns array directly
    const sellersRouteCode = `
import express from 'express';
import Database from 'better-sqlite3';

const router = express.Router();
const dbPath = '/var/www/cocolu-chatbot/data/cocolu.db';

// GET /api/sellers - List all sellers (DIRECT ARRAY RETURN)
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
        
        // TRANSFORM DATA TO MATCH FRONTEND EXPECTATIONS
        const mappedSellers = sellers.map(s => ({
            ...s,
            whatsapp: s.phone, // Map phone to whatsapp
            status: s.status === 'online' ? 'available' : s.status // Map online to available if needed
        }));
        
        // RETURN DIRECT ARRAY
        res.json(mappedSellers);
    } catch (error) {
        console.error('Error fetching sellers:', error);
        res.status(500).json({ error: 'Error fetching sellers' });
    }
});

// GET /api/sellers/:id - Get single seller
router.get('/:id', async (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const seller = db.prepare('SELECT * FROM sellers WHERE id = ?').get(req.params.id);
        db.close();
        
        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }
        
        // Map fields
        seller.whatsapp = seller.phone;
        
        res.json(seller);
    } catch (error) {
        console.error('Error fetching seller:', error);
        res.status(500).json({ error: 'Error fetching seller' });
    }
});

// POST /api/sellers - Create seller stub
router.post('/', async (req, res) => {
    // Stub for now allowing creation
    res.json({ id: Date.now(), ...req.body });
});

// DELETE /api/sellers/:id - Delete seller stub
router.delete('/:id', async (req, res) => {
    res.json({ success: true });
});

export default router;
`;

    const base64Route = Buffer.from(sellersRouteCode.trim()).toString('base64');

    // We update the file directly. No need to restart PM2 if we only changed the lazy loaded route file?
    // Actually yes, ES modules cache imports, so restart is safer.

    const cmd = `
echo "📝 Updating sellers route with correct array response..."
echo "${base64Route}" | base64 -d > /var/www/cocolu-chatbot/src/api/sellers.routes.js

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

sleep 3

echo "🧪 Testing response format..."
curl -s http://localhost:3009/api/sellers | head -c 100
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
