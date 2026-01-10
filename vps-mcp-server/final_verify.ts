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

console.log(`✅ VERIFICACIÓN FINAL...`);

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Conectado");

    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== PM2 STATUS ==="
pm2 list

echo ""
echo "=== TEST DIRECTO ==="
curl -s http://127.0.0.1:3009/api/health | head -c 200

echo ""
echo ""
echo "=== LOGIN TEST ==="
TOKEN=$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
echo "Token: \${TOKEN}"

echo ""
echo "=== SELLERS ==="
curl - s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer $TOKEN" | jq 'length'

    echo ""
echo "🎉 SI VES DATOS ARRIBA = BACKEND FUNCIONA"
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
