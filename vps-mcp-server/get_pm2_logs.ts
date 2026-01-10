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

console.log("📋 LOGS PM2 DETALLADOS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== PM2 LOGS COMPLETOS (últimas 50 líneas) ==="
pm2 logs cocolu-dashoffice --lines 50 --nostream 2>&1 | tail -50

echo ""
echo "=== PUERTO 3009 ==="
netstat -tlnp 2>/dev/null | grep 3009 || lsof -i :3009 2>/dev/null || echo "No se puede verificar puerto"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Logs obtenidos");
            conn.end();
        });
    });
}).connect(config);
