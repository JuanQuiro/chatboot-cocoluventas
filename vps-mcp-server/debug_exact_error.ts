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

console.log("🔍 DEBUG: Obteniendo error exacto...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# Flush logs
pm2 flush cocolu-dashoffice 2>/dev/null

# Hacer request
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}' > /tmp/login_response.txt

# Esperar un segundo
sleep 2

echo "=== RESPUESTA DEL LOGIN ==="
cat /tmp/login_response.txt

echo ""
echo ""
echo "=== LOGS PM2 (ERROR) ==="
pm2 logs cocolu-dashoffice --err --lines 50 --nostream 2>&1 | tail -50
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Debug completado");
            conn.end();
        });
    });
}).connect(config);
