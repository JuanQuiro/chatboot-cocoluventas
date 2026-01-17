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

console.log("🕵️ TESTING STOCK ADJUSTMENT...");

const conn = new Client();
conn.on("ready", () => {
    // 1. Get product ID
    // 2. Adjust Stock
    const cmd = `
PRODUCT_ID=$(sqlite3 /var/www/cocolu-chatbot/data/cocolu.db "SELECT id FROM productos LIMIT 1")
echo "Using Product ID: $PRODUCT_ID"

echo "=== ADJUST STOCK (+10) ==="
curl -X POST http://localhost:3009/api/products/adjustment \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"producto_id\\": $PRODUCT_ID,
    \\"cantidad\\": 10,
    \\"comentario\\": \\"Test API Adjustment\\"
  }"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString())); // capture curl -v
        stream.on('close', () => conn.end());
    });
}).connect(config);
