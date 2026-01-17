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

console.log("🔍 FINAL VERIFICATION...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

echo "⏳ Waiting 5s..."
sleep 5

echo "=== 1. TRIGGER SYNC ==="
curl -X POST http://localhost:3009/api/bcv/sync -s

echo ""
echo ""
echo "=== 2. GET CURRENT RATE ==="
curl http://localhost:3009/api/bcv/rate -s

echo ""
echo ""
echo "=== 3. CHECK CACHE FILE ==="
cat /var/www/cocolu-chatbot/data/bcv_rate.json
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
