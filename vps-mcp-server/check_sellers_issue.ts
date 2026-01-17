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

console.log("🔍 CHECKING PM2 LOGS AND ROUTE REGISTRATION...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== PM2 LOGS (Last 30 lines) ==="
pm2 logs cocolu-dashoffice --lines 30 --nostream

echo ""
echo "=== CHECK SELLERS IMPORT IN APP ==="
grep -n "sellers" /var/www/cocolu-chatbot/app-integrated.js

echo ""
echo "=== CHECK FILES EXIST ==="
ls -l /var/www/cocolu-chatbot/src/services/sellers.service.js
ls -l /var/www/cocolu-chatbot/src/api/sell

ers.routes.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
