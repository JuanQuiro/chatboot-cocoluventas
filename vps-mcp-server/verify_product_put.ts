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

console.log("🕵️ TESTING PRODUCT UPDATE...");

const conn = new Client();
conn.on("ready", () => {
    // 1. Get Product ID
    // 2. Update Name
    const cmd = `
PRODUCT_ID=$(sqlite3 /var/www/cocolu-chatbot/data/cocolu.db "SELECT id FROM productos LIMIT 1")
echo "Using Product ID: $PRODUCT_ID"

echo "=== UPDATE PRODUCT NAME ==="
curl -X PUT http://localhost:3009/api/products/$PRODUCT_ID \\
  -H "Content-Type: application/json" \\
  -d '{"nombre": "Manzana Actualizada"}'
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString())); // capture curl -v
        stream.on('close', () => conn.end());
    });
}).connect(config);
