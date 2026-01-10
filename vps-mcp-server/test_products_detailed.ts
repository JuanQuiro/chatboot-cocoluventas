import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

console.log(`Testing Products Endpoint in Detail on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        TOKEN=$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        
        echo "=== FULL PRODUCTS API RESPONSE ==="
        curl -s http://127.0.0.1:3009/api/products -H "Authorization: Bearer \$TOKEN" | jq . 2>/dev/null || curl -s http://127.0.0.1:3009/api/products -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "=== DATABASE VERIFICATION ==="
        cd /var/www/cocolu-chatbot/data
        sqlite3 cocolu.db "SELECT COUNT(*) as total FROM productos;"
        
        echo ""
        echo "=== SAMPLE PRODUCTS FROM DB ==="
        sqlite3 cocolu.db "SELECT id, sku, nombre, precio_usd, stock_actual FROM productos LIMIT 3;"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Products endpoint analysis complete");
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.error("STDERR:", data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
