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

console.log("✅ VERIFICACIÓN FINAL: BACKEND LOGIN");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== REQUEST ==="
curl -v -X POST http://127.0.0.1:3009/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@cocolu.com","password":"password123"}' 2>&1 | grep -E "HTTP|success|token|error" | head -20

echo ""
echo "=== PM2 STATUS ==="
pm2 list | grep cocolu
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
