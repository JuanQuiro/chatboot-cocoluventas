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

console.log(`Comprehensive API Audit on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== GETTING AUTH TOKEN ==="
        TOKEN=$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        echo "Token: \${TOKEN:0:40}..."
        
        echo ""
        echo "=== TESTING CORE ENDPOINTS ==="
        
        echo "1. Health Check:"
        curl -s http://127.0.0.1:3009/api/health | head -c 100
        
        echo ""
        echo ""
        echo "2. Dashboard:"
        curl -s http://127.0.0.1:3009/api/dashboard -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "3. Users:"
        curl -s http://127.0.0.1:3009/api/users -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "=== TESTING SALES ENDPOINTS ==="
        
        echo "4. Orders (Pedidos):"
        curl -s http://127.0.0.1:3009/api/orders -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "5. Clients (Clientes):"
        curl -s http://127.0.0.1:3009/api/clients -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "=== TESTING INVENTORY ENDPOINTS ==="
        
        echo "6. Products (Productos):"
        curl -s http://127.0.0.1:3009/api/products -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "7. Manufacturers (Fabricantes):"
        curl -s http://127.0.0.1:3009/api/manufacturers -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "=== TESTING SELLERS ENDPOINTS ==="
        
        echo "8. Sellers (Vendedores):"
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "=== TESTING FINANCE ENDPOINTS ==="
        
        echo "9. Finance Summary:"
        curl -s http://127.0.0.1:3009/api/finance/summary -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "10. BCV Rates (Tasas):"
        curl -s http://127.0.0.1:3009/api/bcv/latest -H "Authorization: Bearer \$TOKEN" | head -c 150
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ API audit complete");
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
