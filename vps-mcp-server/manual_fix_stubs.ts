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

console.log(`🔧 Manual fix: loading stubs correctly on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== VERIFYING STUBS FILE SYNTAX ==="
        node -c src/api/missing-endpoints-stubs.js && echo "✅ Syntax OK" || echo "❌ SYNTAX ERROR!"
        
        echo ""
        echo "=== CHECKING WHERE TO LOAD STUBS ==="
        grep -n "app.listen" app-integrated.js | tail -1
        
        echo ""
        echo "=== ADDING STUBS LOAD BEFORE LISTEN ==="
        # Remove any previous attempts
        sed -i '/missing-endpoints-stubs/d' app-integrated.js
        
        # Add it right before app.listen
        sed -i '/^app.listen/i\\
// Missing endpoints stubs\\
try {\\
    console.log(\"Loading missing endpoints stubs...\");\\
    require(\"./src/api/missing-endpoints-stubs\")(app, db);\\
    console.log(\"✅ Missing endpoints stubs loaded\");\\
} catch (err) {\\
    console.error(\"❌ Error loading stubs:\", err.message);\\
}\\
' app-integrated.js
        
        echo "✅ Stubs require added"
        
        echo ""
        echo "=== VERIFYING IT WAS ADDED ==="
        grep -A 5 "missing-endpoints-stubs" app-integrated.js
        
        echo ""
        echo "=== RESTARTING PM2 ==="
        pm2 restart cocolu-dashoffice
        sleep 5
        
        echo ""
        echo "=== CHECKING PM2 LOGS FOR STUBS LOAD MESSAGE ==="
        pm2 logs cocolu-dashoffice --lines 20 --nostream 2>&1 | grep "stubs"
        
        echo ""
        echo "=== TESTING ENDPOINT AGAIN ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "GET /api/installments/stats:"
        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "GET /api/installments:"
        curl -s "http://127.0.0.1:3009/api/installments?status=all&page=1&limit=50" -H "Authorization: Bearer \$TOKEN"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Manual stub fix complete");
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
