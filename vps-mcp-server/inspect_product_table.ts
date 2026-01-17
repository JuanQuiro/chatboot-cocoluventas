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

console.log("🔍 INSPECTING TABLES FOR PRODUCTS...");

const conn = new Client();
conn.on("ready", () => {
    // Check tables and then columns for likely candidates
    const cmd = `
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".tables"
echo "=== SCHEMA CANDIDATES ==="
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".schema products"
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".schema productos"
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".schema items"
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".schema inventory"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
