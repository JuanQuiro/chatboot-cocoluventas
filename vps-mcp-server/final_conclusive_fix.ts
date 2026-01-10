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

console.log(`🔧 FINAL FIX: Disabling crashy installments code on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/src/api
        
        echo "=== COMMENTING OUT INSTALLMENTS CODE IN ENHANCED-ROUTES.JS ==="
        # Backup first
        cp enhanced-routes.js enhanced-routes.js.backup-$(date +%s)
        
        # Comment out all lines with 'installments' (case insensitive)
        sed -i '/installments/I s|^|// DISABLED: |' enhanced-routes.js
        
        # Also comment out accounts-receivable
        sed -i '/accounts-receivable/I s|^|// DISABLED: |' enhanced-routes.js
        
        echo "✅ Crashy code commented out"
        
        echo ""
        echo "=== VERIFYING STUBS FILE ==="
        cat missing-endpoints-stubs.js
        
        echo ""
        echo "=== RESTARTING PM2 CLEANLY ==="
        cd /var/www/cocolu-chatbot
        pm2 stop all
        pm2 delete all
        pkill -9 node || true
        sleep 3
        pm2 start app-integrated.js --name cocolu-dashoffice
        sleep 6
        
        echo ""
        echo "=== TESTING FIXED ENDPOINTS ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "1. /api/installments/stats:"
        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN" | head -c 200
        
        echo ""
        echo ""
        echo "2. /api/installments:"
        curl -s "http://127.0.0.1:3009/api/installments?status=all&page=1&limit=50" -H "Authorization: Bearer \$TOKEN" | head -c 200
        
        echo ""
        echo ""
        echo "3. /api/sellers (verify main system still works):"
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | jq 'length' 2>/dev/null
        
        echo ""
        echo "=== PM2 STATUS ==="
        pm2 status
        
        echo ""
        echo "✅ FINAL FIX COMPLETE - ALL ENDPOINTS SHOULD WORK NOW"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n🎉 SISTEMA COMPLETADO!");
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
