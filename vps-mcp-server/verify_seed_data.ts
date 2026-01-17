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

console.log(`Verifying Seed Data on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/data
        
        echo "=== DATABASE STATISTICS ==="
        sqlite3 cocolu.db "
        SELECT 
          (SELECT COUNT(*) FROM users) as users,
          (SELECT COUNT(*) FROM sellers) as sellers,
          (SELECT COUNT(*) FROM clientes) as clients,
          (SELECT COUNT(*) FROM productos) as products,
          (SELECT COUNT(*) FROM ingresos_varios) as sales,
          (SELECT COUNT(*) FROM abonos) as payments,
          (SELECT COUNT(*) FROM seller_assignments) as assignments;
        "
        
        echo ""
        echo "=== SAMPLE USERS ==="
        sqlite3 cocolu.db "SELECT email, name, role, active FROM users LIMIT 5;"
        
        echo ""
        echo "=== SAMPLE CLIENTS ==="
        sqlite3 cocolu.db "SELECT nombre, telefono FROM clientes LIMIT 5;"
        
        echo ""
        echo "=== SAMPLE PRODUCTS ==="
        sqlite3 cocolu.db "SELECT codigo, nombre, precio, stock FROM productos LIMIT 5;"
        
        echo ""
        echo "=== PRODUCTS OUT OF STOCK ==="
        sqlite3 cocolu.db "SELECT COUNT(*) FROM productos WHERE stock = 0;"
        
        echo ""
        echo "=== TOTAL SALES VALUE ==="
        sqlite3 cocolu.db "SELECT SUM(monto) as total_sales FROM ingresos_varios;"
        
        echo ""
        echo "=== API TEST ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        
        echo "Testing /api/users:"
        curl -s http://127.0.0.1:3009/api/users -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "Testing /api/clients:"
        curl -s http://127.0.0.1:3009/api/clients -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "Testing /api/products:"
        curl -s http://127.0.0.1:3009/api/products -H "Authorization: Bearer \$TOKEN" | head -c 150
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Verification complete");
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
