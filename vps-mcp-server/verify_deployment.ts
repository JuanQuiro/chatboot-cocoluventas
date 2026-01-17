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

console.log("🕵️ VERIFICANDO ENDPOINTS FINALES...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== 1. BCV RATE ==="
curl -s http://localhost:3009/api/bcv/rate

echo ""
echo "=== 2. LOGS BATCH ==="
curl -X POST http://localhost:3009/api/logs/batch -H "Content-Type: application/json" -d '{}'

echo ""
echo "=== 3. CLIENTS (Limit -1) ==="
curl -s "http://localhost:3009/api/clients?limit=-1" | head -c 200
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Verification Done");
            conn.end();
        });
    });
}).connect(config);
