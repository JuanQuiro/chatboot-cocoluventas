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

console.log("🔍 READING DASHBOARD STATS LOGIC...");

const conn = new Client();
conn.on("ready", () => {
    // We search for where 'daily' stats are generated in dashboard-routes.js
    // It likely uses 'new Date()' and filters a list of orders.
    const cmd = `
grep -nC 20 "const daily =" /var/www/cocolu-chatbot/src/api/dashboard-routes.js
grep -nC 20 "orders.filter" /var/www/cocolu-chatbot/src/api/dashboard-routes.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
