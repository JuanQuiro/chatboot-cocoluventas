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

console.log("📋 DIAGNÓSTICO COMPLETO DEL 502...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== PM2 STATUS Y RESTARTS ==="
pm2 describe cocolu-dashoffice 2>&1 | grep -E "status|restarts|error|uptime"

echo ""
echo "=== PM2 LOGS (últimos 100 líneas) ==="
pm2 logs cocolu-dashoffice --lines 100 --nostream 2>&1 | tail -100

echo ""
echo "=== PUERTO 3009 ESCUCHANDO? ==="
netstat -tlnp 2>/dev/null | grep 3009 || lsof -i :3009 2>/dev/null || echo "No se puede verificar"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Diagnóstico completo");
            conn.end();
        });
    });
}).connect(config);
