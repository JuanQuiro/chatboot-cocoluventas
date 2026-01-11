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

console.log("🕵️ TESTING SALES CREATION...");

const conn = new Client();
conn.on("ready", () => {
    // 1. Get a product ID
    // 2. Create Sale
    const cmd = `
PRODUCT_ID=$(sqlite3 /var/www/cocolu-chatbot/data/cocolu.db "SELECT id FROM productos LIMIT 1")
echo "Using Product ID: $PRODUCT_ID"

echo "=== CREATE SALE ==="
curl -X POST http://localhost:3009/api/sales \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"client_id\\": 1,
    \\"products\\": [{ \\"id\\": $PRODUCT_ID, \\"cantidad\\": 1, \\"precio_usd\\": 10 }],
    \\"payment_method\\": \\"efectivo\\",
    \\"total\\": 10
  }"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
