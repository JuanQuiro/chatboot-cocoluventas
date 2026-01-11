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

console.log("🔍 CHECKING DEPLOYMENT STATUS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== PM2 LIST ==="
pm2 list
echo "=== APP INTEGRATED HEAD ==="
head -n 20 /var/www/cocolu-chatbot/app-integrated.js
echo "=== DB LIB CHECK ==="
ls -l /var/www/cocolu-chatbot/src/api/lib/db.js
echo "=== PM2 LOGS (LAST 20) ==="
pm2 logs cocolu-dashoffice --lines 20 --nostream
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
