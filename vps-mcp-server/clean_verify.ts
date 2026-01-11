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

console.log("🧹 LIMPIEZA Y VERIFICACION FINAL...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== FLUSH LOGS ==="
pm2 flush

echo "=== RESTART ==="
pm2 restart cocolu-dashoffice

echo "=== WAIT 5s ==="
sleep 5

echo "=== CHECK LOGS (CLEAN) ==="
pm2 logs cocolu-dashoffice --lines 50 --nostream

echo ""
echo "=== CURL HEALTH ==="
curl -v http://localhost:3009/health
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Done");
            conn.end();
        });
    });
}).connect(config);
