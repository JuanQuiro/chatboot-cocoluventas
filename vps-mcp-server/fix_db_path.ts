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

console.log("🔧 FIX: Ruta absoluta de base de datos...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot/src/api

echo "=== ACTUALIZAR auth-simple.routes.js ==="
sed -i "s|new Database('\\./data/cocolu\\.db')|new Database('/var/www/cocolu-chatbot/data/cocolu.db')|g" auth-simple.routes.js

echo "✅ Ruta actualizada"

echo ""
echo "=== VERIFICAR ==="
grep "Database" auth-simple.routes.js

cd /var/www/cocolu-chatbot

echo ""
echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 10

echo ""
echo "=== TEST LOGIN ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}'

echo ""
echo ""
echo "🎯 DONE"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Fix aplicado");
            conn.end();
        });
    });
}).connect(config);
