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

console.log(`Checking what data is actually visible on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/data
        
        echo "=== ALL TABLES IN DATABASE ==="
        sqlite3 cocolu.db ".tables"
        
        echo ""
        echo "=== TABLES WITH DATA ==="
        sqlite3 cocolu.db << 'SQL'
SELECT 'users: ' || COUNT(*) FROM users;
SELECT 'sellers: ' || COUNT(*) FROM sellers;
SELECT 'clientes: ' || COUNT(*) FROM clientes;
SELECT 'productos: ' || COUNT(*) FROM productos;
SELECT 'ingresos_varios: ' || COUNT(*) FROM ingresos_varios;
SELECT 'abonos: ' || COUNT(*) FROM abonos;
SELECT 'pedidos: ' || COUNT(*) FROM pedidos;
SELECT 'movimientos_inventario: ' || COUNT(*) FROM movimientos_inventario;
SQL
        
        echo ""
        echo "=== TESTING FRONTEND ENDPOINTS ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        
        echo "1. /api/clients (first 2):"
        curl -s "http://127.0.0.1:3009/api/clients?limit=2" -H "Authorization: Bearer \$TOKEN" | head -c 300
        
        echo ""
        echo ""
        echo "2. /api/products (first 2):"
        curl -s "http://127.0.0.1:3009/api/products?limit=2" -H "Authorization: Bearer \$TOKEN" | head -c 300
        
        echo ""
        echo ""
        echo "3. /api/sellers:"
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | head -c 300
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Data check complete");
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
