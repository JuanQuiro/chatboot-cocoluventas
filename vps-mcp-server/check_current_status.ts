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

console.log(`📊 Verificando estado actual del sistema...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== PM2 STATUS ==="
        pm2 list
        
        echo ""
        echo "=== TESTING ALL ENDPOINTS ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "1. Health:"
        curl -s http://127.0.0.1:3009/api/health
        
        echo ""
        echo ""
        echo "2. Sellers (should work):"
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | jq 'length' 2>/dev/null || echo "FAILED"
        
        echo ""
        echo "3. Installments stats:"
        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN" 2>&1 || echo "FAILED"
        
        echo ""
        echo ""
        echo "4. Accounts stats:"
        curl -s http://127.0.0.1:3009/api/accounts-receivable/stats -H "Authorization: Bearer \$TOKEN" 2>&1 || echo "FAILED"
        
        echo ""
        echo ""
        echo "=== CHECKING ROUTES IN APP FILE ==="
        grep -c "installments" app-integrated.js
        
        echo ""
        echo "=== LAST PM2 LOGS ==="
        pm2 logs cocolu-dashoffice --lines 30 --nostream 2>&1 | tail -30
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Estado verificado");
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
