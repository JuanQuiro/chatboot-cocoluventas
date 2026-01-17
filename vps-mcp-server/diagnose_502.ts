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
    readyTimeout: 60000,
};

console.log("🔍 DIAGNÓSTICO COMPLETO 502...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== 1. PM2 STATUS ==="
pm2 list

echo ""
echo "=== 2. PM2 LOGS (últimos errores) ==="
pm2 logs cocolu-dashoffice --err --lines 30 --nostream 2>&1 | tail -30

echo ""
echo "=== 3. TEST /api/login (sin auth) ==="
curl -s http://127.0.0.1:3009/api/login -X POST -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}'

echo ""
echo ""
echo "=== 4. TEST /api/auth/login (con auth) ==="
curl -s http://127.0.0.1:3009/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}'

echo ""
echo ""
echo "=== 5. VER RUTAS EN APP-INTEGRATED.JS ==="
grep -E "app\.(get|post).*login|app\.(get|post).*auth" /var/www/cocolu-chatbot/app-integrated.js | head -10

echo ""
echo "=== FIN ==="
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Diagnóstico completo");
            conn.end();
        });
    });
}).connect(config);
