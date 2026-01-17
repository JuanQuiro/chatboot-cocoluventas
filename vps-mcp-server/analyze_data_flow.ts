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

console.log("🔍 ANALYZING DATA FLOW...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== DASHBOARD.JS: getModal functions ==="
grep -nC 10 "const getModalSales" /var/www/cocolu-chatbot/dashboard/src/pages/Dashboard.js
grep -nC 5 "const getModalTotal" /var/www/cocolu-chatbot/dashboard/src/pages/Dashboard.js

echo "=== API ROUTE: What data is sent? ==="
grep -nC 20 "res.json({" /var/www/cocolu-chatbot/src/api/dashboard-routes.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
