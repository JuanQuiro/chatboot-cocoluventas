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

console.log("🔍 DIAGNOSING...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== PM2 ERROR LOG ==="
pm2 logs cocolu-dashoffice --err --lines 20 --nostream

echo ""
echo "=== CHECK sellers.routes.js EXISTS ==="
ls -l /var/www/cocolu-chatbot/src/api/sellers.routes.js

echo ""
echo "=== HEAD OF FILE ==="
head -n 10 /var/www/cocolu-chatbot/src/api/sellers.routes.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
