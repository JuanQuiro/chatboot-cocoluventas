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

console.log("🚀 FINAL PATCH UPLOAD...");

// 1. Read local file and clean it
let content = "";
try {
    // Try reading as utf16le first (based on previous check)
    content = fs.readFileSync(join(__dirname, "enhanced_routes_local.js"), "utf16le");
    if (!content.includes("import express")) {
        // Fallback to utf8 if utf16le yields garbage
        content = fs.readFileSync(join(__dirname, "enhanced_routes_local.js"), "utf8");
    }
} catch (e) {
    console.error("Error reading local file:", e);
    process.exit(1);
}

// Clean headers (remove everything before first import)
const importIdx = content.indexOf("import express");
if (importIdx > -1) {
    content = content.substring(importIdx);
}

// 2. Prepare the replacement logic
// Note: We use looser matching to ensure we find the block
const targetRouteSignature = "app.get('/api/sales/by-period'";
const newRouteLogic = `
    app.get('/api/sales/by-period', asyncHandler(async (req, res) => {
        try {
            const { period } = req.query;
            let query = "SELECT * FROM sales WHERE 1=1";
            const params = [];

            // TIMEZONE-AWARE LOGIC
            // Using 'localtime' to align with user's perspective (-04:00 typically)
            if (period === 'daily') {
                query += " AND date(created_at, 'localtime') = date('now', 'localtime')";
            } else if (period === 'weekly') {
                query += " AND date(created_at, 'localtime') >= date('now', 'weekday 1', '-7 days', 'localtime')";
            } else if (period === 'monthly') {
                query += " AND strftime('%Y-%m', created_at, 'localtime') = strftime('%Y-%m', 'now', 'localtime')";
            } else {
                 // Default to today
                 query += " AND date(created_at, 'localtime') = date('now', 'localtime')";
            }

            query += " ORDER BY created_at DESC";

            const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
            const sales = db.prepare(query).all(...params);
            
            // Calculate totals
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
    }));
`;

// 3. Apply Patch
const startIdx = content.indexOf(targetRouteSignature);
if (startIdx === -1) {
    console.error("❌ Could not find target route in cleaned content. Dumping first 100 chars:");
    console.log(content.substring(0, 100));
    // If we can't find it, we might be looking at a file that doesn't have it (maybe imports are different?)
    // But we saw it in grep...
    // Let's try matching just "sales/by-period"
    const fallbackIdx = content.indexOf("sales/by-period");
    if (fallbackIdx > -1) {
        // Find the start of that line
        const lineStart = content.lastIndexOf("\n", fallbackIdx);
        // And find the end of the block... this is risky without proper parsing.
        // We will abort if robust match fails to avoid breaking the file.
        console.error("Found loosely at index", fallbackIdx, "but aborting safe match.");
        process.exit(1);
    }
    process.exit(1);
}

// Find end of block
let endIdx = -1;
const nextRoute = content.indexOf("app.", startIdx + 20);
if (nextRoute > -1) {
    endIdx = content.lastIndexOf("});", nextRoute);
    if (endIdx > -1) endIdx += 3;
} else {
    endIdx = content.lastIndexOf("});");
    if (endIdx > -1) endIdx += 3;
}

if (endIdx === -1) {
    console.error("❌ Could not find end of block");
    process.exit(1);
}

const patchedContent = content.substring(0, startIdx) + newRouteLogic + content.substring(endIdx);
console.log("✅ Patch applied in memory. Size:", patchedContent.length);


// 4. Upload
const conn = new Client();
conn.on("ready", () => {
    const base64Content = Buffer.from(patchedContent).toString('base64');

    const cmd = `
# Backup
cp /var/www/cocolu-chatbot/src/api/enhanced-routes.js /var/www/cocolu-chatbot/src/api/enhanced-routes.js.bak-datefix

# Write new file
echo "${base64Content}" | base64 -d > /var/www/cocolu-chatbot/src/api/enhanced-routes.js

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

sleep 3

echo "🧪 Testing API Date Logic..."
# Should return success true now
curl -s "http://localhost:3009/api/sales/by-period?period=daily"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
