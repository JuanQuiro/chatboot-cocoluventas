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

console.log("🔍 FINDING ALL SELLERS IMPORTS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
grep -rn "sellers.service" /var/www/cocolu-chatbot/src/ --include="*.js" || echo "No matches found"

echo ""
echo "🧹 Removing import from welcome.flow.js if it exists..."
sed -i "/sellers\\.service/d" /var/www/cocolu-chatbot/src/flows/welcome.flow.js 2>/dev/null || true

echo ""
echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

sleep 3

echo ""
echo "✅ Testing..."
curl -s http://localhost:3009/api/sellers | head -n 20
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
