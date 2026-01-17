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

console.log(`🔧 COMPLETE BACKEND RESET on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== STOPPING ALL PROCESSES ==="
        pm2 stop all
        pm2 delete all
        
        echo ""
        echo "=== KILLING ANY REMAINING NODE PROCESSES ==="
        pkill -9 node || true
        sleep 2
        
        echo ""
        echo "=== CHECKING DATABASE ==="
        sqlite3 data/cocolu.db "SELECT COUNT(*) FROM sellers;"
        
        echo ""
        echo "=== STARTING FRESH ==="
        pm2 start app-integrated.js --name cocolu-dashoffice --update-env
        sleep 5
        
        echo ""
        echo "=== TESTING INTERNAL ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        echo "Token: \${TOKEN:0:40}..."
        
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | jq '. | if type == "array" then {count: length, first: .[0].name} else {total: .total} end' 2>/dev/null || echo "FAILED"
        
        echo ""
        echo ""
        echo "=== TESTING EXTERNAL (through Nginx) ==="
        curl -s https://api.emberdrago.com/api/sellers -H "Authorization: Bearer \$TOKEN" -H "Origin: https://cocolu.emberdrago.com" | head -c 200
        
        echo ""
        echo ""
        echo "=== PM2 STATUS ==="
        pm2 status
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Complete reset finished");
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
