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

console.log("🔍 READING DASHBOARD COMPONENT USAGE...");

const conn = new Client();
conn.on("ready", () => {
    // We want to see how SalesBreakdownModal is used.
    const cmd = `
grep -A 10 "<SalesBreakdownModal" /var/www/cocolu-chatbot/dashboard/src/pages/Dashboard.js
grep -nC 20 "const getModalSales" /var/www/cocolu-chatbot/dashboard/src/pages/Dashboard.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        let data = '';
        stream.on('data', d => data += d.toString());
        stream.on('close', () => {
            console.log(data);
            conn.end();
        });
    });
}).connect(config);
