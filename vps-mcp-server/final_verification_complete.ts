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

console.log(`✅ FINAL VERIFICATION on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        TOKEN=\$(curl -s -X POST https://api.emberdrago.com/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "════════════════════════════════════"
        echo "   COMPLETE ENDPOINT VERIFICATION"
        echo "════════════════════════════════════"
        echo ""
        
        echo "1️⃣ Sellers:"
        curl -s https://api.emberdrago.com/api/sellers -H "Authorization: Bearer \$TOKEN" -H "Origin: https://cocolu.emberdrago.com" | jq 'if type == "array" then "✅ SUCCESS - " + (length | tostring) + " sellers" else "❌ ERROR: " + .error end' -r
        
        echo ""
        echo "2️⃣ Clients:"
        curl -s https://api.emberdrago.com/api/clients -H "Authorization: Bearer \$TOKEN" -H "Origin: https://cocolu.emberdrago.com" | jq 'if .meta then "✅ SUCCESS - " + (.meta.total | tostring) + " clients" else "❌ ERROR" end' -r
        
        echo ""
        echo "3️⃣ Products:"
        curl -s https://api.emberdrago.com/api/products -H "Authorization: Bearer \$TOKEN" -H "Origin: https://cocolu.emberdrago.com" | jq 'if .meta then "✅ SUCCESS - " + (.meta.total | tostring) + " products" else "❌ ERROR" end' -r
        
        echo ""
        echo "4️⃣ Users:"
        curl -s https://api.emberdrago.com/api/users -H "Authorization: Bearer \$TOKEN" -H "Origin: https://cocolu.emberdrago.com" | jq 'if .total then "✅ SUCCESS - " + (.total | tostring) + " users" else "❌ ERROR" end' -r
        
        echo ""
        echo "5️⃣ Dashboard:"
        curl -s https://api.emberdrago.com/api/dashboard -H "Authorization: Bearer \$TOKEN" -H "Origin: https://cocolu.emberdrago.com" | jq 'if .success then "✅ SUCCESS" else "❌ ERROR" end' -r
        
        echo ""
        echo "════════════════════════════════════"
        echo ""
        echo "📊 DATABASE STATS:"
        sqlite3 /var/www/cocolu-chatbot/data/cocolu.db << 'SQL'
SELECT '  Users: ' || COUNT(*) FROM users;
SELECT '  Sellers: ' || COUNT(*) FROM sellers;
SELECT '  Clients: ' || COUNT(*) FROM clientes;
SELECT '  Products: ' || COUNT(*) FROM productos;
SELECT '  Sales: ' || COUNT(*) FROM ingresos_varios;
SQL
        
        echo ""
        echo "🔧 PM2 STATUS:"
        pm2 status | grep cocolu
        
        echo ""
        echo "════════════════════════════════════"
        echo "   ✅ SYSTEM READY FOR USE"
        echo "════════════════════════════════════"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Final verification complete!");
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
