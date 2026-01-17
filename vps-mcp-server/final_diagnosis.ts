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
    readyTimeout: 90000,
};

console.log("🔍 FINAL DIAGNOSIS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== WHERE IS db.js? ==="
find /var/www/cocolu-chatbot -name "db.js" -type f

echo ""
echo "=== PM2 ERROR LOG (Latest) ==="
pm2 logs cocolu-dashoffice --err --lines 20 --nostream

echo ""
echo "=== VERIFY sellers.service.js IMPORT LINE ==="
head -n 1 /var/www/cocolu-chatbot/src/services/sellers.service.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
