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

console.log("🔄 RESTAURANDO DESDE GIT...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== 1. VER GIT STATUS ==="
git status 2>&1 | head -10

echo ""
echo "=== 2. RESTAURAR app-integrated.js DESDE GIT ==="
git checkout HEAD -- app-integrated.js

echo ""
echo "=== 3. VERIFICAR SINTAXIS ==="
node --check app-integrated.js && echo "✅ SINTAXIS OK" || echo "❌ ERROR"

echo ""
echo "=== 4. REINICIAR PM2 ==="
pm2 delete all 2>/dev/null
pm2 kill 2>/dev/null
pkill -9 node 2>/dev/null || true
sleep 3
pm2 start app-integrated.js --name cocolu-dashoffice
sleep 10

echo ""
echo "=== 5. PM2 STATUS ==="
pm2 list

echo ""
echo "=== 6. TEST DIRECTO ==="
curl -s http://127.0.0.1:3009/api/health 2>&1

echo ""
echo ""
echo "=== 7. TEST LOGIN ==="
curl -s http://127.0.0.1:3009/api/login -X POST -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' 2>&1

echo ""
echo ""
echo "🎉 SI VES TOKEN = FUNCIONA"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Proceso completado");
            conn.end();
        });
    });
}).connect(config);
