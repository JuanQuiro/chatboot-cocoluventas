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

console.log("🔍 TEST COMPLETO DEL SISTEMA...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== PM2 STATUS ==="
pm2 list 2>&1 | grep -E "online|stopped|error"

echo ""
echo "=== HEALTH CHECK ==="
curl -s http://127.0.0.1:3009/api/health

echo ""
echo ""
echo "=== LOGIN TEST ==="
curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}'

echo ""
echo ""
echo "=== CORS TEST ==="
curl -s -I -X OPTIONS https://api.emberdrago.com/api/health -H "Origin: https://cocolu.emberdrago.com" 2>&1 | grep -i "access-control"

echo ""
echo "🎉 FIN"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Test completado");
            conn.end();
        });
    });
}).connect(config);
