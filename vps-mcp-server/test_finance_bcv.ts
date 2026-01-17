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

console.log(`Testing Finance & BCV Endpoints on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        TOKEN=$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        
        echo "=== FINANCE ENDPOINTS ==="
        echo "1. Income:"
        curl -s http://127.0.0.1:3009/api/finance/income -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "2. Expenses:"
        curl -s http://127.0.0.1:3009/api/finance/expenses -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "3. Income Summary:"
        curl -s http://127.0.0.1:3009/api/finance/income/summary -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "=== BCV ENDPOINTS ==="
        echo "4. BCV Rate:"
        curl -s http://127.0.0.1:3009/api/bcv/rate | head -c 150
        
        echo ""
        echo ""
        echo "5. BCV History:"
        curl -s http://127.0.0.1:3009/api/bcv/history | head -c 150
        
        echo ""
        echo ""
        echo "=== ADDITIONAL ENDPOINTS ==="
        echo "6. Commissions:"
        curl -s http://127.0.0.1:3009/api/finance/manufacturers -H "Authorization: Bearer \$TOKEN" | head -c 150
        
        echo ""
        echo ""
        echo "7. Analytics:"
        curl -s http://127.0.0.1:3009/api/analytics/metrics | head -c 150
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Finance & BCV test complete");
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
