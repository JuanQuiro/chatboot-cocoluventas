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

console.log("🔍 DIAGNÓSTICO PROFUNDO DEL PROBLEMA...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== VERIFICAR TIPO DE MÓDULO ==="
head -20 app-integrated.js | grep -E "import|export|require"

echo ""
echo "=== VERIFICAR PACKAGE.JSON ==="
if [ -f package.json ]; then
    grep "type" package.json || echo "No type specified"
fi

echo ""
echo "=== VER RUTA AUTH EN APP ==="
grep -n "/api/auth/login" app-integrated.js | head -5

echo ""
echo "=== TEST DIFERENTES ENDPOINTS ==="
echo "Health:"
curl -s http://127.0.0.1:3009/api/health | head -c 100

echo ""
echo "Login (viejo):"
curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | head -c 100

echo ""
echo "Auth Login:"
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}' | head -c 100

echo ""
echo ""
echo "=== PM2 MONIT (memoria) ==="
pm2 describe cocolu-dashoffice | grep -E "memory|uptime|restarts"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Diagnóstico completado");
            conn.end();
        });
    });
}).connect(config);
