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

console.log(`🔍 CURRENT STATE CHECK on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== PM2 STATUS ==="
        pm2 status
        
        echo ""
        echo "=== GETTING TOKEN ==="
        TOKEN=\$(curl -s -X POST https://api.emberdrago.com/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        echo "Token: \${TOKEN:0:40}..."
        
        echo ""
        echo "=== TESTING SELLERS ENDPOINT (FULL RESPONSE) ==="
        curl -vs https://api.emberdrago.com/api/sellers -H "Authorization: Bearer \$TOKEN" -H "Origin: https://cocolu.emberdrago.com" 2>&1 | head -100
        
        echo ""
        echo ""
        echo "=== PM2 LOGS (LAST 30 LINES) ==="
        pm2 logs cocolu-dashoffice --lines 30 --nostream
        
        echo ""
        echo "=== CHECKING IF SELLERS-FIXED FILE IS LOADED ==="
        ps aux | grep "app-integrated.js" | grep -v grep
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Current state check complete");
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
