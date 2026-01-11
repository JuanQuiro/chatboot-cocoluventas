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

console.log("🔥 NEUTRALIZANDO enhanced-routes.js...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== COMENTAR RUTAS CONFLICTIVAS ==="

# Comentar rutas de installments
sed -i 's/app.get.*api.*installments/\\/\\/ &/' src/api/enhanced-routes.js
sed -i 's/app.post.*api.*installments/\\/\\/ &/' src/api/enhanced-routes.js
sed -i 's/app.put.*api.*installments/\\/\\/ &/' src/api/enhanced-routes.js
sed -i 's/app.delete.*api.*installments/\\/\\/ &/' src/api/enhanced-routes.js

# Comentar accounts receivable
sed -i 's/app.get.*api.*accounts-receivable/\\/\\/ &/' src/api/enhanced-routes.js

echo "✅ Rutas comentadas"

echo ""
echo "=== VERIFICAR CAMBIOS ==="
grep "installments" src/api/enhanced-routes.js | grep "//" | head -5

echo ""
echo "=== RESTART PM2 ==="
pm2 restart cocolu-dashoffice
sleep 8

echo ""
echo "=== TEST FINAL (CRUCIAL) ==="
curl -s http://127.0.0.1:3009/api/installments | head -c 200
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
