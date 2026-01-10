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

console.log(`🎯 FINAL VERIFICATION - All endpoints...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "════════════════════════════════════════"
        echo "    FINAL SYSTEM VERIFICATION"
        echo "════════════════════════════════════════"
        echo ""
        
        echo "📊 PM2 STATUS:"
        pm2 status | grep cocolu
        
        echo ""
        echo "📋 DATABASE TABLES:"
        sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".tables"
        
        echo ""
        echo "🧪 TESTING ALL CRITICAL ENDPOINTS:"
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo ""
        echo "1. Health:"
        curl -s http://127.0.0.1:3009/api/health
        
        echo ""
        echo ""
        echo "2. Sellers (count):"
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | jq 'length'
        
        echo ""
        echo "3. Clients (total):"
        curl -s http://127.0.0.1:3009/api/clients -H "Authorization: Bearer \$TOKEN" | jq '.meta.total'
        
        echo ""
        echo "4. Products (total):"
        curl -s http://127.0.0.1:3009/api/products -H "Authorization: Bearer \$TOKEN" | jq '.meta.total'
        
        echo ""
        echo "5. Installments (should return empty):"
        curl -s "http://127.0.0.1:3009/api/installments?page=1&limit=10" -H "Authorization: Bearer \$TOKEN" | jq '.data | length'
        
        echo ""
        echo "6. Installments Stats:"
        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "7. Accounts Receivable (should return empty):"
        curl -s http://127.0.0.1:3009/api/accounts-receivable -H "Authorization: Bearer \$TOKEN" | jq '.data | length'
        
        echo ""
        echo "8. Accounts Receivable Stats:"
        curl -s http://127.0.0.1:3009/api/accounts-receivable/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "════════════════════════════════════════"
        echo "    ✅ VERIFICATION COMPLETE"
        echo "════════════════════════════════════════"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n🎉 FINAL VERIFICATION COMPLETE!");
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
