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

console.log("🔍 FINDING HOW OTHER SERVICES IMPORT DB...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== CHECK EXISTING SERVICE IMPORTS ==="
head -n 3 /var/www/cocolu-chatbot/src/services/orders.service.js
head -n 3 /var/www/cocolu-chatbot/src/services/clients.service.js

echo ""
echo "=== FIND ALL db FILES ==="
find /var/www/cocolu-chatbot -name "*db*" -type f | grep -v node_modules | grep -v ".git"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
