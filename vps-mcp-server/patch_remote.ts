import fs from 'fs';
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Client } from "ssh2";
import dotenv from "dotenv";

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

console.log("🩹 PATCHING SALES LOGIC (V2)...");

const conn = new Client();
conn.on("ready", () => {
    // We will use a node script ON THE SERVER to do the replacement to avoid download/upload encoding issues
    const remotePatchScript = `
const fs = require('fs');
const path = '/var/www/cocolu-chatbot/src/api/enhanced-routes.js';

try {
    let content = fs.readFileSync(path, 'utf8');
    
    // Logic to insert
    const newLogic = \`app.get('/api/sales/by-period', asyncHandler(async (req, res) => {
    console.log('📊 Fetching sales by period:', req.query.period);
    try {
        const { period } = req.query;
        let query = "SELECT * FROM sales WHERE 1=1";
        const params = [];

        // ROBUST SQLITE DATE LOGIC (Timezone Aware)
        if (period === 'daily') {
            query += " AND date(created_at) = date('now')"; // Try UTC first if server is UTC
            // query += " AND date(created_at, 'localtime') = date('now', 'localtime')";
        } else if (period === 'weekly') {
            query += " AND date(created_at) >= date('now', 'weekday 1', '-7 days')";
        } else if (period === 'monthly') {
            query += " AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')";
        } else {
             query += " AND date(created_at) = date('now')";
        }

        query += " ORDER BY created_at DESC";

        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
        const sales = db.prepare(query).all(...params);
        
        const total = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        
        db.close();

        res.json({
            success: true,
            data: {
                period,
                total,
                count: sales.length,
                sales: sales.map(s => ({
                    ...s,
                    products: typeof s.products === 'string' ? JSON.parse(s.products || '[]') : s.products
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching sales by period:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}));\`;

    // Find start
    const startMarker = "app.get('/api/sales/by-period',";
    const startIdx = content.indexOf(startMarker);
    
    if (startIdx === -1) {
        console.error('❌ Could not find route definition');
        process.exit(1);
    }
    
    // Find end of this block. It should end with });
    // Heuristic: search for next app.get/post or EOF
    let endIdx = -1;
    
    // Look for the next route definition to be safe
    const nextRoute = content.indexOf("app.", startIdx + 10);
    if (nextRoute > -1) {
        // scan backwards from there to find });
        endIdx = content.lastIndexOf('});', nextRoute);
        // Add 3 to include });
        if (endIdx > -1) endIdx += 3;
    } else {
        // Must be the last one, find the last });
        endIdx = content.lastIndexOf('});'); 
        if (endIdx > -1) endIdx += 3;
    }

    if (endIdx > startIdx) {
        const newContent = content.substring(0, startIdx) + newLogic + content.substring(endIdx);
        fs.writeFileSync(path, newContent);
        console.log('✅ File patched successfully');
    } else {
        console.error('❌ Could not determine block end');
        process.exit(1);
    }
    
} catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
}
`;

    const base64Script = Buffer.from(remotePatchScript).toString('base64');

    const cmd = `
echo "${base64Script}" | base64 -d > /var/www/cocolu-chatbot/patch_routes_remote.js
node /var/www/cocolu-chatbot/patch_routes_remote.js

if [ $? -eq 0 ]; then
    echo "🔄 Restarting PM2..."
    pm2 restart cocolu-dashoffice
    sleep 3
    echo "🧪 Testing Route..."
    curl -s "http://localhost:3009/api/sales/by-period?period=daily"
else
    echo "❌ Patch failed"
fi
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
