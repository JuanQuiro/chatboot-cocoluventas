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

console.log("🚑 DIAGNÓSTICO 502 CRITICAL...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== PM2 STATUS ==="
pm2 list

echo ""
echo "=== PM2 ERROR LOGS (LAST 50) ==="
tail -n 50 /root/.pm2/logs/cocolu-dashoffice-error.log

echo ""
echo "=== APP-INTEGRATED.JS SYNTAX CHECK ==="
node --check /var/www/cocolu-chatbot/app-integrated.js 2>&1
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Diagnóstico completado");
            conn.end();
        });
    });
}).connect(config);
