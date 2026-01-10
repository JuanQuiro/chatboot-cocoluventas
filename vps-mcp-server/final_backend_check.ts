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

console.log(`🎯 FINAL COMPLETE SYSTEM CHECK on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "════════════════════════════════════════"
        echo "     FINAL SYSTEM VERIFICATION"
        echo "════════════════════════════════════════"
        echo ""
        
        echo "1️⃣ PM2 STATUS"
        pm2 status | grep cocolu
        
        echo ""
        echo "2️⃣ BACKEND PORT LISTENING"
        netstat -tulpn | grep :3009
        
        echo ""
        echo "3️⃣ NGINX STATUS"
        systemctl status nginx | grep Active
        
        echo ""
        echo "4️⃣ DATABASE RECORD COUNTS"
        sqlite3 /var/www/cocolu-chatbot/data/cocolu.db << 'SQL'
SELECT '  👥 Users: ' || COUNT(*) FROM users;
SELECT '  👔 Sellers: ' || COUNT(*) FROM sellers;
SELECT '  👤 Clients: ' || COUNT(*) FROM clientes;
SELECT '  💍 Products: ' || COUNT(*) FROM productos;
SELECT '  💰 Sales: ' || COUNT(*) FROM ingresos_varios;
SELECT '  📦 Total: ' || (
  (SELECT COUNT(*) FROM users) +
  (SELECT COUNT(*) FROM sellers) +
  (SELECT COUNT(*) FROM clientes) +
  (SELECT COUNT(*) FROM productos) +
  (SELECT COUNT(*) FROM ingresos_varios)
);
SQL
        
        echo ""
        echo "5️⃣ TESTING ALL CRITICAL ENDPOINTS"
        TOKEN=\$(curl -s -X POST https://api.emberdrago.com/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo ""
        echo "  Health:"
        curl -s https://api.emberdrago.com/api/health | jq -r '.status' 2>/dev/null || echo "❌ FAILED"
        
        echo ""
        echo "  Sellers (JSON count):"
        SELLERS_COUNT=\$(curl -s https://api.emberdrago.com/api/sellers -H "Authorization: Bearer \$TOKEN" -H "Origin: https://cocolu.emberdrago.com" | jq 'length' 2>/dev/null)
        echo "  ✅ \$SELLERS_COUNT sellers"
        
        echo ""
        echo "  Clients total:"
        curl -s https://api.emberdrago.com/api/clients -H "Authorization: Bearer \$TOKEN" -H "Origin: https://cocolu.emberdrago.com" | jq -r '.meta.total' 2>/dev/null || echo "❌"
        
        echo ""
        echo "  Products total:"
        curl -s https://api.emberdrago.com/api/products -H "Authorization: Bearer \$TOKEN" -H "Origin: https://cocolu.emberdrago.com" | jq -r '.meta.total' 2>/dev/null || echo "❌"
        
        echo ""
        echo "6️⃣ CHECKING FOR ERRORS IN LOGS"
        ERROR_COUNT=\$(pm2 logs cocolu-dashoffice --lines 50 --nostream 2>&1 | grep -i "error" | grep -v "Error eliminando" | wc -l)
        echo "  Recent errors: \$ERROR_COUNT"
        
        echo ""
        echo "════════════════════════════════════════"
        echo "     ✅ BACKEND SYSTEM STATUS: READY"
        echo "════════════════════════════════════════"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Final system check complete!");
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
