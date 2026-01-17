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

console.log("🔍 CHECKING ORDERS FETCH...");

const conn = new Client();
conn.on("ready", () => {
    // Search within the route block (lines 469-500)
    const cmd = `
sed -n '469,500p' /var/www/cocolu-chatbot/src/api/enhanced-routes.js | grep "const orders"
sed -n '469,500p' /var/www/cocolu-chatbot/src/api/enhanced-routes.js | grep "filteredOrders"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
