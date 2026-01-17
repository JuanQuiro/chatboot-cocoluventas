import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

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

console.log(`🔍 VERIFICACIÓN COMPLETA DEL SISTEMA...`);

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Conectado");

    const cmd = `
echo "=== 1. PM2 STATUS ==="
pm2 list

echo ""
echo "=== 2. PUERTO 3009 ==="
netstat -tlnp 2>/dev/null | grep 3009 || ss -tlnp | grep 3009 || echo "Puerto no activo"

echo ""
echo "=== 3. HEALTH CHECK ==="
curl -s http://127.0.0.1:3009/api/health | head -c 300

echo ""
echo ""
echo "=== 4. TEST LOGIN ==="
TOKEN=$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
echo "Token: $TOKEN"

echo ""
echo "=== 5. TEST SELLERS (funciona) ==="
curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer $TOKEN" | jq 'length'

echo ""
echo "=== 6. TEST INSTALLMENTS (problema) ==="
curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer $TOKEN" 2>&1 | head -c 200

echo ""
echo ""
echo "=== 7. NGINX CONFIG CHECK ==="
nginx -t 2>&1

echo ""
echo "=== 8. DÓNDE ESTÁ EL FRONTEND? ==="
ls -la /var/www/cocolu-dashboard/ 2>/dev/null | head -5 || echo "No en /var/www/cocolu-dashboard"
ls -la /var/www/html/ 2>/dev/null | head -5 || echo "No en /var/www/html"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", () => {
            console.log("\n✅ Verificación completa");
            conn.end();
        }).on("data", (data) => {
            console.log(data.toString());
        }).stderr.on("data", (data) => {
            console.error(data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Error:", err.message);
}).connect(config);
