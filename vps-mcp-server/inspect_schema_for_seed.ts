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

console.log(`Checking Database Schema on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/data
        
        echo "=== ALL TABLES ==="
        sqlite3 cocolu.db ".tables"
        
        echo ""
        echo "=== USERS SCHEMA ==="
        sqlite3 cocolu.db ".schema users"
        
        echo ""
        echo "=== CLIENTS SCHEMA ==="
        sqlite3 cocolu.db ".schema clientes"
        
        echo ""
        echo "=== PRODUCTS SCHEMA ==="
        sqlite3 cocolu.db ".schema productos"
        
        echo ""
        echo "=== SELLERS SCHEMA ==="
        sqlite3 cocolu.db ".schema sellers"
        
        echo ""
        echo "=== MANUFACTURERS SCHEMA ==="
        sqlite3 cocolu.db ".schema seller_assignments" 2>/dev/null || echo "No seller_assignments table"
        
        echo ""
        echo "=== ORDERS/INGRESOS SCHEMA ==="
        sqlite3 cocolu.db ".schema ingresos_varios"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Schema inspection complete");
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
