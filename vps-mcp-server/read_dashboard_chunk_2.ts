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

console.log("🔍 READING DASHBOARD ROUTES CHUNK 2...");

const conn = new Client();
conn.on("ready", () => {
    // Read lines 300-600
    const cmd = `
head -n 600 /var/www/cocolu-chatbot/src/api/dashboard-routes.js | tail -n 300
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
