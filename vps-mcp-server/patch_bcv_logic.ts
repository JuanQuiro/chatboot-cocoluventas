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

console.log("🔧 PATCHING BCV ROUTES LOGIC...");

const conn = new Client();
conn.on("ready", () => {
    const patchScript = `
const fs = require('fs');
const filePath = '/var/www/cocolu-chatbot/src/api/bcv.routes.js';

try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Change fetchHistory() to fetchCurrentRate() in the sync endpoint
    // Pattern: const history = await bcvService.fetchHistory();
    // Replacement: const newRate = await bcvService.fetchCurrentRate();
    
    if (content.includes("fetchHistory()")) {
        console.log('Found fetchHistory call in sync, replacing...');
        
        // Use a more robust replace that handles potential whitespace
        content = content.replace(/const\s+\w+\s*=\s*await\s+bcvService\.fetchHistory\(\);/, "const newRate = await bcvService.fetchCurrentRate();");
        
        // Also update the response to return the new rate instead of history
        content = content.replace(/data:\s*history,/, "data: newRate,");
        
        console.log('✅ Updated sync logic');
    } else {
        console.log('ℹ️ fetchHistory call not found (already patched?)');
    }

    fs.writeFileSync(filePath, content);
    console.log('✅ File saved.');

} catch (e) {
    console.error('Error patching:', e);
}
`;

    const base64Script = Buffer.from(patchScript).toString('base64');

    const cmd = `
echo "${base64Script}" | base64 -d > /var/www/cocolu-chatbot/patch_bcv_routes.cjs
node /var/www/cocolu-chatbot/patch_bcv_routes.cjs
rm /var/www/cocolu-chatbot/patch_bcv_routes.cjs

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

echo "⏳ Waiting 5s..."
sleep 5

echo "=== VERIFICATION ==="
echo "TRIGGER SYNC..."
curl -X POST http://localhost:3009/api/bcv/sync -s
echo ""
echo "CHECK RATE..."
curl http://localhost:3009/api/bcv/rate -s
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
