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

console.log("🔧 FIXING CORS FOR PRODUCTION DOMAINS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# 1. Check current CORS config
echo "=== CURRENT CORS CONFIG ==="
grep -A 5 "origin:" /var/www/cocolu-chatbot/app-integrated.js | head -10

# 2. Fix CORS to include production domains
echo ""
echo "=== FIXING CORS ==="
sed -i "s|origin: \\['http://localhost:3000', 'http://localhost:3009', 'http://127.0.0.1:3000', 'http://127.0.0.1:3009'\\]|origin: ['http://localhost:3000', 'http://localhost:3009', 'http://127.0.0.1:3000', 'http://127.0.0.1:3009', 'https://cocolu.emberdrago.com', 'https://api.emberdrago.com']|g" /var/www/cocolu-chatbot/app-integrated.js

echo "CORS fixed."

# 3. Verify fix
echo ""
echo "=== NEW CORS CONFIG ==="
grep -A 5 "origin:" /var/www/cocolu-chatbot/app-integrated.js | head -10

# 4. Restart PM2
echo ""
echo "=== RESTARTING PM2 ==="
pm2 restart cocolu-dashoffice
sleep 5

# 5. Check if backend is responding properly
echo ""
echo "=== TESTING FROM LOCALHOST ==="
curl -X POST http://localhost:3009/api/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}' | head -c 200

# 6. Check CORS headers
echo ""
echo ""
echo "=== CHECKING CORS HEADERS ==="
curl -I -X OPTIONS http://localhost:3009/api/login -H "Origin: https://cocolu.emberdrago.com" -H "Access-Control-Request-Method: POST" 2>/dev/null | grep -i "access-control"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d) => console.log(d.toString()));
        stream.stderr.on('data', (d) => console.error('STDERR:', d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
