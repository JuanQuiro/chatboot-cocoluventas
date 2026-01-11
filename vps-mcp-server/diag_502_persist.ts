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

console.log("🔍 DIAGNOSTICO 502 REINCIDENTE...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== PM2 STATUS (Restarts?) ==="
pm2 list

echo ""
echo "=== PM2 ERROR LOGS (Last 30) ==="
tail -n 30 /root/.pm2/logs/cocolu-dashoffice-error.log

echo ""
echo "=== FILE CHECK ==="
ls -l /var/www/cocolu-chatbot/src/api/clients-fix.routes.js
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
