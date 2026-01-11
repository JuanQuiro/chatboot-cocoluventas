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

console.log("✅ FINAL BANK-GRADE VERIFICATION...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== 1. CHECKING FOR SECURITY IMPORTS ==="
head -20 /var/www/cocolu-chatbot/app-integrated.js | grep -E "helmet|compression|rate"

echo ""
echo "=== 2. CHECKING FOR SECURITY MIDDLEWARE ==="
grep -A 5 "BANK-GRADE SECURITY" /var/www/cocolu-chatbot/app-integrated.js | head -10

echo ""
echo "=== 3. LOGIN TEST ==="
curl -s -X POST http://localhost:3009/api/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}' | head -c 200

echo ""
echo ""
echo "=== 4. HEALTH CHECK ==="
curl -s http://localhost:3009/health

echo ""
echo ""
echo "=== 5. PM2 STATUS ==="
pm2 list | grep cocolu

echo ""
echo "=== 6. CHECKING RESPONSE HEADERS (Security Headers) ==="
curl -I http://localhost:3009/api/health 2>/dev/null | grep -E "X-|Strict|Content-Encoding"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d) => console.log(d.toString()));
        stream.stderr.on('data', (d) => console.error('STDERR:', d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
