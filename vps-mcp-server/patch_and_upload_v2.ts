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

console.log("🚀 FINAL PATCH V2...");

// 1. Read local file
let content = "";
try {
    // Try reading as utf16le
    content = fs.readFileSync(join(__dirname, "enhanced_routes_local.js"), "utf16le");
    // If it doesn't look like code, try utf8
    if (!content.includes("app.get") && !content.includes("router.get")) {
        content = fs.readFileSync(join(__dirname, "enhanced_routes_local.js"), "utf8");
    }
} catch (e) {
    console.error("Error reading local file:", e);
    process.exit(1);
}

// 2. Clean content
// Find the first major comment block or import
let codeStart = content.indexOf("/**");
if (codeStart === -1) codeStart = content.indexOf("import ");

if (codeStart > -1) {
    content = content.substring(codeStart);
} else {
    // Fallback: look for "enhanced-routes.js..." text from my console.log and cut after it
    // Or just look for the first '{' or 'c' char?
}

// 3. Prepare replacement
const targetRouteSignature = "app.get('/api/sales/by-period'";
const newRouteLogic = `
    app.get('/api/sales/by-period', asyncHandler(async (req, res) => {
        try {
            const { period } = req.query;
            let query = "SELECT * FROM sales WHERE 1=1";
            const params = [];

            // TIMEZONE-AWARE LOGIC
            if (period === 'daily') {
                // Try strictly today in localtime
                query += " AND date(created_at, 'localtime') = date('now', 'localtime')";
            } else if (period === 'weekly') {
                query += " AND date(created_at, 'localtime') >= date('now', 'weekday 1', '-7 days', 'localtime')";
            } else if (period === 'monthly') {
                query += " AND strftime('%Y-%m', created_at, 'localtime') = strftime('%Y-%m', 'now', 'localtime')";
            } else {
                 query += " AND date(created_at, 'localtime') = date('now', 'localtime')";
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
                        clientName: s.client_name || s.clientName || 'Cliente', // Ensure client name
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

const startIdx = content.indexOf(targetRouteSignature);
if (startIdx === -1) {
    console.error("❌ Could not find target route after cleaning. Content start:");
    console.log(content.substring(0, 200));
    process.exit(1);
}

// Find end of block
let endIdx = -1;
const nextRoute = content.indexOf("app.", startIdx + 50); // Look ahead
if (nextRoute > -1) {
    endIdx = content.lastIndexOf("});", nextRoute);
    if (endIdx > -1) endIdx += 3;
} else {
    // Maybe last route in file?
    endIdx = content.lastIndexOf("});");
    if (endIdx > -1) endIdx += 3;
}

if (endIdx === -1) {
    console.error("❌ Could not find end of block");
    process.exit(1);
}

const patchedContent = content.substring(0, startIdx) + newRouteLogic + content.substring(endIdx);
console.log("✅ Patch prepared. Uploading...");

// 4. Upload
const conn = new Client();
conn.on("ready", () => {
    const base64Content = Buffer.from(patchedContent).toString('base64');

    const cmd = `
# Backup existing
cp /var/www/cocolu-chatbot/src/api/enhanced-routes.js /var/www/cocolu-chatbot/src/api/enhanced-routes.js.bak-v2

# Overwrite
echo "${base64Content}" | base64 -d > /var/www/cocolu-chatbot/src/api/enhanced-routes.js

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

sleep 3

echo "🧪 Testing Daily Sales..."
curl -s "http://localhost:3009/api/sales/by-period?period=daily"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
