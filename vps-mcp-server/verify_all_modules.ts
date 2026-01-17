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

console.log("🔍 DETECTIVE DE ARCHIVOS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== CHECKING FIX FILES ==="
ls -l /var/www/cocolu-chatbot/src/api/installments-fix.routes.js
ls -l /var/www/cocolu-chatbot/src/api/accounts-fix.routes.js
ls -l /var/www/cocolu-chatbot/src/api/clients-fix.routes.js

echo ""
echo "=== EXACT ERROR MESSAGE ==="
grep -C 5 "ERR_MODULE_NOT_FOUND" /root/.pm2/logs/cocolu-dashoffice-error.log | tail -n 20
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
