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

console.log("🕵️ TESTING PRODUCT ROUTES...");

const conn = new Client();
conn.on("ready", () => {
    // 1. Create Product
    // 2. List Products
    const cmd = `
echo "=== 1. CREATE PRODUCT ==="
curl -X POST http://localhost:3009/api/products \\
  -H "Content-Type: application/json" \\
  -d '{"nombre": "Manzana Test", "precio_usd": 122, "stock_actual": 122, "sku": "TEST-SKU-001"}'

echo ""
echo "=== 2. LIST PRODUCTS ==="
curl -s "http://localhost:3009/api/products?limit=5"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
